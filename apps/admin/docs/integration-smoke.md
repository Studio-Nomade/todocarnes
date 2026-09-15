# Smoke de integración — padrón, CRM, agenda y generador

Fecha de última ejecución: 2026-09-15.

Este documento separa la evidencia local reproducible de las verificaciones que requieren los
servicios productivos. Un check local no acredita correo real, DNS, migraciones ni despliegues.

## Arquitectura que se verifica

- `profiles` es el único padrón de usuarios y vendedores.
- El admin edita los campos públicos del mismo perfil: área, foto, WhatsApp, biografía, orden y
  visibilidad.
- Landing y agenda consultan perfiles `commercial`, `active` e `is_public`; no existe una lista de
  vendedores en código.
- La foto se publica en el bucket público `profile-photos`. La escritura sigue siendo server-side
  y exclusiva de un admin.
- Web y admin deben usar el mismo proyecto Supabase.

## Preparación del ambiente integrado

1. Aplicar todas las migraciones, incluida `20260915000100_profile_photos_bucket.sql`.
2. Configurar en ambas apps la misma `NEXT_PUBLIC_SUPABASE_URL` y anon key; mantener la service key
   solo en el servidor.
3. Configurar Resend (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`) con un dominio verificado.
4. Configurar `NEXT_PUBLIC_SITE_URL=https://todocarnes.cl` y
   `APP_URL=https://admin.todocarnes.cl`; redesplegar después de cambiar `APP_URL`.
5. Crear o completar en `/users` los cuatro perfiles definitivos suministrados por Todo Carnes y
   activar `Mostrar en el sitio y la agenda` solo después de revisar sus datos y fotografías.

## Smoke end-to-end

Registrar para cada ejecución el ID de lead/reserva/catálogo, hora, ambiente y responsable.

### Padrón público

- [ ] Editar área, WhatsApp, biografía, orden y foto de un comercial desde `/users`.
- [ ] Confirmar el mismo `profiles.id` y los campos actualizados en Supabase.
- [ ] Confirmar el cambio en el equipo de `/` y en la selección de `/agenda`.
- [ ] Desactivar `is_public` y confirmar que desaparece de ambos lugares.
- [ ] Confirmar que un perfil inactivo no aparece aunque conserve `is_public=true`.

### Reserva

- [ ] Reservar un horario desde `/agenda` con una casilla de correo controlada.
- [ ] Confirmar la fila en `bookings`, incluido el `rep_id` elegido.
- [ ] Confirmar recepción del correo del cliente, CC del vendedor y adjunto `.ics` válido.
- [ ] Confirmar que la reserva aparece en `/agenda` del admin para ese vendedor.

### Leads

- [ ] Enviar un lead desde el formulario del Landing y confirmar fila, acuse y notificación.
- [ ] Enviar otro desde el bloque de contacto de `/agenda` y confirmar que conserva el `rep_id`.
- [ ] Confirmar ambos en `/leads` y verificar el alcance admin/commercial.

### Generador

- [ ] Abrir el catálogo de muestra, editar un dato y guardar.
- [ ] Exportar PDF y comprobar HTTP 200, páginas no vacías, tamaño 1440 × 810 pt y Montserrat.
- [ ] Confirmar que `/print` sin token responde 401.

## Evidencia local de esta rama

- Tests: 34/34 en admin y 12/12 en web.
- ESLint, `tsc --noEmit` y builds de producción: limpios en ambas apps.
- El wrapper de `pnpm` rechazó antes de ejecutar una corrida por `minimumReleaseAge` de dependencias
  ya presentes en el lockfile (publicadas dentro de las últimas 24 horas). Los mismos comandos se
  ejecutaron con los binarios instalados; el lockfile no fue modificado.
- La migración se aplicó desde cero en un Supabase efímero; el bucket quedó público, limitado a
  WebP y 10 MB.
- Un admin editó y publicó `Comercial Auditor`, subió una imagen WebP y el mismo perfil/foto apareció
  en el Landing y la agenda. Al quitar `is_public`, desapareció de ambos; al reactivarlo, reapareció.
- Una reserva pública de prueba quedó `confirmed` en `bookings` y apareció en el calendario admin
  con el vendedor correcto. La UI informó que el correo no salió porque el ambiente no tenía Resend.
- La creación de leads y sus correos permanece como gate del smoke integrado de esta ejecución; no
  se representa como aprobada por la prueba de reserva.
- El Supabase efímero y sus datos se eliminaron al terminar. Estos resultados no sustituyen la
  ejecución productiva anterior.

## Estado de dominios al 2026-09-15

| Contrato | Observación actual | Estado |
|---|---|---|
| `todocarnes.cl` → web nueva en Vercel | Resuelve a `50.31.176.5` y sirve el sitio WordPress anterior | Pendiente |
| `www.todocarnes.cl` → web nueva | Alias a `todocarnes.cl`; mismo sitio anterior | Pendiente |
| `admin.todocarnes.cl` → admin en Railway | No resuelve en DNS | Pendiente |
| `APP_URL=https://admin.todocarnes.cl` | No verificable mientras el dominio no resuelva ni se inspeccione Railway | Pendiente |

## Gates externos abiertos

- Faltan los datos definitivos (correos, teléfonos, áreas, biografías y fotos) para cargar los cuatro
  vendedores reales sin inventar información.
- Falta acceso al Supabase destino para aplicar migraciones y cargar esos perfiles.
- Falta acceso a Resend y casillas controladas para acreditar correo, CC y `.ics` entregados.
- Falta configurar/verificar Vercel, Railway y DNS. Por lo anterior, el smoke productivo permanece
  pendiente aunque la implementación y sus checks locales estén completos.
