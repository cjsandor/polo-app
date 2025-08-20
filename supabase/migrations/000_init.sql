-- =========================================================
-- Polo App -  Initial Schema (Idempotent)
-- =========================================================
-- Safe to run multiple times (uses IF NOT EXISTS and guarded DO blocks)
-- Target: Supabase (PostgreSQL 15+)
-- =========================================================

-- ---------- Extensions ----------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- fuzzy search indexes
create extension if not exists citext;     -- case-insensitive text

-- ---------- Enums ----------
do $$ begin
  create type public.match_status as enum (
    'scheduled','live','completed','cancelled','postponed','abandoned'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_type as enum (
    'goal','own_goal','penalty_goal','foul','substitution',
    'knock_in','throw_in','timeout','injury',
    'chukker_start','chukker_end','yellow_card','red_card'
  );
exception when duplicate_object then null; end $$;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- (moved function definitions that reference tables to below the table declarations)

-- ---------- Tables ----------
-- Profiles (auth-backed)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin','viewer')),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Helper function: check if a user is an admin (after profiles table exists)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- Fields / venues
create table if not exists public.fields (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  club text,
  location text,
  created_at timestamptz not null default now()
);

-- Teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name citext not null unique,
  logo_url text,
  home_field_id uuid references public.fields(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Players
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team_id uuid references public.teams(id) on delete set null,
  position smallint check (position between 1 and 4),
  handicap smallint check (handicap >= -2 and handicap <= 10),
  jersey_number smallint check (jersey_number >= 0 and jersey_number <= 99),
  photo_url text,
  created_at timestamptz not null default now()
);

-- Tournaments
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  location text,
  created_at timestamptz not null default now()
);

-- Matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  home_team_id uuid not null references public.teams(id),
  away_team_id uuid not null references public.teams(id),
  scheduled_time timestamptz not null,
  status public.match_status not null default 'scheduled',
  field_id uuid references public.fields(id),
  home_score integer not null default 0 check (home_score >= 0),
  away_score integer not null default 0 check (away_score >= 0),
  current_chukker smallint not null default 0 check (current_chukker between 0 and 8),
  total_chukkers smallint not null default 6 check (total_chukkers in (4,6,8)),
  overtime boolean not null default false,
  home_handicap_goals smallint not null default 0,
  away_handicap_goals smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_home_away_diff check (home_team_id <> away_team_id)
);

-- Match lineups (snapshot of starters / positions)
create table if not exists public.match_lineups (
  match_id uuid references public.matches(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  position smallint check (position between 1 and 4),
  starter boolean not null default true,
  primary key (match_id, team_id, player_id)
);

-- Match events (timeline)
create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  event_type public.event_type not null,
  team_id uuid references public.teams(id),
  player_id uuid references public.players(id),
  chukker smallint not null check (chukker between 1 and 8),
  occurred_at timestamptz not null default now(),
  inserted_at timestamptz not null default now(),
  details jsonb,
  sequence bigint,
  created_by uuid references auth.users(id)
);

-- Helper trigger function: assign per-match sequence and default created_by (after match_events table exists)
create or replace function public.assign_event_sequence()
returns trigger
language plpgsql
as $$
declare
  max_seq bigint;
begin
  if new.sequence is null then
    select coalesce(max(sequence), 0) into max_seq
    from public.match_events
    where match_id = new.match_id;
    new.sequence := max_seq + 1;
  end if;

  if new.created_by is null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;

-- Team-scoped roles for club managers/scorekeepers
create table if not exists public.team_admins (
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  role text not null check (role in ('manager','scorekeeper')),
  primary key (user_id, team_id)
);

-- Push notification plumbing
create table if not exists public.push_tokens (
  user_id uuid references auth.users(id) on delete cascade,
  expo_token text primary key,
  platform text check (platform in ('ios','android')),
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, team_id)
);

-- ---------- Constraints & Triggers ----------
-- updated_at on matches
do $$ begin
  drop trigger if exists trg_matches_updated_at on public.matches;
  create trigger trg_matches_updated_at
    before update on public.matches
    for each row execute function public.set_updated_at();
end $$;

-- sequence & created_by defaults on match_events
do $$ begin
  drop trigger if exists trg_match_events_sequence on public.match_events;
  create trigger trg_match_events_sequence
    before insert on public.match_events
    for each row execute function public.assign_event_sequence();
end $$;

-- Ensure (match_id, sequence) order index and uniqueness semantics
create unique index if not exists uq_match_events_sequence
  on public.match_events(match_id, sequence);
create index if not exists idx_match_events_order
  on public.match_events(match_id, sequence);

-- ---------- Indexes ----------
create index if not exists idx_matches_status on public.matches(status);
create index if not exists idx_matches_scheduled_time on public.matches(scheduled_time);
create index if not exists idx_match_events_match_id on public.match_events(match_id);
create index if not exists idx_players_team_id on public.players(team_id);

-- Fuzzy search indexes
create index if not exists idx_players_name_trgm on public.players using gin (name gin_trgm_ops);
create index if not exists idx_teams_name_trgm on public.teams using gin (name gin_trgm_ops);

-- Tournament uniqueness (name + dates, case-insensitive)
do $$ begin
  create unique index uq_tournaments_name_dates
    on public.tournaments (lower(name), start_date, end_date);
exception when duplicate_table then null; end $$;

