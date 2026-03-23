'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { registrarTransaccion } from '@/app/actions/transacciones'
import { useDashboardModal } from '@/components/dashboard/DashboardModalContext'
import { Plus, X, Sparkles, Loader2, ShoppingBag, Utensils, Car, Home, Zap, HeartPulse, Film, Shirt, DollarSign, Package, Calendar, User, Users, Camera, ChevronLeft, ChevronRight, CreditCard, Banknote, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { obtenerTarjetas } from '@/app/actions/tarjetas'
import type { Tarjeta } from '@/app/actions/tarjetas'

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
  const [tipoGasto, setTipoGasto] = useState<'variable' | 'fijo'>('variable')
  const [tarjetaId, setTarjetaId] = useState<string>('')
  const [cuotas, setCuotas] = useState(1)
  const [esPrestamo, setEsPrestamo] = useState(false)
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [aiText, setAiText] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'))
  const carouselRef = useRef<HTMLDivElement>(null)
  const modal = useDashboardModal()

  useEffect(() => {
    if (isOpen) {
      obtenerTarjetas().then((res) => {
        const data = res.data || []
        setTarjetas(data)
        setTarjetaId((prev) => (prev && !data.some((t) => t.id === prev)) ? '' : prev)
      })
    }
  }, [isOpen])

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      formData.set('tipo', tipo)
      formData.set('categoria', categoriaSel)
      formData.set('descripcion', descripcion)
      if (esCompartido) formData.set('es_compartido', 'on')
      if (fecha) formData.set('fecha', fecha)
      formData.set('moneda', 'ARS')
      formData.set('monto_original', monto)
      formData.set('estado', 'pagado')
      formData.set('tipo_gasto', tipoGasto)
      if (tarjetaId) formData.set('tarjeta_id', tarjetaId)
      if (cuotas > 1 && tipo === 'gasto') {
        formData.set('cuota_actual', '1')
        formData.set('cuota_total', String(cuotas))
      }
      if (esPrestamo) formData.set('es_prestamo', 'on')

      const result = await registrarTransaccion(formData)
      if (result.success) {
        setIsOpen(false)
        setMonto('')
        setDescripcion('')
        setAiText('')
        setFecha(format(new Date(), 'yyyy-MM-dd'))
        setTarjetaId('')
        setCuotas(1)
        setEsPrestamo(false)
        setTipoGasto('variable')
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
          
          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 z-10 border border-slate-100">
            
            <div className="relative flex justify-center items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {tipo === 'ingreso' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
              </h2>
              <button type="button" onClick={() => setIsOpen(false)} className="absolute right-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* CARGA MÁGICA - Estilo violeta según mockup */}
            <div className="mb-5 bg-violet-50/80 p-3 rounded-2xl border border-violet-100 border-dashed">
              <label className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> Carga Mágica
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="'Gasté 15m en nafta...'"
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
                  className="flex-1 bg-white border border-violet-100 rounded-xl py-2.5 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={handleAiParse}
                  disabled={isAiLoading || !aiText.trim()}
                  className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0"
                >
                  {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
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

              {/* Carrusel de Categorías con flechas */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Categoría</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => carouselRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div ref={carouselRef} className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar flex-1 min-w-0">
                    {CATEGORY_ITEMS.map(cat => {
                      const isSelected = categoriaSel === cat.id
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategoriaSel(cat.id)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${isSelected ? 'border-slate-800 bg-slate-800 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          <Icon size={14} />
                          <span className="text-[11px] font-bold whitespace-nowrap">{cat.name}</span>
                        </button>
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => carouselRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Tipo Variable/Fijo - solo gastos */}
              {tipo === 'gasto' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tipo de gasto</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTipoGasto('variable')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tipoGasto === 'variable' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                    >
                      Variable
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoGasto('fijo')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tipoGasto === 'fijo' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                    >
                      Fijo
                    </button>
                  </div>
                </div>
              )}

              {/* Tarjeta y Cuotas - solo gastos */}
              {tipo === 'gasto' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">¿En tarjeta?</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => { setTarjetaId(''); setCuotas(1) }}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${!tarjetaId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                      >
                        <Banknote size={16} /> Efectivo
                      </button>
                      <button
                        type="button"
                        onClick={() => tarjetas.length > 0 && setTarjetaId(tarjetas[0].id)}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${tarjetaId ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                      >
                        <CreditCard size={16} /> Tarjeta
                      </button>
                    </div>
                  </div>
                  {tarjetaId && tarjetas.length > 0 && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Tarjeta</label>
                        <select
                          value={tarjetaId}
                          onChange={(e) => setTarjetaId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none"
                        >
                          {tarjetas.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nombre} {t.ultimos_digitos ? `****${t.ultimos_digitos}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Cuotas</label>
                        <select
                          value={cuotas}
                          onChange={(e) => setCuotas(parseInt(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none"
                        >
                          {[1, 2, 3, 6, 9, 12, 18, 24].map((n) => (
                            <option key={n} value={n}>{n === 1 ? '1 cuota (contado)' : `${n} cuotas`}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  {tarjetaId && tarjetas.length === 0 && (
                    <p className="text-xs text-amber-600">No tenés tarjetas vinculadas. Andá a Tarjetas para agregar una.</p>
                  )}
                </div>
              )}

              {/* Es préstamo */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esPrestamo}
                    onChange={(e) => setEsPrestamo(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <FileText size={14} /> Es préstamo o financiación
                  </span>
                </label>
              </div>

              {/* Fecha y Propiedad (íconos persona/grupo) */}
              <div className="flex gap-3">
                <div className={tipo === 'gasto' ? 'w-1/2' : 'flex-1'}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Fecha</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-slate-800 transition-all">
                    <Calendar size={16} className="text-slate-400 mr-2 shrink-0" />
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full bg-transparent border-none text-sm font-medium text-slate-800 outline-none"
                    />
                  </div>
                </div>
                {tipo === 'gasto' && (
                  <div className="w-1/2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Propiedad</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setEsCompartido(false)}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${!esCompartido ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                        title="Solo mío"
                      >
                        <User size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEsCompartido(true)}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center transition-all ${esCompartido ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                        title="Compartido"
                      >
                        <Users size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Escanear Ticket - borde punteado e ícono cámara */}
              {modal && (
                <button
                  type="button"
                  onClick={() => { modal.openEscanear(); setIsOpen(false) }}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <Camera size={18} />
                  Escanear Ticket
                </button>
              )}

              {/* Botón Guardar - más visible (violeta) */}
              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-violet-600 disabled:bg-slate-400 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/25 flex justify-center items-center gap-2"
              >
                {isPending ? <Loader2 className="animate-spin" size={18} /> : 'Guardar'}
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
