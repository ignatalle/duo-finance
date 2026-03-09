import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  const message = searchParams.message

  const signIn = async (formData: FormData) => {
    'use server'
    const email = (formData.get('email') as string)?.trim() || ''
    const password = formData.get('password') as string
    if (!EMAIL_REGEX.test(email)) return redirect('/login?message=Email inválido')
    if (!password?.length) return redirect('/login?message=Ingresa tu contraseña')

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return redirect('/login?message=Credenciales incorrectas')
    return redirect('/dashboard')
  }

  const signUp = async (formData: FormData) => {
    'use server'
    const email = (formData.get('email') as string)?.trim() || ''
    const password = formData.get('password') as string
    if (!EMAIL_REGEX.test(email)) return redirect('/login?message=Email inválido')
    if (!password?.length) return redirect('/login?message=Ingresa tu contraseña')
    if (password.length < 6) return redirect('/login?message=La contraseña debe tener al menos 6 caracteres')

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return redirect('/login?message=Error al crear cuenta')
    return redirect('/dashboard')
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Duo Finance</h1>

        {message && (
          <div className="mb-4 rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {message}
          </div>
        )}
        
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-400" htmlFor="email">Email</label>
            <input 
              className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none" 
              name="email" 
              placeholder="tu@email.com" 
              required 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-400" htmlFor="password">Contraseña</label>
            <input 
              className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none" 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <div className="mt-4 flex flex-col gap-2">
            {/* El formAction decide qué función ejecutar en el servidor */}
            <Button formAction={signIn} className="bg-green-600 hover:bg-green-700 text-white">
              Iniciar Sesión
            </Button>
            <Button formAction={signUp} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Crear Cuenta
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
