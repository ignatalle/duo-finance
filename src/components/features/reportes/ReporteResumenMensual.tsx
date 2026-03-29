'use client'

import { useEffect, useState } from 'react'
import { obtenerResumenMensual, type ResumenMensual } from '@/app/actions/reportes'
import { descargarComoPdf } from '@/lib/exportarPdf'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FileText } from 'lucide-react'
import { TarjetaReporte } from './TarjetaReporte'

const formatearMonto = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

export function ReporteResumenMensual({ mesParam }: { mesParam: string }) {
  const [data, setData] = useState<ResumenMensual | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerResumenMensual(mesParam).then((r) => {
      setData(r.data)
      setFetchError(r.error)
      setLoading(false)
    })
  }, [mesParam])

  const handlePdf = () => {
    if (!data) return
    const mesNombre = format(new Date(mesParam + '-01'), 'MMMM yyyy', { locale: es })
    const categoriasHtml = data.porCategoria.length > 0
      ? `
        <div class="section">
          <h2>Gastos por categoría</h2>
          <table>
            <tr><th>Categoría</th><th style="text-align:right">Total</th></tr>
            ${data.porCategoria.map((c) => `
              <tr><td>${c.categoria}</td><td style="text-align:right">$ ${formatearMonto(c.total)}</td></tr>
            `).join('')}
          </table>
        </div>
      `
      : ''
    const html = `
      <h1>Resumen Mensual - Duo Finance</h1>
      <p class="fecha">${mesNombre} • ${data.totalTransacciones} movimientos</p>
      <div class="section">
        <table>
          <tr><td>Total Ingresos</td><td style="text-align:right" class="positivo">$ ${formatearMonto(data.ingresos)}</td></tr>
          <tr><td>Total Gastos</td><td style="text-align:right" class="negativo">$ ${formatearMonto(data.gastos)}</td></tr>
          <tr><td><strong>Saldo del mes</strong></td><td style="text-align:right" class="total ${data.saldo >= 0 ? 'positivo' : 'negativo'}">$ ${formatearMonto(data.saldo)}</td></tr>
        </table>
      </div>
      ${categoriasHtml}
    `
    descargarComoPdf(`Resumen ${mesNombre}`, html)
  }

  if (loading) return <TarjetaReporte title="Resumen Mensual" desc="Ingresos, gastos y categorías del mes." icon={FileText} color="text-blue-400" bg="bg-blue-500/10"><p className="text-zinc-500 text-sm">Cargando...</p></TarjetaReporte>

  if (fetchError || !data) {
    return (
      <TarjetaReporte title="Resumen Mensual" desc="Ingresos, gastos y categorías del mes." icon={FileText} color="text-blue-400" bg="bg-blue-500/10">
        <p className="text-rose-400 text-sm">{fetchError || 'No se pudo cargar el resumen.'}</p>
      </TarjetaReporte>
    )
  }

  const mesNombre = format(new Date(mesParam + '-01'), 'MMMM yyyy', { locale: es })

  return (
    <TarjetaReporte
      title="Resumen Mensual"
      desc={`${mesNombre} • ${data.totalTransacciones || 0} movimientos`}
      icon={FileText}
      color="text-blue-400"
      bg="bg-blue-500/10"
      onExportarPDF={handlePdf}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Ingresos</p>
            <p className="text-xl font-bold text-teal-400">$ {formatearMonto(data.ingresos)}</p>
          </div>
          <div className="bg-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Gastos</p>
            <p className="text-xl font-bold text-rose-400">$ {formatearMonto(data.gastos)}</p>
          </div>
        </div>
        <div className="bg-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Saldo del mes</p>
          <p className={`text-2xl font-black ${data.saldo >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
            $ {formatearMonto(data.saldo)}
          </p>
        </div>
        {data.porCategoria.length > 0 && (
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Gastos por categoría</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.porCategoria.slice(0, 8).map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300 truncate">{c.categoria}</span>
                  <span className="text-white font-medium">$ {formatearMonto(c.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TarjetaReporte>
  )
}
