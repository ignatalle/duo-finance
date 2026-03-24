# Despliegue de Duo Finance

Guía para subir la app a producción y usarla en el celular.

---

## 1. Desplegar en Vercel (recomendado)

Vercel es gratuito para proyectos personales y está optimizado para Next.js.

### Paso 1: Subir el código a GitHub

1. Creá un repositorio en [github.com](https://github.com/new)
2. Subí tu código:

```bash
git remote add origin https://github.com/tu-usuario/duo-finance.git
git add .
git commit -m "Deploy ready"
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión (con GitHub)
2. **Add New** → **Project** → elegí el repo `duo-finance`
3. **Configure Project**:
   - Framework Preset: Next.js (detecta solo)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Paso 3: Variables de entorno

En **Settings → Environment Variables** agregá:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key de Supabase |
| `OPENAI_API_KEY` | Tu API key de OpenAI (para escáner IA) |

**Importante:** `DATABASE_URL` solo es para desarrollo local; en Vercel no hace falta si usás Supabase client.

### Paso 4: Deploy

Clic en **Deploy**. En 1–2 minutos tendrás la URL: `https://duo-finance-xxx.vercel.app`

---

## 2. Instalar en el celular (PWA)

Una vez desplegada, la app funciona como **Progressive Web App** y se puede instalar.

### Android (Chrome)

1. Abrí la URL en Chrome
2. Menú (⋮) → **Instalar app** / **Agregar a pantalla de inicio**
3. Confirmá → el ícono aparece en el inicio como una app nativa

### iPhone (Safari)

1. Abrí la URL en **Safari** (no Chrome)
2. Botón **Compartir** (cuadrado con flecha)
3. **Agregar a pantalla de inicio**
4. Editá el nombre si querés → **Agregar**

---

## 3. Íconos (opcional)

Si querés íconos personalizados para la app instalada:

1. Creá dos imágenes PNG: 192×192 y 512×512 px
2. Guardalas en `public/icons/`:
   - `icon-192.png`
   - `icon-512.png`
3. El `manifest.json` ya está configurado para usarlos

Si no hay íconos, el navegador usará uno por defecto.

---

## 4. Dominio personalizado (opcional)

En Vercel: **Settings → Domains** → agregá tu dominio (ej: `duo. mitudominio.com`).

---

## 5. Checklist previo al deploy

- [ ] Supabase configurado (tablas, migraciones, RLS)
- [ ] Variables de entorno listas
- [ ] `npm run build` corre sin errores
- [ ] Probar login/registro en local

---

## Resumen

| Acción | Dónde |
|--------|-------|
| Código | GitHub |
| Hosting | Vercel |
| Base de datos | Supabase (ya configurado) |
| Instalar en celu | PWA desde Chrome (Android) o Safari (iPhone) |
