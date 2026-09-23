# `@todocarnes/emails`

Plantillas y envío transaccional para Agenda y Landing, además del builder de invitaciones `.ics`.

## Variables

- `RESEND_API_KEY`: clave server-only de Resend.
- `EMAIL_FROM`: remitente verificado, por ejemplo `Todo Carnes <no-reply@todocarnes.cl>`.
- `EMAIL_REPLY_TO`: buzón comercial opcional para las respuestas de clientes.
- `EMAIL_INTERNAL_TO`: buzón central obligatorio para las notificaciones internas; el vendedor
  asignado se agrega en CC cuando existe.

El logo blanco se adjunta dentro de cada correo mediante CID; no depende de una URL o del despliegue
del sitio público.

## Pruebas

```bash
pnpm --filter @todocarnes/emails test
pnpm --filter @todocarnes/emails previews
```

El test del calendario verifica explícitamente que el 29 de septiembre de 2026 a las 14:00 UTC se
renderice a las 11:00 en `America/Santiago`, con término a las 11:30.

El segundo comando regenera los nueve HTML revisables en `packages/emails/previews/`. La novena
plantilla corresponde a recuperación de contraseña de Supabase Auth y usa una cabecera pública en
lugar del adjunto CID.

Para un envío de humo en el sandbox de Resend:

```bash
RESEND_SMOKE_TO=destino@example.com pnpm --filter @todocarnes/emails smoke
```

El comando requiere además las variables server-only anteriores y no imprime sus valores.
