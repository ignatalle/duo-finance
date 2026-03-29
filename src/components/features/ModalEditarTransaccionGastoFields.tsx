'use client'

import { User, Users, Banknote, CreditCard } from 'lucide-react'
import type { Tarjeta } from '@/app/actions/tarjetas'
import type { Transaccion } from '@/types'

export interface ModalEditarTransaccionGastoFieldsProps {
  transaccion: Transaccion
  tipoGasto: 'fijo' | 'variable'
  setTipoGasto: (v: 'fijo' | 'variable') => void
  tarjetaId: string
  setTarjetaId: (v: string) => void
  cuotas: number
  setCuotas: (v: number) => void
  tarjetas: Tarjeta[]
  esCompartido: boolean
  setEsCompartido: (v: boolean) => void
  estado: 'pagado' | 'pendiente'
  setEstado: (v: 'pagado' | 'pendiente') => void
}

export function ModalEditarTransaccionGastoFields({
  transaccion,
  tipoGasto,
  setTipoGasto,
  tarjetaId,
  setTarjetaId,
  cuotas,
  setCuotas,
  tarjetas,
  esCompartido,
  setEsCompartido,
  estado,
  setEstado,
}: ModalEditarTransaccionGastoFieldsProps) {
  return (
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
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">¿En tarjeta?</label>
        <div className="flex bg-zinc-800 p-1 rounded-xl border border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setTarjetaId('')
              setCuotas(1)
            }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${!tarjetaId ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500'}`}
          >
            <Banknote size={16} /> Efectivo
          </button>
          <button
            type="button"
            onClick={() => tarjetas.length > 0 && setTarjetaId(tarjetas[0].id)}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${tarjetaId ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500'}`}
          >
            <CreditCard size={16} /> Tarjeta
          </button>
        </div>
      </div>

      {tarjetaId && tarjetas.length > 0 && (
        <>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Tarjeta</label>
            <select
              value={tarjetaId}
              onChange={(e) => setTarjetaId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none"
            >
              {tarjetas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                  {t.ultimos_digitos != null ? ` ****${String(t.ultimos_digitos).padStart(4, '0')}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Cuotas</label>
            <input
              type="number"
              min={1}
              max={120}
              value={cuotas}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (Number.isNaN(v)) {
                  setCuotas(1)
                  return
                }
                setCuotas(Math.min(120, Math.max(1, v)))
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none"
            />
            <p className="text-[10px] text-zinc-500 mt-1">1 = contado. Hasta 120 cuotas.</p>
          </div>
        </>
      )}
      {tarjetaId && tarjetas.length === 0 && (
        <p className="text-xs text-amber-400">
          No tenés tarjetas vinculadas. Andá a Tarjetas para agregar una.
        </p>
      )}

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
  )
}
