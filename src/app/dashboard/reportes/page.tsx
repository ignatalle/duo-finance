import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BotonExportar } from '@/components/features/BotonExportar'
import { SelectorMes } from '@/components/features/SelectorMes'
import { ReporteResumenMensual } from '@/components/features/reportes/ReporteResumenMensual'
import { ReporteEstadoTarjetas } from '@/components/features/reportes/ReporteEstadoTarjetas'
import { ReporteBalanceAnual } from '@/components/features/reportes/ReporteBalanceAnual'

export default async function ReportesPage(props: { searchParams: Promise<{ mes?: string }> }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const searchParams = await props.searchParams
  const mesParam = searchParams.mes || new Date().toISOString().slice(0, 7)
  const anio = mesParam.split('-')[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Reportes y PDF</h2>
          <p className="text-zinc-400 text-sm">Resúmenes con datos reales. Exportá a CSV o descargá como PDF.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 min-w-0 w-full sm:w-auto">
          <SelectorMes />
          <BotonExportar mesActual={mesParam} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <ReporteResumenMensual mesParam={mesParam} />
        <ReporteEstadoTarjetas />
        <ReporteBalanceAnual anio={anio} />
      </div>
    </div>
  )
}
