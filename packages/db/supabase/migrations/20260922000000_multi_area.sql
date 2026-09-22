-- Multi-área para vendedores y leads.
-- Un vendedor puede cubrir más de un área (ej. Retail / GGCC + Food Service) y un lead del landing
-- puede elegir varias áreas de interés. Las columnas `area` se mantienen como área principal
-- (= areas[1]) para no romper filtros existentes del admin ni la agenda.

alter table public.profiles
  add column areas public.area_comercial[] not null default '{}';

update public.profiles
  set areas = array[area]
  where area is not null and cardinality(areas) = 0;

create index profiles_areas_idx on public.profiles using gin (areas);

alter table public.leads
  add column areas public.area_comercial[] not null default '{}';

update public.leads
  set areas = array[area]
  where area is not null and cardinality(areas) = 0;

create index leads_areas_idx on public.leads using gin (areas);
