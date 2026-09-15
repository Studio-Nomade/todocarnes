-- Desde 20260726000000_profile_signature, profiles.contact_email es NOT NULL sin
-- default. El trigger handle_new_user insertaba (id, name, role) sin contact_email,
-- así que toda alta de usuario en auth.users fallaba con NOT NULL al crear el profile.
-- Se repuebla contact_email desde el email de auth en el propio trigger.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, contact_email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1), 'Usuario'),
    new.email,
    'commercial'
  );
  return new;
end;
$$;
