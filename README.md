# Todo Carnes

Monorepo para el sitio público, la agenda comercial y la administración de catálogos de Todo
Carnes. Usa Node 20.12.2, pnpm workspaces y Turborepo.

## Inicio rápido

```bash
corepack pnpm install
corepack pnpm dev
```

El admin queda en `http://localhost:3000` y la web pública en `http://localhost:3001`.

Para ejecutar una sola aplicación:

```bash
corepack pnpm --filter catalog-builder dev
corepack pnpm --filter @todocarnes/web dev
```

## Estructura

```text
apps/
  admin/       Administración y generación de catálogos
  web/         Sitio público y agenda
packages/
  db/          Configuración, migraciones y tipos de Supabase
```

Los scripts raíz `build`, `lint` y `test` delegan las tareas a los workspaces mediante Turbo.

## Origen del administrador

`apps/admin` fue importado con su historia desde `Studio-Nomade/catalog-builder`, usando la rama
`develop` como fuente. Ese repositorio queda congelado como referencia: todo desarrollo nuevo del
generador continúa en este monorepo.

La configuración de entorno del admin parte de `apps/admin/.env.example`. Los comandos de Supabase
se ejecutan desde `packages/db`.
