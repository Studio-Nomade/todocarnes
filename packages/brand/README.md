# `@todocarnes/brand`

Tokens, preset de Tailwind y activos compartidos de Todo Carnes.

## Tipografía

- `font-display`: Oliviar Sans en la web pública.
- `font-sans`: la aplicación consumidora define `--font-sans`; el admin conserva Montserrat y la
  web usa la pila de sistema.
- La fuente Oliviar se sirve localmente desde `fonts/oliviar/`; no usa CDN.

## Logos

| Archivo | Uso |
|---|---|
| `logo-completo-horizontal.webp` | Wordmark principal sobre fondos claros |
| `logo-completo.webp` | Versión completa cuadrada sobre fondos claros |
| `isologo-cropped.webp` | Isologo compacto sobre fondos claros |
| `isologo.webp` | Isologo con mayor área transparente sobre fondos claros |

Los cuatro WebP entregados son full color. Para fondos navy debe usarse una variante blanca; esa
variante existe en el admin legado, pero no se duplica aquí porque no vino incluida en el set WebP
de la web. Hasta que diseño entregue esa exportación, estos logos se usan solamente sobre fondos
claros.
