alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

-- Las cuentas entregadas el 23-09-2026 comparten contraseña inicial: se fuerza el cambio.
update public.profiles set must_change_password = true
  where contact_email in (
    'amolina@tdcarnes.cl','rjz@tdcarnes.cl','frecabarren@tdcarnes.cl',
    'purbina@tdcarnes.cl','fsalinas@tdcarnes.cl','jmartinez@tdcarnes.cl'
  );
