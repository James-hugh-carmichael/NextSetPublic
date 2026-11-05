create table if not exists public.band_join_requests (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public."Bands"(id) on delete cascade,
  musician_id uuid not null references public."Musicians"(id) on delete cascade,
  requested_role text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (band_id, musician_id)
);

create unique index if not exists band_members_band_user_unique
  on public.band_members (band_id, user_id);

alter table public.band_join_requests enable row level security;

drop policy if exists "Members can view their memberships" on public.band_members;
create policy "Members can view their memberships"
  on public.band_members
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Musicians and leaders can view band join requests" on public.band_join_requests;
create policy "Musicians and leaders can view band join requests"
  on public.band_join_requests
  for select
  to authenticated
  using (
    auth.uid() = musician_id
    or exists (
      select 1
      from public.band_members
      where band_members.band_id = band_join_requests.band_id
        and band_members.user_id = auth.uid()
        and band_members.is_leader is true
    )
  );

grant select on public.band_members to authenticated;
grant select on public.band_join_requests to authenticated;

create or replace function public.create_band(
  band_name text,
  band_genre text,
  band_location text,
  band_description text default null,
  band_image_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_band_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to create a band.';
  end if;

  if not exists (select 1 from public."Musicians" where id = auth.uid()) then
    raise exception 'A musician profile is required before creating a band.';
  end if;

  if nullif(trim(band_name), '') is null then
    raise exception 'Band name is required.';
  end if;

  insert into public."Bands" (
    name,
    genre,
    location,
    description,
    image_url,
    created_at,
    updated_at
  )
  values (
    trim(band_name),
    nullif(trim(band_genre), ''),
    nullif(trim(band_location), ''),
    nullif(trim(band_description), ''),
    nullif(trim(band_image_url), ''),
    now(),
    now()
  )
  returning id into new_band_id;

  insert into public.band_members (
    band_id,
    user_id,
    role,
    is_leader,
    joined_at
  )
  values (
    new_band_id,
    auth.uid(),
    'Band Leader',
    true,
    now()
  );

  return new_band_id;
end;
$$;

create or replace function public.request_band_membership(
  target_band_id uuid,
  requested_member_role text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to request membership.';
  end if;

  if not exists (select 1 from public."Bands" where id = target_band_id) then
    raise exception 'Band not found.';
  end if;

  if exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
  ) then
    raise exception 'You are already a member of this band.';
  end if;

  insert into public.band_join_requests (
    band_id,
    musician_id,
    requested_role,
    status,
    created_at,
    updated_at
  )
  values (
    target_band_id,
    auth.uid(),
    nullif(trim(requested_member_role), ''),
    'pending',
    now(),
    now()
  )
  on conflict (band_id, musician_id)
  do update set
    requested_role = excluded.requested_role,
    status = 'pending',
    updated_at = now()
  returning id into request_id;

  return request_id;
end;
$$;

create or replace function public.review_band_join_request(
  target_request_id uuid,
  approve boolean,
  member_role text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_band_id uuid;
  target_musician_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to review membership requests.';
  end if;

  select band_id, musician_id
  into target_band_id, target_musician_id
  from public.band_join_requests
  where id = target_request_id
    and status = 'pending'
  for update;

  if target_band_id is null then
    raise exception 'Pending membership request not found.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can review membership requests.';
  end if;

  update public.band_join_requests
  set status = case when approve then 'approved' else 'rejected' end,
      updated_at = now()
  where id = target_request_id;

  if approve then
    insert into public.band_members (
      band_id,
      user_id,
      role,
      is_leader,
      joined_at
    )
    values (
      target_band_id,
      target_musician_id,
      nullif(trim(member_role), ''),
      false,
      now()
    )
    on conflict (band_id, user_id) do nothing;
  end if;
end;
$$;

grant execute on function public.create_band(text, text, text, text, text) to authenticated;
grant execute on function public.request_band_membership(uuid, text) to authenticated;
grant execute on function public.review_band_join_request(uuid, boolean, text) to authenticated;
