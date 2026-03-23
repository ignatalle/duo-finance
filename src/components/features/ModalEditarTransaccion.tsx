'use client'

import { useState, useTransition, useEffect } from 'react'
import { editarTransaccion } from '@/app/actions/transacciones'
import { X, Loader2, User, Users } from 'lucide-react'
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

export function ModalEditarTransaccion({ transaccion, onClose, onSuccess }: ModalEditarTransaccionProps) {
  const [isPending, startTransition] = useTransition()
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [fecha, setFecha] = useState('')
  const [esCompartido, setEsCompartido] = useState(false)
  const [tipoGasto, setTipoGasto] = useState<'fijo' | 'variable'>('variable')
  const [estado, setEstado] = useState<'pagado' | 'pendiente'>('pagado')

  useEffect(() => {
    if (!transaccion) return
    setMonto(String(transaccion.monto))
    setDescripcion(transaccion.descripcion || '')
    setCategoria(transaccion.categoria)
    setFecha(format(new Date(transaccion.created_at), 'yyyy-MM-dd'))
    setEsCompartido(transaccion.es_compartido ?? false)
    setTipoGasto((transaccion.tipo_gasto as 'fijo' | 'variable') || 'variable')
    setEstado((transaccion.estado as 'pagado' | 'pendiente') || 'pagado')
  }, [transaccion])

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

  if (!transaccion) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-white">Editar movimiento</h2>
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
            <>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Tipo de gasto</label>
                <div className="flex bg-zinc-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTipoGasto('variable')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tipoGasto === 'variable' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                  >
                    Variable
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoGasto('fijo')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tipoGasto === 'fijo' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                  >
                    Fijo
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Propiedad</label>
                <div className="flex bg-zinc-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEsCompartido(false)}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${!esCompartido ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                    title="Solo mío"
                  >
                    <User size={18} /> Solo mío
                  </button>
                  <button
                    type="button"
                    onClick={() => setEsCompartido(true)}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${esCompartido ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
                    title="Compartido"
                  >
                    <Users size={18} /> Compartido
                  </button>
                </div>
              </div>

              {(transaccion.cuota_actual != null || transaccion.cuota_total != null) && (
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Estado (cuota)</label>
                  <div className="flex bg-zinc-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setEstado('pagado')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${estado === 'pagado' ? 'bg-teal-600/30 text-teal-400' : 'text-zinc-500'}`}
                    >
                      Pagado
                    </button>
                    <button
                      type="button"
                      onClick={() => setEstado('pendiente')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${estado === 'pendiente' ? 'bg-amber-600/30 text-amber-400' : 'text-zinc-500'}`}
                    >
                      Pendiente
                    </button>
                  </div>
                </div>
              )}
            </>
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
