import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ListaTransacciones } from '@/components/features/ListaTransacciones'
import { SelectorMes } from '@/components/features/SelectorMes'
import { BotonExportar } from '@/components/features/BotonExportar'
import { FormularioTransaccion } from '@/components/features/FormularioTransaccion'

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
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <SelectorMes />
          <BotonExportar mesActual={mesParam} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-4">
          <div className="rounded-[32px] bg-zinc-900/40 border border-zinc-800 p-4">
            <FormularioTransaccion />
          </div>
        </section>
        <section className="lg:col-span-8">
          <div className="rounded-[32px] bg-zinc-900/40 border border-zinc-800 p-4">
            <ListaTransacciones transacciones={transacciones || []} usuarioActualId={user.id} />
          </div>
        </section>
      </div>
    </div>
  )
}
