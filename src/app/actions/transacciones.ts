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
  if (!descripcionFinal.trim()) {
    return { success: false, error: 'El concepto no puede estar vacío' }
  }

  // LA MAGIA DEL DÓLAR BLUE (SIN HARDCODEO)
  let montoFinal = montoOriginal
  if (moneda === 'USD') {
    try {
      const res = await fetch('https://dolarapi.com/v1/dolares/blue', { next: { revalidate: 60 } })
      if (!res.ok) throw new Error(`API Dólar respondió con status ${res.status}`)
      const data = await res.json()
      const valorBlue = Number(data?.venta)
      
      if (!Number.isFinite(valorBlue) || valorBlue <= 0) throw new Error('Cotización devuelta es inválida')

      montoFinal = montoOriginal * valorBlue
      descripcionFinal = `${descripcionFinal} (US$ ${montoOriginal} a $${valorBlue} Blue)`.trim()
    } catch (error) {
      console.error('Error obteniendo Dólar Blue:', error)
      // 🔥 FIX: Frenamos la operación. No guardamos datos falsos.
      return { success: false, error: 'Error al obtener cotización del Dólar. Intenta nuevamente.' }
    }
  }

  const cuota_actual = formData.get('cuota_actual') ? parseInt(formData.get('cuota_actual') as string) : null
  const cuota_total = formData.get('cuota_total') ? parseInt(formData.get('cuota_total') as string) : null
  const estadoInicial = (formData.get('estado') as string) || 'pagado'
  const vencimientoEn = formData.get('vencimiento_en') ? (formData.get('vencimiento_en') as string) : null
  const tarjetaId = formData.get('tarjeta_id') ? (formData.get('tarjeta_id') as string) : null

  const fechaStr = formData.get('fecha') as string | null
  const created_at = fechaStr ? new Date(fechaStr + 'T12:00:00').toISOString() : undefined

  const esPrestamo = formData.get('es_prestamo') === 'on'

  const datosBase = {
    usuario_id: user.id,
    pareja_id: perfil?.pareja_id || null,
    monto: montoFinal,
    tipo: tipo,
    categoria: formData.get('categoria') as string,
    descripcion: descripcionFinal,
    es_compartido: formData.get('es_compartido') === 'on',
    pagado_por: user.id,
    tipo_gasto: tipo === 'gasto' ? (formData.get('tipo_gasto') as string) : null,
    vencimiento_en: vencimientoEn || null,
    tarjeta_id: tarjetaId || null,
    es_prestamo: esPrestamo,
    ...(created_at && { created_at }),
  }

  // LOGICA DE CUOTAS ARREGLADA
  if (tipo === 'gasto' && cuota_actual && cuota_total && cuota_actual <= cuota_total) {
    const transaccionesMultiples = []
    let cuotaIteracion = cuota_actual
    let mesesAdelante = 0

    const fechaBase = fechaStr ? new Date(fechaStr + 'T12:00:00') : new Date()
    const diaCompra = Math.min(fechaBase.getDate(), 28) 

    while (cuotaIteracion <= cuota_total) {
      const fechaGasto = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + mesesAdelante, diaCompra)

      transaccionesMultiples.push({
        ...datosBase,
        cuota_actual: cuotaIteracion,
        cuota_total: cuota_total,
        estado: mesesAdelante === 0 ? estadoInicial : 'pendiente',
        created_at: fechaGasto.toISOString()
      })

      cuotaIteracion++
      mesesAdelante++
    }

    const { error } = await supabase.from('transacciones').insert(transaccionesMultiples)
    if (error) {
      console.error('Error insertando cuotas:', error)
      return { success: false, error: 'No se pudieron guardar las cuotas en la base de datos' }
    }
  } else {
    const datosNormales = { ...datosBase, estado: estadoInicial, cuota_actual: null, cuota_total: null }
    const { error } = await supabase.from('transacciones').insert(datosNormales)
    if (error) {
      console.error('Error insertando transacción:', error)
      return { success: false, error: 'No se pudo guardar el movimiento' }
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function eliminarTransaccion(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')
  const { error } = await supabase.from('transacciones').delete().eq('id', id).eq('usuario_id', user.id)
  if (error) {
    console.error('Error eliminando transacción:', error)
    return { error: 'No se pudo eliminar' }
  }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/movimientos')
  return { success: true }
}

export async function editarTransaccion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const id = formData.get('id') as string
  if (!id?.trim()) {
    return { error: 'ID inválido' }
  }

  const { data: original, error: errOriginal } = await supabase
    .from('transacciones')
    .select('id, tipo, descripcion, cuota_total, cuota_actual')
    .eq('id', id)
    .eq('usuario_id', user.id)
    .single()

  if (errOriginal || !original) {
    console.error('editarTransaccion: fila no encontrada', errOriginal)
    return { error: 'Movimiento no encontrado' }
  }

  const tipo = (formData.get('tipo') as string) || original.tipo
  const monto = parseFloat(formData.get('monto') as string)
  const fechaStr = formData.get('fecha') as string | null

  if (Number.isNaN(monto) || monto <= 0) {
    return { error: 'Monto inválido' }
  }
  if (!['ingreso', 'gasto'].includes(tipo)) {
    return { error: 'Tipo de transacción inválido' }
  }

  const categoria = formData.get('categoria') as string
  const descripcionNueva = (formData.get('descripcion') as string) || ''
  const estadoNuevo = (formData.get('estado') as string) || 'pagado'
  const tipoGasto = tipo === 'gasto' ? (formData.get('tipo_gasto') as string) || null : null
  const esCompartido = formData.get('es_compartido') === 'on'

  /** Tarjeta y cuotas tal como vienen del FormData (solo gastos) */
  let tarjetaId: string | null = null
  let cuotaTotalEditada: number | null = null
  let cuotaActualFila: number | null = null

  if (tipo === 'gasto') {
    const tarjetaRaw = formData.get('tarjeta_id') as string | null
    if (tarjetaRaw && tarjetaRaw.trim() !== '') {
      tarjetaId = tarjetaRaw.trim()
      const cuotaTotalRaw = formData.get('cuota_total') as string | null
      const nTotal = cuotaTotalRaw != null && cuotaTotalRaw !== '' ? parseInt(cuotaTotalRaw, 10) : NaN
      if (Number.isFinite(nTotal) && nTotal > 1) {
        cuotaTotalEditada = nTotal
        const cuotaActRaw = formData.get('cuota_actual') as string | null
        const nAct = cuotaActRaw != null && cuotaActRaw !== '' ? parseInt(cuotaActRaw, 10) : NaN
        cuotaActualFila = Number.isFinite(nAct) && nAct >= 1 ? nAct : 1
      }
    }
  }

  const originalTeniaPlan =
    original.tipo === 'gasto' &&
    original.cuota_total != null &&
    original.cuota_total > 1
  const editadaTienePlan = cuotaTotalEditada != null && cuotaTotalEditada > 1

  const datosCompartidos: Record<string, unknown> = {
    monto,
    categoria,
    descripcion: descripcionNueva,
    es_compartido: esCompartido,
    tipo_gasto: tipoGasto,
  }

  if (tipo === 'gasto') {
    datosCompartidos.tarjeta_id = tarjetaId
    if (editadaTienePlan) {
      datosCompartidos.cuota_total = cuotaTotalEditada
    } else {
      datosCompartidos.cuota_total = null
      datosCompartidos.cuota_actual = null
    }
  } else {
    datosCompartidos.tarjeta_id = null
    datosCompartidos.cuota_total = null
    datosCompartidos.cuota_actual = null
  }

  const datosSoloEstaFila: Record<string, unknown> = {
    estado: estadoNuevo,
  }
  if (tipo === 'gasto' && editadaTienePlan && cuotaActualFila != null) {
    datosSoloEstaFila.cuota_actual = cuotaActualFila
  }
  if (fechaStr) {
    datosSoloEstaFila.created_at = new Date(fechaStr + 'T12:00:00').toISOString()
  }

  let idsGrupo: string[] = [id]

  if (tipo === 'gasto' && originalTeniaPlan) {
    const ctOrig = original.cuota_total as number
    const descClave = original.descripcion ?? ''
    const { data: hermanas, error: errHermanas } = await supabase
      .from('transacciones')
      .select('id, descripcion')
      .eq('usuario_id', user.id)
      .eq('tipo', 'gasto')
      .eq('cuota_total', ctOrig)

    if (errHermanas) {
      console.error('Error buscando cuotas hermanas:', errHermanas)
      return { error: 'No se pudieron buscar las cuotas relacionadas' }
    }

    idsGrupo = (hermanas || [])
      .filter((row) => (row.descripcion ?? '') === descClave)
      .map((row) => row.id)

    if (idsGrupo.length === 0) idsGrupo = [id]
  }

  const { error: errorBulk } = await supabase
    .from('transacciones')
    .update(datosCompartidos)
    .in('id', idsGrupo)
    .eq('usuario_id', user.id)

  if (errorBulk) {
    console.error('Error actualizando transacciones (grupo):', errorBulk)
    return { error: 'No se pudo editar' }
  }

  const { error: errorFila } = await supabase
    .from('transacciones')
    .update(datosSoloEstaFila)
    .eq('id', id)
    .eq('usuario_id', user.id)

  if (errorFila) {
    console.error('Error actualizando transacción (fila):', errorFila)
    return { error: 'No se pudo editar' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/movimientos')
  revalidatePath('/dashboard/tarjetas')
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

/** Gastos fijos pendientes del mes (estado=pendiente, tipo_gasto=fijo) para calcular saldo real */
export async function obtenerGastosFijosPendientes(usuarioId: string, mesRef: string) {
  const supabase = await createClient()
  const [year, month] = mesRef.split('-')
  const inicio = new Date(Number(year), Number(month) - 1, 1).toISOString()
  const fin = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()

  const { data, error } = await supabase
    .from('transacciones')
    .select('id, monto, descripcion, estado, vencimiento_en')
    .eq('usuario_id', usuarioId)
    .eq('tipo', 'gasto')
    .eq('tipo_gasto', 'fijo')
    .eq('estado', 'pendiente')
    .gte('created_at', inicio)
    .lte('created_at', fin)

  if (error) return { data: [], error: error.message }
  return { data: data || [], error: null }
}

/** Consumo por categoría en el mes (suma de gastos variables y no fijos) */
export async function obtenerConsumoPorCategoria(usuarioId: string, mesRef: string) {
  const supabase = await createClient()
  const [year, month] = mesRef.split('-')
  const inicio = new Date(Number(year), Number(month) - 1, 1).toISOString()
  const fin = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString()

  const { data, error } = await supabase
    .from('transacciones')
    .select('categoria, monto')
    .eq('usuario_id', usuarioId)
    .eq('tipo', 'gasto')
    .gte('created_at', inicio)
    .lte('created_at', fin)

  if (error) return { data: {} as Record<string, number>, error: error.message }

  const consumido: Record<string, number> = {}
  for (const t of data || []) {
    consumido[t.categoria] = (consumido[t.categoria] || 0) + t.monto
  }
  return { data: consumido, error: null }
}
