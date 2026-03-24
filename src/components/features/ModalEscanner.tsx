'use client'

import { useState, useRef, useTransition } from 'react'
import { ScanSearch, Camera, UploadCloud, FileCheck, Check, X, ImageIcon } from 'lucide-react'
import { registrarTransaccion } from '@/app/actions/transacciones'
import { useToast } from '@/components/ui/Toast'
import { parsearTextoOCR, parsearResumenTarjeta, type GastoParseado } from '@/lib/ocr/parser'
import { analizarDocumentoConIA } from '@/app/actions/analizarDocumentoIA'

const CATEGORIAS = [
  '🛒 Supermercado',
  '🍔 Comida / Delivery',
  '🚗 Transporte / Nafta',
  '🏠 Hogar / Alquiler',
  '💡 Servicios (Luz, Agua, Internet)',
  '⚕️ Salud / Farmacia',
  '🎬 Entretenimiento',
  '👕 Ropa / Accesorios',
  '💰 Sueldo / Ingreso Principal',
  '📦 Otros',
]

interface ModalEscannerProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalEscanner({ isOpen, onClose }: ModalEscannerProps) {
  const [step, setStep] = useState<'idle' | 'scanning' | 'review' | 'error'>('idle')
  const [gastos, setGastos] = useState<GastoParseado[]>([])
  const [textoOCR, setTextoOCR] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [usandoIA, setUsandoIA] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  if (!isOpen) return null

  /** Extrae texto nativo del PDF (sin OCR). Ideal para resúmenes de tarjeta digitales. */
  const pdfExtraerTexto = async (file: File): Promise<string> => {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    const data = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument(data).promise
    const numPages = pdf.numPages
    const lineasPorPagina: string[] = []
    for (let p = 1; p <= numPages; p++) {
      const page = await pdf.getPage(p)
      const textContent = await page.getTextContent()
      const items = textContent.items as Array<{ str: string; transform?: number[] }>
      const lineas: { y: number; texts: string[] }[] = []
      let lastY = -999
      const threshold = 5
      for (const item of items) {
        const str = 'str' in item ? item.str : ''
        if (!str) continue
        const y = item.transform?.[5] ?? 0
        if (Math.abs(y - lastY) > threshold) {
          lineas.push({ y, texts: [str] })
          lastY = y
        } else if (lineas.length > 0) {
          lineas[lineas.length - 1].texts.push(str)
        }
      }
      lineas.sort((a, b) => b.y - a.y)
      for (const l of lineas) {
        lineasPorPagina.push(l.texts.join(' ').trim())
      }
    }
    return lineasPorPagina.join('\n')
  }

  const procesarArchivo = async (file: File) => {
    setStep('scanning')
    setErrorMsg('')
    setGastos([])
    setTextoOCR('')

    try {
      let texto: string
      if (file.type === 'application/pdf') {
        texto = await pdfExtraerTexto(file)
      } else {
        const Tesseract = (await import('tesseract.js')).default
        const { data } = await Tesseract.recognize(file, 'spa+eng', { logger: () => {} })
        texto = data.text.trim()
      }
      setTextoOCR(texto)

      let parseados = parsearResumenTarjeta(texto)
      if (parseados.length === 0) parseados = parsearTextoOCR(texto)
      if (parseados.length === 0) {
        setUsandoIA(true)
        const resIA = await analizarDocumentoConIA(texto)
        if (resIA.success && resIA.gastos?.length) {
          setGastos(resIA.gastos)
          setStep('review')
          toast.showToast('La IA detectó los gastos correctamente.')
          return
        }
        setUsandoIA(false)
        setErrorMsg(resIA.error || 'No se detectaron montos. Configurá OPENAI_API_KEY en .env.local para análisis por IA.')
        setStep('error')
        return
      }
      setGastos(parseados)
      setStep('review')
    } catch (err) {
      console.error('Error procesando:', err)
      setErrorMsg('Error al procesar el archivo. Intentá de nuevo.')
      setStep('error')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) { e.target.value = ''; return }
    const esImagen = file.type.startsWith('image/')
    const esPDF = file.type === 'application/pdf'
    if (esImagen || esPDF) {
      procesarArchivo(file)
    } else {
      setErrorMsg('Solo se permiten imágenes (JPG, PNG, WebP) o PDF.')
      setStep('error')
    }
    e.target.value = ''
  }

  const handleCapturar = () => {
    fileInputRef.current?.click()
  }

