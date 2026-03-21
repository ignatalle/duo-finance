'use client'

import { useState } from 'react'
import { obtenerDatosExportacion } from '@/app/actions/transacciones'
import { Download, FileSpreadsheet, Calendar } from 'lucide-react'

export function BotonExportar({ mesActual }: { mesActual: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [year, month] = mesActual.split('-')

  const descargarCSV = async (rango: 'mes' | 'anio') => {
    setLoading(true)
    const { data } = await obtenerDatosExportacion(rango, mesActual)
    
    if (data && data.length > 0) {
      const cabeceras = ['Fecha', 'Tipo', 'Monto', 'Categoría', 'Descripción', 'Estado', 'Tipo de Gasto', 'Cuota', 'Compartido']
      
      const filas = data.map(t => {
        const fechaAr = new Date(t.created_at).toLocaleDateString('es-AR')
        const cuotaStr = t.cuota_actual ? `${t.cuota_actual}/${t.cuota_total}` : 'N/A'
        
        return [
          fechaAr,
          t.tipo.toUpperCase(),
          t.monto,
          t.categoria,
          t.descripcion || 'Sin descripción',
          t.estado?.toUpperCase() || 'PAGADO',
          t.tipo_gasto?.toUpperCase() || 'N/A',
          cuotaStr,
          t.es_compartido ? 'SI' : 'NO'
        ]
      })

      const csvContent = [
        cabeceras.join(','),
        ...filas.map(fila => fila.map(valor => `"${valor}"`).join(','))
      ].join('\n')

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DuoFinance_${rango === 'mes' ? mesActual : year}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      alert('No hay movimientos registrados en este periodo.')
    }
    
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center"
        title="Exportar datos"
      >
        <Download size={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exportar a Excel</span>
            </div>
            <button 
              type="button"
              onClick={() => descargarCSV('mes')}
              disabled={loading}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3"
            >
              <Calendar size={16} className="text-indigo-500" /> Solo {month}/{year}
            </button>
            <button 
              type="button"
              onClick={() => descargarCSV('anio')}
              disabled={loading}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3 border-t border-slate-50"
            >
              <FileSpreadsheet size={16} className="text-emerald-500" /> Todo el año {year}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
