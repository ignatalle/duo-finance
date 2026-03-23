import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcularBalancePareja } from '@/lib/calculos'
import { HeartHandshake, ArrowRightLeft, Users } from 'lucide-react'
import { format } from 'date-fns'
import { CodigoParaCompartir } from './CodigoParaCompartir'
import { es } from 'date-fns/locale'

export async function ParejaResumen({
  inicioMes,
  finMes,
  usuarioId,
  parejaId,
  nombrePareja,
  codigoPareja,
}: {
  inicioMes: string
  finMes: string
  usuarioId: string
  parejaId: string
  nombrePareja: string
  codigoPareja?: string | null
}) {
  const supabase = await createClient()

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('id, monto, descripcion, categoria, pagado_por, created_at')
    .eq('pareja_id', parejaId)
    .eq('es_compartido', true)
    .gte('created_at', inicioMes)
    .lte('created_at', finMes)
    .order('created_at', { ascending: false })

  const totalYo = transacciones?.filter((t) => t.pagado_por === usuarioId).reduce((a, t) => a + t.monto, 0) || 0
  const totalPareja = transacciones?.filter((t) => t.pagado_por !== usuarioId).reduce((a, t) => a + t.monto, 0) || 0
  const totalCompartido = totalYo + totalPareja
  const balance = calcularBalancePareja(totalYo, totalPareja)

  const emojiFromCategoria = (cat: string) => {
    if (cat?.includes('Supermercado')) return '🛒'
    if (cat?.includes('Comida')) return '🍔'
    if (cat?.includes('Transporte')) return '🚗'
    if (cat?.includes('Hogar')) return '🏠'
    if (cat?.includes('Servicios')) return '💡'
    if (cat?.includes('Salud')) return '⚕️'
    if (cat?.includes('Entretenimiento')) return '🎬'
    return '📄'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-fuchsia-400" /> Finanzas Compartidas
          </h2>
          <p className="text-zinc-400 text-sm">Gastos a medias con {nombrePareja}.</p>
        </div>
      </div>

      {codigoPareja && <CodigoParaCompartir codigo={codigoPareja} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <h3 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Resumen del Mes</h3>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Total Gastado Entre Ambos</p>
              <p className="text-3xl font-black text-white">${totalCompartido.toLocaleString('es-AR')}</p>
            </div>
            <HeartHandshake className="text-zinc-600 opacity-50" size={40} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">Pagaste vos</span>
                <span className="text-white font-bold">${totalYo.toLocaleString('es-AR')}</span>
              </div>
              <ProgressBar current={totalYo} max={totalCompartido || 1} colorClass="bg-indigo-500" heightClass="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-300">Pagó {nombrePareja}</span>
                <span className="text-white font-bold">${totalPareja.toLocaleString('es-AR')}</span>
              </div>
              <ProgressBar current={totalPareja} max={totalCompartido || 1} colorClass="bg-fuchsia-500" heightClass="h-2" />
            </div>
          </div>
        </Card>

        <Card
          className={`flex flex-col justify-center items-center text-center ${
            balance > 0 ? 'bg-emerald-900/20 border-emerald-500/30' : balance < 0 ? 'bg-rose-900/20 border-rose-500/30' : 'border-zinc-700'
          }`}
        >
          <ArrowRightLeft
            className={`mb-4 opacity-50 ${balance > 0 ? 'text-emerald-400' : balance < 0 ? 'text-rose-400' : 'text-zinc-400'}`}
            size={32}
          />
          <p className="text-sm font-medium text-zinc-300 mb-2">Balance Actual</p>
          {balance === 0 ? (
            <p className="text-2xl font-bold text-white">Están a mano</p>
          ) : balance > 0 ? (
            <>
              <p className="text-3xl font-black text-emerald-400 mb-1">${balance.toLocaleString('es-AR')}</p>
              <p className="text-sm text-emerald-200/70">{nombrePareja} te debe</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-black text-rose-400 mb-1">${Math.abs(balance).toLocaleString('es-AR')}</p>
              <p className="text-sm text-rose-200/70">Le debés a {nombrePareja}</p>
            </>
          )}
          {balance !== 0 && (
            <button
              type="button"
              className={`mt-6 w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                balance > 0 ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
              }`}
            >
              {balance > 0 ? 'Pedir Pago' : 'Saldar Deuda'}
            </button>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-700 pb-2">Últimos movimientos compartidos</h3>
        <div className="space-y-3">
          {(transacciones || []).length === 0 ? (
            <p className="text-zinc-500 text-sm py-4">No hay movimientos compartidos este mes.</p>
          ) : (
            transacciones?.map((g) => (
              <div
                key={g.id}
                className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700/50 flex justify-between items-center hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-900 p-2.5 rounded-xl text-lg border border-zinc-700/50">
                    {emojiFromCategoria(g.categoria)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{g.descripcion || g.categoria}</p>
                    <p className="text-xs text-zinc-400">
                      {format(new Date(g.created_at), 'dd MMM yyyy', { locale: es })} • Pagó:{' '}
                      <span className={g.pagado_por === usuarioId ? 'text-indigo-400 font-medium' : 'text-fuchsia-400 font-medium'}>
                        {g.pagado_por === usuarioId ? 'Vos' : nombrePareja}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">${g.monto.toLocaleString('es-AR')}</p>
                  <p className="text-xs text-zinc-500">Mitad: ${(g.monto / 2).toLocaleString('es-AR')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
