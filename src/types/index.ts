/** Transacción tal como viene de Supabase (tabla transacciones) */
export interface Transaccion {
  id: string
  usuario_id: string
  pareja_id: string | null
  monto: number
  tipo: 'ingreso' | 'gasto'
  categoria: string
  descripcion: string | null
  es_compartido: boolean
  pagado_por: string
  estado: 'pagado' | 'pendiente' | null
  tipo_gasto: 'fijo' | 'variable' | null
  cuota_actual: number | null
  cuota_total: number | null
  vencimiento_en: string | null
  tarjeta_id: string | null
  es_prestamo?: boolean
  created_at: string
}

/** Perfil de usuario (tabla perfiles) */
export interface Perfil {
  id: string
  pareja_id: string | null
  [key: string]: unknown
}
