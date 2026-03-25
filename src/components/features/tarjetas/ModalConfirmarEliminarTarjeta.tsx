'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Trash2 } from 'lucide-react'
import { eliminarTarjeta } from '@/app/actions/tarjetas'

interface ModalConfirmarEliminarTarjetaProps {
  tarjetaNombre: string
  tarjetaId: string
  onClose: () => void
}

export function ModalConfirmarEliminarTarjeta({ tarjetaNombre, tarjetaId, onClose }: ModalConfirmarEliminarTarjetaProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleEliminar = () => {
    startTransition(async () => {
      const result = await eliminarTarjeta(tarjetaId)
      if (result?.success) {
        onClose()
        router.refresh()
      } else {
        alert(result?.error || 'No se pudo eliminar')
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm max-h-[85dvh] overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 p-6 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Eliminar tarjeta</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-zinc-400 text-sm mb-6">
          ¿Estás seguro? Se eliminará <span className="text-white font-medium">&quot;{tarjetaNombre}&quot;</span> y todas las transacciones y cuotas vinculadas a esta tarjeta.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-zinc-600 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleEliminar}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <><Trash2 size={18} /> Eliminar</>}
          </button>
        </div>
      </div>
    </>
  )
}
