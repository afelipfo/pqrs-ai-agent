import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { AssignmentDashboard } from "@/components/assignment-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard data
  const [
    { data: pendingPQRS },
    { data: activeAssignments },
    { data: availablePersonnel },
    { data: availableVehicles },
    { data: zones },
    { data: recentAssignments },
  ] = await Promise.all([
    supabase
      .from("pqrs_requests")
      .select(`
        *,
        zones (name, code, priority_level)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

    supabase
      .from("assignments")
      .select(`
        *,
        pqrs_requests (
          request_number,
          title,
          category,
          priority,
          zones (name)
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
      .eq("status", "active")
      .order("assigned_at", { ascending: false }),

    supabase
      .from("personnel")
      .select(`
        *,
        personnel_roles (name, department),
        zones (name)
      `)
      .eq("status", "available"),

    supabase
      .from("vehicles")
      .select(`
        *,
        vehicle_types (name, category),
        zones (name)
      `)
      .eq("status", "available"),

    supabase.from("zones").select("*").order("name"),

    supabase
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
          last_name
        ),
        vehicles (
          license_plate
        )
      `)
      .order("assigned_at", { ascending: false })
      .limit(10),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Asignaciones Inteligentes</h1>
        <p className="text-gray-600">Dashboard en tiempo real del sistema de asignación de recursos para Medellín</p>
      </div>

      <AssignmentDashboard
        pendingPQRS={pendingPQRS || []}
        activeAssignments={activeAssignments || []}
        availablePersonnel={availablePersonnel || []}
        availableVehicles={availableVehicles || []}
        zones={zones || []}
        recentAssignments={recentAssignments || []}
      />
    </div>
  )
}
