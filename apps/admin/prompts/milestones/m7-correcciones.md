# M7 — Correcciones post-auditoría

> **Estado: DEVUELTO.** El hito está casi entero y bien hecho, pero hay un bug que deja el PDF
> exportado inservible. No se abre el PR hasta que P0 y P1 estén cerrados.
>
> Rama: seguí en `feature/m7-polish`. Commits con prefijo `m7:`. **No abras el PR.**

Auditado sobre `5a138cb`. `tsc`, `lint` y los 15 tests pasan limpios — el problema no lo agarra
ninguno de los tres, por eso hay que arreglarlo *y* dejar un check que lo detecte.

---

## P0 — El PDF exportado sale con la portada y 15 páginas en blanco

**Bloquea la demo entera.** El PDF es el momento de la reunión y hoy no existe.

### El diagnóstico

En `app/globals.css` (commit `5a138cb`) agregaste:

```css
body { max-width: 100%; overflow-x: hidden; }
html { max-width: 100%; overflow-x: hidden; }
```

`overflow` en el elemento raíz convierte a `html` en contenedor de scroll. Chromium entonces deja de
paginar en `page.pdf()`: pinta la primera página y descarta todo lo que sigue.

### La evidencia

Replicando el export exacto (mismo `page.pdf`, `scale: 4/3`, 20in×11.25in) sobre el catálogo del seed:

| | páginas | peso | contenido |
|---|---|---|---|
| Como está hoy | 16 | 480 KB | pág. 1 con contenido, **págs. 2–16 en blanco** |
| Con `overflow-x: visible` inyectado | 15 | 5,7 MB | las 15 con contenido |

Las páginas en blanco pesan 2.520 bytes cada una rasterizadas a 50 dpi; la portada, 194 KB.

El DOM de `/print` está **perfecto**: 15 `<section>` de 810px contiguas, `break-after: page` en las 14
primeras, `bodyScrollWidth` 1440, cero errores de consola. No toques la plantilla — el daño es
únicamente la regla de CSS.

### El fix

Scopeá la regla a pantalla, que es donde la necesitás para el responsive:

```css
@media screen {
  html,
  body {
    max-width: 100%;
    overflow-x: hidden;
  }
}
```

Si el responsive necesita algo más, que viva en un wrapper del layout del dashboard
(`app/(dashboard)/layout.tsx`), **nunca en `html`/`body`**.

### Cómo verificar (obligatorio, no a ojo)

`pdfinfo` y `pdffonts` **pasan igual con el PDF roto** — por eso se coló. Exportá y comprobá que
ninguna página esté en blanco:

```
pdftoppm -png -r 50 catalogo.pdf /tmp/pg && ls -l /tmp/pg*.png
```

Ninguna debe pesar ~2,5 KB. Alternativa más barata: `pdftotext catalogo.pdf - | wc -l` sobre la
última página.

**Agregá esa verificación a `docs/audit-checklist.md`**, junto a los ítems de `pdfinfo`/`pdffonts`,
redactada como "ninguna página del PDF sale en blanco" con el comando al lado. El checklist tenía un
agujero y este bug pasó por ahí.

---

## P1 — La ficha con 5 variantes se desborda sobre el footer

En la página de Pollo Entero del PDF, la fila **PROCEDENCIA / BRASIL sale cortada** por el footer.

El bloque de campos arranca en `top-[364px]` y no tiene techo:

- tabla de variantes: ~336px (cabecera ~26 + 5 filas de ~62)
- Marca + Procedencia: 132px (2 × 66)
- total: 364 + 468 = **832px**, y el footer empieza en **760px**

La causa directa de que las filas midan 62px y no 46px es el ancho de las columnas: en
`components/templates/parts/ProductVariantTable.tsx`, `grid-cols-[1.2fr_1fr_0.9fr_1fr]` deja la
columna **Unidades** tan angosta que "8 UNIDADES X CAJA" se parte en tres líneas.

**Fix:**

1. Reproporcioná las columnas para que el contenido real del seed entre en **una línea por celda**.
   Formato es la columna larga; Unidades necesita más aire que Código.
2. Bajá el tamaño de fuente de las celdas si hace falta (hoy `text-[11px]`).
3. Acotá el bloque: con el peor caso del seed (5 variantes + Marca + Procedencia) todo tiene que
   quedar **por encima de los 760px**. Si con eso no alcanza, comprimí la altura de fila de
   `min-h-[46px]` a lo que entre.

Probá con 1, 2, 5 y 8 variantes. Con 8 tiene que seguir sin pisar el footer — degradá como sea
razonable (filas más bajas), pero que nunca se corte.

**No cambies el layout del producto simple** (una sola variante sigue con las 6 filas de campos).
Eso hoy está bien: verificá que siga así.

---

## P2 — Menores

**P2.1 — El editor de variantes deja escribir más de lo que el schema acepta.**
`components/products/ProductVariantEditor.tsx` pone `maxLength={240}` en cada input, pero el límite
del schema aplica al campo **joineado con `\n`**, y `code` corta en **160**
(`lib/validators/product.ts:15`). Con suficientes variantes el guardado falla con un error de
validación en plena demo. Calculá el `maxLength` de cada input contra el presupuesto real del campo
(o validá al agregar fila y avisá antes, no al guardar).

