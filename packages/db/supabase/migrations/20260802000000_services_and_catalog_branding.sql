alter table public.catalogs
  add column client_name text,
  add column client_logo_path text;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 100),
  description text not null check (char_length(description) between 10 and 600),
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_set_updated_at before update on public.services
  for each row execute procedure public.set_updated_at();

alter table public.services enable row level security;
revoke all on table public.services from anon, authenticated;
grant all on table public.services to service_role;

insert into public.services (title, description, sort_order)
values (
  'Maquila de envasados',
  'Desarrollamos soluciones de envasado para productos cárnicos con formatos y presentación personalizados para cada cliente.',
  0
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-assets', 'catalog-assets', false, 5242880, array['image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
