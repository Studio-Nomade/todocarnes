# M4 — Imágenes

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes", una herramienta interna que
reemplaza la maquetación manual del catálogo comercial mensual. Claude es el tech lead y audita tu
trabajo antes de cada PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/architecture.md` §Generación de imágenes **completo**, §Modelo de datos
   (`product_images`), §Storage.
3. Leé **`docs/image-playbook.md` completo**, sobre todo la sección "Cómo se integra al sistema".
   Son los prompts reales validados por el equipo de diseño y el mapeo a nuestro esquema. Reemplazan
   a los prompts genéricos que M2 dejó en `data/seed/prompts.ts`.
4. `git checkout develop && git pull && git checkout -b feature/m4-images`

## Objetivo

Que el ciclo completo de imágenes de un producto funcione end-to-end **con el provider mock**: subir
fuente, generar por slot, aprobar, rechazar, regenerar, reemplazar a mano.

Al terminar M4, cambiar a IA real debe ser cambiar una variable de entorno. Nada más.

## Alcance

- `lib/images/provider.ts` — la interfaz
- `lib/images/mock.ts` — el provider por defecto
- `lib/images/prompt-builder.ts`
- Bucket `product-images` en Supabase Storage
- Server Actions de imágenes
- UI de galería de 4 slots en `/products/[id]`

## Fuera de alcance

- **`lib/images/openai.ts`** — es M6. Acá construís la interfaz que M6 va a implementar. No la
  implementes vos
- **El paso de normalización obligatorio.** El playbook §2 lo propone como pre-limpieza, pero para el
  MVP los 4 prompts de vista ya limpian por su cuenta. Seedeá `image_prompt_normalize` en `settings`,
  pero **no** construyas un pipeline de 2 rondas. La normalización, si se hace, es un botón opcional
  "limpiar imagen base" que reemplaza el slot `source` — no un paso previo forzado a las 4 vistas.
  Ver playbook §"El paso de normalización es opcional"
- Recorte, rotación, filtros o edición de imagen en la app. `object-fit: cover` y listo
- Cola de jobs. `image_generation_jobs` es **historial**, no cola
- Historial de generaciones en la UI (es M6)
- Catálogos (es M5)

## Especificación

### El contrato — escribilo primero

```ts
// lib/images/provider.ts
export interface ImageProvider {
  generate(input: {
    prompt: string;
    sourceImage: Buffer | null;
    slot: ImageSlot;
  }): Promise<{ buffer: Buffer; model: string }>;
}
```

Selección por `IMAGE_PROVIDER=mock|openai`, en un solo lugar. Default: `mock`.

**Ningún componente de UI puede saber cuál está activo.** Nada de `if (provider === 'mock')` en un
componente, ningún badge de "modo demo", ningún texto condicional. Es un ítem de auditoría, y la
razón es directa: en la demo el mock tiene que ser invisible.

### `mock.ts`

Devuelve un placeholder **landscape 1536×1024** con el nombre del slot superpuesto, tras ~1s de delay
simulado. Landscape porque es lo que M6 le va a pedir a `gpt-image-1` (ver §Proporciones del
playbook): los marcos main y secundarios recortan con `object-fit: cover`, así que el mock tiene que
tener la misma orientación para que el preview no mienta.

El delay importa: es lo que hace que la UI de loading se pruebe de verdad. Sin él, M6 va a descubrir
que el loading state nunca se vio.

### Reseed de prompts — reemplazá los de M2

M2 seedeó prompts genéricos en inglés (`data/seed/prompts.ts`) con las claves `image_prompt_base` +
`image_prompt_main` + `image_prompt_secondary_1..3`. **Reemplazalos por los de
`docs/image-playbook.md`**, que son los validados por el equipo. Concretamente, las claves de
`settings` pasan a ser:

```
image_prompt_normalize      ← playbook §2 (nuevo)
image_prompt_main           ← playbook §3.1
image_prompt_secondary_1    ← playbook §3.2
image_prompt_secondary_2    ← playbook §3.3
image_prompt_secondary_3    ← playbook §3.4
generation_daily_limit      ← sin cambios (40)
```

Desaparece `image_prompt_base`. El seed es idempotente (upsert por `key`); las claves viejas que ya
no uses, borralas explícitamente o dejá el set completo documentado — no dejes huérfanas silenciosas.

Los prompts van **en español** (están probados; ver el playbook §"Idioma").

### `prompt-builder.ts`

```ts
buildPrompt(product, slot): string
```

Toma el prompt del slot desde `settings` e interpola **solo 3 variables**:

| Placeholder | Campo |
|---|---|
| `{{producto}}` | `product.title` |
| `{{corte}}` | nombre del `cut` |
| `{{categoria}}` | nombre de la `category` |

**No interpoles `brand` ni `origin`** — es deliberado, empujan al modelo a inventar texto de marca.
Los prompts del playbook son autocontenidos: **no hay base que prepender**, cada slot es completo.

Slots ↔ prompts: `main` → §3.1 hero · `secondary_1` → §3.2 empaque · `secondary_2` → §3.3 lateral ·
`secondary_3` → §3.4 caja.

`image_prompt_normalize` (§2) es para el paso opcional de limpieza — ver Fuera de alcance.

### Storage

Bucket `product-images`, **público en lectura**, escritura solo por service role.

Paths no adivinables: `{product_id}/{slot}/{uuid}.webp`.

Uploads — los cuatro son bloqueantes de auditoría:
- MIME whitelist: `image/jpeg`, `image/png`, `image/webp`
- Máx 10MB
- Nombre de archivo **generado por nosotros** (uuid). **Nunca el del usuario**
- Validación en el server. Un `accept=""` en el input no es validación

### Server Actions

`uploadSourceImage`, `uploadManualImage`, `generateProductImage`, `approveImage`, `rejectImage`.

Todas con `requireRole(['admin','commercial'])`.

**`approveImage` es la delicada.** Tiene que degradar el `approved` anterior de ese slot a `rejected`
y aprobar el nuevo **en una transacción**. El índice único parcial de M2
(`one_approved_per_slot`) hace que la operación en el orden equivocado explote — está puesto a
propósito para que no puedas hacerlo mal en silencio.

`generateProductImage`:
- Si el producto no tiene imagen fuente → **error, no generes**. Ver trampa #1
- `buildPrompt` → `provider.generate` → subir a Storage
- `product_images` con `status='pending'`, `generated_by_ai=true`, `prompt_used` guardado
- Fila en `image_generation_jobs`
- `maxDuration` alto: con OpenAI esto tarda 30-90s

No existe `regenerateImage`: es `generateProductImage` otra vez.

### UI de galería

En `/products/[id]`, debajo o al lado del form.

- Upload de imagen fuente, separado y arriba: es el insumo de todo lo demás
- 4 slots: `main`, `secondary_1`, `secondary_2`, `secondary_3`
- Cada slot muestra: la imagen actual (approved), su estado, y las acciones — generar, subir manual,
  aprobar, rechazar
- **Sin imagen fuente, el botón de generar está deshabilitado con un tooltip que explica por qué**
- Loading honesto durante la generación: "Generando, ~1 min". No un spinner mudo

Cuando un slot tiene imagen aprobada, el preview de `ProductPageTemplate` la usa en vez del
placeholder.

## Definición de terminado

- [ ] `npm run build` y `tsc --noEmit` limpios. Cero `any`
- [ ] Ciclo completo con el mock: subir fuente → generar los 4 slots → aprobar → **se ven en el
      preview de la ficha**
- [ ] **Aprobar dos imágenes del mismo slot: la primera queda `rejected`.** Nunca dos `approved`
- [ ] Rechazar, regenerar y reemplazar manual funcionan
- [ ] Sin imagen fuente, generar está deshabilitado con tooltip
- [ ] Subir un `.pdf` renombrado a `.jpg` → rechazado por el server
- [ ] Subir un archivo de 20MB → rechazado
- [ ] Un archivo llamado `../../evil.jpg` no escapa del path
- [ ] `grep -rn "IMAGE_PROVIDER\|mock" components/ app/` → vacío. La UI no sabe qué provider corre
- [ ] `prompt_used` queda guardado en cada fila generada

## Trampas conocidas

1. **Permitir generar sin imagen fuente.** Es tentador ("que genere de cero") y viola el requisito
   central del cliente: `docs/handoff.md` §10.3 dice que la IA **no debe inventar** etiquetas,
   códigos, sellos ni marcas. Sin referencia, gpt-image-1 los inventa. En M6 esto es
   `images.edit`, no `images.generate` — la interfaz tiene que forzarlo desde ahora.
2. **Implementar `openai.ts` "ya que estás".** Es M6. Acá solo el contrato y el mock.
3. **Aprobar sin degradar el anterior** → el índice único explota. Transacción, en el orden correcto.
4. **Filtrar el provider a la UI**: un badge de "modo demo", un texto condicional, un `if`. La demo
   necesita que el mock sea invisible.
5. **Usar el nombre de archivo del usuario.** Path traversal y colisiones. Generá un uuid.
6. **Validar el MIME solo con la extensión.** Mirá los magic bytes o usá una librería.
7. **Mock sin delay** → el loading state nunca se prueba y M6 descubre que no existe.
8. **Construir una cola** porque 90s "es mucho". No. Server action síncrona con loading state.
   `image_generation_jobs` es historial.

## Entrega

Commiteá en `feature/m4-images` con prefijo `m4:`. **No abras el PR.**

Reportá: qué hiciste, captura del ciclo completo de slots, evidencia de que aprobar dos veces el
mismo slot degrada la primera, evidencia del rechazo de uploads inválidos, desviaciones, y qué te
preocupa de cara a M6.

Claude audita el diff local y autoriza el PR.
