-- Bucket privado para el historial de PDFs exportados. La descarga en vivo va
-- por el stream del endpoint; esta copia es el registro para el Admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog-exports', 'catalog-exports', false, 104857600, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
