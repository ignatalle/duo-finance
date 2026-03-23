'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays } from 'lucide-react'

function diasParaFinDeMes(): number {
  const hoy = new Date()
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  const msPorDia = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil((ultimoDia.getTime() - hoy.getTime()) / msPorDia))
}

export function SelectorMes() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const mesActual = searchParams.get('mes') || new Date().toISOString().slice(0, 7)
  const diasRestantes = diasParaFinDeMes()
  const textoDias = diasRestantes === 0
    ? 'Hoy es el último día del mes.'
    : `Faltan ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} para fin de mes.`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoMes = e.target.value
    router.push(`/dashboard?mes=${nuevoMes}`)
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-sm transition-all hover:border-slate-200">
        <CalendarDays size={18} className="text-indigo-500" />
        <input 
          type="month" 
          value={mesActual}
          onChange={handleChange}
          className="bg-transparent text-slate-800 font-bold text-sm focus:outline-none cursor-pointer outline-none"
        />
      </div>
      <p className="text-zinc-400 text-sm">{textoDias}</p>
    </div>
  )
}
