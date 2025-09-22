"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PQRSManagement } from "@/components/pqrs-management"
import { useApp } from "@/lib/app-context"
import { useRouter } from "next/navigation"

export default function PQRSPage() {
  const { data } = useApp()
  const router = useRouter()

  const handleReviewPQRS = (pqrs: any) => {
    // Store the PQRS to review in sessionStorage for the dashboard
    sessionStorage.setItem('reviewPQRS', JSON.stringify(pqrs))
    // Redirect to dashboard
    router.push('/dashboard')
  }

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

      <PQRSManagement
        initialPQRS={data.pqrs}
        zones={data.zones}
        onReviewPQRS={handleReviewPQRS}
      />
    </div>
  )
}
