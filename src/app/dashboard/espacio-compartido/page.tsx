import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ModuloPareja } from '@/components/features/ModuloPareja'
import { ParejaResumen } from '@/components/features/ParejaResumen'
import { SelectorMes } from '@/components/features/SelectorMes'

export default async function EspacioCompartidoPage(props: { searchParams: Promise<{ mes?: string }> }) {
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
    .select('pareja_id')
    .eq('id', user.id)
    .single()

  let codigoPareja: string | null = null
  let nombrePareja = 'Tu pareja'
  if (perfil?.pareja_id) {
    const { data: pareja } = await supabase
      .from('parejas')
      .select('codigo, nombre')
      .eq('id', perfil.pareja_id)
      .single()
    codigoPareja = pareja?.codigo ?? null
    nombrePareja = pareja?.nombre || 'Tu pareja'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SelectorMes />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-[32px] bg-zinc-900/40 border border-zinc-800 p-4">
          <ModuloPareja parejaId={perfil?.pareja_id} codigoPareja={codigoPareja} />
        </div>
        {perfil?.pareja_id && (
          <ParejaResumen
            inicioMes={inicioMes}
            finMes={finMes}
            usuarioId={user.id}
            parejaId={perfil.pareja_id}
            nombrePareja={nombrePareja}
          />
        )}
      </div>
    </div>
  )
}
