'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, CalendarDays } from 'lucide-react'
import { useDashboardModal } from '@/components/dashboard/DashboardModalContext'

function diasParaFinDeMes(): number {
  const hoy = new Date()
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  const msPorDia = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil((ultimoDia.getTime() - hoy.getTime()) / msPorDia))
}

export function DashboardHeader({ userName }: { userName?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const modal = useDashboardModal()
  const nombre = userName || 'Usuario'
  const mesActual = searchParams.get('mes') || new Date().toISOString().slice(0, 7)
  const diasRestantes = diasParaFinDeMes()
  const textoDias = diasRestantes === 0
    ? 'HOY ES EL ÚLTIMO DÍA DEL MES'
    : `FALTAN ${diasRestantes} ${diasRestantes === 1 ? 'DÍA' : 'DÍAS'} PARA FIN DE MES`

  const handleMesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoMes = e.target.value
    router.push(`${pathname}?mes=${nuevoMes}`)
  }

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
      <h2 className="text-2xl font-bold text-white tracking-tight">Hola, {nombre}</h2>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {modal && (
          <div className="flex gap-3">
            <button
              onClick={modal.openIngreso}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <ArrowUpRight size={18} /> Ingreso
            </button>
            <button
              onClick={modal.openGasto}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-rose-500 text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <ArrowDownRight size={18} /> Gasto
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
            <CalendarDays size={18} className="text-zinc-400" />
            <input
              type="month"
              value={mesActual}
              onChange={handleMesChange}
              className="bg-transparent text-white font-semibold text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider hidden sm:block">
            {textoDias}
          </p>
        </div>
      </div>

      <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider lg:hidden">
        {textoDias}
      </p>
    </header>
  )
}
