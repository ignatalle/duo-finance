'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ModalPresupuestos } from '@/components/features/ModalPresupuestos'

export function GastosClient({
  mesParam,
  presupuestos,
}: {
  mesParam: string
  presupuestos: { categoria: string; limite_mensual: number }[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const configLimites = searchParams.get('config') === 'limites'

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('config')
    const q = params.toString()
    router.push(q ? `${pathname}?${q}` : pathname)
  }

  return (
    <ModalPresupuestos
      isOpen={configLimites}
      onClose={handleClose}
      mesRef={mesParam}
      presupuestosExistentes={presupuestos}
    />
  )
}
