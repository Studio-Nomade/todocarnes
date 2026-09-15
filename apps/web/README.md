# Web pública — deploy en Vercel

`apps/web` se publica en Vercel; el admin con Playwright se publica por separado en Railway.

## Crear el proyecto

1. Importar `Studio-Nomade/todocarnes` en Vercel.
2. Seleccionar **Root Directory** `apps/web` y mantener habilitado **Include source files outside of
   the Root Directory**, porque la app consume paquetes del workspace.
3. Framework: Next.js. `vercel.json` instala desde la raíz y compila solamente
   `@todocarnes/web`.
4. Confirmar como **Ignored Build Step** `npx turbo-ignore --fallback=HEAD^1`. Está también en
   `vercel.json`; evita desplegar si no cambió la web ni una dependencia suya.

## Variables

Configurar valores independientes para Preview y Production. Nunca copiar valores reales al repo.

| Variable | Alcance | Nota |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | cliente | URL del proyecto Supabase del entorno |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente | anon key pública del entorno |
| `SUPABASE_SERVICE_ROLE_KEY` | servidor | secreta; nunca usar prefijo `NEXT_PUBLIC_` |
| `RESEND_API_KEY` | servidor | secreta y separada por entorno |
| `EMAIL_FROM` | servidor | remitente del dominio verificado |
| `EMAIL_REPLY_TO` | servidor | buzón comercial de respuesta, recomendado |
| `NEXT_PUBLIC_SITE_URL` | cliente | URL canónica: preview o `https://todocarnes.cl` |

El build debe pasar sin secretos server-side. Las variables `NEXT_PUBLIC_*` de CI son valores dummy
de compilación, no credenciales.

## Ramas y promoción

- `develop`: Preview estable de staging, con Supabase y Resend de staging.
- ramas feature: previews efímeras, si están habilitadas.
- `main`: Production; recibe `todocarnes.cl` y `www.todocarnes.cl`.

Promover mediante PR de `develop` a `main`. Revisar primero el preview de `develop`, aplicar las
migraciones manuales al Supabase de producción y recién entonces mergear. Este repositorio no
automatiza migraciones.

Los registros de dominio están en [`docs/infrastructure.md`](../../docs/infrastructure.md).
