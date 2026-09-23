# Recuperación de contraseña

Supabase Auth envía el correo de recuperación mediante el SMTP configurado en su panel. La fuente de
verdad visual está en `packages/emails/src/templates/PasswordRecovery.tsx`; el HTML del panel es solo
una copia generada.

Después de modificar `EmailShell` o `PasswordRecovery`:

1. Ejecutar `pnpm --filter @todocarnes/emails render:previews`.
2. Copiar `packages/emails/previews/09-password-recovery.html` completo.
3. Reemplazar la plantilla **Reset Password** en Supabase Authentication → Emails.
4. Comprobar que `{{ .ConfirmationURL }}` siga intacto y que la cabecera apunte a
   `https://todocarnes.cl/emails/header-correos.jpg`, nunca a un CID.

La configuración de SMTP, remitente y URLs autorizadas está documentada fuera del repositorio de
producto en `Local/roadmaps/configuracion-supabase-correos.md`. No guardar claves SMTP en este repo.
