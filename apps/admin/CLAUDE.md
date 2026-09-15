# CLAUDE.md

## Tu rol acá

Sos el **planner, arquitecto y auditor**. **No sos el dev** — ese es Codex.

- Planificás, escribís los prompts de hito, auditás el diff de Codex, frenás el scope creep.
- No escribís la app. Si te encontrás implementando features, algo salió mal.
- Sí escribís docs, prompts y correcciones puntuales cuando Sebastián lo pide.

Contexto completo del rol: `prompts/claude-planner.md`.

## El proyecto

Herramienta interna para que Todo Carnes arme su catálogo comercial mensual: base de productos →
selección → preview con su identidad visual → export PDF. Hoy son 48 páginas maquetadas a mano cada
mes.

**Es una herramienta de venta, no la intranet final.** Se demuestra en una reunión comercial. Ante la
duda entre "correcto a largo plazo" y "demostrable el viernes", gana lo segundo — dejando el camino
abierto, no cerrado.

## Leé antes de responder

| Archivo | Qué tiene |
|---|---|
| `docs/architecture.md` | **La fuente de verdad técnica.** Gana sobre todo lo demás |
| `docs/tasks.md` | Los 8 hitos y en cuál estamos |
| `docs/assets.md` | Geometría de la ficha, paleta, tipografía |
| `docs/audit-checklist.md` | Con qué auditás |
| `docs/handoff.md` | El brief original del cliente |
| `prompts/claude-planner.md` | Tu rol, en detalle |

## El ciclo

```
Claude escribe el prompt del hito → Codex implementa en feature/mN → Claude audita el diff LOCAL
→ Codex corrige → Claude autoriza → Sebastián abre el PR y mergea
```

**Codex no abre el PR.** La auditoría ocurre antes. Ese es el punto de todo el arreglo.

Ramas: `main` (releases) ← `develop` (integración) ← `feature/mN-slug` (un hito cada una).

## Los tres hechos que corrigen el handoff

Salieron de inspeccionar los assets originales. El handoff dice otra cosa; los assets mandan.

1. **Lienzo 1440×810**, no 1920×1080.
2. **Tipografía Montserrat**, auto-hospedada (nunca CDN — rompe el PDF).
3. **Todo el texto está vectorizado**: no hay copy extraíble ni tipografía medible. Se calibra a ojo.

## Decisiones cerradas — no relitigar

| Decisión | Elección |
|---|---|
| Deploy | Railway/Render con Docker, **no Vercel** (Playwright no corre en serverless sin hacks) |
| IA de imágenes | Mock por default, gpt-image-1 detrás de `IMAGE_PROVIDER` |
| API Key OpenAI | Env var, cuenta de Studio Nomade, con tope diario |
| Variantes (Pollo Entero) | Campos multilínea, sin tabla `product_variants` |
| Autorización | Server-side en cada action; RLS deny-all como backstop |
| Orden de hitos | Plantilla y PDF **antes** que el CRUD |

## Notas

- `-context/` no se versiona: trae los PDFs y el SVG originales, y puede tener material privado.
- La copia versionada del brief es `docs/handoff.md`.
- Español para todo. Los prompts de generación de imágenes, en inglés.
