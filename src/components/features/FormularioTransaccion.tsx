'use client'

import { useState, useTransition, useEffect } from 'react'
import { registrarTransaccion } from '@/app/actions/transacciones'
import { Plus, X, Sparkles, MessageSquare, Loader2, ShoppingBag, Utensils, Car, Home, Zap, HeartPulse, Film, Shirt, DollarSign, Package } from 'lucide-react'

const CATEGORIAS = [
  '🛒 Supermercado', '🍔 Comida / Delivery', '🚗 Transporte / Nafta',
  '🏠 Hogar / Alquiler', '💡 Servicios (Luz, Agua, Internet)',
  '⚕️ Salud / Farmacia', '🎬 Entretenimiento', '👕 Ropa / Accesorios',
  '💰 Sueldo / Ingreso Principal', '📦 Otros'
]

const getCategoryData = (catStr: string) => {
  if (catStr.includes('Supermercado')) return { id: catStr, name: 'Súper', icon: ShoppingBag }
  if (catStr.includes('Comida')) return { id: catStr, name: 'Comida', icon: Utensils }
  if (catStr.includes('Transporte')) return { id: catStr, name: 'Viaje', icon: Car }
  if (catStr.includes('Hogar')) return { id: catStr, name: 'Hogar', icon: Home }
  if (catStr.includes('Servicios')) return { id: catStr, name: 'Pagos', icon: Zap }
  if (catStr.includes('Salud')) return { id: catStr, name: 'Salud', icon: HeartPulse }
  if (catStr.includes('Entretenimiento')) return { id: catStr, name: 'Ocio', icon: Film }
  if (catStr.includes('Ropa')) return { id: catStr, name: 'Ropa', icon: Shirt }
  if (catStr.includes('Sueldo')) return { id: catStr, name: 'Sueldo', icon: DollarSign }
  return { id: catStr, name: 'Otros', icon: Package }
}

const CATEGORY_ITEMS = CATEGORIAS.map(getCategoryData)

interface FormularioTransaccionProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  initialTipo?: 'gasto' | 'ingreso'
}

export function FormularioTransaccion({ isOpen: controlledOpen, onOpenChange, initialTipo }: FormularioTransaccionProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? (v: boolean) => onOpenChange?.(v) : setInternalOpen

  const [isPending, startTransition] = useTransition()
  const [tipo, setTipo] = useState(initialTipo || 'gasto')
  const [categoriaSel, setCategoriaSel] = useState(CATEGORIAS[0])
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [esCompartido, setEsCompartido] = useState(false)
  const [aiText, setAiText] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      // Inyectamos TODOS los valores del estado de React al FormData
      formData.set('tipo', tipo)
      formData.set('categoria', categoriaSel)
      formData.set('descripcion', descripcion) // 🔥 FIX CRÍTICO: Antes se perdía el concepto
      
      if (esCompartido) formData.set('es_compartido', 'on')
      
      // Valores por defecto
      formData.set('moneda', 'ARS') // Próximamente lo haremos dinámico
      formData.set('monto_original', monto)
      formData.set('estado', 'pagado')
      formData.set('tipo_gasto', 'variable')

      const result = await registrarTransaccion(formData)
      if (result.success) {
        setIsOpen(false)
        setMonto('')
        setDescripcion('')
        setAiText('')
      } else {
        alert(result.error || 'Hubo un error al guardar')
      }
    })
  }

  // Simulación de carga IA (Podemos conectarlo a Gemini real luego)
  const handleAiParse = () => {
    if (!aiText) return
    setIsAiLoading(true)
    setTimeout(() => {
      setMonto('15000')
      setDescripcion(aiText)
      setTipo('gasto')
      setIsAiLoading(false)
      setAiText('')
    }, 1500)
  }

  useEffect(() => {
    if (isOpen && initialTipo) setTipo(initialTipo)
  }, [isOpen, initialTipo])

  return (
    <>
      {/* BOTÓN FLOTANTE (+) - solo cuando no está controlado por FAB */}
      {!isControlled && (
        <div className="fixed bottom-28 right-6 z-40">
          <button 
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-800/30 hover:bg-slate-700 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={28} />
          </button>
        </div>
      )}

      {/* MODAL CENTRADO Y COMPACTO */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro con desenfoque sutil */}
          <div 
            className="absolute inset-0 bg-slate-800/20 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 z-10 border border-slate-100">
            
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {tipo === 'ingreso' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
              </h2>
              <button type="button" onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* MÓDULO INTELIGENCIA ARTIFICIAL COMPACTO */}
            <div className="mb-5 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-50">
              <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> Carga Mágica
              </label>
              <div className="flex gap-2 relative">
                <div className="absolute left-2.5 top-2 text-indigo-300">
                  <MessageSquare size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder='"Gasté 15mil en nafta..."'
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
                  className="flex-1 bg-white border border-indigo-100 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={handleAiParse}
                  disabled={isAiLoading || !aiText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-3 rounded-xl transition-colors flex items-center justify-center"
                >
                  {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                </button>
              </div>
            </div>
            
            {/* FORMULARIO MANUAL COMPACTO */}
            <form action={handleSubmit} className="space-y-4">
              
              {/* Selector Tipo */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setTipo('gasto')}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${tipo === 'gasto' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                >
                  Gasto
                </button>
                <button 
                  type="button"
                  onClick={() => setTipo('ingreso')}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${tipo === 'ingreso' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Ingreso
                </button>
              </div>

              {/* Fila: Importe y Concepto */}
              <div className="flex gap-3">
                <div className="w-1/3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Importe</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-slate-800 transition-all">
                    <span className="text-slate-400 font-bold mr-1">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent border-none text-lg font-bold text-slate-800 focus:ring-0 p-0 placeholder-slate-300 outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Concepto</label>
                  <input 
                    type="text" 
                    required
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej. Cena"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Selector de Categorías Compacto */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Categoría</label>
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {CATEGORY_ITEMS.map(cat => {
                    const isSelected = categoriaSel === cat.id
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoriaSel(cat.id)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${isSelected ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        <Icon size={14} />
                        <span className="text-[11px] font-bold whitespace-nowrap">{cat.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Gasto Compartido */}
              {tipo === 'gasto' && (
                <div className="pt-1">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEsCompartido(false)}
                      className={`flex-1 py-2 rounded-xl border font-bold text-xs transition-all ${!esCompartido ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'}`}
                    >
                      Solo mío
                    </button>
                    <button
                      type="button"
                      onClick={() => setEsCompartido(true)}
                      className={`flex-1 py-2 rounded-xl border font-bold text-xs transition-all ${esCompartido ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'}`}
                    >
                      Compartido
                    </button>
                  </div>
                </div>
              )}

              {/* Botón Guardar */}
              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-slate-800 disabled:bg-slate-400 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors shadow-lg shadow-slate-800/10 mt-2 flex justify-center items-center"
              >
                {isPending ? <Loader2 className="animate-spin" size={16} /> : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  )
}
