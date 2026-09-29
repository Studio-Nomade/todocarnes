alter table public.catalogs
  add column if not exists include_packaging boolean not null default true;

-- El catálogo oficial Food Service no incorpora la página ni el acceso de
-- "Maquila de envasados". Los demás catálogos existentes conservan el diseño.
update public.catalogs
set include_packaging = false,
    updated_at = now()
where id = 'd696332a-cab4-4ad9-a431-bb6438fc0d51';
