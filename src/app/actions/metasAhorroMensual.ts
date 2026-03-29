'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MSG_NO_AUTH } from '@/lib/actionAuth'

/** Obtiene la meta de ahorro guardada para un mes */
export async function obtenerMetaAhorroMensual(mesRef: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: 0, error: MSG_NO_AUTH }

    const { data, error } = await supabase
      .from('metas_ahorro_mensual')
      .select('monto')
      .eq('usuario_id', user.id)
      .eq('mes_ref', mesRef)
      .maybeSingle()

    if (error) {
      console.error('Error obteniendo meta ahorro:', error)
      return { data: 0, error: 'No se pudo cargar la meta de ahorro' }
    }
    return { data: Number(data?.monto ?? 0), error: null }
  } catch (e) {
    console.error('obtenerMetaAhorroMensual:', e)
    return { data: 0, error: 'No se pudo cargar la meta de ahorro' }
  }
}

/** Guarda la meta de ahorro para un mes (upsert) */
export async function guardarMetaAhorroMensual(mesRef: string, monto: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }
  if (monto < 0) return { success: false, error: 'El monto no puede ser negativo' }

  const montoNum = Number(monto)
  const payload = {
    usuario_id: user.id,
    mes_ref: mesRef,
    monto: montoNum,
    updated_at: new Date().toISOString(),
  }

  const { data: existente } = await supabase
    .from('metas_ahorro_mensual')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('mes_ref', mesRef)
    .maybeSingle()

  let error
  if (existente) {
    const res = await supabase
      .from('metas_ahorro_mensual')
      .update({ monto: montoNum, updated_at: payload.updated_at })
      .eq('usuario_id', user.id)
      .eq('mes_ref', mesRef)
    error = res.error
  } else {
    const res = await supabase
      .from('metas_ahorro_mensual')
      .insert(payload)
    error = res.error
  }

  if (error) {
    console.error('Error guardando meta ahorro:', error)
    return { success: false, error: 'No se pudo guardar la meta de ahorro' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/gastos')
  return { success: true }
}
