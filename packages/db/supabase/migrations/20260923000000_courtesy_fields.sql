-- La solicitud de entrada de cortesía ahora pide nombres y apellidos por separado y el RUT, y deja de
-- preguntar el área de interés (el formulario del cliente ya no la incluye).

alter table public.courtesy_requests
  add column last_name text not null default '',
  add column rut text not null default '';

alter table public.courtesy_requests
  alter column area drop not null;

-- Las filas existentes quedan con los valores por defecto; a partir de ahora el formulario siempre
-- envía apellidos y RUT, así que se quitan los defaults para no ocultar datos faltantes.
alter table public.courtesy_requests
  alter column last_name drop default,
  alter column rut drop default;
