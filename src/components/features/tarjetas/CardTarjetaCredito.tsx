'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, CreditCard, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Tarjeta } from '@/app/actions/tarjetas'

const ESTILOS: Record<string, string> = {
  orange: 'from-orange-400 to-pink-500',
  dark: 'from-zinc-700 to-zinc-800',
  blue: 'from-blue-500 to-indigo-600',
}

interface CardTarjetaCreditoProps {
  tarjeta: Tarjeta
  deudaEnCuotas: number
  onEditar?: (tarjeta: Tarjeta) => void
  onEliminar?: (tarjeta: Tarjeta) => void
}

export function CardTarjetaCredito({ tarjeta, deudaEnCuotas, onEditar, onEliminar }: CardTarjetaCreditoProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  const gradiente = ESTILOS[tarjeta.estilo || 'orange'] || ESTILOS.orange
  const ultimos = tarjeta.ultimos_digitos != null ? String(tarjeta.ultimos_digitos).padStart(4, '0') : '••••'
  const banco = tarjeta.banco || ''
  const hayAcciones = onEditar || onEliminar

  return (
    <div
      className={`relative w-[280px] min-w-[280px] h-[160px] rounded-2xl bg-gradient-to-br ${gradiente} p-5 flex flex-col justify-between text-white shadow-xl`}
    >
      <div className="flex justify-between items-start gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          {banco && <p className="text-xs font-semibold opacity-90 truncate">{banco}</p>}
          <p className="text-lg font-bold truncate">{tarjeta.nombre}</p>
        </div>
        <div className="relative flex items-center gap-2 shrink-0" ref={menuRef}>
          <CreditCard size={18} className="opacity-70" />
          {hayAcciones && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
                className="p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Opciones"
              >
                <MoreVertical size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 min-w-[140px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50">
                  {onEditar && (
                    <button
                      type="button"
                      onClick={() => { onEditar(tarjeta); setMenuOpen(false) }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                  )}
                  {onEliminar && (
                    <button
                      type="button"
                      onClick={() => { onEliminar(tarjeta); setMenuOpen(false) }}
                      className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  )}
                </div>
              )}
            </>
          )}
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
