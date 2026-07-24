# Arquitectura

Fuente de verdad técnica del proyecto. **Gana sobre los prompts de hito y sobre la intuición.**
Si algo acá está mal, se plantea y se corrige este documento — no se contradice en código.

Para geometría, paleta y tipografía: `assets.md`.
Para el contexto de negocio original: `handoff.md`.

---

## Stack

```
Next.js 15 (App Router) + TypeScript + Tailwind
        │
        ├── Server Actions ──► Supabase (Postgres + Storage) vía service role
        ├── Supabase Auth (cookies SSR)
        ├── Route Handler /api/export ──► Playwright (Chromium, mismo contenedor)
        └── lib/images/provider ──► mock | gpt-image-1   (env flag)

Deploy: Railway (Docker, imagen mcr.microsoft.com/playwright)
```

### Por qué Railway y no Vercel

Playwright sobre serverless es el trap clásico de este tipo de MVP: obliga a
`@sparticuz/chromium-min` + `puppeteer-core`, choca contra el límite de bundle, exige `maxDuration`
extendido (plan Pro) y sufre cold starts. Todo eso encima de un catálogo de 48 páginas con imágenes
pesadas — es decir, precisamente sobre la feature estrella de la demo.

La única ventaja de Vercel (DX de edge) no aporta nada a este producto. Su desventaja (no hay
Chromium) es exactamente nuestro core. En Railway con la imagen oficial de Playwright, `page.pdf()`
simplemente funciona: sin hacks, sin timeout de 10s, ~5 USD/mes.

---

## Autorización: server-side, no RLS por fila

Para 2 roles y ~5 usuarios, escribir políticas RLS granulares es tiempo perdido y una fuente de bugs
sutiles. El patrón:

- **RLS activado y en deny-all** para `anon` y `authenticated`, en todas las tablas. El cliente nunca
  toca la DB directamente.
- **Todo el acceso pasa por Server Actions** que usan el service role key (bypassa RLS por diseño) y
  validan sesión y rol *antes* de tocar nada.
- Cada action arranca con `requireRole([...])`. Sin excepción. Ocultar un botón en la UI no es
  autorización.

Esto cumple el espíritu de `handoff.md` §15 (deny-by-default desde cliente, permisos validados en
backend) y se implementa en una tarde.

---

## Modelo de datos

```sql
-- profiles   (NO una tabla "users" paralela: auth.users es la fuente de identidad)
id uuid PK references auth.users(id) on delete cascade
name text not null
contact_email text not null
job_title text not null default ''
phone text not null default ''
role text not null check (role in ('admin','commercial'))
status text not null default 'active' check (status in ('active','inactive'))
created_at, updated_at timestamptz default now()

-- categories
id uuid PK default gen_random_uuid()
name text not null, slug text unique not null
icon_key text, sort_order int not null default 0
created_at, updated_at

-- cuts
id uuid PK, category_id uuid references categories(id) on delete cascade
name text not null, slug text not null
sort_order int not null default 0
unique (category_id, slug)
created_at, updated_at

-- products
id uuid PK
category_id uuid not null references categories(id)
cut_id uuid not null references cuts(id)
eyebrow text, title text not null
code text, brand text, origin text
box_weight text, format text, units text
  -- text, NO numeric: los valores reales son "8 KG (Peso Variable)", "7-8 x caja".
  -- Aceptan \n: es como se resuelve el caso "Pollo Entero" (varios códigos en una ficha).
status text not null default 'draft' check (status in ('draft','active','inactive'))
month_tag text, notes text
created_by uuid references profiles(id), updated_by uuid references profiles(id)
created_at, updated_at
index on (category_id, cut_id), index on (status)

-- product_images
id uuid PK
product_id uuid not null references products(id) on delete cascade
slot text not null check (slot in ('source','main','secondary_1','secondary_2','secondary_3'))
storage_path text not null
status text not null default 'pending' check (status in ('pending','approved','rejected'))
generated_by_ai boolean not null default false
prompt_used text
created_by uuid references profiles(id)
created_at, updated_at

-- Una sola imagen aprobada por slot, garantizado por el motor y no por código de app:
create unique index one_approved_per_slot
  on product_images (product_id, slot) where status = 'approved';

-- image_generation_jobs   (HISTORIAL, no cola)
id uuid PK
product_id uuid references products(id) on delete cascade
requested_slot text, prompt text, model text
status text check (status in ('processing','completed','failed'))
result_image_id uuid references product_images(id)
error_message text
created_by uuid references profiles(id)
created_at, updated_at

-- catalogs
id uuid PK
title text not null, month int not null, year int not null
status text not null default 'draft' check (status in ('draft','ready','exported'))
created_by uuid references profiles(id)
created_at, updated_at

-- catalog_items
id uuid PK
catalog_id uuid not null references catalogs(id) on delete cascade
product_id uuid not null references products(id)
sort_order int not null default 0
unique (catalog_id, product_id)
created_at, updated_at
-- SIN page_number: se deriva al renderizar. Persistido queda obsoleto en cuanto
-- alguien reordena, y no aporta nada.

-- catalog_exports
id uuid PK
catalog_id uuid not null references catalogs(id) on delete cascade
storage_path text not null
created_by uuid references profiles(id)
created_at

-- settings
id uuid PK, key text unique not null, value jsonb not null
created_at, updated_at
-- Guarda: los 4 prompts de generación + generation_daily_limit.
-- NO guarda la API key de OpenAI: esa vive en env.
```

