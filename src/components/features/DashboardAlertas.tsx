import { createClient } from '@/lib/supabase/server'
import { obtenerConsumoPorCategoria } from '@/app/actions/transacciones'
import { obtenerPresupuestos } from '@/app/actions/presupuestos'
import { obtenerTarjetas } from '@/app/actions/tarjetas'
import { Bell, Calendar, AlertTriangle } from 'lucide-react'

export async function DashboardAlertas({ mesRef, usuarioId }: { mesRef: string; usuarioId: string }) {
  const { data: consumo } = await obtenerConsumoPorCategoria(usuarioId, mesRef)
  const { data: presupuestos } = await obtenerPresupuestos(mesRef)
  const { data: tarjetas } = await obtenerTarjetas()

  const alertas: { tipo: 'warning' | 'info'; titulo: string; desc: string }[] = []

  for (const p of presupuestos || []) {
    const consumido = consumo[p.categoria] || 0
    const porcentaje = p.limite_mensual > 0 ? (consumido / p.limite_mensual) * 100 : 0
    if (porcentaje >= 85) {
      alertas.push({
        tipo: 'warning',
        titulo: `Frená en "${p.categoria}"`,
        desc: `Gastaste el ${Math.round(porcentaje)}% de tu presupuesto.`,
      })
    }
  }

  const hoy = new Date()
  for (const t of tarjetas || []) {
    const diasHastaCierre = t.cierre_dia - hoy.getDate()
    if (diasHastaCierre > 0 && diasHastaCierre <= 5) {
      alertas.push({
        tipo: 'info',
        titulo: `Cierre ${t.nombre} en ${diasHastaCierre} días`,
        desc: 'Revisá tus consumos antes del resumen.',
      })
    }
  }

  if (alertas.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell size={20} className="text-amber-400" /> Inteligencia y Alertas
        </h3>
        <p className="text-zinc-500 text-sm">No hay alertas por ahora. ¡Bien! 👍</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Bell size={20} className="text-amber-400" /> Inteligencia y Alertas
      </h3>
      <div className="space-y-3">
        {alertas.map((a, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl flex gap-4 items-start transition-all cursor-pointer ${
              a.tipo === 'warning'
                ? 'bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20'
                : 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                a.tipo === 'warning' ? 'bg-rose-500/20' : 'bg-blue-500/20'
              }`}
            >
              {a.tipo === 'warning' ? (
                <AlertTriangle className="text-rose-400" size={20} />
              ) : (
                <Calendar className="text-blue-400" size={20} />
              )}
            </div>
            <div>
              <p className="text-white font-medium">{a.titulo}</p>
              <p className="text-zinc-400 text-sm">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
