begin;

-- Supabase linter: unindexed_foreign_keys
-- Add covering indexes for FK columns to avoid slow joins/deletes at scale.

-- public.houses(created_by) -> auth.users(id)
create index if not exists houses_created_by_idx
on public.houses (created_by);

-- public.house_members(user_id) -> auth.users(id)
-- Primary key is (house_id, user_id); add user_id-leading index for lookups by user.
create index if not exists house_members_user_id_house_id_idx
on public.house_members (user_id, house_id);

-- public.house_invites(house_id) -> public.houses(id)
-- Common access pattern is listing invites by house.
create index if not exists house_invites_house_id_created_at_idx
on public.house_invites (house_id, created_at desc);

-- public.house_invites(created_by) -> auth.users(id)
create index if not exists house_invites_created_by_idx
on public.house_invites (created_by);

-- public.house_invites(used_by) -> auth.users(id)
create index if not exists house_invites_used_by_idx
on public.house_invites (used_by);

commit;
