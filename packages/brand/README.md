# `@todocarnes/brand`

Tokens, preset de Tailwind y activos compartidos de Todo Carnes.

## Tipografía

- `font-display` y `font-sans`: Montserrat auto-hospedada en pesos 300, 400, 500, 600 y 700.
- Web y admin importan `@todocarnes/brand/montserrat.css`; no se usa CDN ni se duplican los `.woff2`.
- `theme.css` expone los mismos colores de `tokens.ts` como variables CSS para estilos globales.

## Logos

| Archivo | Uso |
|---|---|
| `logo-completo-horizontal.webp` | Wordmark principal sobre fondos claros |
| `logo-completo.webp` | Versión completa cuadrada sobre fondos claros |
| `isologo-cropped.webp` | Isologo compacto sobre fondos claros |
| `isologo.webp` | Isologo con mayor área transparente sobre fondos claros |

Los cuatro WebP entregados son full color y se usan sobre fondos claros. La web pública incluye la
variante blanca entregada por el cliente en `apps/web/public/brand/logo-blanco.png` para sus footers.
