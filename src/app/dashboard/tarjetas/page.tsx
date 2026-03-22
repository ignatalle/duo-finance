import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { obtenerTarjetas } from '@/app/actions/tarjetas'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcularFechaFinCuotas } from '@/lib/calculos'
import { CreditCard, Target } from 'lucide-react'

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

  const proximasCuotas = (transaccionesConCuotas || [])
    .filter((t) => t.estado === 'pendiente' || (t.cuota_actual === 1 && t.estado === 'pagado'))
    .reduce((acc, t) => acc + t.monto, 0)

  const mesLibreDeudas = calcularFechaFinCuotas(maxMesesRestantes)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Tarjetas y Cuotas</h2>
          <p className="text-zinc-400 text-sm">Controlá tu deuda futura.</p>
        </div>
        <button
          type="button"
          className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <CreditCard size={16} /> Vincular Tarjeta
        </button>
      </div>

      <div className="bg-gradient-to-r from-emerald-900/40 to-zinc-900 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-full">
            <Target className="text-emerald-400" size={28} />
          </div>
          <div>
            <h3 className="text-emerald-400 font-bold text-lg">Libertad de Tarjetas</h3>
            <p className="text-zinc-300 text-sm">Si no sumás nuevas cuotas, terminarás de pagar todo en:</p>
          </div>
        </div>
        <div className="bg-zinc-900 px-6 py-3 rounded-xl border border-zinc-700 shadow-inner">
          <p className="text-2xl font-black text-white">{mesLibreDeudas}</p>
        </div>
      </div>

      {(!tarjetas || tarjetas.length === 0) && (transaccionesConCuotas?.length || 0) === 0 ? (
        <Card>
          <p className="text-zinc-500 text-center py-8">No hay tarjetas ni cuotas registradas.</p>
        </Card>
      ) : (
        <>
          {(tarjetas || []).map((tarjeta) => {
            const cuotas = cuotasPorTarjeta[tarjeta.id] || []
            const consumosMes = 0
            const impactoResumen = consumosMes + cuotas.reduce((a, c) => a + c.montoCuota, 0)

            return (
              <Card key={tarjeta.id} className="border-indigo-500/30">
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">{tarjeta.nombre}</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="bg-zinc-900 px-3 py-1 rounded-md text-zinc-300 border border-zinc-700">
                        Cierre: día {tarjeta.cierre_dia}
                      </span>
                      <span className="bg-zinc-900 px-3 py-1 rounded-md text-zinc-300 border border-zinc-700">
                        Vence: día {tarjeta.vencimiento_dia}
                      </span>
                    </div>
                  </div>
                  <div className="bg-indigo-900/20 p-5 rounded-xl border border-indigo-500/20 min-w-[250px] text-right">
                    <p className="text-indigo-300 text-sm font-medium mb-1">Impacto Próximo Resumen</p>
                    <p className="text-4xl font-black text-white mb-1">${impactoResumen.toLocaleString('es-AR')}</p>
                  </div>
                </div>

                {cuotas.length > 0 && (
                  <>
                    <h4 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider">
                      Compromisos en cuotas
                    </h4>
                    <div className="overflow-hidden rounded-xl border border-zinc-700">
                      <table className="w-full text-left text-sm">
                        <thead className="text-zinc-300 bg-zinc-900 border-b border-zinc-700">
                          <tr>
                            <th className="p-4 font-semibold">Detalle</th>
                            <th className="p-4 font-semibold">Progreso</th>
                            <th className="p-4 font-semibold text-right">Monto Cuota</th>
                            <th className="p-4 font-semibold text-right">Termina en</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 bg-zinc-800/50">
                          {cuotas.map((c, i) => (
                            <tr key={i} className="hover:bg-zinc-700/30 transition-colors">
                              <td className="p-4">
                                <p className="text-white font-bold">{c.detalle}</p>
                                <p className="text-xs text-zinc-400 mt-1">Total: ${c.total.toLocaleString('es-AR')}</p>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-indigo-300 w-10 bg-indigo-500/10 px-2 py-1 rounded text-center">
                                    {c.cuotaActual}/{c.cuotasTotales}
                                  </span>
                                  <div className="w-32">
                                    <ProgressBar
                                      current={c.cuotaActual}
                                      max={c.cuotasTotales}
                                      colorClass="bg-indigo-500"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <p className="text-indigo-300 font-bold text-lg">${c.montoCuota.toLocaleString('es-AR')}</p>
                              </td>
                              <td className="p-4 text-right">
                                <p className="text-zinc-300 font-medium">{calcularFechaFinCuotas(c.finMeses)}</p>
                                <p className="text-xs text-zinc-500">({c.finMeses} meses restantes)</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Card>
            )
          })}

          {(!tarjetas || tarjetas.length === 0) && (transaccionesConCuotas?.length || 0) > 0 && (
            <Card>
              <h3 className="text-lg font-bold text-white mb-4">Cuotas sin tarjeta asociada</h3>
              <div className="space-y-3">
                {(cuotasPorTarjeta['sin-tarjeta'] || []).map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg">
                    <span className="text-white font-medium">{c.detalle}</span>
                    <span className="text-indigo-400 font-bold">${c.montoCuota.toLocaleString('es-AR')}/mes</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
