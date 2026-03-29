'use client'

import { useEffect, useState } from 'react'
import { obtenerEstadoTarjetas } from '@/app/actions/reportes'
import { descargarComoPdf } from '@/lib/exportarPdf'
import { CreditCard } from 'lucide-react'
import { TarjetaReporte } from './TarjetaReporte'

const formatearMonto = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

export function ReporteEstadoTarjetas() {
  const [data, setData] = useState<Awaited<ReturnType<typeof obtenerEstadoTarjetas>>['data']>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerEstadoTarjetas().then((r) => {
      setData(r.data)
      setFetchError(r.error)
      setLoading(false)
    })
  }, [])

  const handlePdf = () => {
    if (!data) return
    const cuotasHtml = data.cuotas.length > 0
      ? `
        <div class="section">
          <h2>Cuotas pendientes</h2>
          <table>
            <tr><th>Tarjeta</th><th>Concepto</th><th>Cuota</th><th>Monto</th><th style="text-align:right">Restante</th></tr>
            ${data.cuotas.map((c) => `
              <tr>
                <td>${c.tarjetaNombre}</td>
                <td>${c.detalle}</td>
                <td>${c.cuotaActual}/${c.cuotasTotales}</td>
                <td>$ ${formatearMonto(c.montoCuota)}</td>
                <td style="text-align:right">$ ${formatearMonto(c.totalRestante)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `
      : '<p>No hay cuotas pendientes.</p>'
    const html = `
      <h1>Estado de Tarjetas - Duo Finance</h1>
      <p class="fecha">Cuotas pendientes y proyecciones</p>
      <div class="section">
        <table>
          <tr><td><strong>Deuda total en cuotas</strong></td><td style="text-align:right" class="total negativo">$ ${formatearMonto(data.deudaTotal)}</td></tr>
        </table>
      </div>
      ${cuotasHtml}
    `
    descargarComoPdf('Estado de Tarjetas', html)
  }

  if (loading) return <TarjetaReporte title="Estado de Tarjetas" desc="Cuotas pendientes y proyecciones." icon={CreditCard} color="text-indigo-400" bg="bg-indigo-500/10"><p className="text-zinc-500 text-sm">Cargando...</p></TarjetaReporte>

  if (fetchError || !data) {
    return (
      <TarjetaReporte title="Estado de Tarjetas" desc="Cuotas pendientes y proyecciones." icon={CreditCard} color="text-indigo-400" bg="bg-indigo-500/10">
        <p className="text-rose-400 text-sm">{fetchError || 'No se pudo cargar el estado de tarjetas.'}</p>
      </TarjetaReporte>
    )
  }

  return (
    <TarjetaReporte
      title="Estado de Tarjetas"
      desc={`${data?.cuotas.length || 0} cuotas pendientes • $ ${formatearMonto(data?.deudaTotal || 0)}`}
      icon={CreditCard}
      color="text-indigo-400"
      bg="bg-indigo-500/10"
      onExportarPDF={data && data.cuotas.length > 0 ? handlePdf : undefined}
    >
      <div className="space-y-4">
        <div className="bg-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Deuda total en cuotas</p>
          <p className="text-2xl font-black text-rose-400">$ {formatearMonto(data?.deudaTotal || 0)}</p>
        </div>
        {data && data.cuotas.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Detalle</p>
            {data.cuotas.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-zinc-800">
                <div>
                  <p className="text-white font-medium">{c.detalle}</p>
                  <p className="text-zinc-500 text-xs">{c.tarjetaNombre} • {c.cuotaActual}/{c.cuotasTotales}</p>
                </div>
                <span className="text-rose-400 font-semibold">$ {formatearMonto(c.totalRestante)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No hay cuotas pendientes.</p>
        )}
      </div>
    </TarjetaReporte>
  )
}
