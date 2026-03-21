import { createClient } from '@/lib/supabase/server'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react'

// NUEVO: Función para formatear con puntitos de miles (Ej: $850.000)
const formatearDinero = (monto: number) => {
  const numero = Math.abs(monto).toLocaleString('es-AR', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  });
  return monto < 0 ? `-$${numero}` : `$${numero}`;
}

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
  let gastosTotales = 0
  let meDeben = 0
  let debo = 0

  transacciones.forEach((t) => {
    const monto = Number(t.monto)
    if (t.tipo === 'ingreso' && t.usuario_id === user.id) ingresosTotales += monto
    if (t.tipo === 'gasto' && (t.usuario_id === user.id || t.es_compartido)) gastosTotales += (t.es_compartido ? monto / 2 : monto)
    
    // Lógica Split Pareja
    if (t.es_compartido && t.tipo === 'gasto') {
      const mitad = monto / 2
      if (t.pagado_por === user.id) meDeben += mitad
      else debo += mitad
    }
  })

  const saldoNeto = ingresosTotales - gastosTotales
  const balancePareja = meDeben - debo
  
  // Para la barra visual de "Cuentas Claras"
  const totalCompartido = meDeben + debo || 1 // Evitar división por 0
  const porcentajeMio = (meDeben / totalCompartido) * 100
  const porcentajePareja = (debo / totalCompartido) * 100

  return (
    <div className="flex flex-col gap-6">
      
      {/* TARJETA DE BALANCE PRINCIPAL */}
      <div className="relative p-6 rounded-[32px] text-white overflow-hidden shadow-xl bg-slate-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-10 -mb-10 blur-xl"></div>
        
        <p className="text-white/70 text-sm font-medium mb-1">Saldo Neto Disponible</p>
        <h2 className={`text-4xl font-extrabold tracking-tight mb-6 ${saldoNeto < 0 ? 'text-rose-400' : 'text-white'}`}>
          {formatearDinero(saldoNeto)}
        </h2>
        
        <div className="flex justify-between gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1">
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold mb-1">
              <ArrowDownRight size={14} /> Ingresos
            </div>
            <p className="font-bold">{formatearDinero(ingresosTotales)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1">
            <div className="flex items-center gap-1.5 text-rose-300 text-xs font-semibold mb-1">
              <ArrowUpRight size={14} /> Gastos
            </div>
            <p className="font-bold">{formatearDinero(gastosTotales)}</p>
          </div>
        </div>
      </div>

      {/* MÓDULO CUENTAS CLARAS */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap size={16} className="text-indigo-500" /> Cuentas Claras
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2 text-indigo-600 font-bold text-xs">IG</div>
            <p className="text-[10px] font-semibold text-slate-500">Tú pagaste</p>
            <p className="font-bold text-slate-800">{formatearDinero(meDeben)}</p>
          </div>
          
          <div className="flex-1 px-4 flex flex-col items-center">
            {balancePareja === 0 ? (
              <div className="text-center">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Están a mano</p>
              </div>
            ) : (
              <div className="text-center w-full">
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${balancePareja > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {balancePareja > 0 ? 'Te deben' : 'Debes'}
                </p>
                <div className={`py-1.5 px-3 rounded-full text-sm font-bold inline-block ${balancePareja > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {formatearDinero(Math.abs(balancePareja))}
                </div>
              </div>
            )}
            
            {/* Barra de progreso de gastos compartidos */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 flex overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-l-full" style={{ width: `${porcentajeMio || 50}%` }} />
              <div className="h-full bg-emerald-400 rounded-r-full" style={{ width: `${porcentajePareja || 50}%` }} />
            </div>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2 text-emerald-600 font-bold text-xs">CA</div>
            <p className="text-[10px] font-semibold text-slate-500">Cami pagó</p>
            <p className="font-bold text-slate-800">{formatearDinero(debo)}</p>
          </div>
        </div>
      </div>

    </div>
  )
}
