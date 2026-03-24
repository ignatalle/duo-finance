'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, BarChart3, Activity, PiggyBank } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { guardarMetaAhorroMensual } from '@/app/actions/metasAhorroMensual'

type VistaGrafico = 'linea' | 'velas' | 'area'

type TransaccionChart = { monto: number; tipo: 'ingreso' | 'gasto'; created_at: string }

type PuntoDia = {
  dia: number
  fechaLabel: string
  ingresos: number
  gastos: number
  neto: number
  saldoAcum: number
}

type PuntoCandlestick = { open: number; high: number; low: number; close: number; diaInicio: number; diaFin: number }

function procesarTransacciones(
  transacciones: TransaccionChart[],
  ultimoDiaMes: number,
  mesParam: string
): { diario: PuntoDia[]; velas: PuntoCandlestick[] } {
  const [year, month] = mesParam.split('-').map(Number)
  const ingresosPorDia = new Map<number, number>()
  const gastosPorDia = new Map<number, number>()
  for (let d = 1; d <= ultimoDiaMes; d++) {
    ingresosPorDia.set(d, 0)
    gastosPorDia.set(d, 0)
  }

  for (const t of transacciones) {
    const dia = new Date(t.created_at).getDate()
    if (t.tipo === 'ingreso') {
      ingresosPorDia.set(dia, (ingresosPorDia.get(dia) ?? 0) + t.monto)
    } else {
      gastosPorDia.set(dia, (gastosPorDia.get(dia) ?? 0) + t.monto)
    }
  }

  const diario: PuntoDia[] = []
  let saldoAcum = 0
  for (let d = 1; d <= ultimoDiaMes; d++) {
    const ingresos = ingresosPorDia.get(d) ?? 0
    const gastos = gastosPorDia.get(d) ?? 0
    const neto = ingresos - gastos
    saldoAcum += neto
    const fecha = new Date(year, month - 1, d)
    diario.push({
      dia: d,
      fechaLabel: format(fecha, "d 'de' MMM, yyyy", { locale: es }),
      ingresos,
      gastos,
      neto,
      saldoAcum,
    })
  }

  if (diario.length === 0) return { diario: [], velas: [] }

  const nPeriodos = 5
  const ptsPorPeriodo = Math.ceil(diario.length / nPeriodos)
  const velas: PuntoCandlestick[] = []

  for (let p = 0; p < nPeriodos; p++) {
    const start = p * ptsPorPeriodo
    const end = Math.min(start + ptsPorPeriodo, diario.length)
    const slice = diario.slice(start, end)
    if (slice.length === 0) continue
    const open = p === 0 ? 0 : diario[Math.max(0, start - 1)].saldoAcum
    const close = slice[slice.length - 1].saldoAcum
    const saldos = slice.map((s) => s.saldoAcum)
    velas.push({
      open,
      high: Math.max(open, close, ...saldos),
      low: Math.min(open, close, ...saldos),
      close,
      diaInicio: slice[0].dia,
      diaFin: slice[slice.length - 1].dia,
    })
  }

  if (velas.length === 0) {
    const c = diario[diario.length - 1].saldoAcum
    velas.push({ open: 0, high: Math.max(0, c), low: Math.min(0, c), close: c, diaInicio: 1, diaFin: ultimoDiaMes })
  }

  return { diario, velas }
}

const OPCIONES_VISTA: { valor: VistaGrafico; etiqueta: string; icono: typeof TrendingUp }[] = [
  { valor: 'linea', etiqueta: 'Línea', icono: TrendingUp },
  { valor: 'velas', etiqueta: 'Velas', icono: BarChart3 },
  { valor: 'area', etiqueta: 'Área', icono: Activity },
]

const formatearMonto = (n: number) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

function parseMonto(texto: string): number {
  const limpiado = texto.replace(/\D/g, '').trim()
  return limpiado ? parseInt(limpiado, 10) : 0
}

