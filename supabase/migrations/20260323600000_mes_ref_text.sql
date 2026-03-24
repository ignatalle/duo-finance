-- mes_ref debe ser TEXT con formato YYYY-MM (no DATE)
-- Si es DATE, PostgreSQL rechaza "2026-03" y exige "2026-03-01"

-- presupuestos_categoria: convertir DATE a TEXT si aplica
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'presupuestos_categoria' 
    AND column_name = 'mes_ref' AND data_type = 'date'
  ) THEN
    ALTER TABLE presupuestos_categoria 
      ALTER COLUMN mes_ref TYPE TEXT 
      USING to_char(mes_ref, 'YYYY-MM');
  END IF;
END $$;

-- metas_ahorro_mensual: mismo tratamiento si aplica
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'metas_ahorro_mensual' 
    AND column_name = 'mes_ref' AND data_type = 'date'
  ) THEN
    ALTER TABLE metas_ahorro_mensual 
      ALTER COLUMN mes_ref TYPE TEXT 
      USING to_char(mes_ref, 'YYYY-MM');
  END IF;
END $$;
