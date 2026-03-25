'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { crearTarjeta, editarTarjeta, type Tarjeta } from '@/app/actions/tarjetas'

const BANCOS = ['Galicia', 'Santander', 'Nación', 'ICBC', 'BBVA', 'HSBC', 'Otro']
const ESTILOS = [
  { value: 'orange', label: 'Naranja/Rosa', preview: 'bg-gradient-to-r from-orange-400 to-pink-500' },
  { value: 'dark', label: 'Gris oscuro', preview: 'bg-gradient-to-r from-zinc-700 to-zinc-800' },
  { value: 'blue', label: 'Azul/Índigo', preview: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
]

interface ModalVincularTarjetaProps {
  isOpen: boolean
  onClose: () => void
  tarjetaEditar?: Tarjeta | null
}

export function ModalVincularTarjeta({ isOpen, onClose, tarjetaEditar }: ModalVincularTarjetaProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [banco, setBanco] = useState('')
  const [ultimosDigitos, setUltimosDigitos] = useState('')
  const [cierreDia, setCierreDia] = useState(15)
  const [vencimientoDia, setVencimientoDia] = useState(20)
  const [estilo, setEstilo] = useState('orange')

  const esEdicion = !!tarjetaEditar

  useEffect(() => {
    if (isOpen && tarjetaEditar) {
      setNombre(tarjetaEditar.nombre)
      setBanco(tarjetaEditar.banco || '')
      setUltimosDigitos(tarjetaEditar.ultimos_digitos != null ? String(tarjetaEditar.ultimos_digitos) : '')
      setCierreDia(tarjetaEditar.cierre_dia)
      setVencimientoDia(tarjetaEditar.vencimiento_dia)
      setEstilo(tarjetaEditar.estilo || 'orange')
    } else if (isOpen && !tarjetaEditar) {
      setNombre('')
      setBanco('')
      setUltimosDigitos('')
      setCierreDia(15)
      setVencimientoDia(20)
      setEstilo('orange')
    }
  }, [isOpen, tarjetaEditar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setLoading(true)
    const formData = new FormData()
    formData.set('nombre', nombre.trim())
    formData.set('banco', banco.trim())
    formData.set('ultimos_digitos', ultimosDigitos.trim())
    formData.set('cierre_dia', String(cierreDia))
    formData.set('vencimiento_dia', String(vencimientoDia))
    formData.set('estilo', estilo)
    if (esEdicion && tarjetaEditar) formData.set('id', tarjetaEditar.id)

    const result = esEdicion
      ? await editarTarjeta(formData)
      : await crearTarjeta(formData)

    setLoading(false)
    if (result.success) {
      router.refresh()
      onClose()
      setNombre('')
      setBanco('')
      setUltimosDigitos('')
      setCierreDia(15)
      setVencimientoDia(20)
      setEstilo('orange')
    } else {
      alert(result.error || (esEdicion ? 'No se pudo actualizar' : 'No se pudo crear la tarjeta'))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-md max-h-[85dvh] overflow-y-auto origin-bottom sm:origin-center bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 pb-8 animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-vincular-tarjeta-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-vincular-tarjeta-title" className="text-lg font-bold text-white">
            {esEdicion ? 'Editar Tarjeta' : 'Vincular Tarjeta'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Nombre (ej. Visa Gold, Mastercard Black)
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Visa Gold"
              required
              className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Banco
            </label>
            <select
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Seleccionar...</option>
              {BANCOS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Últimos 4 dígitos (opcional)
            </label>
            <input
              type="text"
              value={ultimosDigitos}
              onChange={(e) => setUltimosDigitos(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4582"
              maxLength={4}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Cierre (día)
              </label>
              <input
                type="number"
                min={1}
                max={28}
                value={cierreDia}
                onChange={(e) => setCierreDia(parseInt(e.target.value) || 15)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Vencimiento (día)
              </label>
              <input
                type="number"
                min={1}
                max={28}
                value={vencimientoDia}
                onChange={(e) => setVencimientoDia(parseInt(e.target.value) || 20)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Estilo de tarjeta
            </label>
            <div className="flex gap-2">
              {ESTILOS.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setEstilo(e.value)}
                  className={`flex-1 h-10 rounded-xl border-2 transition-all ${estilo === e.value ? 'border-emerald-500' : 'border-zinc-600 hover:border-zinc-500'}`}
                >
                  <span className={`block w-full h-full rounded-lg ${e.preview} opacity-80`} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-zinc-600 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : esEdicion ? 'Guardar cambios' : 'Vincular'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
