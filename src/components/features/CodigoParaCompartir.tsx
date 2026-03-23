'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CodigoParaCompartir({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false)

  const handleCopiar = () => {
    navigator.clipboard.writeText(codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/30 p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Código para invitar a tu pareja</p>
        <p className="text-2xl font-black text-white tracking-[0.2em]">{codigo}</p>
      </div>
      <button
        type="button"
        onClick={handleCopiar}
        className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 transition-colors"
      >
        {copiado ? <Check size={16} /> : <Copy size={16} />}
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
