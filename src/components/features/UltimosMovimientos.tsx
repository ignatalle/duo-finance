'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Receipt, ChevronRight } from 'lucide-react'
import type { Transaccion } from '@/types'

const formatearMonto = (monto: number) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(monto)

export function UltimosMovimientos({ transacciones }: { transacciones: Transaccion[] }) {
  const ultimos = transacciones.slice(0, 5)

  if (ultimos.length === 0) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 mb-3">
          <Receipt size={16} />
          Últimos movimientos
        </h3>
        <p className="text-sm text-zinc-500 py-4">Sin movimientos este mes.</p>
        <Link
          href="/dashboard/movimientos"
          className="text-teal-400 hover:text-teal-300 text-sm font-medium flex items-center gap-1"
        >
          Ver movimientos <ChevronRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
          <Receipt size={16} />
          Últimos movimientos
        </h3>
        <Link
          href="/dashboard/movimientos"
          className="text-teal-400 hover:text-teal-300 text-xs font-medium flex items-center gap-0.5"
        >
          Ver todos <ChevronRight size={12} />
        </Link>
      </div>
      <ul className="space-y-2">
        {ultimos.map((t, i) => {
          const concepto = t.descripcion || t.categoria
          return (
            <li
              key={t.id ?? `mov-${i}-${t.created_at}`}
              className="flex items-center justify-between gap-2 py-2 border-b border-zinc-800/80 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{concepto}</p>
                <p className="text-xs text-zinc-500">
                  {format(new Date(t.created_at), "d MMM", { locale: es })}
                </p>
              </div>
              <span
                className={`text-sm font-semibold shrink-0 ${
                  t.tipo === 'ingreso' ? 'text-teal-400' : 'text-zinc-300'
                }`}
              >
                {t.tipo === 'ingreso' ? '+' : '-'} $ {formatearMonto(Number(t.monto))}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
