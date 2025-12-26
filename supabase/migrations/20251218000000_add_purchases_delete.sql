begin;

-- purchases DELETE RLS 정책 추가
drop policy if exists "purchases_delete_for_writers" on public.purchases;
create policy "purchases_delete_for_writers" on public.purchases
for delete
using (public.can_write_house(house_id));

-- purchases DELETE 시 wines 통계 업데이트 trigger
create or replace function public.after_purchase_delete_update_wine_stats()
returns trigger
language plpgsql
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

drop trigger if exists purchases_delete_update_wine_stats on public.purchases;
create trigger purchases_delete_update_wine_stats
after delete on public.purchases
for each row
execute function public.after_purchase_delete_update_wine_stats();

-- purchases DELETE 권한 부여
grant delete on table public.purchases to authenticated;

commit;

