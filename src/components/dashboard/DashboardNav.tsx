'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeftRight, LayoutDashboard, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/dashboard/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { href: '/dashboard/espacio-compartido', label: 'Espacio Compartido', icon: Users },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
]

export function DashboardNavLinks() {
  const pathname = usePathname()

  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
              isActive
                ? 'bg-zinc-800 text-emerald-400'
                : 'text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400'
            )}
          >
            <Icon size={18} />
            <span className="truncate">{label}</span>
          </Link>
        )
      })}
    </>
  )
}

export function DashboardNavMobile({ cerrarSesion }: { cerrarSesion: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={label}
            href={href}
            aria-label={label}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl py-2 transition-colors',
              isActive ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-emerald-400'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold mt-1 leading-tight text-center">{label}</span>
          </Link>
        )
      })}
      {cerrarSesion}
    </div>
  )
}
