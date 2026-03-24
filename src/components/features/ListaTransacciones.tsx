'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { eliminarTransaccion, editarTransaccion, marcarComoPagado } from '@/app/actions/transacciones'
import { useState, useTransition } from 'react'
import { CheckCircle2, Pencil, Trash2, Clock } from 'lucide-react'
import type { Transaccion } from '@/types'

const CATEGORIAS = [
  '🛒 Supermercado', '🍔 Comida / Delivery', '🚗 Transporte / Nafta',
  '🏠 Hogar / Alquiler', '💡 Servicios (Luz, Agua, Internet)',
  '⚕️ Salud / Farmacia', '🎬 Entretenimiento', '👕 Ropa / Accesorios',
  '💰 Sueldo / Ingreso Principal', '📦 Otros'
]

export function ListaTransacciones({ transacciones, usuarioActualId }: { transacciones: Transaccion[], usuarioActualId: string }) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleEliminar = (id: string) => {
    if (confirm('¿Eliminar definitivamente este movimiento?')) {
      setDeletingId(id)
      startTransition(async () => {
        await eliminarTransaccion(id)
        setDeletingId(null)
      })
    }
  }

  const handleEditar = (formData: FormData) => {
    startTransition(async () => {
      await editarTransaccion(formData)
      setEditingId(null)
    })
  }

  const handlePagar = (id: string) => {
    startTransition(async () => {
      await marcarComoPagado(id)
    })
  }

  if (!transacciones || transacciones.length === 0) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center p-8 bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-3xl">
        <div className="w-16 h-16 mb-4 rounded-full bg-zinc-900/80 flex items-center justify-center border border-zinc-800">
          <span className="text-2xl">🍃</span>
        </div>
        <p className="text-zinc-400 font-medium text-center">Sin movimientos este mes.</p>
        <p className="text-sm text-zinc-600 mt-1">¡Agrega tu primer ingreso o gasto!</p>
      </div>
    )
  }

  // Función para formatear moneda
  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto)
  }

  return (
    <div className="flex flex-col gap-3">
      {transacciones.map((t) => {
        const soyElDueño = t.usuario_id === usuarioActualId
        const esPendiente = t.estado === 'pendiente'

        // Separamos el emoji del texto de la categoría para usarlo como ícono
        const emojiMatch = t.categoria.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*(.*)$/u)
        const emoji = emojiMatch ? emojiMatch[1] : '📄'
        const categoriaTexto = emojiMatch ? emojiMatch[2] : t.categoria

        // MODO EDICIÓN
        if (editingId === t.id) {
          return (
            <form action={handleEditar} key={t.id} className="flex flex-col gap-4 p-5 bg-zinc-900/80 border border-blue-500/40 rounded-2xl shadow-lg backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Editando Movimiento</span>
              </div>

              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="tipo" value={t.tipo} />
              <input type="hidden" name="estado" value={t.estado ?? 'pagado'} />
              <input type="hidden" name="tipo_gasto" value={t.tipo_gasto ?? ''} />
              
              <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                <select name="categoria" defaultValue={t.categoria} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm flex-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative w-full sm:w-40">
                  <span className="absolute left-3 top-3 text-zinc-500">$</span>
                  <input type="number" step="0.01" name="monto" defaultValue={t.monto} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 pl-7 text-white text-sm w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-mono" required />
                </div>
              </div>
              
              <input type="text" name="descripcion" defaultValue={t.descripcion || ''} placeholder="Descripción opcional..." className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-sm w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all relative z-10" />
              
              <div className="flex justify-end gap-2 mt-2 relative z-10">
                <button type="button" onClick={() => setEditingId(null)} className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2.5 rounded-xl hover:bg-zinc-800">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50">
                  {isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )
        }

        // MODO LECTURA
        return (
          <div key={t.id} className={`group flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 transition-all rounded-2xl border ${esPendiente ? 'bg-orange-950/20 border-orange-900/30 hover:bg-orange-950/30' : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/60 hover:border-zinc-700/80'}`}>
            
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icono de Categoría (Avatar) */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner border ${esPendiente ? 'bg-orange-950/50 border-orange-900/50' : 'bg-zinc-950/80 border-zinc-800/80'}`}>
                {emoji}
              </div>

              {/* Información Textual */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-zinc-100 text-[15px] truncate">
                    {t.descripcion || categoriaTexto}
                  </span>
                  
                  {/* Badges Premium */}
                  {t.tipo_gasto === 'fijo' && <span className="shrink-0 bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide border border-zinc-700">FIJO</span>}
                  {t.cuota_actual && <span className="shrink-0 bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide border border-purple-500/20">CUOTA {t.cuota_actual}/{t.cuota_total}</span>}
                  {t.es_compartido && <span className="shrink-0 bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide border border-blue-500/20">COMPARTIDO</span>}
                </div>
                
                <span className="text-xs text-zinc-500 font-medium">
                  {categoriaTexto} • {format(new Date(t.created_at), "d MMM", { locale: es })}
                </span>
              </div>
            </div>
            
            {/* Sector Derecho: Montos y Acciones */}
            <div className="flex w-full items-center justify-between gap-4 sm:justify-end sm:gap-6 sm:pl-4 sm:w-auto">
              <div className="flex flex-col items-start sm:items-end">
                <span className={`text-lg font-bold font-mono tracking-tight ${t.tipo === 'ingreso' ? 'text-emerald-400' : (esPendiente ? 'text-orange-400' : 'text-white')}`}>
                  {t.tipo === 'ingreso' ? '+' : '-'}{formatearMonto(Number(t.monto))}
                </span>
                {esPendiente && (
                  <span className="text-[10px] text-orange-500/80 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> PENDIENTE
                  </span>
                )}
              </div>
              
              {soyElDueño && (
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  {esPendiente && (
                    <button type="button" onClick={() => handlePagar(t.id)} disabled={isPending} className="p-2 text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all" title="Marcar como pagado">
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  )}
                  {!esPendiente && (
                    <button onClick={() => setEditingId(t.id)} className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => handleEliminar(t.id)} disabled={isPending && deletingId === t.id} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Eliminar">
                    {isPending && deletingId === t.id ? (
                      <span className="w-4 h-4 block rounded-full border-2 border-zinc-500 border-t-zinc-300 animate-spin"></span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
