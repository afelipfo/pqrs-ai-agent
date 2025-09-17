"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Edit, UserCheck, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Personnel {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  role_id: string
  status: string
  current_zone_id?: string
  shift_start?: string
  shift_end?: string
  certifications?: any
  contact_info?: any
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
  personnel_roles?: {
    name: string
    department: string
  }
  zones?: {
    name: string
  }
}

interface PersonnelManagementProps {
  initialPersonnel: Personnel[]
  roles: any[]
  zones: any[]
}

export function PersonnelManagement({ initialPersonnel, roles, zones }: PersonnelManagementProps) {
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel)
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  const filteredPersonnel = personnel.filter(
    (person) =>
      `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.personnel_roles?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return { label: "Disponible", color: "bg-green-100 text-green-800" }
      case "assigned":
        return { label: "Asignado", color: "bg-blue-100 text-blue-800" }
      case "off_duty":
        return { label: "Fuera de Servicio", color: "bg-gray-100 text-gray-800" }
      case "on_leave":
        return { label: "De Vacaciones", color: "bg-yellow-100 text-yellow-800" }
      default:
        return { label: "Sin definir", color: "bg-gray-100 text-gray-800" }
    }
  }

  const handleCreatePersonnel = async (formData: FormData) => {
    try {
      const newPersonnel = {
        employee_id: formData.get("employee_id") as string,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        role_id: formData.get("role_id") as string,
        status: formData.get("status") as string,
        current_zone_id: formData.get("current_zone_id") as string || null,
        shift_start: formData.get("shift_start") as string || null,
        shift_end: formData.get("shift_end") as string || null,
        latitude: Number.parseFloat(formData.get("latitude") as string) || null,
        longitude: Number.parseFloat(formData.get("longitude") as string) || null,
      }

      console.log("Creating personnel with data:", newPersonnel)

      const { data, error } = await supabase.from("personnel").insert([newPersonnel]).select(`
        *,
        personnel_roles (name, department),
        zones (name)
      `).single()

      if (error) {
        console.error("Error creating personnel:", error)
        alert(`Error al crear personal: ${error.message}`)
        return
      }

      console.log("Personnel created successfully:", data)
      setPersonnel([...personnel, data])
      setIsCreateDialogOpen(false)
      alert("Personal creado exitosamente")
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("Error inesperado al crear personal")
    }
  }

  const handleUpdatePersonnel = async (formData: FormData) => {
    if (!selectedPersonnel) return

    const updatedPersonnel = {
      employee_id: formData.get("employee_id") as string,
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      role_id: formData.get("role_id") as string,
      status: formData.get("status") as string,
      current_zone_id: formData.get("current_zone_id") as string || null,
      shift_start: formData.get("shift_start") as string || null,
      shift_end: formData.get("shift_end") as string || null,
      latitude: Number.parseFloat(formData.get("latitude") as string) || null,
      longitude: Number.parseFloat(formData.get("longitude") as string) || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("personnel")
      .update(updatedPersonnel)
      .eq("id", selectedPersonnel.id)
      .select(`
        *,
        personnel_roles (name, department),
        zones (name)
      `)
      .single()

    if (error) {
      console.error("Error updating personnel:", error)
      return
    }

    setPersonnel(personnel.map((person) => (person.id === selectedPersonnel.id ? data : person)))
    setIsEditDialogOpen(false)
    setSelectedPersonnel(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar personal por nombre, ID o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Personal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Personal</DialogTitle>
              <DialogDescription>Agrega un nuevo miembro al equipo</DialogDescription>
            </DialogHeader>
            <form action={handleCreatePersonnel} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_id">ID Empleado</Label>
                  <Input id="employee_id" name="employee_id" required />
                </div>
                <div>
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input id="first_name" name="first_name" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input id="last_name" name="last_name" required />
                </div>
                <div>
                  <Label htmlFor="role_id">Rol</Label>
                  <Select name="role_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name} - {role.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" defaultValue="available">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="assigned">Asignado</SelectItem>
                      <SelectItem value="off_duty">Fuera de Servicio</SelectItem>
                      <SelectItem value="on_leave">De Vacaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current_zone_id">Zona Actual</Label>
                  <Select name="current_zone_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shift_start">Inicio de Turno</Label>
                  <Input id="shift_start" name="shift_start" type="time" />
                </div>
                <div>
                  <Label htmlFor="shift_end">Fin de Turno</Label>
                  <Input id="shift_end" name="shift_end" type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="6.2442"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    placeholder="-75.5812"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Personal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Personnel Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{personnel.length}</div>
                <div className="text-sm text-muted-foreground">Total Personal</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {personnel.filter((person) => person.status === "available").length}
                </div>
                <div className="text-sm text-muted-foreground">Disponible</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {personnel.filter((person) => person.status === "assigned").length}
                </div>
                <div className="text-sm text-muted-foreground">Asignado</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {new Set(personnel.map((person) => person.personnel_roles?.department)).size}
                </div>
                <div className="text-sm text-muted-foreground">Departamentos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.map((person) => {
          const status = getStatusLabel(person.status)
          return (
            <Card key={person.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {person.first_name} {person.last_name}
                    </CardTitle>
                    <CardDescription>ID: {person.employee_id}</CardDescription>
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rol:</span>
                  <span className="font-medium">{person.personnel_roles?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Departamento:</span>
                  <span className="font-medium">{person.personnel_roles?.department}</span>
                </div>
                {person.zones && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zona:</span>
                    <span className="font-medium">{person.zones.name}</span>
                  </div>
                )}
                {person.shift_start && person.shift_end && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Turno:</span>
                    <span className="font-medium">
                      {person.shift_start} - {person.shift_end}
                    </span>
                  </div>
                )}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setSelectedPersonnel(person)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Personal</DialogTitle>
            <DialogDescription>Modifica la información del miembro del equipo</DialogDescription>
          </DialogHeader>
          {selectedPersonnel && (
            <form action={handleUpdatePersonnel} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-employee_id">ID Empleado</Label>
                  <Input
                    id="edit-employee_id"
                    name="employee_id"
                    defaultValue={selectedPersonnel.employee_id}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-first_name">Nombre</Label>
                  <Input
                    id="edit-first_name"
                    name="first_name"
                    defaultValue={selectedPersonnel.first_name}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-last_name">Apellido</Label>
                  <Input
                    id="edit-last_name"
                    name="last_name"
                    defaultValue={selectedPersonnel.last_name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role_id">Rol</Label>
                  <Select name="role_id" defaultValue={selectedPersonnel.role_id}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name} - {role.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select name="status" defaultValue={selectedPersonnel.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="assigned">Asignado</SelectItem>
                      <SelectItem value="off_duty">Fuera de Servicio</SelectItem>
                      <SelectItem value="on_leave">De Vacaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-current_zone_id">Zona Actual</Label>
                  <Select name="current_zone_id" defaultValue={selectedPersonnel.current_zone_id || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-shift_start">Inicio de Turno</Label>
                  <Input
                    id="edit-shift_start"
                    name="shift_start"
                    type="time"
                    defaultValue={selectedPersonnel.shift_start || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-shift_end">Fin de Turno</Label>
                  <Input
                    id="edit-shift_end"
                    name="shift_end"
                    type="time"
                    defaultValue={selectedPersonnel.shift_end || ""}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-latitude">Latitud</Label>
                  <Input
                    id="edit-latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    defaultValue={selectedPersonnel.latitude || ""}
                    placeholder="6.2442"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-longitude">Longitud</Label>
                  <Input
                    id="edit-longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    defaultValue={selectedPersonnel.longitude || ""}
                    placeholder="-75.5812"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedPersonnel(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Actualizar Personal</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}