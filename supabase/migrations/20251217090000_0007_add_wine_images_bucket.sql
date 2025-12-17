begin;

-- 버킷 생성 (없으면 생성)
insert into storage.buckets (id, name, public)
values ('wine-images', 'wine-images', false)
on conflict (id) do nothing;

-- RLS 정책: 인증 사용자 전용 읽기, 업로드/수정/삭제는 소유자만
drop policy if exists "wine-images-select-auth" on storage.objects;
create policy "wine-images-select-auth" on storage.objects
for select
using (bucket_id = 'wine-images' and auth.role() = 'authenticated');

drop policy if exists "wine-images-insert-auth" on storage.objects;
create policy "wine-images-insert-auth" on storage.objects
for insert
with check (bucket_id = 'wine-images' and auth.role() = 'authenticated');

drop policy if exists "wine-images-update-owner" on storage.objects;
create policy "wine-images-update-owner" on storage.objects
for update
using (bucket_id = 'wine-images' and owner = auth.uid());

drop policy if exists "wine-images-delete-owner" on storage.objects;
create policy "wine-images-delete-owner" on storage.objects
for delete
using (bucket_id = 'wine-images' and owner = auth.uid());

commit;

