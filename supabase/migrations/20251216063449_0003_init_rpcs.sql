begin;

create or replace function public.rpc_open_bottle(p_wine_id uuid)
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_stock int;
begin
  update public.wines
  set stock_qty = greatest(stock_qty - 1, 0)
  where id = p_wine_id
  returning stock_qty into v_stock;

  if v_stock is null then
    raise exception 'Wine not found or not permitted';
  end if;

  return v_stock;
end;
$$;

grant execute on function public.rpc_open_bottle(uuid) to authenticated;

create or replace function public.rpc_create_invite(
  p_house_id uuid,
  p_role text,
  p_expires_in_days int default null
)
returns text
language plpgsql
security definer
set search_path = public
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

  v_token := encode(gen_random_bytes(32), 'hex');

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

create or replace function public.rpc_accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_house_id uuid;
  v_role text;
  v_expires_at timestamptz;
  v_used_at timestamptz;
  v_used_by uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select i.id, i.house_id, i.role, i.expires_at, i.used_at, i.used_by
  into v_id, v_house_id, v_role, v_expires_at, v_used_at, v_used_by
  from public.house_invites i
  where i.token = p_token
  for update;

  if v_id is null then
    raise exception 'Invalid invite';
  end if;

  if v_expires_at is not null and v_expires_at < now() then
    raise exception 'Invite expired';
  end if;

  if v_used_at is not null then
    if v_used_by = auth.uid() then
      return v_house_id;
    end if;
    raise exception 'Invite already used';
  end if;

  insert into public.house_members (house_id, user_id, role)
  values (v_house_id, auth.uid(), v_role)
  on conflict (house_id, user_id) do update
  set role = excluded.role;

  update public.house_invites
  set used_by = auth.uid(),
      used_at = now()
  where id = v_id;

  return v_house_id;
end;
$$;

grant execute on function public.rpc_accept_invite(text) to authenticated;

commit;
