-- Ejecuta este SQL en el editor de Supabase para agregar la columna codigo a la tabla parejas
-- Necesaria para el módulo de vinculación con códigos de 6 caracteres

ALTER TABLE parejas ADD COLUMN IF NOT EXISTS codigo TEXT UNIQUE;

-- Opcional: crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_parejas_codigo ON parejas(codigo);
