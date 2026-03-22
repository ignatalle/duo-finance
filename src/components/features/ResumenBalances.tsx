import { createClient } from '@/lib/supabase/server'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

export async function ResumenBalances({ inicioMes, finMes }: { inicioMes: string, finMes: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Traemos solo lo necesario para calcular los totales
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('monto, tipo')
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)

  const ingresos = transacciones?.filter(t => t.tipo === 'ingreso').reduce((acc, curr) => acc + curr.monto, 0) || 0
  const gastos = transacciones?.filter(t => t.tipo === 'gasto').reduce((acc, curr) => acc + curr.monto, 0) || 0
  const saldo = ingresos - gastos

  // Formateador de moneda argentina
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(valor)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Tarjeta Ingresos */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 shadow-lg backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-10 bg-emerald-500 transition-opacity group-hover:opacity-20 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Ingresos</h3>
        </div>
        <p className="text-4xl font-bold tracking-tight text-white">{formatearMoneda(ingresos)}</p>
      </div>

      {/* Tarjeta Gastos */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 shadow-lg backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-10 bg-rose-500 transition-opacity group-hover:opacity-20 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Gastos</h3>
        </div>
        <p className="text-4xl font-bold tracking-tight text-white">{formatearMoneda(gastos)}</p>
      </div>

      {/* Tarjeta Saldo Total */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 shadow-lg backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-10 bg-blue-500 transition-opacity group-hover:opacity-20 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Saldo Disponible</h3>
        </div>
        <p className={`text-4xl font-bold tracking-tight ${saldo < 0 ? 'text-rose-400' : 'text-white'}`}>
          {formatearMoneda(saldo)}
        </p>
      </div>

    </div>
  )
}
