'use client'

import { createContext, useContext, type ReactNode } from 'react'

interface DashboardModalContextValue {
  openGasto: () => void
  openIngreso: () => void
  openEscanear: () => void
}

const DashboardModalContext = createContext<DashboardModalContextValue | null>(null)

export function useDashboardModal() {
  const ctx = useContext(DashboardModalContext)
  return ctx
}

export function DashboardModalProvider({
  children,
  value,
}: {
  children: ReactNode
  value: DashboardModalContextValue
}) {
  return (
    <DashboardModalContext.Provider value={value}>
      {children}
    </DashboardModalContext.Provider>
  )
}
