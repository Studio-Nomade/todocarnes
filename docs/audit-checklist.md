# Checklist de auditoría

Claude lo aplica sobre el **diff local**, antes del PR. Codex puede (y debería) correrlo solo antes
de entregar.

**Bloqueante** = el hito se devuelve. No se mergea con "lo arreglamos después": los ítems bloqueantes
son justamente los que nunca se arreglan después.

Veredicto: **PASA** o **DEVUELTO + hallazgos**.

---

## Seguridad — bloqueante

```bash
# Ninguno de estos debe devolver nada:
grep -rn "NEXT_PUBLIC" --include="*.ts" --include="*.tsx" . | grep -iE "service|secret|openai"
grep -rln "SUPABASE_SERVICE_ROLE_KEY\|OPENAI_API_KEY" app/ components/ | xargs grep -ln "use client"
git log -p | grep -iE "sk-[a-zA-Z0-9]{20}|eyJhbGciOi"
```

- [ ] Ninguna key con prefijo `NEXT_PUBLIC_` salvo la URL y la anon key de Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` y `OPENAI_API_KEY` no aparecen en ningún client component
- [ ] Ninguna credencial real en el repo **ni en el historial de git**
- [ ] `.env.local` está en `.gitignore`; `.env.example` solo tiene placeholders
- [ ] Toda Server Action arranca con `requireRole`
- [ ] RLS activado y deny-all en todas las tablas
- [ ] `/print` sin token devuelve 401, con comparación en tiempo constante (`timingSafeEqual`)
- [ ] Uploads: MIME whitelist + límite de tamaño + nombre generado por nosotros (uuid)
- [ ] Tope de generación validado en server, no en UI
- [ ] Un commercial recibe 403 al **pegar `/settings` en la barra de direcciones** — no basta con
      esconder el botón

## Código

- [ ] `npm run build` y `tsc --noEmit` limpios
- [ ] **Cero `any`, cero `@ts-ignore`, cero `eslint-disable`** sin justificación escrita
- [ ] Lint limpio
- [ ] Zod en cada entrada de action
- [ ] Sin duplicar la interfaz del provider ni los validadores
- [ ] Ningún componente supera ~200 líneas
- [ ] `page-order.ts` es puro y testeado
- [ ] Los commits usan el prefijo del hito (`m1: ...`)

## Diseño — bloqueante en M1

- [ ] Captura de la plantilla superpuesta al SVG, adjunta al reporte
- [ ] **Montserrat en el PDF exportado**, no fallback. Verificar con `pdffonts salida.pdf`, no
      mirando el navegador — es exactamente donde falla
- [ ] Cada página del PDF mide exactamente 1440×810, sin páginas en blanco ni cortes
- [ ] Paleta = tokens de Tailwind. Cero hex sueltos en el JSX
- [ ] Título largo (60+ caracteres) hace wrap sin desbordar
- [ ] Campo vacío o null → `—`. Nunca `undefined`, nunca caja rota
- [ ] Valores con `\n` se renderizan como lista (caso Pollo Entero)
- [ ] Secundarias en la grilla normalizada **510 / 802 / 1094**, no en los valores crudos del SVG
- [ ] Imágenes con `object-fit: cover`, sin deformación
- [ ] Preview y PDF usan **los mismos componentes**
- [ ] El PDF parece pieza de diseño, no reporte administrativo

## Datos

- [ ] El índice único parcial existe y funciona — probar aprobando dos imágenes del mismo slot: la
      primera debe quedar `rejected`, nunca dos `approved`
- [ ] `page_number` no está persistido en ninguna parte
- [ ] `profiles.id` referencia `auth.users`; no hay tabla de users paralela
- [ ] Seed idempotente: correrlo dos veces no duplica
- [ ] Reordenar en el constructor cambia el orden del PDF

## Producto

- [ ] **Sin scope creep:** nada de la lista "Fuera de alcance" de `architecture.md` aparece
      implementado, aunque esté bien hecho
- [ ] Ninguna UI expone cuál provider de imágenes está activo
- [ ] Admin no tiene features de más
- [ ] Copy de UI en español; prompts de IA en inglés
- [ ] Las desviaciones del prompt del hito están reportadas por escrito, no decididas en silencio

## Demo

- [ ] Flujo completo end-to-end en el deploy público
- [ ] El seed deja un catálogo Julio 2026 armado y exportable — la demo no puede empezar con una
      pantalla vacía
- [ ] Se explica el valor en 5 minutos

---

## Qué mira Claude además del checklist

El checklist atrapa lo mecánico. Estas son las preguntas de juicio:

1. **¿Esto se parece al catálogo?** No "¿tiene los mismos elementos?" sino: puesto al lado del PDF de
   julio, ¿un diseñador de Studio Nomade lo firmaría?
2. **¿Un comercial de Todo Carnes puede usarlo sin que le expliquen?** Si necesita un tutorial, la
   demo no vende.
3. **¿Hay complejidad que no pidió nadie?** Abstracciones anticipadas, capas de más, una cola donde
   alcanzaba una función.
4. **¿Qué se rompe cuando el dato viene feo?** Título de 80 caracteres, campo null, imagen que no
   cargó, producto sin corte.
5. **¿El siguiente hito puede construir sobre esto** o hay que deshacer algo primero?
