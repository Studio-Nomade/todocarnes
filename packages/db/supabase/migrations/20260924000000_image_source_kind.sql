alter table public.product_images
  add column if not exists source_kind text not null default 'upload'
    check (source_kind in ('session', 'catalog_pdf', 'ai', 'upload')),
  add column if not exists source_ref text,
  add column if not exists sort_order integer not null default 0;

update public.product_images
set source_kind = 'ai'
where generated_by_ai;

create unique index if not exists product_images_source_ref_unique
  on public.product_images(product_id, source_ref)
  where source_ref is not null;

create index if not exists product_images_candidates_idx
  on public.product_images(product_id, slot, status, sort_order, created_at);

alter table public.products
  add column if not exists import_ref text;

create unique index if not exists products_import_ref_unique
  on public.products(import_ref)
  where import_ref is not null;
