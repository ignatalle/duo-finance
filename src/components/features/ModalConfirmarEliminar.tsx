'use client'

import { useTransition } from 'react'
import { eliminarTransaccion } from '@/app/actions/transacciones'
import { X, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ModalConfirmarEliminarProps {
  transaccionId: string
  concepto: string
  onClose: () => void
}

export function ModalConfirmarEliminar({ transaccionId, concepto, onClose }: ModalConfirmarEliminarProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleEliminar = () => {
    startTransition(async () => {
      const result = await eliminarTransaccion(transaccionId)
      if (result.success) {
        onClose()
        router.refresh()
      } else {
        alert(result.error || 'No se pudo eliminar')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-sm max-h-[85dvh] overflow-y-auto origin-bottom sm:origin-center bg-zinc-900 border border-zinc-700 rounded-2xl p-6 pb-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Eliminar movimiento</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-zinc-400 text-sm mb-6">
          ¿Estás seguro de que querés eliminar <span className="text-white font-medium">&quot;{concepto}&quot;</span>? Esta acción no se puede deshacer.
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
