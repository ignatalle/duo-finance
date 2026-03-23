import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { obtenerTarjetas } from '@/app/actions/tarjetas'
import { TarjetasSection } from '@/components/features/tarjetas/TarjetasSection'
import { calcularFechaFinCuotas } from '@/lib/calculos'

export default async function TarjetasPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const { data: tarjetas } = await obtenerTarjetas()

  const { data: transaccionesConCuotas } = await supabase
    .from('transacciones')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('tipo', 'gasto')
    .not('cuota_total', 'is', null)
    .gte('cuota_actual', 1)

  const cuotasPorTarjeta: Record<string, { detalle: string; total: number; cuotaActual: number; cuotasTotales: number; montoCuota: number; finMeses: number }[]> = {}
  const seen = new Set<string>()
  let maxMesesRestantes = 0

  for (const t of transaccionesConCuotas || []) {
    if (!t.cuota_actual || !t.cuota_total) continue
    const tarjetaId = t.tarjeta_id || 'sin-tarjeta'
    const groupKey = `${tarjetaId}:${t.descripcion || t.categoria}`
    if (seen.has(groupKey)) continue
    seen.add(groupKey)
    if (!cuotasPorTarjeta[tarjetaId]) cuotasPorTarjeta[tarjetaId] = []
    const finMeses = t.cuota_total - t.cuota_actual
    maxMesesRestantes = Math.max(maxMesesRestantes, finMeses)
    cuotasPorTarjeta[tarjetaId].push({
      detalle: t.descripcion || t.categoria,
      total: t.monto * t.cuota_total,
      cuotaActual: t.cuota_actual,
      cuotasTotales: t.cuota_total,
      montoCuota: Math.round(t.monto),
      finMeses,
    })
  }

  const mesLibreDeudas = calcularFechaFinCuotas(maxMesesRestantes)
  const tieneDeuda = maxMesesRestantes > 0 || (Object.values(cuotasPorTarjeta).flat().length > 0)

  return (
    <TarjetasSection
      tarjetas={tarjetas || []}
      cuotasPorTarjeta={cuotasPorTarjeta}
      mesLibreDeudas={mesLibreDeudas}
      tieneDeuda={tieneDeuda}
    />
  )
}