**P2.2 — Una variante vacía dispara el modo tabla.** Si agregás una fila y la dejás en blanco, los 4
campos quedan con un `\n` final, `hasMultipleVariants` da `true` y la ficha pasa a tabla con una fila
entera de `N/A`. Al serializar, descartá las filas donde los 4 campos están vacíos.

**P2.3 — Métrica duplicada en el dashboard.** En `app/(dashboard)/dashboard/page.tsx`, la tarjeta
"Catálogos publicados" recibe `value={data.exportedCatalogs}` y además
`detail={`${data.exportedCatalogs} publicados`}`: muestra el número y abajo lo repite. Sacá el
`detail` o cambiá la tarjeta por algo que aporte.

---

## P3 — Alcance: lo que agregaste de más

Fuera del prompt de M7 aparecieron tres features:

| Qué | Archivos | Veredicto |
|---|---|---|
| Envío de catálogo por email | `components/catalogs/SendCatalogEmail.tsx` | Mock, rotulado. **Se queda.** |
| Tendencia de precios | `components/dashboard/ProductPriceTrend.tsx` | Mock, rotulado. **Se queda.** |
| Perfil de usuario + firma | `app/(dashboard)/profile/`, `components/profile/*`, `lib/actions/profile.ts`, migración `20260726000000_profile_signature.sql` | **Se queda, pero se congela.** |

El perfil trae un **cambio de esquema**, que el prompt listaba explícitamente como fuera de alcance.
Se queda porque la migración ya está aplicada en el remoto y revertirla a días de la reunión es más
riesgo que beneficio — no porque haya estado bien agregarla.

**Lo que tenés que hacer:**

1. **No agregues ni una feature más en esta rama.** Solo P0, P1 y P2.
2. Documentá las tres en `docs/tasks.md`, en M7, bajo un encabezado
   **"Agregado fuera del alcance original"**, con una línea cada una explicando qué son y que los dos
   primeros son mocks.
3. Verificá que la migración esté en el archivo versionado y que un `db push` desde cero la aplique
   sin romper: el `alter column contact_email set not null` corre después de un backfill desde
   `auth.users`, así que en una base donde algún `profile` no tenga usuario de auth va a explotar.
   Si ese caso es posible, dejá el backfill defensivo.

Si algo de esto te parece mal, **decilo antes de tocarlo** — no lo resuelvas por tu cuenta.

---

## Lo que está bien y no hay que tocar

Auditado y aprobado: A1 raíz, A2 filtros (`z.preprocess` + test), A3 miniaturas, A5 footer, B3
mayúsculas y `N/A`, B4 divisor, B5 fondos con `priority`, C tarjetas colapsables, D etiquetas en
`catalogStatusLabels`, E `filename*=UTF-8''`, F tabla de variantes (el concepto; el sizing es P1), G
login centrado, H watermark en la plataforma y **no** en el PDF, I dashboard.

**No refactorices nada de eso.** Esta rama solo corrige lo de arriba.

---

## Definición de terminado

- [ ] `npm run build`, `tsc --noEmit`, `lint` y `npm test` limpios. Cero `any`
- [ ] **P0:** el PDF exportado tiene 15 páginas y **ninguna en blanco**, verificado con `pdftoppm`
- [ ] `pdfinfo` sigue dando `1440 x 810 pts` y `pdffonts` solo Montserrat
- [ ] El check de "ninguna página en blanco" está agregado a `docs/audit-checklist.md`
- [ ] **P1:** la ficha de Pollo Entero entra completa; Procedencia no la pisa el footer
- [ ] Con 8 variantes la ficha sigue sin desbordar
- [ ] La ficha de un producto de una sola variante quedó igual que antes
- [ ] **P2.1/P2.2/P2.3** cerrados
- [ ] **P3:** las tres features documentadas en `docs/tasks.md`; ninguna feature nueva
- [ ] El resto del hito quedó intacto

## Trampas conocidas

1. **"Arreglar" el overflow tocando la plantilla de impresión.** El DOM de `/print` está correcto y
   medido. El bug es una regla de CSS global. No toques `CatalogPage`, `CatalogPages` ni
   `break-after`.
2. **Confiar en `pdfinfo`/`pdffonts`.** Pasan con el PDF roto. Rasterizá.
3. **Arreglar el desborde subiendo el bloque de campos.** `top-[364px]` está calibrado contra el
   catálogo real. El problema es el alto de las filas, no dónde empieza.
4. **Romper el producto simple** al reproporcionar la tabla.
5. **Aprovechar el viaje para meter una feature más.** No.

## Entrega

Commiteá en `feature/m7-polish` con prefijo `m7:`. **No abras el PR.**

Reportá: el PDF exportado con el conteo de páginas y el peso de cada una rasterizada, capturas de la
ficha de Pollo Entero antes y después, y qué probaste con 8 variantes.
