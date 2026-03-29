'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { desvincularPareja } from '@/app/actions/pareja'
import { Menu, X, Link2Off, Settings, Loader2 } from 'lucide-react'

export function MenuConfiguracion({ parejaId }: { parejaId: string | null | undefined }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [desvinculando, setDesvinculando] = useState(false)

  const handleDesvincular = () => {
    if (!confirm('¿Desvincular tu cuenta de la pareja? Podrás volver a vincularte con un código más tarde.')) return
    setDesvinculando(true)
    void (async () => {
      const result = await desvincularPareja()
      if (result.success) {
        setIsOpen(false)
        router.refresh()
      }
      setDesvinculando(false)
    })()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
        title="Configuración"
        aria-label="Abrir menú de configuración"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Settings size={14} /> Configuración
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-2">
              {parejaId ? (
                <button
                  type="button"
                  onClick={handleDesvincular}
                  disabled={desvinculando}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3 disabled:opacity-70"
                >
                  {desvinculando ? (
                    <Loader2 size={18} className="animate-spin shrink-0" />
                  ) : (
                    <Link2Off size={18} className="shrink-0" />
                  )}
                  Desvincular pareja
                </button>
              ) : (
                <p className="px-4 py-3 text-xs text-slate-400">
                  Vinculá tu cuenta desde el módulo de pareja.
                </p>
              )}

              {/* Espacio para más opciones */}
              {/* <div className="border-t border-slate-50 mt-2 pt-2">
                <button className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Más opciones próximamente...
                </button>
              </div> */}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
