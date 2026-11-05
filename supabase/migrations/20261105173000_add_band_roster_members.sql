create table if not exists public.band_roster_members (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public."Bands"(id) on delete cascade,
  name text not null,
  role text,
  image_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.band_roster_members enable row level security;

create or replace function public.get_band_roster_members(target_band_id uuid)
returns table (
  id uuid,
  name text,
  role text,
  image_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to view bandmates.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
  ) then
    raise exception 'Only confirmed band members can view bandmates.';
  end if;

  return query
  select roster.id, roster.name, roster.role, roster.image_url
  from public.band_roster_members as roster
  where roster.band_id = target_band_id
  order by roster.created_at asc;
end;
$$;

create or replace function public.add_band_roster_member(
  target_band_id uuid,
  roster_name text,
  roster_role text default null,
  roster_image_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_roster_member_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to add a bandmate.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can add bandmates.';
  end if;

  if nullif(trim(roster_name), '') is null then
    raise exception 'Bandmate name is required.';
  end if;

  insert into public.band_roster_members (band_id, name, role, image_url)
  values (
    target_band_id,
    trim(roster_name),
    nullif(trim(roster_role), ''),
    nullif(trim(roster_image_url), '')
  )
  returning id into new_roster_member_id;

  return new_roster_member_id;
end;
$$;

create or replace function public.update_band_roster_member(
  target_roster_member_id uuid,
  roster_name text,
  roster_role text default null,
  roster_image_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_band_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to edit a bandmate.';
  end if;

  select band_id into target_band_id
  from public.band_roster_members
  where id = target_roster_member_id;

  if target_band_id is null then
    raise exception 'Bandmate not found.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can edit bandmates.';
  end if;

  if nullif(trim(roster_name), '') is null then
    raise exception 'Bandmate name is required.';
  end if;

  update public.band_roster_members
  set
    name = trim(roster_name),
    role = nullif(trim(roster_role), ''),
    image_url = nullif(trim(roster_image_url), ''),
    updated_at = now()
  where id = target_roster_member_id;
end;
$$;

create or replace function public.remove_band_roster_member(target_roster_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_band_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to remove a bandmate.';
  end if;

  select band_id into target_band_id
  from public.band_roster_members
  where id = target_roster_member_id;

  if target_band_id is null then
    raise exception 'Bandmate not found.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can remove bandmates.';
  end if;

  delete from public.band_roster_members where id = target_roster_member_id;
end;
$$;

grant execute on function public.get_band_roster_members(uuid) to authenticated;
grant execute on function public.add_band_roster_member(uuid, text, text, text) to authenticated;
grant execute on function public.update_band_roster_member(uuid, text, text, text) to authenticated;
grant execute on function public.remove_band_roster_member(uuid) to authenticated;
