import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get("includeStats") === "true"

    const query = supabase.from("zones").select("*").order("name")

    const { data: zones, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response: any = { zones }

    if (includeStats) {
      // Get additional statistics
      const { data: vehicleStats } = await supabase
        .from("vehicles")
        .select("current_zone_id, status")
        .not("current_zone_id", "is", null)

      const { data: personnelStats } = await supabase
        .from("personnel")
        .select("current_zone_id, status")
        .not("current_zone_id", "is", null)

      const { data: pqrsStats } = await supabase.from("pqrs_requests").select("zone_id, status, priority")

      response.stats = {
        vehicles: vehicleStats || [],
        personnel: personnelStats || [],
        pqrs: pqrsStats || [],
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Zones API Error:", error)
    return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: zone, error } = await supabase.from("zones").insert([body]).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ zone }, { status: 201 })
  } catch (error) {
    console.error("Zone Creation Error:", error)
    return NextResponse.json({ error: "Failed to create zone" }, { status: 500 })
  }
}
