# Hitos y tareas

Estado vivo del proyecto. **Claude lo actualiza al autorizar cada hito.**
El detalle ejecutable de cada uno vive en `prompts/milestones/`.

---

## Estado

| Hito | Rama | Estado | Prompt |
|---|---|---|---|
| **M0** — Setup | `feature/m0-setup` | ✅ Mergeado | [m0-setup.md](../prompts/milestones/m0-setup.md) |
| **M1** — Plantilla + PDF | `feature/m1-template-pdf` | ✅ Mergeado | [m1-template-pdf.md](../prompts/milestones/m1-template-pdf.md) |
| **M2** — DB + Auth | `feature/m2-db-auth` | ✅ Mergeado | [m2-db-auth.md](../prompts/milestones/m2-db-auth.md) |
| **M3** — Productos | `feature/m3-products` | ✅ Mergeado | [m3-products.md](../prompts/milestones/m3-products.md) |
| **M4** — Imágenes | `feature/m4-images` | ✅ Mergeado | [m4-images.md](../prompts/milestones/m4-images.md) |
| **M5** — Constructor | `feature/m5-builder` | ✅ Mergeado (Claude dev) | [m5-builder.md](../prompts/milestones/m5-builder.md) |
| **M6** — IA real | `feature/m6-ai` | ✅ Mergeado | [m6-ai.md](../prompts/milestones/m6-ai.md) |
| **M7** — Polish | `feature/m7-polish` | 🟨 En curso | [m7-polish.md](../prompts/milestones/m7-polish.md) |

Leyenda: ⬜ Pendiente · 🟨 En curso · 🟧 En auditoría · 🟥 Devuelto · ✅ Mergeado

### Lo que M1 dejó probado

El riesgo grande del proyecto está cerrado. Verificado sobre el PDF exportado, no en el navegador:

- `pdfinfo` del export y del catálogo de julio dan la **misma línea**: `Page size: 1440 x 810 pts`.
- `pdffonts`: solo Montserrat, embebida y subseteada. Sin fallbacks.
- Comparación rasterizada contra la página 5 del catálogo real: la ficha es fiel.
- Casos límite OK: título largo hace wrap, código multilínea renderiza como lista, campo nulo no
  rompe la caja.

Herramienta: `brew install poppler` → `pdfinfo`, `pdffonts`, `pdftoppm`. **Es como se auditan los
hitos visuales.** Para comparar contra el catálogo real:

```bash
pdftoppm -png -r 72 -f 5 -l 5 "-context/.../Todo Carnes - Catálogo v01-light.pdf" julio_p5
pdftoppm -png -r 72 salida.pdf export
```

---

## Por qué este orden

**La plantilla y el PDF van primero, antes que el CRUD.**

Los dos riesgos reales del proyecto son la fidelidad visual y el export. Ambos se resuelven contra
datos mock, sin base de datos. Construir el CRUD primero significaría descubrir en la última semana
que el PDF no se parece al catálogo — cuando ya no hay tiempo de arreglarlo.

M6 (IA real) va al final porque depende de la verificación de organización de OpenAI, que es externa
y puede tardar días. Con el default en mock, si no llega, la demo corre igual.

---

## M0 — Setup

**Listo cuando:** un "hello world" con Montserrat vive en una URL pública.

1. `create-next-app` (TS, Tailwind, App Router). Estructura de `architecture.md`.
2. Montserrat (300/400/500/600/700) a `/public/fonts` en woff2. `@font-face` con
   `font-display: block`. **Sin CDN.**
3. Tokens de `assets.md` en `tailwind.config.ts`: `navy`, `blue`, `blue-mid`, `blue-50`,
   `gray-50`, `ink`.
4. `Dockerfile` desde `mcr.microsoft.com/playwright:v1.5x-jammy`. Deploy a Railway.
   `.env.example` con todas las vars, sin valores.

## M1 — Plantilla + PDF · *el hito crítico*

**Listo cuando:** se descarga un PDF de 1 ficha, con Montserrat, que superpuesto al SVG calza.
Sin DB, sin auth.

5. `CatalogPage.tsx`: `<section>` fijo 1440×810, `break-after: page`, prop `scale` para preview.
6. `ProductPageTemplate.tsx` con la geometría de `assets.md`. Esqueleto de cajas primero,
   superponer, y recién ahí contenido. Contrato: título largo hace wrap; campo vacío → `—`;
   valores con `\n` como lista.
