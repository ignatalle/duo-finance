# Duo Finance

App de finanzas personales en pareja. Next.js, Supabase, Tailwind.

---

## Inicio rápido

```bash
npm install
npm run dev
```

Crear `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Estado del proyecto

### Lo que tenemos

| Módulo | Funcionalidad |
|--------|---------------|
| **Auth** | Login, registro, sesión persistente |
| **Dashboard** | Saldos, gráfico (línea/velas/área), salud, selector de mes |
| **Movimientos** | Listado por fecha, búsqueda, exportar CSV |
| **Gastos y presupuestos** | Ingresos/fijos, límites por categoría, resumen |
| **Tarjetas y cuotas** | Vincular tarjetas, cuotas pendientes, libertad de deuda |
| **Planificación** | Vista del próximo mes, margen libre |
| **Finanzas en pareja** | Código de vinculación, resumen conjunto |
| **Formulario** | Gasto/Ingreso, cuotas, USD→ARS, fecha, propiedad |
| **FAB** | Asistente IA, escanear, gasto, ingreso |

### Lo que falta por hacer

**Alta prioridad**
- Carga Mágica real (IA para parsear "Gasté 15m en nafta")
- Escáner real (OCR de tickets)
- Editar/eliminar en lista de Movimientos
- Asociar tarjeta al registrar gasto en cuotas
- Menú de tarjetas (editar, eliminar)

**Prioridad media**
- Filtros en Movimientos (tipo, categoría)
- Asistente IA conectado a API real
- Reportes en PDF
- Metas de ahorro (UI)

**Prioridad baja**
- Editar/eliminar tarjeta
- Migración `20260322100000` si no está aplicada

### Mejoras futuras

- Modo claro/oscuro
- Notificaciones (vencimientos, cuotas)
- Recordatorios
- Múltiples monedas
- Categorías personalizadas
- Integración bancaria / Open Banking
- Categorización automática con IA
- PWA, tests e2e

---

## Supabase

### Tablas necesarias

| Tabla | Uso |
|-------|-----|
| `auth.users` | Supabase Auth |
| `parejas` | Vinculación, códigos |
| `perfiles` | Usuario ↔ pareja |
| `transacciones` | Ingresos, gastos, cuotas |
| `tarjetas` | Tarjetas de crédito |
| `presupuestos_categoria` | Límites por categoría |
| `metas` | Metas de ahorro |

### Migraciones

1. Crear tablas base: `parejas`, `perfiles`, `transacciones` (+ trigger para crear perfil al registrarse)
2. Ejecutar `supabase/migrations/20260322000000_add_tarjetas_presupuestos_metas.sql`
3. Ejecutar `supabase/migrations/20260322100000_tarjetas_estilo.sql`
4. Ejecutar `supabase/migrations/20260323000000_add_es_prestamo.sql`
5. Ejecutar `supabase/migrations/20260323100000_parejas_rls_policies.sql` (para generar código de vinculación)
6. Ejecutar `supabase/migrations/20260323200000_transacciones_tarjeta_on_delete_set_null.sql` (al eliminar tarjeta, se eliminan sus transacciones)
7. Si aplica: `supabase-add-codigo.sql` (columna `codigo` en parejas)

### Comando

```bash
supabase db push
```

O ejecutar los SQL en el **SQL Editor** del Dashboard de Supabase.

### Documentación completa

Ver **[docs/SUPABASE_REQUERIDO.md](./docs/SUPABASE_REQUERIDO.md)** para:

- Schema SQL de cada tabla
- Trigger de perfiles
- Tablas para futuras actualizaciones (recordatorios, escaneos, preferencias, etc.)
- Checklist de despliegue

---

## Estructura

```
src/
├── app/
│   ├── (auth)/login/
│   ├── dashboard/
│   │   ├── gastos/
│   │   ├── movimientos/
│   │   ├── tarjetas/
│   │   ├── planificacion/
│   │   ├── espacio-compartido/
│   │   ├── reportes/
│   │   └── configuracion/
│   └── actions/         # Server actions
├── components/
│   ├── dashboard/
│   ├── features/
│   │   └── tarjetas/
│   └── ui/
└── lib/
```

---

## Stack

- **Next.js 15** (App Router)
- **Supabase** (Auth, PostgreSQL)
- **Tailwind CSS**
- **date-fns**
- **Lucide Icons**
