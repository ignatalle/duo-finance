import { Card } from '@/components/ui/Card'
import { Bell, AlertTriangle, Calendar } from 'lucide-react'

export function DashboardAlertas() {
  return (
    <Card className="md:col-span-2">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Bell size={20} className="text-amber-400" /> Inteligencia y Alertas
      </h3>
      <div className="space-y-3">
        {/* Alerta de Presupuesto */}
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-4 items-start transition-all hover:bg-rose-500/20 cursor-pointer">
          <div className="bg-rose-500/20 p-2 rounded-lg">
            <AlertTriangle className="text-rose-400" size={20} />
          </div>
          <div>
            <p className="text-white font-medium">Frená en &quot;Salidas&quot;</p>
            <p className="text-slate-400 text-sm">Gastaste el 90% de tu presupuesto. Quedan 9 días.</p>
          </div>
        </div>

        {/* Alerta de Tarjeta */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 items-start transition-all hover:bg-blue-500/20 cursor-pointer">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Calendar className="text-blue-400" size={20} />
          </div>
          <div>
            <p className="text-white font-medium">Cierre Visa en 4 días</p>
            <p className="text-slate-400 text-sm">Proyectamos un resumen de $145.000.</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
