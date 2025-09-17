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
import { MapPin, Plus, Edit, Users, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Zone {
  id: string
  name: string
  code: string
  coordinates?: any
  population?: number
  area_km2?: number
  priority_level: number
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
}

interface ZoneManagementProps {
  initialZones: Zone[]
}

export function ZoneManagement({ initialZones }: ZoneManagementProps) {
  const [zones, setZones] = useState<Zone[]>(initialZones)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  const filteredZones = zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPriorityLabel = (level: number) => {
    switch (level) {
      case 1:
        return { label: "Baja", color: "bg-green-100 text-green-800" }
      case 2:
        return { label: "Media", color: "bg-yellow-100 text-yellow-800" }
      case 3:
        return { label: "Alta", color: "bg-orange-100 text-orange-800" }
      case 4:
        return { label: "Crítica", color: "bg-red-100 text-red-800" }
      default:
        return { label: "Sin definir", color: "bg-gray-100 text-gray-800" }
    }
  }

  const handleCreateZone = async (formData: FormData) => {
    try {
      const newZone = {
        name: formData.get("name") as string,
        code: formData.get("code") as string,
        population: Number.parseInt(formData.get("population") as string) || null,
        area_km2: Number.parseFloat(formData.get("area_km2") as string) || null,
        priority_level: Number.parseInt(formData.get("priority_level") as string) || 1,
        latitude: Number.parseFloat(formData.get("latitude") as string) || null,
        longitude: Number.parseFloat(formData.get("longitude") as string) || null,
      }

      console.log("Creating zone with data:", newZone)

      const { data, error } = await supabase.from("zones").insert([newZone]).select().single()

      if (error) {
        console.error("Error creating zone:", error)
        alert(`Error al crear zona: ${error.message}`)
        return
      }

      console.log("Zone created successfully:", data)
      setZones([...zones, data])
      setIsCreateDialogOpen(false)
      alert("Zona creada exitosamente")
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("Error inesperado al crear zona")
    }
  }

  const handleUpdateZone = async (formData: FormData) => {
    if (!selectedZone) return

    const updatedZone = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      population: Number.parseInt(formData.get("population") as string) || null,
      area_km2: Number.parseFloat(formData.get("area_km2") as string) || null,
      priority_level: Number.parseInt(formData.get("priority_level") as string) || 1,
      latitude: Number.parseFloat(formData.get("latitude") as string) || null,
      longitude: Number.parseFloat(formData.get("longitude") as string) || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("zones").update(updatedZone).eq("id", selectedZone.id).select().single()

    if (error) {
      console.error("Error updating zone:", error)
      return
    }

    setZones(zones.map((zone) => (zone.id === selectedZone.id ? data : zone)))
    setIsEditDialogOpen(false)
    setSelectedZone(null)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar zonas por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Zona
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Zona</DialogTitle>
              <DialogDescription>Agrega una nueva zona al sistema de gestión</DialogDescription>
            </DialogHeader>
            <form action={handleCreateZone} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Zona</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input id="code" name="code" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="population">Población</Label>
                  <Input id="population" name="population" type="number" />
                </div>
                <div>
                  <Label htmlFor="area_km2">Área (km²)</Label>
                  <Input id="area_km2" name="area_km2" type="number" step="0.01" />
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
              <div>
                <Label htmlFor="priority_level">Nivel de Prioridad</Label>
                <Select name="priority_level" defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Baja</SelectItem>
                    <SelectItem value="2">Media</SelectItem>
                    <SelectItem value="3">Alta</SelectItem>
                    <SelectItem value="4">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Zona</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Zone Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{zones.length}</div>
                <div className="text-sm text-muted-foreground">Total Zonas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {zones.reduce((sum, zone) => sum + (zone.population || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Población Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {zones.reduce((sum, zone) => sum + (zone.area_km2 || 0), 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Área Total (km²)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{zones.filter((zone) => zone.priority_level >= 3).length}</div>
                <div className="text-sm text-muted-foreground">Zonas de Alta Prioridad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredZones.map((zone) => {
          const priority = getPriorityLabel(zone.priority_level)
          return (
            <Card key={zone.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{zone.name}</CardTitle>
                    <CardDescription>Código: {zone.code}</CardDescription>
                  </div>
                  <Badge className={priority.color}>{priority.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {zone.population && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Población:</span>
                    <span className="font-medium">{zone.population.toLocaleString()}</span>
                  </div>
                )}
                {zone.area_km2 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Área:</span>
                    <span className="font-medium">{zone.area_km2} km²</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Densidad:</span>
                  <span className="font-medium">
                    {zone.population && zone.area_km2
                      ? Math.round(zone.population / zone.area_km2).toLocaleString() + " hab/km²"
                      : "N/A"}
                  </span>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setSelectedZone(zone)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Zona</DialogTitle>
            <DialogDescription>Modifica la información de la zona seleccionada</DialogDescription>
          </DialogHeader>
          {selectedZone && (
            <form action={handleUpdateZone} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nombre de la Zona</Label>
                  <Input id="edit-name" name="name" defaultValue={selectedZone.name} required />
                </div>
                <div>
                  <Label htmlFor="edit-code">Código</Label>
                  <Input id="edit-code" name="code" defaultValue={selectedZone.code} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-population">Población</Label>
                  <Input
                    id="edit-population"
                    name="population"
                    type="number"
                    defaultValue={selectedZone.population || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-area_km2">Área (km²)</Label>
                  <Input
                    id="edit-area_km2"
                    name="area_km2"
                    type="number"
                    step="0.01"
                    defaultValue={selectedZone.area_km2 || ""}
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
                    defaultValue={selectedZone.latitude || ""}
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
                    defaultValue={selectedZone.longitude || ""}
                    placeholder="-75.5812"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-priority_level">Nivel de Prioridad</Label>
                <Select name="priority_level" defaultValue={selectedZone.priority_level.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Baja</SelectItem>
                    <SelectItem value="2">Media</SelectItem>
                    <SelectItem value="3">Alta</SelectItem>
                    <SelectItem value="4">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedZone(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Actualizar Zona</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
