# M7 — Polish para la demo

> **El último hito.** No agrega arquitectura nueva: cierra bugs, calibra lo visual, y suma la capa de
> presentación que convierte el MVP en algo que se muestra sin vergüenza en una reunión. Es grande —
> ~20 ítems — así que está ordenado por prioridad: **primero los bugs (bloquean la demo), después
> calibración, después features de presentación.**

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes". Claude es el tech lead y
audita tu trabajo antes del PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/tasks.md` §Criterios de aceptación y `docs/assets.md` (geometría, paleta, **los assets
   nuevos**).
3. Conseguí el PDF de julio (`-context/`) para calibrar, y mirá `-context/elementos/` (fondos + logos
   de Studio Nomade).
4. `git checkout develop && git pull && git checkout -b feature/m7-polish`

## Objetivo

Que un comercial de Todo Carnes que nunca vio la herramienta complete el flujo entero sin ayuda, que
el PDF exportado se pueda poner al lado del catálogo de julio sin que incomode, y que la plataforma
muestre el potencial de Studio Nomade más allá del catálogo.

## Fuera de alcance

- Arquitectura nueva o cambios de esquema **salvo lo que este prompt pida explícitamente** (el editor
  de variantes usa los campos existentes, no una tabla nueva — ver G).
- Features que no estén acá. Si aparece una idea, va a `docs/tasks.md` como fase 2.
- Refactors grandes sin bug detrás.
- La marca de agua de Studio Nomade **no va en el PDF del catálogo** (ver H).

---

## A. Bugs — arreglalos primero, bloquean la demo

Cada uno viene con el diagnóstico. Arreglá la causa, no el síntoma.

**A1 — La raíz `/` da 404.** No hay `app/page.tsx` (se borró en M1). *Ya está resuelto por Claude* con
un redirect `/ → /dashboard` (el middleware manda a `/login` si no hay sesión). Verificá que el
archivo esté y funcione; si no, recrealo.

**A2 — Los filtros de `/products` tiran error.** El form es GET y manda params vacíos
(`category=&cut=&status=`). `productFiltersSchema` valida `category`/`cut` como `uuid` y `status` como
enum, pero `""` no es `undefined`, así que `.optional()` no aplica y el `parse` explota. **Fix:**
preprocesá los strings vacíos a `undefined` antes de validar (en el schema, con `z.preprocess` o un
`.transform`, o normalizando en la page antes de `listProducts`). Probá: filtrar por categoría, por
estado, y limpiar — ninguno debe romper.

**A3 — La miniatura del listado siempre muestra el placeholder.** `ProductTable` tiene
`src="/placeholders/product-placeholder.svg"` hardcodeado (Panceta Campo Frío y CF-1608 tienen
imágenes cargadas y aun así salen sin imagen). **Fix:** `listProducts` tiene que traer la URL de la
imagen aprobada del slot `main` de cada producto (mismo patrón que `getCatalogProducts` en
`lib/catalogs/data.ts`), y `ProductTable` la usa, cayendo al placeholder solo si no hay.

**A4 — El cuadro "Agregar productos" del constructor rompe la página** (se desborda / se corta a la
derecha). Es un problema de layout de `CatalogBuilder` (el grid `lg:grid-cols-[1fr_320px]` + el
`aside sticky`). Ajustalo para que el panel no se salga ni corte el contenido, en desktop y en
pantallas angostas.

**A5 — El footer de la ficha superpone la línea sobre el mes.** En `ProductFooter`, la línea
(`left-[278px]`) se monta sobre el texto "CATÁLOGO JULIO 2026" (`left-[31px]`, tracking ancho). **Fix:**
que la línea arranque después del texto (medí el ancho real del texto con su tracking, o usá un
layout flex en vez de posiciones absolutas fijas).

---

## B. Calibración visual de la ficha y el PDF

Referencia: el PDF de julio. Compará rasterizando (`pdftoppm`), no a ojo en pantalla.

**B1 — Logo del header con recuadros.** `CatalogHeader` usa `todo-carnes.png` (el PNG viejo con
recuadros visibles en el PDF). Reemplazalo por `logo_completo.png` — o, si no calza en el slot
horizontal del header (321×67), usá solo el isotipo `isologo_completo.png` + el wordmark en texto.
El objetivo: que el logo del header se vea limpio, sin cajas.

**B2 — Título largo rompe la diapo.** Hoy `ProductPageTemplate` tiene un salto binario (>50 chars →
24px, si no 40px). "Pechuga con Hueso Individual Languiru" se desborda sobre los campos. **Fix:**
tamaño de fuente **graduado** según el largo del título (varios cortes, o un auto-fit), de modo que
cualquier título quede dentro de su caja (`w-[380px]`, alto acotado) sin pisar el eyebrow ni los
campos. Probá con títulos de 20, 40, 60 y 80 caracteres.

**B3 — Valores en MAYÚSCULAS y vacío = `N/A`.** El catálogo real muestra los valores de campo en
mayúsculas (`LITERA MEAT`, `ESPAÑA`, `18 KG APROX`) y usa `N/A` para vacío, no `—`. Aplicá
`text-transform: uppercase` a los valores (el dato se guarda con su case natural) y cambiá el
placeholder de vacío de `—` a `N/A` en `ProductFieldRow`. Actualizá también el ítem del
`audit-checklist.md` si hace falta.

**B4 — Posición del divisor.** En el catálogo real el divisor va **entre el título y los campos**;
hoy está entre el eyebrow y el título. Movelo.

**B5 — Fondos de portada y separador.** En `-context/elementos/` hay `Fondo 01.webp` (swirl a la
derecha → portada) y `Fondo 02.webp` (swirl a la izquierda → separador de categoría), ambos 16:9
navy. Copialos a `/public/brand/` con nombres sin espacios (ej. `cover-bg.webp`, `divider-bg.webp`) y
usalos como fondo en `CatalogCover` y `CategoryDivider`, reemplazando los círculos provisorios.
**Con `priority` (no lazy)** — regla de M5: ninguna imagen de `/print` es lazy.

---

## C. Constructor — tarjetas de categoría expansibles

En `CatalogBuilder`, cada categoría es una tarjeta que se **expande/colapsa**. Colapsada muestra solo
la cabecera: nombre de la categoría + cantidad de productos. Expandida muestra la lista con
subir/bajar/quitar. Así, con muchos productos en una categoría, se puede ver solo el resumen. Estado
local por tarjeta (no hace falta persistir).

---

## D. Estado de catálogos — etiquetas claras

En `/catalogs`, la columna Estado no se entiende (`draft`/`ready`/`exported` con labels crudos).
Relabelá a algo legible para el comercial:

| status DB | Etiqueta |
|---|---|
| `draft` | Borrador |
| `ready` | En revisión |
| `exported` | Publicado |

Aplicá el mismo mapeo en el badge del constructor y donde aparezca el estado. (Los valores de DB no
cambian, solo las etiquetas visibles.)

---

## E. Nombre del PDF exportado

Hoy el archivo baja como `catalogo-{uuid}.pdf`. Cambialo a:

```
AAMMDD_Catalogo Oficial Todo Carnes - {Mes}.pdf
```

Ejemplo: `260724_Catalogo Oficial Todo Carnes - Julio.pdf` (AAMMDD = fecha de exportación; Mes = el
mes del catálogo, en texto). Cambiá el `Content-Disposition` del route handler **y** el `download`
del `ExportButton` (los dos deben coincidir). Ojo con los caracteres en el header HTTP: si el nombre
con espacios da problemas, usá `filename*=UTF-8''...` correctamente.

---

## F. Editor de variantes — el ítem más grande

Productos como "Pollo Entero" tienen **varios códigos, formatos, pesos y unidades** en una ficha (el
catálogo real los muestra como una tabla: unidades | código | peso, una fila por variante). Hoy son 4
textareas multilínea sueltas y desalineadas.

**Sin cambiar el esquema.** Los campos `code`, `format`, `box_weight`, `units` siguen siendo texto
multilínea; cada **línea N** de cada campo es la **variante N**. El trabajo es de UX + render:

1. **Editor (`ProductFormFields`):** en vez de 4 textareas, un editor de **filas de variante**
   repetibles. Cada fila tiene código / formato / peso caja / unidades. Un botón "Agregar variante"
   suma una fila (y por lo tanto una línea a cada uno de los 4 campos); "Quitar" la elimina. Al
   guardar, cada columna se serializa a su campo `\n`-joineado (fila 1 → línea 1 de cada campo).
   Al cargar un producto existente, se hace el split inverso (líneas → filas). Un producto simple es
   una sola fila.
2. **Ficha (`ProductPageTemplate`):** cuando un producto tiene **más de una variante** (los campos
   tienen `\n`), renderizá esos 4 campos como una **tabla alineada** (columnas unidades/código/peso),
   como la página de Pollo Entero del catálogo real, no como 4 listas verticales separadas. Con una
   sola variante, se mantiene el layout actual de filas.

Es el ítem de mayor esfuerzo; si tenés que secuenciar, hacelo después de los bugs y la calibración.
Si te traba, reportalo — no lo dejes a medias en silencio.

> Nota de arquitectura (Claude): esto es el caso "Pollo Entero" que en su momento diferimos a
> `product_variants`. La solución de arriba (filas ↔ líneas, sin tabla nueva) es la de MVP y alcanza.
> La tabla relacional queda como fase 2 si el cliente la pide en serio.

---

## G. Login — logo centrado

En `/login`, el logo está alineado a la izquierda del card. Centralo respecto del cuadro de inicio.

---

## H. Marca de agua de Studio Nomade

Footer **persistente en toda la plataforma** (todas las pantallas del dashboard), con algo como
"Prototipo desarrollado por Studio Nomade · Todos los derechos reservados · Prohibida su reproducción"
+ el logo de Nomade. Ponelo en el layout del dashboard (`app/(dashboard)/layout.tsx`) para que
aparezca en todas.

Assets en `-context/elementos/`: `web@full.png` (logo área Web) y `Logotipo Nomade.png` (logotipo
Nomade), 4500×4500. Copialos a `/public/brand/` con nombres sin espacios (ej. `nomade-web.png`,
`nomade-logo.png`) y usá el que quede mejor en el footer (probablemente el logotipo Nomade en chico,
en gris tenue).

**No pongas la marca de agua en el PDF del catálogo.** El PDF es el producto que se le vende a Todo
Carnes (su catálogo); tiene que verse como pieza de ellos, limpia. La marca de Studio Nomade va en la
plataforma (la herramienta), no en el entregable. *(Si el cliente después la quiere también en el
PDF, se agrega como opción — pero no por default.)*

---

## I. Dashboard — mostrar el potencial (mock tipo CRM)

Hoy el dashboard es un placeholder. Convertilo en una vitrina de lo que la plataforma puede ser,
mezclando **métricas reales** y **tarjetas mock** claramente etiquetadas como potencial futuro:

**Reales (calculadas de la DB):**
- Cantidad de productos activos.
- Productos sin las 4 imágenes aprobadas (la lista de pendientes del comercial).
- Cantidad de catálogos y cuántos exportados.
- Últimas generaciones de imágenes.

**Mock (números inventados, verosímiles):**
- Tarjetas de "Productos por categoría" (Cerdo/Pollo/Vacuno/Trimming con números inventados).
- "Catálogos generados" (histórico inventado).
- Cuadros de mediciones tipo CRM (ventas por categoría, rotación, productos más pedidos, etc.),
  **rotulados explícitamente** como "Funcionalidad adicional — se puede integrar a la intranet". La
  idea es mostrarle a Todo Carnes que esto escala más allá del catálogo.

Que se lea claro qué es dato real y qué es demostración de potencial (un rótulo, un estilo distinto,
lo que sea honesto). CTAs "Crear producto" y "Crear catálogo".

---

## J. Lo que ya estaba en M7

- **Estados vacíos, loading y error** en cada pantalla. Vacío = invitación a actuar, no un cartel
  triste. Loading honesto en export (tarda) y generación. Error con salida, nunca un stack trace.
- **Datos de muestra:** el seed deja un catálogo "Julio 2026" armado y exportable. La demo no empieza
  en blanco.
- **Guion de demo** de 5 min en el `README.md`: el problema → base de productos → catálogo → preview
  → **el PDF** (el momento) → la IA como cierre. Con credenciales, orden de pantallas, y qué hacer si
  algo falla en vivo.
- **Barrido final:** recorré `docs/audit-checklist.md` entero.

---

## Definición de terminado

- [ ] `npm run build`, `tsc --noEmit`, `lint`, y `npm test` limpios. Cero `any`
- [ ] **Bugs (A):** raíz no da 404; filtros de productos funcionan y limpian sin error; miniaturas
      muestran la imagen real; "Agregar productos" no rompe el layout; la línea del footer no pisa el mes
- [ ] **Ficha (B):** logo del header sin recuadros; título de 80 chars entra sin desbordar; valores
      en mayúscula; vacío = N/A; divisor entre título y campos; portada y separador con los fondos nuevos
- [ ] `pdfinfo` sigue dando `1440 x 810 pts` y `pdffonts` solo Montserrat, tras los cambios
- [ ] **Constructor (C):** tarjetas de categoría expandibles/colapsables
- [ ] **Estado (D):** etiquetas Borrador / En revisión / Publicado
- [ ] **Export (E):** el archivo baja como `AAMMDD_Catalogo Oficial Todo Carnes - {Mes}.pdf`
- [ ] **Variantes (F):** editor de filas repetibles; Pollo Entero se edita y se ve como tabla alineada
- [ ] **Login (G):** logo centrado
- [ ] **Watermark (H):** footer de Studio Nomade en toda la plataforma; **no** en el PDF
- [ ] **Dashboard (I):** métricas reales + tarjetas mock rotuladas como potencial
- [ ] Estados vacíos/loading/error en todas las pantallas
- [ ] **Alguien que no trabajó en esto completa el flujo entero sin ayuda**, con cuenta limpia
- [ ] Guion de demo en el README

## Trampas conocidas

1. **Fondos del PDF en lazy** → export colgado (regla de M5). `priority` en todas las imágenes de
   `/print`.
2. **Uppercasing el dato en la DB** en vez de en el render. El dato se guarda natural; la mayúscula es
   CSS. Si no, el formulario se lee horrible y M3 rompe.
3. **Cambiar el esquema para las variantes.** No. Filas ↔ líneas de los campos existentes.
4. **Romper la ficha de un producto simple** al agregar el modo tabla de variantes. Una sola variante
   = layout actual.
5. **Marca de agua en el PDF.** No va. El PDF es de Todo Carnes.
6. **Tocar los valores de `status` en la DB** al relabelar. Solo cambian las etiquetas visibles.
7. **El nombre de archivo con espacios/acentos** en el header HTTP sin encodear → nombre roto. Usá
   `filename*=UTF-8''`.
8. **Inventar métricas reales.** Las 4 "reales" del dashboard se calculan de la DB; solo las tarjetas
   CRM son inventadas, y van rotuladas.

## Entrega

Commiteá en `feature/m7-polish` con prefijo `m7:`. **No abras el PR.**

Reportá: qué hiciste, comparación lado a lado PDF exportado vs. julio, captura del dashboard, quién
probó el flujo en frío y cómo le fue, qué provider quedó activo, desviaciones, y qué te preocupa de
cara a la reunión.

Claude audita el diff local y autoriza el PR.
