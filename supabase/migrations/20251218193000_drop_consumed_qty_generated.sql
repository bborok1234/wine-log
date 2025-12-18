begin;

-- consumed_qty는 현 단계에선 사용하지 않음(ledger 도입 전).
-- 이미 적용된 환경에서도 안전하게 실행되도록 if exists 사용.
drop index if exists public.wines_house_id_consumed_qty_idx;

alter table public.wines
drop column if exists consumed_qty;

commit;

