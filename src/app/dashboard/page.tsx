import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FormularioTransaccion } from '@/components/features/FormularioTransaccion'
import { ListaTransacciones } from '@/components/features/ListaTransacciones'
import { ResumenBalances } from '@/components/features/ResumenBalances'
import { SelectorMes } from '@/components/features/SelectorMes'
import { ModuloPareja } from '@/components/features/ModuloPareja'

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
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto">
      
      {/* 1. CABECERA LIMPIA */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Panel de Control</h1>
          <p className="text-sm text-zinc-400 mt-1">Gestión de presupuesto y saldos compartidos</p>
        </div>
        <div className="flex items-center gap-4">
          <SelectorMes />
        </div>
      </header>

      {/* 2. TARJETAS DE MÉTRICAS (Arriba, abarcando todo el ancho) */}
      <section className="w-full">
         <ResumenBalances inicioMes={inicioMes} finMes={finMes} />
      </section>

      {/* 3. GRID PRINCIPAL (Formulario a la izq, Lista a la der) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Columna Izquierda (1 fracción) */}
        <section className="xl:col-span-1 flex flex-col gap-8">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-1 shadow-xl backdrop-blur-sm">
             <FormularioTransaccion />
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-1 shadow-xl backdrop-blur-sm">
             <ModuloPareja perfil={perfil} />
          </div>
        </section>

        {/* Columna Derecha (2 fracciones) */}
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
