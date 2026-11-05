create or replace function public.get_band_members(target_band_id uuid)
returns table (
  user_id uuid,
  name text,
  avatar_url text,
  role text,
  is_leader boolean,
  joined_at timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to view band members.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
  ) then
    raise exception 'Only confirmed band members can view the member list.';
  end if;

  return query
  select
    member.user_id,
    musician.name,
    musician.avatar_url,
    member.role,
    coalesce(member.is_leader, false),
    member.joined_at
  from public.band_members as member
  join public."Musicians" as musician on musician.id = member.user_id
  where member.band_id = target_band_id
  order by coalesce(member.is_leader, false) desc, member.joined_at asc;
end;
$$;

grant execute on function public.get_band_members(uuid) to authenticated;
