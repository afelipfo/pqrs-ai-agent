import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { VehicleManagement } from "@/components/vehicle-management"

export default async function VehiclesPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase.from("vehicles").select(`
    *,
    vehicle_types (name, category),
    zones (name)
  `).order("license_plate")

  const { data: vehicleTypes } = await supabase.from("vehicle_types").select("*").order("name")

  const { data: zones } = await supabase.from("zones").select("*").order("name")

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Vehículos - Medellín</h1>
        <p className="text-gray-600">Administra la flota vehicular para asignaciones y operaciones</p>
      </div>

      <VehicleManagement
        initialVehicles={vehicles || []}
        vehicleTypes={vehicleTypes || []}
        zones={zones || []}
      />
    </div>
  )
}