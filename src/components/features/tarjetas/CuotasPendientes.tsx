'use client'

import type { Tarjeta } from '@/app/actions/tarjetas'

const ESTILOS: Record<string, string> = {
  orange: 'bg-gradient-to-b from-orange-400 to-pink-500',
  dark: 'bg-gradient-to-b from-zinc-600 to-zinc-700',
  blue: 'bg-gradient-to-b from-blue-500 to-indigo-600',
}

interface CuotaItem {
  detalle: string
  total: number
  cuotaActual: number
  cuotasTotales: number
  montoCuota: number
  finMeses: number
}

interface CuotasPendientesProps {
  tarjetas: Tarjeta[]
  cuotasPorTarjeta: Record<string, CuotaItem[]>
}

export function CuotasPendientes({ tarjetas, cuotasPorTarjeta }: CuotasPendientesProps) {
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
        {items.map(({ tarjeta, cuota }, i) => {
          const barra = tarjeta ? ESTILOS[tarjeta.estilo || 'orange'] || ESTILOS.orange : ESTILOS.orange
          const nombre = tarjeta?.nombre ?? cuota.detalle
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/30 transition-colors">
              <div className={`w-1 h-12 rounded-full shrink-0 ${barra}`} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">{nombre}</p>
                <p className="text-xs text-zinc-500">
                  {cuota.cuotasTotales - cuota.cuotaActual} cuotas restantes
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-white">$ {cuota.montoCuota.toLocaleString('es-AR')} / mes</p>
                <p className="text-xs text-rose-400">Total: $ {cuota.total.toLocaleString('es-AR')}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
