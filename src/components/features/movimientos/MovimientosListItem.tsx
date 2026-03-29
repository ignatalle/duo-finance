'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Transaccion } from '@/types'
import { formatearMontoLista, getIconForCategoriaMovimiento } from './listaMovimientosUtils'

export interface MovimientosListItemProps {
  transaccion: Transaccion
  onEditar: (t: Transaccion) => void
  onEliminar: (t: Transaccion) => void
}

export function MovimientosListItem({ transaccion: t, onEditar, onEliminar }: MovimientosListItemProps) {
  const { icon: Icon, color } = getIconForCategoriaMovimiento(t.categoria)
  const categoriaTexto = t.categoria.replace(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]\s*/u, '').trim()
  const concepto = t.descripcion || categoriaTexto

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl hover:border-zinc-700/80 transition-colors min-w-0">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white break-words md:truncate">{concepto}</p>
          <p className="text-sm text-zinc-500 break-words">{categoriaTexto}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-800/60 md:border-0 md:pt-0 md:justify-end shrink-0">
        <span
          className={`font-mono font-semibold text-lg tabular-nums ${
            t.tipo === 'ingreso' ? 'text-teal-400' : 'text-white'
          }`}
        >
          {t.tipo === 'ingreso' ? '+ ' : '- '}$ {formatearMontoLista(Number(t.monto))}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEditar(t)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-teal-400 transition-colors"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onEliminar(t)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-rose-400 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
