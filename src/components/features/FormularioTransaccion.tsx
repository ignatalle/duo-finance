'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { registrarTransaccion } from '@/app/actions/transacciones'

const CATEGORIAS = [
  { id: 'supermercado', nombre: '🛒 Supermercado' },
  { id: 'comida', nombre: '🍔 Comida / Delivery' },
  { id: 'transporte', nombre: '🚗 Transporte / Nafta' },
  { id: 'hogar', nombre: '🏠 Hogar / Alquiler' },
  { id: 'servicios', nombre: '💡 Servicios (Luz, Agua, Internet)' },
  { id: 'salud', nombre: '⚕️ Salud / Farmacia' },
  { id: 'entretenimiento', nombre: '🎬 Entretenimiento' },
  { id: 'ropa', nombre: '👕 Ropa / Accesorios' },
  { id: 'sueldo', nombre: '💰 Sueldo / Ingreso Principal' },
  { id: 'otros', nombre: '📦 Otros' }
]

export function FormularioTransaccion() {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    await registrarTransaccion(formData)
    formRef.current?.reset()
    setLoading(false)
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
      <h3 className="text-lg font-medium text-white mb-2">Nueva Transacción</h3>
      
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Tipo</label>
          <select name="tipo" className="bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-green-500 focus:outline-none" required>
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>
        
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Monto ($)</label>
          <input type="number" step="0.01" name="monto" className="bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-green-500 focus:outline-none" required />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-400">Categoría</label>
        <select name="categoria" className="bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-green-500 focus:outline-none" required>
          <option value="" disabled>Selecciona una categoría...</option>
          {CATEGORIAS.map(cat => (
            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-400">Descripción (Opcional)</label>
        <input type="text" name="descripcion" placeholder="Detalles de la compra..." className="bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-green-500 focus:outline-none" />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" name="es_compartido" id="es_compartido" className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-green-500 focus:ring-green-500 focus:ring-offset-zinc-900 cursor-pointer" />
        <label htmlFor="es_compartido" className="text-sm text-zinc-300 cursor-pointer">¿Gasto compartido con mi partner?</label>
      </div>

      <Button type="submit" disabled={loading} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium">
        {loading ? 'Guardando...' : 'Guardar Transacción'}
      </Button>
    </form>
  )
}
