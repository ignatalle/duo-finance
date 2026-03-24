'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PieChart, Settings, Zap, Pencil, Trash2 } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AlertTriangle } from 'lucide-react'
import { ModalConfirmarEliminarPresupuesto } from './ModalConfirmarEliminarPresupuesto'
interface PlanificacionVariablesProps {
  presupuestos: { id: string; categoria: string; limite_mensual: number }[]
  consumoPorCategoria: Record<string, number>
  mesParam?: string
}

const SUGERENCIAS = [
  '🛒 Supermercado',
  '🍔 Comida / Delivery',
  '🎬 Entretenimiento',
  '🚗 Transporte / Nafta',
  '⚕️ Salud / Farmacia',
]

export function PlanificacionVariables({ presupuestos, consumoPorCategoria, mesParam = '' }: PlanificacionVariablesProps) {
  const [eliminarId, setEliminarId] = useState<string | null>(null)
  const baseConfig = mesParam ? `mes=${mesParam}&config=limites` : 'config=limites'
  const configUrl = `/dashboard/gastos?${baseConfig}`

  const urlConCategoria = (cat: string) =>
    `/dashboard/gastos?${baseConfig}&cat=${encodeURIComponent(cat)}`

  const urlEditar = (id: string, cat: string) =>
    `/dashboard/gastos?${baseConfig}&edit=${id}&cat=${encodeURIComponent(cat)}`

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

        <div className="flex-1 flex flex-col justify-center py-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 flex items-center justify-center mb-4 border border-violet-500/30">
              <Zap size={28} className="text-violet-400" />
            </div>
            <p className="text-white font-semibold mb-1">Empezá con una categoría</p>
            <p className="text-zinc-500 text-sm mb-4">Tocá una para configurar tu primer límite</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGERENCIAS.map((cat) => (
              <Link
                key={cat}
                href={urlConCategoria(cat)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-violet-500/20 border border-zinc-700 hover:border-violet-500/40 text-zinc-300 hover:text-violet-300 text-sm font-medium transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
          <p className="text-center text-zinc-500 text-xs mt-4">
            o{' '}
            <Link href={configUrl} className="text-violet-400 hover:underline font-medium">
              configurar todos
            </Link>
          </p>
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
            <div key={p.id} className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{p.categoria}</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    ${consumido.toLocaleString('es-AR')}{' '}
                    <span className="text-zinc-500 font-normal">/ ${p.limite_mensual.toLocaleString('es-AR')}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={urlEditar(p.id, p.categoria)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEliminarId(p.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
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

      {eliminarId && (
        <ModalConfirmarEliminarPresupuesto
          presupuestoId={eliminarId}
          categoria={presupuestos.find((p) => p.id === eliminarId)?.categoria || ''}
          onClose={() => setEliminarId(null)}
        />
      )}

      <Link
        href={configUrl}
        className="mt-4 block w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-violet-400 font-semibold text-sm text-center transition-colors"
      >
        Configurar límites
      </Link>
    </div>
  )
}
