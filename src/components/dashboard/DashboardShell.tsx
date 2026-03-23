'use client'

import { useState } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { DashboardModalProvider } from '@/components/dashboard/DashboardModalContext'
import { FAB } from '@/components/features/FAB'
import { FormularioTransaccion } from '@/components/features/FormularioTransaccion'
import { AsistenteIA } from '@/components/features/AsistenteIA'
import { ModalEscanner } from '@/components/features/ModalEscanner'
import type { ReactNode } from 'react'

export function DashboardShell({ children }: { children: ReactNode }) {
  const [modalTipo, setModalTipo] = useState<'gasto' | 'ingreso' | null>(null)
  const [escannerOpen, setEscannerOpen] = useState(false)
  const [asistenteOpen, setAsistenteOpen] = useState(false)

  const modalValue = {
    openGasto: () => setModalTipo('gasto'),
    openIngreso: () => setModalTipo('ingreso'),
    openEscanear: () => setEscannerOpen(true),
  }

  return (
    <ToastProvider>
      <DashboardModalProvider value={modalValue}>
      {children}
      <FAB
        onEscanear={() => setEscannerOpen(true)}
        onGasto={() => setModalTipo('gasto')}
        onIngreso={() => setModalTipo('ingreso')}
        onAsistente={() => setAsistenteOpen(true)}
      />
      <FormularioTransaccion
        isOpen={modalTipo !== null}
        onOpenChange={(open) => !open && setModalTipo(null)}
        initialTipo={modalTipo ?? 'gasto'}
      />
      <AsistenteIA isOpen={asistenteOpen} onClose={() => setAsistenteOpen(false)} />
      <ModalEscanner isOpen={escannerOpen} onClose={() => setEscannerOpen(false)} />
      </DashboardModalProvider>
    </ToastProvider>
  )
}
