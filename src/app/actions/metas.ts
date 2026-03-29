'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MSG_NO_AUTH } from '@/lib/actionAuth'

export interface Meta {
  id: string
  usuario_id: string
  nombre: string
  objetivo: number
  actual: number
  fecha_objetivo: string | null
  icono: string
  created_at: string
}

export async function obtenerMetas() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: MSG_NO_AUTH }

    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('usuario_id', user.id)
      .order('fecha_objetivo', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Error obteniendo metas:', error)
      return { data: null, error: 'No se pudieron cargar las metas' }
    }
    return { data: data as Meta[] || [], error: null }
  } catch (e) {
    console.error('obtenerMetas:', e)
    return { data: null, error: 'No se pudieron cargar las metas' }
  }
}

export async function crearMeta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: MSG_NO_AUTH }

  const nombre = formData.get('nombre') as string
  const objetivo = parseFloat(formData.get('objetivo') as string) || 0
  const fechaObjetivo = (formData.get('fecha_objetivo') as string) || null
  const icono = (formData.get('icono') as string) || '🏦'

  if (!nombre?.trim()) return { success: false, error: 'El nombre es obligatorio' }
  if (objetivo <= 0) return { success: false, error: 'El objetivo debe ser mayor a 0' }

  const { error } = await supabase
    .from('metas')
    .insert({
      usuario_id: user.id,
      nombre: nombre.trim(),
      objetivo,
      actual: 0,
      fecha_objetivo: fechaObjetivo || null,
      icono,
    })

  if (error) {
    console.error('Error creando meta:', error)
    return { success: false, error: 'No se pudo crear la meta' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function actualizarMeta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: MSG_NO_AUTH }

  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const objetivo = parseFloat(formData.get('objetivo') as string) || 0
  const fechaObjetivo = (formData.get('fecha_objetivo') as string) || null
  const icono = (formData.get('icono') as string) || '🏦'

  if (!id || !nombre?.trim()) return { success: false, error: 'Datos inválidos' }

  const { error } = await supabase
    .from('metas')
    .update({
      nombre: nombre.trim(),
      objetivo,
      fecha_objetivo: fechaObjetivo || null,
      icono,
    })
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Error actualizando meta:', error)
    return { success: false, error: 'No se pudo actualizar' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function depositarMeta(id: string, monto: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: MSG_NO_AUTH }
  if (monto <= 0) return { success: false, error: 'El monto debe ser positivo' }

  const { data: meta } = await supabase
    .from('metas')
    .select('actual')
    .eq('id', id)
    .eq('usuario_id', user.id)
    .single()

  if (!meta) return { success: false, error: 'Meta no encontrada' }

  const nuevoActual = (meta.actual || 0) + monto

  const { error } = await supabase
    .from('metas')
    .update({ actual: nuevoActual })
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Error depositando en meta:', error)
    return { success: false, error: 'No se pudo registrar el depósito' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function eliminarMeta(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: MSG_NO_AUTH }

  const { error } = await supabase
    .from('metas')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Error eliminando meta:', error)
    return { success: false, error: 'No se pudo eliminar' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
