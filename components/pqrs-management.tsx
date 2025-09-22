"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  FileText,
  Plus,
  Upload,
  Download,
  Search,
  Clock,
  MapPin,
  User,
  Car,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Eye,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PQRSRequest {
  id: string
  request_number: string
  type: string
  category: string
  title: string
  description: string
  priority: string
  status: string
  zone_id: string
  zones?: { name: string; code: string }
  personnel?: { first_name: string; last_name: string }
  vehicles?: { license_plate: string }
  created_at: string
  updated_at: string
}

interface Zone {
  id: string
  name: string
  code: string
}

interface PQRSManagementProps {
  initialPQRS: PQRSRequest[]
  zones: Zone[]
  onReviewPQRS?: (pqrs: PQRSRequest) => void
}

export function PQRSManagement({ initialPQRS, zones, onReviewPQRS }: PQRSManagementProps) {
  const [pqrsRequests, setPqrsRequests] = useState<PQRSRequest[]>(initialPQRS)
  const [filteredPQRS, setFilteredPQRS] = useState<PQRSRequest[]>(initialPQRS)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  // Filter PQRS based on search and filters
  const applyFilters = () => {
    let filtered = pqrsRequests

    if (searchTerm) {
      filtered = filtered.filter(
        (pqrs) =>
          pqrs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pqrs.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pqrs.request_number.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((pqrs) => pqrs.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((pqrs) => pqrs.priority === priorityFilter)
    }

    setFilteredPQRS(filtered)
  }

  // Apply filters when search term or filters change
  useState(() => {
    applyFilters()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "peticion":
        return "📝"
      case "queja":
        return "😠"
      case "reclamo":
        return "⚠️"
      case "sugerencia":
        return "💡"
      default:
        return "📋"
    }
  }

  const handleCreatePQRS = async (formData: FormData) => {
    try {
      const newPQRS = {
        id: (pqrsRequests.length + 1).toString(),
        request_number: `PQRS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        type: formData.get("type") as string,
        category: formData.get("category") as string,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        priority: formData.get("priority") as string,
        status: "pending",
        zone_id: formData.get("zone_id") as string,
        zones: zones.find((z) => z.id === formData.get("zone_id")),
        personnel: undefined,
        vehicles: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Creating PQRS with data:", newPQRS)

      // Add to local state instead of Supabase
      setPqrsRequests([newPQRS, ...pqrsRequests])
      setFilteredPQRS([newPQRS, ...filteredPQRS])
      setIsCreateDialogOpen(false)
      alert("PQRS creada exitosamente")
    } catch (error) {
      console.error("Unexpected error:", error)
      alert("Error inesperado al crear PQRS")
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const text = await file.text()
      let importedData: any[] = []

      if (file.name.endsWith(".json")) {
        importedData = JSON.parse(text)
      } else if (file.name.endsWith(".csv")) {
        // Simple CSV parsing (you might want to use a proper CSV library)
        const lines = text.split("\n")
        const headers = lines[0].split(",")
        importedData = lines.slice(1).map((line) => {
          const values = line.split(",")
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim()
          })
          return obj
        })
      }

      // Process and insert imported data
      const processedData = importedData
        .filter((item) => item.title && item.description) // Basic validation
        .map((item) => ({
          request_number:
            item.request_number ||
            `PQRS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
          type: item.type || "peticion",
          category: item.category || "infrastructure",
          title: item.title,
          description: item.description,
          priority: item.priority || "medium",
          zone_id: zones.find((z) => z.name === item.zone || z.code === item.zone_code)?.id || zones[0]?.id,
          citizen_info: {
            name: item.citizen_name || "Ciudadano Anónimo",
            email: item.citizen_email || "",
            phone: item.citizen_phone || "",
          },
        }))

      if (processedData.length > 0) {
        const { data, error } = await supabase.from("pqrs_requests").insert(processedData).select()

        if (error) {
          console.error("Error importing PQRS:", error)
          return
        }

        // Add zone information to imported PQRS
        const pqrsWithZones = data.map((pqrs) => ({
          ...pqrs,
          zones: zones.find((z) => z.id === pqrs.zone_id),
        }))

        setPqrsRequests([...pqrsWithZones, ...pqrsRequests])
        setFilteredPQRS([...pqrsWithZones, ...filteredPQRS])
        setIsImportDialogOpen(false)

        alert(`Se importaron ${processedData.length} registros PQRS exitosamente`)
      }
    } catch (error) {
      console.error("Error processing file:", error)
      alert("Error al procesar el archivo. Verifique el formato.")
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleExportData = () => {
    const exportData = filteredPQRS.map((pqrs) => ({
      request_number: pqrs.request_number,
      type: pqrs.type,
      category: pqrs.category,
      title: pqrs.title,
      description: pqrs.description,
      priority: pqrs.priority,
      status: pqrs.status,
      zone: pqrs.zones?.name,
      zone_code: pqrs.zones?.code,
      assigned_personnel: pqrs.personnel ? `${pqrs.personnel.first_name} ${pqrs.personnel.last_name}` : "",
      assigned_vehicle: pqrs.vehicles?.license_plate || "",
      created_at: pqrs.created_at,
      updated_at: pqrs.updated_at,
    }))

    const csv = [Object.keys(exportData[0]).join(","), ...exportData.map((row) => Object.values(row).join(","))].join(
      "\n",
    )

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pqrs-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatistics = () => {
    const total = pqrsRequests.length
    const pending = pqrsRequests.filter((p) => p.status === "pending").length
    const inProgress = pqrsRequests.filter((p) => p.status === "in_progress").length
    const resolved = pqrsRequests.filter((p) => p.status === "resolved").length
    const urgent = pqrsRequests.filter((p) => p.priority === "urgent").length

    return { total, pending, inProgress, resolved, urgent }
  }

  const stats = getStatistics()

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total PQRS</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">En Progreso</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.resolved}</div>
                <div className="text-sm text-muted-foreground">Resueltos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.urgent}</div>
                <div className="text-sm text-muted-foreground">Urgentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar PQRS..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                applyFilters()
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              applyFilters()
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="resolved">Resuelto</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={(value) => {
              setPriorityFilter(value)
              applyFilters()
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Datos PQRS</DialogTitle>
                <DialogDescription>
                  Sube un archivo CSV o JSON con datos de PQRS para importar al sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Seleccionar Archivo</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileImport}
                    ref={fileInputRef}
                    disabled={isImporting}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Formatos soportados: CSV, JSON. Campos requeridos: title, description
                  </p>
                </div>
                {isImporting && (
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Procesando archivo...</div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva PQRS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva PQRS</DialogTitle>
                <DialogDescription>Registra una nueva petición, queja, reclamo o sugerencia</DialogDescription>
              </DialogHeader>
              <form action={handleCreatePQRS} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select name="type" defaultValue="peticion">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peticion">Petición</SelectItem>
                        <SelectItem value="queja">Queja</SelectItem>
                        <SelectItem value="reclamo">Reclamo</SelectItem>
                        <SelectItem value="sugerencia">Sugerencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select name="category" defaultValue="infrastructure">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="security">Seguridad</SelectItem>
                        <SelectItem value="infrastructure">Infraestructura</SelectItem>
                        <SelectItem value="environment">Medio Ambiente</SelectItem>
                        <SelectItem value="transport">Transporte</SelectItem>
                        <SelectItem value="health">Salud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" name="description" rows={3} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zone_id">Zona</Label>
                    <Select name="zone_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar zona" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name} ({zone.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Información del Ciudadano</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input name="citizen_name" placeholder="Nombre" />
                    <Input name="citizen_email" type="email" placeholder="Email" />
                    <Input name="citizen_phone" placeholder="Teléfono" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear PQRS</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* PQRS List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de PQRS</CardTitle>
          <CardDescription>
            Mostrando {filteredPQRS.length} de {pqrsRequests.length} registros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPQRS.map((pqrs) => (
              <div key={pqrs.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(pqrs.type)}</span>
                    <div>
                      <h3 className="font-semibold">{pqrs.title}</h3>
                      <p className="text-sm text-muted-foreground">#{pqrs.request_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(pqrs.priority)}>{pqrs.priority}</Badge>
                    <Badge className={getStatusColor(pqrs.status)}>{pqrs.status}</Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{pqrs.description}</p>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {pqrs.zones?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(pqrs.created_at).toLocaleDateString()}
                    </span>
                    {pqrs.personnel && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {pqrs.personnel.first_name} {pqrs.personnel.last_name}
                      </span>
                    )}
                    {pqrs.vehicles && (
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {pqrs.vehicles.license_plate}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{pqrs.category}</Badge>
                    {pqrs.status === "in_progress" && onReviewPQRS && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReviewPQRS(pqrs)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredPQRS.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron registros PQRS con los filtros aplicados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
