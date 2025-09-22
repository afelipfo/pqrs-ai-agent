"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"

// Dynamically import the entire map component to avoid SSR issues
const MapComponent = dynamic(() => import('./map-component'), { ssr: false })

interface MapData {
  zones: any[]
  personnel: any[]
  vehicles: any[]
  pqrs: any[]
}

export function GeographicalMap() {
  const { data } = useApp()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Transform global data for map display
  const mapData: MapData = {
    zones: data.zones.map((zone: any) => ({
      id: zone.id,
      name: zone.name,
      latitude: zone.latitude,
      longitude: zone.longitude,
      priority_level: zone.priority_level,
    })),
    personnel: data.personnel.map((person: any) => ({
      id: person.id,
      first_name: person.first_name,
      last_name: person.last_name,
      latitude: person.latitude || 6.2442, // Default to Medellín center if no coords
      longitude: person.longitude || -75.5812,
      personnel_roles: person.personnel_roles,
      status: person.status,
    })),
    vehicles: data.vehicles
      .filter(vehicle => vehicle.latitude && vehicle.longitude)
      .map((vehicle: any) => ({
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        vehicle_types: vehicle.vehicle_types,
        status: vehicle.status,
      })),
    pqrs: data.pqrs
      .filter(pqrs => pqrs.zones?.latitude && pqrs.zones?.longitude)
      .map((pqrs: any) => ({
        id: pqrs.id,
        title: pqrs.title,
        latitude: pqrs.zones.latitude,
        longitude: pqrs.zones.longitude,
        priority: pqrs.priority,
        type: pqrs.type,
        status: pqrs.status,
      }))
  }


  // The map will automatically update when global data changes
  // No need for manual location updates since we use global context

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <div>
                <div className="text-2xl font-bold text-blue-600">{mapData.zones.length}</div>
                <div className="text-sm text-muted-foreground">Zonas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div>
                <div className="text-2xl font-bold text-orange-600">{mapData.personnel.length}</div>
                <div className="text-sm text-muted-foreground">Personal</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚗</span>
              <div>
                <div className="text-2xl font-bold text-blue-600">{mapData.vehicles.length}</div>
                <div className="text-sm text-muted-foreground">Vehículos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <div>
                <div className="text-2xl font-bold text-orange-600">{mapData.pqrs.length}</div>
                <div className="text-sm text-muted-foreground">PQRS</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            Mapa Geográfico - Medellín
          </CardTitle>
          <CardDescription>
            Visualización completa de zonas, personal, vehículos y PQRS en el mapa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden border">
            <MapComponent key={JSON.stringify(mapData)} mapData={mapData} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}