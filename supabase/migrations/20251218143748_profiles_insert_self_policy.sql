begin;

-- profiles 테이블은 RLS가 켜져 있으므로, self row 생성(insert)을 허용하는 정책이 필요합니다.
-- (마이그레이션 이전 가입자들은 profiles row가 없어 update가 0 rows가 되는 문제가 발생)
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
for insert
with check (id = auth.uid());

commit;

