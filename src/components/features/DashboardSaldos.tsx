import { createClient } from '@/lib/supabase/server'
import { obtenerGastosFijosPendientes } from '@/app/actions/transacciones'
import { calcularSaldoDisponibleReal } from '@/lib/calculos'
import { Wallet, AlertTriangle } from 'lucide-react'

export async function DashboardSaldos({ inicioMes, finMes, mesRef, usuarioId, metaAhorroGuardada = 0 }: {
  inicioMes: string
  finMes: string
  mesRef: string
  usuarioId: string
  metaAhorroGuardada?: number
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
  const saldoDisponibleReal = calcularSaldoDisponibleReal(saldoTotalContable, pendientesFijos) - (metaAhorroGuardada || 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Saldo Total Contable</p>
        <h3 className={`text-3xl font-bold mb-2 ${saldoTotalContable >= 0 ? 'text-white' : 'text-white'}`}>
          ${saldoTotalContable.toLocaleString('es-AR')}
        </h3>
        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Wallet size={12} /> Suma de bancos y billeteras
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          Saldo Disponible Real <AlertTriangle size={12} className="text-blue-400" title="Info" />
        </p>
        <h3 className="text-3xl font-bold text-white mb-2">
          ${saldoDisponibleReal.toLocaleString('es-AR')}
        </h3>
        <p className="text-xs text-blue-400/90">
          {pendientesFijos > 0 && metaAhorroGuardada && metaAhorroGuardada > 0
            ? `Separamos $${pendientesFijos.toLocaleString('es-AR')} para fijos y $${metaAhorroGuardada.toLocaleString('es-AR')} para tu meta de ahorro.`
            : pendientesFijos > 0
              ? `Separamos $${pendientesFijos.toLocaleString('es-AR')} para los fijos que vencen pronto.`
              : metaAhorroGuardada && metaAhorroGuardada > 0
                ? `Separamos $${metaAhorroGuardada.toLocaleString('es-AR')} para tu meta de ahorro.`
                : 'Todo tu saldo está disponible.'}
        </p>
      </div>
    </div>
  )
}
