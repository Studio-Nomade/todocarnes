# Creador de Catálogo Digital — Todo Carnes

Herramienta interna para que Todo Carnes arme su catálogo comercial mensual: base de productos
centralizada → selección → preview con su identidad visual → export PDF.

Hoy son **48 páginas maquetadas a mano cada mes**, dependiendo del equipo de diseño de Studio Nomade,
sin una base de productos reutilizable entre meses.

> **Estado: MVP completo, en calibración final para la demo.** El flujo de productos, imágenes,
> armado de catálogo y exportación PDF está operativo.

---

## Qué es esto

Un MVP para una reunión comercial con Todo Carnes. **Es una herramienta de venta, no la intranet
final.**

El valor central es ordenar la base de productos y sacar al diseñador del camino crítico. La
generación de imágenes con IA es el diferenciador del pitch, no el argumento.

---

## Cómo se trabaja

Tres roles, un loop:

```
Claude   planifica, escribe los prompts de hito, audita
Codex    implementa
Sebastián aprueba y mergea
```

```
Claude escribe prompts/milestones/mN.md
   ↓
Codex crea feature/mN-slug desde develop, implementa, commitea — NO abre el PR
   ↓
Claude audita el diff LOCAL con docs/audit-checklist.md  →  PASA | DEVUELTO
   ↓
Codex corrige si fue devuelto
   ↓
Claude autoriza → Sebastián abre el PR a develop y mergea → se libera el hito siguiente
```

**Codex no abre el PR.** La auditoría ocurre antes. Ese es el punto de todo el arreglo.

### Ramas

```
main       ← releases. Protegida
develop    ← integración. Base de todo feature
feature/mN-slug   ← un hito cada una. Sale de develop, muere en develop
```

Commits con prefijo de hito: `m1: add ProductPageTemplate`. El historial se lee como el roadmap.

---

## Los hitos

Estado vivo en [`docs/tasks.md`](docs/tasks.md).

| | Hito | Listo cuando |
|---|---|---|
| **M0** | Setup | Un "hello world" con Montserrat vive en una URL pública |
| **M1** | **Plantilla + PDF** | Se descarga un PDF de 1 ficha que superpuesto al SVG calza |
| **M2** | DB + Auth | Un commercial recibe 403 al pegar `/settings` en la URL |
| **M3** | Productos | Un producto creado en la UI se ve en su preview |
| **M4** | Imágenes | El ciclo completo de slots corre con el mock |
| **M5** | Constructor | Se exporta un PDF multi-página con orden e índice correctos |
| **M6** | IA real | Una imagen real generada desde una fuente, aprobada, en el PDF |
| **M7** | Polish | Un no-técnico completa el flujo entero sin ayuda |

**M1 va antes que el CRUD, a propósito.** Los dos riesgos reales del proyecto son la fidelidad visual
y el export PDF; ambos se resuelven contra datos mock, sin base de datos. Construir el CRUD primero
significaría descubrir en la última semana que el PDF no se parece al catálogo.

M6 va al final porque depende de la verificación de organización de OpenAI, que es externa y puede
tardar días. El default es mock: si no llega, la demo corre igual.

---

## Stack

```
Next.js 15 (App Router) + TypeScript + Tailwind
  ├── Server Actions ──► Supabase (Postgres + Storage) vía service role
  ├── Supabase Auth (cookies SSR)
  ├── Route Handler /api/export ──► Playwright (Chromium, mismo contenedor)
  └── lib/images/provider ──► mock | gpt-image-1  (env flag)

Deploy: Railway (Docker, imagen mcr.microsoft.com/playwright)
```

**No Vercel.** Playwright sobre serverless obliga a `@sparticuz/chromium`, choca contra el límite de
bundle y sufre cold starts — justo sobre la feature estrella de la demo. La única ventaja de Vercel
(DX de edge) no aporta nada acá; su desventaja (no hay Chromium) es exactamente nuestro core.

Detalle completo y las razones: [`docs/architecture.md`](docs/architecture.md).

---

## Arrancar (desde M0)

```bash
cp .env.example .env.local   # completar
npm install
npm run dev
```

Los assets originales (PDF de julio, SVG de la hoja tipo) viven en `-context/`, que **no se
versiona** — pedilos si tu hito los necesita.

### Supabase y seed

El schema vive en `supabase/migrations/`. Para una instancia local:

```bash
npx supabase start
npx supabase db reset
# copiar URL, anon key y service role key a .env.local
npm run seed
```

Para un proyecto remoto de desarrollo, primero vinculalo con `npx supabase link`, aplicá la migración
con `npx supabase db push` y luego ejecutá `npm run seed`. El seed usa las credenciales `SEED_*`, es
idempotente y crea los usuarios mediante Supabase Auth Admin.

