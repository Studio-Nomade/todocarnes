# M3 — Productos

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes", una herramienta interna que
reemplaza la maquetación manual del catálogo comercial mensual. Claude es el tech lead y audita tu
trabajo antes de cada PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/architecture.md` §Modelo de datos (`products`), §Server Actions.
3. Mirá `components/templates/ProductPageTemplate.tsx` de M1. **Lo vas a reusar tal cual.**
4. `git checkout develop && git pull && git checkout -b feature/m3-products`

## Objetivo

Que un comercial pueda crear, editar, buscar y desactivar productos — y que al escribir en el
formulario **vea la ficha real actualizarse al lado**.

Ese preview en vivo es el momento que vende la herramienta en la demo. No es un extra.

## Alcance

- `lib/validators/product.ts` (zod), compartido entre form y actions
- Server Actions de productos
- `/products` — tabla con filtros y búsqueda
- `/products/new` y `/products/[id]` — formulario + preview en vivo
- Seed de ~8 productos reales

## Fuera de alcance

- Upload de imágenes, slots, galería, IA (es M4). El form muestra placeholders en el preview
- Catálogos (es M5)
- Borrado real. `deactivateProduct` cambia `status`, no hace `DELETE`
- Bulk edit, import CSV, historial de cambios
- Paginación infinita o virtualizada. Con ~50 productos, paginación simple alcanza

## Especificación

### Validador

`lib/validators/product.ts` con zod. **Una sola definición**, importada por el form y por las
actions. Si duplicás el schema, se desincronizan — es un ítem de auditoría.

Recordá de `architecture.md`: `box_weight`, `format` y `units` son **text, no numeric**. Los valores
reales son `"8 KG (Peso Variable)"` y `"7-8 x caja"`. Y aceptan `\n`.

Obligatorios: `category_id`, `cut_id`, `title`. El resto opcional.
`cut_id` debe pertenecer a `category_id` — validalo, no confíes en la UI.

### Server Actions

De `architecture.md` §Server Actions: `createProduct`, `updateProduct`, `deactivateProduct`,
`duplicateProduct`, `listProducts`, `getProduct`.

Todas arrancan con `requireRole(['admin','commercial'])` y validan con zod antes de tocar la DB.
`created_by` / `updated_by` siempre poblados.

`duplicateProduct`: copia los campos, `status='draft'`, título con sufijo " (copia)", **sin copiar
imágenes**. Es la feature que ahorra más tiempo real al comercial — el catálogo tiene muchos
productos que difieren en dos campos.

### `/products`

Tabla: miniatura · código · nombre · categoría · corte · marca · estado · acciones
(editar, duplicar, desactivar).

Filtros: categoría, corte (dependiente de categoría), marca, estado.
Búsqueda por código o nombre.

Los filtros van en la **URL** (searchParams), no en estado local. Un filtro compartible sobrevive al
refresh y se puede mandar por chat en la demo.

### `/products/new` y `/products/[id]`

Layout de dos columnas: **formulario a la izquierda, preview a la derecha.**

El preview es `ProductPageTemplate` de M1, con `scale` — el mismo componente que exporta el PDF.
**No hagas una versión "de preview".** Si divergen, la demo miente.

Actualiza en vivo mientras se escribe. Con placeholders en las 4 imágenes hasta que exista M4.

Estado por defecto al crear: `draft`.

El badge "listo para catálogo" (4 slots aprobados) **se calcula, no se guarda**. En M3 todavía no
aplica; no agregues la columna.

### Seed de productos

~8 productos reales del catálogo de julio, al menos 2 por categoría. **Idempotente**, upsert por
`code`.

Tienen que cubrir los casos límite, porque son los que rompen la plantilla:

- Uno con **título largo** que fuerce el wrap
- Uno con **campos vacíos** → deben renderizar `—`
- **Pollo Entero con código multilínea** (varios códigos en una ficha, separados por `\n`)
- El obligatorio, de `docs/handoff.md` §7:
  ```
  CF-1608 · Costillar de Cerdo Notable · Cerdo/Costillar · Costillar Brasil
  Notable · Brasil · 8 KG (Peso Variable) · Vacío · 7-8 x caja
  ```

Si no tenés los datos reales de los otros, pedilos. No inventes códigos ni marcas: van a terminar en
una demo frente al cliente que los conoce de memoria.

## Definición de terminado

- [ ] `npm run build` y `tsc --noEmit` limpios. Cero `any`
- [ ] Crear un producto en la UI → **se ve en el preview al lado mientras escribís**
- [ ] Editar → persiste. Duplicar → nuevo `draft` sin imágenes. Desactivar → `status='inactive'`,
      no desaparece de la DB
- [ ] Filtros y búsqueda funcionan y **están en la URL**
- [ ] `grep -rn "requireRole" lib/actions/` → aparece en todas las actions
- [ ] El schema zod está definido una sola vez
- [ ] `npm run seed` dos veces → 8 productos, no 16
- [ ] **El producto de Pollo Entero renderiza sus códigos como lista en el preview**
- [ ] Un producto con campos vacíos muestra `—`
- [ ] Elegir categoría Cerdo y mandar `cut_id` de Pollo desde el server falla la validación

## Trampas conocidas

1. **Duplicar el schema zod** entre form y action. Definilo una vez en `lib/validators/`.
2. **Hacer un "PreviewCard" simplificado** en vez de reusar `ProductPageTemplate`. Es la trampa más
   tentadora de este hito y la que arruina la demo: el preview deja de predecir el PDF.
3. **`box_weight` como `number`.** El valor real es `"8 KG (Peso Variable)"`. Es text.
4. **`DELETE` en `deactivateProduct`.** Es un cambio de `status`. El nombre lo dice.
5. **Validar `cut_id ∈ category_id` solo en la UI.** El select filtrado no es validación; un POST
   directo lo saltea.
6. **Filtros en `useState`** → se pierden al refrescar y no se pueden compartir.
7. **Inventar datos de productos** porque no te pasaron los reales. Pedilos.

## Entrega

Commiteá en `feature/m3-products` con prefijo `m3:`. **No abras el PR.**

Reportá: qué hiciste, captura del form con el preview en vivo al lado, captura del producto Pollo
Entero renderizando su código multilínea, desviaciones, y qué te preocupa.

Claude audita el diff local y autoriza el PR.
