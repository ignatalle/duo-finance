'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import type { Tarjeta } from '@/app/actions/tarjetas'
import { eliminarTransaccion } from '@/app/actions/transacciones'
import { ModalEditarTransaccion } from '@/components/features/ModalEditarTransaccion'
import type { Transaccion } from '@/types'
import { LibertadTarjetas } from './LibertadTarjetas'
import { CardTarjetaCredito, CardNuevaTarjeta } from './CardTarjetaCredito'
import { CuotasPendientes, type CuotaItem } from './CuotasPendientes'
import { ModalVincularTarjeta } from './ModalVincularTarjeta'
import { ModalConfirmarEliminarTarjeta } from './ModalConfirmarEliminarTarjeta'

interface TarjetasSectionProps {
  tarjetas: Tarjeta[]
  cuotasPorTarjeta: Record<string, CuotaItem[]>
  mesLibreDeudas: string
  tieneDeuda: boolean
}

export function TarjetasSection({
  tarjetas,
  cuotasPorTarjeta,
  mesLibreDeudas,
  tieneDeuda,
}: TarjetasSectionProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [tarjetaAEditar, setTarjetaAEditar] = useState<Tarjeta | null>(null)
  const [tarjetaAEliminar, setTarjetaAEliminar] = useState<Tarjeta | null>(null)
  const [txEditar, setTxEditar] = useState<Transaccion | null>(null)

  const openModalCrear = () => {
    setTarjetaAEditar(null)
    setModalOpen(true)
  }
  const openModalEditar = (t: Tarjeta) => {
    setTarjetaAEditar(t)
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
    setTarjetaAEditar(null)
  }

  const getDeudaTarjeta = (tarjetaId: string) => {
    const cuotas = cuotasPorTarjeta[tarjetaId] || []
    return cuotas.reduce((acc, c) => acc + c.montoCuota * Math.max(0, c.cuotasTotales - c.cuotaActual), 0)
  }

  const handleEliminarCuota = (c: CuotaItem) => {
    if (!window.confirm('¿Eliminar todas las cuotas de esta compra?')) return
    void (async () => {
      const result = await eliminarTransaccion(c.transaccionOriginal.id)
      if ('success' in result && result.success) {
        router.refresh()
      } else {
        alert('error' in result ? result.error : 'No se pudo eliminar')
      }
    })()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Tarjetas y Cuotas</h2>
          <p className="text-zinc-500 text-sm uppercase tracking-wider mt-0.5">Controlá tu deuda futura</p>
        </div>
        <button
          type="button"
          onClick={openModalCrear}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-600 bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 hover:border-zinc-500 transition-colors shrink-0 self-start md:self-auto"
        >
          <CreditCard size={16} />
          + Vincular Tarjeta
        </button>
      </div>

      {/* Libertad de Tarjetas */}
      <LibertadTarjetas mesLibreDeudas={mesLibreDeudas} tieneDeuda={tieneDeuda} />

      {/* Carrusel de Tarjetas */}
      {(tarjetas?.length > 0 || Object.keys(cuotasPorTarjeta).length > 0) ? (
        <>
          <div className="overflow-x-auto pb-2 -mx-1 hide-scrollbar">
            <div className="flex gap-4 min-w-max px-1">
              {(tarjetas || []).map((tarjeta) => (
                <CardTarjetaCredito
                  key={tarjeta.id}
                  tarjeta={tarjeta}
                  deudaEnCuotas={getDeudaTarjeta(tarjeta.id)}
                  onEditar={openModalEditar}
                  onEliminar={(t) => setTarjetaAEliminar(t)}
                />
              ))}
              <CardNuevaTarjeta onClick={openModalCrear} />
            </div>
          </div>

          {/* Cuotas Pendientes */}
          <CuotasPendientes
            tarjetas={tarjetas || []}
            cuotasPorTarjeta={cuotasPorTarjeta}
            onEditarCuota={(c) => setTxEditar(c.transaccionOriginal)}
            onEliminarCuota={handleEliminarCuota}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 py-16 px-4 md:px-6 text-center">
          <p className="text-zinc-500 mb-4">No hay tarjetas ni cuotas registradas.</p>
          <button
            type="button"
            onClick={openModalCrear}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-600 bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <CreditCard size={18} />
            Vincular primera tarjeta
          </button>
        </div>
      )}

      <ModalVincularTarjeta
        key={`${modalOpen}-${tarjetaAEditar?.id ?? 'new'}`}
        isOpen={modalOpen}
        onClose={closeModal}
        tarjetaEditar={tarjetaAEditar}
      />
      {tarjetaAEliminar && (
        <ModalConfirmarEliminarTarjeta
          tarjetaNombre={tarjetaAEliminar.nombre}
          tarjetaId={tarjetaAEliminar.id}
          onClose={() => setTarjetaAEliminar(null)}
        />
      )}

      {txEditar && (
        <ModalEditarTransaccion
          key={txEditar.id}
          transaccion={txEditar}
          onClose={() => setTxEditar(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
