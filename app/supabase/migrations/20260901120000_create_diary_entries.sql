create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  content text not null default '',
  tags text[] not null default '{}',
  mood text,
  prompt text,
  template text,
  user_id text not null default 'default-user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint diary_entries_user_date_unique unique (user_id, entry_date)
);

create index if not exists diary_entries_user_date_idx
  on public.diary_entries (user_id, entry_date);

alter table public.diary_entries add column if not exists tags text[] not null default '{}';
alter table public.diary_entries add column if not exists mood text;
alter table public.diary_entries add column if not exists prompt text;
alter table public.diary_entries add column if not exists template text;

alter table public.diary_entries enable row level security;

drop policy if exists anon_select_diary_entries on public.diary_entries;
drop policy if exists anon_insert_diary_entries on public.diary_entries;
drop policy if exists anon_update_diary_entries on public.diary_entries;
drop policy if exists anon_delete_diary_entries on public.diary_entries;

create policy anon_select_diary_entries
  on public.diary_entries for select to anon, authenticated
  using (true);

create policy anon_insert_diary_entries
  on public.diary_entries for insert to anon, authenticated
  with check (true);

create policy anon_update_diary_entries
  on public.diary_entries for update to anon, authenticated
  using (true)
  with check (true);

create policy anon_delete_diary_entries
  on public.diary_entries for delete to anon, authenticated
  using (true);

grant select, insert, update, delete on table public.diary_entries to anon, authenticated;

create table if not exists public.diary_entry_versions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.diary_entries(id) on delete cascade,
  entry_date date not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists diary_entry_versions_entry_date_idx
  on public.diary_entry_versions (entry_date, created_at desc);

alter table public.diary_entry_versions enable row level security;
drop policy if exists anon_select_diary_entry_versions on public.diary_entry_versions;
drop policy if exists anon_insert_diary_entry_versions on public.diary_entry_versions;
drop policy if exists anon_delete_diary_entry_versions on public.diary_entry_versions;
create policy anon_select_diary_entry_versions on public.diary_entry_versions
  for select to anon, authenticated using (true);
create policy anon_insert_diary_entry_versions on public.diary_entry_versions
  for insert to anon, authenticated with check (true);
create policy anon_delete_diary_entry_versions on public.diary_entry_versions
  for delete to anon, authenticated using (true);
grant select, insert, delete on table public.diary_entry_versions to anon, authenticated;
