-- Políticas explícitas para presupuestos_categoria (INSERT/UPDATE)
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus presupuestos" ON presupuestos_categoria;

CREATE POLICY "Usuarios insertan presupuestos" ON presupuestos_categoria
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios leen presupuestos" ON presupuestos_categoria
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios actualizan presupuestos" ON presupuestos_categoria
  FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios eliminan presupuestos" ON presupuestos_categoria
  FOR DELETE USING (auth.uid() = usuario_id);
