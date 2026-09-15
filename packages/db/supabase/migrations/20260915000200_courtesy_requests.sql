create table public.courtesy_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  cargo text not null,
  email text not null,
  phone text not null,
  area public.area_comercial not null,
  event_id uuid not null references public.booking_events(id),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index courtesy_requests_event_idx on public.courtesy_requests(event_id);
create index courtesy_requests_status_idx on public.courtesy_requests(status);
create index courtesy_requests_created_at_idx on public.courtesy_requests(created_at desc);

alter table public.courtesy_requests enable row level security;

revoke all on table public.courtesy_requests from anon, authenticated;
grant all on table public.courtesy_requests to service_role;
