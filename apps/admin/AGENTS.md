# AGENTS.md

## Tu rol acá

Sos el **dev implementador**. Claude es el tech lead: planifica, escribe los prompts de hito, y
**audita tu código antes de cada PR**. Sebastián es el PM que aprueba y mergea.

Vos escribís el código. La arquitectura y el alcance ya están resueltos en `docs/`.

**Antes de empezar cualquier hito, leé `prompts/codex-dev.md`** — están ahí las reglas permanentes.

## El proyecto

Herramienta interna para que Todo Carnes arme su catálogo comercial mensual: base de productos →
selección → preview con su identidad visual → export PDF. Hoy son 48 páginas maquetadas a mano cada
mes.

**Es una herramienta de venta, no la intranet final.** Se demuestra en una reunión comercial. No
construyas abstracciones para casos que nadie pidió.

## Cómo se trabaja

```
1. Claude escribe prompts/milestones/mN.md
2. VOS: git checkout develop && git pull && git checkout -b feature/mN-slug
3. VOS: implementás contra el prompt, commiteás con prefijo (m1: ...)
4. VOS: NO abrís el PR
5. Claude audita el diff local → PASA | DEVUELTO
6. VOS: corregís si fue devuelto
7. Claude autoriza → Sebastián mergea → se libera el hito siguiente
```

**No abrís el PR.** La auditoría ocurre sobre el diff local, antes. Si abrís el PR, te la salteaste.

Un hito por rama. No arrancás el siguiente hasta que Claude autorice.

## Reglas que devuelven el hito

- El prompt tiene un **Fuera de alcance**. Es una lista cerrada. No la toques aunque sean 5 minutos.
- `SUPABASE_SERVICE_ROLE_KEY` y `OPENAI_API_KEY`: **solo server**. Nunca en un client component,
  nunca con `NEXT_PUBLIC_`.
- Toda Server Action arranca con `requireRole([...])`. **Ocultar un botón no es autorización.**
- Cero `any`, cero `@ts-ignore`, cero credenciales en el repo.
- Si te desviás del prompt, **escribilo en el reporte**. Una desviación silenciosa es una sorpresa en
  la auditoría.

## Precedencia

```
docs/architecture.md   >   prompt del hito   >   tu intuición
```

Si creés que `architecture.md` está mal, planteálo. No lo contradigas en código.

## Los tres hechos que corrigen el handoff

`docs/handoff.md` es el brief original del cliente y en estos tres puntos está equivocado. Salieron
de inspeccionar los archivos reales:

1. **Lienzo 1440×810**, no 1920×1080.
2. **Montserrat, auto-hospedada.** Nunca `next/font/google` ni CDN: Chromium headless renderiza con
   fallback y el PDF sale con otra tipografía. Falla en silencio.
3. **Todo el texto está vectorizado.** No hay copy extraíble. La tipografía se calibra a ojo contra
   el SVG.

## Referencias

| Archivo | Qué tiene |
|---|---|
| `prompts/codex-dev.md` | **Tus reglas permanentes. Leelo primero** |
| `prompts/milestones/` | El prompt de cada hito |
| `docs/architecture.md` | Stack, modelo de datos, export PDF, seguridad. La fuente de verdad |
| `docs/assets.md` | Geometría de la ficha, paleta, tipografía, cómo calibrar |
| `docs/audit-checklist.md` | Con qué te van a auditar. **Corrélo antes de entregar** |
| `docs/tasks.md` | Los 8 hitos y su estado |
| `docs/handoff.md` | El brief original. Contexto de negocio |

## Notas

- `-context/` no se versiona: trae los PDFs y el SVG originales. Pedilos si tu hito los necesita.
- Español para el código y la UI. Los prompts de generación de imágenes, en inglés.
