alter table public.products
  add column if not exists available_soon boolean not null default false;
