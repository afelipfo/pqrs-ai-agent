import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { pqrsData } = await request.json()

    if (!Array.isArray(pqrsData) || pqrsData.length === 0) {
      return NextResponse.json({ error: "Invalid or empty PQRS data" }, { status: 400 })
    }

    // Get zones for mapping
    const { data: zones } = await supabase.from("zones").select("*")

    // Process and validate PQRS data
    const processedData = pqrsData
      .filter((item) => item.title && item.description)
      .map((item) => ({
        request_number:
          item.request_number ||
          `PQRS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        type: item.type || "peticion",
        category: item.category || "infrastructure",
        title: item.title,
        description: item.description,
        priority: item.priority || "medium",
        zone_id: zones?.find((z) => z.name === item.zone || z.code === item.zone_code)?.id || zones?.[0]?.id,
        citizen_info: {
          name: item.citizen_name || "Ciudadano Anónimo",
          email: item.citizen_email || "",
          phone: item.citizen_phone || "",
        },
        location: item.location ? JSON.parse(item.location) : null,
      }))

    const { data, error } = await supabase.from("pqrs_requests").insert(processedData).select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to import PQRS data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: data.length,
      message: `Successfully imported ${data.length} PQRS records`,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Failed to process import request" }, { status: 500 })
  }
}
