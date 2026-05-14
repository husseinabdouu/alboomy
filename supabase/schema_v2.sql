-- ================================================================
-- Alboomy v2 Schema — Run this in Supabase SQL Editor
-- (The original schema.sql must already be run first)
-- ================================================================

-- Groups
create table if not exists groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  invite_code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Group members
create table if not exists group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check(role in ('admin', 'member')) default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Duplicates (spare stickers for trading)
create table if not exists duplicates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  sticker_id text not null,
  quantity int default 1 check(quantity > 0),
  updated_at timestamptz default now(),
  unique(user_id, sticker_id)
);

-- Swap requests
create table if not exists swap_requests (
  id uuid default gen_random_uuid() primary key,
  from_user uuid references profiles(id) on delete cascade not null,
  to_user uuid references profiles(id) on delete cascade not null,
  offered_sticker text not null,
  requested_sticker text not null,
  message text,
  status text check(status in ('pending', 'accepted', 'declined', 'cancelled')) default 'pending',
  created_at timestamptz default now(),
  constraint no_self_swap check(from_user != to_user)
);

-- ================================================================
-- Row Level Security
-- ================================================================

alter table groups enable row level security;
alter table group_members enable row level security;
alter table duplicates enable row level security;
alter table swap_requests enable row level security;

-- Groups: public read (needed for join-by-code), owner manages
create policy "groups_public_read" on groups for select using (true);
create policy "groups_insert" on groups for insert with check (auth.uid() = created_by);
create policy "groups_update" on groups for update using (auth.uid() = created_by);
create policy "groups_delete" on groups for delete using (auth.uid() = created_by);

-- Group members: public read, self-manage
create policy "group_members_read" on group_members for select using (true);
create policy "group_members_insert" on group_members for insert with check (auth.uid() = user_id);
create policy "group_members_delete" on group_members for delete using (
  auth.uid() = user_id or
  auth.uid() in (select created_by from groups where id = group_id)
);

-- Duplicates: public read (for swap matching), owner writes
create policy "duplicates_public_read" on duplicates for select using (true);
create policy "duplicates_owner_insert" on duplicates for insert with check (auth.uid() = user_id);
create policy "duplicates_owner_update" on duplicates for update using (auth.uid() = user_id);
create policy "duplicates_owner_delete" on duplicates for delete using (auth.uid() = user_id);

-- Swap requests: parties see their own
create policy "swaps_read" on swap_requests for select using (
  auth.uid() = from_user or auth.uid() = to_user
);
create policy "swaps_insert" on swap_requests for insert with check (auth.uid() = from_user);
create policy "swaps_update" on swap_requests for update using (
  auth.uid() = to_user or auth.uid() = from_user
);
create policy "swaps_delete" on swap_requests for delete using (auth.uid() = from_user);

-- ================================================================
-- Indexes
-- ================================================================

create index if not exists idx_group_members_group on group_members(group_id);
create index if not exists idx_group_members_user on group_members(user_id);
create index if not exists idx_duplicates_user on duplicates(user_id);
create index if not exists idx_swaps_from on swap_requests(from_user);
create index if not exists idx_swaps_to on swap_requests(to_user);
create index if not exists idx_groups_invite_code on groups(invite_code);

-- ================================================================
-- Update leaderboard view to include group support
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
