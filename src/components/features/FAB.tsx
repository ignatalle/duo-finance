'use client'

import { ScanSearch, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface FABProps {
  onEscanear: () => void
  onGasto: () => void
  onIngreso: () => void
}

export function FAB({ onEscanear, onGasto, onIngreso }: FABProps) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-40 flex gap-3">
      <button
        type="button"
        onClick={onEscanear}
        className="bg-indigo-600 hover:bg-indigo-500 text-white w-14 h-14 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-110 group relative"
        aria-label="Escanear ticket"
      >
        <ScanSearch size={24} strokeWidth={2.5} />
        <span className="absolute -top-10 bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700">
          Escanear Ticket
        </span>
      </button>
      <button
        type="button"
        onClick={onGasto}
        className="bg-rose-600 hover:bg-rose-500 text-white w-14 h-14 rounded-full shadow-lg shadow-rose-600/30 flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Nuevo gasto"
      >
        <ArrowUpRight size={24} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={onIngreso}
        className="bg-emerald-600 hover:bg-emerald-500 text-white w-14 h-14 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Nuevo ingreso"
      >
        <ArrowDownRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  )
}
