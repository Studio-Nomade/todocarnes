alter table public.profiles
  add column contact_email text,
  add column job_title text not null default '',
  add column phone text not null default '';

update public.profiles as profile
set contact_email = coalesce(
  (select auth_user.email from auth.users as auth_user where auth_user.id = profile.id),
  'sin-correo@tdcarnes.cl'
)
where profile.contact_email is null;

alter table public.profiles
  alter column contact_email set not null;
