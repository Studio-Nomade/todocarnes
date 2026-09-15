update public.services
set status = 'inactive'
where lower(title) = 'maquila de envasados';

insert into public.services (title, description, sort_order)
select service.title, service.description, service.sort_order
from (values
  ('Procesamiento cárnico', 'Limpieza, saborizado, pesaje, porcionado, inyección, envasado y etiquetado.', 0),
  ('Descongelación por radiofrecuencia', 'Proceso rápido de -18 °C a -2 °C, sin manipulación ni pérdida de peso.', 1),
  ('Túnel de frío', 'Congelación a -35 °C para preservar la frescura y calidad del producto.', 2),
  ('Laboratorio y control sanitario', 'Análisis microbiológicos para asegurar inocuidad y cumplimiento normativo.', 3),
  ('Producción e importación de carnes', 'Procesamiento de cerdo y comercialización de carnes de cerdo, pollo y vacuno.', 4)
) as service(title, description, sort_order)
where not exists (
  select 1 from public.services existing where lower(existing.title) = lower(service.title)
);
