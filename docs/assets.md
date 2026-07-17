# Assets y sistema visual

Todo lo de este documento salió de inspeccionar los archivos originales de Studio Nomade:
`Todo Carnes - Catálogo v01.svg` y `Todo Carnes - Catálogo v01-light.pdf` (48 páginas, julio 2026).
Viven en `-context/`, que **no se versiona** — pedilos si los necesitás.

**Regla de precedencia:** si el PDF y el SVG difieren, el **SVG manda para la ficha de producto**
y el PDF manda para la estructura general del catálogo.

---

## Lienzo

**1440 × 810 puntos** = **1920 × 1080 CSS px** a 96 DPI.
Son la misma página física, en dos unidades.

| Evidencia | Valor |
|---|---|
| MediaBox del PDF | `0 7.92 1440 817.92` → 1440 × 810 **pt** |
| viewBox del SVG | `0 0 1440 810` (espacio de coordenadas, en pt) |
| width/height del SVG | 1920 × 1080 (**px**) |

El handoff no estaba equivocado: 1920×1080 es la medida en píxeles de la misma página. 1440×810 es
la misma medida en puntos.

**La plantilla se maqueta en 1440×810 CSS px** — es el espacio de coordenadas del viewBox, y toda la
geometría de este documento vive ahí. **El export escala ×4/3 para que el PDF salga en 1440×810 pt**,
idéntico al catálogo real. Ver `architecture.md` §Export PDF.

---

## Tipografía

**Montserrat.** Confirmado: el PDF embebe 6 subsets — Light, Regular, Medium, SemiBold, Bold, BoldItalic.

Se auto-hospeda en `/public/fonts/*.woff2` con `@font-face { font-display: block }`.

**No usar el CDN de Google Fonts.** Chromium headless renderiza con la fuente fallback antes de que
el CDN responda, y el PDF exportado sale con la tipografía equivocada. Es un fallo silencioso: se ve
bien en el navegador y mal en el PDF.

Pesos a incluir: 300, 400, 500, 600, 700.

---

## Paleta

Frecuencia contada sobre el SVG.

| Token Tailwind | Hex | Ocurrencias | Uso observado |
|---|---|---|---|
| `ink` | `#424242` | 137 | Texto. El color dominante |
| `blue` | `#8ab1fd` | 67 | Acentos, indicadores |
| `navy` | `#0d244f` | 21 | Fondos institucionales, tab activo |
| `white` | `#ffffff` | 10 | Fondo de ficha |
| `gray-50` | `#f8f8f9` | 5 | Fondos de bloque |
| `blue-mid` | `#98c0fd` | 2 | Variante de acento |
| `blue-50` | `#eff4fe` | 1 | Fondos suaves |

Se declaran en `tailwind.config.ts`. **Cero hex sueltos en el JSX** — es un ítem de auditoría.

---

## Geometría de la ficha de producto

Coordenadas absolutas en el lienzo 1440×810, extraídas de los `clipPath` del SVG.

```
Header                x 0    y 0     1440 × 121
Logo                  x 28   y 30     124.5 × 66
Tab categoría activa  x 815  y 0      136 × 121
Indicador tab activo  x 815  y 122    136 × 5
Sub-nav de cortes     x 815  y 122    625 × 33     (alineada a la derecha)

Columna de datos      x 0    y 0      469 × 760    (panel izquierdo)
  Eyebrow             x 42   y ~181-219
  Título              x 44   y ~343
  Filas de campo      íconos x 35-53 · texto x 141
                      y = 392, 458, 526, 591, 655, 721    (pitch 66, 6 campos)
                      caja de label 129 × 22

Imagen principal      x ~469 y ~155  → 1440 × 580   (la zona restante)

Imagen secundaria 1   x 510  y 591    272 × 169
Imagen secundaria 2   x 802  y 591    272 × 169     ← normalizado, ver abajo
Imagen secundaria 3   x 1094 y 591    272 × 169

Footer                x ~278 y ~789
```

### Las secundarias: usar la grilla normalizada

El SVG trae la caja central en `x = 806.98` y la tercera en `x = 1094.09`, con gaps desiguales de
24px y 16px. **Es un descuadre del arte original, no una decisión de diseño.**

