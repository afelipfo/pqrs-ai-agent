import { openai } from "@ai-sdk/openai"
import { generateObject, tool } from "ai"
import { z } from "zod"
import { createClient } from "./supabase/server"

// Schema for AI assignment decision
const assignmentDecisionSchema = z.object({
  recommendedPersonnel: z.array(
    z.object({
      personnelId: z.string(),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
      estimatedResponseTime: z.number(), // in minutes
    }),
  ),
  recommendedVehicles: z.array(
    z.object({
      vehicleId: z.string(),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
      suitabilityScore: z.number().min(0).max(10),
    }),
  ),
  priorityAdjustment: z.object({
    originalPriority: z.string(),
    recommendedPriority: z.string(),
    reasoning: z.string(),
  }),
  estimatedResolutionTime: z.number(), // in hours
  additionalRecommendations: z.array(z.string()),
})

export type AssignmentDecision = z.infer<typeof assignmentDecisionSchema>

// Tool for getting available resources
const getAvailableResourcesTool = tool({
  description: "Get available personnel and vehicles in a specific zone or nearby zones",
  inputSchema: z.object({
    zoneId: z.string(),
    includeNearbyZones: z.boolean().default(true),
  }),
  execute: async ({ zoneId, includeNearbyZones }) => {
    const supabase = await createClient()

    // Get available personnel
    const { data: personnel } = await supabase
      .from("personnel")
      .select(`
        id,
        employee_id,
        first_name,
        last_name,
        status,
        current_zone_id,
        personnel_roles (
          name,
          department,
          required_certifications
        ),
        certifications,
        shift_start,
        shift_end
      `)
      .eq("status", "available")

    // Get available vehicles
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select(`
        id,
        license_plate,
        status,
        current_zone_id,
        fuel_level,
        vehicle_types (
          name,
          category,
          capacity,
          equipment
        ),
        last_location
      `)
      .eq("status", "available")

    // Get zone information
    const { data: zones } = await supabase.from("zones").select("*")

    return {
      personnel: personnel || [],
      vehicles: vehicles || [],
      zones: zones || [],
      targetZoneId: zoneId,
    }
  },
})

// Tool for analyzing PQRS request context
const analyzePQRSContextTool = tool({
  description: "Analyze PQRS request to understand requirements and urgency",
  inputSchema: z.object({
    pqrsId: z.string(),
  }),
  execute: async ({ pqrsId }) => {
    const supabase = await createClient()

    const { data: pqrs } = await supabase
      .from("pqrs_requests")
      .select(`
        *,
        zones (
          name,
          code,
          priority_level,
          population,
          area_km2
        )
      `)
      .eq("id", pqrsId)
      .single()

    // Get similar historical cases for context
    const { data: similarCases } = await supabase
      .from("pqrs_requests")
      .select(`
        id,
        category,
        priority,
        status,
        estimated_resolution_time,
        actual_resolution_time,
        assignments (
          personnel_id,
          vehicle_id,
          ai_confidence_score
        )
      `)
      .eq("category", pqrs?.category)
      .eq("status", "resolved")
      .limit(5)

    return {
      currentRequest: pqrs,
      historicalContext: similarCases || [],
      zoneContext: pqrs?.zones,
    }
  },
})

export class AIAssignmentEngine {
  private model = openai("gpt-4")

  async generateAssignment(pqrsId: string): Promise<AssignmentDecision> {
    try {
      const { object: decision } = await generateObject({
        model: this.model,
        schema: assignmentDecisionSchema,
        messages: [
          {
            role: "system",
            content: `You are an AI assignment engine for the city of Medellín, Colombia. 
            Your job is to analyze PQRS (Peticiones, Quejas, Reclamos y Sugerencias) requests 
            and recommend optimal assignment of personnel and vehicles based on:

            1. Request urgency and category
            2. Geographic proximity and zone characteristics
            3. Personnel skills and availability
            4. Vehicle capabilities and fuel levels
            5. Historical performance data
            6. Current workload distribution

            Consider Colombian municipal service context and Medellín's specific urban challenges.
            Prioritize public safety, efficiency, and citizen satisfaction.
            
            Always provide confidence scores and detailed reasoning for your recommendations.`,
          },
          {
            role: "user",
            content: `Please analyze PQRS request ${pqrsId} and provide assignment recommendations.`,
          },
        ],
        tools: {
          getAvailableResources: getAvailableResourcesTool,
          analyzePQRSContext: analyzePQRSContextTool,
        },
        maxSteps: 5,
      })

      return decision
    } catch (error) {
      console.error("AI Assignment Engine Error:", error)
      throw new Error("Failed to generate assignment recommendation")
    }
  }

  async executeAssignment(
    pqrsId: string,
    personnelIds: string[],
    vehicleIds: string[],
    aiDecision: AssignmentDecision,
  ): Promise<string> {
    const supabase = await createClient()

    try {
      // Create assignment record
      const { data: assignment, error: assignmentError } = await supabase
        .from("assignments")
        .insert({
          pqrs_request_id: pqrsId,
          personnel_id: personnelIds[0], // Primary assignee
          vehicle_id: vehicleIds[0], // Primary vehicle
          assignment_reason: `AI-generated assignment based on: ${aiDecision.recommendedPersonnel[0]?.reasoning}`,
          ai_confidence_score: aiDecision.recommendedPersonnel[0]?.confidence || 0.5,
          assignment_factors: {
            personnelRecommendations: aiDecision.recommendedPersonnel,
            vehicleRecommendations: aiDecision.recommendedVehicles,
            priorityAdjustment: aiDecision.priorityAdjustment,
            estimatedResolutionTime: aiDecision.estimatedResolutionTime,
          },
        })
        .select()
        .single()

      if (assignmentError) throw assignmentError

      // Update PQRS status
      await supabase
        .from("pqrs_requests")
        .update({
          status: "in_progress",
          assigned_personnel_id: personnelIds[0],
          assigned_vehicle_id: vehicleIds[0],
          estimated_resolution_time: `${aiDecision.estimatedResolutionTime} hours`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pqrsId)

      // Update personnel status
      await supabase.from("personnel").update({ status: "assigned" }).in("id", personnelIds)

      // Update vehicle status
      await supabase.from("vehicles").update({ status: "assigned" }).in("id", vehicleIds)

      return assignment.id
    } catch (error) {
      console.error("Assignment Execution Error:", error)
      throw new Error("Failed to execute assignment")
    }
  }

  async getAssignmentHistory(limit = 10) {
    const supabase = await createClient()

    const { data: assignments } = await supabase
      .from("assignments")
      .select(`
        *,
        pqrs_requests (
          request_number,
          title,
          category,
          priority
        ),
        personnel (
          first_name,
          last_name,
          personnel_roles (name)
        ),
        vehicles (
          license_plate,
          vehicle_types (name)
        )
      `)
      .order("assigned_at", { ascending: false })
      .limit(limit)

    return assignments || []
  }
}

// Singleton instance
export const aiAssignmentEngine = new AIAssignmentEngine()
