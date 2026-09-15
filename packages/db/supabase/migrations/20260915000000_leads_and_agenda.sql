create type public.area_comercial as enum (
  'food_service',
  'retail_ggcc',
  'mmpp_trimmings',
  'ventas_nacionales',
  'maquila_desarrollo',
  'marca_propia',
  'otro'
);

create type public.lead_source as enum ('landing', 'agenda_contact');

create type public.lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'closed',
  'discarded'
);

create type public.booking_status as enum ('pending', 'confirmed', 'cancelled');

create type public.contact_origin as enum (
  'redes_sociales',
  'mail_newsletter',
  'invitacion_comercial',
  'buscar_google',
  'a_traves_de_tercero',
  'otro'
);

alter table public.profiles
  add column area public.area_comercial,
  add column photo_url text,
  add column whatsapp text,
  add column public_bio text,
  add column public_order integer default 0,
  add column is_public boolean not null default false;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  area public.area_comercial,
  message text,
  source public.lead_source not null,
  came_from public.contact_origin,
  assigned_rep_id uuid references public.profiles(id),
  status public.lead_status not null default 'new',
  utm jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_idx on public.leads(status);
create index leads_area_idx on public.leads(area);
create index leads_assigned_rep_idx on public.leads(assigned_rep_id);
create index leads_created_at_idx on public.leads(created_at desc);

create table public.booking_events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  location text,
  start_date date,
  end_date date,
  days date[] not null,
  slot_times time[] not null,
  slot_minutes integer not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.booking_events(id),
  rep_id uuid not null references public.profiles(id),
  name text not null,
  company text,
  cargo text,
  email text not null,
  phone text,
  day date not null,
  slot_time time not null,
  topics text,
  came_from public.contact_origin,
  status public.booking_status not null default 'confirmed',
  ics_uid text not null unique default gen_random_uuid()::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index bookings_slot_unique
  on public.bookings(rep_id, event_id, day, slot_time)
  where status <> 'cancelled';

create trigger leads_set_updated_at before update on public.leads
  for each row execute procedure public.set_updated_at();
create trigger booking_events_set_updated_at before update on public.booking_events
  for each row execute procedure public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute procedure public.set_updated_at();

alter table public.leads enable row level security;
alter table public.booking_events enable row level security;
alter table public.bookings enable row level security;

revoke all on table public.leads, public.booking_events, public.bookings
  from anon, authenticated;
grant all on table public.leads, public.booking_events, public.bookings
  to service_role;

insert into public.booking_events (
  slug,
  name,
  location,
  start_date,
  end_date,
  days,
  slot_times
)
values (
  'food-service-2026',
  'Feria Food & Service 2026',
  'Stand Todo Carnes — Feria Food & Service 2026 (espacio por confirmar)',
  '2026-09-29',
  '2026-10-01',
  array['2026-09-29'::date, '2026-09-30'::date, '2026-10-01'::date],
  array['11:00'::time, '12:00'::time, '13:00'::time, '14:00'::time, '15:00'::time, '16:00'::time]
);

create or replace function public.available_slots(p_rep_id uuid, p_event_id uuid)
returns table(day date, slot_time time, taken boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select d::date as day,
         t as slot_time,
         exists(
           select 1
           from public.bookings b
           where b.rep_id = p_rep_id
             and b.event_id = p_event_id
             and b.day = d::date
             and b.slot_time = t
             and b.status <> 'cancelled'
         ) as taken
  from public.booking_events e,
       unnest(e.days) as d,
       unnest(e.slot_times) as t
  where e.id = p_event_id
  order by d, t;
$$;

revoke all on function public.available_slots(uuid, uuid) from public, anon, authenticated;
grant execute on function public.available_slots(uuid, uuid) to service_role;
