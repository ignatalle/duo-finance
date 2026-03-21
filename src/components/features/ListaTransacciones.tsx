'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { eliminarTransaccion, editarTransaccion, marcarComoPagado } from '@/app/actions/transacciones'
import { useState, useTransition } from 'react'
import { ShoppingBag, Utensils, Car, Home, Zap, HeartPulse, Film, Shirt, DollarSign, Package, Calendar, Pencil, Trash2 } from 'lucide-react'

const CATEGORIAS = [
  '🛒 Supermercado', '🍔 Comida / Delivery', '🚗 Transporte / Nafta',
  '🏠 Hogar / Alquiler', '💡 Servicios (Luz, Agua, Internet)',
  '⚕️ Salud / Farmacia', '🎬 Entretenimiento', '👕 Ropa / Accesorios',
  '💰 Sueldo / Ingreso Principal', '📦 Otros'
]

const getCategoryStyle = (categoria: string) => {
  if (categoria.includes('Supermercado')) return { icon: ShoppingBag, bg: 'bg-emerald-100', text: 'text-emerald-600' }
  if (categoria.includes('Comida')) return { icon: Utensils, bg: 'bg-orange-100', text: 'text-orange-600' }
  if (categoria.includes('Transporte')) return { icon: Car, bg: 'bg-blue-100', text: 'text-blue-600' }
  if (categoria.includes('Hogar')) return { icon: Home, bg: 'bg-indigo-100', text: 'text-indigo-600' }
  if (categoria.includes('Servicios')) return { icon: Zap, bg: 'bg-yellow-100', text: 'text-yellow-600' }
  if (categoria.includes('Salud')) return { icon: HeartPulse, bg: 'bg-rose-100', text: 'text-rose-600' }
  if (categoria.includes('Entretenimiento')) return { icon: Film, bg: 'bg-purple-100', text: 'text-purple-600' }
  if (categoria.includes('Ropa')) return { icon: Shirt, bg: 'bg-pink-100', text: 'text-pink-600' }
  if (categoria.includes('Sueldo')) return { icon: DollarSign, bg: 'bg-teal-100', text: 'text-teal-600' }
  return { icon: Package, bg: 'bg-slate-100', text: 'text-slate-500' }
}

export function ListaTransacciones({ transacciones, usuarioActualId }: { transacciones: any[], usuarioActualId: string }) {
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
    startTransition(() => { marcarComoPagado(id) })
  }

  if (!transacciones || transacciones.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Package className="text-slate-300" size={24} />
        </div>
        <p className="text-slate-400 font-medium text-sm">No hay movimientos aún</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Últimos Movimientos</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{transacciones.length} items</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {transacciones.map((t) => {
          const soyElDueño = t.usuario_id === usuarioActualId
          const esPendiente = t.estado === 'pendiente'
          const style = getCategoryStyle(t.categoria)
          const Icon = style.icon
          
          // NUEVO: Formateamos el numerito con puntos
          const montoFormateado = Number(t.monto).toLocaleString('es-AR', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
          });

          // MODO EDICIÓN
          if (editingId === t.id) {
            return (
              <form action={handleEditar} key={t.id} className="flex flex-col gap-3 p-5 bg-white border-2 border-indigo-100 rounded-3xl shadow-sm">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="tipo" value={t.tipo} />
                <input type="hidden" name="estado" value={t.estado ?? 'pagado'} />
                <input type="hidden" name="tipo_gasto" value={t.tipo_gasto ?? ''} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <select name="categoria" defaultValue={t.categoria} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 text-sm flex-1 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {/* El input type="number" TIENE que quedar sin formato para que deje escribir */}
                  <input type="number" step="0.01" name="monto" defaultValue={t.monto} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 font-bold text-sm w-full sm:w-32 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" required />
                </div>
                <input type="text" name="descripcion" defaultValue={t.descripcion || ''} placeholder="Descripción..." className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 text-sm w-full outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors px-4 py-2">Cancelar</button>
                  <button type="submit" disabled={isPending} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-200">
                    {isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )
          }

          // MODO LECTURA
          return (
            <div key={t.id} className={`group bg-white p-4 rounded-[24px] flex items-center justify-between shadow-sm border transition-all ${esPendiente ? 'border-orange-200 bg-orange-50/30' : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}>
              
              <div className="flex items-center gap-4 min-w-0">
                <div className={`shrink-0 w-12 h-12 rounded-[18px] flex items-center justify-center ${style.bg} ${style.text}`}>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-slate-800 text-sm truncate">{t.descripcion || t.categoria.replace(/[^a-zA-Z\s\/]/g, '').trim()}</p>
                  
                  <div className="flex items-center gap-2 mt-1.5 overflow-x-auto hide-scrollbar">
                    <span className="shrink-0 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar size={12}/> {format(new Date(t.created_at), "d 'de' MMM", { locale: es })}
                    </span>
                    {t.tipo_gasto === 'fijo' && <span className="shrink-0 text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold tracking-wider">🔒 FIJO</span>}
                    {t.cuota_actual && <span className="shrink-0 text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold tracking-wider">CUOTA {t.cuota_actual}/{t.cuota_total}</span>}
                    {t.es_compartido && <span className="shrink-0 text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold tracking-wider">COMPARTIDO</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end shrink-0 ml-4">
                {/* ACÁ APLICAMOS EL NUEVO FORMATO */}
                <span className={`text-lg font-extrabold tracking-tight ${t.tipo === 'ingreso' ? 'text-emerald-500' : 'text-slate-800'}`}>
                  {t.tipo === 'ingreso' ? '+' : '-'}${montoFormateado}
                </span>
                {esPendiente && <span className="text-[9px] text-orange-500 font-bold uppercase tracking-wider mt-0.5">⏳ Pendiente</span>}
                
                {soyElDueño && (
                  <div className="flex items-center gap-1.5 mt-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {esPendiente && (
                      <button type="button" onClick={() => handlePagar(t.id)} className="text-[10px] font-extrabold bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg hover:bg-emerald-500 hover:text-white transition-all" title="Pagar">
                        PAGAR
                      </button>
                    )}
                    {!esPendiente && (
                      <button type="button" onClick={() => setEditingId(t.id)} className="p-1.5 text-slate-400 hover:text-indigo-500 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all" title="Editar">
                        <Pencil size={14} />
                      </button>
                    )}
                    <button type="button" onClick={() => handleEliminar(t.id)} disabled={isPending && deletingId === t.id} className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg transition-all" title="Eliminar">
                      {isPending && deletingId === t.id ? '...' : <Trash2 size={14} />}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
