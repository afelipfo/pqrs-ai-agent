"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssignmentDashboard } from "@/components/assignment-dashboard"
import { useApp } from "@/lib/app-context"

export default function DashboardPage() {
  const { data } = useApp()

  // Filter data for dashboard
  const pendingPQRS = data.pqrs.filter(pqrs => pqrs.status === "pending")
  const activeAssignments = data.assignments.filter(assignment => assignment.status === "active")
  const availablePersonnel = data.personnel.filter(person => person.status === "available")
  const availableVehicles = data.vehicles.filter(vehicle => vehicle.status === "available")
  const recentAssignments = data.assignments.slice(-10) // Last 10 assignments

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
        pendingPQRS={pendingPQRS}
        activeAssignments={activeAssignments}
        availablePersonnel={availablePersonnel}
        availableVehicles={availableVehicles}
        zones={data.zones}
        recentAssignments={recentAssignments}
      />
    </div>
  )
}
