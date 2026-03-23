-- Al eliminar una tarjeta, las transacciones vinculadas se eliminan en cascada.

-- Buscar y eliminar la constraint FK existente
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'transacciones'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'tarjeta_id';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE transacciones DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Recrear la FK con ON DELETE CASCADE (elimina las transacciones al borrar la tarjeta)
ALTER TABLE transacciones
  ADD CONSTRAINT transacciones_tarjeta_id_fkey
  FOREIGN KEY (tarjeta_id) REFERENCES tarjetas(id) ON DELETE CASCADE;
