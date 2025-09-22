"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VehicleManagement } from "@/components/vehicle-management"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/registro-temporal.json')
        const tempData = await response.json()

        // Mock vehicle types data
        const mockVehicleTypes = [
          { id: "1", name: "Camioneta", category: "Transporte" },
          { id: "2", name: "Moto", category: "Movilidad" },
          { id: "3", name: "Camión", category: "Carga" },
        ]

        // Map temporary zones data
        const mappedZones = tempData.zones.map((zone: any) => ({
          id: zone.id.toString(),
          name: zone.name,
          code: zone.district,
        }))

        // Map temporary vehicles data to match component expectations
        const mappedVehicles = tempData.vehicles.map((vehicle: any, index: number) => {
          const statusMap: { [key: string]: string } = {
            "En Servicio": "assigned",
            "Disponible": "available",
            "En Mantenimiento": "maintenance"
          }

          return {
            id: vehicle.id.toString(),
            license_plate: vehicle.plate,
            vehicle_type_id: mockVehicleTypes.find(vt => vt.name === vehicle.type)?.id || "1",
            status: statusMap[vehicle.status] || "available",
            current_zone_id: mappedZones.find((z: any) => z.name === vehicle.zone)?.id,
            last_location: null,
            fuel_level: vehicle.status === "En Mantenimiento" ? 0 : Math.floor(Math.random() * 100) + 1,
            maintenance_due: vehicle.status === "En Mantenimiento" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
            latitude: vehicle.coordinates.lat,
            longitude: vehicle.coordinates.lng,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            vehicle_types: mockVehicleTypes.find(vt => vt.name === vehicle.type) || mockVehicleTypes[0],
            zones: mappedZones.find((z: any) => z.name === vehicle.zone),
          }
        })

        setVehicles(mappedVehicles)
        setVehicleTypes(mockVehicleTypes)
        setZones(mappedZones)
      } catch (error) {
        console.error("Error loading vehicles data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando datos...</div>
        </div>
      </div>
    )
  }

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
        initialVehicles={vehicles}
        vehicleTypes={vehicleTypes}
        zones={zones}
      />
    </div>
  )
}