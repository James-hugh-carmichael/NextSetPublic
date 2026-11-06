create or replace function public.get_band_roster_members(target_band_id uuid)
returns table (
  id uuid,
  name text,
  role text,
  image_url text,
  age integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to view bandmates.';
  end if;

  return query
  select roster.id, roster.name, roster.role, roster.image_url, roster.age
  from public.band_roster_members as roster
  where roster.band_id = target_band_id
  order by roster.created_at asc;
end;
$$;
