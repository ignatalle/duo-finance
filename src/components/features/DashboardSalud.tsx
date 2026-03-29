'use client'

import Link from 'next/link'
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'

type EstadoSalud = 'vacío' | 'excelente' | 'precaucion' | 'negativo'

function getEstadoSalud(saldoMes: number, ingresos: number, gastos: number): EstadoSalud {
  if (ingresos === 0 && gastos === 0) return 'vacío'
  if (saldoMes < 0) return 'negativo'
  if (ingresos > 0) {
    const tasaAhorro = saldoMes / ingresos
    if (tasaAhorro < 0.1) return 'precaucion'
  }
  return 'excelente'
}

export function DashboardSalud({
  saldoMes = 0,
  ingresos = 0,
  gastos = 0,
}: {
  saldoMes?: number
  ingresos?: number
  gastos?: number
}) {
  const estado = getEstadoSalud(saldoMes, ingresos, gastos)

  const config = {
    vacío: {
      icono: TrendingUp,
      titulo: 'Empezá a cargar datos',
      mensaje: 'Registrá tus primeros ingresos para analizar tu salud financiera.',
      colorIcono: 'text-zinc-400',
      colorBg: 'bg-zinc-500/20',
    },
    excelente: {
      icono: CheckCircle2,
      titulo: 'Salud Excelente',
      mensaje: 'Estás ahorrando el 20% recomendado este mes.',
      colorIcono: 'text-emerald-400',
      colorBg: 'bg-emerald-500/20',
    },
    precaucion: {
      icono: AlertTriangle,
      titulo: 'Cuidado',
      mensaje: 'Tu ahorro es bajo este mes. Revisá tus gastos.',
      colorIcono: 'text-amber-400',
      colorBg: 'bg-amber-500/20',
    },
    negativo: {
      icono: XCircle,
      titulo: 'En negativo',
      mensaje: 'Los gastos superan a los ingresos. Revisá urgentemente.',
      colorIcono: 'text-rose-400',
      colorBg: 'bg-rose-500/20',
    },
  }

  const cfg = config[estado]
  const Icon = cfg.icono

  return (
    <div className="flex flex-col justify-center items-center text-center h-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 md:p-6 min-w-0">
      <div className={`w-20 h-20 rounded-full ${cfg.colorBg} flex items-center justify-center mb-4`}>
        <Icon size={40} className={cfg.colorIcono} />
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{cfg.titulo}</h3>
      <p className="text-sm text-zinc-500 mb-6">{cfg.mensaje}</p>
      <Link
        href="/dashboard/movimientos"
        className={`w-full py-2.5 px-4 font-semibold text-sm rounded-xl transition-colors ${
          estado === 'vacío'
            ? 'bg-teal-600 hover:bg-teal-500 text-white'
            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
        }`}
      >
        {estado === 'vacío' ? 'Registrar primer movimiento' : 'Ver detalles'}
      </Link>
    </div>
  )
}