### Diferencias con el modelo de `handoff.md` §12, y por qué

| Cambio | Razón |
|---|---|
| `users` → `profiles` sobre `auth.users` | Nunca una tabla de usuarios paralela con passwords. Supabase Auth es la fuente de identidad; `profiles` solo agrega rol/nombre/estado |
| `image_type` → `slot` + índice único parcial | Garantiza una sola aprobada por slot a nivel de motor |
| Se elimina `catalog_items.page_number` | Se deriva. Persistido se desincroniza al reordenar |
| Se elimina `product_variants` | Decisión: campos multilínea. Se agrega en fase 2 si el cliente lo pide en serio |
| La API key sale de `settings` | Vive en env. Guardarla en Postgres implica cifrado, rotación y un vector de fuga |
| Se agrega `catalog_exports` | El handoff pide historial de exportaciones |

### Storage

Un bucket `product-images`, **público en lectura**, con paths no adivinables:
`{product_id}/{slot}/{uuid}.webp`. Escritura solo por service role.

Es un catálogo comercial, no información sensible; los signed URLs agregan fricción a Playwright sin
comprar seguridad real. *Decisión revisable antes de M4 si Todo Carnes considera el catálogo
confidencial antes de publicarlo — barata ahora, cara después.*

---

## Generación de imágenes

> Los prompts reales, validados por el equipo de diseño, y el mapeo detallado a este esquema viven en
> **`image-playbook.md`**. Esta sección da el marco; el playbook manda para el contenido de los
> prompts.

```
Producto + imagen fuente
        ▼
Usuario elige slot (main | secondary_1 | secondary_2 | secondary_3)
        ▼
buildPrompt(product, slot)   ← prompt autocontenido del slot (settings),
        ▼                       interpolando {{producto}}/{{corte}}/{{categoria}}
lib/images/provider.generate({ prompt, sourceImage, slot })
        ├── MockProvider   (default)  → placeholder con overlay del slot, ~1s
        └── OpenAIProvider (flag)     → gpt-image-1 vía images.edit con la fuente
        ▼
Storage → product_images (status='pending', generated_by_ai=true, prompt_used)
          + fila en image_generation_jobs
        ▼
Aprobar    → status='approved'  (el índice único degrada el previo del slot a 'rejected')
Rechazar   → status='rejected'
Regenerar  → nueva fila 'pending'
Reemplazar → upload manual, generated_by_ai=false
```

### Contrato del provider

```ts
interface ImageProvider {
  generate(input: {
    prompt: string;
    sourceImage: Buffer | null;
    slot: ImageSlot;
  }): Promise<{ buffer: Buffer; model: string }>;
}
```

Mock y OpenAI implementan la misma interfaz. Se selecciona con `IMAGE_PROVIDER=mock|openai`.
**Ningún componente de UI debe saber cuál está activo.** Es un ítem de auditoría.

### Puntos críticos

- **`images.edit`, no `images.generate`.** Con la imagen fuente como referencia. Es el único camino
  para que el empaque, la etiqueta y la marca no se inventen (`handoff.md` §10.3). Si no hay imagen
  fuente, el botón de generar queda deshabilitado con tooltip explicativo.
- **Latencia 30-90s.** Server action con `maxDuration` alto y loading state honesto
  ("Generando, ~1 min"). No hay cola: `image_generation_jobs` es historial.
