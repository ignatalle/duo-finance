import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { DashboardNavLinks, DashboardNavMobile } from '@/components/dashboard/DashboardNav'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  async function cerrarSesion() {
    'use server'
    const supabaseAuth = await createClient()
    await supabaseAuth.auth.signOut()
    redirect('/login')
  }

  const cerrarSesionBtn = (
    <form action={cerrarSesion} className="contents">
      <button
        type="submit"
        aria-label="Cerrar Sesión"
        className="flex flex-col items-center justify-center rounded-xl py-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-emerald-400"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-bold mt-1 leading-tight text-center">Cerrar Sesión</span>
      </button>
    </form>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 bg-zinc-900 border-r border-zinc-800">
        <div className="h-full flex flex-col">
          <div className="h-16 px-6 flex items-center justify-between">
            <div className="font-extrabold tracking-tight text-zinc-50">Duo Finance</div>
          </div>

          <nav className="px-3 pb-3 overflow-y-auto">
            <div className="space-y-1">
              <DashboardNavLinks />
            </div>
          </nav>

          <div className="mt-auto px-3 pb-6">
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
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-72 pb-24 lg:pb-8">
        <DashboardShell>
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </DashboardShell>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-zinc-900/90 backdrop-blur border-t border-zinc-800">
        <div className="px-2 py-2">
          <DashboardNavMobile cerrarSesion={cerrarSesionBtn} />
        </div>
      </nav>
    </div>
  )
}

