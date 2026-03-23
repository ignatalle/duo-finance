-- Políticas RLS para tabla parejas
-- Necesarias para que "Generar mi código" funcione (INSERT) y vinculación por código (SELECT)

-- Si la tabla no tiene políticas, los INSERT fallan silenciosamente con RLS habilitado.

-- Permitir a usuarios autenticados crear nuevas parejas (generar código)
DROP POLICY IF EXISTS "Authenticated can insert parejas" ON parejas;
CREATE POLICY "Authenticated can insert parejas"
  ON parejas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir a usuarios autenticados ver parejas (para vincularse por código y ver su propia pareja)
DROP POLICY IF EXISTS "Authenticated can select parejas" ON parejas;
CREATE POLICY "Authenticated can select parejas"
  ON parejas FOR SELECT
  TO authenticated
  USING (true);

-- Permitir actualizar la pareja a la que pertenece el usuario (según perfiles)
DROP POLICY IF EXISTS "Users can update their pareja" ON parejas;
CREATE POLICY "Users can update their pareja"
  ON parejas FOR UPDATE
  TO authenticated
  USING (
    id IN (SELECT pareja_id FROM perfiles WHERE id = auth.uid() AND pareja_id IS NOT NULL)
  );
