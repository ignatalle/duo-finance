import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { BotonExportar } from '@/components/features/BotonExportar'
import { SelectorMes } from '@/components/features/SelectorMes'
import { FileText, CreditCard, TrendingUp } from 'lucide-react'

export default async function ReportesPage(props: { searchParams: Promise<{ mes?: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const searchParams = await props.searchParams
  const mesParam = searchParams.mes || new Date().toISOString().slice(0, 7)

  const reportes = [
    { title: 'Resumen Mensual', desc: 'Ingresos, gastos y categorías del mes.', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Estado de Tarjetas', desc: 'Cuotas pendientes y proyecciones.', icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Balance Anual', desc: 'Evolución de tu patrimonio mes a mes.', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Reportes y Exportación</h2>
          <p className="text-zinc-400 text-sm">Descargá tu información en CSV para Excel.</p>
        </div>
        <div className="flex items-center gap-4">
          <SelectorMes />
          <BotonExportar mesActual={mesParam} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportes.map((rep, i) => (
          <Card key={i} className="hover:border-zinc-500 transition-all flex flex-col h-full">
            <div className={`w-14 h-14 rounded-2xl ${rep.bg} flex items-center justify-center mb-4`}>
              <rep.icon className={rep.color} size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{rep.title}</h3>
            <p className="text-sm text-zinc-400 mb-6 flex-1">{rep.desc}</p>
            <p className="text-xs text-zinc-500">Usá el botón Exportar arriba para descargar CSV.</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
