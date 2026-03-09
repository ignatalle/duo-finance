'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { crearPareja, unirsePareja } from '@/app/actions/pareja'

export function ModuloPareja({ perfil }: { perfil: any }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<'crear' | 'unirse'>('crear')

  const handleCrear = async (formData: FormData) => {
    setLoading(true)
    await crearPareja(formData)
    setLoading(false)
  }

  const handleUnirse = async (formData: FormData) => {
    setLoading(true)
    await unirsePareja(formData)
    setLoading(false)
  }

  // VISTA 1: Ya tienes pareja (Mostramos el código para invitar)
  if (perfil?.pareja_id) {
    return (
      <div className="p-6 border border-zinc-800 rounded-lg bg-zinc-900">
        <h3 className="text-lg font-medium text-green-400 mb-2">Espacio Compartido</h3>
        <p className="text-sm text-zinc-400">Estás vinculado/a al espacio con el ID:</p>
        
        <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800 rounded-md flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-zinc-400 truncate select-all">{perfil.pareja_id}</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
            onClick={() => navigator.clipboard.writeText(perfil.pareja_id)}
          >
            Copiar
          </Button>
        </div>
        
        <p className="text-xs text-zinc-500 mt-4">
          Pásale este código a tu partner para que lo ingrese en su cuenta.
        </p>
      </div>
    )
  }

  // VISTA 2: No tienes pareja (Mostramos opciones para crear o unirse)
  return (
    <div className="p-6 border border-zinc-800 rounded-lg bg-zinc-900">
      <div className="flex gap-4 mb-4 border-b border-zinc-800 pb-2">
        <button 
          onClick={() => setModo('crear')}
          className={`text-sm font-medium pb-2 -mb-[9px] ${modo === 'crear' ? 'text-white border-b-2 border-green-500' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          Crear Nuevo
        </button>
        <button 
          onClick={() => setModo('unirse')}
          className={`text-sm font-medium pb-2 -mb-[9px] ${modo === 'unirse' ? 'text-white border-b-2 border-green-500' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          Unirse con Código
        </button>
      </div>

      {modo === 'crear' ? (
        <form ref={formRef} action={handleCrear} className="flex flex-col gap-3 mt-4">
          <p className="text-sm text-zinc-400 mb-1">Crea un espacio para gestionar gastos conjuntos.</p>
          <input type="text" name="nombre" placeholder="Ej: Igna y Cami" className="bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm" required />
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white mt-1">
            {loading ? 'Creando...' : 'Crear Espacio'}
          </Button>
        </form>
      ) : (
        <form ref={formRef} action={handleUnirse} className="flex flex-col gap-3 mt-4">
          <p className="text-sm text-zinc-400 mb-1">Pega el código que te pasó tu partner.</p>
          <input type="text" name="pareja_id" placeholder="Pega el código aquí..." className="bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm font-mono" required />
          <Button type="submit" disabled={loading} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white mt-1">
            {loading ? 'Vinculando...' : 'Unirse al Espacio'}
          </Button>
        </form>
      )}
    </div>
  )
}
