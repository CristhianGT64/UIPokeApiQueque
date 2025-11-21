"use client"

import { useState, useEffect } from "react"
import { Download, RefreshCw, ArrowUpDown, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteReport as reportServiceDelete } from "@/services/report-service"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import ConfirmDialog from "@/components/ui/confirm-dialog"

export default function ReportsTable({ reports, loading, onRefresh, onDownload }) {
  const [refreshing, setRefreshing] = useState(false)
  const [sortedReports, setSortedReports] = useState([])
  const [sortDirection, setSortDirection] = useState("desc") // "desc" para descendente (más reciente primero)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState(null)

  // Ordenar los reportes cuando cambian o cuando cambia la dirección de ordenamiento
  useEffect(() => {
    if (!reports || reports.length === 0) {
      setSortedReports([])
      return
    }

    // Crear una copia para no modificar el array original
    const reportsCopy = [...reports]

    // Ordenar por el campo "updated"
    const sorted = reportsCopy.sort((a, b) => {
      const dateA = new Date(getPropertyValue(a, "updated"))
      const dateB = new Date(getPropertyValue(b, "updated"))

      // Verificar si las fechas son válidas
      const isValidDateA = !isNaN(dateA.getTime())
      const isValidDateB = !isNaN(dateB.getTime())

      // Si ambas fechas son válidas, compararlas
      if (isValidDateA && isValidDateB) {
        return sortDirection === "desc" ? dateB - dateA : dateA - dateB
      }

      // Si solo una fecha es válida, ponerla primero
      if (isValidDateA) return sortDirection === "desc" ? -1 : 1
      if (isValidDateB) return sortDirection === "desc" ? 1 : -1

      // Si ninguna fecha es válida, mantener el orden original
      return 0
    })

    setSortedReports(sorted)
  }, [reports, sortDirection])

  // Función para cambiar la dirección de ordenamiento
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
  }

  // Función para obtener el valor de una propiedad, manejando diferentes estructuras de datos
  const getPropertyValue = (obj, prop) => {
    // Si la propiedad existe directamente
    if (obj[prop] !== undefined) {
      return obj[prop]
    }

    // Si la propiedad está en camelCase o en formato diferente
    const propLower = prop.toLowerCase()
    const keys = Object.keys(obj)

    // Buscar una propiedad que coincida ignorando mayúsculas/minúsculas
    for (const key of keys) {
      if (key.toLowerCase() === propLower) {
        return obj[key]
      }
    }

    // Si no se encuentra, devolver un valor por defecto
    return "N/A"
  }

  // Verificar si el status es "completed"
  const isStatusCompleted = (report) => {
    const status = getPropertyValue(report, "status")
    return status && status.toLowerCase() === "completed"
  }

  // Manejar la descarga del CSV
  const handleDownload = (report) => {
    const url = getPropertyValue(report, "url")
    if (!url || url === "N/A") {
      toast.error("URL de descarga no disponible")
      return
    }
    onDownload(url)
  }

  // Manejar el refresco de la tabla
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await onRefresh()
      toast.success("Los reportes han sido actualizados correctamente")
    } catch (error) {
      toast.error("No se pudieron actualizar los reportes. Por favor, intenta de nuevo.")
    } finally {
      setRefreshing(false)
    }
  }

  // Abrir diálogo de confirmación
  const handleDelete = (report) => {
    const id = getPropertyValue(report, "reportId")
    if (!id) {
      toast.error("No se pudo identificar el reporte a eliminar")
      return
    }

    setReportToDelete(report)
    setConfirmOpen(true)
  }

  // Ejecutar eliminación después de confirmar
  const confirmDelete = async () => {
    if (!reportToDelete) return

    const id = getPropertyValue(reportToDelete, "reportId")
    if (!id) { 
      // Manejo de errores si no viene un ID
      toast.error("No se pudo identificar el reporte a eliminar")
      setConfirmOpen(false)
      setReportToDelete(null)
      return
    }

    /* Intentar hacer la eliminacion */
    try {
      setDeletingId(id)
      await reportServiceDelete(id)
      toast.success("Reporte eliminado correctamente")
      if (onRefresh) await onRefresh()
    } catch (error) {
      console.error(error)
      toast.error("No se pudo eliminar el reporte. Intenta de nuevo.")
    } finally {
      setDeletingId(null)
      setConfirmOpen(false)
      setReportToDelete(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Reports</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortDirection}
            className="flex items-center gap-1"
            title={
              sortDirection === "desc"
                ? "Ordenado de más reciente a más antiguo"
                : "Ordenado de más antiguo a más reciente"
            }
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{sortDirection === "desc" ? "Más reciente primero" : "Más antiguo primero"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <Table>
          <TableCaption>List of Pokémon reports available for download</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ReportId</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[150px]">PokemonType</TableHead>
              <TableHead className="w-[200px]">Created</TableHead>
              <TableHead className="w-[200px]">
                <div className="flex items-center">Updated</div>
              </TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports.length > 0 ? (
              sortedReports.map((report, index) => (
                <TableRow key={getPropertyValue(report, "reportId") || index}>
                  <TableCell>{getPropertyValue(report, "reportId")}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isStatusCompleted(report) ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getPropertyValue(report, "status")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{getPropertyValue(report, "pokemonType")}</span>
                  </TableCell>
                  <TableCell>{getPropertyValue(report, "created")}</TableCell>
                  <TableCell>{getPropertyValue(report, "updated")}</TableCell>
                  <TableCell className="flex gap-1">
                    {isStatusCompleted(report) && (
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(report)} title="Download CSV">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(report)}
                      title="Eliminar reporte"
                      disabled={deletingId === getPropertyValue(report, "reportId")}
                    >
                      <Trash2 className={`h-4 w-4 ${deletingId === getPropertyValue(report, "reportId") ? "animate-spin" : ""}`} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No reports available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar reporte"
        description={reportToDelete ? `Deseas eliminar el reporte ${getPropertyValue(reportToDelete, "reportId")}? Esta acción no se puede deshacer.` : undefined}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setReportToDelete(null); }}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={!!deletingId}
      />
    </div>
  )
}
