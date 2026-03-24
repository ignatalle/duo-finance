'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Target, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Estrategia = 'clasica' | 'baseCero' | 'proteccionInflacionaria'

const ESTRATEGIAS = [
  { id: 'clasica' as Estrategia, label: 'Clásica (50/30/20)' },
  { id: 'baseCero' as Estrategia, label: 'Base Cero (Estable)' },
  { id: 'proteccionInflacionaria' as Estrategia, label: 'Protección Inflacionaria (Modo ARG)' },
]

function getBarColor(index: number, ratio: number): string {
  if (ratio >= 1) return 'bg-rose-500'
  if (ratio >= 0.8) return 'bg-amber-500'
  const colors = ['bg-blue-500', 'bg-fuchsia-500', 'bg-emerald-500']
  return colors[index] || 'bg-emerald-500'
}

export function PlanificacionPresupuestoCard({
  margenLibre,
  consumoVariables = 0,
  consumoEstilo = 0,
  consumoAhorro = 0,
}: {
  margenLibre: number
  consumoVariables?: number
  consumoEstilo?: number
  consumoAhorro?: number
}) {
  const [estrategia, setEstrategia] = useState<Estrategia>('clasica')
  const [baseCeroVars, setBaseCeroVars] = useState(0)
  const [baseCeroEstilo, setBaseCeroEstilo] = useState(0)
  const [baseCeroAhorro, setBaseCeroAhorro] = useState(0)

  const { variables, estilo, ahorro, labelAhorro } = useMemo(() => {
    switch (estrategia) {
      case 'clasica':
        return {
          variables: margenLibre * 0.5,
          estilo: margenLibre * 0.3,
          ahorro: margenLibre * 0.2,
          labelAhorro: '20% Ahorro e Inversión',
        }
      case 'proteccionInflacionaria':
        return {
          variables: margenLibre * 0.4,
          estilo: margenLibre * 0.4,
          ahorro: margenLibre * 0.2,
          labelAhorro: 'Fondo de Liquidez / Conversión a USDT',
        }
      case 'baseCero':
        return {
          variables: baseCeroVars,
          estilo: baseCeroEstilo,
          ahorro: baseCeroAhorro,
          labelAhorro: 'Ahorro Inmediato',
        }
      default:
        return { variables: 0, estilo: 0, ahorro: 0, labelAhorro: '' }
    }
  }, [estrategia, margenLibre, baseCeroVars, baseCeroEstilo, baseCeroAhorro])

  const porAsignar = margenLibre - (baseCeroVars + baseCeroEstilo + baseCeroAhorro)
  const baseCeroExcede = estrategia === 'baseCero' && porAsignar < 0

  const ratioV = variables > 0 ? consumoVariables / variables : 0
  const ratioE = estilo > 0 ? consumoEstilo / estilo : 0
  const ratioA = ahorro > 0 ? consumoAhorro / ahorro : 0

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-amber-400 shrink-0" />
        <div className="relative flex-1">
          <select
            value={estrategia}
            onChange={(e) => setEstrategia(e.target.value as Estrategia)}
            className="w-full bg-zinc-800/80 border border-zinc-600 rounded-lg pl-3 pr-8 py-2 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
          >
            {ESTRATEGIAS.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {estrategia === 'baseCero' && (
        <p className={cn(
          'text-sm font-bold mb-4',
          baseCeroExcede ? 'text-rose-400' : 'text-zinc-400'
        )}>
          Por asignar: ${Math.abs(porAsignar).toLocaleString('es-AR')}
        </p>
      )}

      {estrategia !== 'baseCero' && (
        <p className="text-sm text-zinc-400 mb-6">
          Sobre tu margen libre de ${margenLibre.toLocaleString('es-AR')}, sugerimos:
        </p>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline text-sm mb-2">
            <span className="text-zinc-200 font-medium min-w-0 break-words">
              {estrategia === 'clasica' ? '50%' : estrategia === 'proteccionInflacionaria' ? '40%' : ''} Gastos Variables (Comida, nafta)
            </span>
            {estrategia === 'baseCero' ? (
              <input
                type="number"
                value={baseCeroVars || ''}
                onChange={(e) => setBaseCeroVars(parseFloat(e.target.value) || 0)}
                placeholder="0"
                min={0}
                className="w-full max-w-[7rem] shrink-0 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            ) : (
              <span className="text-white font-bold shrink-0 tabular-nums">${variables.toLocaleString('es-AR')}</span>
            )}
          </div>
          <ProgressBar
            current={consumoVariables}
            max={variables || 1}
            colorClass={getBarColor(0, ratioV)}
            heightClass="h-3"
          />
        </div>
        <div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline text-sm mb-2">
            <span className="text-zinc-200 font-medium min-w-0 break-words">
              {estrategia === 'clasica' ? '30%' : estrategia === 'proteccionInflacionaria' ? '40%' : ''} Estilo de Vida (Salidas, gustos)
            </span>
            {estrategia === 'baseCero' ? (
              <input
                type="number"
                value={baseCeroEstilo || ''}
                onChange={(e) => setBaseCeroEstilo(parseFloat(e.target.value) || 0)}
                placeholder="0"
                min={0}
                className="w-full max-w-[7rem] shrink-0 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            ) : (
              <span className="text-white font-bold shrink-0 tabular-nums">${estilo.toLocaleString('es-AR')}</span>
            )}
          </div>
          <ProgressBar
            current={consumoEstilo}
            max={estilo || 1}
            colorClass={getBarColor(1, ratioE)}
            heightClass="h-3"
          />
        </div>
        <div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-baseline text-sm mb-2">
            <span className="text-zinc-200 font-medium flex flex-wrap items-center gap-1 min-w-0">
              <Target size={14} className="text-emerald-400 shrink-0" />
              <span className="break-words">{estrategia === 'clasica' ? '20%' : ''} {labelAhorro}</span>
            </span>
            {estrategia === 'baseCero' ? (
              <input
                type="number"
                value={baseCeroAhorro || ''}
                onChange={(e) => setBaseCeroAhorro(parseFloat(e.target.value) || 0)}
                placeholder="0"
                min={0}
                className="w-full max-w-[7rem] shrink-0 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            ) : (
              <span className="text-emerald-400 font-bold shrink-0 tabular-nums">${ahorro.toLocaleString('es-AR')}</span>
            )}
          </div>
          <ProgressBar
            current={consumoAhorro}
            max={ahorro || 1}
            colorClass={getBarColor(2, ratioA)}
            heightClass="h-3"
          />
        </div>
      </div>
    </Card>
  )
}
