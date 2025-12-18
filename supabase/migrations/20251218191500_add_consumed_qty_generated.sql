begin;

alter table public.wines
add column if not exists consumed_qty int
generated always as (greatest(purchase_qty_total - stock_qty, 0)) stored;

create index if not exists wines_house_id_consumed_qty_idx
on public.wines (house_id, consumed_qty);

commit;
