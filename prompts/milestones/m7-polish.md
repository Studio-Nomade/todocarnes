# M7 — Polish para la demo

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes", una herramienta interna que
reemplaza la maquetación manual del catálogo comercial mensual. Claude es el tech lead y audita tu
trabajo antes de cada PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/tasks.md` §Criterios de aceptación del MVP. **Ese es el objetivo de este hito.**
3. Conseguí el PDF de julio (`-context/`) para la calibración final.
4. `git checkout develop && git pull && git checkout -b feature/m7-polish`

## Objetivo

Que un comercial de Todo Carnes que nunca vio la herramienta complete el flujo entero sin ayuda, en
el deploy público, y que el PDF que salga se pueda poner al lado del catálogo de julio sin que
incomode.

Este hito no agrega features. Cierra las grietas.

## Alcance

- Dashboard con sus métricas
- Calibración visual final contra el catálogo real
- Estados vacíos, loading y error en **todas** las pantallas
- Datos reales de muestra
- Guion de demo en el README

## Fuera de alcance

- **Features nuevas.** Ninguna. Si aparece una idea buena, va a `docs/tasks.md` como fase 2
- Refactors grandes. Si algo está feo pero funciona y no se ve, se queda
- Optimización de performance sin un problema medido
- Tests más allá de `page-order`
- Animaciones y microinteracciones que no arreglen nada

## Especificación

### Dashboard

De `docs/handoff.md` §13.2:

- Catálogo activo o último
- Cantidad de productos activos
- **Productos sin imágenes aprobadas** — la métrica más útil: es la lista de tareas del comercial
- Últimas generaciones IA
- Botón "Crear nuevo catálogo"
- Botón "Crear producto"

Números reales, calculados. Nada hardcodeado — en la demo alguien va a crear un producto y mirar si
el número sube.

### Calibración visual

Poné el PDF exportado y el de julio lado a lado, al mismo zoom. Ajustá lo que salte a la vista:
tamaños de fuente, pesos, tracking, espaciados, colores.

La pregunta de la auditoría no es "¿tiene los mismos elementos?" sino: **¿un diseñador de Studio
Nomade firmaría esto?**

Documentá lo que quedó distinto y por qué. Un desvío conocido y explicado es aceptable; uno que
descubre el cliente en la reunión, no.

### Estados

En cada pantalla, los tres:

- **Vacío** — sin productos, sin catálogos, sin imágenes. Con la acción que corresponde, no un
  cartel triste. "Todavía no hay productos. Creá el primero." + botón
- **Loading** — durante export (que tarda), generación IA (30-90s), y las listas
- **Error** — mensaje humano y una salida. Nunca un stack trace, nunca una pantalla en blanco

Los estados vacíos son lo que más se nota en una demo y lo que menos se hace. Una app con pantallas
en blanco parece rota aunque funcione.

### Datos de muestra

El seed tiene que dejar **un catálogo "Julio 2026" armado y exportable**. La demo no puede empezar
con una pantalla vacía.

- Productos reales de las 4 categorías, con imágenes
- El catálogo ya creado, con productos seleccionados y ordenados
- Al menos un producto sin imágenes aprobadas, para que el dashboard muestre algo en esa métrica

Idempotente, como siempre.

### Guion de demo

En el `README.md`. 5 minutos, paso a paso, con lo que hay que decir en cada uno.

El arco: el problema (48 páginas a mano, cada mes, dependiendo del diseñador) → la base de productos
→ el catálogo → el preview → **el PDF** → y la IA como cierre.

**El PDF es el momento.** Todo lo anterior construye hacia ese click. La IA va al final: es el
diferenciador, no el argumento.

Incluí: credenciales de demo, en qué orden abrir las pantallas, y qué hacer si algo falla en vivo.

### Barrido final

Recorré `docs/audit-checklist.md` entero. Es el momento de encontrar lo que se acumuló, no cuando
Claude lo audite.

## Definición de terminado

- [ ] `npm run build` y `tsc --noEmit` limpios. Cero `any`
- [ ] **Alguien que no trabajó en esto completa el flujo entero sin ayuda, en el deploy público.**
      Probalo con una persona real
- [ ] El seed deja Julio 2026 armado y exportable
- [ ] Ninguna pantalla queda en blanco: todas tienen vacío, loading y error
- [ ] El dashboard muestra números reales
- [ ] PDF exportado vs. PDF de julio, lado a lado — desvíos documentados
- [ ] Guion de demo de 5 min en el README
- [ ] `docs/audit-checklist.md` pasa entero
- [ ] Flujo completo en Railway con una cuenta limpia, **sin tocar la consola**

## Trampas conocidas

1. **Agregar features "chicas" que faltan.** Este hito cierra grietas. Toda idea nueva va a
   `docs/tasks.md` como fase 2 — y eso es bueno: es la próxima venta.
2. **Refactorizar porque "ahora hay tiempo".** No hay. Y un refactor tardío es cómo se rompe una demo
   que ya funcionaba.
3. **Calibrar contra el SVG en vez del PDF de julio.** El SVG es una hoja tipo; el PDF es lo que el
   cliente ve todos los meses.
4. **Estados vacíos con un cartel y nada más.** Un estado vacío es una invitación a actuar, no una
   disculpa.
5. **Guion de demo escrito como un manual.** Es un guion: qué se hace y qué se dice. Corto.
6. **Probar el flujo con tu propia cuenta**, que ya tiene datos y sesión. Cuenta limpia, ventana de
   incógnito.
7. **Dejar el mock activo sin decirlo.** Si M6 no llegó, la demo corre con mock — perfecto, está
   diseñado así. Pero que Sebastián lo sepa antes de la reunión, no durante.

## Entrega

Commiteá en `feature/m7-polish` con prefijo `m7:`. **No abras el PR.**

Reportá: qué hiciste, comparación lado a lado PDF exportado vs. julio, la lista de desvíos visuales
documentados, quién probó el flujo en frío y cómo le fue, qué provider queda activo, y qué te
preocupa de cara a la reunión.

Claude audita el diff local y autoriza el PR.
