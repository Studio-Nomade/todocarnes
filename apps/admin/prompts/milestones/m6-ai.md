# M6 — IA real

> **Prerrequisito externo:** `gpt-image-1` exige verificación de organización en OpenAI (documento de
> identidad, se hace una vez en `platform.openai.com`, puede tardar días). **Sin eso, este hito no
> arranca.** Confirmá con Sebastián antes de empezar.
>
> El default sigue siendo `mock`. Si la verificación no llega, la demo corre igual — por eso este
> hito está al final.

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes", una herramienta interna que
reemplaza la maquetación manual del catálogo comercial mensual. Claude es el tech lead y audita tu
trabajo antes de cada PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/architecture.md` §Generación de imágenes **completo**, incluida §Sobre la cuenta de
   OpenAI.
3. Mirá `lib/images/provider.ts` y `mock.ts` de M4. **Implementás esa interfaz, no la cambiás.**
4. Confirmá que la verificación de organización está lista y que hay crédito cargado.
5. `git checkout develop && git pull && git checkout -b feature/m6-ai`

## Objetivo

Que `IMAGE_PROVIDER=openai` genere imágenes reales desde una imagen fuente, con `gpt-image-1`, y que
esas imágenes lleguen al PDF exportado.

Y que el resto de la app **no se entere** de que cambió nada.

## Alcance

- `lib/images/openai.ts` — implementa `ImageProvider`
- Tope diario, server-side
- Manejo de errores con mensajes humanos
- `/settings` — estado de OpenAI, uso del día, editor de prompts
- Historial de generaciones para Admin

## Fuera de alcance

- Cambiar la interfaz `ImageProvider`. Si no te sirve, es un bug de M4 — reportálo, no la reescribas
- Cola de jobs, reintentos automáticos, backoff
- Streaming de progreso
- Elegir modelo desde la UI. `gpt-image-1`, fijo
- Cualquier UI que revele qué provider está activo — **salvo** el estado de conexión en `/settings`,
  que es para Admin y sí corresponde
- Otros modelos (DALL·E 3). No aceptan imagen de referencia; por eso no sirven acá

## Especificación

### `openai.ts`

```ts
// Implementa ImageProvider de M4. Misma firma, sin excepciones.
```

**`images.edit`, no `images.generate`.** Con la imagen fuente como referencia.

Esto no es una preferencia técnica: `docs/handoff.md` §10.3 dice que la IA **no debe inventar**
etiquetas, códigos, sellos sanitarios, marcas ni información de empaque. Sin imagen de referencia,
gpt-image-1 los inventa — y un catálogo B2B con un código sanitario inventado es un problema real
para el cliente, no un detalle estético.

Si `sourceImage` es `null`, tirá error. M4 ya deshabilita el botón; esta es la segunda barrera.

- Modelo: `gpt-image-1`
- Salida: 1024×1024, guardada como webp
- Timeout generoso: tarda 30-90s
- El prompt viene armado de `prompt-builder.ts` (M4). No lo rearmes acá

### Tope diario

`settings.generation_daily_limit` (seedeado en 40 en M2) contra
`count(image_generation_jobs)` del día.

**Chequeado en el server, antes de llamar a OpenAI.** Protege la tarjeta de Studio Nomade, que es la
que paga. Un tope que se valida en la UI no es un tope.

### Errores

Estos cuatro van a pasar, y cada uno necesita un mensaje que un comercial entienda:

| Error de OpenAI | Qué ve el usuario |
|---|---|
| Sin crédito / quota | "No hay crédito disponible para generar imágenes. Avisá al administrador." |
| Organización no verificada | "La cuenta de OpenAI no está habilitada para generar imágenes." |
| Timeout | "La generación tardó demasiado. Probá de nuevo." |
| Rechazo de safety | "OpenAI rechazó esta generación. Probá con otra imagen fuente." |
| Tope diario alcanzado | "Se alcanzó el límite diario de N generaciones." |

**Nunca filtres el body de OpenAI a la UI.** Loggealo en `image_generation_jobs.error_message` y
mostrá el mensaje humano. El body trae detalles de la organización y de la request que no le importan
a nadie del otro lado.

El job queda en `failed` con el error. Nunca lo dejes en `processing` — un job colgado ahí es un
producto que parece estar generando para siempre.

### `/settings` — solo Admin

`requireRole(['admin'])`.

- **Estado de OpenAI**: "Conectado" / "No conectado". **Nunca la key, ni enmascarada, ni sus últimos
  4 dígitos.** No hay nada que ganar mostrándola
- **Uso del día**: N de M generaciones
- **Editor de prompts**: los 5 templates de `settings` (base + 4 variantes). En inglés
- **Tope diario**: editable

La key vive en env y no se edita desde la UI. Está decidido: guardarla en Postgres implica cifrado,
rotación y un vector de fuga que este MVP no necesita.

### Historial

Tabla de `image_generation_jobs` para Admin: producto, slot, estado, modelo, fecha, quién.
El prompt usado, expandible. Errores visibles.

Es el respaldo para cuando el cliente pregunte "¿cuánto se gastó?" y "¿por qué salió así?".

## Definición de terminado

- [ ] `npm run build` y `tsc --noEmit` limpios. Cero `any`
- [ ] `IMAGE_PROVIDER=openai` + imagen fuente real → **imagen generada que conserva el empaque de la
      fuente y no inventa etiquetas**. Adjuntá el antes/después
- [ ] La imagen aprobada aparece en el PDF exportado
- [ ] `IMAGE_PROVIDER=mock` sigue funcionando igual que en M4 — no rompiste el default
- [ ] Con el tope en 1: la segunda generación del día se rechaza **antes de llamar a OpenAI**
      (verificalo en los logs, no en la UI)
- [ ] Los 5 errores muestran su mensaje humano; el body crudo de OpenAI no llega a la UI
- [ ] Un job fallido queda en `failed`, nunca colgado en `processing`
- [ ] `/settings` es 403 para commercial
- [ ] La key no aparece en la UI de ninguna forma
- [ ] `grep -rn "OPENAI_API_KEY" app/ components/ | xargs grep -l "use client"` → vacío
- [ ] `git log -p | grep -E "sk-[a-zA-Z0-9]{20}"` → vacío

## Trampas conocidas

1. **`images.generate` en vez de `images.edit`.** Es el error central de este hito. Sin referencia,
   el modelo inventa etiquetas, marcas y sellos sanitarios — exactamente lo que el cliente pidió que
   no pase.
2. **Cambiar la interfaz `ImageProvider`** porque OpenAI necesita un parámetro más. Si de verdad lo
   necesita, es un bug de M4: reportálo y que Claude decida. No la toques por tu cuenta.
3. **Mostrar la key enmascarada** en `/settings` "para que el admin verifique". No hay nada que
   verificar: o conecta o no conecta. Mostrá eso.
4. **Filtrar el error de OpenAI a la UI.** Trae detalles de la organización y de la request.
5. **Tope validado en la UI.** Se saltea con un POST directo. Server-side, antes de la llamada.
6. **Job colgado en `processing`** cuando la llamada falla. Envolvé en try/finally.
7. **Un `if (IMAGE_PROVIDER === 'openai')` en un componente.** La UI no sabe qué provider corre.
8. **Probar solo el happy path.** Los errores de este hito son el 80% de lo que va a pasar en
   producción. Probá sin crédito, con timeout, con una imagen que safety rechace.
9. **Quemar crédito probando.** Cada imagen cuesta 0,02-0,19 USD. Usá el mock para la UI y OpenAI
   solo para verificar el camino real.

## Entrega

Commiteá en `feature/m6-ai` con prefijo `m6:`. **No abras el PR.**

Reportá: qué hiciste, el **antes/después de una generación real** (fuente → resultado), evidencia de
que el tope corta antes de llamar a OpenAI, capturas de los mensajes de error, cuánto crédito
gastaste probando, desviaciones, y qué te preocupa.

Claude audita el diff local y autoriza el PR.