- **Prompts en español** — los validados por el equipo, en `image-playbook.md`, seedeados en
  `settings` y editables por Admin. Autocontenidos: no hay "prompt base" que se prepende; cada slot
  es completo. Corrige la nota vieja que decía "en inglés": gana la evidencia de lo que ya funciona.
- **`buildPrompt` interpola solo `{{producto}}`/`{{corte}}`/`{{categoria}}`**, no `brand`/`origin`:
  meter marca en el texto empuja al modelo a inventar etiquetas. La fidelidad de marca viene de la
  imagen fuente, no del prompt.
- **Tope diario.** `settings.generation_daily_limit` chequeado contra `count(image_generation_jobs)`
  del día, **server-side**, antes de llamar a OpenAI. Protege la tarjeta de Studio Nomade.
- **Salida landscape 1536×1024**, guardada como webp. Marco main (~2.28:1) y secundarios (~1.6:1)
  recortan con `object-fit: cover`. El mock devuelve la misma orientación para no mentir en el preview.

### Sobre la cuenta de OpenAI

No existe "Sign in with OpenAI" que habilite la API, y **ChatGPT Plus/Pro no dan acceso a la API**:
se factura aparte en `platform.openai.com` con crédito pay-as-you-go y se autentica con una API key
de organización.

Además `gpt-image-1` exige **verificación de organización** (documento de identidad), que se hace una
vez en la plataforma y no se puede delegar desde nuestra app. Es prerrequisito de M6 y puede tardar
días. Por eso M6 va al final y el default es mock: si la verificación no llega, la demo corre igual.

---

## Export PDF

```ts
// Route Handler POST /api/catalogs/[id]/export
export const runtime = 'nodejs';
export const maxDuration = 300;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto(`${APP_URL}/print/${catalogId}?token=${PRINT_TOKEN}`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => (window as any).__CATALOG_READY__ === true, { timeout: 60_000 });
const pdf = await page.pdf({
  width: '20in',
  height: '11.25in',
  scale: 4 / 3,
  printBackground: true,
});
```

### Las cuatro cosas que rompen este export

Requisitos, no consejos. Los cuatro son fallos silenciosos: se ven bien en el navegador y mal en el PDF.

1. **Fuentes.** Montserrat auto-hospedada en `/public/fonts/*.woff2` con `font-display: block`.
   El CDN de Google Fonts hace que Chromium headless renderice con fallback.
2. **Imágenes.** Ninguna imagen de `/print` usa carga lazy. La vista setea
   `window.__CATALOG_READY__ = true` **solo** después de `await document.fonts.ready` y
   `Promise.allSettled([...document.images].map(i => i.decode()))`. `networkidle` por sí solo no
   basta, y una imagen fallida no puede bloquear el catálogo completo.
3. **Paginación.** Cada página es `<section>` de exactamente `1440px × 810px` con
   `break-after: page`. `page.pdf()` define el papel de `20in × 11.25in` y escala el contenido
   `×4/3`, para producir un MediaBox de `1440 × 810 pt`; `@page` solo define `margin: 0`.
   Nada de `height: 100vh` — produce páginas en blanco intercaladas.
4. **Autenticación.** Playwright corre en el server y no tiene la cookie de sesión del usuario.
   `/print/[id]` se protege con un token de env comparado en tiempo constante
   (`crypto.timingSafeEqual`), **no** con Supabase Auth. Es la razón #1 por la que estos exports
   devuelven una página de login dentro del PDF.

### Preview

Las mismas plantillas, envueltas en un contenedor con `transform: scale(k)` y
`transform-origin: top left`. **Un solo set de componentes para preview y PDF.** Si divergen, la
demo miente.

---

## Orden de páginas

Determinístico y derivado. Implementado en `lib/pdf/page-order.ts` como función pura
`(catalog, items) => Page[]` — la única pieza con test unitario obligatorio.

```
1. Portada
2. Índice  (construido desde los productos seleccionados)
3. Por cada categoría con ≥1 producto, en categories.sort_order:
     3a. Separador de categoría (lista los cortes presentes en ESE catálogo)
     3b. Fichas, ordenadas por cuts.sort_order, luego catalog_items.sort_order
4. Cierre
```

El número de página se asigna en este recorrido. El menú superior de cada ficha resalta la categoría
y el corte de ese producto.

---

## Estructura de carpetas

