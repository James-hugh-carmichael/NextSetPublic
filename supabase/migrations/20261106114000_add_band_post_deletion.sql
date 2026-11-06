create function public.delete_band_post(target_post_id uuid)
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
    raise exception 'You must be signed in to delete a band post.';
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
    raise exception 'Only the post creator or band leader can delete this post.';
  end if;

  delete from public."bandPosts"
  where id = target_post_id;
end;
$$;

grant execute on function public.delete_band_post(uuid) to authenticated;
