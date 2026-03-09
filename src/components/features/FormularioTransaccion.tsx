'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { registrarTransaccion } from '@/app/actions/transacciones'

const CATEGORIAS = [
  '🛒 Supermercado', '🍔 Comida / Delivery', '🚗 Transporte / Nafta',
  '🏠 Hogar / Alquiler', '💡 Servicios (Luz, Agua, Internet)',
  '⚕️ Salud / Farmacia', '🎬 Entretenimiento', '👕 Ropa / Accesorios',
  '💰 Sueldo / Ingreso Principal', '📦 Otros'
]

export function FormularioTransaccion() {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [esGasto, setEsGasto] = useState(true)
  const [esCuota, setEsCuota] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    const result = await registrarTransaccion(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    formRef.current?.reset()
    setEsCuota(false)
    setLoading(false)
  }

  const inputClass = "bg-zinc-950/50 border border-zinc-800 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all w-full"

  return (
    <form ref={formRef} action={handleSubmit} className="relative overflow-hidden flex flex-col gap-5 bg-zinc-900/50 p-6 md:p-8 rounded-2xl border border-zinc-800/80 shadow-lg backdrop-blur-md">
      {/* Luz de fondo sutil */}
      <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-10 bg-emerald-500 pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-2 border-b border-zinc-800/50 pb-4">
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        <h3 className="text-lg font-semibold text-white tracking-tight">Nuevo Movimiento</h3>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}
      
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tipo</label>
          <select name="tipo" onChange={(e) => setEsGasto(e.target.value === 'gasto')} className={inputClass} required>
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Monto</label>
          <div className="flex gap-2">
            <select name="moneda" className={`${inputClass} w-24 px-1 text-center`}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
            <input type="number" step="0.01" name="monto_original" placeholder="0.00" className={inputClass} required />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Categoría</label>
        <select name="categoria" className={inputClass} required defaultValue="">
          <option value="" disabled>Selecciona una categoría...</option>
          {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {esGasto && (
        <div className="flex gap-4 p-4 bg-zinc-950/40 rounded-xl border border-zinc-800/60">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Prioridad</label>
            <select name="tipo_gasto" className="bg-zinc-900 border border-zinc-800 rounded-md p-2 text-white text-xs outline-none focus:border-emerald-500 transition-colors">
              <option value="fijo">🔒 Fijo (Alta)</option>
              <option value="variable">📈 Variable (Media)</option>
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Estado</label>
            <select name="estado" className="bg-zinc-900 border border-zinc-800 rounded-md p-2 text-white text-xs outline-none focus:border-emerald-500 transition-colors">
              <option value="pagado">✅ Pagado</option>
              <option value="pendiente">⏳ Pendiente</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Descripción</label>
        <input type="text" name="descripcion" placeholder="Ej: Moto de Oro, Alquiler, Claro..." className={inputClass} />
      </div>

      {esGasto && (
        <div className="flex flex-col gap-3 mt-1 p-4 bg-zinc-950/40 rounded-xl border border-zinc-800/60">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" id="es_cuota" onChange={(e) => setEsCuota(e.target.checked)} className="peer appearance-none w-5 h-5 border border-zinc-700 rounded bg-zinc-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">Es una compra en cuotas</span>
          </label>
          {esCuota && (
            <div className="flex gap-3 items-center text-sm text-zinc-400 pl-8 transition-all">
              Cuota <input type="number" name="cuota_actual" placeholder="1" className="w-16 bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-white text-center focus:border-emerald-500 outline-none" /> 
              de <input type="number" name="cuota_total" placeholder="12" className="w-16 bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-white text-center focus:border-emerald-500 outline-none" />
            </div>
          )}
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer group mt-2">
        <div className="relative flex items-center justify-center">
          <input type="checkbox" name="es_compartido" id="es_compartido" className="peer appearance-none w-5 h-5 border border-zinc-700 rounded bg-zinc-900 checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer" />
          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">Gasto compartido con mi partner</span>
      </label>

      <Button type="submit" disabled={loading} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-emerald-900/20 transition-all border border-emerald-500/50">
        {loading ? 'Guardando Movimiento...' : 'Guardar Movimiento'}
      </Button>
    </form>
  )
}
