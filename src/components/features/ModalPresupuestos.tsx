'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { guardarPresupuesto } from '@/app/actions/presupuestos'

const CATEGORIAS_GASTO = [
  '🛒 Supermercado',
  '🍔 Comida / Delivery',
  '🚗 Transporte / Nafta',
  '🏠 Hogar / Alquiler',
  '💡 Servicios (Luz, Agua, Internet)',
  '⚕️ Salud / Farmacia',
  '🎬 Entretenimiento',
  '👕 Ropa / Accesorios',
  '📦 Otros',
]

export function ModalPresupuestos({
  isOpen,
  onClose,
  mesRef,
  presupuestosExistentes,
}: {
  isOpen: boolean
  onClose: () => void
  mesRef: string
  presupuestosExistentes: { categoria: string; limite_mensual: number }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categoria, setCategoria] = useState(CATEGORIAS_GASTO[0])
  const [limite, setLimite] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const existente = presupuestosExistentes.find((p) => p.categoria === categoria)
      setLimite(existente ? String(existente.limite_mensual) : '')
    }
  }, [isOpen, categoria, presupuestosExistentes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const valor = parseFloat(limite.replace(/,/g, '.'))
    if (isNaN(valor) || valor < 0) return
    setLoading(true)
    const formData = new FormData()
    formData.set('categoria', categoria)
    formData.set('limite_mensual', String(valor))
    formData.set('mes_ref', mesRef)
    const result = await guardarPresupuesto(formData)
    setLoading(false)
    if (result.success) {
      router.refresh()
      onClose()
      setLimite('')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Configurar límite mensual</h3>
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
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
            >
              {CATEGORIAS_GASTO.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Límite mensual ($)
            </label>
            <input
              type="number"
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-violet-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar límite'}
          </button>
        </form>
      </div>
    </>
  )
}