const formatMonto = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export function DashboardGrafico({
  transacciones = [],
  ultimoDiaMes = new Date().getDate(),
  mesParam = new Date().toISOString().slice(0, 7),
  saldoMes = 0,
  ingresos = 0,
  gastos = 0,
  metaAhorroGuardada = 0,
}: {
  transacciones?: TransaccionChart[]
  ultimoDiaMes?: number
  mesParam?: string
  saldoMes?: number
  ingresos?: number
  gastos?: number
  metaAhorroGuardada?: number
}) {
  const [vista, setVista] = useState<VistaGrafico>('linea')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; contenido: React.ReactNode } | null>(null)
  const [metaInput, setMetaInput] = useState(metaAhorroGuardada ? String(metaAhorroGuardada) : '')
  const [metaGuardada, setMetaGuardada] = useState(metaAhorroGuardada)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMetaGuardada(metaAhorroGuardada)
    setMetaInput(metaAhorroGuardada ? String(metaAhorroGuardada) : '')
  }, [metaAhorroGuardada, mesParam])

  const metaParaCalcular = metaInput.trim() ? parseMonto(metaInput) : metaGuardada
  const { gastoDiario, gastoSemanal, diasRestantes, esMesActual } = useMemo(() => {
    const [year, month] = (mesParam || new Date().toISOString().slice(0, 7)).split('-')
    const hoy = new Date()
    const añoSel = Number(year)
    const mesSel = Number(month) - 1
    const ultimoDia = new Date(añoSel, mesSel + 1, 0).getDate()
    const esMesActual = añoSel === hoy.getFullYear() && mesSel === hoy.getMonth()
    const diaHoy = hoy.getDate()
    const diasRestantes = esMesActual ? Math.max(1, ultimoDia - diaHoy + 1) : ultimoDia
    const disponible = saldoMes - metaParaCalcular
    if (disponible <= 0 || diasRestantes <= 0) {
      return { gastoDiario: 0, gastoSemanal: 0, diasRestantes, esMesActual }
    }
    return {
      gastoDiario: disponible / diasRestantes,
      gastoSemanal: (disponible / diasRestantes) * 7,
      diasRestantes,
      esMesActual,
    }
  }, [saldoMes, mesParam, metaParaCalcular])

  const handleGuardar = useCallback(async () => {
    setErrorGuardado(null)
    const monto = parseMonto(metaInput)
    if (monto < 0) return
    setGuardando(true)
    const { success, error } = await guardarMetaAhorroMensual(mesParam, monto)
    setGuardando(false)
    if (success) {
      setMetaGuardada(monto)
      router.refresh()
    } else {
      setErrorGuardado(error || 'No se pudo guardar')
    }
  }, [metaInput, mesParam, router])

  const { diario, velas } = useMemo(() => {
    const r = procesarTransacciones(transacciones, ultimoDiaMes, mesParam)
    if (r.diario.length === 0) {
      const [y, m] = mesParam.split('-').map(Number)
      const d: PuntoDia[] = []
      for (let i = 1; i <= ultimoDiaMes; i++) {
        d.push({
          dia: i,
          fechaLabel: format(new Date(y, m - 1, i), "d 'de' MMM, yyyy", { locale: es }),
          ingresos: 0,
          gastos: 0,
          neto: 0,
          saldoAcum: 0,
        })
      }
      return { diario: d, velas: [{ open: 0, high: 0, low: 0, close: 0, diaInicio: 1, diaFin: ultimoDiaMes }] }
    }
    return r
  }, [transacciones, ultimoDiaMes, mesParam])

  const datosLinea = vista === 'linea' || vista === 'area' ? diario : velas.map((v) => ({ saldoAcum: v.close }))
  const datosVelas = velas

  const { bars, trendPath, areaPath, width, height, saldoCierre } = useMemo(() => {
    const w = 280
    const h = 140
    const padding = { top: 12, right: 8, bottom: 20, left: 8 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    const datos = vista === 'velas' ? datosVelas : datosLinea
    const getVal = (d: { saldoAcum?: number; close?: number }) => d.saldoAcum ?? d.close ?? 0

    const vals = datos.map((d) => getVal(d))
    const minVal = Math.min(...vals, 0) - 5
    const maxVal = Math.max(...vals, 0) + 5
    const range = Math.max(maxVal - minVal, 1)

    const n = Math.max(datos.length - 1, 1)
    const x = (i: number) => padding.left + (i / n) * chartW
    const y = (v: number) => padding.top + chartH - ((v - minVal) / range) * chartH

    const bars = datosVelas.map((d, i) => {
      const isUp = d.close >= d.open
      const bodyTop = Math.min(d.open, d.close)
      const bodyBottom = Math.max(d.open, d.close)
      const bodyH = ((bodyBottom - bodyTop) / range) * chartH || 2
      const bodyY = y(bodyBottom)
      const wickTop = y(d.high)
      const wickBottom = y(d.low)
      const cx = x(i)
      const bodyW = Math.max(8, chartW / Math.max(datosVelas.length, 1) - 4)
      return {
        x: cx - bodyW / 2,
        y: bodyY,
        w: bodyW,
        h: bodyH,
        wickTop,
        wickBottom,
        isUp,
        cx,
        data: d,
      }
    })

    const trendPoints = datosLinea.map((d, i) => `${x(i)},${y(getVal(d))}`)
    const trendPath =
      trendPoints.length === 1 ? `M ${x(0)},${y(0)} L ${trendPoints[0]}` : `M ${trendPoints.join(' L ')}`

    const baseY = padding.top + chartH
    const lastX = x(datosLinea.length - 1)
    const firstX = x(0)
    const areaPath =
      trendPoints.length === 1
        ? `M ${firstX},${y(0)} L ${trendPoints[0]} L ${lastX},${baseY} L ${firstX},${baseY} Z`
        : `M ${trendPoints[0]} L ${trendPoints.slice(1).join(' L ')} L ${lastX},${baseY} L ${firstX},${baseY} Z`

    const saldoCierre = getVal(datosLinea[datosLinea.length - 1] as { saldoAcum?: number }) ?? 0

    return {
      bars,
      trendPath,
      areaPath,
      width: w,
      height: h,
      saldoCierre,
    }
  }, [datosLinea, datosVelas, vista])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!contenedorRef.current) return
      const rect = contenedorRef.current.getBoundingClientRect()
      const svgW = rect.width
      const relX = e.clientX - rect.left
      const pct = relX / svgW

      if (vista === 'velas') {
        const idx = Math.round(pct * (bars.length - 1))
        const bar = bars[Math.max(0, Math.min(idx, bars.length - 1))]
        if (!bar || !bar.data) return
        const d = bar.data as PuntoCandlestick
        const [y, m] = mesParam.split('-').map(Number)
        const fechaInicio = format(new Date(y, m - 1, d.diaInicio), "d 'de' MMM", { locale: es })
        const fechaFin = format(new Date(y, m - 1, d.diaFin), "d 'de' MMM", { locale: es })
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          contenido: (
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">
                {d.diaInicio === d.diaFin ? fechaInicio : `${fechaInicio} – ${fechaFin}`}
              </p>
              <p className="text-zinc-300">
                Saldo: <span className={d.close >= 0 ? 'text-teal-400' : 'text-rose-400'}>$ {formatearMonto(d.close)}</span>
              </p>
            </div>
          ),
        })
      } else {
        const idx = Math.round(pct * (diario.length - 1))
        const punto = diario[Math.max(0, Math.min(idx, diario.length - 1))]
        if (!punto) return
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          contenido: (
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">{punto.fechaLabel}</p>
              <p className="text-zinc-300">
                Saldo: <span className={punto.saldoAcum >= 0 ? 'text-teal-400' : 'text-rose-400'}>$ {formatearMonto(punto.saldoAcum)}</span>
              </p>
              {punto.ingresos > 0 && (
                <p className="text-teal-400">Ingresos: $ {formatearMonto(punto.ingresos)}</p>
              )}
              {punto.gastos > 0 && (
                <p className="text-rose-400">Gastos: $ {formatearMonto(punto.gastos)}</p>
              )}
            </div>
          ),
        })
      }
    },
    [vista, bars, diario, mesParam]
  )

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  return (
    <div className="relative bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden p-4 md:p-5 min-h-[220px] flex flex-col md:col-span-2 min-w-0">
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
                className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
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

      <div
        ref={contenedorRef}
        className="relative flex-1 min-h-[140px] cursor-crosshair"
        style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.3))' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full pointer-events-none"
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

          {vista === 'area' && (
            <path d={areaPath} fill="url(#trendGradient)" fillOpacity="0.25" stroke="none" />
          )}

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

          {vista === 'velas' &&
            bars.map((bar, i) => (
              <g key={i}>
                <line
                  x1={bar.cx}
                  y1={bar.wickTop}
                  x2={bar.cx}
                  y2={bar.wickBottom}
                  stroke={bar.isUp ? 'rgb(52,211,153)' : 'rgb(248,113,113)'}
                  strokeWidth="1.2"
                  opacity="0.9"
                />
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

        {tooltip && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            <div className="bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 shadow-xl min-w-[180px]">
              {tooltip.contenido}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-zinc-600" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800 relative z-10">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Saldo al cierre</p>
        <span className={`font-bold font-mono text-lg ${saldoCierre >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {saldoCierre >= 0 ? '+' : ''}${formatearMonto(saldoCierre)}
        </span>
      </div>

      {(ingresos > 0 || gastos > 0) && (
        <div className="mt-3 pt-3 border-t border-zinc-800 relative z-10 space-y-3">
          {gastoDiario > 0 ? (
            <p className="text-xs text-zinc-500">
              Podés gastar{' '}
              <span className="text-cyan-300 font-bold [text-shadow:0_0_8px_rgba(34,211,238,0.9),0_0_20px_rgba(34,211,238,0.5)]">
                {formatMonto(gastoDiario)}
              </span>
              /día y{' '}
              <span className="text-cyan-300 font-bold [text-shadow:0_0_8px_rgba(34,211,238,0.9),0_0_20px_rgba(34,211,238,0.5)]">
                {formatMonto(gastoSemanal)}
              </span>
              /semana
              {esMesActual && <span className="text-zinc-600"> ({diasRestantes} días restantes)</span>}
            </p>
          ) : metaParaCalcular > 0 ? (
            <p className="text-xs text-amber-400">
              Para ahorrar {formatMonto(metaParaCalcular)} este mes necesitás más ingresos o menos gastos.
            </p>
          ) : (
            <p className="text-xs text-zinc-500">No hay saldo disponible para gastar este mes.</p>
          )}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <PiggyBank size={14} className="text-teal-400 shrink-0" />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Quiero ahorrar ej: 50000"
              value={metaInput}
              onChange={(e) => setMetaInput(e.target.value)}
              className="min-w-0 flex-1 basis-[min(100%,12rem)] text-sm bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
              className="shrink-0 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {guardando ? '...' : 'Guardar'}
            </button>
          </div>
          {errorGuardado && (
            <p className="text-xs text-rose-400">{errorGuardado}</p>
          )}
          {metaGuardada > 0 && (
            <p className="text-xs text-teal-400">
              Meta guardada: {formatMonto(metaGuardada)} — se descuenta de tu saldo disponible.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
