'use client'

import { useState } from 'react'
import { MessageSquare, X, ArrowRight } from 'lucide-react'

interface Mensaje {
  role: 'user' | 'system'
  text: string
}

export function AsistenteIA({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const [input, setInput] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: 'system', text: 'Hola. Soy tu asistente financiero. Puedo registrar gastos complejos, proyectar cuotas o analizar tu mes.' },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const nuevoMensaje: Mensaje = { role: 'user', text: input }
    setMensajes((prev) => [...prev, nuevoMensaje])
    setInput('')

    setTimeout(() => {
      const lower = input.toLowerCase()
      let respuesta = ''
      if (lower.includes('tele') || lower.includes('tv') || lower.includes('180') || lower.includes('180000')) {
        respuesta = `✅ Registrado: Smart TV — $180.000 en 12 cuotas de $15.000
💳 Tarjeta: Visa Signature | Inicio: abril 2026 | Fin: marzo 2027
📅 Impacto en próximo resumen Visa: +$15.000
⚡ Tu margen libre del mes se reduce en $15.000 por los próximos 12 meses.`
      } else {
        respuesta = 'Anotado. He actualizado tus balances y proyecciones automáticas.'
      }
      setMensajes((prev) => [...prev, { role: 'system', text: respuesta }])
    }, 800)
  }

  const handlePromptEjemplo = () => {
    setInput('Compré un Smart TV de $180.000 en 12 cuotas con la tarjeta Visa')
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[550px] bg-zinc-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 flex flex-col z-[60] overflow-hidden animate-[slideUp_0.3s_ease-out]">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 flex justify-between items-center shadow-md">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} /> Asistente IA
            </h3>
            <button
              onClick={() => onClose?.()}
              className="text-indigo-200 hover:text-white bg-white/10 p-1 rounded-md"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {mensajes.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm whitespace-pre-line shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-zinc-700 text-white rounded-br-sm'
                      : 'bg-indigo-900/50 border border-indigo-500/30 text-indigo-50 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {mensajes.length === 1 && (
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handlePromptEjemplo}
                  className="mt-2 text-xs bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl text-indigo-300 hover:bg-indigo-500/20 transition-colors text-left font-medium"
                >
                  Probar: &quot;Compré un Smart TV de $180.000 en 12 cuotas...&quot;
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800 bg-zinc-950">
            <div className="flex relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Preguntame o registrá algo..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-3.5 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-all flex items-center justify-center shadow-md hover:scale-105"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
