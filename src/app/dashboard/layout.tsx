import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import {
  DashboardNavLinks,
  DashboardNav,
  HamburgerButton,
  MesActualIndicator,
} from '@/components/dashboard/DashboardNav'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  async function cerrarSesion() {
    'use server'
    const supabaseAuth = await createClient()
    await supabaseAuth.auth.signOut()
    redirect('/login')
  }

  return (
    <DashboardNav logoutAction={cerrarSesion}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
        {/* Desktop Sidebar - visible desde 768px */}
        <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-72 md:flex-col bg-zinc-900 border-r border-zinc-800">
          <div className="h-16 px-6 flex items-center justify-between shrink-0">
            <div className="font-extrabold tracking-tight text-zinc-50">Duo Finance</div>
          </div>

          <nav className="flex-1 min-h-0 px-3 py-3 overflow-y-auto">
            <div className="space-y-1">
              <DashboardNavLinks />
            </div>
          </nav>

          <div className="shrink-0 px-3 pb-6">
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-emerald-400"
              >
                <LogOut size={18} />
                <span className="truncate">Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </aside>

        <header className="md:hidden sticky top-0 z-30 flex items-start gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
          <HamburgerButton />
          <Suspense
            fallback={
              <div className="flex flex-col gap-0.5 min-w-0 flex-1 animate-pulse">
                <div className="h-3 w-20 rounded bg-zinc-800" />
                <div className="h-10 w-full rounded-xl bg-zinc-800/80" />
              </div>
            }
          >
            <MesActualIndicator />
          </Suspense>
        </header>

        {/* Main content */}
        <main className="md:pl-72 pb-8">
          <DashboardShell>
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-6">{children}</div>
          </DashboardShell>
        </main>
      </div>
    </DashboardNav>
  )
}
