'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { registrarTransaccion } from '@/app/actions/transacciones'
import { useDashboardModal } from '@/components/dashboard/DashboardModalContext'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { obtenerTarjetas } from '@/app/actions/tarjetas'
import type { Tarjeta } from '@/app/actions/tarjetas'
import { CATEGORIAS_FORMULARIO } from '@/components/features/formulario-transaccion/constants'
import { FormularioTransaccionModal } from '@/components/features/formulario-transaccion/FormularioTransaccionModal'

interface FormularioTransaccionProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  initialTipo?: 'gasto' | 'ingreso'
}

export function FormularioTransaccion({
  isOpen: controlledOpen,
  onOpenChange,
  initialTipo,
}: FormularioTransaccionProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? (v: boolean) => onOpenChange?.(v) : setInternalOpen

  const [isPending, startTransition] = useTransition()
  const [tipo, setTipo] = useState(initialTipo || 'gasto')
  const [categoriaSel, setCategoriaSel] = useState(CATEGORIAS_FORMULARIO[0])
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
        setTarjetaId((prev) => (prev && !data.some((t) => t.id === prev) ? '' : prev))
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

      {isOpen && (
        <FormularioTransaccionModal
          onClose={() => setIsOpen(false)}
          tipo={tipo}
          setTipo={setTipo}
          categoriaSel={categoriaSel}
          setCategoriaSel={setCategoriaSel}
          monto={monto}
          setMonto={setMonto}
          descripcion={descripcion}
          setDescripcion={setDescripcion}
          esCompartido={esCompartido}
          setEsCompartido={setEsCompartido}
          tipoGasto={tipoGasto}
          setTipoGasto={setTipoGasto}
          tarjetaId={tarjetaId}
          setTarjetaId={setTarjetaId}
          cuotas={cuotas}
          setCuotas={setCuotas}
          tarjetas={tarjetas}
          aiText={aiText}
          setAiText={setAiText}
          isAiLoading={isAiLoading}
          esPrestamo={esPrestamo}
          setEsPrestamo={setEsPrestamo}
          fecha={fecha}
          setFecha={setFecha}
          carouselRef={carouselRef}
          modal={modal ?? undefined}
          isPending={isPending}
          handleSubmit={handleSubmit}
          handleAiParse={handleAiParse}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </>
  )
}
