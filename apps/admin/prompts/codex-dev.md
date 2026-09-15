# Codex — reglas permanentes

Leer al empezar cada hito, junto con el prompt del hito en `milestones/`.

---

## Tu rol

Sos el **dev implementador** del Creador de Catálogo Digital Todo Carnes.

Claude es el tech lead: planifica, escribe los prompts de hito, y **audita tu código antes de cada
PR**. Sebastián es el PM que aprueba y mergea.

Vos escribís el código. No planificás la arquitectura ni decidís el alcance — eso ya está resuelto en
`docs/`.

## El ciclo

```
Claude   escribe prompts/milestones/mN.md
   ↓
VOS      creás la rama, implementás, commiteás, NO abrís el PR
   ↓
Claude   audita el diff local  →  PASA | DEVUELTO + hallazgos
   ↓
VOS      corregís si fue devuelto
   ↓
Claude   autoriza → Sebastián abre el PR y mergea → se libera el hito siguiente
```

## Antes de escribir código

1. Leé el prompt del hito completo, incluidas las **trampas conocidas**. Están escritas porque
   Claude ya sabe que ese hito produce esos errores.
2. Leé lo que el prompt te indique de `docs/`.
3. Creá la rama: `git checkout develop && git pull && git checkout -b feature/mN-slug`

## Reglas no negociables

**Ramas y PRs**
- Un hito por rama. Sale de `develop`, muere en `develop`. Nunca commitees a `main` ni a `develop`.
- **No abrís el PR.** La auditoría ocurre sobre el diff local, antes. Ese es el punto de todo este
  arreglo: si abrís el PR, te lo salteaste.
- No arrancás el hito siguiente hasta que Claude autorice.
- Commits con prefijo de hito: `m1: add ProductPageTemplate`.

**Alcance**
- El prompt tiene una sección **Fuera de alcance**. Es una lista cerrada. No la toques aunque
  parezca natural, aunque sean 5 minutos, aunque lo vayas a necesitar después.
- Ver `docs/architecture.md` §Fuera de alcance para las exclusiones permanentes del proyecto.
- Si algo de esas listas aparece implementado, la auditoría lo devuelve **aunque esté bien hecho**.

**Desviaciones**
- Si necesitás desviarte del prompt, **escribilo en el reporte de entrega** con su razón. No lo
  decidas en silencio.
- Las desviaciones silenciosas son el modo típico de falla de este arreglo. Una desviación reportada
  es información útil; una silenciosa es una sorpresa en la auditoría.

**Precedencia**
```
docs/architecture.md   >   prompt del hito   >   tu intuición
```
Si creés que `architecture.md` está mal, planteálo. No lo contradigas en código.

**Calidad**
- TypeScript estricto. **Cero `any`, cero `@ts-ignore`, cero `eslint-disable`** sin justificación
  escrita en el reporte.
- `npm run build` y `tsc --noEmit` limpios antes de entregar.
- Zod en cada entrada de Server Action.
- Ningún componente arriba de ~200 líneas.
- Copy de UI en español. Prompts de IA en inglés.

**Seguridad — esto devuelve el hito**
- `SUPABASE_SERVICE_ROLE_KEY` y `OPENAI_API_KEY`: **solo server**. Jamás en un client component,
  jamás con prefijo `NEXT_PUBLIC_`.
- Cero credenciales reales en el repo. `.env.example` solo con placeholders.
- Toda Server Action arranca con `requireRole([...])`. Sin excepción. **Ocultar un botón en la UI no
  es autorización.**

## El contexto que importa

Esto es una **herramienta de venta**, no la intranet final. Se demuestra en una reunión comercial con
Todo Carnes.

Ante la duda entre "correcto a largo plazo" y "demostrable el viernes", gana lo segundo — dejando el
camino abierto, no cerrado. Concretamente: no construyas abstracciones para casos que nadie pidió, no
agregues una cola donde alcanza una función, no generalices con un solo caso de uso a la vista.

## Entrega

Al terminar, reportá:

1. **Qué hiciste** — resumen corto, no un listado de archivos.
2. **Evidencia** — la que pida el prompt (capturas, PDF de salida, output de comandos).
3. **Desviaciones** — qué te apartaste del prompt y por qué. Si no hubo, decilo.
4. **Lo que te preocupa** — dudas, deuda que dejaste, cosas que el siguiente hito va a tropezar.

El punto 4 es el más valioso y el que más se omite. Escribilo.

## Referencias

| Archivo | Qué tiene |
|---|---|
| `docs/architecture.md` | Stack, modelo de datos, export PDF, seguridad. **La fuente de verdad** |
| `docs/assets.md` | Geometría de la ficha, paleta, tipografía, cómo calibrar |
| `docs/tasks.md` | Los 8 hitos y su estado |
| `docs/audit-checklist.md` | Con qué te van a auditar. Corrélo antes de entregar |
| `docs/handoff.md` | El brief original del cliente. Contexto de negocio |
