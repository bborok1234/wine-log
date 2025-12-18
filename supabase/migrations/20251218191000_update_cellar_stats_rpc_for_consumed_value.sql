-- Update rpc_cellar_stats to support "consumed value" when stock filter is out_of_stock.
-- For average-cost accounting:
-- - on_hand_value = stock_qty * avg_purchase_price
-- - consumed_value = purchase_value_total - on_hand_value (clamped)
-- - consumed_qty   = purchase_qty_total - stock_qty (clamped)

create or replace function public.rpc_cellar_stats(
  p_house_id uuid,
  p_q text default null,
  p_stock text default 'in_stock',
  p_type text default null,
  p_country text default null,
  p_price_min numeric default null,
  p_price_max numeric default null
)
returns jsonb
language sql
stable
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
metrics as (
  select
    type,
    country,
    greatest(stock_qty, 0)::bigint as on_hand_qty,
    greatest(purchase_qty_total - stock_qty, 0)::bigint as consumed_qty,
    greatest(round(coalesce(avg_purchase_price, 0))::bigint * greatest(stock_qty, 0)::bigint, 0)::bigint as on_hand_value,
    greatest(round(coalesce(purchase_value_total, 0))::bigint - (round(coalesce(avg_purchase_price, 0))::bigint * greatest(stock_qty, 0)::bigint), 0)::bigint as consumed_value
  from filtered
),
display as (
  select
    case when p_stock = 'out_of_stock' then consumed_qty else on_hand_qty end as display_qty,
    case when p_stock = 'out_of_stock' then consumed_value else on_hand_value end as display_value,
    type,
    country
  from metrics
),
by_country as (
  select
    country as country_label,
    sum(display_qty)::bigint as count
  from display
  where display_qty > 0
  group by country
  order by count desc, country_label asc
  limit 20
),
by_type as (
  select
    sum(case when lower(type) = 'red' then display_qty else 0 end)::bigint as red,
    sum(case when lower(type) = 'white' then display_qty else 0 end)::bigint as white,
    sum(case when lower(type) = 'sparkling' then display_qty else 0 end)::bigint as sparkling,
    sum(case when lower(type) not in ('red','white','sparkling') then display_qty else 0 end)::bigint as others
  from display
)
select jsonb_build_object(
  'totalBottles',
  coalesce((select sum(display_qty)::bigint from display), 0),
  'totalValue',
  coalesce((select sum(display_value)::bigint from display), 0),
  'byType',
  jsonb_build_object(
    'red', coalesce((select red from by_type), 0),
    'white', coalesce((select white from by_type), 0),
    'sparkling', coalesce((select sparkling from by_type), 0),
    'others', coalesce((select others from by_type), 0)
  ),
  'byCountry',
  coalesce(
    (
      select jsonb_agg(jsonb_build_array(country_label, count) order by count desc, country_label asc)
      from by_country
    ),
    '[]'::jsonb
  )
);
$$;

