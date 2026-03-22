export type Transaccion = {
  id: string
  usuario_id: string
  tipo: 'ingreso' | 'gasto'
  categoria: string
  monto: number | string
  descripcion?: string | null
  created_at: string
  estado?: string | null
  tipo_gasto?: string | null
  cuota_actual?: number | null
  cuota_total?: number | null
  es_compartido?: boolean | null
  pagado_por?: string | null
}
