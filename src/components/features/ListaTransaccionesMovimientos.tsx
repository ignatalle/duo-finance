'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { Search, Filter, UtensilsCrossed, ShoppingCart, Wallet, Car, Home, Zap, Heart, Film, Shirt, Package, Pencil, Trash2 } from 'lucide-react'
import { ModalEditarTransaccion } from './ModalEditarTransaccion'
import { ModalConfirmarEliminar } from './ModalConfirmarEliminar'
import type { Transaccion } from '@/types'

const CATEGORIA_ICON: Record<string, { icon: typeof UtensilsCrossed; color: string }> = {
  '🍔 Comida / Delivery': { icon: UtensilsCrossed, color: 'bg-amber-500/20 text-amber-400' },
  '🛒 Supermercado': { icon: ShoppingCart, color: 'bg-blue-500/20 text-blue-400' },
  '💰 Sueldo / Ingreso Principal': { icon: Wallet, color: 'bg-teal-500/20 text-teal-400' },
  '🚗 Transporte / Nafta': { icon: Car, color: 'bg-sky-500/20 text-sky-400' },
  '🏠 Hogar / Alquiler': { icon: Home, color: 'bg-violet-500/20 text-violet-400' },
  '💡 Servicios (Luz, Agua, Internet)': { icon: Zap, color: 'bg-yellow-500/20 text-yellow-400' },
  '⚕️ Salud / Farmacia': { icon: Heart, color: 'bg-rose-500/20 text-rose-400' },
  '🎬 Entretenimiento': { icon: Film, color: 'bg-pink-500/20 text-pink-400' },
  '👕 Ropa / Accesorios': { icon: Shirt, color: 'bg-fuchsia-500/20 text-fuchsia-400' },
  '📦 Otros': { icon: Package, color: 'bg-zinc-600/30 text-zinc-400' },
}
const DEFAULT_ICON = { icon: ShoppingCart, color: 'bg-zinc-700 text-zinc-400' }

function getIconForCategoria(categoria: string) {
  return CATEGORIA_ICON[categoria] ?? DEFAULT_ICON
}

function formatearMonto(monto: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto)
}

function agruparPorFecha(transacciones: Transaccion[]) {
  const grupos: Record<string, Transaccion[]> = {}
  for (const t of transacciones) {
    const key = format(new Date(t.created_at), 'yyyy-MM-dd', { locale: es })
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(t)
  }
  return grupos
}

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

  const grupos = useMemo(() => agruparPorFecha(filtradas), [filtradas])

  const fechasOrdenadas = useMemo(
    () => Object.keys(grupos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [grupos]
  )

  const hoy = format(new Date(), 'yyyy-MM-dd')
  const ayer = format(new Date(Date.now() - 864e5), 'yyyy-MM-dd')

  const tituloFecha = (fecha: string) => {
    if (fecha === hoy) return `HOY, ${format(new Date(fecha), "d 'DE' MMMM", { locale: es }).toUpperCase()}`
    if (fecha === ayer) return `AYER, ${format(new Date(fecha), "d 'DE' MMMM", { locale: es }).toUpperCase()}`
    return format(new Date(fecha), "EEEE, d 'DE' MMMM", { locale: es }).toUpperCase()
  }

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
                  {tituloFecha(fecha)}
                </h3>
                <div className="space-y-2">
                  {items.map((t) => {
                    const { icon: Icon, color } = getIconForCategoria(t.categoria)
                    const categoriaTexto = t.categoria.replace(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]\s*/u, '').trim()
                    const concepto = t.descripcion || categoriaTexto
                    return (
                      <div
                        key={t.id}
                        className="flex flex-col gap-3 md:flex-row md:items-center p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl hover:border-zinc-700/80 transition-colors min-w-0"
                      >
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                          >
                            <Icon size={20} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white break-words md:truncate">
                              {concepto}
                            </p>
                            <p className="text-sm text-zinc-500 break-words">{categoriaTexto}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-800/60 md:border-0 md:pt-0 md:justify-end shrink-0">
                          <span
                            className={`font-mono font-semibold text-lg tabular-nums ${
                              t.tipo === 'ingreso' ? 'text-teal-400' : 'text-white'
                            }`}
                          >
                            {t.tipo === 'ingreso' ? '+ ' : '- '}$ {formatearMonto(Number(t.monto))}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setTransaccionAEditar(t)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-teal-400 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTransaccionAEliminar(t)}
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-rose-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })
        )}
      </div>

      {transaccionAEditar && (
        <ModalEditarTransaccion
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