7. `styles/print.css`: `@page { size: 1440px 810px; margin: 0 }`.
8. `/print/[catalogId]` con el producto `CF-1608` hardcodeado. `window.__CATALOG_READY__` tras
   `document.fonts.ready` + `img.decode()`.
9. `/api/catalogs/[id]/export`. Proteger `/print` con `PRINT_TOKEN`.
10. **Validar contra el SVG por superposición y adjuntar captura.** Es el gate del proyecto.

## M2 — DB + Auth

**Listo cuando:** un commercial entra y no puede ver `/settings` — verificado pegando la URL, no
escondiendo el botón.

11. Proyecto Supabase. Migración con el schema de `architecture.md`, incluido el índice único
    parcial. RLS deny-all en todas las tablas.
12. `lib/supabase/{server,client,admin}.ts`. El admin client solo importable desde server.
13. Login con Supabase Auth SSR + cookies. Middleware que protege `(dashboard)`.
14. `lib/auth/requireRole.ts`. `/settings` solo admin.
15. Seed idempotente de categorías, cortes y settings. `npm run seed`.

## M3 — Productos

**Listo cuando:** un producto creado en la UI se ve en su preview.

16. `lib/validators/product.ts` (zod), compartido por form y actions.
17. Actions de productos. Todas con `requireRole` + zod.
18. `/products`: tabla, filtros, búsqueda, paginación simple.
19. `/products/new` y `/products/[id]`: form + `ProductPageTemplate` en vivo al costado.
20. Seed de los ~8 productos.

## M4 — Imágenes

**Listo cuando:** el ciclo completo de slots corre con el mock.

21. `lib/images/provider.ts` + `mock.ts`.
22. Bucket `product-images`. Upload de fuente con validación de MIME/tamaño, nombre uuid.
23. UI de galería: 4 slots con estado, generar, subir manual, aprobar, rechazar.
24. Actions de imágenes. `approveImage` degrada el aprobado previo del slot (transacción).
25. `prompt-builder.ts`: base de `settings` + variante por slot, interpolando datos del producto.

## M5 — Constructor

**Listo cuando:** se exporta un PDF multi-página con orden e índice correctos.

26. Actions de catálogos + `/catalogs`.
27. `/catalogs/[id]`: selector, orden por drag, agrupación por categoría.
28. `lib/pdf/page-order.ts`: función pura. **La única pieza con test unitario obligatorio.**
29. `CatalogCover`, `CatalogIndex` (derivado de los items), `CategoryDivider`.
30. `/print` real desde DB. `/catalogs/[id]/preview`.
31. Export multi-página → Storage + `catalog_exports` + `status='exported'`.

## M6 — IA real

**Listo cuando:** una imagen real generada desde una fuente, aprobada, y visible en el PDF.

32. `lib/images/openai.ts`: `images.edit` con gpt-image-1 + fuente. Selección por `IMAGE_PROVIDER`.
33. Tope diario contra `image_generation_jobs`, server-side.
34. Errores con mensaje humano. Nunca filtrar el body de OpenAI a la UI.
35. `/settings` → estado OpenAI, uso del día, editor de prompts.
36. Historial de generaciones para Admin.

## M7 — Polish

**Listo cuando:** un no-técnico completa el flujo entero sin ayuda.

37. Dashboard con sus métricas.
38. Calibración visual final contra el catálogo real.
39. Estados vacíos, loading y error en cada pantalla.
40. Guion de demo de 5 min en `README.md`.

---

## Criterios de aceptación del MVP

De `handoff.md` §21. Para considerar la demo lista:

- [ ] Usuario puede iniciar sesión
- [ ] Hay roles admin/commercial
- [ ] Usuario puede crear y editar productos
- [ ] Producto tiene todos los campos técnicos
- [ ] Usuario puede cargar imágenes manualmente
- [ ] Se puede crear un catálogo mensual y seleccionar productos
- [ ] Se previsualiza una ficha con diseño similar al catálogo
- [ ] Se genera índice automático y separadores por categoría
- [ ] Se puede exportar PDF
- [ ] La API Key de OpenAI no está expuesta
- [ ] Existe estructura lista para IA real
- [ ] El prototipo corre en deploy público protegido por login
