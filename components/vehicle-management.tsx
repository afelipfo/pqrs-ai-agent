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
import { Car, Plus, Edit, Fuel, Wrench, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Vehicle {
  id: string
  license_plate: string
  vehicle_type_id: string
  status: string
  current_zone_id?: string
  last_location?: any
  fuel_level: number
  maintenance_due?: string
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
  vehicle_types?: {
    name: string
    category: string
  }
  zones?: {
    name: string
  }
}

interface VehicleManagementProps {
  initialVehicles: Vehicle[]
  vehicleTypes: any[]
  zones: any[]
}

export function VehicleManagement({ initialVehicles, vehicleTypes, zones }: VehicleManagementProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicle_types?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicle_types?.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return { label: "Disponible", color: "bg-green-100 text-green-800" }
      case "assigned":
        return { label: "Asignado", color: "bg-blue-100 text-blue-800" }
      case "maintenance":
        return { label: "Mantenimiento", color: "bg-orange-100 text-orange-800" }
      case "out_of_service":
        return { label: "Fuera de Servicio", color: "bg-red-100 text-red-800" }
      default:
        return { label: "Sin definir", color: "bg-gray-100 text-gray-800" }
    }
  }

  const getFuelLevelColor = (level: number) => {
    if (level >= 75) return "text-green-600"
    if (level >= 25) return "text-yellow-600"
    return "text-red-600"
  }

  const handleCreateVehicle = async (formData: FormData) => {
    try {
      const newVehicle = {
        id: (vehicles.length + 1).toString(),
        license_plate: formData.get("license_plate") as string,
        vehicle_type_id: formData.get("vehicle_type_id") as string,
        status: formData.get("status") as string,
        current_zone_id: formData.get("current_zone_id") as string || undefined,
        fuel_level: Number.parseFloat(formData.get("fuel_level") as string) || 100,
        maintenance_due: formData.get("maintenance_due") as string || undefined,
        latitude: formData.get("latitude") ? Number.parseFloat(formData.get("latitude") as string) : undefined,
        longitude: formData.get("longitude") ? Number.parseFloat(formData.get("longitude") as string) : undefined,
        last_location: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        vehicle_types: vehicleTypes.find(vt => vt.id === formData.get("vehicle_type_id")),
        zones: zones.find(z => z.id === formData.get("current_zone_id")),
      }

      console.log("Creating vehicle with data:", newVehicle)

      // Add to local state instead of Supabase
      setVehicles([...vehicles, newVehicle])
      setIsCreateDialogOpen(false)
      alert("Vehículo creado exitosamente")
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("Error inesperado al crear vehículo")
    }
  }

  const handleUpdateVehicle = async (formData: FormData) => {
    if (!selectedVehicle) return

    const updatedVehicle = {
      ...selectedVehicle,
      license_plate: formData.get("license_plate") as string,
      vehicle_type_id: formData.get("vehicle_type_id") as string,
      status: formData.get("status") as string,
      current_zone_id: formData.get("current_zone_id") as string || undefined,
      fuel_level: Number.parseFloat(formData.get("fuel_level") as string) || 100,
      maintenance_due: formData.get("maintenance_due") as string || undefined,
      latitude: formData.get("latitude") ? Number.parseFloat(formData.get("latitude") as string) : undefined,
      longitude: formData.get("longitude") ? Number.parseFloat(formData.get("longitude") as string) : undefined,
      updated_at: new Date().toISOString(),
      vehicle_types: vehicleTypes.find(vt => vt.id === formData.get("vehicle_type_id")),
      zones: zones.find(z => z.id === formData.get("current_zone_id")),
    }

    // Update local state instead of Supabase
    setVehicles(vehicles.map((vehicle) => (vehicle.id === selectedVehicle.id ? updatedVehicle : vehicle)))
    setIsEditDialogOpen(false)
    setSelectedVehicle(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar vehículos por placa, tipo o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Vehículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Vehículo</DialogTitle>
              <DialogDescription>Agrega un nuevo vehículo a la flota</DialogDescription>
            </DialogHeader>
            <form action={handleCreateVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_plate">Placa</Label>
                  <Input id="license_plate" name="license_plate" required />
                </div>
                <div>
                  <Label htmlFor="vehicle_type_id">Tipo de Vehículo</Label>
                  <Select name="vehicle_type_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} - {type.category}
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
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
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
                  <Label htmlFor="fuel_level">Nivel de Combustible (%)</Label>
                  <Input
                    id="fuel_level"
                    name="fuel_level"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="100"
                  />
                </div>
                <div>
                  <Label htmlFor="maintenance_due">Próximo Mantenimiento</Label>
                  <Input id="maintenance_due" name="maintenance_due" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitud (opcional)</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="6.2442"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitud (opcional)</Label>
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
                <Button type="submit">Crear Vehículo</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{vehicles.length}</div>
                <div className="text-sm text-muted-foreground">Total Vehículos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {vehicles.filter((vehicle) => vehicle.status === "available").length}
                </div>
                <div className="text-sm text-muted-foreground">Disponibles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {vehicles.filter((vehicle) => vehicle.fuel_level < 25).length}
                </div>
                <div className="text-sm text-muted-foreground">Bajo Combustible</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">
                  {vehicles.filter((vehicle) => vehicle.status === "maintenance").length}
                </div>
                <div className="text-sm text-muted-foreground">En Mantenimiento</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle) => {
          const status = getStatusLabel(vehicle.status)
          return (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{vehicle.license_plate}</CardTitle>
                    <CardDescription>{vehicle.vehicle_types?.name}</CardDescription>
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="font-medium">{vehicle.vehicle_types?.category}</span>
                </div>
                {vehicle.zones && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zona:</span>
                    <span className="font-medium">{vehicle.zones.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Combustible:</span>
                  <span className={`font-medium ${getFuelLevelColor(vehicle.fuel_level)}`}>
                    {vehicle.fuel_level}%
                  </span>
                </div>
                {vehicle.maintenance_due && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mantenimiento:</span>
                    <span className="font-medium">
                      {new Date(vehicle.maintenance_due).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setSelectedVehicle(vehicle)
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
            <DialogTitle>Editar Vehículo</DialogTitle>
            <DialogDescription>Modifica la información del vehículo</DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <form action={handleUpdateVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-license_plate">Placa</Label>
                  <Input
                    id="edit-license_plate"
                    name="license_plate"
                    defaultValue={selectedVehicle.license_plate}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vehicle_type_id">Tipo de Vehículo</Label>
                  <Select name="vehicle_type_id" defaultValue={selectedVehicle.vehicle_type_id}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} - {type.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select name="status" defaultValue={selectedVehicle.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="assigned">Asignado</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-current_zone_id">Zona Actual</Label>
                  <Select name="current_zone_id" defaultValue={selectedVehicle.current_zone_id || ""}>
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
                  <Label htmlFor="edit-fuel_level">Nivel de Combustible (%)</Label>
                  <Input
                    id="edit-fuel_level"
                    name="fuel_level"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={selectedVehicle.fuel_level.toString()}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maintenance_due">Próximo Mantenimiento</Label>
                  <Input
                    id="edit-maintenance_due"
                    name="maintenance_due"
                    type="date"
                    defaultValue={selectedVehicle.maintenance_due ? new Date(selectedVehicle.maintenance_due).toISOString().split('T')[0] : ""}
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
                    defaultValue={selectedVehicle.latitude || ""}
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
                    defaultValue={selectedVehicle.longitude || ""}
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
                    setSelectedVehicle(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Actualizar Vehículo</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}