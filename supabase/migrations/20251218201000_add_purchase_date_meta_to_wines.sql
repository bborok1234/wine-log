begin;

-- Add purchase date metadata to wines for fast sorting.
-- last_purchased_at: max(purchases.purchased_at) per wine
-- first_purchased_at: min(purchases.purchased_at) per wine (future use)

alter table public.wines
  add column if not exists first_purchased_at date,
  add column if not exists last_purchased_at date;

-- Backfill from existing purchases
update public.wines w
set
  first_purchased_at = p.first_purchased_at,
  last_purchased_at = p.last_purchased_at
from (
  select
    wine_id,
    min(purchased_at) as first_purchased_at,
    max(purchased_at) as last_purchased_at
  from public.purchases
  group by wine_id
) p
where w.id = p.wine_id;

-- Cover common list sorting patterns (scoped by house_id)
create index if not exists wines_house_id_last_purchased_at_id_idx
on public.wines (house_id, last_purchased_at, id);

create index if not exists wines_house_id_first_purchased_at_id_idx
on public.wines (house_id, first_purchased_at, id);

-- Keep metadata in sync on purchase insert
create or replace function public.after_purchase_update_wine_stats()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.wines
  set
    stock_qty = stock_qty + new.quantity,
    purchase_qty_total = purchase_qty_total + new.quantity,
    purchase_value_total = purchase_value_total + (new.unit_price * new.quantity),
    avg_purchase_price = case
      when (purchase_qty_total + new.quantity) > 0
        then (purchase_value_total + (new.unit_price * new.quantity)) / (purchase_qty_total + new.quantity)
      else 0
    end,
    first_purchased_at = least(coalesce(first_purchased_at, new.purchased_at), new.purchased_at),
    last_purchased_at = greatest(coalesce(last_purchased_at, new.purchased_at), new.purchased_at),
    updated_at = now()
  where id = new.wine_id;

  return new;
end;
$$;

-- Keep metadata in sync on purchase delete
create or replace function public.after_purchase_delete_update_wine_stats()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_first date;
  v_last date;
begin
  select
    min(p.purchased_at),
    max(p.purchased_at)
  into v_first, v_last
  from public.purchases p
  where p.wine_id = old.wine_id;

  update public.wines
  set
    stock_qty = greatest(stock_qty - old.quantity, 0),
    purchase_qty_total = greatest(purchase_qty_total - old.quantity, 0),
    purchase_value_total = greatest(
      purchase_value_total - (old.unit_price * old.quantity),
      0
    ),
    avg_purchase_price = case
      when (purchase_qty_total - old.quantity) > 0
        then (purchase_value_total - (old.unit_price * old.quantity)) / (purchase_qty_total - old.quantity)
      else 0
    end,
    first_purchased_at = v_first,
    last_purchased_at = v_last,
    updated_at = now()
  where id = old.wine_id;

  return old;
end;
$$;

commit;
