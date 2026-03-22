/**
 * Utilidades de cálculo financiero compartidas
 */

const MESES_NOMBRES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** Saldo disponible real = saldo total menos gastos fijos pendientes */
export function calcularSaldoDisponibleReal(saldoTotal: number, pendientesFijos: number): number {
  return saldoTotal - pendientesFijos
}

/** Fecha estimada cuando termina la última cuota (meses restantes desde hoy) */
export function calcularFechaFinCuotas(mesesRestantes: number, anoBase = new Date().getFullYear(), mesBase = new Date().getMonth()): string {
  if (mesesRestantes <= 0) return '¡Ya estás libre!'
  const d = new Date(anoBase, mesBase)
  d.setMonth(d.getMonth() + mesesRestantes)
  return `${MESES_NOMBRES[d.getMonth()]} ${d.getFullYear()}`
}

/** Margen libre del próximo mes = ingresos - fijos - cuotas */
export function calcularMargenLibreProximoMes(
  ingresosEsperados: number,
  totalFijos: number,
  proximasCuotas: number
): number {
  return ingresosEsperados - totalFijos - proximasCuotas
}

/** Balance en pareja: positivo = pareja te debe, negativo = tú debes */
export function calcularBalancePareja(totalYo: number, totalPareja: number): number {
  const totalCompartido = totalYo + totalPareja
  const mitad = totalCompartido / 2
  return totalYo - mitad
}

export { MESES_NOMBRES }
