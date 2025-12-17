begin;

create extension if not exists pgcrypto;

create table if not exists public.houses (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.house_members (
  house_id uuid not null references public.houses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (house_id, user_id)
);

create table if not exists public.house_invites (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  token text not null unique,
  role text not null check (role in ('editor','viewer')),
  expires_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id),
  used_by uuid references auth.users(id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.wines (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,

  producer text not null,
  name text not null,
  vintage int not null,
  country text,
  region text,
  type text,

  stock_qty int not null default 0 check (stock_qty >= 0),
  purchase_qty_total int not null default 0 check (purchase_qty_total >= 0),
  purchase_value_total numeric not null default 0 check (purchase_value_total >= 0),
  avg_purchase_price numeric not null default 0 check (avg_purchase_price >= 0),

  rating int check (rating between 1 and 5),
  comment text,
  tasting_review text,
  label_photo_urls text[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (house_id, producer, name, vintage)
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  wine_id uuid not null references public.wines(id) on delete cascade,

  purchased_at date not null default current_date,
  store text not null,
  unit_price numeric not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  receipt_photo_url text,

  created_at timestamptz not null default now()
);

create index if not exists wines_house_id_idx on public.wines (house_id);
create index if not exists purchases_house_id_idx on public.purchases (house_id);
create index if not exists purchases_wine_id_purchased_at_idx on public.purchases (wine_id, purchased_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists wines_set_updated_at on public.wines;
create trigger wines_set_updated_at
before update on public.wines
for each row
execute function public.set_updated_at();

create or replace function public.after_house_insert_add_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.house_members (house_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (house_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists houses_add_owner_member on public.houses;
create trigger houses_add_owner_member
after insert on public.houses
for each row
execute function public.after_house_insert_add_owner();

create or replace function public.before_purchase_validate_house()
returns trigger
language plpgsql
as $$
declare
  v_house_id uuid;
begin
  select w.house_id into v_house_id
  from public.wines w
  where w.id = new.wine_id;

  if v_house_id is null then
    raise exception 'Wine not found';
  end if;

  if new.house_id <> v_house_id then
    raise exception 'house_id does not match wine.house_id';
  end if;

  return new;
end;
$$;

drop trigger if exists purchases_validate_house on public.purchases;
create trigger purchases_validate_house
before insert on public.purchases
for each row
execute function public.before_purchase_validate_house();

create or replace function public.after_purchase_update_wine_stats()
returns trigger
language plpgsql
as $$
begin
  update public.wines
  set
    stock_qty = stock_qty + new.quantity,
    purchase_qty_total = purchase_qty_total + new.quantity,
    purchase_value_total = purchase_value_total + (new.unit_price * new.quantity),
    avg_purchase_price = case
      when (purchase_qty_total + new.quantity) > 0
        then (purchase_value_total + (new.unit_price * new.quantity)) / (purchase_qty_total + new.quantity)
      else 0
    end,
    updated_at = now()
  where id = new.wine_id;

  return new;
end;
$$;

drop trigger if exists purchases_update_wine_stats on public.purchases;
create trigger purchases_update_wine_stats
after insert on public.purchases
for each row
execute function public.after_purchase_update_wine_stats();

commit;
