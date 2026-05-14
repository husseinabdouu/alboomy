-- ================================================================
-- Panini 2026 Tracker — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ================================================================

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  created_at timestamptz default now()
);

-- Collections table
create table if not exists collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  sticker_id text not null,
  collected_at timestamptz default now(),
  unique(user_id, sticker_id)
);

-- Friendships table
create table if not exists friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references profiles(id) on delete cascade not null,
  addressee_id uuid references profiles(id) on delete cascade not null,
  status text check(status in ('pending', 'accepted')) default 'pending',
  created_at timestamptz default now(),
  unique(requester_id, addressee_id),
  constraint no_self_friendship check(requester_id != addressee_id)
);

-- ================================================================
-- Row Level Security
-- ================================================================

alter table profiles enable row level security;
alter table collections enable row level security;
alter table friendships enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_owner_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_owner_update" on profiles for update using (auth.uid() = id);

-- Collections: anyone can read (for friend profiles), only owner can write
create policy "collections_public_read" on collections for select using (true);
create policy "collections_owner_insert" on collections for insert with check (auth.uid() = user_id);
create policy "collections_owner_delete" on collections for delete using (auth.uid() = user_id);

-- Friendships: users see their own, manage their own
create policy "friendships_read" on friendships for select using (
  auth.uid() = requester_id or auth.uid() = addressee_id
);
create policy "friendships_insert" on friendships for insert with check (
  auth.uid() = requester_id
);
create policy "friendships_update" on friendships for update using (
  auth.uid() = addressee_id
);
create policy "friendships_delete" on friendships for delete using (
  auth.uid() = requester_id or auth.uid() = addressee_id
);

-- ================================================================
-- Leaderboard View
-- ================================================================

create or replace view leaderboard_view as
select
  p.id,
  p.username,
  p.display_name,
  count(c.sticker_id)::int as total_collected,
  round((count(c.sticker_id)::numeric / 992) * 100, 1) as completion_pct
from profiles p
left join collections c on c.user_id = p.id
group by p.id, p.username, p.display_name
order by total_collected desc;

-- ================================================================
-- Auto-create profile on signup trigger
-- ================================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ================================================================
-- Index for performance
-- ================================================================

create index if not exists idx_collections_user_id on collections(user_id);
create index if not exists idx_friendships_requester on friendships(requester_id);
create index if not exists idx_friendships_addressee on friendships(addressee_id);
create index if not exists idx_profiles_username on profiles(username);
