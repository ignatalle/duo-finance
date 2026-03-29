import {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Zap,
  HeartPulse,
  Film,
  Shirt,
  DollarSign,
  Package,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORIAS_FORMULARIO: string[] = [
  '🛒 Supermercado',
  '🍔 Comida / Delivery',
  '🚗 Transporte / Nafta',
  '🏠 Hogar / Alquiler',
  '💡 Servicios (Luz, Agua, Internet)',
  '⚕️ Salud / Farmacia',
  '🎬 Entretenimiento',
  '👕 Ropa / Accesorios',
  '💰 Sueldo / Ingreso Principal',
  '📦 Otros',
]

export type CategoryCarouselItem = { id: string; name: string; icon: LucideIcon }

const getCategoryData = (catStr: string): CategoryCarouselItem => {
  if (catStr.includes('Supermercado')) return { id: catStr, name: 'Súper', icon: ShoppingBag }
  if (catStr.includes('Comida')) return { id: catStr, name: 'Comida', icon: Utensils }
  if (catStr.includes('Transporte')) return { id: catStr, name: 'Viaje', icon: Car }
  if (catStr.includes('Hogar')) return { id: catStr, name: 'Hogar', icon: Home }
  if (catStr.includes('Servicios')) return { id: catStr, name: 'Pagos', icon: Zap }
  if (catStr.includes('Salud')) return { id: catStr, name: 'Salud', icon: HeartPulse }
  if (catStr.includes('Entretenimiento')) return { id: catStr, name: 'Ocio', icon: Film }
  if (catStr.includes('Ropa')) return { id: catStr, name: 'Ropa', icon: Shirt }
  if (catStr.includes('Sueldo')) return { id: catStr, name: 'Sueldo', icon: DollarSign }
  return { id: catStr, name: 'Otros', icon: Package }
}

export const CATEGORY_ITEMS: CategoryCarouselItem[] = CATEGORIAS_FORMULARIO.map(getCategoryData)
