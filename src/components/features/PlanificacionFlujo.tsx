'use client'

import { ArrowRight, Sparkles } from 'lucide-react'

const formatMonto = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

function diasParaFinDeMes(mesParam: string): number {
  const [y, m] = mesParam.split('-').map(Number)
  const hoy = new Date()
  const esMesActual = y === hoy.getFullYear() && m === hoy.getMonth() + 1 // mesParam es YYYY-MM (m 1-12)
  if (!esMesActual) {
    const ultimo = new Date(y, m, 0)
    return ultimo.getDate()
  }
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  const msPorDia = 1000 * 60 * 60 * 24
  return Math.max(1, Math.ceil((ultimoDia.getTime() - hoy.getTime()) / msPorDia))
}

type Props = {
  totalIngresos: number
  totalGastosFijos: number
  totalPresupuestado: number
  metaAhorroGuardada: number
  mesParam: string
}

export function PlanificacionFlujo({
  totalIngresos,
  totalGastosFijos,
  totalPresupuestado,
  metaAhorroGuardada,
  mesParam,
}: Props) {
  const totalFijosNeto = totalIngresos - totalGastosFijos
  const margenAntesMeta = totalFijosNeto - totalPresupuestado
  const margenFinal = margenAntesMeta - metaAhorroGuardada
  const diasRestantes = diasParaFinDeMes(mesParam)
  const gastoDiarioVariables = margenFinal > 0 && diasRestantes > 0 ? margenFinal / diasRestantes : 0
  const gastoSemanalVariables = gastoDiarioVariables * 7

  const maxVal = Math.max(totalIngresos, 1)
  const pctFijos = (totalGastosFijos / maxVal) * 100
  const pctVariables = (totalPresupuestado / maxVal) * 100
  const pctMeta = (metaAhorroGuardada / maxVal) * 100
  const pctResto = Math.max(0, 100 - pctFijos - pctVariables - pctMeta)

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% 0%, rgb(34 211 238), transparent)`,
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Flujo de tu dinero</h3>
        </div>

        {/* Barra visual del flujo */}
        <div className="h-4 rounded-full overflow-hidden flex bg-zinc-800/80 border border-zinc-700/50 mb-6">
          {totalGastosFijos > 0 && (
            <div
              className="bg-rose-500/80 hover:bg-rose-500 transition-colors min-w-[2px]"
              style={{ width: `${Math.min(pctFijos, 100)}%` }}
              title={`Fijos: ${formatMonto(totalGastosFijos)}`}
            />
          )}
          {totalPresupuestado > 0 && (
            <div
              className="bg-violet-500/80 hover:bg-violet-500 transition-colors min-w-[2px]"
              style={{ width: `${Math.min(pctVariables, 100)}%` }}
              title={`Variables: ${formatMonto(totalPresupuestado)}`}
            />
          )}
          {metaAhorroGuardada > 0 && (
            <div
              className="bg-teal-500/80 hover:bg-teal-500 transition-colors min-w-[2px]"
              style={{ width: `${Math.min(pctMeta, 100)}%` }}
              title={`Meta ahorro: ${formatMonto(metaAhorroGuardada)}`}
            />
          )}
          {pctResto > 0 && (
            <div
              className="bg-emerald-500/80 hover:bg-emerald-500 transition-colors min-w-[2px]"
              style={{ width: `${pctResto}%` }}
              title={`Disponible: ${formatMonto(margenFinal)}`}
            />
          )}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500 mb-6">
          {totalGastosFijos > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Fijos: {formatMonto(totalGastosFijos)}
            </span>
          )}
          {totalPresupuestado > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" /> Variables: {formatMonto(totalPresupuestado)}
            </span>
          )}
          {metaAhorroGuardada > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" /> Meta ahorro: {formatMonto(metaAhorroGuardada)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Disponible: {formatMonto(margenFinal)}
          </span>
        </div>

        {/* Insight neon */}
        {gastoDiarioVariables > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-cyan-500/20">
            <ArrowRight size={20} className="text-cyan-400 shrink-0" />
            <p className="text-sm text-zinc-400">
              Podés gastar hasta{' '}
              <span
                className="text-cyan-300 font-bold [text-shadow:0_0_8px_rgba(34,211,238,0.9),0_0_20px_rgba(34,211,238,0.5)]"
              >
                {formatMonto(gastoDiarioVariables)}
              </span>
              /día y{' '}
              <span
                className="text-cyan-300 font-bold [text-shadow:0_0_8px_rgba(34,211,238,0.9),0_0_20px_rgba(34,211,238,0.5)]"
              >
                {formatMonto(gastoSemanalVariables)}
              </span>
              /semana en variables
              <span className="text-zinc-600 ml-1">({diasRestantes} días restantes)</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
