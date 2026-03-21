'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarTransaccion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data: perfil } = await supabase.from('perfiles').select('pareja_id').eq('id', user.id).single()

  const tipo = formData.get('tipo') as string
  const moneda = formData.get('moneda') as string
  let montoOriginal = parseFloat(formData.get('monto_original') as string)
  let descripcionFinal = (formData.get('descripcion') as string) || ''

  // Validaciones básicas
  if (Number.isNaN(montoOriginal) || montoOriginal <= 0) {
    return { success: false, error: 'Monto inválido' }
  }
  if (!['ingreso', 'gasto'].includes(tipo)) {
    return { success: false, error: 'Tipo de transacción inválido' }
  }

  // LA MAGIA DEL DÓLAR BLUE
  let montoFinal = montoOriginal
  if (moneda === 'USD') {
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/blue', { next: { revalidate: 60 } })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      const valorBlue = Number(data?.venta)
      if (!Number.isFinite(valorBlue) || valorBlue <= 0) throw new Error('Cotización inválida')

      montoFinal = montoOriginal * valorBlue
      descripcionFinal = `${descripcionFinal} (US$ ${montoOriginal} a $${valorBlue} Blue)`.trim()
    } catch (error) {
      console.error('Error obteniendo Dólar Blue:', error)
      montoFinal = montoOriginal * 1050
      descripcionFinal = `${descripcionFinal} (US$ ${montoOriginal} - Conversión aprox)`.trim()
    }
  }

  const cuota_actual = formData.get('cuota_actual') ? parseInt(formData.get('cuota_actual') as string) : null
  const cuota_total = formData.get('cuota_total') ? parseInt(formData.get('cuota_total') as string) : null
  const estadoInicial = (formData.get('estado') as string) || 'pagado'

  const datosBase = {
    usuario_id: user.id,
    pareja_id: perfil?.pareja_id || null,
    monto: montoFinal, // Acá guardamos los pesos ya convertidos
    tipo: tipo,
    categoria: formData.get('categoria') as string,
    descripcion: descripcionFinal, // Acá va con la aclaración del dólar
    es_compartido: formData.get('es_compartido') === 'on',
    pagado_por: user.id,
    tipo_gasto: tipo === 'gasto' ? (formData.get('tipo_gasto') as string) : null,
  }

  // LA MAGIA: Si es una cuota, generamos todas las filas hacia el futuro
  if (tipo === 'gasto' && cuota_actual && cuota_total && cuota_actual <= cuota_total) {
    const transaccionesMultiples = []
    let cuotaIteracion = cuota_actual
    let mesesAdelante = 0

    while (cuotaIteracion <= cuota_total) {
      const hoy = new Date()
      // Fijamos el día a mitad de mes para evitar bugs al saltar de meses con 31 a meses de 28/30 días
      const fechaGasto = new Date(hoy.getFullYear(), hoy.getMonth() + mesesAdelante, 15)

      transaccionesMultiples.push({
        ...datosBase,
        cuota_actual: cuotaIteracion,
        cuota_total: cuota_total,
        // La de este mes respeta tu formulario. Las del futuro nacen pendientes.
        estado: mesesAdelante === 0 ? estadoInicial : 'pendiente',
        created_at: fechaGasto.toISOString()
      })

      cuotaIteracion++
      mesesAdelante++
    }

    const { error } = await supabase.from('transacciones').insert(transaccionesMultiples)
    if (error) {
      console.error('Error insertando cuotas:', error)
      revalidatePath('/dashboard')
      return { success: false, error: 'No se pudieron guardar las cuotas' }
    }
  } else {
    const datosNormales = { ...datosBase, estado: estadoInicial, cuota_actual: null, cuota_total: null }
    const { error } = await supabase.from('transacciones').insert(datosNormales)
    if (error) {
      console.error('Error insertando transacción:', error)
      revalidatePath('/dashboard')
      return { success: false, error: 'No se pudo guardar la transacción' }
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function eliminarTransaccion(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')
  // Solo borramos si la transacción es del usuario (RLS puede reforzar)
  const { error } = await supabase.from('transacciones').delete().eq('id', id).eq('usuario_id', user.id)
  if (error) {
    console.error('Error eliminando transacción:', error)
    return { error: 'No se pudo eliminar' }
  }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function editarTransaccion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const id = formData.get('id') as string
  const tipo = (formData.get('tipo') as string) || 'gasto'

  const datos = {
    monto: parseFloat(formData.get('monto') as string),
    categoria: formData.get('categoria') as string,
    descripcion: (formData.get('descripcion') as string) || '',
    estado: (formData.get('estado') as string) || 'pagado',
    tipo_gasto: tipo === 'gasto' ? (formData.get('tipo_gasto') as string) || null : null,
  }

  const { error } = await supabase.from('transacciones').update(datos).eq('id', id).eq('usuario_id', user.id)
  if (error) {
    console.error('Error editando transacción:', error)
    return { error: 'No se pudo editar' }
  }
  revalidatePath('/dashboard')
  return { success: true }
}

// Obtener datos para exportar a Excel/CSV
export async function obtenerDatosExportacion(rango: 'mes' | 'anio', mesRef: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const [year, month] = mesRef.split('-')
  let inicio, fin

  if (rango === 'mes') {
    inicio = new Date(Number(year), Number(month) - 1, 1).toISOString()
    fin = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()
  } else {
    inicio = new Date(Number(year), 0, 1).toISOString()
    fin = new Date(Number(year), 11, 31, 23, 59, 59).toISOString()
  }

  const { data } = await supabase
    .from('transacciones')
    .select('*')
    .gte('created_at', inicio)
    .lte('created_at', fin)
    .order('created_at', { ascending: true })

  return { data }
}

export async function marcarComoPagado(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase.from('transacciones').update({ estado: 'pagado' }).eq('id', id).eq('usuario_id', user.id)
  if (error) {
    console.error('Error marcando como pagado:', error)
    return { error: 'No se pudo actualizar' }
  }
  revalidatePath('/dashboard')
  return { success: true }
}
