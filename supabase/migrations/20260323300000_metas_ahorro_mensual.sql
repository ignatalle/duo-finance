-- Meta de ahorro mensual: cuanto quiero ahorrar este mes (se descuenta del saldo disponible)
CREATE TABLE IF NOT EXISTS metas_ahorro_mensual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes_ref TEXT NOT NULL, -- formato YYYY-MM
  monto NUMERIC(15, 2) NOT NULL CHECK (monto >= 0) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, mes_ref)
);

CREATE INDEX IF NOT EXISTS idx_metas_ahorro_mensual_usuario ON metas_ahorro_mensual(usuario_id);
CREATE INDEX IF NOT EXISTS idx_metas_ahorro_mensual_mes ON metas_ahorro_mensual(mes_ref);

ALTER TABLE metas_ahorro_mensual ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gestionan su meta de ahorro mensual" ON metas_ahorro_mensual
  FOR ALL USING (auth.uid() = usuario_id);
