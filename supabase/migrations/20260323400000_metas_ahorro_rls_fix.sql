-- Políticas explícitas para metas_ahorro_mensual (INSERT/UPDATE)
DROP POLICY IF EXISTS "Usuarios gestionan su meta de ahorro mensual" ON metas_ahorro_mensual;

CREATE POLICY "Usuarios insertan su meta de ahorro" ON metas_ahorro_mensual
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios leen su meta de ahorro" ON metas_ahorro_mensual
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios actualizan su meta de ahorro" ON metas_ahorro_mensual
  FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios eliminan su meta de ahorro" ON metas_ahorro_mensual
  FOR DELETE USING (auth.uid() = usuario_id);
