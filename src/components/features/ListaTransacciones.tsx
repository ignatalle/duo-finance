'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { eliminarTransaccion } from '@/app/actions/transacciones'
import { useState, useTransition } from 'react'

export function ListaTransacciones({ transacciones, usuarioActualId }: { transacciones: any[], usuarioActualId: string }) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleEliminar = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      setDeletingId(id)
      startTransition(async () => {
        await eliminarTransaccion(id)
        setDeletingId(null)
      })
    }
  }

  if (!transacciones || transacciones.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-zinc-500 text-center">Todavía no hay movimientos. ¡Agrega el primero desde el formulario!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-medium text-white mb-4 border-b border-zinc-800 pb-2">Últimos Movimientos</h3>
      
      {transacciones.map((t) => {
        const soyElDueño = t.usuario_id === usuarioActualId
        
        return (
          <div key={t.id} className="flex justify-between items-center p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors">
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-200 text-sm">{t.categoria}</span>
                {t.es_compartido && (
                  <span className="bg-blue-900/50 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-800">
                    Compartido
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-500 mt-1">
                {t.descripcion || 'Sin descripción'} • {format(new Date(t.created_at), "d 'de' MMM", { locale: es })}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`font-bold ${t.tipo === 'ingreso' ? 'text-green-500' : 'text-red-400'}`}>
                {t.tipo === 'ingreso' ? '+' : '-'}${Number(t.monto).toFixed(2)}
              </div>
              
              {soyElDueño && (
                <button 
                  onClick={() => handleEliminar(t.id)}
                  disabled={isPending && deletingId === t.id}
                  className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                  title="Eliminar"
                >
                  {isPending && deletingId === t.id ? '...' : '🗑️'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
