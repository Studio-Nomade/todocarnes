# M2 — Base de datos + Auth

## Rol

Sos el dev implementador del "Creador de Catálogo Digital Todo Carnes", una herramienta interna que
reemplaza la maquetación manual del catálogo comercial mensual. Claude es el tech lead y audita tu
trabajo antes de cada PR.

## Antes de empezar

1. Leé `prompts/codex-dev.md` — reglas permanentes.
2. Leé `docs/architecture.md` §Modelo de datos, §Autorización, §Seguridad. **Completo.**
3. `git checkout develop && git pull && git checkout -b feature/m2-db-auth`

## Objetivo

Que exista el schema completo en Supabase, con RLS cerrado, y un login funcional con dos roles donde
un `commercial` recibe 403 al **pegar `/settings` en la barra de direcciones**.

Esa última parte es el criterio real. Esconder el botón no es autorización.

## Alcance

- Proyecto Supabase + migración con el schema completo
- RLS deny-all en todas las tablas
- `lib/supabase/{server,client,admin}.ts`
- Login con Supabase Auth SSR (cookies)
- `middleware.ts` protegiendo `(dashboard)`
- `lib/auth/requireRole.ts`
- Layout de dashboard con nav mínima
- Seed idempotente de categorías, cortes y settings

## Fuera de alcance

- CRUD de productos (es M3)
- Seed de productos (es M3)
- Cualquier pantalla más allá de login + un dashboard vacío
- Storage / buckets (es M4)
- UI de gestión de usuarios (es M6). Acá solo el rol funciona
- Recuperación de password, registro público, OAuth. Los usuarios se crean a mano

## Especificación

### Schema

Exactamente el de `docs/architecture.md` §Modelo de datos. Todas las tablas, aunque M2 no las use
todavía — una sola migración es más fácil de auditar que ocho.

Tres puntos que **no** son negociables:

1. **`profiles`, no `users`.** `id uuid PK references auth.users(id) on delete cascade`.
   Supabase Auth es la fuente de identidad. Nunca una tabla de usuarios paralela con passwords.
2. **El índice único parcial:**
   ```sql
   create unique index one_approved_per_slot
     on product_images (product_id, slot) where status = 'approved';
   ```
   Garantiza una sola imagen aprobada por slot **a nivel de motor**, no de código de app.
   M4 depende de esto.
3. **`catalog_items` sin `page_number`.** Se deriva al renderizar. Persistido se desincroniza en
   cuanto alguien reordena.

Trigger para poblar `profiles` al crearse un `auth.users`, o creación explícita desde el seed —
cualquiera de las dos, pero decidí una y documentala.

### RLS

**Activado y deny-all** en todas las tablas, para `anon` y `authenticated`.

Sin políticas granulares. No es pereza: para 2 roles y ~5 usuarios, RLS por fila es tiempo perdido y
una fuente de bugs sutiles. El modelo es:

```
Cliente  ──X──►  DB              (RLS lo bloquea, siempre)
Cliente  ─────►  Server Action ─────►  DB   (service role, tras validar rol)
```

### Los tres clientes de Supabase

| Archivo | Key | Uso |
|---|---|---|
| `client.ts` | anon | Solo para el login desde el browser |
| `server.ts` | anon + cookies | Leer la sesión en server components |
| `admin.ts` | **service role** | Todas las operaciones de datos. Bypassa RLS por diseño |

`admin.ts` **solo importable desde server**. Poné `import 'server-only'` arriba de todo. Si el
service role key llega a un client component, la auditoría devuelve el hito y no hay discusión.

### Auth

Supabase Auth con cookies SSR (`@supabase/ssr`). Email + password.

`middleware.ts` protege el grupo `(dashboard)`: sin sesión → redirect a `/login`.

### `requireRole`

```ts
// lib/auth/requireRole.ts
export async function requireRole(roles: Role[]): Promise<Profile>
// Sin sesión → redirect a /login
// Rol insuficiente → 403 (no redirect silencioso: queremos que se vea)
// profiles.status !== 'active' → 403
```

**Toda Server Action arranca con esto.** Sin excepción, para siempre, en todos los hitos.

### Seed

`data/seed/` + `npm run seed`. **Idempotente**: upsert por slug. Correrlo dos veces no duplica — es
un ítem de auditoría.

**Categorías** (4, `sort_order` = orden del catálogo):
Cerdo, Pollo, Vacuno, Trimming.

**Cortes** (16):
- Cerdo → Costillar, Baby Back Ribs, Chuletas, Lomo Centro, Pulpa Pierna, Panceta
- Pollo → Pechuga, Filetillo, Trutros, Pollo Entero
- Vacuno → Posta, Hígado
- Trimming → 50/50, 70/30, 80/20, 90/10

**Settings:**
- Los 4 prompts de `docs/handoff.md` §10.4, **en inglés, tal cual están ahí**
- `generation_daily_limit: 40`

**Usuarios:** 1 admin + 1 commercial, credenciales desde `SEED_*` en env.
**Nunca commiteados, nunca hardcodeados.**

## Definición de terminado

- [ ] `npm run build` y `tsc --noEmit` limpios. Cero `any`
- [ ] `npm run seed` dos veces seguidas → 4 categorías y 16 cortes, no 8 y 32
- [ ] Login funciona; sin sesión, `/dashboard` redirige a `/login`
- [ ] **Login como commercial → pegar `/settings` en la URL → 403.** Como admin → carga
- [ ] `grep -rln "SUPABASE_SERVICE_ROLE_KEY" app/ components/ | xargs grep -l "use client"` → vacío
- [ ] `admin.ts` tiene `import 'server-only'`
- [ ] RLS activado en todas las tablas — verificalo desde el dashboard de Supabase
- [ ] Probar el índice único: insertar dos `product_images` `approved` del mismo slot → la segunda
      falla
- [ ] Cero credenciales en el repo: `git log -p | grep -iE "eyJhbGciOi|sk-[a-zA-Z0-9]{20}"` → vacío

## Trampas conocidas

1. **Crear una tabla `users` propia con passwords** porque el handoff §12 la dibuja así. No. El
   handoff está corregido en `architecture.md`: `profiles` sobre `auth.users`.
2. **Escribir políticas RLS granulares** porque "es lo correcto". Para este proyecto no lo es. Deny-all
   y autorización en las actions. Está decidido, no lo relitigues.
3. **Importar `admin.ts` desde un client component** sin darte cuenta. Next.js no siempre te avisa
   hasta el build de producción. `import 'server-only'` lo hace explotar temprano, que es lo que
   querés.
4. **Seed con `insert` en vez de `upsert`** → duplica en la segunda corrida. La auditoría corre el
   seed dos veces.
5. **Redirect silencioso en vez de 403** cuando el rol no alcanza. Un redirect esconde el bug; el
   403 lo muestra. Queremos verlo.
6. **`@supabase/auth-helpers-nextjs`** está deprecado. Usá `@supabase/ssr`.

## Entrega

Commiteá en `feature/m2-db-auth` con prefijo `m2:`. **No abras el PR.**

Reportá: qué hiciste, la migración SQL, evidencia del 403 del commercial en `/settings`, el output de
correr el seed dos veces, desviaciones, y qué te preocupa.

Claude audita el diff local y autoriza el PR.
