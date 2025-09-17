import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GeographicalMap } from "@/components/geographical-map"

export default function MapPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapa Geográfico - Medellín</h1>
        <p className="text-gray-600">Visualización completa de todos los recursos y PQRS en el mapa de la ciudad</p>
      </div>

      <GeographicalMap />
    </div>
  )
}