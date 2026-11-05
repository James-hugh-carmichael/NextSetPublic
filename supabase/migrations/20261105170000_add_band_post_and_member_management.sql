create or replace function public.update_band_post(
  target_post_id uuid,
  post_title text,
  post_description text default null,
  post_roles_needed text default null,
  post_commitment_level text default null,
  post_is_open boolean default true
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

  select band_id, created_by
  into target_band_id, post_owner_id
  from public."bandPosts"
  where id = target_post_id;

  if target_band_id is null then
    raise exception 'Band post not found.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and (is_leader is true or post_owner_id = auth.uid())
  ) then
    raise exception 'Only the post creator or band leader can edit this post.';
  end if;

  if nullif(trim(post_title), '') is null then
    raise exception 'Post title is required.';
  end if;

  update public."bandPosts"
  set
    title = trim(post_title),
    description = nullif(trim(post_description), ''),
    roles_needed = nullif(trim(post_roles_needed), ''),
    commitment_level = nullif(trim(post_commitment_level), ''),
    is_open = post_is_open,
    updated_at = now()
  where id = target_post_id;
end;
$$;

create or replace function public.update_band_member(
  target_band_id uuid,
  target_user_id uuid,
  member_role text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to edit a band member.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can edit members.';
  end if;

  update public.band_members
  set role = nullif(trim(member_role), '')
  where band_id = target_band_id
    and user_id = target_user_id;

  if not found then
    raise exception 'Band member not found.';
  end if;
end;
$$;

create or replace function public.remove_band_member(
  target_band_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to remove a band member.';
  end if;

  if not exists (
    select 1
    from public.band_members
    where band_id = target_band_id
      and user_id = auth.uid()
      and is_leader is true
  ) then
    raise exception 'Only a band leader can remove members.';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'A band leader cannot remove themselves.';
  end if;

  delete from public.band_members
  where band_id = target_band_id
    and user_id = target_user_id;

  if not found then
    raise exception 'Band member not found.';
  end if;
end;
$$;

grant execute on function public.update_band_post(uuid, text, text, text, text, boolean) to authenticated;
grant execute on function public.update_band_member(uuid, uuid, text) to authenticated;
grant execute on function public.remove_band_member(uuid, uuid) to authenticated;
