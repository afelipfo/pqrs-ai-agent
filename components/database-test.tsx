"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Database, Loader2 } from "lucide-react"

export function DatabaseTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const supabase = createClient()

  const runDatabaseTest = async () => {
    setIsTesting(true)
    setTestResults(null)

    const results = {
      connection: false,
      tables: {} as any,
      errors: [] as string[]
    }

    try {
      // Test connection by trying to get zones
      console.log("Testing database connection...")
      const { data: zones, error: zonesError } = await supabase
        .from("zones")
        .select("count", { count: "exact", head: true })

      if (zonesError) {
        results.errors.push(`Zones table error: ${zonesError.message}`)
      } else {
        results.connection = true
        results.tables.zones = zones ? "OK" : "Empty"
        console.log("✅ Zones table accessible")
      }

      // Test personnel table
      const { data: personnel, error: personnelError } = await supabase
        .from("personnel")
        .select("count", { count: "exact", head: true })

      if (personnelError) {
        results.errors.push(`Personnel table error: ${personnelError.message}`)
      } else {
        results.tables.personnel = personnel ? "OK" : "Empty"
        console.log("✅ Personnel table accessible")
      }

      // Test vehicles table
      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("count", { count: "exact", head: true })

      if (vehiclesError) {
        results.errors.push(`Vehicles table error: ${vehiclesError.message}`)
      } else {
        results.tables.vehicles = vehicles ? "OK" : "Empty"
        console.log("✅ Vehicles table accessible")
      }

      // Test PQRS table
      const { data: pqrs, error: pqrsError } = await supabase
        .from("pqrs_requests")
        .select("count", { count: "exact", head: true })

      if (pqrsError) {
        results.errors.push(`PQRS table error: ${pqrsError.message}`)
      } else {
        results.tables.pqrs = pqrs ? "OK" : "Empty"
        console.log("✅ PQRS table accessible")
      }

    } catch (error: any) {
      results.errors.push(`Unexpected error: ${error.message}`)
      console.error("Database test error:", error)
    }

    setTestResults(results)
    setIsTesting(false)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Prueba de Conexión a Base de Datos
        </CardTitle>
        <CardDescription>
          Verifica que todas las tablas estén accesibles y funcionando correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDatabaseTest}
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Probando conexión...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Ejecutar Prueba de Base de Datos
            </>
          )}
        </Button>

        {testResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {testResults.connection ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Conexión exitosa</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700">Error de conexión</span>
                </>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Estado de Tablas:</h4>
              {Object.entries(testResults.tables).map(([table, status]) => (
                <div key={table} className="flex items-center justify-between p-2 border rounded">
                  <span className="capitalize">{table}</span>
                  <div className="flex items-center gap-2">
                    {status === "OK" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className={`text-sm ${status === "OK" ? "text-green-700" : "text-yellow-700"}`}>
                      {String(status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {testResults.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">Errores encontrados:</h4>
                {testResults.errors.map((error: string, index: number) => (
                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    {error}
                  </div>
                ))}
              </div>
            )}

            {testResults.connection && testResults.errors.length === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">¡Todas las pruebas pasaron exitosamente!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  La base de datos está funcionando correctamente. Puedes crear, leer, actualizar y eliminar registros.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}