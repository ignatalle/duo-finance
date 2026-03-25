'use client'

import { useTransition } from 'react'
import { eliminarPresupuesto } from '@/app/actions/presupuestos'
import { X, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ModalConfirmarEliminarPresupuestoProps {
  presupuestoId: string
  categoria: string
  onClose: () => void
}

export function ModalConfirmarEliminarPresupuesto({
  presupuestoId,
  categoria,
  onClose,
}: ModalConfirmarEliminarPresupuestoProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleEliminar = () => {
    startTransition(async () => {
      const result = await eliminarPresupuesto(presupuestoId)
      if (result.success) {
        onClose()
        router.refresh()
      } else {
        alert(result.error || 'No se pudo eliminar')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-sm max-h-[85dvh] overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-2xl p-6 pb-8 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Eliminar presupuesto</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-zinc-400 text-sm mb-6">
          ¿Eliminar el límite de <span className="text-white font-medium">&quot;{categoria}&quot;</span>? Podés volver a configurarlo cuando quieras.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-zinc-600 text-zinc-400 font-bold text-sm hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleEliminar}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-rose-600 disabled:bg-zinc-600 text-white font-bold text-sm hover:bg-rose-500 transition-colors flex justify-center items-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={18} /> Eliminar</>}
          </button>
        </div>
      </div>
    </div>
  )
}
