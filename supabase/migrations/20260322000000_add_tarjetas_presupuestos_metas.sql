-- Migración: Adaptar CuentasClaras - Tarjetas, Presupuestos, Metas
-- Ejecutar en el editor SQL de Supabase o con: supabase db push

-- 1. Crear tabla tarjetas
CREATE TABLE IF NOT EXISTS tarjetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pareja_id UUID REFERENCES parejas(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  cierre_dia SMALLINT NOT NULL CHECK (cierre_dia >= 1 AND cierre_dia <= 28) DEFAULT 15,
  vencimiento_dia SMALLINT NOT NULL CHECK (vencimiento_dia >= 1 AND vencimiento_dia <= 28) DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarjetas_usuario ON tarjetas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarjetas_pareja ON tarjetas(pareja_id);

-- Habilitar RLS
ALTER TABLE tarjetas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus tarjetas" ON tarjetas
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden insertar sus tarjetas" ON tarjetas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus tarjetas" ON tarjetas
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus tarjetas" ON tarjetas
  FOR DELETE USING (auth.uid() = usuario_id);

-- 2. Crear tabla presupuestos_categoria
CREATE TABLE IF NOT EXISTS presupuestos_categoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pareja_id UUID REFERENCES parejas(id) ON DELETE SET NULL,
  categoria TEXT NOT NULL,
  limite_mensual NUMERIC(15, 2) NOT NULL CHECK (limite_mensual >= 0),
  mes_ref TEXT NOT NULL, -- formato YYYY-MM
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, categoria, mes_ref)
);

CREATE INDEX IF NOT EXISTS idx_presupuestos_usuario ON presupuestos_categoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_mes ON presupuestos_categoria(mes_ref);

ALTER TABLE presupuestos_categoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden gestionar sus presupuestos" ON presupuestos_categoria
  FOR ALL USING (auth.uid() = usuario_id);

-- 3. Crear tabla metas
CREATE TABLE IF NOT EXISTS metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  objetivo NUMERIC(15, 2) NOT NULL CHECK (objetivo > 0),
  actual NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (actual >= 0),
  fecha_objetivo DATE,
  icono TEXT DEFAULT '🏦',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metas_usuario ON metas(usuario_id);

ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden gestionar sus metas" ON metas
  FOR ALL USING (auth.uid() = usuario_id);

-- 4. Extender transacciones
ALTER TABLE transacciones ADD COLUMN IF NOT EXISTS vencimiento_en DATE;
ALTER TABLE transacciones ADD COLUMN IF NOT EXISTS tarjeta_id UUID REFERENCES tarjetas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transacciones_tarjeta ON transacciones(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_vencimiento ON transacciones(vencimiento_en);