```txt
├─ app/
│  ├─ (auth)/login/
│  ├─ (dashboard)/{dashboard,products,catalogs,settings}/
│  ├─ print/[catalogId]/          ← fuera de (dashboard): sin nav, sin chrome
│  ├─ api/catalogs/[id]/export/
│  └─ layout.tsx
├─ components/
│  ├─ ui/ forms/ products/ catalogs/
│  └─ templates/
│     ├─ CatalogPage.tsx          ← shell 1440×810 + escalado, base de todas
│     ├─ CatalogCover.tsx
│     ├─ CatalogIndex.tsx
│     ├─ CategoryDivider.tsx
│     ├─ ProductPageTemplate.tsx  ← la pieza crítica
│     └─ parts/{CatalogHeader,CutsNav,ProductFieldRow,ProductFooter}.tsx
├─ lib/
│  ├─ supabase/{server,client,admin}.ts   ← admin (service role) solo importable desde server
│  ├─ images/{provider,mock,openai,prompt-builder}.ts
│  ├─ pdf/{export,page-order}.ts
│  ├─ auth/  permissions/  validators/    ← zod
├─ data/seed/
├─ public/{brand,icons,fonts,placeholders}/
├─ styles/print.css
├─ types/
├─ Dockerfile                              ← FROM mcr.microsoft.com/playwright
└─ docs/  prompts/
```

---

## Server Actions y rutas

**Todo son Server Actions salvo el export.** El export es Route Handler porque devuelve un binario y
necesita su propio `maxDuration`.

Cada action arranca con `requireRole([...])` y valida su entrada con zod antes de tocar la DB.

| Módulo | Actions |
|---|---|
| products | `createProduct`, `updateProduct`, `deactivateProduct`, `duplicateProduct`, `listProducts`, `getProduct` |
| images | `uploadSourceImage`, `uploadManualImage`, `generateProductImage`, `approveImage`, `rejectImage` |
| catalogs | `createCatalog`, `updateCatalog`, `deleteCatalog`, `listCatalogs`, `addProductToCatalog`, `removeProductFromCatalog`, `reorderCatalogItems` |
| settings | `updatePromptTemplate`, `upsertCategory`, `upsertCut`, `inviteUser`, `updateUserRole` — todas `requireRole(['admin'])` |

| Route Handler | Método | Nota |
|---|---|---|
| `/api/catalogs/[id]/export` | POST | Playwright. `runtime = 'nodejs'`, `maxDuration = 300` |

`regenerateImage` no existe: es `generateProductImage` otra vez.
`previewCatalog` no existe: es una page, no una action.

---

## Seguridad

**Bloqueantes** — fallan la auditoría:

- API key de OpenAI y service role key: **solo server**. Jamás en un client component, jamás con
  prefijo `NEXT_PUBLIC_`.
- `.env.local` en `.gitignore`. `.env.example` con placeholders. Cero credenciales reales en el repo
  ni en el historial de git.
- RLS activado y deny-all en todas las tablas.
- Rol validado en el servidor en cada action.
- `/print/[id]` protegido por token con comparación en tiempo constante.
- Uploads: whitelist de MIME (`image/jpeg|png|webp`), máx 10MB, nombre generado por nosotros (uuid)
  — nunca el del usuario.
- Tope diario de generación IA validado server-side.

**Deseables:** `created_by`/`updated_by` poblados siempre; headers de seguridad básicos; rate limit
simple en el export.

---

## Fuera de alcance

Del `handoff.md` §18 sin cambios: ERP/SQL Server, stock, precios, cotizaciones, portal de clientes,
e-commerce, aprobaciones multi-paso, firma digital, reportería, multiempresa, notificaciones email,
app móvil, editor drag-and-drop tipo Canva.

**Se añade:**

- Cola de jobs real (BullMQ/Redis). La generación corre síncrona; `image_generation_jobs` es historial.
- Versionado de plantillas. Las plantillas son código, no data.
- Tabla `product_variants`.
- `catalog_items.page_number` persistido.
- Recorte o edición de imagen en la app. `object-fit: cover` y listo.
- i18n. Todo en español; solo los prompts de IA en inglés.
- Tests unitarios exhaustivos. El mínimo exigido está en `audit-checklist.md`.

Esta lista es lo que impide el scope creep. **Si algo de acá aparece implementado, la auditoría lo
devuelve** — aunque esté bien hecho.
