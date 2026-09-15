# M1 — Plantilla de ficha + Export PDF

> **El hito crítico del proyecto.** Todo lo demás depende de que la fidelidad visual y el export
> funcionen. Por eso va antes que el CRUD: si esto no sale, hay que saberlo ahora y no en la última
> semana.

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes", una herramienta interna que
reemplaza la maquetación manual del catálogo comercial mensual. Claude es el tech lead y audita tu
trabajo antes de cada PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/assets.md` **completo**. Es el documento central de este hito.
3. Leé `docs/architecture.md` §Export PDF.
4. Pedí el SVG de referencia (`Todo Carnes - Catálogo v01.svg`). Vive en `-context/`, que no se
   versiona. **Sin el SVG no podés hacer este hito.**
5. `git checkout develop && git pull && git checkout -b feature/m1-template-pdf`

## Objetivo

Que exista un endpoint que descargue un PDF de **una** ficha de producto, tipografiada en Montserrat,
que superpuesta al SVG de referencia calce.

Sin base de datos, sin auth, con datos hardcodeados.

## Alcance

- `components/templates/CatalogPage.tsx`
- `components/templates/ProductPageTemplate.tsx`
- `components/templates/parts/` — los subcomponentes que necesites
- `styles/print.css`
- `app/print/[catalogId]/page.tsx` con un producto hardcodeado
- `app/api/catalogs/[id]/export/route.ts`
- Borrar la home de prueba de M0

## Fuera de alcance

No toques nada de esto, aunque parezca natural:

- Supabase, base de datos, auth, login
- CRUD de productos, formularios
- **Portada, índice, separador de categoría** — son M5. Solo la ficha
- Generación de imágenes
- Cualquier pantalla de la app fuera de `/print`
- Multi-página. Una ficha, una página

## Especificación

### Lienzo: 1440 × 810

**No 1920×1080.** El SVG se presenta a 1920 pero su `viewBox` es `0 0 1440 810`, y el MediaBox del
PDF original es `0 7.92 1440 817.92`. El handoff dice 1920×1080 y está equivocado: es el mismo 16:9 a
escala 1.333.

Trabajá en 1440×810.

### Geometría

En `docs/assets.md` §Geometría de la ficha. Está en coordenadas absolutas sobre el lienzo.

**Las 3 imágenes secundarias:** usá `x = 510 / 802 / 1094`, ancho 272, alto 169, y = 591. El SVG trae
`806.98` y `1094.09` con gaps desiguales de 24px y 16px — es un descuadre del arte original, no lo
copies. La grilla normalizada da tres cajas de 272 con gaps exactos de 20 terminando en 1366.

### Método de maquetado — importa el orden

1. **Esqueleto de cajas primero**: divs con fondo de color plano en las posiciones de `assets.md`.
   Sin contenido, sin texto, sin imágenes.
2. **Superponé al SVG** en el navegador: mismo lienzo, el SVG encima a 50% de opacidad. Ajustá hasta
   que calce.
3. **Recién ahí** metés contenido y calibrás tipografía.

Al revés se pierde un día. Los tamaños de fuente y pesos por elemento **no están en `assets.md`**
porque no se pueden extraer: todo el texto del SVG está vectorizado (0 elementos `<text>`). Se
calibran a ojo, y eso solo funciona si las cajas ya están bien.

### Tipografía

Montserrat auto-hospedada, ya instalada en M0. Si no está, ese es un bug de M0 — reportálo.

**No uses `next/font/google` ni el CDN.** Chromium headless renderiza con fallback y el PDF sale con
la tipografía equivocada.

### Colores

Solo tokens de Tailwind: `navy`, `blue`, `blue-mid`, `blue-50`, `gray-50`, `ink`.
**Cero hex sueltos en el JSX.**

### `CatalogPage.tsx`

El shell que usan todas las páginas del catálogo, ahora y en M5.

- `<section>` de **exactamente** 1440×810 px. No `100vw`, no `100vh`, no `aspect-ratio`
- `break-after: page`
- Prop `scale?: number` para el preview en pantalla: `transform: scale(k)` +
  `transform-origin: top left`

**El mismo componente sirve preview y PDF.** Si divergen, la demo miente y la auditoría lo devuelve.

### `ProductPageTemplate.tsx`

Contrato — cada punto es un ítem de auditoría:

- Título largo (60+ caracteres) hace **wrap sin desbordar** su caja
- Campo vacío o `null` renderiza **`—`**. Nunca `undefined`, nunca caja rota
- Valores con `\n` se renderizan **como lista dentro de la misma fila**. Es el caso "Pollo Entero":
  una ficha con varios códigos. Por eso los campos son `text` y no `numeric`
- Imágenes con `object-fit: cover`
- El header resalta la categoría activa; la sub-nav resalta el corte activo

Los 6 campos técnicos, en orden: Código, Marca, Procedencia, Peso Caja, Formato, Unidades.

### `styles/print.css`

```css
@page { size: 1440px 810px; margin: 0; }
```

### `app/print/[catalogId]/page.tsx`

Sin nav, sin layout de app, sin nada. Está fuera de `(dashboard)` por eso.

Producto hardcodeado (el ejemplo real de `docs/handoff.md` §7):

```
Categoría:    Cerdo
Corte:        Costillar
Eyebrow:      Costillar Brasil
Título:       Costillar de Cerdo Notable
Código:       CF-1608
Marca:        Notable
Procedencia:  Brasil
Peso Caja:    8 KG (Peso Variable)
Formato:      Vacío
Unidades:     7-8 x caja
```

Imágenes: placeholders de `/public/placeholders`.

**La señal de listo:**

```ts
await document.fonts.ready;
await Promise.all([...document.images].map(img => img.decode()));
(window as any).__CATALOG_READY__ = true;
```

**La protección:**

```ts
// PRINT_TOKEN desde env, comparado con crypto.timingSafeEqual
```

Playwright corre en el server y **no tiene la cookie de sesión del usuario**. Si protegés `/print`
con Supabase Auth, el PDF va a salir con la página de login adentro. Es la razón #1 por la que estos
exports fallan.

### `app/api/catalogs/[id]/export/route.ts`

```ts
export const runtime = 'nodejs';
export const maxDuration = 300;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto(`${APP_URL}/print/${catalogId}?token=${PRINT_TOKEN}`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => (window as any).__CATALOG_READY__ === true, { timeout: 60_000 });
const pdf = await page.pdf({
  width: '1440px',
  height: '810px',
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
```

Cerrá el browser en un `finally`. Un Chromium colgado por request tumba el contenedor.

## Definición de terminado

- [ ] `npm run build` y `tsc --noEmit` limpios. Cero `any`, cero `@ts-ignore`
- [ ] `POST /api/catalogs/demo/export` descarga un PDF de **1 página de exactamente 1440×810**
- [ ] `pdffonts salida.pdf` lista Montserrat, no un fallback
      *(`brew install poppler` si no lo tenés)*
- [ ] **Captura de la plantilla superpuesta al SVG, adjunta al reporte.** Es el gate del hito
- [ ] Un título de 60 caracteres no desborda
- [ ] Un campo en `null` muestra `—`
- [ ] Un campo con `\n` renderiza como lista
- [ ] `/print` sin token devuelve 401
- [ ] `grep -rn "#[0-9a-fA-F]\{6\}" components/` → vacío (colores por token)
- [ ] Las secundarias están en 510/802/1094

## Trampas conocidas

Las cinco son fallos silenciosos: se ven bien en el navegador y mal en el PDF.

1. **Google Fonts CDN** → PDF con tipografía equivocada. Auto-hospedá.
2. **`waitUntil: 'networkidle'` no alcanza.** No garantiza que las imágenes estén *decodificadas* ni
   que las fuentes estén listas. Por eso existe `__CATALOG_READY__`. Si lo omitís, el PDF sale con
   cajas vacías de forma intermitente — y lo peor es que a veces funciona.
3. **`height: 100vh` en vez de 810px fijo** → páginas en blanco intercaladas. El viewport y la página
   PDF no son la misma unidad.
4. **Proteger `/print` con la sesión** → PDF con el login adentro.
5. **Maquetar "a ojo" contra el SVG desde el principio.** Esqueleto de cajas → superponer →
   contenido. En ese orden. Al revés se pierde un día.

## Entrega

Commiteá en `feature/m1-template-pdf` con prefijo `m1:`. **No abras el PR.**

Reportá:
1. Qué hiciste
2. **La captura de superposición contra el SVG** y el PDF de salida
3. El output de `pdffonts`
4. Desviaciones y su razón
5. Qué te preocupa de cara a M5, que va a reusar `CatalogPage`

Claude audita el diff local y autoriza el PR.
