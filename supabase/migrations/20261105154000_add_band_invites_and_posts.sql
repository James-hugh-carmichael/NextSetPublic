create table if not exists public.band_invites (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null unique references public."Bands"(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references public."Musicians"(id),
  revoked_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.band_invites enable row level security;

alter table public."bandPosts"
  add column if not exists created_by uuid references public."Musicians"(id);

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

  insert into public."Bands" (name, genre, location, description, image_url, created_at, updated_at)
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

  insert into public.band_members (band_id, user_id, role, is_leader, joined_at)
  values (new_band_id, auth.uid(), 'Band Leader', true, now());

  insert into public.band_invites (band_id, code, created_by)
  values (
    new_band_id,
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    auth.uid()
  );

  return new_band_id;
end;
$$;

create or replace function public.get_band_invite_code(target_band_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_code text;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to view an invite code.';
  end if;

  if not exists (
    select 1 from public.band_members
    where band_id = target_band_id and user_id = auth.uid()
  ) then
    raise exception 'Only band members can view invite codes.';
  end if;

  select code into invite_code
  from public.band_invites
  where band_id = target_band_id and revoked_at is null;

  if invite_code is null then
    raise exception 'This band does not have an active invite code.';
  end if;

  return invite_code;
end;
$$;

create or replace function public.rotate_band_invite_code(target_band_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_code text;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to rotate an invite code.';
  end if;

  if not exists (
    select 1 from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can rotate the invite code.';
  end if;

  invite_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  update public.band_invites
  set code = invite_code, revoked_at = null, updated_at = now(), created_by = auth.uid()
  where band_id = target_band_id;

  if not found then
    insert into public.band_invites (band_id, code, created_by)
    values (target_band_id, invite_code, auth.uid());
  end if;

  return invite_code;
end;
$$;

create or replace function public.join_band_with_invite(
  invite_code text,
  member_role text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_band_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to join a band.';
  end if;

  select band_id into target_band_id
  from public.band_invites
  where code = upper(trim(invite_code))
    and revoked_at is null;

  if target_band_id is null then
    raise exception 'Invite code is invalid or has been rotated.';
  end if;

  insert into public.band_members (band_id, user_id, role, is_leader, joined_at)
  values (target_band_id, auth.uid(), nullif(trim(member_role), ''), false, now())
  on conflict (band_id, user_id) do nothing;

  return target_band_id;
end;
$$;

create or replace function public.create_band_post(
  target_band_id uuid,
  post_title text,
  post_description text,
  post_roles_needed text default null,
  post_commitment_level text default null,
  post_min_age bigint default null,
  post_max_age bigint default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_post_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to create a band post.';
  end if;

  if not exists (
    select 1 from public.band_members
    where band_id = target_band_id and user_id = auth.uid()
  ) then
    raise exception 'Only confirmed band members can create posts.';
  end if;

  if nullif(trim(post_title), '') is null then
    raise exception 'Post title is required.';
  end if;

  insert into public."bandPosts" (
    band_id,
    title,
    description,
    roles_needed,
    commitment_level,
    min_age,
    max_age,
    is_open,
    created_by,
    created_at,
    updated_at
  )
  values (
    target_band_id,
    trim(post_title),
    nullif(trim(post_description), ''),
    nullif(trim(post_roles_needed), ''),
    nullif(trim(post_commitment_level), ''),
    post_min_age,
    post_max_age,
    true,
    auth.uid(),
    now(),
    now()
  )
  returning id into new_post_id;

  return new_post_id;
end;
$$;

grant execute on function public.get_band_invite_code(uuid) to authenticated;
grant execute on function public.rotate_band_invite_code(uuid) to authenticated;
grant execute on function public.join_band_with_invite(text, text) to authenticated;
grant execute on function public.create_band_post(uuid, text, text, text, text, bigint, bigint) to authenticated;
