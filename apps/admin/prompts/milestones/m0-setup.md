# M0 — Setup

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes", una herramienta interna que
reemplaza la maquetación manual del catálogo comercial mensual. Claude es el tech lead y audita tu
trabajo antes de cada PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/architecture.md` (§Stack, §Estructura de carpetas) y `docs/assets.md`
   (§Tipografía, §Paleta).
3. `git checkout develop && git pull && git checkout -b feature/m0-setup`

## Objetivo

Que exista una app Next.js desplegada en una URL pública, renderizando "hello world" en Montserrat
auto-hospedada, dentro de un contenedor que tiene Chromium listo para Playwright.

Suena trivial. No lo es: el Dockerfile con Playwright y las fuentes locales son exactamente las dos
cosas que M1 necesita y que fallan tarde si se hacen mal.

## Alcance

- `create-next-app`: TypeScript, Tailwind, App Router, ESLint
- Estructura de carpetas de `docs/architecture.md`
- Montserrat local en `/public/fonts` + `@font-face`
- Tokens de color en `tailwind.config.ts`
- `Dockerfile` con base de Playwright
- Deploy a Railway
- `.env.example` (ya existe en la raíz — verificá que esté completo, no lo rehagas)

## Fuera de alcance

No toques nada de esto:

- Supabase, base de datos, auth, login
- Cualquier plantilla del catálogo (es M1)
- El endpoint de export (es M1)
- CRUD, formularios, pantallas de la app
- Librerías de UI (shadcn, Radix, etc.). Tailwind pelado alcanza — si M3 las necesita, se agregan ahí

## Especificación

### Next.js

```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir=false --import-alias="@/*"
```

Creá los directorios vacíos de `docs/architecture.md` §Estructura de carpetas con un `.gitkeep`.
No inventes archivos dentro.

### Montserrat — el punto que importa

Pesos: **300, 400, 500, 600, 700**. Formato **woff2**. En `/public/fonts/`.

```css
@font-face {
  font-family: 'Montserrat';
  src: url('/fonts/Montserrat-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: block;   /* NO swap */
}
/* ...uno por peso */
```

**No uses `next/font/google` ni el CDN de Google Fonts.** Chromium headless renderiza con la fuente
fallback antes de que el CDN responda, y el PDF que exporta M1 sale con la tipografía equivocada. Se
ve bien en el navegador y mal en el PDF: es un fallo silencioso y lo vas a descubrir tarde.

`font-display: block` y no `swap`, por la misma razón: queremos que espere, no que muestre un
fallback.

Descargá los woff2 desde el repo oficial de Google Fonts y commiteálos. Son ~30KB cada uno.

### Tokens de color

En `tailwind.config.ts`. Valores de `docs/assets.md` §Paleta:

```ts
colors: {
  navy:      '#0d244f',
  blue:      '#8ab1fd',
  'blue-mid':'#98c0fd',
  'blue-50': '#eff4fe',
  'gray-50': '#f8f8f9',
  ink:       '#424242',
}
```

A partir de acá, **cero hex sueltos en el JSX**. Es un ítem de auditoría permanente.

### Dockerfile

```dockerfile
FROM mcr.microsoft.com/playwright:v1.49.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Usá la versión de Playwright que instales — la de la imagen y la del `package.json` **deben
coincidir**, o Playwright va a buscar un Chromium que no está.

Instalá `playwright` como dependencia (no `puppeteer`, no `@sparticuz/chromium`).

### Deploy

Railway, apuntando al repo, build por Dockerfile. Variables de entorno: por ahora solo `APP_URL` y
`PRINT_TOKEN` (generá uno con `openssl rand -hex 32`).

Si no tenés acceso a Railway, dejá el Dockerfile listo y reportálo — Sebastián conecta el deploy.

### Página de prueba

`app/page.tsx`: un h1 en Montserrat 700 y un párrafo en 300, sobre un fondo `navy`. Suficiente para
verificar que la fuente y los tokens cargan. **Se borra en M1**, no le pongas cariño.

## Definición de terminado

- [ ] `npm run build` y `tsc --noEmit` limpios
- [ ] `npm run dev` levanta y la home muestra Montserrat (no Arial/Helvetica)
- [ ] Los 5 woff2 están commiteados en `/public/fonts`
- [ ] `grep -rn "fonts.googleapis\|next/font" app/ components/` → vacío
- [ ] `tailwind.config.ts` tiene los 6 tokens
- [ ] `docker build .` completa sin error
- [ ] La app responde en una URL pública de Railway (o el Dockerfile está listo y reportaste el bloqueo)
- [ ] `.env.example` sin un solo valor real

## Trampas conocidas

1. **`next/font/google` parece la opción correcta y no lo es.** Descarga en build time, pero el
   resultado depende de la red del build y no te da control sobre `font-display`. Auto-hospedá los
   woff2 y listo.
2. **`font-display: swap`** (el default de casi todos los ejemplos) hace que Chromium pinte con el
   fallback. Tiene que ser `block`.
3. **Versión de Playwright ≠ versión de la imagen Docker** → "Executable doesn't exist at
   /ms-playwright/chromium-XXXX". Fijá las dos al mismo número.
4. **Instalar puppeteer "por las dudas"**. No. `architecture.md` dice Playwright.
5. **Traer shadcn/ui en el setup** porque "siempre se usa". Es scope creep. Cuando M3 necesite un
   componente, se decide ahí.

## Entrega

Commiteá en `feature/m0-setup` con prefijo `m0:`. **No abras el PR.**

Reportá: qué hiciste, la URL del deploy (o el bloqueo), una captura de la home mostrando Montserrat,
y cualquier desviación con su razón. Claude audita el diff local y autoriza el PR.
