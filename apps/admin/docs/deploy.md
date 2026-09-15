# Deploy — Supabase + Railway (enlace en vivo para el cliente)

Guía para sacar el prototipo a producción con una URL pública que se le comparte a Todo Carnes.
Stack: Next.js en **Railway con Docker** (no Vercel — Playwright no corre en serverless), datos en
**Supabase** remoto.

> El `Dockerfile` vive en `apps/admin/Dockerfile` y el contexto de build es la raíz del monorepo. La
> imagen base `mcr.microsoft.com/playwright:v1.61.1-jammy` trae Chromium y sus dependencias, así que el
> export del PDF funciona sin configurar nada más. Si algún día subís la versión de `playwright` en
> `apps/admin/package.json`, actualizá el tag del `Dockerfile` para que coincida.

---

## 1. Supabase (el proyecto ya existe)

El proyecto remoto ya está creado y linkeado. La configuración y las migraciones viven en
`packages/db/supabase`. Para un entorno nuevo, crealo en supabase.com y linkealo desde
`packages/db` con `pnpm exec supabase link --project-ref <ref>`.

1. **Aplicar las migraciones** (crea tablas, RLS, triggers y los buckets de storage):

   ```bash
   pnpm --filter @todocarnes/db db:push
   ```

   Verificá que quede en cero pendientes:

   ```bash
   pnpm --filter @todocarnes/db db:migration:list
   ```

   Para regenerar los tipos cuando el proyecto esté autenticado y linkeado:

   ```bash
   pnpm --filter @todocarnes/db db:types
   ```

   El comando escribe `packages/db/src/types.ts`. H0.1 deja el script preparado; no requiere
   generar ni versionar tipos nuevos para completar la migración estructural.

2. **Sembrar los datos de demo** (categorías, cortes, productos, catálogo armado y **los usuarios**):

   ```bash
   pnpm --filter catalog-builder seed
   ```

   > ⚠️ **Rotá las credenciales del seed antes de un deploy real.** Las de `.env.local`
   > (`SEED_ADMIN_*`, `SEED_COMMERCIAL_*`) se filtraron a logs en un bug temprano. Cambiá las
   > contraseñas en `.env.local` antes de correr el seed contra el entorno que va a ver el cliente.

3. **Buckets de storage** (los crean las migraciones — solo verificá la visibilidad):
   - `product-images` → **público** (las imágenes de producto se sirven por URL pública).
   - `catalog-exports` → **privado** (PDFs exportados; límite 100 MiB).
   - `catalog-assets` → **privado** (logos de cliente; se sirven con URL firmada).

---

## 2. Railway

1. **Nuevo proyecto** → *Deploy from GitHub repo* → elegí `Studio-Nomade/todocarnes`, rama `main`
   (o `develop` si querés mostrar lo último). En Railway dejá **Root Directory** en la raíz del repo
   y configurá el Dockerfile path como `apps/admin/Dockerfile`.
2. **Variables de entorno** (Settings → Variables) — ver la tabla de abajo.
3. **Deploy.** El primer build tarda (baja la imagen de Playwright, ~1–2 GB).
4. **Generar el dominio**: Settings → Networking → *Generate Domain*. Copiá la URL pública
   (`https://<algo>.up.railway.app`).
5. **Cerrar el lazo del export**: seteá `APP_URL` con esa URL pública y **redesplegá**. El export
   lanza Chromium que navega a `APP_URL/print/...`; si `APP_URL` está mal, el PDF sale vacío o falla.

---

## 3. Variables de entorno

| Variable | Valor | Nota |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Del panel de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | Pública |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key | **Secreta** — solo server-side |
| `APP_URL` | la URL pública de Railway | La usa el export para llegar a `/print` |
| `PRINT_TOKEN` | string aleatorio largo | **Secreta** — protege `/print`. Generá una nueva, no reuses la de dev |
| `IMAGE_PROVIDER` | `mock` | `mock` para la demo (no gasta API). `openai` para generación real |
| `OPENAI_API_KEY` | key de OpenAI | Solo si `IMAGE_PROVIDER=openai` y el pago está aprobado |

> `APP_URL` puede apuntar a la propia URL pública. Si preferís evitar el ida-y-vuelta por internet,
> podés usar `http://localhost:3000` **solo si** fijás `PORT=3000` en Railway (por defecto Railway
> inyecta un `PORT` dinámico, y ahí `localhost:3000` no sirve).

---

## 4. Verificación post-deploy

1. Abrí la URL pública → redirige a `/login`.
2. Entrá con el admin sembrado. Confirmá que carga el dashboard.
3. **El momento**: abrí un catálogo → *Exportar PDF*. Tiene que bajar en ~10–20 s, 1440×810,
   sin páginas en blanco.
4. Si `IMAGE_PROVIDER=openai`, generá una imagen de prueba.
5. Como admin, entrá a **Usuarios** y creá un comercial de prueba; verificá que puede iniciar sesión
   y ver sus catálogos. (Requiere la migración `20260803000000` aplicada — ver §1.)

---

## 5. Trampas conocidas

- **Playwright en serverless no corre** → por eso Railway con Docker, nunca Vercel.
- **`APP_URL` mal seteada** → export vacío o colgado. Es el error más común; verificá el paso 2.5.
- **Bucket privado servido como público** → el logo del cliente no aparece en el PDF. `catalog-assets`
  debe ser privado y servirse firmado (ya está así en el código).
- **Credenciales del seed sin rotar** → cualquiera con los defaults entra. Rotalas (§1.2).
- **`PRINT_TOKEN` reutilizada de dev** → generá una nueva para producción.
- **Alta de usuarios sin la migración `20260803000000`** → el trigger falla con error 500 al crear el
  perfil. Aplicá todas las migraciones antes de usar el mantenedor de usuarios.
