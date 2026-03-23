-- Extender tarjetas para diseño tipo Visa/Mastercard
ALTER TABLE tarjetas ADD COLUMN IF NOT EXISTS banco TEXT;
ALTER TABLE tarjetas ADD COLUMN IF NOT EXISTS ultimos_digitos SMALLINT;
ALTER TABLE tarjetas ADD COLUMN IF NOT EXISTS estilo TEXT DEFAULT 'orange';

-- estilo: 'orange' (gradiente naranja-rosa), 'dark' (gris oscuro), 'blue' (azul)
COMMENT ON COLUMN tarjetas.estilo IS 'Estilo visual: orange, dark, blue';
