import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FormularioTransaccion } from '@/components/features/FormularioTransaccion'
import { ListaTransacciones } from '@/components/features/ListaTransacciones'
import { ModuloPareja } from '@/components/features/ModuloPareja'
import { ResumenBalances } from '@/components/features/ResumenBalances'
import { SelectorMes } from '@/components/features/SelectorMes'

// NUEVO: Recibimos los parámetros de la URL (searchParams)
export default async function DashboardPage(props: { searchParams: Promise<{ mes?: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Lógica para saber qué mes estamos mirando
  const searchParams = await props.searchParams
  const rawMes = searchParams.mes || new Date().toISOString().slice(0, 7)
  const mesMatch = rawMes.match(/^(\d{4})-(\d{2})$/)
  const year = mesMatch ? Number(mesMatch[1]) : new Date().getFullYear()
  const month = mesMatch ? Number(mesMatch[2]) : new Date().getMonth() + 1
  const inicioMes = new Date(year, month - 1, 1).toISOString()
  const finMes = new Date(year, month, 0, 23, 59, 59).toISOString()

  // 1. Traemos tu perfil
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Traemos las transacciones filtradas por ese mes específico
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: false })

  // Función para cerrar sesión
  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold">Duo Finance</h1>
          <form action={signOut}>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Cerrar Sesión
            </Button>
          </form>
        </header>

        <main className="bg-zinc-950/80 border border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-zinc-800/50 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Panel de Control</h2>
              <p className="text-sm text-zinc-400 mt-1">Gestión de presupuesto y saldos</p>
            </div>
            <div className="flex items-center">
              <SelectorMes />
            </div>
          </div>

          <ResumenBalances inicioMes={inicioMes} finMes={finMes} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <ModuloPareja perfil={perfil} />
              <FormularioTransaccion />
            </div>
            
            <div>
              <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900 h-full shadow-inner">
                <ListaTransacciones 
                  transacciones={transacciones || []} 
                  usuarioActualId={user.id} 
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
