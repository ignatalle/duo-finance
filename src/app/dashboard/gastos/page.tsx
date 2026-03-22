import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SelectorMes } from '@/components/features/SelectorMes'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { obtenerGastosFijosPendientes, obtenerConsumoPorCategoria } from '@/app/actions/transacciones'
import { obtenerPresupuestos } from '@/app/actions/presupuestos'
import { Calendar, PieChart, AlertTriangle, Check } from 'lucide-react'
import { ListaGastosFijos } from './ListaGastosFijos'

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
    .eq('tipo', 'gasto')
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: false })

  const { data: gastosFijos } = await obtenerGastosFijosPendientes(user.id, mesParam)
  const { data: consumoPorCat } = await obtenerConsumoPorCategoria(user.id, mesParam)
  const { data: presupuestos } = await obtenerPresupuestos(mesParam)

  const gastosFijosLista = (transacciones || []).filter((t) => t.tipo_gasto === 'fijo')
  const categoriasConPresupuesto = presupuestos || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gastos del Mes</h2>
          <p className="text-zinc-400 text-sm">Controlá tus compromisos y presupuestos.</p>
        </div>
        <SelectorMes />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" /> Fijos
              <span className="text-xs font-normal text-zinc-400">(Servicios, suscripciones)</span>
            </h3>
          </div>
          <ListaGastosFijos gastos={gastosFijosLista} usuarioId={user.id} />
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PieChart size={18} className="text-fuchsia-400" /> Variables
              <span className="text-xs font-normal text-zinc-400">(Presupuestos)</span>
            </h3>
          </div>
          <div className="space-y-6">
            {categoriasConPresupuesto.length === 0 ? (
              <p className="text-zinc-500 text-sm">Sin presupuestos configurados. Agregá límites por categoría.</p>
            ) : (
              categoriasConPresupuesto.map((p) => {
                const consumido = consumoPorCat[p.categoria] || 0
                const porcentaje = p.limite_mensual > 0 ? (consumido / p.limite_mensual) * 100 : 0
                const isWarning = porcentaje > 85
                return (
                  <div key={p.id} className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-zinc-200">{p.categoria}</p>
                      <p className="text-sm font-bold text-white">
                        ${consumido.toLocaleString('es-AR')}{' '}
                        <span className="text-zinc-500 font-normal">/ ${p.limite_mensual.toLocaleString('es-AR')}</span>
                      </p>
                    </div>
                    <ProgressBar
                      current={consumido}
                      max={p.limite_mensual}
                      colorClass={isWarning ? 'bg-rose-500' : 'bg-fuchsia-500'}
                      heightClass="h-2.5"
                    />
                    {isWarning && (
                      <p className="text-xs text-rose-400 mt-2 flex items-center gap-1 font-medium">
                        <AlertTriangle size={12} /> Estás llegando al límite mensual
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
