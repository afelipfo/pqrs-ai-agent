"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

// Dynamically import the entire map component to avoid SSR issues
const MapComponent = dynamic(() => import('./map-component'), { ssr: false })

interface MapData {
  zones: any[]
  personnel: any[]
  vehicles: any[]
  pqrs: any[]
}

export function GeographicalMap() {
  const [mapData, setMapData] = useState<MapData>({ zones: [], personnel: [], vehicles: [], pqrs: [] })
  const [isClient, setIsClient] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setIsClient(true)
    loadMapData()
  }, [])

  const loadMapData = async () => {
    try {
      const [zonesRes, personnelRes, vehiclesRes, pqrsRes] = await Promise.all([
        supabase.from("zones").select("id, name, latitude, longitude, priority_level").not("latitude", "is", null),
        supabase.from("personnel").select("id, first_name, last_name, latitude, longitude, personnel_roles(name), status").not("latitude", "is", null),
        supabase.from("vehicles").select("id, license_plate, latitude, longitude, vehicle_types(name), status").not("latitude", "is", null),
        supabase.from("pqrs_requests").select("id, title, latitude, longitude, priority, type").not("latitude", "is", null)
      ])

      setMapData({
        zones: zonesRes.data || [],
        personnel: personnelRes.data || [],
        vehicles: vehiclesRes.data || [],
        pqrs: pqrsRes.data || []
      })
    } catch (error) {
      console.error("Error loading map data:", error)
    }
  }

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
            <MapComponent mapData={mapData} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}