'use client'

import { useState } from 'react'
import { FileText, FileDown, Loader2 } from 'lucide-react'

interface TarjetaReporteProps {
  title: string
  desc: string
  icon: typeof FileText
  color: string
  bg: string
  children: React.ReactNode
  onExportarPDF?: () => void
  loading?: boolean
}

export function TarjetaReporte({
  title,
  desc,
  icon: Icon,
  color,
  bg,
  children,
  onExportarPDF,
  loading = false,
}: TarjetaReporteProps) {
  const [expandida, setExpandida] = useState(false)

  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden transition-all ${
        expandida ? 'ring-2 ring-teal-500/50' : 'hover:border-zinc-700'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpandida(!expandida)}
        className="w-full p-6 text-left flex flex-col"
      >
        <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
          <Icon className={color} size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400">{desc}</p>
        <p className="text-xs text-teal-400 mt-3">
          {expandida ? '▲ Ocultar reporte' : '▼ Ver reporte'}
        </p>
      </button>

      {expandida && (
        <div className="border-t border-zinc-800 p-6 space-y-4">
          {children}
          {onExportarPDF && (
            <button
              type="button"
              onClick={onExportarPDF}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileDown size={18} />
              )}
              Descargar PDF
            </button>
          )}
        </div>
      )}
    </div>
  )
}
