'use client'

import { MoreVertical, CreditCard, Plus } from 'lucide-react'
import type { Tarjeta } from '@/app/actions/tarjetas'

const ESTILOS: Record<string, string> = {
  orange: 'from-orange-400 to-pink-500',
  dark: 'from-zinc-700 to-zinc-800',
  blue: 'from-blue-500 to-indigo-600',
}

interface CardTarjetaCreditoProps {
  tarjeta: Tarjeta
  deudaEnCuotas: number
  onMenu?: (e: React.MouseEvent) => void
}

export function CardTarjetaCredito({ tarjeta, deudaEnCuotas, onMenu }: CardTarjetaCreditoProps) {
  const gradiente = ESTILOS[tarjeta.estilo || 'orange'] || ESTILOS.orange
  const ultimos = tarjeta.ultimos_digitos != null ? String(tarjeta.ultimos_digitos).padStart(4, '0') : '••••'
  const banco = tarjeta.banco || ''

  return (
    <div
      className={`relative w-[280px] min-w-[280px] h-[160px] rounded-2xl bg-gradient-to-br ${gradiente} p-5 flex flex-col justify-between text-white shadow-xl`}
    >
      <div className="flex justify-between items-start">
        <div>
          {banco && <p className="text-xs font-semibold opacity-90">{banco}</p>}
          <p className="text-lg font-bold">{tarjeta.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="opacity-70" />
          <button
            type="button"
            onClick={onMenu}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Opciones"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
      <p className="font-mono text-lg tracking-widest">•••• •••• •••• {ultimos}</p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold uppercase opacity-80">Deuda en cuotas</p>
          <p className="text-xl font-black">$ {deudaEnCuotas.toLocaleString('es-AR')}</p>
        </div>
      </div>
    </div>
  )
}

export function CardNuevaTarjeta({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[280px] min-w-[280px] h-[160px] rounded-2xl border-2 border-dashed border-zinc-600 hover:border-zinc-500 bg-zinc-900/50 flex flex-col items-center justify-center gap-2 transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
        <Plus size={24} className="text-zinc-400" />
      </div>
      <span className="text-sm font-bold text-zinc-400">Nueva Tarjeta</span>
    </button>
  )
}