  const handleConfirmImport = async () => {
    if (gastos.length === 0) return
    startTransition(async () => {
      try {
        for (const item of gastos) {
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
        toast.showToast('¡Gastos escaneados y guardados con éxito!')
        onClose()
        resetEstado()
      } catch {
        toast.showToast('Error al guardar. Intentá de nuevo.', 'error')
      }
    })
  }

  const actualizarGasto = (index: number, campo: 'desc' | 'monto' | 'cat', valor: string | number) => {
    setGastos((prev) =>
      prev.map((g, i) =>
        i === index ? { ...g, [campo]: valor } : g
      )
    )
  }

  const resetEstado = () => {
    setTimeout(() => {
      setStep('idle')
      setGastos([])
      setTextoOCR('')
      setErrorMsg('')
      setUsandoIA(false)
    }, 300)
  }

  const handleAnalizarConIA = async () => {
    if (!textoOCR.trim()) return
    setUsandoIA(true)
    const res = await analizarDocumentoConIA(textoOCR)
    setUsandoIA(false)
    if (res.success && res.gastos?.length) {
      setGastos(res.gastos)
      setUsandoIA(true)
      setStep('review')
      setErrorMsg('')
      toast.showToast('La IA detectó los gastos correctamente.')
    } else {
      setErrorMsg(res.error || 'No se pudieron detectar gastos.')
    }
  }

  const handleClose = () => {
    onClose()
    resetEstado()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white z-10"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,application/pdf"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {step === 'idle' && (
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <ScanSearch className="text-indigo-400" /> Escáner OCR
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Sacá una foto o subí la imagen/PDF de tu ticket. Extraeremos el monto y lo categorizaremos automáticamente.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleCapturar}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-indigo-500/50 p-4 rounded-xl flex items-center gap-4 transition-all group"
              >
                <div className="bg-indigo-500/20 p-3 rounded-lg group-hover:bg-indigo-500/30">
                  <Camera className="text-indigo-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">Escanear Ticket</p>
                  <p className="text-xs text-zinc-400">Tomar foto o elegir de la galería</p>
                </div>
              </button>
              <button
                onClick={handleCapturar}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-indigo-500/50 p-4 rounded-xl flex items-center gap-4 transition-all group"
              >
                <div className="bg-indigo-500/20 p-3 rounded-lg group-hover:bg-indigo-500/30">
                  <UploadCloud className="text-indigo-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">Subir Imagen</p>
                  <p className="text-xs text-zinc-400">JPG, PNG, WebP o PDF del ticket</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'scanning' && (
          <div className="py-12 flex flex-col items-center justify-center text-center flex-1">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-zinc-700 rounded-2xl" />
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-2xl border-t-transparent animate-spin" />
              <ScanSearch size={40} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Procesando documento...</h3>
            <p className="text-sm text-zinc-400">
              {usandoIA ? 'La IA está analizando el contenido...' : 'Leyendo el texto del documento.'}
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="mt-2">
            <h3 className="text-xl font-bold text-rose-400 mb-2 flex items-center gap-2">
              <ImageIcon size={24} /> No se pudo procesar
            </h3>
            <p className="text-zinc-400 text-sm mb-6">{errorMsg}</p>
            <button
              onClick={() => { setStep('idle'); setErrorMsg('') }}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-zinc-700 hover:bg-zinc-600 transition-colors"
            >
              Volver a intentar
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="mt-2 flex flex-col min-h-0">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <FileCheck className="text-emerald-400" /> Gastos Detectados
            </h3>
            <p className="text-zinc-400 text-sm mb-4">Revisá y editá los datos antes de guardar.</p>
            <div className="space-y-3 mb-6 max-h-[280px] overflow-y-auto pr-2 flex-1">
              {gastos.map((item, i) => (
                <div
                  key={i}
                  className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-900 p-2 rounded-lg text-lg border border-zinc-700/50 shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.desc}
                        onChange={(e) => actualizarGasto(i, 'desc', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-600 rounded-lg px-2 py-1.5 text-white text-sm font-medium outline-none focus:border-indigo-500"
                        placeholder="Descripción"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-zinc-500 text-sm">$</span>
                    <input
                      type="number"
                      value={item.monto}
                      onChange={(e) => actualizarGasto(i, 'monto', parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-zinc-900/50 border border-zinc-600 rounded-lg px-2 py-1.5 text-white font-bold text-sm outline-none focus:border-indigo-500"
                      min="0"
                      step="0.01"
                    />
                    <select
                      value={item.cat}
                      onChange={(e) => actualizarGasto(i, 'cat', e.target.value)}
                      className="flex-1 bg-zinc-900/50 border border-zinc-600 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
                    >
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => { setStep('idle'); resetEstado() }}
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
