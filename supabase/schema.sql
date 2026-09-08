-- NutriMart AI - Supabase Auth + phân quyền
-- Chạy toàn bộ file này một lần trong Supabase Dashboard > SQL Editor.

do $$
begin
  create type public.nm_role as enum ('admin', 'staff', 'customer');
exception
  when duplicate_object then null;
end $$;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  name text not null default 'Người dùng',
  phone text not null default '',
  address text not null default '',
  role public.nm_role not null default 'customer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9._-]{4,24}$'),
  constraint profiles_name_length check (char_length(name) between 2 and 80),
  constraint profiles_phone_length check (char_length(phone) <= 30),
  constraint profiles_address_length check (char_length(address) <= 300)
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_email_idx on public.profiles(lower(email));
create unique index if not exists profiles_username_lower_uidx on public.profiles(lower(username));

create or replace function private.handle_new_nutrimart_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_username text;
begin
  generated_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'user'),
    '[^a-zA-Z0-9._-]', '', 'g'
  ));
  if length(generated_username) < 4 then
    generated_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  generated_username := left(generated_username, 24);
  if exists(select 1 from public.profiles where lower(username) = generated_username) then
    generated_username := left(generated_username, 18) || '_' || substr(new.id::text, 1, 5);
  end if;

  insert into public.profiles(id,email,username,name,phone,role,active)
  values(
    new.id,
    coalesce(new.email,''),
    generated_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'name',''),'Người dùng'),
    coalesce(new.raw_user_meta_data ->> 'phone',''),
    'customer',
    true
  )
  on conflict(id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_nutrimart_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_nutrimart on auth.users;
create trigger on_auth_user_created_nutrimart
  after insert on auth.users
  for each row execute procedure private.handle_new_nutrimart_user();

-- Bổ sung hồ sơ cho tài khoản đã tồn tại trước khi cài schema.
insert into public.profiles(id,email,username,name,phone,role,active)
select
  users.id,
  coalesce(users.email,''),
  'user_' || substr(users.id::text,1,8),
  coalesce(nullif(users.raw_user_meta_data ->> 'name',''),'Người dùng'),
  coalesce(users.raw_user_meta_data ->> 'phone',''),
  'customer',
  true
from auth.users as users
where not exists(select 1 from public.profiles where id = users.id)
on conflict(id) do nothing;

create or replace function private.set_nutrimart_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_nutrimart_profile_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure private.set_nutrimart_profile_updated_at();

create or replace function private.nm_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and active = true
  );
$$;

revoke all on function private.nm_is_admin() from public, anon;
grant execute on function private.nm_is_admin() to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) or (select private.nm_is_admin()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()) and active = true)
with check (id = (select auth.uid()) and active = true);

revoke all on table public.profiles from anon, authenticated;
revoke all on type public.nm_role from anon, authenticated;
grant usage on type public.nm_role to authenticated;
grant select on table public.profiles to authenticated;
grant update(name,username,phone,address) on table public.profiles to authenticated;

create or replace function public.admin_update_profile(
  target_id uuid,
  target_role text,
  target_active boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.nm_is_admin() then
    raise exception 'Bạn không có quyền quản trị tài khoản' using errcode = '42501';
  end if;
  if target_role not in ('admin','staff','customer') then
    raise exception 'Vai trò không hợp lệ' using errcode = '22023';
  end if;
  if target_id = (select auth.uid()) and (target_role <> 'admin' or target_active = false) then
    raise exception 'Không thể tự hạ quyền hoặc khóa tài khoản đang đăng nhập' using errcode = '42501';
  end if;

  update public.profiles
  set role = target_role::public.nm_role,
      active = target_active
  where id = target_id;

  if not found then
    raise exception 'Không tìm thấy tài khoản' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_update_profile(uuid,text,boolean) from public;
grant execute on function public.admin_update_profile(uuid,text,boolean) to authenticated;

-- Xóa bản hàm public cũ nếu schema được nâng cấp từ phiên bản trước.
drop function if exists public.nm_is_admin();
drop function if exists public.handle_new_nutrimart_user();
drop function if exists public.set_nutrimart_profile_updated_at();

-- SAU KHI đăng ký tài khoản đầu tiên và xác nhận email, bỏ dấu -- rồi thay email:
-- update public.profiles set role = 'admin' where email = 'email-cua-ban@example.com';
