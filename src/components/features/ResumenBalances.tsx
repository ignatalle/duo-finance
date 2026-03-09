import { createClient } from '@/lib/supabase/server'

export async function ResumenBalances() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Traemos todas las transacciones que el RLS nos permite ver
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')

  if (!transacciones) return null

  // 2. Variables para nuestros cálculos
  let ingresosTotales = 0
  let gastosTotales = 0
  let meDeben = 0
  let debo = 0

  // 3. Hacemos las sumas
  transacciones.forEach((t) => {
    // Sumamos ingresos y gastos (solo los míos, o la mitad si son compartidos y los pagué yo)
    if (t.tipo === 'ingreso' && t.usuario_id === user.id) {
      ingresosTotales += Number(t.monto)
    } 
    if (t.tipo === 'gasto' && t.usuario_id === user.id) {
      gastosTotales += Number(t.monto)
    }

    // Lógica de Pareja (Gastos Compartidos divididos al 50%)
    if (t.es_compartido && t.tipo === 'gasto') {
      const mitad = Number(t.monto) / 2
      if (t.pagado_por === user.id) {
        // Si yo lo pagué, mi pareja me debe la mitad
        meDeben += mitad
      } else {
        // Si lo pagó mi pareja, yo le debo la mitad
        debo += mitad
      }
    }
  })

  // 4. Calculamos el balance neto de la pareja
  const balancePareja = meDeben - debo
  const miBalancePersonal = ingresosTotales - gastosTotales

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Tarjeta 1: Mi Balance */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Mi Balance (Personal)</h3>
        <p className={`text-3xl font-bold ${miBalancePersonal >= 0 ? 'text-white' : 'text-red-400'}`}>
          ${miBalancePersonal.toFixed(2)}
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          Ingresos: <span className="text-green-400">+${ingresosTotales.toFixed(2)}</span>
        </p>
      </div>

      {/* Tarjeta 2: Mis Gastos Totales */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Mis Gastos Totales</h3>
        <p className="text-3xl font-bold text-white">
          ${gastosTotales.toFixed(2)}
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          (Incluye tus gastos privados y pagos compartidos)
        </p>
      </div>

      {/* Tarjeta 3: Liquidación Pareja */}
      <div className={`border p-6 rounded-xl shadow-sm ${
        balancePareja > 0 ? 'bg-green-950/30 border-green-900' : 
        balancePareja < 0 ? 'bg-red-950/30 border-red-900' : 
        'bg-zinc-900 border-zinc-800'
      }`}>
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Liquidación Pareja</h3>
        
        {balancePareja === 0 ? (
          <div>
            <p className="text-3xl font-bold text-white">$0.00</p>
            <p className="text-xs text-zinc-500 mt-2">Están a mano. Nadie debe nada.</p>
          </div>
        ) : balancePareja > 0 ? (
          <div>
            <p className="text-3xl font-bold text-green-400">+${balancePareja.toFixed(2)}</p>
            <p className="text-xs text-green-500/70 mt-2">Tu partner te debe esta cantidad.</p>
          </div>
        ) : (
          <div>
            <p className="text-3xl font-bold text-red-400">-${Math.abs(balancePareja).toFixed(2)}</p>
            <p className="text-xs text-red-500/70 mt-2">Le debes esta cantidad a tu partner.</p>
          </div>
        )}
      </div>
    </div>
  )
}
