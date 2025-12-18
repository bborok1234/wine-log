begin;

-- Ensure consuming a bottle ONLY decreases stock_qty.
-- Purchases are immutable records; purchase_qty_total / purchase_value_total must NOT change.

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

commit;
