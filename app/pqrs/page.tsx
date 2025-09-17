import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { PQRSManagement } from "@/components/pqrs-management"

export default async function PQRSPage() {
  const supabase = await createClient()

  const [{ data: pqrsRequests }, { data: zones }] = await Promise.all([
    supabase
      .from("pqrs_requests")
      .select(`
        *,
        zones (name, code),
        personnel (first_name, last_name),
        vehicles (license_plate)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("zones").select("*").order("name"),
  ])

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de PQRS</h1>
        <p className="text-gray-600">
          Administra Peticiones, Quejas, Reclamos y Sugerencias de los ciudadanos de Medellín
        </p>
      </div>

      <PQRSManagement initialPQRS={pqrsRequests || []} zones={zones || []} />
    </div>
  )
}
