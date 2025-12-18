-- rpc_cellar_stats: returns aggregated cellar statistics for a filtered dataset
-- - respects RLS (SECURITY INVOKER default)
-- - designed for pagination/infinite-scroll UIs (no row payload, only aggregates)

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
in_stock as (
  select *
  from filtered
  where stock_qty > 0
),
by_country as (
  select
    country as country_label,
    sum(stock_qty)::bigint as count
  from in_stock
  group by country
  order by count desc, country_label asc
  limit 20
)
select jsonb_build_object(
  'totalBottles',
  coalesce((select sum(stock_qty)::bigint from in_stock), 0),
  'totalValue',
  coalesce(
    (
      select sum((stock_qty::bigint * round(coalesce(avg_purchase_price, 0))::bigint))::bigint
      from in_stock
    ),
    0
  ),
  'byType',
  jsonb_build_object(
    'red',
    coalesce((select sum(stock_qty)::bigint from in_stock where lower(type) = 'red'), 0),
    'white',
    coalesce((select sum(stock_qty)::bigint from in_stock where lower(type) = 'white'), 0),
    'sparkling',
    coalesce((select sum(stock_qty)::bigint from in_stock where lower(type) = 'sparkling'), 0),
    'others',
    coalesce((select sum(stock_qty)::bigint from in_stock where lower(type) not in ('red', 'white', 'sparkling')), 0)
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

