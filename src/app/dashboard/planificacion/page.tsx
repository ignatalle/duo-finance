import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcularMargenLibreProximoMes } from '@/lib/calculos'
import { Target } from 'lucide-react'

export default async function PlanificacionPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const hoy = new Date()
  const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
  const mesRef = `${proximoMes.getFullYear()}-${String(proximoMes.getMonth() + 1).padStart(2, '0')}`
  const [year, month] = mesRef.split('-')
  const inicioProximo = new Date(Number(year), Number(month) - 1, 1).toISOString()
  const finProximo = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()

  const inicioActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString()
  const finActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { data: transaccionesActual } = await supabase
    .from('transacciones')
    .select('id, tipo, monto, tipo_gasto, categoria, descripcion')
    .eq('usuario_id', user.id)
    .gte('created_at', inicioActual)
    .lte('created_at', finActual)

  const ingresosActuales = (transaccionesActual || []).filter((t) => t.tipo === 'ingreso').reduce((a, t) => a + t.monto, 0)
  const gastosFijosActuales = (transaccionesActual || []).filter((t) => t.tipo_gasto === 'fijo').reduce((a, t) => a + t.monto, 0)

  const { data: cuotasProximoMes } = await supabase
    .from('transacciones')
    .select('id, monto, descripcion')
    .eq('usuario_id', user.id)
    .eq('tipo', 'gasto')
    .not('cuota_total', 'is', null)
    .gte('created_at', inicioProximo)
    .lte('created_at', finProximo)

  const proximasCuotas = (cuotasProximoMes || []).reduce((a, t) => a + t.monto, 0)
  const ingresosEsperados = ingresosActuales > 0 ? ingresosActuales : 1500000
  const totalFijos = gastosFijosActuales
  const margenLibre = calcularMargenLibreProximoMes(ingresosEsperados, totalFijos, proximasCuotas)

  const gastosFijosLista = (transaccionesActual || []).filter((t) => t.tipo_gasto === 'fijo')

  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const nombreProximoMes = `${mesesNombres[proximoMes.getMonth()]} ${proximoMes.getFullYear()}`

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Planificación: {nombreProximoMes}</h2>
        <p className="text-zinc-400 text-sm">Sabemos qué vas a tener que pagar el mes que viene.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="text-center bg-zinc-900/50 border-dashed border-zinc-600">
          <p className="text-sm text-zinc-400 mb-1">Ingreso Estimado</p>
          <p className="text-2xl font-bold text-emerald-400">+ ${ingresosEsperados.toLocaleString('es-AR')}</p>
        </Card>
        <Card className="text-center bg-zinc-900/50 border-dashed border-zinc-600">
          <p className="text-sm text-zinc-400 mb-1">Compromisos Asumidos</p>
          <p className="text-2xl font-bold text-rose-400">- ${(totalFijos + proximasCuotas).toLocaleString('es-AR')}</p>
        </Card>
        <Card className="text-center bg-indigo-900/40 border-indigo-500/50">
          <p className="text-sm text-indigo-300 mb-1 font-medium">Margen Libre</p>
          <p className="text-3xl font-black text-indigo-400">${margenLibre.toLocaleString('es-AR')}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-700 pb-2">El mes que viene tenés que pagar:</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            <p className="text-xs font-bold text-zinc-500 uppercase">Servicios Fijos</p>
            {gastosFijosLista.map((g) => (
              <div key={g.id} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg">
                <span className="text-sm text-zinc-300">{g.descripcion || g.categoria}</span>
                <span className="text-sm font-bold text-rose-400">-${g.monto.toLocaleString('es-AR')}</span>
              </div>
            ))}
            <p className="text-xs font-bold text-zinc-500 uppercase pt-2">Cuotas de Tarjetas</p>
            {(cuotasProximoMes || []).map((c) => (
              <div key={c.id} className="flex justify-between items-center bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/10">
                <span className="text-sm text-indigo-200">{c.descripcion}</span>
                <span className="text-sm font-bold text-indigo-400">-${c.monto.toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target size={18} className="text-amber-400" /> Presupuesto Sugerido (Regla 50/30/20)
          </h3>
          <p className="text-sm text-zinc-400 mb-6">
            Sobre tu margen libre de ${margenLibre.toLocaleString('es-AR')}, sugerimos dividirlo así:
          </p>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-200 font-medium">50% Gastos Variables (Comida, nafta)</span>
                <span className="text-white font-bold">${(margenLibre * 0.5).toLocaleString('es-AR')}</span>
              </div>
              <ProgressBar current={50} max={100} colorClass="bg-blue-500" heightClass="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-200 font-medium">30% Estilo de Vida (Salidas, gustos)</span>
                <span className="text-white font-bold">${(margenLibre * 0.3).toLocaleString('es-AR')}</span>
              </div>
              <ProgressBar current={30} max={100} colorClass="bg-fuchsia-500" heightClass="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-200 font-medium flex items-center gap-1">
                  <Target size={14} className="text-emerald-400" /> 20% Ahorro e Inversión
                </span>
                <span className="text-emerald-400 font-bold">${(margenLibre * 0.2).toLocaleString('es-AR')}</span>
              </div>
              <ProgressBar current={20} max={100} colorClass="bg-emerald-500" heightClass="h-3" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
