'use server'

import type { GastoParseado } from '@/lib/ocr/parser'
import { createClient } from '@/lib/supabase/server'
import { MSG_NO_AUTH } from '@/lib/actionAuth'

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

function getIcon(cat: string): string {
  const key = Object.keys(CAT_ICONS).find((k) => cat.includes(k))
  return key ? CAT_ICONS[key] : '📦'
}

function normalizarGasto(raw: { desc?: string; monto?: number; cat?: string }): GastoParseado | null {
  const desc = String(raw.desc || '').trim()
  const monto = Number(raw.monto)
  if (!desc || Number.isNaN(monto) || monto <= 0 || monto >= 1e9) return null
  let cat = String(raw.cat || '').trim()
  if (!CATEGORIAS.includes(cat as (typeof CATEGORIAS)[number])) {
    cat = CATEGORIAS[CATEGORIAS.length - 1]
  }
  return { desc, monto, cat, icon: getIcon(cat) }
}

/**
 * Envía el texto extraído a la IA para que detecte transacciones.
 * Requiere OPENAI_API_KEY en .env.local
 */
export async function analizarDocumentoConIA(texto: string): Promise<{
  success: boolean
  gastos?: GastoParseado[]
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: MSG_NO_AUTH }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey?.trim()) {
    return { success: false, error: 'Configurá OPENAI_API_KEY en .env.local para usar análisis por IA.' }
  }

  if (!texto || texto.trim().length < 10) {
    return { success: false, error: 'El texto está vacío o es demasiado corto.' }
  }

  const prompt = `Analizá el siguiente texto extraído de un ticket, factura o resumen de tarjeta (Argentina).
Extraé TODAS las transacciones/gastos que encuentres. Para cada una devolvé:
- desc: nombre del comercio o concepto (ej: "SUPERMERCADOS MAYOR SA", "SHELL", "FARMACITY")
- monto: número en pesos argentinos (solo el número, ej: 162000 para $162.000,00)
- cat: UNA de estas categorías exactas: ${CATEGORIAS.join(' | ')}

IMPORTANTE: 
- Ignorá totales generales, saldos, pagos mínimos.
- Incluí cada compra/consumo individual.
- Los montos pueden estar como 21.000,00 o 162000 (convertí a número).
- Respondé SOLO con un JSON válido: [{"desc":"...","monto":123,"cat":"..."}]

Texto:
---
${texto.slice(0, 12000)}
---`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('analizarDocumentoConIA API:', res.status, body.slice(0, 500))
      return {
        success: false,
        error: 'El servicio de análisis no está disponible. Intentá más tarde.',
      }
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return { success: false, error: 'La IA no devolvió resultados.' }

    const jsonMatch = content.match(/\[[\s\S]*\]/)
    const jsonStr = jsonMatch ? jsonMatch[0] : content
    const raw = JSON.parse(jsonStr) as Array<{ desc?: string; monto?: number; cat?: string }>
    const gastos = raw.map(normalizarGasto).filter((g): g is GastoParseado => g !== null)

    if (gastos.length === 0) {
      return { success: false, error: 'No se detectaron gastos en el documento.' }
    }

    return { success: true, gastos }
  } catch (err) {
    console.error('analizarDocumentoConIA:', err)
    return {
      success: false,
      error: 'No se pudo analizar el documento.',
    }
  }
}
