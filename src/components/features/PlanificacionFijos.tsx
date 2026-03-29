'use client'

import { useDashboardModal } from '@/components/dashboard/DashboardModalContext'
import { Clock, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Transaccion } from '@/types'
import { ListaGastosFijos } from '@/app/dashboard/gastos/ListaGastosFijos'

interface PlanificacionFijosProps {
  ingresos: Transaccion[]
  gastosFijos: Transaccion[]
}

export function PlanificacionFijos({ ingresos, gastosFijos }: PlanificacionFijosProps) {
  const modal = useDashboardModal()

  const cobroTexto = (t: Transaccion) => {
    if (t.vencimiento_en) {
      const dia = format(new Date(t.vencimiento_en), 'd', { locale: es })
      return `Cobro el ${dia} de cada mes`
    }
    const dia = format(new Date(t.created_at), 'd', { locale: es })
    return `Cobro el ${dia} de cada mes`
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 md:p-6 min-w-0">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Clock size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Fijos</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Lo que sucede todos los meses</p>
          </div>
        </div>
        {modal && (
          <button
            type="button"
            onClick={modal.openGasto}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white text-xs font-semibold transition-colors shrink-0 self-start md:self-auto"
          >
            <Plus size={14} /> Agregar
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* INGRESOS MENSUALES */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ArrowUpRight size={14} className="text-emerald-500" /> Ingresos mensuales
          </p>
          {ingresos.length === 0 ? (
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-center">
              <p className="text-zinc-500 text-sm">No hay ingresos registrados este mes.</p>
              {modal && (
                <button
                  type="button"
                  onClick={modal.openIngreso}
                  className="mt-2 text-emerald-400 text-sm font-semibold hover:underline flex items-center gap-1 justify-center mx-auto"
                >
                  <Plus size={14} /> Agregar ingreso
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {ingresos.map((t) => (
                <div
                  key={t.id}
                  className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white break-words">{t.descripcion || t.categoria}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{cobroTexto(t)}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-lg shrink-0 sm:text-right">
                    $ {Number(t.monto).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GASTOS MENSUALES */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ArrowDownRight size={14} className="text-blue-500" /> Gastos mensuales
          </p>
          {gastosFijos.length === 0 ? (
            <div className="bg-zinc-800/50 border border-dashed border-zinc-600 rounded-xl p-4 md:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-zinc-500 text-sm">No hay gastos fijos configurados...</p>
              {modal && (
                <button
                  type="button"
                  onClick={modal.openGasto}
                  className="shrink-0 w-8 h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          ) : (
            <ListaGastosFijos gastos={gastosFijos} />
          )}
        </div>
      </div>
    </div>
  )
}
