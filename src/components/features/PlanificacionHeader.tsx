'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { CalendarDays } from 'lucide-react'

function diasParaFinDeMes(): number {
  const hoy = new Date()
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  const msPorDia = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil((ultimoDia.getTime() - hoy.getTime()) / msPorDia))
}

export function PlanificacionHeader({ mesParam }: { mesParam: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const diasRestantes = diasParaFinDeMes()
  const textoDias = diasRestantes === 0
    ? 'HOY ES EL ÚLTIMO DÍA DEL MES'
    : `FALTAN ${diasRestantes} ${diasRestantes === 1 ? 'DÍA' : 'DÍAS'} PARA FIN DE MES`

  const handleMesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoMes = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    params.set('mes', nuevoMes)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Planificación Mensual</h2>
        <p className="text-zinc-500 text-sm mt-1">Gestioná tus fijos y presupuestos recurrentes.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
          <CalendarDays size={18} className="text-emerald-500" />
          <input
            type="month"
            value={mesParam}
            onChange={handleMesChange}
            className="bg-transparent text-white font-semibold text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
          />
        </div>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider hidden sm:block">
          {textoDias}
        </p>
      </div>
      <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider lg:hidden">
        {textoDias}
      </p>
    </div>
  )
}
