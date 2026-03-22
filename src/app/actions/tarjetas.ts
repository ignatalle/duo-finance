'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Tarjeta {
  id: string
  usuario_id: string
  pareja_id: string | null
  nombre: string
  cierre_dia: number
  vencimiento_dia: number
  created_at: string
}

export async function obtenerTarjetas() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', data: null }

  const { data, error } = await supabase
    .from('tarjetas')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error obteniendo tarjetas:', error)
    return { error: error.message, data: null }
  }
  return { data: data as Tarjeta[] || [], error: null }
}

export async function crearTarjeta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: perfil } = await supabase.from('perfiles').select('pareja_id').eq('id', user.id).single()

  const nombre = formData.get('nombre') as string
  const cierreDia = parseInt(formData.get('cierre_dia') as string) || 15
  const vencimientoDia = parseInt(formData.get('vencimiento_dia') as string) || 20

  if (!nombre?.trim()) return { success: false, error: 'El nombre es obligatorio' }
  if (cierreDia < 1 || cierreDia > 28) return { success: false, error: 'Día de cierre debe ser 1-28' }
  if (vencimientoDia < 1 || vencimientoDia > 28) return { success: false, error: 'Día de vencimiento debe ser 1-28' }

  const { error } = await supabase
    .from('tarjetas')
    .insert({
      usuario_id: user.id,
      pareja_id: perfil?.pareja_id || null,
      nombre: nombre.trim(),
      cierre_dia: cierreDia,
      vencimiento_dia: vencimientoDia,
    })

  if (error) {
    console.error('Error creando tarjeta:', error)
    return { success: false, error: 'No se pudo crear la tarjeta' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/tarjetas')
  return { success: true }
}

export async function editarTarjeta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const cierreDia = parseInt(formData.get('cierre_dia') as string) || 15
  const vencimientoDia = parseInt(formData.get('vencimiento_dia') as string) || 20

  if (!id || !nombre?.trim()) return { success: false, error: 'Datos inválidos' }

  const { error } = await supabase
    .from('tarjetas')
    .update({
      nombre: nombre.trim(),
      cierre_dia: cierreDia,
      vencimiento_dia: vencimientoDia,
    })
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Error editando tarjeta:', error)
    return { success: false, error: 'No se pudo actualizar' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/tarjetas')
  return { success: true }
}

export async function eliminarTarjeta(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('tarjetas')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Error eliminando tarjeta:', error)
    return { success: false, error: 'No se pudo eliminar' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/tarjetas')
  return { success: true }
}
