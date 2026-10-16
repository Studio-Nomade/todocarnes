alter table public.booking_events
  add column if not exists kind text not null default 'event' check (kind in ('event', 'permanent')),
  add column if not exists weekdays smallint[] not null default '{1,2,3,4,5}',
  add column if not exists horizon_days integer not null default 10,
  add column if not exists min_notice_hours integer not null default 24,
  add column if not exists blackout_dates date[] not null default '{}';

alter table public.booking_events alter column days drop not null;

alter table public.bookings
  add column if not exists modality text check (modality in ('videollamada', 'oficina', 'visita')),
  add column if not exists location_detail text;

insert into public.booking_events (
  slug,
  name,
  location,
  days,
  slot_times,
  slot_minutes,
  is_active,
  kind,
  weekdays,
  horizon_days,
  min_notice_hours,
  blackout_dates
)
values (
  'agenda-comercial',
  'Agenda comercial Todo Carnes',
  null,
  null,
  array['10:00'::time, '11:00'::time, '12:00'::time, '15:00'::time, '16:00'::time],
  30,
  false,
  'permanent',
  array[1,2,3,4,5]::smallint[],
  10,
  24,
  array[
    '2026-10-31'::date, '2026-11-01'::date, '2026-12-08'::date, '2026-12-25'::date,
    '2027-01-01'::date, '2027-03-26'::date, '2027-03-27'::date, '2027-05-01'::date,
    '2027-05-21'::date, '2027-06-21'::date, '2027-06-28'::date, '2027-07-16'::date,
    '2027-08-15'::date, '2027-09-18'::date, '2027-09-19'::date, '2027-10-11'::date,
    '2027-10-31'::date, '2027-11-01'::date, '2027-12-08'::date, '2027-12-25'::date
  ]
)
on conflict (slug) do nothing;
