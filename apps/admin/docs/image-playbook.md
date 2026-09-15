# Playbook de generación de imágenes — TodoCarnes

De dónde salió: el equipo de diseño de Studio Nomade iteró decenas de fichas en ChatGPT (junio–julio
2026) hasta converger en un flujo estable. Este documento es la extracción de ese proceso.

Tiene **dos usos**:

1. **Seed de prompts para M4 y M6.** Los prompts de la §3 y §2 son el contenido que
   `data/seed/prompts.ts` debe seedear en `settings` (reemplazan a los genéricos del handoff §10.4
   que puso M2).
2. **Guía del flujo manual en ChatGPT para la demo.** Mientras M6 (API) no esté, el comercial o el
   diseñador puede pegar estos mismos prompts en la cuenta de ChatGPT del studio y generar a mano.
   Son idénticos: la app y el flujo manual usan el mismo modelo (ver abajo).

---

## Cómo se integra al sistema — léelo antes de implementar M4

El handoff está escrito para un operador humano. Estas son las decisiones de traducción a nuestra
arquitectura. **Ganan sobre lo que diga el handoff si hay conflicto.**

### El principio que ya teníamos, ahora confirmado por el equipo

La IA entrega **fotos aisladas**, no la ficha compuesta. Nuestro `ProductPageTemplate` (M1) ya dibuja
el header, el panel de datos, los marcos y el footer. El equipo llegó solo a la misma conclusión: por
eso el handoff insiste "sin maqueta, sin módulos, una sola foto por prompt". Es exactamente el
contrato de nuestros slots.

### Mapeo de slots ↔ prompts

| Slot (`product_images.slot`) | Prompt del playbook |
|---|---|
| `source` | La foto que sube el comercial. Opcionalmente pasada por §2 (normalización) |
| `main` | §3.1 hero |
| `secondary_1` | §3.2 empaque / frontal |
| `secondary_2` | §3.3 ángulo lateral |
| `secondary_3` | §3.4 caja / presentación comercial |

### Variables — cambian respecto de `architecture.md`

El handoff usa `{{producto}}`, `{{corte}}`, `{{categoria}}`. El mapeo:

| Variable del prompt | Campo del producto |
|---|---|
| `{{producto}}` | `product.title` |
| `{{corte}}` | nombre del `cut` |
| `{{categoria}}` | nombre de la `category` |

**No se interpolan `brand` ni `origin`.** Es deliberado: el handoff es enfático en no inventar
marcas, etiquetas ni procedencias. Meter `brand` en el prompt empuja al modelo a dibujar texto de
marca. La fidelidad de marca viene de la **imagen fuente**, no del texto. → `prompt-builder` deja de
interpolar brand/origin.

### `prompt-builder` se simplifica

Los 4 prompts de vista son **autocontenidos**: cada uno ya trae sus guardrails inline. Ya **no** hay
un "prompt base" que se prepende. `buildPrompt(product, slot)` = tomar el prompt del slot desde
`settings` e interpolar las 3 variables. Nada más.

### Claves de `settings` — cambian respecto de M2

M2 seedeó: `image_prompt_base` + `image_prompt_main` + `image_prompt_secondary_1..3`.

M4 las reemplaza por:

```
image_prompt_normalize      ← §2 (nuevo)
image_prompt_main           ← §3.1
image_prompt_secondary_1    ← §3.2
image_prompt_secondary_2    ← §3.3
image_prompt_secondary_3    ← §3.4
generation_daily_limit      ← sin cambios (40)
```

Desaparece `image_prompt_base` (ya no se concatena). Aparece `image_prompt_normalize`.

### El paso de normalización (§2) es opcional en el MVP

El handoff propone limpiar la foto operativa **antes** de generar las 4 vistas. Correcto para
calidad, pero son 5 generaciones por producto (~5 min con la API real). Para el MVP:

