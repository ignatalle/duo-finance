'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useDashboardModal } from '@/components/dashboard/DashboardModalContext'
import { CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BotonExportar } from './BotonExportar'

function diasParaFinDeMes(): number {
  const hoy = new Date()
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  const msPorDia = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil((ultimoDia.getTime() - hoy.getTime()) / msPorDia))
}

export function MovimientosHeader({ mesParam }: { mesParam: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const modal = useDashboardModal()
  const diasRestantes = diasParaFinDeMes()

  const handleMesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoMes = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    params.set('mes', nuevoMes)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
              <CalendarDays size={18} className="text-zinc-400" />
              <input
                type="month"
                value={mesParam}
                onChange={handleMesChange}
                className="bg-transparent text-white font-semibold text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
            <BotonExportar mesActual={mesParam} />
          </div>
          <p className="text-zinc-400 text-sm">
            Faltan{' '}
            <span className="text-teal-400 font-semibold">
              {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}
            </span>{' '}
            para fin de mes.
          </p>
        </div>
        {modal && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => modal.openGasto()}
              className="flex items-center gap-2 bg-rose-500/90 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-rose-500/20"
            >
              <ArrowUpRight size={18} strokeWidth={2.5} /> Nuevo Gasto
            </button>
            <button
              type="button"
              onClick={() => modal.openIngreso()}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-zinc-900 font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-teal-500/20"
            >
              <ArrowDownRight size={18} strokeWidth={2.5} /> Nuevo Ingreso
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