Los perfiles se crean automáticamente con el trigger `on_auth_user_created` sobre `auth.users`; el
seed actualiza después nombre, rol y estado. Todas las tablas públicas tienen RLS activo sin
políticas para `anon` o `authenticated`; las operaciones de datos pasan por el cliente service role
después de validar la sesión y el rol en el servidor.

---

## Documentación

| Archivo | Qué tiene |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | **La fuente de verdad técnica.** Stack, modelo de datos, export PDF, seguridad |
| [`docs/assets.md`](docs/assets.md) | Geometría de la ficha, paleta, tipografía, cómo calibrar |
| [`docs/tasks.md`](docs/tasks.md) | Los 8 hitos y su estado |
| [`docs/audit-checklist.md`](docs/audit-checklist.md) | Con qué se audita cada hito |
| [`docs/handoff.md`](docs/handoff.md) | El brief original del cliente |
| [`prompts/codex-dev.md`](prompts/codex-dev.md) | Reglas permanentes de Codex |
| [`prompts/claude-planner.md`](prompts/claude-planner.md) | El rol de Claude |
| [`prompts/milestones/`](prompts/milestones/) | El prompt ejecutable de cada hito |

---

## Tres hechos que corrigen el brief

De inspeccionar los archivos originales. `docs/handoff.md` dice otra cosa en estos tres puntos; los
assets mandan.

1. **El lienzo es 1440×810**, no 1920×1080. MediaBox `0 7.92 1440 817.92`, viewBox `0 0 1440 810`.
   Mismo 16:9 a escala 1.333.
2. **La tipografía es Montserrat**, auto-hospedada. Nunca por CDN: Chromium headless renderiza con
   fallback y el PDF exportado sale con otra tipografía. Falla en silencio.
3. **Todo el texto está vectorizado** (0 elementos `<text>` en el SVG). No hay copy extraíble ni
   tipografía medible por parsing — se calibra a ojo contra el SVG.

---

## Guion de demo

Duración objetivo: **5 minutos**. Antes de la reunión, ejecutar `npm run seed`, confirmar que
`APP_URL` apunta al entorno que se va a mostrar y dejar abierto el catálogo de muestra.

### Preparación

- Ingresar con `SEED_COMMERCIAL_EMAIL` y `SEED_COMMERCIAL_PASSWORD` de `.env.local`. No mostrar ni
  compartir el archivo durante la demo.
- Usar el catálogo **Catálogo Oficial Todo Carnes · Julio 2026**, que el seed deja armado.
- Abrir previamente un PDF ya exportado como respaldo.
- Confirmar el provider de imágenes en `IMAGE_PROVIDER`: `openai` para generación real o `mock` para
  una demo determinística sin depender de pago, cuota o conectividad externa.

### Recorrido

**0:00–0:40 — El problema.** En el dashboard, explicar que hoy el catálogo mensual se arma página a
página y que la plataforma convierte ese trabajo repetido en una base comercial reutilizable.
Señalar brevemente los pendientes reales y, como expansión futura, los módulos CRM claramente
rotulados.

**0:40–1:40 — Base de productos.** Entrar a **Productos**, filtrar por categoría y abrir “Pollo
Entero Languiru sin Menudencias”. Mostrar que datos y variantes se editan por filas y que la ficha se
actualiza en vivo.

**1:40–2:35 — Imágenes.** Mostrar los cuatro slots, sus estados y una imagen aprobada. Si el provider
es `openai`, generar solo una vista y explicar que la fuente mantiene la identidad del producto. Si
la generación tarda más de 20 segundos, seguir con una imagen ya aprobada.

**2:35–3:45 — Constructor.** Ir a **Catálogos**, abrir Julio 2026, plegar/desplegar categorías,
reordenar un producto y abrir la previsualización. Destacar que portada, índice, separadores y
numeración se construyen automáticamente.

**3:45–4:40 — El momento PDF.** Exportar y abrir el archivo
`AAMMDD_Catalogo Oficial Todo Carnes - Julio.pdf`. Mostrar que sale listo para enviar, en el orden
elegido y con el formato físico del catálogo oficial.

**4:40–5:00 — Cierre.** Volver al dashboard: la IA acelera la producción visual, pero el valor
principal es una base ordenada y un catálogo publicable sin depender cada mes de maquetación manual.

### Plan de contingencia

- **La IA no responde:** usar una imagen previamente aprobada o cambiar a `IMAGE_PROVIDER=mock` y
  reiniciar el servicio. El resto del flujo no depende de OpenAI.
- **La exportación tarda:** esperar el estado “Generando PDF…” sin recargar. Si supera dos minutos,
  abrir el PDF de respaldo y continuar.
- **El entorno remoto no responde:** ejecutar localmente con `npm run dev`; el seed deja el mismo
  catálogo preparado.
- **Una imagen falta:** la ficha usa un placeholder seguro y el export continúa; el dashboard
  conserva el pendiente para resolverlo después.
