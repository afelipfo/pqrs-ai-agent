"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PersonnelManagement } from "@/components/personnel-management"

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/registro-temporal.json')
        const tempData = await response.json()

        // Mock roles data
        const mockRoles = [
          { id: "1", name: "Inspector de Seguridad", department: "Seguridad" },
          { id: "2", name: "Técnica de Mantenimiento", department: "Mantenimiento" },
          { id: "3", name: "Supervisor", department: "Administración" },
        ]

        // Map temporary zones data
        const mappedZones = tempData.zones.map((zone: any) => ({
          id: zone.id.toString(),
          name: zone.name,
          code: zone.district,
        }))

        // Map temporary personnel data to match component expectations
        const mappedPersonnel = tempData.personnel.map((person: any, index: number) => {
          const nameParts = person.name.split(" ")
          const firstName = nameParts[0]
          const lastName = nameParts.slice(1).join(" ")

          return {
            id: person.id.toString(),
            employee_id: `EMP${String(person.id).padStart(3, "0")}`,
            first_name: firstName,
            last_name: lastName,
            role_id: mockRoles.find(r => r.name === person.role)?.id || "1",
            status: person.status === "Activo" ? "available" : "off_duty",
            current_zone_id: mappedZones.find((z: any) => z.name === person.zone)?.id,
            shift_start: "08:00",
            shift_end: "17:00",
            certifications: null,
            contact_info: { phone: person.phone },
            latitude: person.coordinates.lat,
            longitude: person.coordinates.lng,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            personnel_roles: mockRoles.find(r => r.name === person.role) || mockRoles[0],
            zones: mappedZones.find((z: any) => z.name === person.zone),
          }
        })

        setPersonnel(mappedPersonnel)
        setRoles(mockRoles)
        setZones(mappedZones)
      } catch (error) {
        console.error("Error loading personnel data:", error)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Personal - Medellín</h1>
        <p className="text-gray-600">Administra el personal disponible para asignaciones y operaciones</p>
      </div>

      <PersonnelManagement
        initialPersonnel={personnel}
        roles={roles}
        zones={zones}
      />
    </div>
  )
}