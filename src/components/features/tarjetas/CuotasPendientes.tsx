'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Tarjeta } from '@/app/actions/tarjetas'
import type { Transaccion } from '@/types'

const ESTILOS: Record<string, string> = {
  orange: 'bg-gradient-to-b from-orange-400 to-pink-500',
  dark: 'bg-gradient-to-b from-zinc-600 to-zinc-700',
  blue: 'bg-gradient-to-b from-blue-500 to-indigo-600',
}

export interface CuotaItem {
  detalle: string
  total: number
  cuotaActual: number
  cuotasTotales: number
  montoCuota: number
  finMeses: number
  transaccionOriginal: Transaccion
}

interface CuotasPendientesProps {
  tarjetas: Tarjeta[]
  cuotasPorTarjeta: Record<string, CuotaItem[]>
  onEditarCuota: (c: CuotaItem) => void
  onEliminarCuota: (c: CuotaItem) => void
}

export function CuotasPendientes({
  tarjetas,
  cuotasPorTarjeta,
  onEditarCuota,
  onEliminarCuota,
}: CuotasPendientesProps) {
  const items: { tarjeta: Tarjeta | null; cuota: CuotaItem }[] = []

  for (const tarjeta of tarjetas) {
    const cuotas = cuotasPorTarjeta[tarjeta.id] || []
    for (const c of cuotas) {
      items.push({ tarjeta, cuota: c })
    }
  }

  const sinTarjeta = cuotasPorTarjeta['sin-tarjeta'] || []
  for (const c of sinTarjeta) {
    items.push({ tarjeta: null, cuota: c })
  }

  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 overflow-hidden">
      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-5 pt-4 pb-2">
        Cuotas Pendientes
      </h4>
      <div className="divide-y divide-zinc-800">
        {items.map(({ tarjeta, cuota }) => {
          const barra = tarjeta ? ESTILOS[tarjeta.estilo || 'orange'] || ESTILOS.orange : ESTILOS.orange
          const nombre = tarjeta?.nombre ?? cuota.detalle
          return (
            <div
              key={cuota.transaccionOriginal.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={`w-1 h-12 rounded-full shrink-0 self-stretch sm:self-auto ${barra}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white break-words">{nombre}</p>
                  <p className="text-xs text-zinc-500">
                    {cuota.cuotasTotales - cuota.cuotaActual} cuotas restantes
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto shrink-0 border-t border-zinc-800/50 pt-3 sm:border-0 sm:pt-0">
                <div className="w-full text-left sm:text-right sm:min-w-[140px]">
                  <p className="font-bold text-white">$ {cuota.montoCuota.toLocaleString('es-AR')} / mes</p>
                  <p className="text-xs text-rose-400">Total: $ {cuota.total.toLocaleString('es-AR')}</p>
                </div>
                <div className="flex items-center justify-end gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditarCuota(cuota)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Editar compra / cuotas"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEliminarCuota(cuota)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    title="Eliminar plan de cuotas"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
