import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FormularioTransaccion } from '@/components/features/FormularioTransaccion'
import { ListaTransacciones } from '@/components/features/ListaTransacciones'
import { ResumenBalances } from '@/components/features/ResumenBalances'
import { SelectorMes } from '@/components/features/SelectorMes'
import { BotonExportar } from '@/components/features/BotonExportar'
import { ModuloPareja } from '@/components/features/ModuloPareja'
import { MenuConfiguracion } from '@/components/features/MenuConfiguracion'
import { Wallet, PieChart, Target, LogOut } from 'lucide-react'

export default async function DashboardPage(props: { searchParams: Promise<{ mes?: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/login')

  const searchParams = await props.searchParams
  const mesParam = searchParams.mes || new Date().toISOString().slice(0, 7)
  const [year, month] = mesParam.split('-')
  
  const inicioMes = new Date(Number(year), Number(month) - 1, 1).toISOString()
  const finMes = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()

  // 1. Traemos tu perfil para saber si ya estás vinculado
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('pareja_id')
    .eq('id', user.id)
    .single()

  // Si tiene pareja, traemos el código para mostrarlo
  let codigoPareja: string | null = null
  if (perfil?.pareja_id) {
    const { data: pareja } = await supabase
      .from('parejas')
      .select('codigo')
      .eq('id', perfil.pareja_id)
      .single()
    codigoPareja = pareja?.codigo ?? null
  }

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: false })

  const cerrarSesion = async () => {
    'use server'
    const supabaseAuth = await createClient()
    await supabaseAuth.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex justify-center pb-24">
      <div className="w-full max-w-md bg-slate-50 relative min-h-screen shadow-2xl overflow-hidden">
        
        {/* ENCABEZADO SUPERIOR MODERNO */}
        <div className="pt-10 pb-6 px-6 bg-white rounded-b-[40px] shadow-sm relative z-10">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="shrink-0">
              <MenuConfiguracion parejaId={perfil?.pareja_id} />
            </div>
            <div className="w-12 h-10 relative flex items-center shrink-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 absolute left-0 border-2 border-white z-10 flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-indigo-600">IG</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 absolute left-4 border-2 border-white flex items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-emerald-600">CA</span>
              </div>
            </div>
            
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 shrink-0 min-w-0 truncate">Duo Finance</h1>
            
            <form action={cerrarSesion} className="shrink-0">
              <button type="submit" title="Cerrar sesión" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm">
                <LogOut size={16} />
              </button>
            </form>
          </div>

          <div className="flex justify-center items-center gap-3">
            <SelectorMes />
            <BotonExportar mesActual={mesParam} />
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="px-6 pt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ResumenBalances inicioMes={inicioMes} finMes={finMes} />
          
          {/* ACÁ VUELVE EL MÓDULO DE PAREJA */}
          <ModuloPareja parejaId={perfil?.pareja_id} codigoPareja={codigoPareja} />

          <div className="pb-36">
            <ListaTransacciones transacciones={transacciones || []} usuarioActualId={user.id} />
          </div>
        </div>

        <FormularioTransaccion />

        {/* BARRA DE NAVEGACIÓN INFERIOR FLOTANTE */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-30 pb-safe">
          <div className="flex justify-between items-center max-w-[280px] mx-auto">
            <button type="button" className="flex flex-col items-center gap-1 text-slate-800 transition-colors">
              <Wallet size={24} className="fill-slate-800" />
              <span className="text-[10px] font-bold">Inicio</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-500 transition-colors">
              <PieChart size={24} />
              <span className="text-[10px] font-bold">Análisis</span>
            </button>
            <button type="button" className="flex flex-col items-center gap-1 text-slate-300 hover:text-slate-500 transition-colors">
              <Target size={24} />
              <span className="text-[10px] font-bold">Metas</span>
            </button>
          </div>
        </nav>

      </div>
    </div>
  )
}
