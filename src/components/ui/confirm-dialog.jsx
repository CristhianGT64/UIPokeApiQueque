"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export default function ConfirmDialog({ open, title = "Confirmar", description, onConfirm, onCancel, confirmLabel = "Eliminar", cancelLabel = "Cancelar", loading = false }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={loading}>{loading ? "Eliminando..." : confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
