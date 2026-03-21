'use client'

import { useState, useTransition } from 'react'
import { registrarTransaccion } from '@/app/actions/transacciones'
import { Plus, X, Sparkles, MessageSquare, ShoppingBag, Utensils, Car, Home, Zap, HeartPulse, Film, Shirt, DollarSign, Package, Loader2 } from 'lucide-react'

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

export function FormularioTransaccion() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Estados para el UI
  const [tipo, setTipo] = useState('gasto')
  const [categoriaSel, setCategoriaSel] = useState(CATEGORIAS[0])
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [esCompartido, setEsCompartido] = useState(false)
  const [aiText, setAiText] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      // Nos aseguramos de inyectar los valores del UI al FormData
      formData.set('tipo', tipo)
      formData.set('categoria', categoriaSel)
      if (esCompartido) formData.set('es_compartido', 'on')
      
      // Valores por defecto para mantener la DB feliz
      formData.set('moneda', 'ARS')
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

  return (
    <>
      {/* BOTÓN FLOTANTE (+) - esquina inferior derecha, arriba de la barra nav */}
      <div className="fixed bottom-28 right-6 z-40">
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-800/30 hover:bg-slate-700 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* MODAL / BOTTOM SHEET */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          {/* Fondo oscuro con blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto hide-scrollbar">
            
            {/* Tirador deslizable (solo visual) */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {tipo === 'ingreso' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
              </h2>
              <button type="button" onClick={() => setIsOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* MÓDULO INTELIGENCIA ARTIFICIAL */}
            <div className="mb-6 bg-indigo-50/50 p-4 rounded-3xl border border-indigo-50">
              <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={14} /> Carga Mágica con IA
              </label>
              <div className="flex gap-2 relative">
                <div className="absolute left-3 top-3 text-indigo-300">
                  <MessageSquare size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder='"Gasté 15mil en nafta..."'
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
                  className="flex-1 bg-white border border-indigo-100 rounded-2xl py-2.5 pl-10 pr-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={handleAiParse}
                  disabled={isAiLoading || !aiText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-2.5 rounded-2xl transition-colors shadow-sm flex items-center justify-center"
                >
                  {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">O manual</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            
            {/* FORMULARIO MANUAL */}
            <form action={handleSubmit} className="space-y-6">
              
              {/* Selector Tipo (Gasto / Ingreso) */}
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setTipo('gasto')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tipo === 'gasto' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                >
                  Gasto
                </button>
                <button 
                  type="button"
                  onClick={() => setTipo('ingreso')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tipo === 'ingreso' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Ingreso
                </button>
              </div>

              {/* Importe Gigante */}
              <div className="text-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Importe</label>
                <div className="flex justify-center items-center text-5xl font-extrabold text-slate-800">
                  <span className="text-slate-300 mr-1">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0"
                    className="w-40 bg-transparent border-none text-center focus:ring-0 p-0 placeholder-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Concepto */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Concepto</label>
                <input 
                  type="text" 
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Cena en pizzería"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-800 font-medium focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all outline-none"
                />
              </div>

              {/* Selector de Categorías Horizontal */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Categoría</label>
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {CATEGORY_ITEMS.map(cat => {
                    const isSelected = categoriaSel === cat.id
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoriaSel(cat.id)}
                        className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 w-20 rounded-2xl border-2 transition-all ${isSelected ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        <Icon size={24} />
                        <span className="text-[10px] font-bold">{cat.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Gasto Compartido (Toggle UI) */}
              {tipo === 'gasto' && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">¿Gasto en Pareja?</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEsCompartido(false)}
                      className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${!esCompartido ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500'}`}
                    >
                      Solo mío
                    </button>
                    <button
                      type="button"
                      onClick={() => setEsCompartido(true)}
                      className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${esCompartido ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500'}`}
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
                className="w-full bg-slate-800 disabled:bg-slate-400 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-900 transition-colors shadow-xl shadow-slate-800/20 mt-4 flex justify-center items-center"
              >
                {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Guardar Movimiento'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Estilos para ocultar la barra de scroll de categorías */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Evita que los inputs hagan zoom en iOS */
        input[type="number"], input[type="text"] { font-size: 16px; }
      `}} />
    </>
  )
}
