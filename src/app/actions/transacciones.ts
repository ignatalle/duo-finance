'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarTransaccion(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  // NUEVO: Buscamos tu perfil para saber a qué pareja perteneces
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('pareja_id')
    .eq('id', user.id)
    .single()

  const monto = parseFloat(formData.get('monto') as string)
  const tipo = formData.get('tipo') as string
  const categoria = formData.get('categoria') as string
  const descripcion = formData.get('descripcion') as string
  const es_compartido = formData.get('es_compartido') === 'on'

  const { error } = await supabase
    .from('transacciones')
    .insert({
      usuario_id: user.id,
      pareja_id: perfil?.pareja_id || null, // Lo guardamos asociado a la pareja
      monto,
      tipo,
      categoria,
      descripcion,
      es_compartido,
      pagado_por: user.id
    })

  if (error) {
    console.error('Error insertando transacción:', error)
    return { error: 'No se pudo registrar la transacción' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function eliminarTransaccion(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  // Intentamos borrar. RLS asegurará que solo puedas borrar si tienes permiso.
  const { error } = await supabase
    .from('transacciones')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error eliminando transacción:', error)
    return { error: 'No se pudo eliminar la transacción' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
