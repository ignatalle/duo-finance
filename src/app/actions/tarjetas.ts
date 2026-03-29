'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MSG_NO_AUTH } from '@/lib/actionAuth'

export interface Tarjeta {
  id: string
  usuario_id: string
  pareja_id: string | null
  nombre: string
  cierre_dia: number
  vencimiento_dia: number
  banco?: string | null
  ultimos_digitos?: number | null
  estilo?: string | null
  created_at: string
}

export async function obtenerTarjetas() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: MSG_NO_AUTH }

    const { data, error } = await supabase
      .from('tarjetas')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo tarjetas:', error)
      return { data: null, error: 'No se pudieron cargar las tarjetas' }
    }
    return { data: data as Tarjeta[] || [], error: null }
  } catch (e) {
    console.error('obtenerTarjetas:', e)
    return { data: null, error: 'No se pudieron cargar las tarjetas' }
  }
}

export async function crearTarjeta(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: perfil } = await supabase.from('perfiles').select('pareja_id').eq('id', user.id).single()

  const nombre = formData.get('nombre') as string
  const cierreDia = parseInt(formData.get('cierre_dia') as string) || 15
  const vencimientoDia = parseInt(formData.get('vencimiento_dia') as string) || 20
  const banco = (formData.get('banco') as string)?.trim() || null
  const ultimosDigitos = formData.get('ultimos_digitos') ? parseInt(formData.get('ultimos_digitos') as string) : null
  const estilo = (formData.get('estilo') as string) || 'orange'

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
      banco: banco,
      ultimos_digitos: ultimosDigitos && ultimosDigitos >= 0 && ultimosDigitos <= 9999 ? ultimosDigitos : null,
      estilo: ['orange', 'dark', 'blue'].includes(estilo) ? estilo : 'orange',
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
  if (!user) return { success: false, error: MSG_NO_AUTH }

  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const cierreDia = parseInt(formData.get('cierre_dia') as string) || 15
  const vencimientoDia = parseInt(formData.get('vencimiento_dia') as string) || 20
  const banco = (formData.get('banco') as string)?.trim() || null
  const ultimosDigitos = formData.get('ultimos_digitos') ? parseInt(formData.get('ultimos_digitos') as string) : null
  const estilo = (formData.get('estilo') as string) || 'orange'

  if (!id || !nombre?.trim()) return { success: false, error: 'Datos inválidos' }

  const { error } = await supabase
    .from('tarjetas')
    .update({
      nombre: nombre.trim(),
      cierre_dia: cierreDia,
      vencimiento_dia: vencimientoDia,
      banco: banco,
      ultimos_digitos: ultimosDigitos && ultimosDigitos >= 0 && ultimosDigitos <= 9999 ? ultimosDigitos : null,
      estilo: ['orange', 'dark', 'blue'].includes(estilo) ? estilo : 'orange',
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
  if (!user) return { success: false, error: MSG_NO_AUTH }

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
