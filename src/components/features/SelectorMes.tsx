'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function SelectorMes() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Obtenemos el mes de la URL (ej: "2026-03"), o usamos el mes actual por defecto
  const mesActual = searchParams.get('mes') || new Date().toISOString().slice(0, 7)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoMes = e.target.value
    // Al cambiar la fecha, actualizamos la URL. Esto le avisa al servidor que debe traer nuevos datos.
    router.push(`/dashboard?mes=${nuevoMes}`)
  }

  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-xl w-fit shadow-sm">
      <label className="text-sm font-medium text-zinc-400">📅 Mes de visualización:</label>
      <input 
        type="month" 
        value={mesActual}
        onChange={handleChange}
        className="bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-green-500 focus:outline-none cursor-pointer hover:bg-zinc-700 transition-colors"
      />
    </div>
  )
}
