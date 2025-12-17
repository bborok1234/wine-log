-- Recreate rpc_create_invite with schema-qualified gen_random_bytes
create or replace function public.rpc_create_invite(
  p_house_id uuid,
  p_role text,
  p_expires_in_days int default null
)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_role not in ('editor','viewer') then
    raise exception 'Invalid role';
  end if;

  if not public.is_house_owner(p_house_id) then
    raise exception 'Not permitted';
  end if;

  -- explicitly use extensions schema (pgcrypto)
  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.house_invites (house_id, token, role, expires_at, created_by)
  values (
    p_house_id,
    v_token,
    p_role,
    case
      when p_expires_in_days is null then null
      else now() + make_interval(days => p_expires_in_days)
    end,
    auth.uid()
  );

  return v_token;
end;
$$;

grant execute on function public.rpc_create_invite(uuid, text, int) to authenticated;


