import { Card } from '@/components/ui/Card'
import { CheckCircle2 } from 'lucide-react'

export function DashboardSalud() {
  return (
    <Card className="flex flex-col justify-center items-center text-center h-full">
      <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center mb-4 relative">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow" />
        <CheckCircle2 size={40} className="text-emerald-400" />
      </div>
      <h3 className="text-white font-bold text-lg mb-1">Salud Excelente</h3>
      <p className="text-sm text-slate-400">Estás ahorrando el 20% recomendado este mes.</p>
    </Card>
  )
}
