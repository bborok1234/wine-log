begin;

-- Supabase linter: auth_rls_initplan
-- Wrap auth.<function>() calls with (select ...) so they are evaluated once per statement,
-- not once per row.

-- houses
drop policy if exists "houses_select_for_members" on public.houses;
create policy "houses_select_for_members" on public.houses
for select
using (public.is_house_member(id) or created_by = (select auth.uid()));

drop policy if exists "houses_insert_for_authenticated" on public.houses;
create policy "houses_insert_for_authenticated" on public.houses
for insert
with check (
  (select auth.uid()) is not null
  and (created_by is null or created_by = (select auth.uid()))
);

-- house_members
drop policy if exists "house_members_insert_owner_on_create" on public.house_members;
create policy "house_members_insert_owner_on_create" on public.house_members
for insert
with check (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
  and role = 'owner'
  and exists (
    select 1
    from public.houses h
    where h.id = house_id
      and h.created_by = (select auth.uid())
  )
);

-- house_invites
drop policy if exists "house_invites_insert_by_owner" on public.house_invites;
create policy "house_invites_insert_by_owner" on public.house_invites
for insert
with check (
  public.is_house_owner(house_id)
  and (created_by is null or created_by = (select auth.uid()))
);

-- profiles
drop policy if exists "profiles_select_self_or_shared_house" on public.profiles;
create policy "profiles_select_self_or_shared_house" on public.profiles
for select
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.house_members hm_target
    where hm_target.user_id = profiles.id
      and exists (
        select 1
        from public.house_members hm_me
        where hm_me.user_id = (select auth.uid())
          and hm_me.house_id = hm_target.house_id
      )
  )
);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
for insert
with check (id = (select auth.uid()));

commit;
