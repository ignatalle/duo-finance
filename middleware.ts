import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Evita 500 en edge runtime cuando faltan variables en Vercel.
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.next({ request })
    }

    // Si la URL está mal formada, degradar sin romper toda la app.
    try {
      new URL(supabaseUrl)
    } catch {
      return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            } catch {
              // No interrumpir el request por problemas de cookies en edge.
            }
          },
        },
      }
    )

    let user = null
    const {
      data: { user: resolvedUser },
    } = await supabase.auth.getUser()
    user = resolvedUser

    // Proteger la ruta /dashboard. Si no hay usuario, redirigir al login
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch {
    // Fallback final: jamás romper con 500 por middleware.
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