-- ---------- Row Level Security ----------
alter table public.profiles       enable row level security;
alter table public.fields         enable row level security;
alter table public.teams          enable row level security;
alter table public.players        enable row level security;
alter table public.tournaments    enable row level security;
alter table public.matches        enable row level security;
alter table public.match_lineups  enable row level security;
alter table public.match_events   enable row level security;
alter table public.team_admins    enable row level security;
alter table public.push_tokens    enable row level security;
alter table public.follows        enable row level security;

-- Profiles: user can view/update self; admins can manage all
do $$ begin
  drop policy if exists "User can read own profile" on public.profiles;
  create policy "User can read own profile"
    on public.profiles for select
    using (id = auth.uid());

  drop policy if exists "Admins can read all profiles" on public.profiles;
  create policy "Admins can read all profiles"
    on public.profiles for select
    using (public.is_admin(auth.uid()));

  drop policy if exists "User can upsert own profile" on public.profiles;
  create policy "User can upsert own profile"
    on public.profiles for insert
    with check (id = auth.uid());

  drop policy if exists "User can update own profile" on public.profiles;
  create policy "User can update own profile"
    on public.profiles for update
    using (id = auth.uid())
    with check (id = auth.uid());

  drop policy if exists "Admins manage profiles" on public.profiles;
  create policy "Admins manage profiles"
    on public.profiles for all
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));
end $$;

-- Public read policies
do $$ begin
  -- readable tables
  perform 1;
  drop policy if exists "Public can view fields" on public.fields;
  create policy "Public can view fields" on public.fields for select using (true);

  drop policy if exists "Public can view teams" on public.teams;
  create policy "Public can view teams" on public.teams for select using (true);

  drop policy if exists "Public can view players" on public.players;
  create policy "Public can view players" on public.players for select using (true);

  drop policy if exists "Public can view tournaments" on public.tournaments;
  create policy "Public can view tournaments" on public.tournaments for select using (true);

  drop policy if exists "Public can view matches" on public.matches;
  create policy "Public can view matches" on public.matches for select using (true);

  drop policy if exists "Public can view match_lineups" on public.match_lineups;
  create policy "Public can view match_lineups" on public.match_lineups for select using (true);

  drop policy if exists "Public can view match_events" on public.match_events;
  create policy "Public can view match_events" on public.match_events for select using (true);
end $$;

-- Admin manage policies (CRUD)
do $$ begin
  drop policy if exists "Admins manage fields" on public.fields;
  create policy "Admins manage fields"
    on public.fields for all
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

  drop policy if exists "Admins manage teams" on public.teams;
  create policy "Admins manage teams"
    on public.teams for all
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

  drop policy if exists "Admins manage players" on public.players;
  create policy "Admins manage players"
    on public.players for all
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

  drop policy if exists "Admins manage tournaments" on public.tournaments;
  create policy "Admins manage tournaments"
    on public.tournaments for all
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

  drop policy if exists "Admins manage matches" on public.matches;
  create policy "Admins manage matches"
    on public.matches for all
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

  drop policy if exists "Admins manage match_lineups" on public.match_lineups;
  create policy "Admins manage match_lineups"
    on public.match_lineups for all
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

  drop policy if exists "Admins manage match_events" on public.match_events;
  create policy "Admins manage match_events"
    on public.match_events for all
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));
end $$;

-- Team scorekeepers: insert their team's events
do $$ begin
  drop policy if exists "Team scorekeepers can insert events" on public.match_events;
  create policy "Team scorekeepers can insert events"
    on public.match_events for insert
    with check (
      created_by = auth.uid()
      and team_id in (
        select ta.team_id from public.team_admins ta
        where ta.user_id = auth.uid() and ta.role in ('manager','scorekeeper')
      )
    );

  -- Allow users to manage (update/delete) events they created (optional; admins already can)
  drop policy if exists "Creators can update their events" on public.match_events;
  create policy "Creators can update their events"
    on public.match_events for update
    using (created_by = auth.uid())
    with check (created_by = auth.uid());

  drop policy if exists "Creators can delete their events" on public.match_events;
  create policy "Creators can delete their events"
    on public.match_events for delete
    using (created_by = auth.uid());
end $$;

-- Push tokens & follows (user-scoped writes)
do $$ begin
  drop policy if exists "User upserts own push token" on public.push_tokens;
  create policy "User upserts own push token"
    on public.push_tokens for insert
    with check (user_id = auth.uid());

  drop policy if exists "User reads own push tokens" on public.push_tokens;
  create policy "User reads own push tokens"
    on public.push_tokens for select
    using (user_id = auth.uid());

  drop policy if exists "User deletes own push token" on public.push_tokens;
  create policy "User deletes own push token"
    on public.push_tokens for delete
    using (user_id = auth.uid());

  drop policy if exists "User manages own follows" on public.follows;
  create policy "User manages own follows"
    on public.follows for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
end $$;

-- ---------- Realtime Publication ----------
-- Add tables to supabase_realtime publication (ignore if already added)
do $$ begin
  execute 'alter publication supabase_realtime add table public.matches';
exception when others then
  -- ignore "is already member of publication" errors
  null;
end $$;

do $$ begin
  execute 'alter publication supabase_realtime add table public.match_events';
exception when others then
  null;
end $$;

-- ---------- Additional safe constraints ----------
-- Guarantee teams have case-insensitive unique names (already via citext unique)
-- Tournament unique index was added above

