begin;

-- profiles: 기본 사용자 정보(닉네임/이메일/가입일)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nickname text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신(기존 공용 트리거 함수 재사용)
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- 신규 가입 시 profiles 자동 생성 (auth.users trigger)
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, joined_at)
  values (new.id, new.email, coalesce(new.created_at, now()))
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- 이메일 변경 반영
create or replace function public.handle_auth_user_updated_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated_profile on auth.users;
create trigger on_auth_user_updated_profile
after update of email on auth.users
for each row execute function public.handle_auth_user_updated_profile();

alter table public.profiles enable row level security;

-- 본인 프로필은 항상 조회 가능, 같은 하우스 멤버끼리는 서로 조회 가능
drop policy if exists "profiles_select_self_or_shared_house" on public.profiles;
create policy "profiles_select_self_or_shared_house" on public.profiles
for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.house_members hm_target
    where hm_target.user_id = profiles.id
      and exists (
        select 1
        from public.house_members hm_me
        where hm_me.user_id = auth.uid()
          and hm_me.house_id = hm_target.house_id
      )
  )
);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

grant select, insert, update, delete on table public.profiles to authenticated;

commit;

