import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseTest } from "@/components/database-test"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Agente inteligente de gestión de PQRS
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Secretaría de Infraestructura Física
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-3xl">📍</span>
                <span className="text-blue-700">Gestión de Zonas</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Administrar zonas y distritos de Medellín con coordenadas geográficas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/zones">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Acceder
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-orange-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-3xl">🧠</span>
                <span className="text-orange-700">Panel de Asignaciones</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Dashboard de asignaciones inteligentes con IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Acceder
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-3xl">📄</span>
                <span className="text-blue-700">Gestión PQRS</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Administrar peticiones, quejas, reclamos y sugerencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pqrs">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Acceder
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-orange-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-3xl">👥</span>
                <span className="text-orange-700">Personal</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Gestionar personal y roles con ubicación geográfica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/personnel">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Acceder
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-3xl">🚗</span>
                <span className="text-blue-700">Vehículos</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Administrar flota vehicular con tracking GPS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vehicles">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Acceder
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-orange-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <span className="text-3xl">🗺️</span>
                <span className="text-orange-700">Mapa Geográfico</span>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Visualización completa de todos los recursos en el mapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/map">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Ver Mapa
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Estado del Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">16</div>
              <div className="text-sm text-gray-600">Zonas Activas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24</div>
              <div className="text-sm text-gray-600">Personal Disponible</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">18</div>
              <div className="text-sm text-gray-600">Vehículos Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">PQRS Pendientes</div>
            </div>
          </div>
        </div>

        {/* Database Connection Test */}
        <div className="mt-12">
          <DatabaseTest />
        </div>
      </div>
    </div>
  )
}
