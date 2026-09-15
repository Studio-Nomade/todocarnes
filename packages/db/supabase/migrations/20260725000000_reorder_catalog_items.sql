-- Reordena los ítems de un catálogo en un solo UPDATE atómico:
-- sort_order = posición del producto en el array recibido (0-based).
create or replace function public.reorder_catalog_items(target_catalog_id uuid, ordered_ids uuid[])
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.catalog_items ci
  set sort_order = pos.ord - 1
  from unnest(ordered_ids) with ordinality as pos(product_id, ord)
  where ci.catalog_id = target_catalog_id
    and ci.product_id = pos.product_id;
end;
$$;

revoke all on function public.reorder_catalog_items(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_catalog_items(uuid, uuid[]) to service_role;
