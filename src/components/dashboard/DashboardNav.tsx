'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  TrendingUp,
  Users,
  Download,
  Settings,
  Receipt,
  Landmark,
  LogOut,
  Menu,
  X,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard Central', icon: LayoutDashboard },
  { href: '/dashboard/movimientos', label: 'Movimientos', icon: Receipt },
  { href: '/dashboard/gastos', label: 'Gastos y Presupuestos', icon: Wallet },
  { href: '/dashboard/tarjetas', label: 'Tarjetas y Cuotas', icon: CreditCard },
  { href: '/dashboard/planificacion', label: 'Planificar Mes', icon: TrendingUp },
  { href: '/dashboard/espacio-compartido', label: 'Finanzas en Pareja', icon: Users },
  { href: '/dashboard/reportes', label: 'Reportes y PDF', icon: Download },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
]

type DashboardNavContextValue = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  close: () => void
}

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null)

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

export function SidebarContent({
  onClose,
  logoutAction,
}: {
  onClose: () => void
  logoutAction: () => Promise<void>
}) {
  const pathname = usePathname()

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Landmark className="text-emerald-400 shrink-0" size={24} aria-hidden />
          <span className="font-extrabold tracking-tight text-zinc-50 truncate">Duo Finance</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors shrink-0"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 min-h-0 px-3 py-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
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
        </div>
      </nav>

      <div className="shrink-0 px-3 pb-6 pt-2 border-t border-zinc-800">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-emerald-400"
          >
            <LogOut size={18} />
            <span className="truncate">Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </>
  )
}

export function HamburgerButton() {
  const ctx = useContext(DashboardNavContext)
  if (!ctx) {
    throw new Error('HamburgerButton debe usarse dentro de DashboardNav')
  }
  return (
    <button
      type="button"
      onClick={() => ctx.setIsOpen(true)}
      aria-label="Abrir menú de navegación"
      className="p-2 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400 transition-colors shrink-0"
    >
      <Menu size={22} />
    </button>
  )
}

/** Selector de mes para la barra superior móvil; requiere `<Suspense>` en el padre (useSearchParams). */
export function MesActualIndicator() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mesActual = searchParams.get('mes') || new Date().toISOString().slice(0, 7)

  const handleMesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoMes = e.target.value
    router.push(`${pathname}?mes=${nuevoMes}`)
  }

  return (
    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Mes actual</span>
      <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 min-w-0">
        <CalendarDays size={18} className="text-zinc-400 shrink-0" aria-hidden />
        <input
          type="month"
          value={mesActual}
          onChange={handleMesChange}
          className="min-w-0 flex-1 bg-transparent text-white font-semibold text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
        />
      </div>
    </div>
  )
}

export function DashboardNav({
  children,
  logoutAction,
}: {
  children: ReactNode
  logoutAction: () => Promise<void>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])

  const contextValue: DashboardNavContextValue = {
    isOpen,
    setIsOpen,
    close,
  }

  return (
    <DashboardNavContext.Provider value={contextValue}>
      {children}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden transition-[visibility] duration-300',
          isOpen ? 'visible' : 'invisible pointer-events-none'
        )}
        aria-hidden={!isOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/60 transition-opacity duration-300 ease-out',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={close}
          aria-hidden
        />
        <aside
          className={cn(
            'absolute left-0 top-0 bottom-0 flex w-72 max-w-[85vw] flex-col bg-zinc-900 border-r border-zinc-800 shadow-xl transition-transform duration-300 ease-out',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-label="Menú lateral"
          aria-modal="true"
          role="dialog"
        >
          <SidebarContent onClose={close} logoutAction={logoutAction} />
        </aside>
      </div>
    </DashboardNavContext.Provider>
  )
}
