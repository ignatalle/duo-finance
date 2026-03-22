import { cn } from '@/lib/utils'

interface ProgressBarProps {
  current: number
  max: number
  colorClass?: string
  heightClass?: string
}

export function ProgressBar({ current, max, colorClass = 'bg-emerald-500', heightClass = 'h-2' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, max > 0 ? (current / max) * 100 : 0))

  return (
    <div className={cn('w-full bg-zinc-900/80 rounded-full overflow-hidden border border-zinc-700/50', heightClass)}>
      <div
        className={cn(colorClass, heightClass, 'transition-all duration-1000 ease-out rounded-full')}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
