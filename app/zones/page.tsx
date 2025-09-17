import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { ZoneManagement } from "@/components/zone-management"

export default async function ZonesPage() {
  const supabase = await createClient()

  const { data: zones } = await supabase.from("zones").select("*").order("name")

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Zonas - Medellín</h1>
        <p className="text-gray-600">Administra las zonas y distritos de la ciudad para optimizar las asignaciones</p>
      </div>

      <ZoneManagement initialZones={zones || []} />
    </div>
  )
}
