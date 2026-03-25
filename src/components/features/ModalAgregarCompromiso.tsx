'use client'

import { X } from 'lucide-react'

interface ModalAgregarCompromisoProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalAgregarCompromiso({ isOpen, onClose }: ModalAgregarCompromisoProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[85dvh] overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Agregar compromiso</h3>
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
    </>
  )
}
