'use server'

import { createClient } from '@/lib/supabase/server'

export interface ResumenMensual {
  ingresos: number
  gastos: number
  saldo: number
  porCategoria: { categoria: string; total: number }[]
  totalTransacciones: number
}

export async function obtenerResumenMensual(mesRef: string): Promise<ResumenMensual | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [year, month] = mesRef.split('-')
  const inicio = new Date(Number(year), Number(month) - 1, 1).toISOString()
  const fin = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('monto, tipo, categoria')
    .eq('usuario_id', user.id)
    .gte('created_at', inicio)
    .lte('created_at', fin)

  const ingresos = transacciones?.filter((t) => t.tipo === 'ingreso').reduce((a, t) => a + t.monto, 0) || 0
  const gastos = transacciones?.filter((t) => t.tipo === 'gasto').reduce((a, t) => a + t.monto, 0) || 0

  const porCategoria: Record<string, number> = {}
  for (const t of transacciones || []) {
    if (t.tipo === 'gasto') {
      porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.monto
    }
  }

  return {
    ingresos,
    gastos,
    saldo: ingresos - gastos,
    porCategoria: Object.entries(porCategoria)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total),
    totalTransacciones: transacciones?.length || 0,
  }
}

export interface CuotaTarjeta {
  tarjetaNombre: string
  detalle: string
  montoCuota: number
  cuotaActual: number
  cuotasTotales: number
  totalRestante: number
  finMeses: number
}

export interface EstadoTarjetas {
  tarjetas: { id: string; nombre: string }[]
  cuotas: CuotaTarjeta[]
  deudaTotal: number
}

export async function obtenerEstadoTarjetas(): Promise<EstadoTarjetas | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tarjetas } = await supabase
    .from('tarjetas')
    .select('id, nombre')
    .eq('usuario_id', user.id)

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('tarjeta_id, descripcion, categoria, monto, cuota_actual, cuota_total')
    .eq('usuario_id', user.id)
    .eq('tipo', 'gasto')
    .not('cuota_total', 'is', null)
    .gte('cuota_actual', 1)

  const tarjetaMap = new Map((tarjetas || []).map((t) => [t.id, t.nombre]))
  const seen = new Set<string>()
  const cuotas: CuotaTarjeta[] = []
  let deudaTotal = 0

  for (const t of transacciones || []) {
    const tarjetaId = t.tarjeta_id || 'sin-tarjeta'
    const key = `${tarjetaId}:${t.descripcion || t.categoria}`
    if (seen.has(key)) continue
    seen.add(key)
    const restante = t.monto * Math.max(0, (t.cuota_total || 0) - (t.cuota_actual || 0))
    deudaTotal += restante
    cuotas.push({
      tarjetaNombre: t.tarjeta_id ? (tarjetaMap.get(t.tarjeta_id) || 'Sin tarjeta') : 'Sin tarjeta',
      detalle: t.descripcion || t.categoria,
      montoCuota: Math.round(t.monto),
      cuotaActual: t.cuota_actual!,
      cuotasTotales: t.cuota_total!,
      totalRestante: restante,
      finMeses: (t.cuota_total || 0) - (t.cuota_actual || 0),
    })
  }

  return {
    tarjetas: (tarjetas || []).map((t) => ({ id: t.id, nombre: t.nombre })),
    cuotas,
    deudaTotal,
  }
}

export interface MesBalance {
  mes: string
  mesNombre: string
  ingresos: number
  gastos: number
  saldo: number
}

export async function obtenerBalanceAnual(anio: string): Promise<MesBalance[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const year = Number(anio)
  const inicio = new Date(year, 0, 1).toISOString()
  const fin = new Date(year, 11, 31, 23, 59, 59).toISOString()

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('monto, tipo, created_at')
    .eq('usuario_id', user.id)
    .gte('created_at', inicio)
    .lte('created_at', fin)

  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const porMes: Record<number, { ingresos: number; gastos: number }> = {}
  for (let m = 0; m < 12; m++) porMes[m] = { ingresos: 0, gastos: 0 }

  for (const t of transacciones || []) {
    const mes = new Date(t.created_at).getMonth()
    if (t.tipo === 'ingreso') porMes[mes].ingresos += t.monto
    else porMes[mes].gastos += t.monto
  }

  return Array.from({ length: 12 }, (_, m) => ({
    mes: `${year}-${String(m + 1).padStart(2, '0')}`,
    mesNombre: `${MESES[m]} ${year}`,
    ingresos: porMes[m].ingresos,
    gastos: porMes[m].gastos,
    saldo: porMes[m].ingresos - porMes[m].gastos,
  }))
}
