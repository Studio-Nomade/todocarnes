# `@todocarnes/emails`

Plantillas y envío transaccional para Agenda y Landing, además del builder de invitaciones `.ics`.

## Variables

- `RESEND_API_KEY`: clave server-only de Resend.
- `EMAIL_FROM`: remitente verificado, por ejemplo `Todo Carnes <no-reply@todocarnes.cl>`.
- `EMAIL_REPLY_TO`: buzón comercial opcional; también es el destino de respaldo cuando un lead no
  tiene vendedor asignado.
- `NEXT_PUBLIC_SITE_URL`: origen público usado para el logo remoto del correo.

## Pruebas

```bash
pnpm --filter @todocarnes/emails test
```

El test del calendario verifica explícitamente que el 29 de septiembre de 2026 a las 14:00 UTC se
renderice a las 11:00 en `America/Santiago`, con término a las 11:30.

Para un envío de humo en el sandbox de Resend:

```bash
RESEND_SMOKE_TO=destino@example.com pnpm --filter @todocarnes/emails smoke
```

El comando requiere además las variables server-only anteriores y no imprime sus valores.
