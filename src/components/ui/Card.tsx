import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={cn('bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6', className)}>
      {children}
    </div>
  )
}
