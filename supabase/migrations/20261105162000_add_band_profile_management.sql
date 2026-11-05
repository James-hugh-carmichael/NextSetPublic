alter table public."Bands"
  add column if not exists videos text;

create or replace function public.update_band(
  target_band_id uuid,
  band_name text,
  band_genre text,
  band_location text,
  band_description text default null,
  band_image_url text default null,
  band_videos text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to edit a band.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can edit this band.';
  end if;

  if nullif(trim(band_name), '') is null then
    raise exception 'Band name is required.';
  end if;

  if band_videos is not null and jsonb_typeof(band_videos::jsonb) <> 'array' then
    raise exception 'Band videos must be a JSON array.';
  end if;

  update public."Bands"
  set
    name = trim(band_name),
    genre = nullif(trim(band_genre), ''),
    location = nullif(trim(band_location), ''),
    description = nullif(trim(band_description), ''),
    image_url = nullif(trim(band_image_url), ''),
    videos = band_videos,
    updated_at = now()
  where id = target_band_id;

  if not found then
    raise exception 'Band not found.';
  end if;
end;
$$;

create or replace function public.delete_band(target_band_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to delete a band.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can delete this band.';
  end if;

  delete from public.requests
  where post_id in (
    select id from public."bandPosts" where band_id = target_band_id
  );

  delete from public."bandPosts" where band_id = target_band_id;
  delete from public.band_members where band_id = target_band_id;
  delete from public."Bands" where id = target_band_id;
end;
$$;

grant execute on function public.update_band(uuid, text, text, text, text, text, text) to authenticated;
grant execute on function public.delete_band(uuid) to authenticated;
