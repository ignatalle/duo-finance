/**
 * Parser de texto OCR para tickets argentinos.
 * Extrae montos, comercio y sugiere categoría.
 */

const CATEGORIAS = [
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
] as const

const CAT_ICONS: Record<string, string> = {
  Supermercado: '🛒',
  Comida: '🍔',
  Transporte: '🚗',
  Hogar: '🏠',
  Servicios: '💡',
  Salud: '⚕️',
  Entretenimiento: '🎬',
  Ropa: '👕',
  Sueldo: '💰',
  Otros: '📦',
}

export interface GastoParseado {
  desc: string
  monto: number
  cat: string
  icon: string
}

// Palabras clave para inferir categoría desde el texto
const CATEGORIA_KEYWORDS: Record<string, string[]> = {
  '🛒 Supermercado': ['coto', 'carrefour', 'día', 'chango', 'super', 'supermercado', 'vea', 'jumbo', 'disco', 'maxiconsumo', 'mayor'],
  '🍔 Comida / Delivery': ['restaurant', 'restaurante', 'cafe', 'café', 'delivery', 'rappi', 'pedidosya', 'glovo', 'pizza', 'hamburguesa', 'parrilla', 'almuerzo', 'mercado pago'],
  '🚗 Transporte / Nafta': ['shell', 'ypf', 'axion', 'gulf', 'estacion', 'nafta', 'combustible', 'uber', 'cabify', 'diDi', 'transporte'],
  '🏠 Hogar / Alquiler': ['hogar', 'alquiler', 'ferreteria', 'easy', 'sodimac'],
  '💡 Servicios (Luz, Agua, Internet)': ['edesur', 'edenor', 'aysa', 'agua', 'luz', 'gas', 'telefonica', 'personal', 'movistar', 'claro', 'fibertel', 'internet'],
  '⚕️ Salud / Farmacia': ['farmacia', 'farmacity', 'dr', 'clínica', 'hospital', 'laboratorio'],
  '🎬 Entretenimiento': ['cine', 'netflix', 'spotify', 'hoyts', 'cinépolis', 'disney', 'youtube'],
  '👕 Ropa / Accesorios': ['ropa', 'tienda', 'zara', 'falabella'],
}

function sugerirCategoria(texto: string): string {
  const t = texto.toLowerCase()
  for (const [cat, palabras] of Object.entries(CATEGORIA_KEYWORDS)) {
    if (palabras.some((p) => t.includes(p))) return cat
  }
  return CATEGORIAS[CATEGORIAS.length - 1]
}

function getIcon(cat: string): string {
  const key = Object.keys(CAT_ICONS).find((k) => cat.includes(k))
  return key ? CAT_ICONS[key] : '📦'
}

function parsearNumeroArgentino(s: string): number | null {
  const limpio = s.trim().replace(/\s/g, '')
  if (!limpio) return null
  // Argentina: 1.234,56 (punto miles, coma decimal) o 1234 o 1234,50
  const tieneComa = limpio.includes(',')
  const tienePunto = limpio.includes('.')
  let numStr: string
  if (tieneComa && tienePunto) {
    numStr = limpio.replace(/\./g, '').replace(',', '.')
  } else if (tieneComa) {
    numStr = limpio.replace(',', '.')
  } else if (tienePunto && limpio.split('.')[1]?.length === 2) {
    numStr = limpio.replace('.', '')
  } else {
    numStr = limpio.replace(/\./g, '')
  }
  const num = parseFloat(numStr)
  return Number.isNaN(num) ? null : num
}

/**
 * Extrae montos de texto. Formato argentino: $1234,56 o 1.234,56 o 1234
 */
function extraerMontos(texto: string): number[] {
  const montos: number[] = []
  const yaVistos = new Set<number>()
  const agregar = (n: number) => {
    if (n > 0 && n < 1e9 && !yaVistos.has(Math.round(n))) {
      yaVistos.add(Math.round(n))
      montos.push(n)
    }
  }
  // $12.345,67 o $ 12345
  texto.replace(/\$\s*([\d.,]+)/g, (_, g) => {
    const n = parsearNumeroArgentino(g)
    if (n) agregar(n)
    return ''
  })
  // Total: 12345 o TOTAL 12.345,67
  texto.replace(/(?:total|TOTAL|Total)\s*[:=\s]*[\$]?\s*([\d.,]+)/gi, (_, g) => {
    const n = parsearNumeroArgentino(g)
    if (n) agregar(n)
    return ''
  })
  // Cualquier número que parezca monto (4+ dígitos o con formato)
  texto.replace(/([\d][\d.,]{2,})/g, (_, g) => {
    const n = parsearNumeroArgentino(g)
    if (n) agregar(n)
    return ''
  })
  return [...new Set(montos)].sort((a, b) => b - a)
}

/**
 * Extrae el nombre del comercio (primeras líneas no numéricas)
 */
function extraerComercio(texto: string): string {
  const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  for (const linea of lineas.slice(0, 8)) {
    if (linea.length >= 3 && linea.length <= 80) {
      const sinNumeros = linea.replace(/[\d.,$%\s]+/g, '').trim()
      if (sinNumeros.length >= 3) return linea
    }
  }
  return 'Gasto escaneado'
}

/**
 * Parsea texto OCR y devuelve uno o más gastos detectados.
 */
export function parsearTextoOCR(texto: string): GastoParseado[] {
  if (!texto || texto.trim().length < 5) return []

  const montos = extraerMontos(texto)
  const comercio = extraerComercio(texto)

  if (montos.length === 0) return []

  const cat = sugerirCategoria(texto)
  const icon = getIcon(cat)

  // Un solo monto = un gasto con total
  if (montos.length === 1) {
    return [{ desc: comercio, monto: montos[0], cat, icon }]
  }

  // Varios montos: el mayor suele ser el total; los demás pueden ser ítems
  const total = montos[0]
  return [{ desc: comercio, monto: total, cat, icon }]
}

/**
 * Parsea resumen de tarjeta (Banco Nación, etc.): formato FECHA VOUCHER DETALLE PESOS
 * Ej: 03.02.26 030017 MERCADOPAGO*DULCE 21.000,00
 */
export function parsearResumenTarjeta(texto: string): GastoParseado[] {
  if (!texto || texto.trim().length < 10) return []

  const resultados: GastoParseado[] = []
  // Patrón: DD.MM.YY + 6 dígitos (voucher) + descripción + monto (formato AR: 21.000,00)
  const re = /(\d{2}\.\d{2}\.\d{2})\s+\d{6}\s+(.+?)\s+(\d+(?:\.\d{3})*,\d{2})\s*$/gm
  let m
  const vistos = new Set<string>()
  while ((m = re.exec(texto)) !== null) {
    const fecha = m[1]
    const detalle = m[2].trim()
    const montoStr = m[3].replace(/\./g, '').replace(',', '.')
    const monto = parseFloat(montoStr)
    if (Number.isNaN(monto) || monto <= 0 || monto >= 1e9) continue
    const key = `${detalle}-${monto}`
    if (vistos.has(key)) continue
    vistos.add(key)
    const cat = sugerirCategoria(detalle)
    resultados.push({
      desc: detalle,
      monto,
      cat,
      icon: getIcon(cat),
    })
  }
  return resultados
}
