'use client'

import { Zap } from 'lucide-react'

interface LibertadTarjetasProps {
  mesLibreDeudas: string
  tieneDeuda: boolean
}

export function LibertadTarjetas({ mesLibreDeudas, tieneDeuda }: LibertadTarjetasProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-950/50 to-zinc-900 border border-emerald-500/30 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 min-w-0">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-full shrink-0">
          <Zap className="text-emerald-400" size={28} />
        </div>
        <div className="min-w-0">
          <h3 className="text-emerald-400 font-bold text-lg">Libertad de Tarjetas</h3>
          <p className="text-zinc-300 text-sm break-words">
            {tieneDeuda
              ? <>Si no sumás nuevas cuotas, terminarás de pagar todo en <span className="text-emerald-400 font-semibold">{mesLibreDeudas}</span></>
              : '¡No tenés cuotas pendientes!'}
          </p>
        </div>
      </div>
      {!tieneDeuda && (
        <div className="bg-zinc-900 px-6 py-4 rounded-xl border border-zinc-700 shrink-0">
          <p className="text-xl font-black text-white">¡Ya estás libre!</p>
        </div>
      )}
    </div>
  )
}
