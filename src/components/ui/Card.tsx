import { cn } from '@/lib/utils'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl p-6', className)}>
      {children}
    </div>
  )
}
