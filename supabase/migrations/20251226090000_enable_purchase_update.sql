begin;

-- 안전하게 와인 구매 통계를 재계산하는 헬퍼
create or replace function public.refresh_wine_purchase_stats(p_wine_id uuid)
returns void
language plpgsql
as $$
declare
  v_qty numeric;
  v_value numeric;
  v_last date;
begin
  select
    coalesce(sum(quantity), 0) as sum_qty,
    coalesce(sum(quantity * unit_price), 0) as sum_value,
    max(purchased_at) as max_purchased_at
  into v_qty, v_value, v_last
  from public.purchases
  where wine_id = p_wine_id;

  update public.wines
  set
    stock_qty = coalesce(v_qty, 0),
    purchase_qty_total = coalesce(v_qty, 0),
    purchase_value_total = coalesce(v_value, 0),
    avg_purchase_price = case when coalesce(v_qty, 0) > 0 then coalesce(v_value, 0) / v_qty else 0 end,
    last_purchased_at = v_last,
    updated_at = now()
  where id = p_wine_id;
end;
$$;

-- 트리거용 래퍼: insert/update/delete 모두 동일하게 처리
create or replace function public.after_purchase_refresh_stats()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_wine_purchase_stats(coalesce(new.wine_id, old.wine_id));
  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

-- 기존 트리거 정리 후 재생성 (insert/update/delete 공통)
drop trigger if exists purchases_update_wine_stats on public.purchases;
drop trigger if exists purchases_delete_update_wine_stats on public.purchases;
drop trigger if exists purchases_after_write_refresh_stats on public.purchases;
drop trigger if exists purchases_after_delete_refresh_stats on public.purchases;

create trigger purchases_refresh_stats
after insert or update or delete on public.purchases
for each row
execute function public.after_purchase_refresh_stats();

-- UPDATE RLS/권한 추가 (house 작성자만)
drop policy if exists "purchases_update_for_writers" on public.purchases;
create policy "purchases_update_for_writers" on public.purchases
for update
using (public.can_write_house(house_id))
with check (public.can_write_house(house_id));

grant update on table public.purchases to authenticated;

commit;

