"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AppData {
  zones: any[]
  personnel: any[]
  vehicles: any[]
  pqrs: any[]
  assignments: any[]
}

interface AppContextType {
  data: AppData
  updatePQRS: (id: string, updates: any) => void
  updatePersonnel: (id: string, updates: any) => void
  updateVehicle: (id: string, updates: any) => void
  addAssignment: (assignment: any) => void
  addZone: (zone: any) => void
  addPersonnel: (personnel: any) => void
  addVehicle: (vehicle: any) => void
  addPQRS: (pqrs: any) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({
    zones: [],
    personnel: [],
    vehicles: [],
    pqrs: [],
    assignments: []
  })

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/registro-temporal.json')
        const tempData = await response.json()

        // Map zones data
        const zones = tempData.zones.map((zone: any) => ({
          id: zone.id.toString(),
          name: zone.name,
          code: zone.district,
          coordinates: zone.coordinates,
          population: Math.floor(Math.random() * 100000) + 50000,
          area_km2: Math.floor(Math.random() * 50) + 10,
          priority_level: Math.floor(Math.random() * 4) + 1,
          latitude: zone.coordinates.lat,
          longitude: zone.coordinates.lng,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        // Map personnel data
        const personnel = tempData.personnel.map((person: any, index: number) => {
          const nameParts = person.name.split(" ")
          return {
            id: person.id.toString(),
            employee_id: `EMP${String(person.id).padStart(3, "0")}`,
            first_name: nameParts[0],
            last_name: nameParts.slice(1).join(" "),
            role_id: "1",
            status: person.status === "Activo" ? "available" : "off_duty",
            current_zone_id: zones.find((z: any) => z.name === person.zone)?.id,
            shift_start: "08:00",
            shift_end: "17:00",
            latitude: person.coordinates.lat,
            longitude: person.coordinates.lng,
            certifications: null,
            contact_info: { phone: person.phone },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            personnel_roles: { name: person.role, department: "General" },
            zones: zones.find((z: any) => z.name === person.zone),
          }
        })

        // Map vehicles data
        const vehicles = tempData.vehicles.map((vehicle: any) => ({
          id: vehicle.id.toString(),
          license_plate: vehicle.plate,
          vehicle_type_id: "1",
          status: vehicle.status === "En Servicio" ? "assigned" : vehicle.status === "Disponible" ? "available" : "maintenance",
          current_zone_id: zones.find((z: any) => z.name === vehicle.zone)?.id,
          fuel_level: vehicle.status === "En Mantenimiento" ? 0 : Math.floor(Math.random() * 100) + 1,
          maintenance_due: vehicle.status === "En Mantenimiento" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
          latitude: vehicle.coordinates.lat,
          longitude: vehicle.coordinates.lng,
          last_location: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          vehicle_types: { name: vehicle.type, category: "Transporte" },
          zones: zones.find((z: any) => z.name === vehicle.zone),
        }))

        // Map PQRS data
        const pqrs = tempData.pqrs.map((pqrsItem: any) => {
          const statusMap: { [key: string]: string } = {
            "Abierta": "pending",
            "En Revisión": "in_progress",
            "Cerrada": "resolved"
          }

          const priorityMap: { [key: string]: string } = {
            "Baja": "low",
            "Media": "medium",
            "Alta": "high",
            "Urgente": "urgent"
          }

          return {
            id: pqrsItem.id.toString(),
            request_number: `PQRS-${new Date().getFullYear()}-${String(pqrsItem.id).padStart(4, "0")}`,
            type: pqrsItem.type === "Queja" ? "queja" : pqrsItem.type === "Petición" ? "peticion" : pqrsItem.type === "Reclamo" ? "reclamo" : "sugerencia",
            category: "infrastructure",
            title: pqrsItem.title,
            description: pqrsItem.description,
            priority: priorityMap[pqrsItem.priority] || "medium",
            status: statusMap[pqrsItem.status] || "pending",
            zone_id: zones.find((z: any) => z.name === pqrsItem.zone)?.id,
            zones: zones.find((z: any) => z.name === pqrsItem.zone),
            personnel: undefined,
            vehicles: undefined,
            created_at: pqrsItem.created_at,
            updated_at: new Date().toISOString(),
          }
        })

        // Mock assignments data
        const assignments = tempData.assignments.map((assignment: any) => ({
          id: assignment.id.toString(),
          pqrs_requests: pqrs.find((p: any) => p.title === assignment.title),
          personnel: personnel.find((p: any) => p.first_name + " " + p.last_name === assignment.assigned_to),
          vehicles: vehicles.find((v: any) => v.license_plate === assignment.vehicle),
          ai_confidence_score: Math.random() * 0.5 + 0.5,
          assigned_at: assignment.created_at,
          status: "active",
        }))

        setData({
          zones,
          personnel,
          vehicles,
          pqrs,
          assignments
        })

        setIsLoaded(true)
      } catch (error) {
        console.error("Error loading app data:", error)
      }
    }

    loadData()
  }, [])

  const updatePQRS = (id: string, updates: any) => {
    setData(prev => ({
      ...prev,
      pqrs: prev.pqrs.map(item => item.id === id ? { ...item, ...updates } : item)
    }))
  }

  const updatePersonnel = (id: string, updates: any) => {
    setData(prev => ({
      ...prev,
      personnel: prev.personnel.map(item => item.id === id ? { ...item, ...updates } : item)
    }))
  }

  const updateVehicle = (id: string, updates: any) => {
    setData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(item => item.id === id ? { ...item, ...updates } : item)
    }))
  }

  const addAssignment = (assignment: any) => {
    setData(prev => ({
      ...prev,
      assignments: [...prev.assignments, assignment]
    }))
  }

  const addZone = (zone: any) => {
    setData(prev => ({
      ...prev,
      zones: [...prev.zones, zone]
    }))
  }

  const addPersonnel = (personnel: any) => {
    setData(prev => ({
      ...prev,
      personnel: [...prev.personnel, personnel]
    }))
  }

  const addVehicle = (vehicle: any) => {
    setData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, vehicle]
    }))
  }

  const addPQRS = (pqrs: any) => {
    setData(prev => ({
      ...prev,
      pqrs: [...prev.pqrs, pqrs]
    }))
  }

  const value = {
    data,
    updatePQRS,
    updatePersonnel,
    updateVehicle,
    addAssignment,
    addZone,
    addPersonnel,
    addVehicle,
    addPQRS
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}