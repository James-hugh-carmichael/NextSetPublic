alter table public."Bands"
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add constraint bands_latitude_range check (latitude is null or latitude between -90 and 90),
  add constraint bands_longitude_range check (longitude is null or longitude between -180 and 180);

create table if not exists public.user_locations (
  user_id uuid primary key references public."Musicians"(id) on delete cascade,
  area text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  updated_at timestamp with time zone not null default now()
);

alter table public.user_locations enable row level security;

create policy "Users manage their own location"
  on public.user_locations
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.update_band_location(
  target_band_id uuid,
  band_area text,
  band_latitude double precision,
  band_longitude double precision
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to update a band location.';
  end if;

  if not exists (
    select 1 from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can update the band location.';
  end if;

  if band_latitude not between -90 and 90 or band_longitude not between -180 and 180 then
    raise exception 'Invalid band coordinates.';
  end if;

  update public."Bands"
  set
    location = nullif(trim(band_area), ''),
    latitude = band_latitude,
    longitude = band_longitude,
    updated_at = now()
  where id = target_band_id;
end;
$$;

grant select, insert, update on public.user_locations to authenticated;
grant execute on function public.update_band_location(uuid, text, double precision, double precision) to authenticated;
