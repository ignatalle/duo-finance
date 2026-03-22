import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ListaTransacciones } from '@/components/features/ListaTransacciones'
import { SelectorMes } from '@/components/features/SelectorMes'
import { ModuloPareja } from '@/components/features/ModuloPareja'
import { DashboardHeader } from '@/components/features/DashboardHeader'
import { DashboardSaldos } from '@/components/features/DashboardSaldos'
import { DashboardAlertas } from '@/components/features/DashboardAlertas'
import { DashboardSalud } from '@/components/features/DashboardSalud'

export default async function DashboardPage(props: { searchParams: Promise<{ mes?: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/login')

  const searchParams = await props.searchParams
  const mesParam = searchParams.mes || new Date().toISOString().slice(0, 7)
  const [year, month] = mesParam.split('-')
  const inicioMes = new Date(Number(year), Number(month) - 1, 1).toISOString()
  const finMes = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .eq('usuario_id', user.id)
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: false })

  const userName = user.email?.split('@')[0] || 'Usuario'

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <DashboardHeader userName={userName} />
        <SelectorMes />
      </header>

      <DashboardSaldos
        inicioMes={inicioMes}
        finMes={finMes}
        mesRef={mesParam}
        usuarioId={user.id}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <DashboardAlertas mesRef={mesParam} usuarioId={user.id} />
        </div>
        <DashboardSalud inicioMes={inicioMes} finMes={finMes} usuarioId={user.id} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <section className="xl:col-span-1">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-1 shadow-xl backdrop-blur-sm">
            <ModuloPareja perfil={perfil} />
          </div>
        </section>
        <section className="xl:col-span-2">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 shadow-xl backdrop-blur-sm min-h-[500px]">
            <h2 className="text-xl font-semibold text-white mb-6">Últimos Movimientos</h2>
            <ListaTransacciones transacciones={transacciones || []} usuarioActualId={user.id} />
          </div>
        </section>
      </div>
    </div>
  )
}
