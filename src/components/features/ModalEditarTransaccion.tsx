'use client'

import { useState, useTransition, useEffect } from 'react'
import { editarTransaccion } from '@/app/actions/transacciones'
import { obtenerTarjetas } from '@/app/actions/tarjetas'
import type { Tarjeta } from '@/app/actions/tarjetas'
import { X, Loader2 } from 'lucide-react'
import { ModalEditarTransaccionGastoFields } from './ModalEditarTransaccionGastoFields'
import { format } from 'date-fns'
import type { Transaccion } from '@/types'

const CATEGORIAS = [
  '🛒 Supermercado', '🍔 Comida / Delivery', '🚗 Transporte / Nafta',
  '🏠 Hogar / Alquiler', '💡 Servicios (Luz, Agua, Internet)',
  '⚕️ Salud / Farmacia', '🎬 Entretenimiento', '👕 Ropa / Accesorios',
  '💰 Sueldo / Ingreso Principal', '📦 Otros'
]

interface ModalEditarTransaccionProps {
  transaccion: Transaccion | null
  onClose: () => void
  onSuccess?: () => void
}

type ModalEditarTransaccionFormProps = {
  transaccion: Transaccion
  onClose: () => void
  onSuccess?: () => void
}

function ModalEditarTransaccionForm({
  transaccion,
  onClose,
  onSuccess,
}: ModalEditarTransaccionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [monto, setMonto] = useState(() => String(transaccion.monto))
  const [descripcion, setDescripcion] = useState(() => transaccion.descripcion || '')
  const [categoria, setCategoria] = useState(() => transaccion.categoria)
  const [fecha, setFecha] = useState(() =>
    format(new Date(transaccion.created_at), 'yyyy-MM-dd')
  )
  const [esCompartido, setEsCompartido] = useState(() => transaccion.es_compartido ?? false)
  const [tipoGasto, setTipoGasto] = useState<'fijo' | 'variable'>(() =>
    (transaccion.tipo_gasto as 'fijo' | 'variable') || 'variable'
  )
  const [estado, setEstado] = useState<'pagado' | 'pendiente'>(() =>
    (transaccion.estado as 'pagado' | 'pendiente') || 'pagado'
  )
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [tarjetaId, setTarjetaId] = useState(() => transaccion.tarjeta_id || '')
  const [cuotas, setCuotas] = useState(() =>
    transaccion.cuota_total && transaccion.cuota_total > 0 ? transaccion.cuota_total : 1
  )

  useEffect(() => {
    const tidInicial = transaccion.tarjeta_id || ''
    obtenerTarjetas().then((res) => {
      const data = res.data || []
      setTarjetas(data)
      if (tidInicial && !data.some((t) => t.id === tidInicial)) {
        setTarjetaId('')
      }
    })
  }, [transaccion.id, transaccion.tarjeta_id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transaccion) return
    const formData = new FormData()
    formData.set('id', transaccion.id)
    formData.set('tipo', transaccion.tipo)
    formData.set('monto', monto)
    formData.set('descripcion', descripcion)
    formData.set('categoria', categoria)
    formData.set('fecha', fecha)
    formData.set('estado', estado)
    formData.set('tipo_gasto', tipoGasto)
    if (esCompartido) formData.set('es_compartido', 'on')

    if (transaccion.tipo === 'gasto') {
      if (tarjetaId) {
        formData.set('tarjeta_id', tarjetaId)
        if (cuotas > 1) {
          formData.set('cuota_total', String(cuotas))
          const sinCuotasAntes =
            transaccion.cuota_total == null || transaccion.cuota_total <= 1
          if (sinCuotasAntes) {
            formData.set('cuota_actual', '1')
          } else if (transaccion.cuota_actual != null) {
            formData.set(
              'cuota_actual',
              String(Math.min(transaccion.cuota_actual, cuotas))
            )
          } else {
            formData.set('cuota_actual', '1')
          }
        }
      } else {
        formData.set('tarjeta_id', '')
      }
    }

    startTransition(async () => {
      const result = await editarTransaccion(formData)
      if (result.success) {
        onClose()
        onSuccess?.()
      } else {
        alert(result.error || 'No se pudo editar')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-sm max-h-[85dvh] overflow-y-auto origin-bottom sm:origin-center bg-zinc-900 border border-zinc-700 rounded-2xl p-6 pb-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-editar-transaccion-title"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 id="modal-editar-transaccion-title" className="text-lg font-bold text-white">
            Editar movimiento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Importe</label>
            <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5">
              <span className="text-zinc-500 font-bold mr-1">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-transparent border-none text-lg font-bold text-white focus:ring-0 p-0 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Concepto</label>
            <input
              type="text"
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Cena"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none"
            >
              {[...new Set([...CATEGORIAS, categoria])].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none"
            />
          </div>

          {transaccion.tipo === 'gasto' && (
            <ModalEditarTransaccionGastoFields
              transaccion={transaccion}
              tipoGasto={tipoGasto}
              setTipoGasto={setTipoGasto}
              tarjetaId={tarjetaId}
              setTarjetaId={setTarjetaId}
              cuotas={cuotas}
              setCuotas={setCuotas}
              tarjetas={tarjetas}
              esCompartido={esCompartido}
              setEsCompartido={setEsCompartido}
              estado={estado}
              setEstado={setEstado}
            />
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-zinc-600 text-zinc-400 font-bold text-sm hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-teal-600 disabled:bg-zinc-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-500 transition-colors flex justify-center items-center gap-2"
            >
              {isPending ? <Loader2 className="animate-spin" size={18} /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ModalEditarTransaccion({ transaccion, onClose, onSuccess }: ModalEditarTransaccionProps) {
  if (!transaccion) return null
  return (
    <ModalEditarTransaccionForm
      key={transaccion.id}
      transaccion={transaccion}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
