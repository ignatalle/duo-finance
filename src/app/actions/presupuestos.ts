'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MSG_NO_AUTH } from '@/lib/actionAuth'

export interface PresupuestoCategoria {
  id: string
  usuario_id: string
  pareja_id: string | null
  categoria: string
  limite_mensual: number
  mes_ref: string
  created_at: string
}

export async function obtenerPresupuestos(mesRef: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: MSG_NO_AUTH }

    const { data, error } = await supabase
      .from('presupuestos_categoria')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('mes_ref', mesRef)
      .order('categoria')

    if (error) {
      console.error('Error obteniendo presupuestos:', error)
      return { data: null, error: 'No se pudieron cargar los presupuestos' }
    }
    return { data: data as PresupuestoCategoria[] || [], error: null }
  } catch (e) {
    console.error('obtenerPresupuestos:', e)
    return { data: null, error: 'No se pudieron cargar los presupuestos' }
  }
}

export async function guardarPresupuesto(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: MSG_NO_AUTH }

  const { data: perfil } = await supabase.from('perfiles').select('pareja_id').eq('id', user.id).maybeSingle()

  const categoria = formData.get('categoria') as string
  const limiteMensual = parseFloat(formData.get('limite_mensual') as string) || 0
  const mesRef = formData.get('mes_ref') as string
  const id = formData.get('id') as string | null

  if (!categoria?.trim()) return { success: false, error: 'La categoría es obligatoria' }
  if (limiteMensual < 0) return { success: false, error: 'El límite no puede ser negativo' }
  if (!mesRef) return { success: false, error: 'Mes de referencia requerido' }

  const datos = {
    usuario_id: user.id,
    pareja_id: perfil?.pareja_id || null,
    categoria: categoria.trim(),
    limite_mensual: limiteMensual,
    mes_ref: mesRef,
  }

  if (id) {
    const { error } = await supabase
      .from('presupuestos_categoria')
      .update({ limite_mensual: datos.limite_mensual })
      .eq('id', id)
      .eq('usuario_id', user.id)

    if (error) {
      console.error('Error actualizando presupuesto:', error)
      return { success: false, error: 'No se pudo guardar el presupuesto' }
    }
  } else {
    const { data: existente } = await supabase
      .from('presupuestos_categoria')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('categoria', datos.categoria)
      .eq('mes_ref', datos.mes_ref)
      .maybeSingle()

    let error
    if (existente) {
      const res = await supabase
        .from('presupuestos_categoria')
        .update({ limite_mensual: datos.limite_mensual })
        .eq('id', existente.id)
        .eq('usuario_id', user.id)
      error = res.error
    } else {
      const res = await supabase.from('presupuestos_categoria').insert(datos)
      error = res.error
    }

    if (error) {
      console.error('Error guardando presupuesto:', error)
      return { success: false, error: 'No se pudo guardar el presupuesto' }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/gastos')
  return { success: true }
}

export async function eliminarPresupuesto(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: MSG_NO_AUTH }

  const { error } = await supabase
    .from('presupuestos_categoria')
    .delete()
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('Error eliminando presupuesto:', error)
    return { success: false, error: 'No se pudo eliminar' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/gastos')
  return { success: true }
}