Usar `x = 510 / 802 / 1094`: tres cajas de 272 con gaps exactos de 20, terminando en 1366.
El 1094 coincide con el original, así que solo se corrige la del medio.

### Los 6 campos técnicos

En el orden del catálogo, uno por fila:

1. Código
2. Marca
3. Procedencia
4. Peso Caja
5. Formato
6. Unidades

**Los valores van en MAYÚSCULAS.** El catálogo real muestra `LITERA MEAT`, `ESPAÑA`, `18 KG APROX`,
`3-4 KG POR UN`. Es estilo de la plantilla, no del dato: el dato se guarda con su case natural
(`Brasil`, `Vacío`) y la ficha lo transforma. Así el formulario de M3 se lee normal y la ficha sale
como el catálogo.

**El campo vacío se muestra `N/A`**, no `—`. Confirmado contra la página 5 del catálogo de julio,
donde Unidades dice `N/A`. El handoff §9 permitía `N/A`, `-` o vacío; el catálogo real usa `N/A`.

---

## Cómo calibrar

Los números de arriba son el **esqueleto confirmado**: posiciones y tamaños de caja.

Lo que **no** se puede extraer por parsing: tamaños de fuente, pesos por elemento, tracking,
line-height, y el color exacto de cada pieza. Razón: **todo el texto está vectorizado** — el SVG
tiene 0 elementos `<text>` y el PDF usa encodings de subset custom. No hay copy extraíble.

El método, en este orden:

1. Maquetar el **esqueleto de cajas** con fondos de color plano, sin contenido.
2. Superponer al SVG en el navegador (mismo lienzo, opacidad 50%) y ajustar hasta que calce.
3. **Recién ahí** meter contenido, y calibrar tipografía a ojo contra el SVG.

Al revés se pierde un día. Está en las trampas conocidas de M1 por algo.

---

## Diferencias conocidas contra el catálogo real

Salieron de rasterizar el PDF exportado en M1 y compararlo contra la página 5 del catálogo de julio.
Ninguna es estructural. **Se cierran en M7.**

| Diferencia | Estado |
|---|---|
| Valores de campo en mayúsculas | Documentado arriba. Falta aplicarlo en la plantilla |
| Vacío = `N/A`, no `—` | Documentado arriba. Falta aplicarlo |
| El divisor va **entre el título y los campos**; hoy está entre el eyebrow y el título | Falta mover |
| El logo tiene recuadros visibles alrededor del isotipo y del texto | Bloqueado: falta el logo vectorial |

---

## Assets que faltan

Nadie los entregó todavía. `-context/` solo trae los 2 PDFs y el SVG.

- **Logo vectorial.** El del SVG está embebido como PNG de 1800px escalado a 0.069. El PNG que se
  extrajo para M1 **trae recuadros visibles** alrededor del isotipo y del wordmark que el catálogo
  real no tiene — se ven en el PDF exportado. Es el asset faltante más urgente: es lo único que hoy
  delata que la ficha no es la original.
- **Íconos de categoría** (Cerdo, Pollo, Vacuno, Trimming). Usados en índice, separadores y header.
- **Íconos de los 6 campos técnicos.**
- **Elementos gráficos de fondo** de portada y separador de categoría.
- **Copy fijo** de portada y cierre: razón social, texto institucional, contacto. No es extraíble
  del PDF porque está vectorizado.

Mientras no lleguen: placeholders en `/public/placeholders`. No bloquean M1, que es solo la ficha.
Sí bloquean la calibración final de M5 y M7.

---

## Estructura del catálogo (del PDF de julio)

48 páginas. Cuatro tipos de página:

1. **Portada** — logo, mes/año, texto institucional, fondo azul con gráficos.
2. **Índice** — categorías con íconos, cortes activos.
3. **Separador de categoría** — nombre, ícono, lista de cortes incluidos, fondo azul.
4. **Ficha de producto** — la que importa. Se repite decenas de veces y es la que el cliente mira
   de cerca. 80% del valor y 80% del riesgo del proyecto.
