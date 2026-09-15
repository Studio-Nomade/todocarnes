# Todo Carnes

Monorepo para el sitio público, la agenda comercial y la administración de catálogos de Todo
Carnes. Usa Node 20.12.2, pnpm workspaces y Turborepo.

## Inicio rápido

```bash
corepack pnpm install
corepack pnpm dev
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
