import { createClient } from '@/lib/supabase/server'
import { obtenerGastosFijosPendientes } from '@/app/actions/transacciones'
import { calcularSaldoDisponibleReal } from '@/lib/calculos'
import { Wallet, AlertTriangle } from 'lucide-react'

export async function DashboardSaldos({ inicioMes, finMes, mesRef, usuarioId }: {
  inicioMes: string
  finMes: string
  mesRef: string
  usuarioId: string
}) {
  const supabase = await createClient()

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('monto, tipo')
    .eq('usuario_id', usuarioId)
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)

  const ingresos = transacciones?.filter((t) => t.tipo === 'ingreso').reduce((a, t) => a + t.monto, 0) || 0
  const gastos = transacciones?.filter((t) => t.tipo === 'gasto').reduce((a, t) => a + t.monto, 0) || 0
  const saldoTotal = ingresos - gastos

  const { data: gastosFijosPendientes } = await obtenerGastosFijosPendientes(usuarioId, mesRef)
  const pendientesFijos = gastosFijosPendientes?.reduce((a, g) => a + g.monto, 0) || 0
  const saldoReal = calcularSaldoDisponibleReal(saldoTotal, pendientesFijos)

  const formatear = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-700/20 rounded-full blur-3xl -mr-10 -mt-10" />
        <p className="text-zinc-400 text-sm font-medium mb-1">Saldo Total Contable</p>
        <h3 className="text-4xl font-bold text-white mb-2">{formatear(saldoTotal)}</h3>
        <p className="text-xs text-zinc-500 flex items-center gap-1">
          <Wallet size={12} /> Ingresos menos gastos del mes
        </p>
      </div>

      <div className="bg-indigo-900/40 border border-indigo-500/40 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
        <p className="text-indigo-300 text-sm font-medium mb-1 flex items-center gap-1">
          Saldo Disponible REAL <AlertTriangle size={14} className="text-indigo-400" />
        </p>
        <h3 className="text-4xl font-bold text-indigo-400 mb-2">{formatear(saldoReal)}</h3>
        <p className="text-xs text-indigo-300/80">
          Separamos {formatear(pendientesFijos)} para los fijos que vencen pronto.
        </p>
      </div>
    </div>
  )
}
