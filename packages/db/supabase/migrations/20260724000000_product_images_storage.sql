insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.approve_product_image(target_image_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  target_product_id uuid;
  target_slot text;
begin
  select product_id, slot
    into target_product_id, target_slot
  from public.product_images
  where id = target_image_id
  for update;

  if target_product_id is null then
    raise exception 'Imagen no encontrada';
  end if;

  update public.product_images
  set status = 'rejected'
  where product_id = target_product_id
    and slot = target_slot
    and status = 'approved'
    and id <> target_image_id;

  update public.product_images
  set status = 'approved'
  where id = target_image_id;
end;
$$;

revoke all on function public.approve_product_image(uuid) from public, anon, authenticated;
grant execute on function public.approve_product_image(uuid) to service_role;
