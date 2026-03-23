'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, BarChart3, Activity } from 'lucide-react'

type VistaGrafico = 'linea' | 'velas' | 'area'

type TransaccionChart = { monto: number; tipo: 'ingreso' | 'gasto'; created_at: string }

type PuntoCandlestick = { open: number; high: number; low: number; close: number }

function procesarTransacciones(
  transacciones: TransaccionChart[],
  ultimoDiaMes: number
): PuntoCandlestick[] {
  // Balance acumulado por día (día 1 = índice 0)
  const netoPorDia = new Map<number, number>()
  for (let d = 1; d <= ultimoDiaMes; d++) netoPorDia.set(d, 0)

  for (const t of transacciones) {
    const dia = new Date(t.created_at).getDate()
    const delta = t.tipo === 'ingreso' ? t.monto : -t.monto
    netoPorDia.set(dia, (netoPorDia.get(dia) ?? 0) + delta)
  }

  // Balance acumulado diario
  const balances: number[] = []
  let acum = 0
  for (let d = 1; d <= ultimoDiaMes; d++) {
    acum += netoPorDia.get(d) ?? 0
    balances.push(acum)
  }

  if (balances.length === 0) return []

  // Agrupar en semanas (~5 períodos)
  const nPeriodos = 5
  const ptsPorPeriodo = Math.ceil(balances.length / nPeriodos)
  const periodos: PuntoCandlestick[] = []

  for (let p = 0; p < nPeriodos; p++) {
    const start = p * ptsPorPeriodo
    const end = Math.min(start + ptsPorPeriodo, balances.length)
    const slice = balances.slice(start, end)
    if (slice.length === 0) continue
    const open = p === 0 ? 0 : balances[Math.max(0, start - 1)]
    const close = slice[slice.length - 1]
    const high = Math.max(open, close, ...slice)
    const low = Math.min(open, close, ...slice)
    periodos.push({ open, high, low, close })
  }

  if (periodos.length === 0) {
    const cierre = balances[balances.length - 1] ?? 0
    return [{ open: 0, high: Math.max(0, cierre), low: Math.min(0, cierre), close: cierre }]
  }
  return periodos
}

const OPCIONES_VISTA: { valor: VistaGrafico; etiqueta: string; icono: typeof TrendingUp }[] = [
  { valor: 'linea', etiqueta: 'Línea', icono: TrendingUp },
  { valor: 'velas', etiqueta: 'Velas', icono: BarChart3 },
  { valor: 'area', etiqueta: 'Área', icono: Activity },
]

export function DashboardGrafico({
  transacciones = [],
  ultimoDiaMes = new Date().getDate(),
}: {
  transacciones?: TransaccionChart[]
  ultimoDiaMes?: number
}) {
  const [vista, setVista] = useState<VistaGrafico>('linea')

  const datos = useMemo(() => {
    const pts = procesarTransacciones(transacciones, ultimoDiaMes)
    if (pts.length === 0) {
      return [{ open: 0, high: 0, low: 0, close: 0 }]
    }
    return pts
  }, [transacciones, ultimoDiaMes])

  const { bars, trendPath, areaPath, width, height, saldoCierre } = useMemo(() => {
    const w = 280
    const h = 140
    const padding = { top: 12, right: 8, bottom: 20, left: 8 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    const vals = datos.flatMap((d) => [d.open, d.high, d.low, d.close])
    const minVal = Math.min(...vals, 0) - 5
    const maxVal = Math.max(...vals, 0) + 5
    const range = Math.max(maxVal - minVal, 1)

    const n = Math.max(datos.length - 1, 1)
    const x = (i: number) => padding.left + (i / n) * chartW
    const y = (v: number) => padding.top + chartH - ((v - minVal) / range) * chartH

    const bars = datos.map((d, i) => {
      const isUp = d.close >= d.open
      const bodyTop = Math.min(d.open, d.close)
      const bodyBottom = Math.max(d.open, d.close)
      const bodyH = ((bodyBottom - bodyTop) / range) * chartH || 2
      const bodyY = y(bodyBottom)
      const wickTop = y(d.high)
      const wickBottom = y(d.low)
      const cx = x(i)
      const bodyW = Math.max(8, chartW / Math.max(datos.length, 1) - 4)
      return {
        x: cx - bodyW / 2,
        y: bodyY,
        w: bodyW,
        h: bodyH,
        wickTop,
        wickBottom,
        isUp,
        cx,
      }
    })

    const trendPoints = datos.map((d, i) => `${x(i)},${y(d.close)}`)
    const trendPath = trendPoints.length === 1
      ? `M ${x(0)},${y(0)} L ${trendPoints[0]}`
      : `M ${trendPoints.join(' L ')}`

    const baseY = padding.top + chartH
    const lastX = x(datos.length - 1)
    const firstX = x(0)
    const areaPath = trendPoints.length === 1
      ? `M ${firstX},${y(0)} L ${trendPoints[0]} L ${lastX},${baseY} L ${firstX},${baseY} Z`
      : `M ${trendPoints[0]} L ${trendPoints.slice(1).join(' L ')} L ${lastX},${baseY} L ${firstX},${baseY} Z`

    const saldoCierre = datos[datos.length - 1]?.close ?? 0

    return {
      bars,
      trendPath,
      areaPath,
      width: w,
      height: h,
      saldoCierre,
    }
  }, [datos])

  return (
    <div className="relative bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden p-4 min-h-[220px] flex flex-col md:col-span-2">
      {/* Grid sutil de fondo */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(63 63 70) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(63 63 70) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-4 mb-3">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          Evolución del mes
        </h3>
        <div className="flex gap-1 p-0.5 bg-zinc-900/80 rounded-lg border border-zinc-700/50">
          {OPCIONES_VISTA.map((op) => {
            const Icon = op.icono
            return (
              <button
                key={op.valor}
                type="button"
                onClick={() => setVista(op.valor)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  vista === op.valor
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
                title={op.etiqueta}
              >
                <Icon size={14} />
                {op.etiqueta}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative flex-1 min-h-[140px]" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.3))' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(52,211,153)" stopOpacity="1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Área (solo en vista área) */}
          {vista === 'area' && (
            <path
              d={areaPath}
              fill="url(#trendGradient)"
              fillOpacity="0.25"
              stroke="none"
            />
          )}

          {/* Línea de tendencia (visible en línea y área) */}
          {(vista === 'linea' || vista === 'area') && (
            <path
              d={trendPath}
              fill="none"
              stroke="url(#trendGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Candlesticks (solo en vista velas) */}
          {vista === 'velas' && bars.map((bar, i) => (
            <g key={i}>
              {/* Wick */}
              <line
                x1={bar.cx}
                y1={bar.wickTop}
                x2={bar.cx}
                y2={bar.wickBottom}
                stroke={bar.isUp ? 'rgb(52,211,153)' : 'rgb(248,113,113)'}
                strokeWidth="1.2"
                opacity="0.9"
              />
              {/* Body */}
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.w}
                height={Math.max(bar.h, 2)}
                fill={bar.isUp ? 'rgb(52,211,153)' : 'rgb(248,113,113)'}
                rx="1"
                opacity="0.95"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800 relative z-10">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Saldo al cierre</p>
        <span className={`font-bold font-mono text-lg ${saldoCierre >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {saldoCierre >= 0 ? '+' : ''}${saldoCierre.toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  )
}