- Los 4 prompts de vista ya limpian por su cuenta (cada uno dice "aislar sobre fondo blanco, mejorar
  nitidez"). Generan directo desde `source`.
- La normalización queda como **acción opcional**: un botón "limpiar imagen base" que transforma la
  foto cruda y guarda el resultado en el slot `source`. No es un paso obligatorio del pipeline.

No lo hagas obligatorio en M4 — duplica latencia y costo sin ser necesario para la demo.

### Proporciones de salida

`gpt-image-1` entrega `1024×1024`, `1536×1024` (landscape 3:2) o `1024×1536`. Nuestros marcos:

| Slot | Marco en la plantilla | Pedir a la API | La plantilla recorta con |
|---|---|---|---|
| `main` | ~971×425 (≈2.28:1) | `1536×1024` landscape | `object-fit: cover` |
| `secondary_*` | 272×169 (≈1.6:1) | `1536×1024` landscape | `object-fit: cover` |

El handoff pide "margen de seguridad alrededor del producto para que el software recorte" — es
exactamente lo que `object-fit: cover` necesita. Encaja.

### Idioma: español

Los prompts están en español y **están probados**. Esto contradice la convención de
`architecture.md` ("prompts de IA en inglés"), y gana la evidencia: son los que el equipo validó
contra el producto real. No los traduzcas. `architecture.md` queda corregido en consecuencia.

### ChatGPT (demo) vs. API (M6) — mismo modelo

Lo que el equipo usó en ChatGPT (subir foto → transformar el producto) es la generación con imagen
de referencia, es decir `gpt-image-1` / 4o image gen — **no** DALL·E 3 clásico, que es solo
texto→imagen. Es la misma familia que nuestra API en M6 (`images.edit` con la fuente). Por eso estos
prompts sirven igual en los dos caminos. La longitud de los prompts (el de la caja es largo) está
dentro del límite de `gpt-image-1`.

---

# El handoff — fuente de verdad del equipo de diseño

> Lo de abajo es la extracción textual del proceso de ChatGPT. Es la referencia de estilo y las
> reglas. Cuando entre en conflicto con la sección de arriba, gana la de arriba (que ya lo tradujo a
> nuestro sistema).

## Contexto

El sistema de catálogo ya construye la maqueta final: header, logo, menú de categorías, panel de
ficha técnica, footer y marcos de imagen. Por lo tanto, la IA **no** debe generar una lámina completa
compuesta con imagen principal + tres módulos inferiores. La IA genera **fotografías individuales,
limpias y aisladas**, para que el software las inserte en sus marcos:

1. Imagen principal / hero del producto.
2. Secundaria 1 / empaque o vista frontal.
3. Secundaria 2 / ángulo lateral o alternativo.
4. Secundaria 3 / caja o presentación comercial.

Cada prompt produce **una sola foto**, centrada, sobre fondo blanco o gris muy claro, sin texto, sin
ficha técnica, sin elementos gráficos, sin diagramación.

## 1. Cómo tomar la foto de origen (guía para el comercial)

**Encuadre:** foto desde arriba o en 45°; el producto completo dentro de la imagen; no cortar
esquinas, bordes de caja ni etiquetas; dejar aire alrededor; caja completa si viene en caja; frente/
etiqueta completa si viene en bolsa.

**Luz:** natural o blanca pareja; evitar sombras duras, fotos oscuras, contraluz y flash directo con
brillos sobre el plástico.

**Fondo:** claro (mesa blanca, papel blanco, superficie gris clara); sin objetos, manos, desorden,
piso ni logos externos.

**Evitar:** producto cortado por el borde, fotos borrosas, reflejos fuertes en plástico, film opaco,
etiquetas ilegibles, varios productos en una foto, texto/flechas/anotaciones agregadas.

## 2. Prompt de limpieza / normalización

```
A partir de la imagen de referencia adjunta, limpiar y normalizar la fotografía del producto cárnico para uso en catálogo TodoCarnes.

Mantener fielmente el producto enviado: respetar su tipo de corte, forma general, proporciones, textura, color, grasa visible, hueso si corresponde, empaque si corresponde, etiqueta visible si la tiene y características propias del producto.

Aislar el producto sobre un fondo blanco limpio o gris muy claro, con estética de fotografía de producto B2B. Mejorar la nitidez, iluminación y contraste de manera natural, manteniendo un aspecto realista de sesión fotográfica.

Eliminar desorden del fondo, sombras excesivas, manchas visuales, bordes sucios, elementos externos, mesa, piso, manos, objetos ajenos o cualquier elemento que no pertenezca al producto.

Si el producto está cubierto por plástico o film, reducir reflejos molestos y mejorar la lectura del producto, pero sin inventar texturas ni cambiar el estado real del producto. Si el producto viene envasado, mantener el empaque; si se solicita una versión sin empaque, retirar visualmente el plástico de forma natural, manteniendo el mismo corte crudo o congelado.

No agregar textos, logos nuevos, etiquetas inventadas, códigos, sellos, marcas, información comercial, ficha técnica ni elementos gráficos. No cocinar el producto. No cambiar el corte. No transformar el producto en una preparación. Mantenerlo crudo, fresco, congelado o envasado según corresponda a la referencia.

El resultado debe ser una fotografía limpia, nítida, realista y lista para ser usada como base en un generador de catálogo.
```

## 3. Los cuatro prompts de vista

Variables: `{{producto}}` (nombre comercial), `{{corte}}` (corte específico), `{{categoria}}`
(Cerdo / Pollo / Vacuno / Trimming).

### 3.1 — Imagen principal / hero

```
A partir de la imagen de referencia adjunta, crear una fotografía principal tipo hero para catálogo TodoCarnes del producto {{producto}}, correspondiente al corte {{corte}} de la categoría {{categoria}}.

Generar una sola imagen aislada del producto, sin maqueta, sin módulos, sin ficha técnica y sin composición de catálogo. La fotografía debe mostrar únicamente el producto principal sobre fondo blanco limpio.

Mantener el producto basado fielmente en la referencia enviada: respetar su tipo de corte, forma, proporciones generales, textura, grasa visible, hueso si corresponde, piel si corresponde, color, estado crudo, fresco, congelado o envasado según corresponda. No cambiar el corte ni inventar otro producto.

Mostrar el producto grande, nítido y protagonista, como fotografía profesional de producto B2B. Usar iluminación de estudio, alta nitidez, sombras suaves, buena textura, volumen realista y apariencia premium. La carne debe verse real, con humedad natural, detalle en fibras, grasa y superficie.

Agregar de manera sutil algunos elementos gastronómicos de apoyo, como granos de pimienta y una rama de romero, ubicados a un costado y sin robar protagonismo al producto. Estos elementos no deben tapar el producto ni ocupar el centro.

El fondo debe ser blanco limpio, sin textura, sin mesa visible, sin diseño gráfico, sin textos, sin logos adicionales, sin etiquetas inventadas, sin ficha técnica, sin bordes fuertes y sin elementos decorativos innecesarios.

Dejar margen de seguridad alrededor del producto para que el software pueda recortar e insertar la imagen en el marco correspondiente.

No cocinar el producto. No transformarlo en preparación. No agregar grillado, dorado, salsa, platos ni ingredientes extra. Mantenerlo crudo, congelado o envasado según la referencia original.

El resultado debe parecer una fotografía real de estudio para catálogo comercial TodoCarnes.
```

### 3.2 — Secundaria 1 / empaque o vista frontal

```
A partir de la imagen de referencia adjunta, crear una fotografía secundaria de empaque o vista frontal para catálogo TodoCarnes del producto {{producto}}, correspondiente al corte {{corte}} de la categoría {{categoria}}.

Generar una sola imagen aislada, sin maqueta, sin módulos, sin ficha técnica y sin composición de catálogo. La fotografía debe mostrar únicamente el producto o empaque en vista frontal, centrado sobre fondo blanco o gris muy claro.

Mantener fielmente el producto y su presentación según la referencia: si viene en bolsa, mantener la bolsa; si viene al vacío, mantener el vacío; si viene con etiqueta real visible, mantenerla como parte del producto; si no tiene empaque, mostrar el corte limpio de frente. No inventar marcas, etiquetas, códigos, sellos, textos ni información comercial.

La imagen debe verse como fotografía profesional de producto B2B, con iluminación de estudio, alta nitidez, sombras suaves y apariencia realista. El producto debe estar apoyado naturalmente, sin flotar, con sombra de contacto sutil.

Si hay plástico o film, debe verse realista, con reflejos controlados y lectura clara del producto. No exagerar brillos ni deformar el empaque.

No agregar textos, logos adicionales, ficha técnica, elementos gráficos, bordes ni decoraciones. No incluir pimienta ni romero en esta vista, salvo que sean parte de la referencia original.

Dejar margen de seguridad alrededor del producto para que el software pueda recortar e insertar la imagen en el marco secundario correspondiente.

No cambiar el corte. No cocinar el producto. No transformarlo en preparación. Mantenerlo crudo, congelado o envasado según corresponda.
```

### 3.3 — Secundaria 2 / ángulo lateral o alternativo

```
A partir de la imagen de referencia adjunta, crear una fotografía secundaria en ángulo lateral o alternativo para catálogo TodoCarnes del producto {{producto}}, correspondiente al corte {{corte}} de la categoría {{categoria}}.

Generar una sola imagen aislada, sin maqueta, sin módulos, sin ficha técnica y sin composición de catálogo. La fotografía debe mostrar únicamente el producto sobre fondo blanco o gris muy claro.

Mostrar el mismo producto desde un ángulo diferente al de la imagen principal: puede ser lateral, 3/4, frontal bajo, vista levemente superior o una posición alternativa que ayude a entender mejor el corte. Mantener una lectura clara de la forma, volumen, textura y proporciones del producto.

Respetar fielmente la referencia enviada: tipo de corte, forma general, grasa visible, hueso si corresponde, piel si corresponde, textura, color, estado crudo, fresco, congelado o envasado según corresponda. No inventar otro corte ni modificar el producto.

La imagen debe tener estética de fotografía profesional de producto B2B: iluminación de estudio, alta nitidez, sombras suaves, volumen realista y textura natural. El producto debe estar apoyado de forma creíble, sin flotar.

No agregar envoltorio film o empaque adicional si el producto no lo tiene en esta vista. Si el producto se pidió sin empaque, mostrar solo la carne. Si la referencia exige empaque, mantenerlo de forma fiel.

No agregar textos, logos, etiquetas inventadas, ficha técnica, bordes, decoración ni elementos gráficos. No cocinar el producto ni transformarlo en preparación.

Dejar margen de seguridad alrededor del producto para que el software pueda recortar e insertar la imagen en el marco secundario correspondiente.
```

### 3.4 — Secundaria 3 / caja o presentación comercial

> El más trabajado. La caja no debe verse como mockup: debe parecer una caja real fotografiada en
> estudio. La cantidad de unidades se ajusta al producto.

```
A partir de la imagen de referencia adjunta, crear una fotografía secundaria de caja o presentación comercial para catálogo TodoCarnes del producto {{producto}}, correspondiente al corte {{corte}} de la categoría {{categoria}}.

Generar una sola imagen aislada, sin maqueta, sin módulos, sin ficha técnica y sin composición de catálogo. La fotografía debe mostrar únicamente la caja o presentación comercial del producto, centrada sobre fondo blanco o gris muy claro.

Mostrar el producto dentro de una caja de cartón realista, como caja logística abierta usada para alimentos congelados. La caja debe verse como una fotografía real de sesión de producto, no como mockup.

La caja debe ser rectangular, baja y ancha, de cartón kraft café, vista en perspectiva 3/4 desde arriba. Debe tener proporciones creíbles, textura de cartón real, pequeñas imperfecciones naturales, dobleces, líneas de corrugado, pliegues, sombras internas y leves irregularidades en los cantos.

Las alas o solapas de la caja no deben dominar la imagen ni verse exageradamente abiertas. La caja debe verse completa, sin cortes en las esquinas ni bordes fuera de encuadre. Dejar margen de seguridad suficiente alrededor de toda la caja.

El interior debe estar forrado con bolsa plástica transparente o film interior, ligeramente arrugado, con reflejos suaves y realistas. El plástico puede cubrir parcialmente los bordes internos de la caja, como embalaje real de producto congelado.

Dentro de la caja debe ir el producto {{producto}}, respetando la referencia enviada: tipo de corte, forma, color, textura, grasa visible, hueso si corresponde, piel si corresponde, empaque si corresponde y estado crudo, congelado o envasado.

La cantidad de unidades en caja debe ajustarse al producto real. Si existe una indicación comercial, respetarla. Por ejemplo:
- costillar: aproximadamente 7 unidades por caja, congeladas, no necesariamente ordenadas;
- pollo entero: 8 unidades por caja;
- pulpa o cortes grandes: 4 unidades por caja;
- trimming: piezas sueltas en caja, no ordenadas;
- cortes porcionados: varias unidades visibles, distribuidas de manera natural.

Los productos deben verse apoyados naturalmente dentro de la caja, no flotando, con sombras de contacto reales y volumen. La disposición puede ser operativa y comercial, no excesivamente perfecta.

Evitar que la caja se vea plástica, demasiado limpia, demasiado simétrica o generada artificialmente. No usar bordes perfectos ni una caja rígida falsa. Debe parecer una caja real fotografiada en estudio.

No agregar textos, logos inventados, códigos, sellos, marcas ni gráfica adicional en la caja. Si la caja real tiene una marca visible en la referencia, mantenerla solo si corresponde; si no está en la referencia, no inventarla.

No cocinar el producto. No transformarlo en preparación. Mantenerlo crudo, congelado o envasado según corresponda.

El resultado debe parecer una fotografía profesional de presentación comercial para catálogo TodoCarnes.
```

## 4. Guardrails (aplican a todas las vistas)

**Fidelidad:** basar en la referencia; no cambiar corte, producto ni categoría; respetar forma,
proporciones, textura, volumen; mantener hueso/piel/grasa si el producto los tiene; mantener el
estado (crudo/fresco/congelado/envasado/vacío) de la referencia.

**Empaque:** no inventar etiquetas, códigos, sellos, marcas, logos, info nutricional, fechas, lotes,
pesos ni procedencias. Mantener el empaque de la referencia si existe; si se pidió sin empaque, no
agregar film/bolsa/vacío. La bolsa interior de la caja (§3.4) es la única excepción.

**Composición:** una sola foto aislada por prompt; nunca la lámina completa ni los 4 marcos en una
imagen; sin header/logo/menú/ficha/footer/número de página; sin textos, marcos, bordes fuertes,
elementos gráficos ni diagramación editorial.

**Estilo:** fondo blanco o gris muy claro; luz de estudio; alta nitidez; sombras suaves; producto
centrado con margen; realista y premium; B2B; sesión real, no mockup.

**Alimentos:** no cocinar, grillar, dorar, salsear ni emplatar; no convertir en receta; no sumar
ingredientes que cambien la lectura. Pimienta y romero **solo** en la imagen principal, sutiles.

## 5. Criterios de aceptación

**Aceptar si:** el producto y el corte se reconocen y coinciden con la referencia; textura realista
(no plástica); color natural; fondo limpio; producto centrado con margen; sin textos ni gráficos
agregados; sin etiquetas/códigos/marcas/sellos inventados; no cocinado; la caja (si aparece) se ve
real, completa y con la cantidad correcta; los secundarios muestran vistas distintas y útiles.

**Descartar y regenerar si:** cambió el producto o corte; parece cocido/grillado; inventó
etiqueta/logo/código/sello/marca; agregó texto o ficha; generó la lámina completa en vez de una foto;
la caja se ve mockup, cortada, con alas dominantes, o el producto flota; carne plástica o sin
textura; fondo sucio; agregó film cuando se pidió sin empaque; los módulos 2 y 3 muestran empaque
cuando debían mostrar solo carne; cantidad en caja incorrecta; imagen borrosa o sin volumen.

**Re-pedir con instrucciones simples**, por ejemplo:
- "Rehacer manteniendo el mismo producto y vista, pero mejorar la textura de la carne para que se vea
  más realista y menos plástica."
- "Rehacer la caja: debe verse como caja real de cartón kraft fotografiada en estudio, no mockup. No
  cortar esquinas ni bordes."
- "Rehacer los módulos 2 y 3 sin empaque ni film. Solo el producto desde dos ángulos distintos sobre
  fondo blanco."
- "Rehacer con más margen alrededor del producto para que el software pueda recortar sin cortar
  bordes."

## 6. Flujo operativo

1. El comercial sube una foto del producto (`source`).
2. *(Opcional)* El sistema normaliza la foto (§2) → `source` limpio.
3. El sistema genera 4 imágenes separadas: hero, empaque/frontal, lateral, caja.
4. El software inserta cada imagen en su marco (`ProductPageTemplate`).
5. El usuario revisa fidelidad, realismo y limpieza.
6. Si hay error, se regenera **solo la vista afectada**, no toda la ficha.

La IA no compone la ficha. Solo entrega fotos limpias, aisladas y fieles al producto real.
