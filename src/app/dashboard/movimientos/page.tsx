import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MovimientosHeader } from '@/components/features/MovimientosHeader'
import { ListaTransaccionesMovimientos } from '@/components/features/ListaTransaccionesMovimientos'

export default async function MovimientosPage(props: { searchParams: Promise<{ mes?: string }> }) {
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
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <MovimientosHeader mesParam={mesParam} />
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6">
        <ListaTransaccionesMovimientos transacciones={transacciones || []} />
      </div>
    </div>
  )
}
