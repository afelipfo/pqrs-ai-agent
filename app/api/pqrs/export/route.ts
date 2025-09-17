import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"

    const { data: pqrsData, error } = await supabase
      .from("pqrs_requests")
      .select(`
        *,
        zones (name, code),
        personnel (first_name, last_name),
        vehicles (license_plate)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const exportData = pqrsData.map((pqrs) => ({
      request_number: pqrs.request_number,
      type: pqrs.type,
      category: pqrs.category,
      title: pqrs.title,
      description: pqrs.description,
      priority: pqrs.priority,
      status: pqrs.status,
      zone: pqrs.zones?.name || "",
      zone_code: pqrs.zones?.code || "",
      assigned_personnel: pqrs.personnel ? `${pqrs.personnel.first_name} ${pqrs.personnel.last_name}` : "",
      assigned_vehicle: pqrs.vehicles?.license_plate || "",
      citizen_info: JSON.stringify(pqrs.citizen_info || {}),
      location: JSON.stringify(pqrs.location || {}),
      created_at: pqrs.created_at,
      updated_at: pqrs.updated_at,
      resolved_at: pqrs.resolved_at || "",
    }))

    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: exportData,
        count: exportData.length,
      })
    }

    // CSV format
    const headers = Object.keys(exportData[0] || {})
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row]
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="pqrs-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export PQRS data" }, { status: 500 })
  }
}
