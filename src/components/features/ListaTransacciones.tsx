'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { eliminarTransaccion, editarTransaccion, marcarComoPagado } from '@/app/actions/transacciones'
import { useState, useTransition } from 'react'
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
      <div className="flex h-full items-center justify-center p-8 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl shadow-lg backdrop-blur-md">
        <p className="text-sm text-zinc-500 text-center">Sin movimientos este mes. ¡Agrega el primero!</p>
      </div>
    )
  }

  return (
    <div className="relative bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 md:p-8 shadow-lg backdrop-blur-md flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2 border-b border-zinc-800/50 pb-4">
        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        <h3 className="text-lg font-semibold text-white tracking-tight">Últimos Movimientos</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {transacciones.map((t) => {
          const soyElDueño = t.usuario_id === usuarioActualId
          const esPendiente = t.estado === 'pendiente'

          // MODO EDICIÓN
          if (editingId === t.id) {
            return (
              <form action={handleEditar} key={t.id} className="flex flex-col gap-3 p-4 bg-zinc-950/80 border border-blue-500/50 rounded-xl shadow-inner">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="tipo" value={t.tipo} />
                <input type="hidden" name="estado" value={t.estado ?? 'pagado'} />
                <input type="hidden" name="tipo_gasto" value={t.tipo_gasto ?? ''} />
                <div className="flex flex-col sm:flex-row gap-2">
                  <select name="categoria" defaultValue={t.categoria} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-sm flex-1 outline-none focus:border-blue-500">
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="number" step="0.01" name="monto" defaultValue={t.monto} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-sm w-full sm:w-32 outline-none focus:border-blue-500" required />
                </div>
                <input type="text" name="descripcion" defaultValue={t.descripcion || ''} placeholder="Descripción..." className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white text-sm w-full outline-none focus:border-blue-500" />
                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2">Cancelar</button>
                  <button type="submit" disabled={isPending} className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                    {isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            )
          }

          // MODO LECTURA
          return (
            <div key={t.id} className={`group flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 transition-all rounded-xl border ${esPendiente ? 'bg-orange-950/10 border-orange-900/30 hover:border-orange-500/50' : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/60'}`}>
              
              {/* IZQUIERDA: Contenedor con min-w-0 para evitar que rompa el layout */}
              <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* El texto ahora bajará de línea si es muy largo */}
                  <span className="font-semibold text-zinc-100 text-sm break-words whitespace-normal w-full sm:w-auto">
                    {t.descripcion || t.categoria}
                  </span>
                  
                  {/* Etiquetas (Badges) con shrink-0 para que no se deformen */}
                  {t.tipo_gasto === 'fijo' && <span className="shrink-0 bg-zinc-800/80 text-zinc-300 text-[10px] px-2 py-0.5 rounded-md border border-zinc-700 font-medium tracking-wide">🔒 FIJO</span>}
                  {t.cuota_actual && <span className="shrink-0 bg-purple-900/30 text-purple-300 text-[10px] px-2 py-0.5 rounded-md border border-purple-800/50 font-medium tracking-wide">CUOTA {t.cuota_actual}/{t.cuota_total}</span>}
                  {t.es_compartido && <span className="shrink-0 bg-blue-900/30 text-blue-300 text-[10px] px-2 py-0.5 rounded-md border border-blue-800/50 font-medium tracking-wide">COMPARTIDO</span>}
                </div>
                <span className="text-xs text-zinc-500 font-medium truncate">
                  {t.categoria} • {format(new Date(t.created_at), "d 'de' MMM", { locale: es })}
                </span>
              </div>
              
              {/* DERECHA: Montos con shrink-0 para que NUNCA se salgan de la pantalla */}
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-zinc-800/50 sm:border-0">
                <div className="flex flex-col items-start sm:items-end">
                  <span className={`text-lg font-bold tracking-tight ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                    {t.tipo === 'ingreso' ? '+' : '-'}${Number(t.monto).toFixed(2)}
                  </span>
                  {esPendiente && <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Pendiente</span>}
                </div>
                
                {soyElDueño && (
                  <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {esPendiente && (
                      <button type="button" onClick={() => handlePagar(t.id)} disabled={isPending} className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm disabled:opacity-50" title="Marcar como pagado">
                        Pagar
                      </button>
                    )}
                    {!esPendiente && (
                      <button onClick={() => setEditingId(t.id)} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all" title="Editar">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    )}
                    <button type="button" onClick={() => handleEliminar(t.id)} disabled={isPending && deletingId === t.id} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Eliminar">
                      {isPending && deletingId === t.id ? '...' : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
