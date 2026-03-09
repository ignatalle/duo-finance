import { createClient } from '@/lib/supabase/server'

export async function ResumenBalances({ inicioMes, finMes }: { inicioMes: string, finMes: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)

  if (!transacciones) return null

  let ingresosTotales = 0
  let gastosFijos = 0
  let gastosVariables = 0
  let gastosPendientes = 0
  let meDeben = 0
  let debo = 0

  transacciones.forEach((t) => {
    const monto = Number(t.monto)
    
    if (t.tipo === 'ingreso' && t.usuario_id === user.id) ingresosTotales += monto

    if (t.tipo === 'gasto') {
      let miGasto = (t.es_compartido) ? monto / 2 : (t.usuario_id === user.id ? monto : 0)
      
      if (miGasto > 0) {
        if (t.estado === 'pendiente') gastosPendientes += miGasto
        else if (t.tipo_gasto === 'fijo') gastosFijos += miGasto
        else gastosVariables += miGasto
      }
    }

    if (t.es_compartido && t.tipo === 'gasto') {
      const mitad = monto / 2
      if (t.pagado_por === user.id) meDeben += mitad
      else debo += mitad
    }
  })

  const gastosTotales = gastosFijos + gastosVariables + gastosPendientes
  const saldoNeto = ingresosTotales - gastosTotales
  const balancePareja = meDeben - debo

  const hoy = new Date()
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  const diasRestantes = diasEnMes - hoy.getDate() + 1
  const disponibleDiario = saldoNeto > 0 ? (saldoNeto / diasRestantes) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
      
      {/* 1. Saldo Neto (Real) */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 shadow-lg backdrop-blur-md transition-all hover:border-zinc-700">
        <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-20 ${saldoNeto < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Saldo Neto</h3>
          <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className={`text-3xl font-bold tracking-tight ${saldoNeto < 0 ? 'text-red-400' : 'text-white'}`}>
          ${saldoNeto.toFixed(2)}
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-zinc-500">
          <span className="bg-zinc-800/80 px-2 py-1 rounded-md">Ingresos: ${ingresosTotales.toFixed(0)}</span>
        </div>
      </div>

      {/* 2. Termómetro Diario */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 shadow-lg backdrop-blur-md transition-all hover:border-zinc-700">
        <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-20 ${saldoNeto < 0 ? 'bg-zinc-500' : 'bg-emerald-500'}`}></div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Disp. Diario</h3>
          <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <div className="flex items-baseline gap-1">
          <p className={`text-3xl font-bold tracking-tight ${saldoNeto < 0 ? 'text-zinc-500' : 'text-emerald-400'}`}>
            ${disponibleDiario.toFixed(0)}
          </p>
          <span className="text-sm font-medium text-zinc-500">/día</span>
        </div>
        <p className="mt-3 text-[11px] font-medium text-zinc-500 bg-zinc-800/50 w-fit px-2 py-1 rounded-md">
          Restan {diasRestantes} días
        </p>
      </div>

      {/* 3. Desglose de Gastos */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 shadow-lg backdrop-blur-md transition-all hover:border-zinc-700">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-10 bg-blue-500"></div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Mis Gastos</h3>
          <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <p className="text-3xl font-bold tracking-tight text-white">${gastosTotales.toFixed(0)}</p>
        <div className="mt-3 flex gap-2 text-[10px] font-medium">
          <span className="bg-zinc-800/80 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700/50">Fijos: ${gastosFijos.toFixed(0)}</span>
          {gastosPendientes > 0 && (
            <span className="bg-orange-950/30 text-orange-400 px-2 py-1 rounded-md border border-orange-900/50">Deuda: ${gastosPendientes.toFixed(0)}</span>
          )}
        </div>
      </div>

      {/* 4. Liquidación Pareja */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-5 shadow-lg backdrop-blur-md transition-all hover:border-zinc-700">
        <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-20 ${balancePareja > 0 ? 'bg-emerald-500' : balancePareja < 0 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Split Pareja</h3>
          <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <p className={`text-3xl font-bold tracking-tight ${balancePareja === 0 ? 'text-white' : balancePareja > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {balancePareja > 0 ? '+' : ''}{balancePareja === 0 ? '$0' : `$${balancePareja.toFixed(0)}`}
        </p>
        <p className="mt-3 text-[11px] font-medium text-zinc-500 bg-zinc-800/50 w-fit px-2 py-1 rounded-md">
          {balancePareja > 0 ? 'Te deben' : balancePareja < 0 ? 'Debes pagar' : 'Están a mano'}
        </p>
      </div>

    </div>
  )
}
