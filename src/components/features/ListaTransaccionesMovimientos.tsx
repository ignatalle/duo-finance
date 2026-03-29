'use client'

import { useState, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { ModalEditarTransaccion } from './ModalEditarTransaccion'
import { ModalConfirmarEliminar } from './ModalConfirmarEliminar'
import type { Transaccion } from '@/types'
import { MovimientosListItem } from '@/components/features/movimientos/MovimientosListItem'
import {
  agruparTransaccionesPorFecha,
  tituloFechaGrupo,
} from '@/components/features/movimientos/listaMovimientosUtils'

export function ListaTransaccionesMovimientos({ transacciones }: { transacciones: Transaccion[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [transaccionAEditar, setTransaccionAEditar] = useState<Transaccion | null>(null)
  const [transaccionAEliminar, setTransaccionAEliminar] = useState<Transaccion | null>(null)
  const router = useRouter()

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return transacciones
    const q = busqueda.toLowerCase()
    return transacciones.filter(
      (t) =>
        (t.descripcion ?? '').toLowerCase().includes(q) ||
        t.categoria.toLowerCase().includes(q) ||
        String(t.monto).includes(q)
    )
  }, [transacciones, busqueda])

  const grupos = useMemo(() => agruparTransaccionesPorFecha(filtradas), [filtradas])

  const fechasOrdenadas = useMemo(
    () => Object.keys(grupos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [grupos]
  )

  const referenciaHoy = new Date()
  const hoy = format(referenciaHoy, 'yyyy-MM-dd')
  const ayer = format(subDays(referenciaHoy, 1), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex-1 relative min-w-0">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por descripción, categoría o monto..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-sm font-medium shrink-0 sm:w-auto w-full"
        >
          <Filter size={18} /> Filtros
        </button>
      </div>

      <div className="space-y-6">
        {fechasOrdenadas.length === 0 ? (
          <div className="border border-dashed border-zinc-700 rounded-2xl p-12 text-center">
            <p className="text-zinc-500 font-medium">
              {transacciones.length === 0
                ? 'Sin movimientos este mes. ¡Agregá tu primer ingreso o gasto!'
                : 'Ningún movimiento coincide con tu búsqueda.'}
            </p>
          </div>
        ) : (
          fechasOrdenadas.map((fecha) => {
            const items = grupos[fecha]
            return (
              <section key={fecha}>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  {tituloFechaGrupo(fecha, hoy, ayer)}
                </h3>
                <div className="space-y-2">
                  {items.map((t) => (
                    <MovimientosListItem
                      key={t.id}
                      transaccion={t}
                      onEditar={setTransaccionAEditar}
                      onEliminar={setTransaccionAEliminar}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>

      {transaccionAEditar && (
        <ModalEditarTransaccion
          key={transaccionAEditar.id}
          transaccion={transaccionAEditar}
          onClose={() => setTransaccionAEditar(null)}
          onSuccess={() => router.refresh()}
        />
      )}
      {transaccionAEliminar && (
        <ModalConfirmarEliminar
          transaccionId={transaccionAEliminar.id}
          concepto={transaccionAEliminar.descripcion || transaccionAEliminar.categoria}
          onClose={() => setTransaccionAEliminar(null)}
        />
      )}
    </div>
  )
}
