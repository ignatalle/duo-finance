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
