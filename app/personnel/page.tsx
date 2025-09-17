import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { PersonnelManagement } from "@/components/personnel-management"

export default async function PersonnelPage() {
  const supabase = await createClient()

  const { data: personnel } = await supabase.from("personnel").select(`
    *,
    personnel_roles (name, department),
    zones (name)
  `).order("last_name")

  const { data: roles } = await supabase.from("personnel_roles").select("*").order("name")

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Personal - Medellín</h1>
        <p className="text-gray-600">Administra el personal disponible para asignaciones y operaciones</p>
      </div>

      <PersonnelManagement
        initialPersonnel={personnel || []}
        roles={roles || []}
        zones={zones || []}
      />
    </div>
  )
}