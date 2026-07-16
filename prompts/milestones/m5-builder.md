# M5 — Constructor de catálogo

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes", una herramienta interna que
reemplaza la maquetación manual del catálogo comercial mensual. Claude es el tech lead y audita tu
trabajo antes de cada PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/architecture.md` §Orden de páginas, §Export PDF. Y `docs/assets.md`
   §Estructura del catálogo.
3. Mirá `CatalogPage.tsx` y `/api/catalogs/[id]/export` de M1. **Los vas a reusar, no rehacer.**
4. Pedí los assets de marca: íconos de categoría y gráficos de fondo. Ver §Assets, abajo.
5. `git checkout develop && git pull && git checkout -b feature/m5-builder`

## Objetivo

Que un comercial arme un catálogo mensual seleccionando y ordenando productos, y exporte un **PDF
multi-página completo**: portada, índice automático, separadores por categoría y fichas, en el orden
correcto y con la numeración correcta.

Es el hito donde la herramienta pasa a ser la herramienta.

## Alcance

- Server Actions de catálogos
- `/catalogs` — listado
- `/catalogs/[id]` — el constructor
- **`lib/pdf/page-order.ts`** — función pura. La única pieza con test unitario obligatorio
- `CatalogCover.tsx`, `CatalogIndex.tsx`, `CategoryDivider.tsx`
- `/print/[catalogId]` real, desde DB
- `/catalogs/[id]/preview`
- Export multi-página → Storage + `catalog_exports`

## Fuera de alcance

- Editor drag-and-drop de plantillas tipo Canva. Se ordenan productos, no se mueven cajas
- Reordenar categorías dentro del catálogo. El orden lo da `categories.sort_order`
- Plantillas alternativas de ficha
- Duplicar un catálogo del mes anterior. Tentador y no pedido — si el cliente lo pide en la demo,
  mejor: es una venta para fase 2
- Versionado de catálogos

## Especificación

### `page-order.ts` — empezá por acá

```ts
export function buildPages(catalog: Catalog, items: CatalogItemWithProduct[]): Page[]
```

**Función pura.** Sin DB, sin fetch, sin `Date.now()`. Entra data, sale un array de páginas.

```
1. Portada
2. Índice  (construido desde los productos seleccionados)
3. Por cada categoría con ≥1 producto, en categories.sort_order:
     3a. Separador de categoría (lista los cortes presentes en ESE catálogo)
     3b. Fichas, ordenadas por cuts.sort_order, luego catalog_items.sort_order
4. Cierre
```

El número de página se asigna en este recorrido.

Es la única pieza con **test unitario obligatorio**. Casos a cubrir: catálogo vacío, una categoría,
todas las categorías, categoría sin productos (no debe generar separador), dos productos del mismo
corte, reordenar cambia la salida.

Es pura justamente para que puedas testearla sin levantar nada. Si te encontrás mockeando Supabase
para testearla, la hiciste impura.

### El constructor `/catalogs/[id]`

- Selector de productos **activos** (no draft, no inactive)
- Reordenar por drag dentro de cada categoría
- Agrupación por categoría, automática — no la elige el usuario
- Contador de productos y de páginas estimadas
- Botón de preview y botón de exportar

Para el drag: `@dnd-kit` es la opción sana. Es la primera dependencia de UI del proyecto — si usás
otra cosa, justificá.

`reorderCatalogItems` actualiza los `sort_order` en batch, en una transacción. No una action por
item.

### Plantillas nuevas

Las tres usan `CatalogPage` de M1. **No lo reimplementes.**

- **`CatalogCover`** — logo, mes/año del catálogo, texto institucional, fondo navy con gráficos
- **`CatalogIndex`** — categorías con íconos y los cortes activos. **Derivado de los items del
  catálogo**, no una lista fija
- **`CategoryDivider`** — nombre de categoría, ícono, lista de cortes **presentes en ese catálogo**,
  fondo navy

Referencia visual: el PDF de julio en `-context/`. Fidelidad al nivel de M1.

### Assets

Faltan (ver `docs/assets.md` §Assets que faltan): íconos de categoría, gráficos de fondo de portada y
separador, y el copy institucional de portada y cierre.

**Pedilos antes de empezar.** Si no llegan: maquetá con placeholders evidentes, dejá el copy en
constantes de un solo archivo, y reportálo. No inventes el texto institucional de la portada — va a
terminar frente al cliente.

### `/print/[catalogId]` real

Reemplaza el hardcodeo de M1. Lee de DB, corre `buildPages`, renderiza todas las páginas.

Mantené intacto lo que M1 dejó funcionando:
- El token de `PRINT_TOKEN`, **no** Supabase Auth. Playwright no tiene la cookie del usuario
- `window.__CATALOG_READY__` tras `document.fonts.ready` + `img.decode()` de **todas** las imágenes.
  Con 48 páginas esto importa mucho más que con una

### Export

Extiende el de M1. Al terminar: subir el PDF a Storage, fila en `catalog_exports`,
`catalogs.status='exported'`.

Subí el `maxDuration` si hace falta: 48 páginas con imágenes tarda.

## Definición de terminado

- [ ] `npm run build` y `tsc --noEmit` limpios. Cero `any`
- [ ] `npm test lib/pdf/page-order.test.ts` pasa, con los casos de arriba
- [ ] Crear catálogo → seleccionar productos → ordenar → **exportar PDF multi-página**
- [ ] El orden del PDF respeta `categories.sort_order` → `cuts.sort_order` → `sort_order`
- [ ] **Reordenar en el constructor → reexportar → el orden cambió en el PDF**
- [ ] El índice se construye desde los productos seleccionados, no de una lista fija
- [ ] Una categoría sin productos no genera separador
- [ ] La numeración de página es correcta y automática
- [ ] Todas las páginas miden 1440×810. **Sin páginas en blanco intercaladas**
- [ ] Montserrat en el PDF (`pdffonts`)
- [ ] El catálogo exportado aparece en `catalog_exports` y el status quedó en `exported`

## Trampas conocidas

1. **Hacer `page-order.ts` impura** (que consulte la DB adentro). Se vuelve intesteable y es la única
   lógica que realmente necesita test. Entra data, sale array.
2. **Un `sort_order` por item en actions separadas** → N requests y estado inconsistente si una falla.
   Batch, en transacción.
3. **Reimplementar el shell de página** en vez de usar `CatalogPage` de M1. Se desincronizan las dos
   y el PDF deja de coincidir con el preview.
4. **Índice hardcodeado** con las 4 categorías. Tiene que derivarse: si el catálogo de agosto no
   tiene Vacuno, el índice no lo lista.
5. **Olvidar que `__CATALOG_READY__` ahora espera 48 páginas de imágenes.** Subí el timeout. Un
   export que devuelve cajas vacías de forma intermitente es peor que uno que falla.
6. **Inventar el copy institucional de la portada.** Pedilo.
7. **Agregar "duplicar catálogo del mes pasado".** No está pedido. Es la mejor venta de fase 2 —
   no la quemes gratis.

## Entrega

Commiteá en `feature/m5-builder` con prefijo `m5:`. **No abras el PR.**

Reportá: qué hiciste, el PDF multi-página completo, el output de los tests de `page-order`, evidencia
de que reordenar cambia el PDF, qué assets te faltaron, desviaciones, y qué te preocupa.

Claude audita el diff local y autoriza el PR.
