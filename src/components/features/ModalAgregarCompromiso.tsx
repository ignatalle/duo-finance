'use client'

import { X } from 'lucide-react'

interface ModalAgregarCompromisoProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalAgregarCompromiso({ isOpen, onClose }: ModalAgregarCompromisoProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-md max-h-[85dvh] overflow-y-auto origin-bottom sm:origin-center bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 pb-8 animate-in fade-in zoom-in-95 duration-200 ease-out motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-agregar-compromiso-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-agregar-compromiso-title" className="text-lg font-bold text-white">
            Agregar compromiso
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-zinc-500 text-sm">Próximamente.</p>
      </div>
    </div>
  )
}
