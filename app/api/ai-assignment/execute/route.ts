import { type NextRequest, NextResponse } from "next/server"
import { aiAssignmentEngine } from "@/lib/ai-assignment-engine"

export async function POST(request: NextRequest) {
  try {
    const { pqrsId, personnelIds, vehicleIds, aiDecision } = await request.json()

    if (!pqrsId || !personnelIds || !vehicleIds || !aiDecision) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const assignmentId = await aiAssignmentEngine.executeAssignment(pqrsId, personnelIds, vehicleIds, aiDecision)

    return NextResponse.json({
      success: true,
      assignmentId,
      message: "Assignment executed successfully",
    })
  } catch (error) {
    console.error("Assignment Execution API Error:", error)
    return NextResponse.json({ error: "Failed to execute assignment" }, { status: 500 })
  }
}
