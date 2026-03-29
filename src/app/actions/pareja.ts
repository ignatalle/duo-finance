'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MSG_NO_AUTH } from '@/lib/actionAuth'

export async function crearPareja(formData: FormData) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: MSG_NO_AUTH }

    const nombrePareja = formData.get('nombre') as string

    const { data: nuevaPareja, error: errorPareja } = await supabase
      .from('parejas')
      .insert({ nombre: nombrePareja })
      .select()
      .single()

    if (errorPareja || !nuevaPareja) {
      console.error('Error creando pareja:', errorPareja)
      return { success: false as const, error: 'No se pudo crear el espacio de pareja' }
    }

    const { error: errorPerfil } = await supabase
      .from('perfiles')
      .update({ pareja_id: nuevaPareja.id })
      .eq('id', user.id)

    if (errorPerfil) {
      console.error('Error vinculando perfil:', errorPerfil)
      return { success: false as const, error: 'Pareja creada, pero no se pudo vincular tu perfil' }
    }

    revalidatePath('/dashboard')
    return { success: true as const, parejaId: nuevaPareja.id }
  } catch (e) {
    console.error('crearPareja:', e)
    return { success: false as const, error: 'No se pudo crear el espacio de pareja' }
  }
}

export async function unirsePareja(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: MSG_NO_AUTH }

    const parejaId = formData.get('pareja_id') as string

    const { data: parejaExiste } = await supabase
      .from('parejas')
      .select('id')
      .eq('id', parejaId)
      .single()

    if (!parejaExiste) {
      return { success: false as const, error: 'El código de pareja no es válido' }
    }

    const { error: errorPerfil } = await supabase
      .from('perfiles')
      .update({ pareja_id: parejaId })
      .eq('id', user.id)

    if (errorPerfil) {
      console.error('Error vinculando perfil:', errorPerfil)
      return { success: false as const, error: 'No se pudo vincular tu perfil' }
    }

    revalidatePath('/dashboard')
    return { success: true as const }
  } catch (e) {
    console.error('unirsePareja:', e)
    return { success: false as const, error: 'No se pudo vincular tu perfil' }
  }
}

/** Genera un código de 6 caracteres y crea la pareja vinculada al usuario */
export async function generarCodigoVinculacion(): Promise<
  { success: true; codigo: string } | { success: false; error: string }
> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: MSG_NO_AUTH }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const codigo = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

    const { data: nuevaPareja, error: errorPareja } = await supabase
      .from('parejas')
      .insert({ nombre: 'Pareja', codigo })
      .select()
      .single()

    if (errorPareja || !nuevaPareja) {
      console.error('Error creando pareja:', errorPareja)
      return { success: false, error: 'No se pudo generar el código' }
    }

    const { error: errorPerfil } = await supabase
      .from('perfiles')
      .update({ pareja_id: nuevaPareja.id })
      .eq('id', user.id)

    if (errorPerfil) {
      console.error('Error vinculando perfil:', errorPerfil)
      return { success: false, error: 'No se pudo vincular tu perfil' }
    }

    revalidatePath('/dashboard')
    return { success: true, codigo }
  } catch (e) {
    console.error('generarCodigoVinculacion:', e)
    return { success: false, error: 'No se pudo generar el código' }
  }
}

/** Vincula al usuario a una pareja usando el código de 6 caracteres */
export async function vincularPareja(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: MSG_NO_AUTH }

    const codigo = (formData.get('codigo') as string)?.trim().toUpperCase()

    const { data: pareja } = await supabase
      .from('parejas')
      .select('id')
      .eq('codigo', codigo)
      .single()

    if (!pareja) {
      return { success: false as const, error: 'El código no es válido' }
    }

    const { error: errorPerfil } = await supabase
      .from('perfiles')
      .update({ pareja_id: pareja.id })
      .eq('id', user.id)

    if (errorPerfil) {
      console.error('Error vinculando perfil:', errorPerfil)
      return { success: false as const, error: 'No se pudo vincular tu perfil' }
    }

    revalidatePath('/dashboard')
    return { success: true as const }
  } catch (e) {
    console.error('vincularPareja:', e)
    return { success: false as const, error: 'No se pudo vincular tu perfil' }
  }
}

/** Desvincula la cuenta del usuario de la pareja actual */
export async function desvincularPareja() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false as const, error: MSG_NO_AUTH }

    const { error } = await supabase
      .from('perfiles')
      .update({ pareja_id: null })
      .eq('id', user.id)

    if (error) {
      console.error('Error desvinculando:', error)
      return { success: false as const, error: 'No se pudo desvincular' }
    }

    revalidatePath('/dashboard')
    return { success: true as const }
  } catch (e) {
    console.error('desvincularPareja:', e)
    return { success: false as const, error: 'No se pudo desvincular' }
  }
}
