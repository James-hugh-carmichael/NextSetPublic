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
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can view invite codes.';
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
