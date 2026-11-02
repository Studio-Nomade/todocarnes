-- La feria terminó: la agenda pasa a ser permanente, de lunes a viernes en horario hábil, con
-- una ventana de dos semanas calendario. La subpágina /agenda se retira y el agendamiento vive
-- en la landing. El evento de la feria se conserva (sus reservas lo referencian) pero inactivo.

update public.booking_events
  set is_active = false
  where slug = 'food-service-2026';

update public.booking_events
  set is_active = true,
      horizon_days = 14,
      min_notice_hours = 24,
      weekdays = array[1,2,3,4,5]::smallint[],
      slot_times = array['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00']::time[],
      location = 'Videollamada, oficina o visita'
  where slug = 'agenda-comercial';
