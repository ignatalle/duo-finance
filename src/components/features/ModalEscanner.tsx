'use client'

import { useState } from 'react'
import { useTransition } from 'react'
import { ScanSearch, Camera, UploadCloud, FileCheck, Check, X } from 'lucide-react'
import { registrarTransaccion } from '@/app/actions/transacciones'
import { useToast } from '@/components/ui/Toast'

interface GastoDetectado {
  desc: string
  monto: number
  cat: string
  icon: string
}

const GASTOS_MOCK: GastoDetectado[] = [
  { desc: 'Supermercado Coto', monto: 45000, cat: '🛒 Supermercado', icon: '🛒' },
  { desc: 'Estación Shell', monto: 15000, cat: '🚗 Transporte / Nafta', icon: '🚗' },
  { desc: 'Cine Hoyts', monto: 12000, cat: '🎬 Entretenimiento', icon: '🎬' },
]

interface ModalEscannerProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalEscanner({ isOpen, onClose }: ModalEscannerProps) {
  const [step, setStep] = useState<'idle' | 'scanning' | 'review'>('idle')
  const [isPending, startTransition] = useTransition()
  const toast = useToast()

  if (!isOpen) return null

  const handleStartImport = () => {
    setStep('scanning')
    setTimeout(() => setStep('review'), 2500)
  }

  const handleConfirmImport = async () => {
    startTransition(async () => {
      for (const item of GASTOS_MOCK) {
        const formData = new FormData()
        formData.set('tipo', 'gasto')
        formData.set('categoria', item.cat)
        formData.set('descripcion', item.desc)
        formData.set('monto_original', String(item.monto))
        formData.set('moneda', 'ARS')
        formData.set('estado', 'pagado')
        formData.set('tipo_gasto', 'variable')
        await registrarTransaccion(formData)
      }
      toast.showToast('¡Gastos escaneados y categorizados con éxito!')
      onClose()
      setTimeout(() => setStep('idle'), 500)
    })
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => setStep('idle'), 500)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white z-10"
        >
          <X size={24} />
        </button>

        {step === 'idle' && (
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <ScanSearch className="text-indigo-400" /> Escáner IA
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Importá tus tickets o resúmenes. Extraeremos y categorizaremos automáticamente.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleStartImport}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-indigo-500/50 p-4 rounded-xl flex items-center gap-4 transition-all group"
              >
                <div className="bg-indigo-500/20 p-3 rounded-lg group-hover:bg-indigo-500/30">
                  <Camera className="text-indigo-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">Escanear Ticket</p>
                  <p className="text-xs text-zinc-400">Tomar foto a un recibo o factura</p>
                </div>
              </button>
              <button
                onClick={handleStartImport}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-indigo-500/50 p-4 rounded-xl flex items-center gap-4 transition-all group"
              >
                <div className="bg-indigo-500/20 p-3 rounded-lg group-hover:bg-indigo-500/30">
                  <UploadCloud className="text-indigo-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">Subir Resumen PDF</p>
                  <p className="text-xs text-zinc-400">Archivos de tarjetas o bancos (.pdf, .csv)</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'scanning' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-zinc-700 rounded-2xl" />
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-2xl border-t-transparent animate-spin" />
              <ScanSearch size={40} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Procesando documento...</h3>
            <p className="text-sm text-zinc-400">La IA está leyendo los montos y asignando categorías.</p>
          </div>
        )}

        {step === 'review' && (
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <FileCheck className="text-emerald-400" /> Gastos Detectados
            </h3>
            <p className="text-zinc-400 text-sm mb-6">Revisá los gastos antes de integrarlos a tu presupuesto.</p>
            <div className="space-y-3 mb-6 max-h-[260px] overflow-y-auto pr-2">
              {GASTOS_MOCK.map((item, i) => (
                <div
                  key={i}
                  className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700 flex justify-between items-center hover:border-zinc-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-900 p-2 rounded-lg text-lg border border-zinc-700/50">{item.icon}</div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{item.desc}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 font-medium">{item.cat}</p>
                    </div>
                  </div>
                  <p className="text-white font-black">${item.monto.toLocaleString('es-AR')}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('idle')}
                className="flex-1 py-3.5 rounded-xl font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isPending}
                className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {isPending ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <Check size={18} /> Confirmar e Integrar
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
