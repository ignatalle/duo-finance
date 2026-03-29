import { TrendingUp, BarChart3, Activity, type LucideIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export type VistaGrafico = 'linea' | 'velas' | 'area'

export type TransaccionChart = { monto: number; tipo: 'ingreso' | 'gasto'; created_at: string }

export type PuntoDia = {
  dia: number
  fechaLabel: string
  ingresos: number
  gastos: number
  neto: number
  saldoAcum: number
}

export type PuntoCandlestick = {
  open: number
  high: number
  low: number
  close: number
  diaInicio: number
  diaFin: number
}

export function procesarTransacciones(
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

export const OPCIONES_VISTA: { valor: VistaGrafico; etiqueta: string; icono: LucideIcon }[] = [
  { valor: 'linea', etiqueta: 'Línea', icono: TrendingUp },
  { valor: 'velas', etiqueta: 'Velas', icono: BarChart3 },
  { valor: 'area', etiqueta: 'Área', icono: Activity },
]

export const formatearMontoGrafico = (n: number) =>
  new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

export function parseMontoMeta(texto: string): number {
  const limpiado = texto.replace(/\D/g, '').trim()
  return limpiado ? parseInt(limpiado, 10) : 0
}

export const formatMontoCurrency = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
