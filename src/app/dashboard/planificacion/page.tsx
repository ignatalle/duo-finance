import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { calcularMargenLibreProximoMes } from '@/lib/calculos'
import { PlanificacionCompromisosCard } from '@/components/features/PlanificacionCompromisosCard'
import { PlanificacionPresupuestoCard } from '@/components/features/PlanificacionPresupuestoCard'

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
        <PlanificacionCompromisosCard
          gastosFijosLista={gastosFijosLista}
          cuotasProximoMes={cuotasProximoMes || []}
        />
        <PlanificacionPresupuestoCard margenLibre={margenLibre} />
      </div>
    </div>
  )
}
