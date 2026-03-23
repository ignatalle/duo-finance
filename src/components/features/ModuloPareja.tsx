'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { vincularPareja, generarCodigoVinculacion } from '@/app/actions/pareja'
import { HeartHandshake, Copy, Check, Link2, Loader2 } from 'lucide-react'

type ModuloParejaProps =
  | { parejaId: string | null | undefined; codigoPareja?: string | null; perfil?: never }
  | { perfil: { pareja_id?: string | null } | null; parejaId?: never; codigoPareja?: never }

export function ModuloPareja(props: ModuloParejaProps) {
  const parejaId = 'perfil' in props ? props.perfil?.pareja_id : props.parejaId
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [miCodigo, setMiCodigo] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [errorMsj, setErrorMsj] = useState<string | null>(null)

  // Si ya tiene pareja vinculada, ocultar... EXCEPTO si acabamos de generar el código (miCodigo en state)
  // para que pueda copiarlo antes de que desaparezca
  if (parejaId && !miCodigo) return null

  const handleGenerarCodigo = async () => {
    try {
      const codigo = await generarCodigoVinculacion()
      setMiCodigo(codigo)
      setErrorMsj(null)
    } catch (e) {
      setErrorMsj(e instanceof Error ? e.message : 'No se pudo generar el código')
    }
  }

  const handleCopiar = () => {
    if (miCodigo) {
      navigator.clipboard.writeText(miCodigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const handleVincular = async (formData: FormData) => {
    setErrorMsj(null)
    startTransition(async () => {
      const result = await vincularPareja(formData)
      if (result?.error) {
        setErrorMsj(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-indigo-100 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <HeartHandshake size={20} />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Vincular Cuenta</h3>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Gestión en pareja</p>
        </div>
      </div>

      {errorMsj && (
        <p className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 mb-4 font-semibold">
          {errorMsj}
        </p>
      )}

      <div className="flex flex-col gap-4 relative z-10">
        
        {/* SECCIÓN 1: Unirse con código */}
        <form action={handleVincular} className="flex gap-2">
          <input 
            type="text" 
            name="codigo" 
            placeholder="Pegar código aquí..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-400"
            required
            minLength={6}
            maxLength={6}
          />
          <button 
            type="submit" 
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 rounded-2xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : 'Unirse'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-100 flex-1"></div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">O INVITA A TU PAREJA</span>
          <div className="h-px bg-slate-100 flex-1"></div>
        </div>

        {/* SECCIÓN 2: Generar mi código */}
        {!miCodigo ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Al generar el código, vas a crear un espacio compartido y vas a quedar vinculado como primer miembro. Luego compartí el código con tu pareja para que se una.
            </p>
            <button 
              type="button"
              onClick={handleGenerarCodigo}
              className="w-full bg-slate-50 hover:bg-slate-100 text-indigo-600 border border-slate-200 py-3 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Link2 size={16} /> Generar mi código
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center space-y-2">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Tu código de invitación</p>
            <p className="text-xs text-slate-600">Ya estás vinculado a este espacio. Compartí el código con tu pareja:</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-2xl font-black text-emerald-700 tracking-[0.2em]">{miCodigo}</span>
              <button 
                type="button"
                onClick={handleCopiar}
                className="w-8 h-8 bg-emerald-200/50 hover:bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center transition-colors"
                title="Copiar código"
              >
                {copiado ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
