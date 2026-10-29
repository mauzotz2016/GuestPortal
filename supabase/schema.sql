-- Endesha SQL hii yote kwenye Supabase > SQL Editor
create type role_t as enum ('admin','user');

create table branches (name text primary key);
insert into branches values ('Indira Gandhi'),('Chikongola'),('Makunganya');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role role_t not null default 'user',
  branch text references branches(name),
  constraint user_needs_branch check (role = 'admin' or branch is not null)
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  registered_at timestamptz not null default clock_timestamp() unique, -- tarehe/muda wa usajili haujirudii
  full_name text not null,
  country text not null,
  check_in date not null,
  check_out date not null,
  branch text not null references branches(name),
  user_id uuid not null references profiles(id),
  user_name text not null,
  constraint dates_ok check (check_out >= check_in)
);
create index guests_branch_time on guests (branch, registered_at desc);

create function is_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;
create function my_branch() returns text language sql stable security definer set search_path = public
as $$ select branch from profiles where id = auth.uid() $$;

alter table branches enable row level security;
alter table profiles enable row level security;
alter table guests   enable row level security;

create policy "branches read" on branches for select to authenticated using (true);
create policy "profile read"  on profiles for select to authenticated using (id = auth.uid() or is_admin());
create policy "guests read"   on guests   for select to authenticated using (is_admin() or branch = my_branch());
create policy "guests insert" on guests   for insert to authenticated
  with check (branch = my_branch() and user_id = auth.uid());
-- Hakuna policy ya update/delete: rekodi haziwezi kubadilishwa wala kufutwa kupitia app.

-- ADMIN WA KWANZA: tengeneza user kwenye Authentication > Users, kisha endesha (badilisha UUID na email):
-- insert into profiles (id, full_name, role) select id, 'Admin', 'admin' from auth.users where email = 'admin@tiffanydiamondhotels.com';
