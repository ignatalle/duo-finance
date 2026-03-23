'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function crearPareja(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Obtenemos tu usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const nombrePareja = formData.get('nombre') as string // Ej: "Igna y Cami"

  // 2. Creamos la Pareja en la base de datos
  const { data: nuevaPareja, error: errorPareja } = await supabase
    .from('parejas')
    .insert({ nombre: nombrePareja })
    .select()
    .single()

  if (errorPareja || !nuevaPareja) {
    console.error('Error creando pareja:', errorPareja)
    return { error: 'No se pudo crear el espacio de pareja' }
  }

  // 3. Actualizamos TU perfil para vincularte a esa nueva pareja
  const { error: errorPerfil } = await supabase
    .from('perfiles')
    .update({ pareja_id: nuevaPareja.id })
    .eq('id', user.id)

  if (errorPerfil) {
    console.error('Error vinculando perfil:', errorPerfil)
    return { error: 'Pareja creada, pero no se pudo vincular tu perfil' }
  }

  revalidatePath('/dashboard')
  return { success: true, parejaId: nuevaPareja.id }
}

export async function unirsePareja(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parejaId = formData.get('pareja_id') as string

  // 1. Verificamos si el código de la pareja realmente existe
  const { data: parejaExiste } = await supabase
    .from('parejas')
    .select('id')
    .eq('id', parejaId)
    .single()

  if (!parejaExiste) {
    return { error: 'El código de pareja no es válido' }
  }

  // 2. Si existe, actualizamos el perfil para vincularlo
  const { error: errorPerfil } = await supabase
    .from('perfiles')
    .update({ pareja_id: parejaId })
    .eq('id', user.id)

  if (errorPerfil) {
    console.error('Error vinculando perfil:', errorPerfil)
    return { error: 'No se pudo vincular tu perfil' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/** Genera un código de 6 caracteres y crea la pareja vinculada al usuario */
export async function generarCodigoVinculacion(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const codigo = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

  const { data: nuevaPareja, error: errorPareja } = await supabase
    .from('parejas')
    .insert({ nombre: 'Pareja', codigo })
    .select()
    .single()

  if (errorPareja || !nuevaPareja) {
    console.error('Error creando pareja:', errorPareja)
    const msg = errorPareja?.message?.includes('policy') || errorPareja?.code === '42501'
      ? 'Permisos insuficientes. Ejecutá la migración 20260323100000_parejas_rls_policies.sql en Supabase.'
      : 'No se pudo generar el código'
    throw new Error(msg)
  }

  const { error: errorPerfil } = await supabase
    .from('perfiles')
    .update({ pareja_id: nuevaPareja.id })
    .eq('id', user.id)

  if (errorPerfil) {
    console.error('Error vinculando perfil:', errorPerfil)
    throw new Error('No se pudo vincular tu perfil')
  }

  revalidatePath('/dashboard')
  return codigo
}

/** Vincula al usuario a una pareja usando el código de 6 caracteres */
export async function vincularPareja(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const codigo = (formData.get('codigo') as string)?.trim().toUpperCase()

  const { data: pareja } = await supabase
    .from('parejas')
    .select('id')
    .eq('codigo', codigo)
    .single()

  if (!pareja) {
    return { error: 'El código no es válido' }
  }

  const { error: errorPerfil } = await supabase
    .from('perfiles')
    .update({ pareja_id: pareja.id })
    .eq('id', user.id)

  if (errorPerfil) {
    console.error('Error vinculando perfil:', errorPerfil)
    return { error: 'No se pudo vincular tu perfil' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/** Desvincula la cuenta del usuario de la pareja actual */
export async function desvincularPareja() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('perfiles')
    .update({ pareja_id: null })
    .eq('id', user.id)

  if (error) {
    console.error('Error desvinculando:', error)
    return { error: 'No se pudo desvincular' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
