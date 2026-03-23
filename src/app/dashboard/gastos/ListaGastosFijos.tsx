'use client'

import { marcarComoPagado } from '@/app/actions/transacciones'
import { useTransition } from 'react'
import { Check } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Transaccion } from '@/types'
import { useToast } from '@/components/ui/Toast'

export function ListaGastosFijos({ gastos, usuarioId }: { gastos: Transaccion[]; usuarioId: string }) {
  const [isPending, startTransition] = useTransition()
  const toast = useToast()

  const handlePagar = (id: string, nombre: string) => {
    startTransition(async () => {
      await marcarComoPagado(id)
      toast.showToast(`Marcaste "${nombre}" como pagado.`)
    })
  }

  if (!gastos || gastos.length === 0) {
    return (
      <p className="text-zinc-500 text-sm py-4">No hay gastos fijos este mes.</p>
    )
  }

  return (
    <div className="space-y-2">
      {gastos.map((g) => {
        const pagado = g.estado === 'pagado'
        const vto = g.vencimiento_en
          ? format(new Date(g.vencimiento_en), "dd 'de' MMMM", { locale: es })
          : '-'
        return (
          <div
            key={g.id}
            className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => !pagado && handlePagar(g.id, g.descripcion || g.categoria)}
                disabled={pagado || isPending}
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  pagado ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-500 hover:border-indigo-400 cursor-pointer'
                }`}
              >
                {pagado && <Check size={14} className="text-white" />}
              </button>
              <div>
                <p className="text-white font-medium leading-none mb-1">{g.descripcion || g.categoria}</p>
                <p className="text-xs text-zinc-400">Vence: {vto}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">- $ {g.monto.toLocaleString('es-AR')}</p>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  pagado ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {pagado ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
