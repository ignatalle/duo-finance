import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { PlanificacionHeader } from '@/components/features/PlanificacionHeader'
import { PlanificacionFijos } from '@/components/features/PlanificacionFijos'
import { PlanificacionVariables } from '@/components/features/PlanificacionVariables'
import { PlanificacionFlujo } from '@/components/features/PlanificacionFlujo'
import { GastosClient } from './GastosClient'
import { obtenerConsumoPorCategoria } from '@/app/actions/transacciones'
import { obtenerPresupuestos } from '@/app/actions/presupuestos'
import { obtenerMetaAhorroMensual } from '@/app/actions/metasAhorroMensual'

export default async function GastosPage(props: { searchParams: Promise<{ mes?: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const searchParams = await props.searchParams
  const mesParam = searchParams.mes || new Date().toISOString().slice(0, 7)
  const [year, month] = mesParam.split('-')
  const inicioMes = new Date(Number(year), Number(month) - 1, 1).toISOString()
  const finMes = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .eq('usuario_id', user.id)
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)

  const ingresos = (transacciones || []).filter((t) => t.tipo === 'ingreso')
  const gastosFijos = (transacciones || []).filter((t) => t.tipo === 'gasto' && t.tipo_gasto === 'fijo')

  const totalIngresos = ingresos.reduce((a, t) => a + t.monto, 0)
  const totalGastosFijos = gastosFijos.reduce((a, t) => a + t.monto, 0)
  const totalFijosNeto = totalIngresos - totalGastosFijos

  const { data: presupuestos } = await obtenerPresupuestos(mesParam)
  const { data: consumoPorCat } = await obtenerConsumoPorCategoria(user.id, mesParam)
  const { data: metaAhorroGuardada } = await obtenerMetaAhorroMensual(mesParam)
  const consumoPorCategoria = consumoPorCat || {}
  const totalPresupuestado = (presupuestos || []).reduce((a, p) => a + p.limite_mensual, 0)
  const margenAhorro = totalFijosNeto - totalPresupuestado - (metaAhorroGuardada || 0)

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <GastosClient mesParam={mesParam} presupuestos={(presupuestos || []).map((p) => ({ id: p.id, categoria: p.categoria, limite_mensual: p.limite_mensual }))} />
      </Suspense>
      <PlanificacionHeader mesParam={mesParam} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlanificacionFijos
          ingresos={ingresos}
          gastosFijos={gastosFijos}
          usuarioId={user.id}
        />
        <PlanificacionVariables
          presupuestos={presupuestos || []}
          consumoPorCategoria={consumoPorCategoria}
          mesParam={mesParam}
        />
      </div>

      {/* Barra resumen inferior */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Total fijos (neto)
            </p>
            <p className={`text-2xl font-bold ${totalFijosNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              $ {totalFijosNeto.toLocaleString('es-AR')}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Total presupuestado
            </p>
            <p className="text-2xl font-bold text-white">
              $ {totalPresupuestado.toLocaleString('es-AR')}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Margen de ahorro
            </p>
            <p className="text-xs text-zinc-500 mb-0.5">
              {metaAhorroGuardada && metaAhorroGuardada > 0
                ? `Meta ${metaAhorroGuardada.toLocaleString('es-AR')} descontada`
                : 'Ingresos − fijos − variables'}
            </p>
            <p className={`text-2xl font-bold ${margenAhorro >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              $ {margenAhorro.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
