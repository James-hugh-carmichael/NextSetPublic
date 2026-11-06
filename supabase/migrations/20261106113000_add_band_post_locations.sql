alter table public."bandPosts"
  add column if not exists location text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add constraint band_posts_latitude_range check (latitude is null or latitude between -90 and 90),
  add constraint band_posts_longitude_range check (longitude is null or longitude between -180 and 180);

drop function if exists public.create_band_post(uuid, text, text, text, text, bigint, bigint);
drop function if exists public.update_band_post(uuid, text, text, text, text, boolean);

create function public.create_band_post(
  target_band_id uuid,
  post_title text,
  post_description text default null,
  post_roles_needed text default null,
  post_commitment_level text default null,
  post_min_age bigint default null,
  post_max_age bigint default null,
  post_location text default null,
  post_latitude double precision default null,
  post_longitude double precision default null
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

  if (post_latitude is null) <> (post_longitude is null)
    or (post_latitude is not null and (post_latitude not between -90 and 90 or post_longitude not between -180 and 180)) then
    raise exception 'Invalid post coordinates.';
  end if;

  insert into public."bandPosts" (
    band_id, title, description, roles_needed, commitment_level, min_age, max_age,
    location, latitude, longitude, is_open, created_by, created_at, updated_at
  )
  values (
    target_band_id, trim(post_title), nullif(trim(post_description), ''),
    nullif(trim(post_roles_needed), ''), nullif(trim(post_commitment_level), ''),
    post_min_age, post_max_age, nullif(trim(post_location), ''),
    post_latitude, post_longitude, true, auth.uid(), now(), now()
  )
  returning id into new_post_id;

  return new_post_id;
end;
$$;

create function public.update_band_post(
  target_post_id uuid,
  post_title text,
  post_description text default null,
  post_roles_needed text default null,
  post_commitment_level text default null,
  post_is_open boolean default true,
  post_location text default null,
  post_latitude double precision default null,
  post_longitude double precision default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_band_id uuid;
  post_owner_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to edit a band post.';
  end if;

  select band_id, created_by into target_band_id, post_owner_id
  from public."bandPosts" where id = target_post_id;

  if target_band_id is null then
    raise exception 'Band post not found.';
  end if;

  if not exists (
    select 1 from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and (is_leader is true or post_owner_id = auth.uid())
  ) then
    raise exception 'Only the post creator or band leader can edit this post.';
  end if;

  if nullif(trim(post_title), '') is null then
    raise exception 'Post title is required.';
  end if;

  if (post_latitude is null) <> (post_longitude is null)
    or (post_latitude is not null and (post_latitude not between -90 and 90 or post_longitude not between -180 and 180)) then
    raise exception 'Invalid post coordinates.';
  end if;

  update public."bandPosts"
  set
    title = trim(post_title),
    description = nullif(trim(post_description), ''),
    roles_needed = nullif(trim(post_roles_needed), ''),
    commitment_level = nullif(trim(post_commitment_level), ''),
    is_open = post_is_open,
    location = nullif(trim(post_location), ''),
    latitude = post_latitude,
    longitude = post_longitude,
    updated_at = now()
  where id = target_post_id;
end;
$$;

grant execute on function public.create_band_post(uuid, text, text, text, text, bigint, bigint, text, double precision, double precision) to authenticated;
grant execute on function public.update_band_post(uuid, text, text, text, text, boolean, text, double precision, double precision) to authenticated;
