import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { obtenerMetaAhorroMensual } from '@/app/actions/metasAhorroMensual'
import { DashboardHeader } from '@/components/features/DashboardHeader'
import { DashboardSaldos } from '@/components/features/DashboardSaldos'
import { DashboardSalud } from '@/components/features/DashboardSalud'
import { DashboardGrafico } from '@/components/features/DashboardGrafico'
import { UltimosMovimientos } from '@/components/features/UltimosMovimientos'

export default async function DashboardPage(props: { searchParams: Promise<{ mes?: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/login')

  const searchParams = await props.searchParams
  const mesParam = searchParams.mes || new Date().toISOString().slice(0, 7)
  const [year, month] = mesParam.split('-')
  const inicioMes = new Date(Number(year), Number(month) - 1, 1).toISOString()
  const finMes = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()
  const ultimoDiaMes = new Date(Number(year), Number(month), 0).getDate()

  const userName = user.email?.split('@')[0] || 'Usuario'

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('id, monto, tipo, categoria, descripcion, created_at')
    .eq('usuario_id', user.id)
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: true })

  const transaccionesOrdenadas = [...(transacciones || [])].reverse()
  const ingresos = transacciones?.filter((t) => t.tipo === 'ingreso').reduce((a, t) => a + t.monto, 0) || 0
  const gastos = transacciones?.filter((t) => t.tipo === 'gasto').reduce((a, t) => a + t.monto, 0) || 0
  const saldoMes = ingresos - gastos
  const { data: metaAhorroGuardada } = await obtenerMetaAhorroMensual(mesParam)

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto">
      <DashboardHeader userName={userName} />

      <DashboardSaldos
        inicioMes={inicioMes}
        finMes={finMes}
        mesRef={mesParam}
        usuarioId={user.id}
        metaAhorroGuardada={metaAhorroGuardada}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardGrafico
          transacciones={transaccionesOrdenadas || []}
          ultimoDiaMes={ultimoDiaMes}
          mesParam={mesParam}
          saldoMes={saldoMes}
          ingresos={ingresos}
          gastos={gastos}
          metaAhorroGuardada={metaAhorroGuardada}
        />
        <div className="flex flex-col gap-4">
          <DashboardSalud saldoMes={saldoMes} ingresos={ingresos} gastos={gastos} />
          <UltimosMovimientos transacciones={transacciones || []} />
        </div>
      </div>

    </div>
  )
}
