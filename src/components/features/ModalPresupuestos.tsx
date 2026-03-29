'use client'

import { useState, useEffect, useRef } from 'react'
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
  presupuestosExistentes: { id: string; categoria: string; limite_mensual: number }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categoria, setCategoria] = useState(CATEGORIAS_GASTO[0])
  const [limite, setLimite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const categoriaRef = useRef(categoria)
  categoriaRef.current = categoria
  const didInitForOpenRef = useRef(false)

  const catParam = searchParams.get('cat')
    ? decodeURIComponent(searchParams.get('cat')!)
    : null
  const editId = searchParams.get('edit')

  useEffect(() => {
    if (!isOpen) {
      didInitForOpenRef.current = false
      return
    }
    if (didInitForOpenRef.current) return
    didInitForOpenRef.current = true

    setError(null)
    if (editId) {
      const existente = presupuestosExistentes.find((p) => p.id === editId)
      if (existente) {
        setCategoria(existente.categoria)
        setLimite(String(existente.limite_mensual))
      }
    } else {
      if (catParam && CATEGORIAS_GASTO.includes(catParam)) setCategoria(catParam)
      const catLookup =
        catParam && CATEGORIAS_GASTO.includes(catParam) ? catParam : categoriaRef.current
      const existente = presupuestosExistentes.find((p) => p.categoria === catLookup)
      setLimite(existente ? String(existente.limite_mensual) : '')
    }
  }, [isOpen, presupuestosExistentes, catParam, editId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const valor = parseFloat(String(limite).replace(/,/g, '.'))
    if (isNaN(valor) || valor < 0) {
      setError('Ingresá un monto válido')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.set('categoria', categoria)
      formData.set('limite_mensual', String(valor))
      formData.set('mes_ref', mesRef)
      if (editId) formData.set('id', editId)
      const result = await guardarPresupuesto(formData)
      if (result.success) {
        router.refresh()
        onClose()
        setLimite('')
      } else {
        setError(result.error || 'No se pudo guardar')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
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
        aria-labelledby="modal-presupuestos-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-presupuestos-title" className="text-lg font-bold text-white">
            {editId ? 'Editar límite' : 'Configurar límite mensual'}
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
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={!!editId}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
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
          {error && (
            <p className="text-sm text-rose-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
          >
            {loading ? 'Guardando...' : editId ? 'Actualizar límite' : 'Guardar límite'}
          </button>
        </form>
      </div>
    </div>
  )
}
