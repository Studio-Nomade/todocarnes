alter table public.products
  add column if not exists uses text[] not null default '{}';

with inserted_category as (
  insert into public.categories (name, slug, sort_order, icon_key)
  values ('Don Pancho', 'don-pancho', 4, 'don-pancho')
  on conflict (slug) do nothing
  returning id
), target_category as (
  select id from inserted_category
  union all
  select id from public.categories where slug = 'don-pancho'
  limit 1
)
insert into public.cuts (category_id, name, slug, sort_order)
select target_category.id, cut.name, cut.slug, cut.sort_order
from target_category
cross join (values
  ('Cerdo', 'cerdo', 0),
  ('Pollo', 'pollo', 1),
  ('Vacuno', 'vacuno', 2)
) as cut(name, slug, sort_order)
on conflict (category_id, slug) do nothing;
