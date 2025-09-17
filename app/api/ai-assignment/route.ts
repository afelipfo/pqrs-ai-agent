import { type NextRequest, NextResponse } from "next/server"
import { aiAssignmentEngine } from "@/lib/ai-assignment-engine"

export async function POST(request: NextRequest) {
  try {
    const { pqrsId, autoExecute = false } = await request.json()

    if (!pqrsId) {
      return NextResponse.json({ error: "PQRS ID is required" }, { status: 400 })
    }

    // Generate AI assignment recommendation
    const decision = await aiAssignmentEngine.generateAssignment(pqrsId)

    // Optionally execute the assignment automatically
    let assignmentId = null
    if (autoExecute && decision.recommendedPersonnel.length > 0 && decision.recommendedVehicles.length > 0) {
      const personnelIds = decision.recommendedPersonnel.map((p) => p.personnelId)
      const vehicleIds = decision.recommendedVehicles.map((v) => v.vehicleId)

      assignmentId = await aiAssignmentEngine.executeAssignment(pqrsId, personnelIds, vehicleIds, decision)
    }

    return NextResponse.json({
      success: true,
      decision,
      assignmentId,
      message: autoExecute
        ? "Assignment generated and executed successfully"
        : "Assignment recommendation generated successfully",
    })
  } catch (error) {
    console.error("AI Assignment API Error:", error)
    return NextResponse.json({ error: "Failed to process assignment request" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const history = await aiAssignmentEngine.getAssignmentHistory(limit)

    return NextResponse.json({
      success: true,
      assignments: history,
    })
  } catch (error) {
    console.error("Assignment History API Error:", error)
    return NextResponse.json({ error: "Failed to fetch assignment history" }, { status: 500 })
  }
}
