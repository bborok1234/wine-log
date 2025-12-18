begin;

-- Supabase linter: function_search_path_mutable
-- Fix by pinning search_path to a safe schema.

create or replace function public.rpc_cellar_stats(
  p_house_id uuid,
  p_q text default null,
  p_stock text default 'in_stock',
  p_consumed_only boolean default false,
  p_type text default null,
  p_country text default null,
  p_price_min numeric default null,
  p_price_max numeric default null
)
returns jsonb
language sql
stable
set search_path = public
as $$
with filtered as (
  select
    stock_qty,
    purchase_qty_total,
    purchase_value_total,
    avg_purchase_price,
    coalesce(nullif(trim(type), ''), 'other') as type,
    coalesce(nullif(trim(country), ''), '기타') as country
  from public.wines
  where house_id = p_house_id
    and (
      p_stock is null
      or p_stock = 'all'
      or (p_stock = 'in_stock' and stock_qty > 0)
      or (p_stock = 'out_of_stock' and stock_qty = 0)
    )
    and (
      not p_consumed_only
      or greatest(purchase_qty_total - stock_qty, 0) > 0
    )
    and (
      p_type is null
      or p_type = ''
      or lower(type) = lower(p_type)
    )
    and (
      p_country is null
      or p_country = ''
      or trim(country) = trim(p_country)
    )
    and (p_price_min is null or avg_purchase_price >= p_price_min)
    and (p_price_max is null or avg_purchase_price <= p_price_max)
    and (
      p_q is null
      or p_q = ''
      or (
        coalesce(producer, '') ilike ('%' || p_q || '%')
        or coalesce(name, '') ilike ('%' || p_q || '%')
        or coalesce(region, '') ilike ('%' || p_q || '%')
        or coalesce(country, '') ilike ('%' || p_q || '%')
      )
    )
),
per_wine as (
  select
    type,
    country,
    greatest(stock_qty, 0)::bigint as on_hand_qty,
    greatest(purchase_qty_total, 0)::bigint as total_qty,
    greatest(purchase_qty_total - stock_qty, 0)::bigint as consumed_qty,
    greatest(
      round(coalesce(avg_purchase_price, 0))::bigint * greatest(stock_qty, 0)::bigint,
      0
    )::bigint as on_hand_value,
    greatest(round(coalesce(purchase_value_total, 0))::bigint, 0)::bigint as total_value
  from filtered
),
agg as (
  select
    coalesce(sum(on_hand_qty), 0)::bigint as on_hand_qty,
    coalesce(sum(total_qty), 0)::bigint as total_qty,
    coalesce(sum(on_hand_value), 0)::bigint as on_hand_value,
    coalesce(sum(total_value), 0)::bigint as total_value
  from per_wine
),
agg_consumed as (
  select
    (select total_qty from agg) - (select on_hand_qty from agg) as consumed_qty,
    greatest((select total_value from agg) - (select on_hand_value from agg), 0)::bigint as consumed_value
),
on_hand_by_country as (
  select country as label, sum(on_hand_qty)::bigint as count
  from per_wine
  where on_hand_qty > 0
  group by country
  order by count desc, label asc
  limit 20
),
consumed_by_country as (
  select country as label, sum(consumed_qty)::bigint as count
  from per_wine
  where consumed_qty > 0
  group by country
  order by count desc, label asc
  limit 20
),
on_hand_by_type as (
  select
    sum(case when lower(type) = 'red' then on_hand_qty else 0 end)::bigint as red,
    sum(case when lower(type) = 'white' then on_hand_qty else 0 end)::bigint as white,
    sum(case when lower(type) = 'sparkling' then on_hand_qty else 0 end)::bigint as sparkling,
    sum(case when lower(type) not in ('red','white','sparkling') then on_hand_qty else 0 end)::bigint as others
  from per_wine
),
consumed_by_type as (
  select
    sum(case when lower(type) = 'red' then consumed_qty else 0 end)::bigint as red,
    sum(case when lower(type) = 'white' then consumed_qty else 0 end)::bigint as white,
    sum(case when lower(type) = 'sparkling' then consumed_qty else 0 end)::bigint as sparkling,
    sum(case when lower(type) not in ('red','white','sparkling') then consumed_qty else 0 end)::bigint as others
  from per_wine
)
select jsonb_build_object(
  'onHand',
  jsonb_build_object(
    'bottles', (select on_hand_qty from agg),
    'value', (select on_hand_value from agg),
    'byType', jsonb_build_object(
      'red', coalesce((select red from on_hand_by_type), 0),
      'white', coalesce((select white from on_hand_by_type), 0),
      'sparkling', coalesce((select sparkling from on_hand_by_type), 0),
      'others', coalesce((select others from on_hand_by_type), 0)
    ),
    'byCountry',
    coalesce(
      (select jsonb_agg(jsonb_build_array(label, count) order by count desc, label asc) from on_hand_by_country),
      '[]'::jsonb
    )
  ),
  'consumed',
  jsonb_build_object(
    'bottles', (select consumed_qty from agg_consumed),
    'value', (select consumed_value from agg_consumed),
    'byType', jsonb_build_object(
      'red', coalesce((select red from consumed_by_type), 0),
      'white', coalesce((select white from consumed_by_type), 0),
      'sparkling', coalesce((select sparkling from consumed_by_type), 0),
      'others', coalesce((select others from consumed_by_type), 0)
    ),
    'byCountry',
    coalesce(
      (select jsonb_agg(jsonb_build_array(label, count) order by count desc, label asc) from consumed_by_country),
      '[]'::jsonb
    )
  ),
  'total',
  jsonb_build_object(
    'bottles', (select total_qty from agg),
    'value', (select total_value from agg)
  )
);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.before_purchase_validate_house()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_house_id uuid;
begin
  select w.house_id into v_house_id
  from public.wines w
  where w.id = new.wine_id;

  if v_house_id is null then
    raise exception 'Wine not found';
  end if;

  if new.house_id <> v_house_id then
    raise exception 'house_id does not match wine.house_id';
  end if;

  return new;
end;
$$;

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
    updated_at = now()
  where id = new.wine_id;

  return new;
end;
$$;

create or replace function public.after_purchase_delete_update_wine_stats()
returns trigger
language plpgsql
set search_path = public
as $$
begin
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
    updated_at = now()
  where id = old.wine_id;

  return old;
end;
$$;

commit;
