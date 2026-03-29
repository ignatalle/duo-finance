import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  UtensilsCrossed,
  ShoppingCart,
  Wallet,
  Car,
  Home,
  Zap,
  Heart,
  Film,
  Shirt,
  Package,
  type LucideIcon,
} from 'lucide-react'
import type { Transaccion } from '@/types'

export const CATEGORIA_ICON_MOVIMIENTOS: Record<string, { icon: LucideIcon; color: string }> = {
  '🍔 Comida / Delivery': { icon: UtensilsCrossed, color: 'bg-amber-500/20 text-amber-400' },
  '🛒 Supermercado': { icon: ShoppingCart, color: 'bg-blue-500/20 text-blue-400' },
  '💰 Sueldo / Ingreso Principal': { icon: Wallet, color: 'bg-teal-500/20 text-teal-400' },
  '🚗 Transporte / Nafta': { icon: Car, color: 'bg-sky-500/20 text-sky-400' },
  '🏠 Hogar / Alquiler': { icon: Home, color: 'bg-violet-500/20 text-violet-400' },
  '💡 Servicios (Luz, Agua, Internet)': { icon: Zap, color: 'bg-yellow-500/20 text-yellow-400' },
  '⚕️ Salud / Farmacia': { icon: Heart, color: 'bg-rose-500/20 text-rose-400' },
  '🎬 Entretenimiento': { icon: Film, color: 'bg-pink-500/20 text-pink-400' },
  '👕 Ropa / Accesorios': { icon: Shirt, color: 'bg-fuchsia-500/20 text-fuchsia-400' },
  '📦 Otros': { icon: Package, color: 'bg-zinc-600/30 text-zinc-400' },
}

const DEFAULT_ICON = { icon: ShoppingCart, color: 'bg-zinc-700 text-zinc-400' }

export function getIconForCategoriaMovimiento(categoria: string) {
  return CATEGORIA_ICON_MOVIMIENTOS[categoria] ?? DEFAULT_ICON
}

export function formatearMontoLista(monto: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto)
}

export function agruparTransaccionesPorFecha(transacciones: Transaccion[]) {
  const grupos: Record<string, Transaccion[]> = {}
  for (const t of transacciones) {
    const key = format(new Date(t.created_at), 'yyyy-MM-dd', { locale: es })
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(t)
  }
  return grupos
}

export function tituloFechaGrupo(fecha: string, hoy: string, ayer: string) {
  if (fecha === hoy) return `HOY, ${format(new Date(fecha), "d 'DE' MMMM", { locale: es }).toUpperCase()}`
  if (fecha === ayer) return `AYER, ${format(new Date(fecha), "d 'DE' MMMM", { locale: es }).toUpperCase()}`
  return format(new Date(fecha), "EEEE, d 'DE' MMMM", { locale: es }).toUpperCase()
}
