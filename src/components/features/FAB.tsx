'use client'

import { ScanSearch, ArrowUpRight, ArrowDownRight, Bot } from 'lucide-react'

interface FABProps {
  onEscanear: () => void
  onGasto: () => void
  onIngreso: () => void
  onAsistente?: () => void
}

export function FAB({ onEscanear, onGasto, onIngreso, onAsistente }: FABProps) {
  const acciones = [
    ...(onAsistente ? [{ onClick: onAsistente, icon: Bot, label: 'Asistente IA', hover: 'hover:text-violet-400' }] : []),
    { onClick: onEscanear, icon: ScanSearch, label: 'Escanear', hover: 'hover:text-indigo-400' },
    { onClick: onGasto, icon: ArrowUpRight, label: 'Gasto', hover: 'hover:text-rose-400' },
    { onClick: onIngreso, icon: ArrowDownRight, label: 'Ingreso', hover: 'hover:text-emerald-400' },
  ]

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-40">
      <div className="flex items-center gap-0.5 bg-zinc-800/95 backdrop-blur-xl rounded-full border border-zinc-600/50 shadow-xl shadow-black/40 py-1.5 px-2">
        {acciones.map((acc) => {
          const Icon = acc.icon
          return (
            <button
              key={acc.label}
              type="button"
              onClick={acc.onClick}
              className={`flex items-center justify-center w-11 h-11 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-all duration-200 ${acc.hover}`}
              aria-label={acc.label}
              title={acc.label}
            >
              <Icon size={21} strokeWidth={2.5} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
