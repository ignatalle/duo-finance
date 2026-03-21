'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays } from 'lucide-react'

export function SelectorMes() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const mesActual = searchParams.get('mes') || new Date().toISOString().slice(0, 7)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoMes = e.target.value
    router.push(`/dashboard?mes=${nuevoMes}`)
  }

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-sm transition-all hover:border-slate-200">
      <CalendarDays size={18} className="text-indigo-500" />
      <input 
        type="month" 
        value={mesActual}
        onChange={handleChange}
        className="bg-transparent text-slate-800 font-bold text-sm focus:outline-none cursor-pointer outline-none"
      />
    </div>
  )
}
