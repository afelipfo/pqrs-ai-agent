"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapData {
  zones: any[]
  personnel: any[]
  vehicles: any[]
  pqrs: any[]
}

interface MapComponentProps {
  mapData: MapData
}

// Component to fit map bounds
function FitBounds({ mapData }: { mapData: MapData }) {
  const map = useMap()

  useEffect(() => {
    const allPoints: [number, number][] = []

    // Collect all coordinates
    mapData.zones.forEach(zone => {
      if (zone.latitude && zone.longitude) {
        allPoints.push([zone.latitude, zone.longitude])
      }
    })

    mapData.personnel.forEach(person => {
      if (person.latitude && person.longitude) {
        allPoints.push([person.latitude, person.longitude])
      }
    })

    mapData.vehicles.forEach(vehicle => {
      if (vehicle.latitude && vehicle.longitude) {
        allPoints.push([vehicle.latitude, vehicle.longitude])
      }
    })

    mapData.pqrs.forEach(pqrs => {
      if (pqrs.latitude && pqrs.longitude) {
        allPoints.push([pqrs.latitude, pqrs.longitude])
      }
    })

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints)
      map.fitBounds(bounds, { padding: [20, 20] })
    } else {
      // Default to Medellín center if no data
      map.setView([6.2442, -75.5812], 12)
    }
  }, [map, mapData])

  return null
}

export default function MapComponent({ mapData }: MapComponentProps) {
  // Custom icons for different types
  const zoneIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  const personnelIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  const vehicleIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  const pqrsIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "🔴 URGENTE"
      case "high": return "🟠 ALTA"
      case "medium": return "🟡 MEDIA"
      case "low": return "🟢 BAJA"
      default: return "⚪ SIN DEFINIR"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "🟢 DISPONIBLE"
      case "assigned": return "🔵 ASIGNADO"
      case "maintenance": return "🟠 MANTENIMIENTO"
      case "off_duty": return "⚪ FUERA DE SERVICIO"
      case "on_leave": return "⚪ DE VACACIONES"
      default: return "⚪ " + status?.toUpperCase()
    }
  }

  return (
    <MapContainer
      center={[6.2442, -75.5812]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds mapData={mapData} />

      {/* Zone Markers */}
      {mapData.zones.map((zone) => (
        zone.latitude && zone.longitude && (
          <Marker
            key={`zone-${zone.id}`}
            position={[zone.latitude, zone.longitude]}
            icon={zoneIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-blue-700">📍 {zone.name}</h3>
                <p className="text-sm">Código: {zone.code}</p>
                <p className="text-sm">Prioridad: {zone.priority_level}/4</p>
                {zone.population && <p className="text-sm">Población: {zone.population.toLocaleString()}</p>}
              </div>
            </Popup>
          </Marker>
        )
      ))}

      {/* Personnel Markers */}
      {mapData.personnel.map((person) => (
        person.latitude && person.longitude && (
          <Marker
            key={`personnel-${person.id}`}
            position={[person.latitude, person.longitude]}
            icon={personnelIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-orange-700">👥 {person.first_name} {person.last_name}</h3>
                <p className="text-sm">ID: {person.employee_id}</p>
                <p className="text-sm">Rol: {person.personnel_roles?.name}</p>
                <p className="text-sm">Estado: {getStatusColor(person.status)}</p>
                <p className="text-sm">Departamento: {person.personnel_roles?.department}</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}

      {/* Vehicle Markers */}
      {mapData.vehicles.map((vehicle) => (
        vehicle.latitude && vehicle.longitude && (
          <Marker
            key={`vehicle-${vehicle.id}`}
            position={[vehicle.latitude, vehicle.longitude]}
            icon={vehicleIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-green-700">🚗 {vehicle.license_plate}</h3>
                <p className="text-sm">Tipo: {vehicle.vehicle_types?.name}</p>
                <p className="text-sm">Categoría: {vehicle.vehicle_types?.category}</p>
                <p className="text-sm">Estado: {getStatusColor(vehicle.status)}</p>
                <p className="text-sm">Combustible: {vehicle.fuel_level}%</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}

      {/* PQRS Markers */}
      {mapData.pqrs.map((pqrs) => (
        pqrs.latitude && pqrs.longitude && (
          <Marker
            key={`pqrs-${pqrs.id}`}
            position={[pqrs.latitude, pqrs.longitude]}
            icon={pqrsIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-red-700">📄 {pqrs.title}</h3>
                <p className="text-sm">Tipo: {pqrs.type}</p>
                <p className="text-sm">Prioridad: {getPriorityColor(pqrs.priority)}</p>
                <p className="text-sm">Categoría: {pqrs.category}</p>
                <p className="text-sm">Estado: {pqrs.status}</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  )
}