import { createClient } from '@/lib/supabase/server'
import { CheckCircle2 } from 'lucide-react'

export async function DashboardSalud({ inicioMes, finMes, usuarioId }: {
  inicioMes: string
  finMes: string
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

  const porcentajeAhorro = ingresos > 0 ? Math.max(0, ((ingresos - gastos) / ingresos) * 100) : 0
  const recomendado = 20
  const estado = porcentajeAhorro >= recomendado ? 'Excelente' : porcentajeAhorro >= 10 ? 'Aceptable' : 'A mejorar'

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
      <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center mb-4">
        <CheckCircle2 size={40} className="text-emerald-400" />
      </div>
      <h3 className="text-white font-bold text-lg mb-1">Salud {estado}</h3>
      <p className="text-sm text-zinc-400">
        Estás ahorrando el {porcentajeAhorro.toFixed(0)}%{porcentajeAhorro >= recomendado && ' (meta 20% ✓)'}.
      </p>
    </div>
  )
}
