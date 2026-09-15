# Infraestructura, dominios y correo

Este documento es un runbook. No confirma que los proyectos, secretos o registros estén aplicados.
Los valores finales de destino deben copiarse desde Vercel, Railway y Resend al momento de configurar
SiteGround.

## Mapa de despliegue

| Componente | Staging (`develop`) | Producción (`main`) |
|---|---|---|
| Web pública | Preview estable de Vercel | Vercel, `todocarnes.cl` + `www` |
| Admin | Environment/servicio staging de Railway | Railway, `admin.todocarnes.cl` |
| Datos | Proyecto Supabase staging | Proyecto Supabase producción |
| Correo saliente | dominio o API key de staging | Resend con dominio verificado |

Cada entorno debe tener variables y Supabase propios. La promoción es un PR `develop` → `main`, tras
validar staging. Las migraciones se aplican manualmente con `pnpm --filter @todocarnes/db db:push`;
no forman parte de CI ni del deploy automático.

## Registros a crear en SiteGround

No borrar los MX existentes de SiteGround. Primero copiar los targets exactos que cada plataforma
muestra para el proyecto y luego crear o editar estos registros:

| Host | Tipo | Valor | Propósito |
|---|---|---|---|
| `@` | A o ALIAS | `<valor indicado por Vercel>` | web en `todocarnes.cl` |
| `www` | CNAME | `<target indicado por Vercel>` | alias de la web |
| `admin` | CNAME | `<target indicado por Railway>` | admin en Railway |
| `send` | MX | `<feedback MX indicado por Resend>` | Return-Path de Resend; no es el buzón entrante del dominio raíz |
| `send` | TXT | `<SPF exacto indicado por Resend>` | SPF del Return-Path de Resend |
| `<selector>._domainkey` | TXT | `<DKIM exacto indicado por Resend>` | firma DKIM |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc@todocarnes.cl` | monitoreo inicial de DMARC |

El dominio de envío configurado en Resend es `todocarnes.cl`; un remitente válido sería
`Todo Carnes <no-reply@todocarnes.cl>`. Confirmar que el buzón de `EMAIL_REPLY_TO` sí exista.

### SPF: un solo registro por host

Al preparar este runbook, el SPF público de la raíz era:

```text
v=spf1 +a +mx +ip4:50.31.176.2 include:spf.jetsmtp.net ~all
```

La configuración preferida de Resend usa el host `send` para su Return-Path, por lo que su TXT no
duplica el SPF de `@`. Si el panel de Resend exigiera publicar SPF directamente en `@`, no crear un
segundo TXT `v=spf1`: editar el existente e insertar el mecanismo que muestre Resend antes de
`~all`. Si ese mecanismo es `include:amazonses.com`, el valor combinado final sería:

```text
v=spf1 +a +mx +ip4:50.31.176.2 include:spf.jetsmtp.net include:amazonses.com ~all
```

Volver a consultar el SPF real justo antes del cambio: el dato anterior es una observación del
15-09-2026, no una instrucción para sobrescribir DNS a ciegas.

## Verificación

1. Vercel y Railway deben marcar sus dominios como válidos y emitir HTTPS.
2. Resend debe mostrar SPF y DKIM como verificados. DMARC comienza en `p=none`; revisar reportes
   antes de endurecer la política.
3. `dig MX todocarnes.cl` debe seguir mostrando el correo entrante de SiteGround.
4. Enviar un mensaje de prueba, revisar SPF/DKIM/DMARC en sus cabeceras y confirmar una respuesta al
   buzón configurado.
