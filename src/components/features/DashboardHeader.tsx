'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useDashboardModal } from '@/components/dashboard/DashboardModalContext'

export function DashboardHeader({ userName }: { userName?: string }) {
  const modal = useDashboardModal()
  const nombre = userName || 'Usuario'

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Hola, {nombre}</h2>
        <p className="text-zinc-400 mt-1">Resumen de tu dinero al día de hoy.</p>
      </div>
      {modal && (
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={modal.openIngreso}
            className="flex-1 md:flex-none bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDownRight size={18} /> Ingreso
          </button>
          <button
            onClick={modal.openGasto}
            className="flex-1 md:flex-none bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ArrowUpRight size={18} /> Gasto
          </button>
        </div>
      )}
    </div>
  )
}
