import { createClient } from '@/lib/supabase/server'
import { obtenerGastosFijosPendientes } from '@/app/actions/transacciones'
import { calcularSaldoDisponibleReal } from '@/lib/calculos'
import { Card } from '@/components/ui/Card'
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
  const saldoTotalContable = ingresos - gastos

  const { data: gastosFijosPendientes } = await obtenerGastosFijosPendientes(usuarioId, mesRef)
  const pendientesFijos = gastosFijosPendientes?.reduce((a, g) => a + g.monto, 0) || 0
  const saldoDisponibleReal = calcularSaldoDisponibleReal(saldoTotalContable, pendientesFijos)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/20 rounded-full blur-3xl -mr-10 -mt-10" />
        <p className="text-slate-400 text-sm font-medium mb-1">Saldo Total Contable</p>
        <h3 className="text-4xl font-bold text-white mb-2">
          ${saldoTotalContable.toLocaleString('es-AR')}
        </h3>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Wallet size={12} /> Suma de bancos y billeteras
        </p>
      </Card>

      <Card className="bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
        <p className="text-indigo-300 text-sm font-medium mb-1 flex items-center gap-1">
          Saldo Disponible REAL <AlertTriangle size={14} className="text-indigo-400" />
        </p>
        <h3 className="text-4xl font-bold text-indigo-400 mb-2">
          ${saldoDisponibleReal.toLocaleString('es-AR')}
        </h3>
        <p className="text-xs text-indigo-300/80">
          Separamos ${pendientesFijos.toLocaleString('es-AR')} para los fijos que vencen pronto.
        </p>
      </Card>
    </div>
  )
}
