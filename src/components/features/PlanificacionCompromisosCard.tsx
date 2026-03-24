'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Plus } from 'lucide-react'
import { ModalAgregarCompromiso } from './ModalAgregarCompromiso'

type GastoFijo = { id: string; descripcion: string | null; categoria: string; monto: number }
type Cuota = { id: string; descripcion: string | null; monto: number }

export function PlanificacionCompromisosCard({
  gastosFijosLista,
  cuotasProximoMes,
}: {
  gastosFijosLista: GastoFijo[]
  cuotasProximoMes: Cuota[]
}) {
  const [modalAbierto, setModalAbierto] = useState(false)

  const handleAgregar = () => {
    setModalAbierto(true)
  }

  return (
    <>
      <Card>
        <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-700 pb-2">
          El mes que viene tenés que pagar:
        </h3>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          <p className="text-xs font-bold text-zinc-500 uppercase">Servicios Fijos</p>
          {gastosFijosLista.map((g) => (
            <div key={g.id} className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center bg-zinc-900/50 p-3 rounded-lg min-w-0">
              <span className="text-sm text-zinc-300 break-words min-w-0 flex-1">{g.descripcion || g.categoria}</span>
              <span className="text-sm font-bold text-rose-400 shrink-0 tabular-nums sm:text-right">-${g.monto.toLocaleString('es-AR')}</span>
            </div>
          ))}
          <p className="text-xs font-bold text-zinc-500 uppercase pt-2">Cuotas de Tarjetas</p>
          {cuotasProximoMes.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/10 min-w-0">
              <span className="text-sm text-indigo-200 break-words min-w-0 flex-1">{c.descripcion}</span>
              <span className="text-sm font-bold text-indigo-400 shrink-0 tabular-nums sm:text-right">-${c.monto.toLocaleString('es-AR')}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAgregar}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-lg border border-dashed border-zinc-600 text-zinc-500 hover:border-zinc-500 hover:text-zinc-400 hover:bg-zinc-800/50 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Agregar compromiso
          </button>
        </div>
      </Card>

      <ModalAgregarCompromiso isOpen={modalAbierto} onClose={() => setModalAbierto(false)} />
    </>
  )
}
