import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FormularioTransaccion } from '@/components/features/FormularioTransaccion'
import { ListaTransacciones } from '@/components/features/ListaTransacciones'
import { ModuloPareja } from '@/components/features/ModuloPareja'
import { ResumenBalances } from '@/components/features/ResumenBalances'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Traemos los datos del usuario logueado
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // 1. Traemos tu perfil para saber si tienes pareja
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Traemos las transacciones para pasárselas a la lista
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

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

        <main className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl mb-6 text-white font-semibold flex items-center gap-2">
            Panel de Control
          </h2>
          
          <ResumenBalances />

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
