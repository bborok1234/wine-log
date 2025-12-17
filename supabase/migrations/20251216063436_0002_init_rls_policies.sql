begin;

create or replace function public.is_house_member(p_house_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.house_members hm
    where hm.house_id = p_house_id
      and hm.user_id = auth.uid()
  );
$$;

create or replace function public.can_write_house(p_house_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.house_members hm
    where hm.house_id = p_house_id
      and hm.user_id = auth.uid()
      and hm.role in ('owner','editor')
  );
$$;

create or replace function public.is_house_owner(p_house_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.house_members hm
    where hm.house_id = p_house_id
      and hm.user_id = auth.uid()
      and hm.role = 'owner'
  );
$$;

grant execute on function public.is_house_member(uuid) to anon, authenticated;
grant execute on function public.can_write_house(uuid) to anon, authenticated;
grant execute on function public.is_house_owner(uuid) to anon, authenticated;

alter table public.houses enable row level security;
alter table public.house_members enable row level security;
alter table public.house_invites enable row level security;
alter table public.wines enable row level security;
alter table public.purchases enable row level security;

-- houses
drop policy if exists "houses_select_for_members" on public.houses;
create policy "houses_select_for_members" on public.houses
for select
-- NOTE:
-- 하우스 생성 시 `houses` AFTER INSERT 트리거가 `house_members`에 owner를 추가한다.
-- 그런데 `house_members` INSERT 정책 검증에서 `houses`를 조회하면,
-- "멤버만 houses SELECT 가능" 정책 때문에 순환이 생겨 하우스 생성 자체가 실패할 수 있다.
-- 생성자(created_by)는 멤버 등록 전에도 해당 row를 SELECT 가능하게 해서 순환을 끊는다.
using (public.is_house_member(id) or created_by = auth.uid());

drop policy if exists "houses_insert_for_authenticated" on public.houses;
create policy "houses_insert_for_authenticated" on public.houses
for insert
-- NOTE: PostgREST INSERT에서 created_by 기본값(auth.uid())의 적용/검증 타이밍에 따라
-- WITH CHECK에서 created_by가 NULL로 평가되는 케이스가 있어 이를 허용한다.
-- 테이블 스키마는 created_by NOT NULL 이므로 최종 저장값은 NULL이 될 수 없다.
with check (
  auth.uid() is not null
  and (created_by is null or created_by = auth.uid())
);

-- house_members
drop policy if exists "house_members_select_for_members" on public.house_members;
create policy "house_members_select_for_members" on public.house_members
for select
using (public.is_house_member(house_id));

drop policy if exists "house_members_insert_owner_on_create" on public.house_members;
create policy "house_members_insert_owner_on_create" on public.house_members
for insert
with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and role = 'owner'
  and exists (
    select 1
    from public.houses h
    where h.id = house_id
      and h.created_by = auth.uid()
  )
);

drop policy if exists "house_members_update_by_owner" on public.house_members;
create policy "house_members_update_by_owner" on public.house_members
for update
using (public.is_house_owner(house_id))
with check (public.is_house_owner(house_id));

drop policy if exists "house_members_delete_by_owner" on public.house_members;
create policy "house_members_delete_by_owner" on public.house_members
for delete
using (public.is_house_owner(house_id));

-- house_invites
drop policy if exists "house_invites_select_by_owner" on public.house_invites;
create policy "house_invites_select_by_owner" on public.house_invites
for select
using (public.is_house_owner(house_id));

drop policy if exists "house_invites_insert_by_owner" on public.house_invites;
create policy "house_invites_insert_by_owner" on public.house_invites
for insert
-- created_by 기본값(auth.uid()) 타이밍 이슈 대응(INSERT 시점에 NULL로 평가될 수 있음)
with check (public.is_house_owner(house_id) and (created_by is null or created_by = auth.uid()));

drop policy if exists "house_invites_update_by_owner" on public.house_invites;
create policy "house_invites_update_by_owner" on public.house_invites
for update
using (public.is_house_owner(house_id))
with check (public.is_house_owner(house_id));

drop policy if exists "house_invites_delete_by_owner" on public.house_invites;
create policy "house_invites_delete_by_owner" on public.house_invites
for delete
using (public.is_house_owner(house_id));

-- wines
drop policy if exists "wines_select_for_members" on public.wines;
create policy "wines_select_for_members" on public.wines
for select
using (public.is_house_member(house_id));

drop policy if exists "wines_insert_for_writers" on public.wines;
create policy "wines_insert_for_writers" on public.wines
for insert
with check (public.can_write_house(house_id));

drop policy if exists "wines_update_for_writers" on public.wines;
create policy "wines_update_for_writers" on public.wines
for update
using (public.can_write_house(house_id))
with check (public.can_write_house(house_id));

drop policy if exists "wines_delete_for_writers" on public.wines;
create policy "wines_delete_for_writers" on public.wines
for delete
using (public.can_write_house(house_id));

-- purchases
drop policy if exists "purchases_select_for_members" on public.purchases;
create policy "purchases_select_for_members" on public.purchases
for select
using (public.is_house_member(house_id));

drop policy if exists "purchases_insert_for_writers" on public.purchases;
create policy "purchases_insert_for_writers" on public.purchases
for insert
with check (public.can_write_house(house_id));

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table public.houses to authenticated;
grant select, insert, update, delete on table public.house_members to authenticated;
grant select, insert, update, delete on table public.house_invites to authenticated;
grant select, insert, update, delete on table public.wines to authenticated;
grant select, insert on table public.purchases to authenticated;

commit;
