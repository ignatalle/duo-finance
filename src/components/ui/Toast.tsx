'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { CheckCircle2, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'info' | 'error'

interface ToastItem {
  id: number
  msg: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, msg, type }])
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timeoutRefs.current.delete(id)
    }, 4000)
    timeoutRefs.current.set(id, timeout)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-[slideDown_0.3s_ease-out] pointer-events-auto',
              toast.type === 'success' && 'bg-emerald-500 text-white',
              toast.type === 'info' && 'bg-indigo-500 text-white',
              toast.type === 'error' && 'bg-rose-500 text-white'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'info' && <Bell size={18} />}
            <span className="font-medium text-sm">{toast.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
