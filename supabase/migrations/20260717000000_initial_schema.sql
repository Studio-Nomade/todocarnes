create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('admin', 'commercial')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1), 'Usuario'),
    'commercial'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon_key text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cuts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  cut_id uuid not null references public.cuts(id),
  eyebrow text,
  title text not null,
  code text,
  brand text,
  origin text,
  box_weight text,
  format text,
  units text,
  status text not null default 'draft' check (status in ('draft', 'active', 'inactive')),
  month_tag text,
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_cut_idx on public.products(category_id, cut_id);
create index products_status_idx on public.products(status);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  slot text not null check (slot in ('source', 'main', 'secondary_1', 'secondary_2', 'secondary_3')),
  storage_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  generated_by_ai boolean not null default false,
  prompt_used text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_approved_per_slot
  on public.product_images(product_id, slot) where status = 'approved';

create table public.image_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  requested_slot text,
  prompt text,
  model text,
  status text check (status in ('processing', 'completed', 'failed')),
  result_image_id uuid references public.product_images(id),
  error_message text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  month integer not null,
  year integer not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'exported')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  catalog_id uuid not null references public.catalogs(id) on delete cascade,
  product_id uuid not null references public.products(id),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (catalog_id, product_id)
);

create table public.catalog_exports (
  id uuid primary key default gen_random_uuid(),
  catalog_id uuid not null references public.catalogs(id) on delete cascade,
  storage_path text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
  for each row execute procedure public.set_updated_at();
create trigger cuts_set_updated_at before update on public.cuts
  for each row execute procedure public.set_updated_at();
create trigger products_set_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();
create trigger product_images_set_updated_at before update on public.product_images
  for each row execute procedure public.set_updated_at();
create trigger image_generation_jobs_set_updated_at before update on public.image_generation_jobs
  for each row execute procedure public.set_updated_at();
create trigger catalogs_set_updated_at before update on public.catalogs
  for each row execute procedure public.set_updated_at();
create trigger catalog_items_set_updated_at before update on public.catalog_items
  for each row execute procedure public.set_updated_at();
create trigger settings_set_updated_at before update on public.settings
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.cuts enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.image_generation_jobs enable row level security;
alter table public.catalogs enable row level security;
alter table public.catalog_items enable row level security;
alter table public.catalog_exports enable row level security;
alter table public.settings enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
