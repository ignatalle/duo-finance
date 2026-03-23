# Duo Finance – Requisitos de Supabase

Lista de todo lo que debe existir en Supabase para que la app funcione y soporte futuras actualizaciones.

---

## 1. Configuración base de Supabase

- **Proyecto Supabase** creado y activo
- **URL y anon key** configurados en `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```
- **Authentication** habilitado (Email/Password mínimo)
- **Row Level Security (RLS)** habilitado en todas las tablas

---

## 2. Tablas requeridas (orden de creación)

### 2.1 Tabla `parejas`

Debe existir **antes** de `perfiles` y `tarjetas`.

```sql
CREATE TABLE IF NOT EXISTS parejas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL DEFAULT 'Pareja',
  codigo TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parejas_codigo ON parejas(codigo);
ALTER TABLE parejas ENABLE ROW LEVEL SECURITY;

-- Políticas: acceso según pertenencia (ver perfiles)
```

---

### 2.2 Tabla `perfiles`

Vínculo entre `auth.users` y parejas. Debe crearse al registrarse el usuario (trigger recomendado).

```sql
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pareja_id UUID REFERENCES parejas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_pareja ON perfiles(pareja_id);
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su perfil" ON perfiles
  FOR ALL USING (auth.uid() = id);
```

**Trigger para crear perfil al registrarse:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### 2.3 Tabla `transacciones`

```sql
CREATE TABLE IF NOT EXISTS transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pareja_id UUID REFERENCES parejas(id) ON DELETE SET NULL,
  monto NUMERIC(15, 2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  categoria TEXT NOT NULL,
  descripcion TEXT,
  es_compartido BOOLEAN DEFAULT false,
  pagado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'pagado' CHECK (estado IN ('pagado', 'pendiente')),
  tipo_gasto TEXT CHECK (tipo_gasto IN ('fijo', 'variable')),
  cuota_actual SMALLINT,
  cuota_total SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON transacciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_created ON transacciones(created_at);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones(tipo);

ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gestionan sus transacciones" ON transacciones
  FOR ALL USING (auth.uid() = usuario_id);
```

---

## 3. Migraciones incluidas en el proyecto

### 3.1 `20260322000000_add_tarjetas_presupuestos_metas.sql`

- **tarjetas**: id, usuario_id, pareja_id, nombre, cierre_dia, vencimiento_dia
- **presupuestos_categoria**: id, usuario_id, pareja_id, categoria, limite_mensual, mes_ref
- **metas**: id, usuario_id, nombre, objetivo, actual, fecha_objetivo, icono
- **transacciones**: columnas `vencimiento_en`, `tarjeta_id` + índices

### 3.2 `20260322100000_tarjetas_estilo.sql`

- **tarjetas**: columnas `banco`, `ultimos_digitos`, `estilo`

### 3.3 `supabase-add-codigo.sql` (si no está en parejas)

- **parejas**: columna `codigo` UNIQUE + índice

### 3.4 `20260323000000_add_es_prestamo.sql`

- **transacciones**: columna `es_prestamo` BOOLEAN DEFAULT false (para marcar préstamos/financiación)

### 3.5 `20260323100000_parejas_rls_policies.sql`

- **parejas**: políticas RLS para INSERT, SELECT y UPDATE. **Requerido** para que "Generar mi código" funcione.

### 3.6 `20260323200000_transacciones_tarjeta_on_delete_set_null.sql`

- **transacciones**: la FK `tarjeta_id` usa `ON DELETE CASCADE`. Al eliminar una tarjeta, se eliminan las transacciones vinculadas a esa tarjeta.

---

## 4. Resumen de tablas finales

| Tabla | Uso principal |
|-------|----------------|
| `auth.users` | Usuarios (Supabase Auth) |
| `parejas` | Vinculación de parejas, códigos |
| `perfiles` | Relación usuario ↔ pareja |
| `transacciones` | Ingresos, gastos, cuotas |
| `tarjetas` | Tarjetas de crédito vinculadas |
| `presupuestos_categoria` | Límites por categoría y mes |
| `metas` | Metas de ahorro |

---

## 5. Extensiones y funciones

- **uuid-ossp** o **gen_random_uuid()** para UUIDs (incluido en Postgres/Supabase)
- **pg_trgm** (opcional) para búsquedas de texto en transacciones

---

## 6. Para futuras actualizaciones

### 6.1 Notificaciones / Recordatorios

```sql
CREATE TABLE IF NOT EXISTS recordatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'vencimiento_tarjeta', 'gasto_fijo', 'meta'
  referencia_id UUID,
  fecha_recordatorio DATE NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT,
  visto BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recordatorios_usuario ON recordatorios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha ON recordatorios(fecha_recordatorio);
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;
```

### 6.2 Historial de escaneos / OCR

```sql
CREATE TABLE IF NOT EXISTS escaneos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archivo_url TEXT,
  tipo_archivo TEXT,
  items_detectados JSONB,
  procesado_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.3 Múltiples monedas

```sql
ALTER TABLE transacciones ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'ARS';
ALTER TABLE transacciones ADD COLUMN IF NOT EXISTS monto_original NUMERIC(15, 2);
```

### 6.4 Integración bancaria (futuro)

```sql
CREATE TABLE IF NOT EXISTS cuentas_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institucion TEXT NOT NULL,
  numero_masked TEXT,
  tipo TEXT,
  conectado_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.5 Categorías personalizadas

```sql
CREATE TABLE IF NOT EXISTS categorias_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  icono TEXT,
  color TEXT,
  es_ingreso BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.6 Preferencias de usuario

```sql
CREATE TABLE IF NOT EXISTS preferencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tema TEXT DEFAULT 'dark',
  moneda_principal TEXT DEFAULT 'ARS',
  notificaciones_activas BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. Checklist de despliegue

- [ ] Proyecto Supabase creado
- [ ] Tabla `parejas` creada (con `codigo` si se usa vinculación)
- [ ] Tabla `perfiles` creada
- [ ] Trigger `handle_new_user` para crear perfil al registrarse
- [ ] Tabla `transacciones` creada
- [ ] Migración `20260322000000` ejecutada
- [ ] Migración `20260322100000` ejecutada
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas de seguridad verificadas
- [ ] Variables de entorno configuradas

---

## 8. Comando para aplicar migraciones

```bash
supabase db push
```

O ejecutar los archivos SQL manualmente en el **SQL Editor** de Supabase Dashboard.
