'use client'

import Link from 'next/link'
import { PieChart, Settings, Activity } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AlertTriangle } from 'lucide-react'
interface PlanificacionVariablesProps {
  presupuestos: { id: string; categoria: string; limite_mensual: number }[]
  consumoPorCategoria: Record<string, number>
  mesParam?: string
}

export function PlanificacionVariables({ presupuestos, consumoPorCategoria, mesParam = '' }: PlanificacionVariablesProps) {
  const configUrl = mesParam ? `/dashboard/gastos?mes=${mesParam}&config=limites` : '/dashboard/gastos?config=limites'

  if (presupuestos.length === 0) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <PieChart size={20} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Variables</h3>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Límites y presupuestos</p>
            </div>
          </div>
          <Link
            href={configUrl}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Configuración"
          >
            <Settings size={18} />
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <Activity size={28} className="text-zinc-500" />
          </div>
          <p className="text-white font-medium mb-1">¿Cuánto estimás gastar en comida o salidas?</p>
          <p className="text-zinc-500 text-sm mb-6">Configurá tus topes mensuales</p>
          <Link
            href={configUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-violet-400 font-semibold text-sm transition-colors"
          >
            Configurar límites
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <PieChart size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Variables</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Límites y presupuestos</p>
          </div>
        </div>
        <Link
          href={configUrl}
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Configuración"
        >
          <Settings size={18} />
        </Link>
      </div>

      <div className="space-y-4">
        {presupuestos.map((p) => {
          const consumido = consumoPorCategoria[p.categoria] || 0
          const porcentaje = p.limite_mensual > 0 ? (consumido / p.limite_mensual) * 100 : 0
          const isWarning = porcentaje > 85
          return (
            <div key={p.id} className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-zinc-200">{p.categoria}</p>
                <p className="text-sm font-bold text-white">
                  ${consumido.toLocaleString('es-AR')}{' '}
                  <span className="text-zinc-500 font-normal">/ ${p.limite_mensual.toLocaleString('es-AR')}</span>
                </p>
              </div>
              <ProgressBar
                current={consumido}
                max={p.limite_mensual}
                colorClass={isWarning ? 'bg-rose-500' : 'bg-violet-500'}
                heightClass="h-2.5"
              />
              {isWarning && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1 font-medium">
                  <AlertTriangle size={12} /> Estás llegando al límite mensual
                </p>
              )}
            </div>
          )
        })}
      </div>

      <Link
        href={configUrl}
        className="mt-4 block w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-violet-400 font-semibold text-sm text-center transition-colors"
      >
        Configurar límites
      </Link>
    </div>
  )
}
