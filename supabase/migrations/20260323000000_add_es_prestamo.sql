-- Añadir columna es_prestamo para identificar gastos/ingresos que son préstamos
ALTER TABLE transacciones ADD COLUMN IF NOT EXISTS es_prestamo BOOLEAN DEFAULT false;
