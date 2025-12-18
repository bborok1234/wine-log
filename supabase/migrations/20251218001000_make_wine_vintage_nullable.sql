begin;

-- NV(Non-Vintage) 지원: vintage를 nullable로 변경
alter table public.wines
  alter column vintage drop not null;

-- 기존 unique(house_id, producer, name, vintage) 제약은 NULL vintage에서 중복을 허용하므로 교체
alter table public.wines
  drop constraint if exists wines_house_id_producer_name_vintage_key;

-- NULL vintage도 동일 와인으로 간주되도록 coalesce(vintage, -1) 기반 unique index 추가
create unique index if not exists wines_unique_house_producer_name_vintage_idx
  on public.wines (house_id, producer, name, coalesce(vintage, -1));

commit;

