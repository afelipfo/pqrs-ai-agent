"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Brain, Clock, Users, Car, MapPin, AlertTriangle, CheckCircle, Activity, Zap, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { NotificationService, mockNotification } from "@/lib/notifications"

interface DashboardProps {
  pendingPQRS: any[]
  activeAssignments: any[]
  availablePersonnel: any[]
  availableVehicles: any[]
  zones: any[]
  recentAssignments: any[]
}

export function AssignmentDashboard({
  pendingPQRS,
  activeAssignments,
  availablePersonnel,
  availableVehicles,
  zones,
  recentAssignments,
}: DashboardProps) {
  const [selectedPQRS, setSelectedPQRS] = useState<any>(null)
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  const [isGeneratingAssignment, setIsGeneratingAssignment] = useState(false)
  const [assignmentResult, setAssignmentResult] = useState<any>(null)

  const supabase = createClient()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "security":
        return "🚔"
      case "infrastructure":
        return "🏗️"
      case "environment":
        return "🌱"
      case "transport":
        return "🚌"
      case "health":
        return "🏥"
      default:
        return "📋"
    }
  }

  const handleGenerateAssignment = async (pqrsId: string) => {
    setIsGeneratingAssignment(true)
    setAssignmentResult(null)

    try {
      const response = await fetch("/api/ai-assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pqrsId,
          autoExecute: false,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAssignmentResult(result.decision)
      } else {
        console.error("Assignment generation failed:", result.error)
      }
    } catch (error) {
      console.error("Error generating assignment:", error)
    } finally {
      setIsGeneratingAssignment(false)
    }
  }

  const handleExecuteAssignment = async () => {
    if (!selectedPQRS || !assignmentResult) return

    try {
      const response = await fetch("/api/ai-assignment/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pqrsId: selectedPQRS.id,
          personnelIds: assignmentResult.recommendedPersonnel.map((p: any) => p.personnelId),
          vehicleIds: assignmentResult.recommendedVehicles.map((v: any) => v.vehicleId),
          aiDecision: assignmentResult,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Send notifications to assigned personnel
        await sendAssignmentNotifications(selectedPQRS, assignmentResult)

        setIsAssignmentDialogOpen(false)
        setSelectedPQRS(null)
        setAssignmentResult(null)
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      console.error("Error executing assignment:", error)
    }
  }

  const sendAssignmentNotifications = async (pqrs: any, assignmentResult: any) => {
    try {
      // Get personnel details for notifications
      const personnelPromises = assignmentResult.recommendedPersonnel.map(async (person: any) => {
        const { data: personnelData } = await supabase
          .from("personnel")
          .select(`
            *,
            personnel_roles (name, department),
            zones (name)
          `)
          .eq("id", person.personnelId)
          .single()

        return personnelData
      })

      const personnelDetails = await Promise.all(personnelPromises)

      // Send notifications to each assigned personnel
      for (const personnel of personnelDetails) {
        if (personnel) {
          const notificationData = NotificationService.generateAssignmentMessage(
            pqrs,
            personnel,
            pqrs.zones
          )

          try {
            // Try to send real notification
            await NotificationService.sendAssignmentNotification(notificationData)
          } catch (error) {
            // Fallback to mock notification for development
            console.log("Real notification failed, using mock notification:", error)
            mockNotification(notificationData)
          }
        }
      }
    } catch (error) {
      console.error("Error sending assignment notifications:", error)
      // Fallback to mock notifications
      assignmentResult.recommendedPersonnel.forEach((person: any) => {
        const mockData = {
          to_email: `personnel${person.personnelId}@example.com`,
          personnel_name: `Personal ${person.personnelId}`,
          pqrs_title: pqrs.title,
          pqrs_type: pqrs.type,
          pqrs_priority: pqrs.priority,
          zone_name: pqrs.zones?.name,
          assignment_details: `Se le ha asignado la PQRS "${pqrs.title}" para atención inmediata.`
        }
        mockNotification(mockData)
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingPQRS.length}</div>
                <div className="text-sm text-muted-foreground">PQRS Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeAssignments.length}</div>
                <div className="text-sm text-muted-foreground">Asignaciones Activas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{availablePersonnel.length}</div>
                <div className="text-sm text-muted-foreground">Personal Disponible</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Car className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{availableVehicles.length}</div>
                <div className="text-sm text-muted-foreground">Vehículos Disponibles</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">PQRS Pendientes</TabsTrigger>
          <TabsTrigger value="active">Asignaciones Activas</TabsTrigger>
          <TabsTrigger value="resources">Recursos Disponibles</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                PQRS Pendientes de Asignación
              </CardTitle>
              <CardDescription>Solicitudes que requieren asignación de recursos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPQRS.map((pqrs) => (
                  <div
                    key={pqrs.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(pqrs.category)}</span>
                        <h3 className="font-semibold">{pqrs.title}</h3>
                        <Badge className={getPriorityColor(pqrs.priority)}>{pqrs.priority}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pqrs.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>#{pqrs.request_number}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pqrs.zones?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(pqrs.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedPQRS(pqrs)
                        setIsAssignmentDialogOpen(true)
                      }}
                      className="ml-4"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Asignar con IA
                    </Button>
                  </div>
                ))}
                {pendingPQRS.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No hay PQRS pendientes de asignación</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Asignaciones Activas
              </CardTitle>
              <CardDescription>Recursos actualmente asignados a solicitudes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(assignment.pqrs_requests?.category)}</span>
                        <h3 className="font-semibold">{assignment.pqrs_requests?.title}</h3>
                        <Badge className={getPriorityColor(assignment.pqrs_requests?.priority)}>
                          {assignment.pqrs_requests?.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Personal: </span>
                          <span className="font-medium">
                            {assignment.personnel?.first_name} {assignment.personnel?.last_name}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Vehículo: </span>
                          <span className="font-medium">{assignment.vehicles?.license_plate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confianza IA: </span>
                          <span className="font-medium">
                            {Math.round((assignment.ai_confidence_score || 0) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Asignado: </span>
                          <span className="font-medium">{new Date(assignment.assigned_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      En Progreso
                    </Badge>
                  </div>
                ))}
                {activeAssignments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No hay asignaciones activas</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Personal Disponible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availablePersonnel.slice(0, 5).map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          {person.first_name} {person.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {person.personnel_roles?.name} - {person.personnel_roles?.department}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Disponible
                      </Badge>
                    </div>
                  ))}
                  {availablePersonnel.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground">
                      +{availablePersonnel.length - 5} más disponibles
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-purple-600" />
                  Vehículos Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableVehicles.slice(0, 5).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{vehicle.license_plate}</div>
                        <div className="text-sm text-muted-foreground">
                          {vehicle.vehicle_types?.name} - {vehicle.vehicle_types?.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          Disponible
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">Combustible: {vehicle.fuel_level}%</div>
                      </div>
                    </div>
                  ))}
                  {availableVehicles.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground">
                      +{availableVehicles.length - 5} más disponibles
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                Historial de Asignaciones
              </CardTitle>
              <CardDescription>Últimas asignaciones realizadas por el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">#{assignment.pqrs_requests?.request_number}</div>
                      <div className="text-sm text-muted-foreground">{assignment.pqrs_requests?.title}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {assignment.personnel?.first_name} {assignment.personnel?.last_name}
                      </div>
                      <div className="text-muted-foreground">{assignment.vehicles?.license_plate}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground ml-4">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Asignación Inteligente con IA
            </DialogTitle>
            <DialogDescription>{selectedPQRS && `Generando asignación para: ${selectedPQRS.title}`}</DialogDescription>
          </DialogHeader>

          {selectedPQRS && (
            <div className="space-y-6">
              {/* PQRS Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles de la Solicitud</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Número: </span>
                      <span className="font-medium">{selectedPQRS.request_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Categoría: </span>
                      <span className="font-medium">{selectedPQRS.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prioridad: </span>
                      <Badge className={getPriorityColor(selectedPQRS.priority)}>{selectedPQRS.priority}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Zona: </span>
                      <span className="font-medium">{selectedPQRS.zones?.name}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-muted-foreground">Descripción: </span>
                    <p className="mt-1">{selectedPQRS.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Assignment Button */}
              {!assignmentResult && (
                <div className="text-center">
                  <Button
                    onClick={() => handleGenerateAssignment(selectedPQRS.id)}
                    disabled={isGeneratingAssignment}
                    size="lg"
                  >
                    {isGeneratingAssignment ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Generando Asignación...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generar Asignación con IA
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Assignment Results */}
              {assignmentResult && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-700">
                        <CheckCircle className="h-5 w-5 inline mr-2" />
                        Recomendación de Asignación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Personnel Recommendations */}
                      <div>
                        <h4 className="font-semibold mb-2">Personal Recomendado:</h4>
                        {assignmentResult.recommendedPersonnel.map((person: any, index: number) => (
                          <div key={index} className="p-3 border rounded mb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">Personal ID: {person.personnelId}</div>
                                <div className="text-sm text-muted-foreground mt-1">{person.reasoning}</div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">Confianza: {Math.round(person.confidence * 100)}%</Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Tiempo estimado: {person.estimatedResponseTime} min
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Vehicle Recommendations */}
                      <div>
                        <h4 className="font-semibold mb-2">Vehículos Recomendados:</h4>
                        {assignmentResult.recommendedVehicles.map((vehicle: any, index: number) => (
                          <div key={index} className="p-3 border rounded mb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">Vehículo ID: {vehicle.vehicleId}</div>
                                <div className="text-sm text-muted-foreground mt-1">{vehicle.reasoning}</div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">Confianza: {Math.round(vehicle.confidence * 100)}%</Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Puntuación: {vehicle.suitabilityScore}/10
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Priority Adjustment */}
                      {assignmentResult.priorityAdjustment.originalPriority !==
                        assignmentResult.priorityAdjustment.recommendedPriority && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <h4 className="font-semibold text-yellow-800 mb-1">Ajuste de Prioridad Recomendado</h4>
                          <div className="text-sm">
                            <span className="text-muted-foreground">De: </span>
                            <Badge className={getPriorityColor(assignmentResult.priorityAdjustment.originalPriority)}>
                              {assignmentResult.priorityAdjustment.originalPriority}
                            </Badge>
                            <span className="text-muted-foreground mx-2">→</span>
                            <Badge
                              className={getPriorityColor(assignmentResult.priorityAdjustment.recommendedPriority)}
                            >
                              {assignmentResult.priorityAdjustment.recommendedPriority}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {assignmentResult.priorityAdjustment.reasoning}
                          </div>
                        </div>
                      )}

                      {/* Additional Recommendations */}
                      {assignmentResult.additionalRecommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Recomendaciones Adicionales:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {assignmentResult.additionalRecommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-muted-foreground">
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAssignmentDialogOpen(false)
                            setSelectedPQRS(null)
                            setAssignmentResult(null)
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleExecuteAssignment}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ejecutar Asignación
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
