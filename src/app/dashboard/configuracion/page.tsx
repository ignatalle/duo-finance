import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MenuConfiguracion } from '@/components/features/MenuConfiguracion'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('pareja_id')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-50">Configuración</h1>
      <div className="rounded-[32px] bg-zinc-900/40 border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Cuenta y Pareja</h2>
          <MenuConfiguracion parejaId={perfil?.pareja_id} />
        </div>
        <p className="text-sm text-zinc-400">
          Usá el menú de configuración para desvincular tu cuenta de la pareja o acceder a otras opciones.
        </p>
      </div>
    </div>
  )
}
