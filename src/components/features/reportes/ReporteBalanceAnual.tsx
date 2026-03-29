'use client'

import { useEffect, useState } from 'react'
import { obtenerBalanceAnual } from '@/app/actions/reportes'
import { descargarComoPdf } from '@/lib/exportarPdf'
import { TrendingUp } from 'lucide-react'
import { TarjetaReporte } from './TarjetaReporte'

const formatearMonto = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

export function ReporteBalanceAnual({ anio }: { anio: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof obtenerBalanceAnual>>['data']>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obtenerBalanceAnual(anio).then((r) => {
      setData(r.data)
      setFetchError(r.error)
      setLoading(false)
    })
  }, [anio])

  const handlePdf = () => {
    if (!data || data.length === 0) return
    const totalIngresos = data.reduce((a, m) => a + m.ingresos, 0)
    const totalGastos = data.reduce((a, m) => a + m.gastos, 0)
    const html = `
      <h1>Balance Anual - Duo Finance</h1>
      <p class="fecha">Año ${anio}</p>
      <div class="section">
        <table>
          <tr><td><strong>Total ingresos ${anio}</strong></td><td style="text-align:right" class="positivo">$ ${formatearMonto(totalIngresos)}</td></tr>
          <tr><td><strong>Total gastos ${anio}</strong></td><td style="text-align:right" class="negativo">$ ${formatearMonto(totalGastos)}</td></tr>
          <tr><td><strong>Balance anual</strong></td><td style="text-align:right" class="total ${totalIngresos - totalGastos >= 0 ? 'positivo' : 'negativo'}">$ ${formatearMonto(totalIngresos - totalGastos)}</td></tr>
        </table>
      </div>
      <div class="section">
        <h2>Evolución mes a mes</h2>
        <table>
          <tr><th>Mes</th><th style="text-align:right">Ingresos</th><th style="text-align:right">Gastos</th><th style="text-align:right">Saldo</th></tr>
          ${data.map((m) => `
            <tr>
              <td>${m.mesNombre}</td>
              <td style="text-align:right">$ ${formatearMonto(m.ingresos)}</td>
              <td style="text-align:right">$ ${formatearMonto(m.gastos)}</td>
              <td style="text-align:right" class="${m.saldo >= 0 ? 'positivo' : 'negativo'}">$ ${formatearMonto(m.saldo)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `
    descargarComoPdf(`Balance Anual ${anio}`, html)
  }

  const rows = data ?? []
  const totalIngresos = rows.reduce((a, m) => a + m.ingresos, 0)
  const totalGastos = rows.reduce((a, m) => a + m.gastos, 0)
  const balanceAnual = totalIngresos - totalGastos

  if (loading) return <TarjetaReporte title="Balance Anual" desc="Evolución de tu patrimonio mes a mes." icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-500/10"><p className="text-zinc-500 text-sm">Cargando...</p></TarjetaReporte>

  if (fetchError || !data) {
    return (
      <TarjetaReporte title="Balance Anual" desc="Evolución de tu patrimonio mes a mes." icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-500/10">
        <p className="text-rose-400 text-sm">{fetchError || 'No se pudo cargar el balance.'}</p>
      </TarjetaReporte>
    )
  }

  return (
    <TarjetaReporte
      title="Balance Anual"
      desc={`${anio} • Balance: $ ${formatearMonto(balanceAnual)}`}
      icon={TrendingUp}
      color="text-emerald-400"
      bg="bg-emerald-500/10"
      onExportarPDF={handlePdf}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Ingresos {anio}</p>
            <p className="text-xl font-bold text-teal-400">$ {formatearMonto(totalIngresos)}</p>
          </div>
          <div className="bg-zinc-800/80 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Gastos {anio}</p>
            <p className="text-xl font-bold text-rose-400">$ {formatearMonto(totalGastos)}</p>
          </div>
        </div>
        <div className="bg-zinc-800/80 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Balance anual</p>
          <p className={`text-2xl font-black ${balanceAnual >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
            $ {formatearMonto(balanceAnual)}
          </p>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Por mes</p>
          {rows.map((m) => (
            <div key={m.mes} className="flex justify-between text-sm py-1">
              <span className="text-zinc-400">{m.mesNombre}</span>
              <span className={m.saldo >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                $ {formatearMonto(m.saldo)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TarjetaReporte>
  )
}
