-- ============================================================================
-- GolfGive — Supabase Postgres schema (SystemDesign §05)
--
-- SINGLE SOURCE OF TRUTH. All schema + past migrations are consolidated here.
-- This file is idempotent (safe to re-run): enums, tables, columns, indexes,
-- constraints, triggers and RLS policies all guard against "already exists".
-- Apply it (and create storage buckets) with `npm run db:push` — needs
-- SUPABASE_ACCESS_TOKEN — or by pasting this file into the Supabase SQL editor.
-- ============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin create type user_role as enum ('public', 'subscriber', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type sub_status as enum ('active', 'cancelled', 'lapsed', 'pending'); exception when duplicate_object then null; end $$;
do $$ begin create type draw_logic as enum ('random', 'algorithmic'); exception when duplicate_object then null; end $$;
do $$ begin create type draw_status as enum ('draft', 'simulated', 'published'); exception when duplicate_object then null; end $$;
do $$ begin create type winner_status as enum ('pending', 'approved', 'rejected', 'paid'); exception when duplicate_object then null; end $$;

-- ── Profiles (1:1 with auth.users) ───────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text not null,
  role user_role not null default 'subscriber',
  charity_id uuid,
  charity_pct int not null default 10 check (charity_pct between 10 and 100),
  lucky_numbers int[] not null default '{}',
  avatar_url text,
  payout_upi text,
  payout_account_name text,
  payout_account_number text,
  payout_ifsc text,
  created_at timestamptz not null default now()
);
-- Columns added over time (safe on existing installs).
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists payout_upi text;
alter table profiles add column if not exists payout_account_name text;
alter table profiles add column if not exists payout_account_number text;
alter table profiles add column if not exists payout_ifsc text;

-- ── Charities ────────────────────────────────────────────────────────────────
create table if not exists charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  mission text not null,
  image_url text,
  media_urls text[] not null default '{}',
  is_featured boolean not null default false,
  raised numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references charities on delete cascade,
  title text not null,
  date date not null,
  location text not null
);

do $$ begin
  alter table profiles add constraint profiles_charity_fk
    foreign key (charity_id) references charities on delete set null;
exception when duplicate_object then null; end $$;

-- ── Subscriptions ────────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  status sub_status not null default 'pending',
  razorpay_subscription_id text,
  razorpay_customer_id text,
  razorpay_payment_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists subscriptions_user_status_idx on subscriptions (user_id, status);

-- ── Scores: 1 per date, Stableford range at DB level, rolling-5 via trigger ───
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  value int not null check (value between 1 and 45),
  played_on date not null,
  created_at timestamptz not null default now(),
  unique (user_id, played_on)
);
create index if not exists scores_user_played_idx on scores (user_id, played_on desc);

create or replace function trim_scores() returns trigger as $$
begin
  delete from scores
  where id in (
    select id from scores
    where user_id = new.user_id
    order by played_on desc
    offset 5
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_trim_scores on scores;
create trigger trg_trim_scores
after insert on scores
for each row execute function trim_scores();

-- ── Draws & prizes ────────────────────────────────────────────────────────────
create table if not exists draws (
  id uuid primary key default gen_random_uuid(),
  period text not null unique,                  -- 'YYYY-MM'
  logic draw_logic not null default 'random',
  status draw_status not null default 'draft',
  winning_numbers int[] not null default '{}',
  pool_total numeric not null default 0,
  jackpot_carry numeric not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists prize_pools (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draws on delete cascade,
  tier text not null,
  share_pct int not null,
  amount numeric not null,
  rollover boolean not null default false
);

create table if not exists winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draws on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  tier text not null,
  matched_count int not null,
  amount numeric not null,
  proof_url text,
  status winner_status not null default 'pending',
  verified_by uuid references profiles,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists winners_draw_status_idx on winners (draw_id, status);

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  charity_id uuid not null references charities on delete cascade,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  hashed_key text unique not null,
  label text not null,
  scopes text[] not null default '{}',
  last_used timestamptz,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles       enable row level security;
alter table subscriptions  enable row level security;
alter table scores         enable row level security;
alter table winners        enable row level security;
alter table donations      enable row level security;
alter table charities      enable row level security;
alter table charity_events enable row level security;
alter table draws          enable row level security;
alter table prize_pools    enable row level security;
alter table api_keys       enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Owners see their own rows; admins see everything.
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (id = auth.uid() or is_admin());

drop policy if exists "own subs" on subscriptions;
create policy "own subs" on subscriptions for all using (user_id = auth.uid() or is_admin());
drop policy if exists "own scores" on scores;
create policy "own scores" on scores for all using (user_id = auth.uid() or is_admin());
drop policy if exists "own winnings" on winners;
create policy "own winnings" on winners for select using (user_id = auth.uid() or is_admin());
drop policy if exists "admin winners" on winners;
create policy "admin winners" on winners for all using (is_admin());
drop policy if exists "own donations" on donations;
create policy "own donations" on donations for all using (user_id = auth.uid() or is_admin());

-- Charities are public to read, admin to write.
drop policy if exists "charities read" on charities;
create policy "charities read" on charities for select using (true);
drop policy if exists "charities write" on charities;
create policy "charities write" on charities for all using (is_admin());

-- Public-readable reference data; writes restricted to admins.
drop policy if exists "events read" on charity_events;
create policy "events read" on charity_events for select using (true);
drop policy if exists "events write" on charity_events;
create policy "events write" on charity_events for all using (is_admin());

drop policy if exists "draws read" on draws;
create policy "draws read" on draws for select using (true);
drop policy if exists "draws write" on draws;
create policy "draws write" on draws for all using (is_admin());

drop policy if exists "pools read" on prize_pools;
create policy "pools read" on prize_pools for select using (true);
drop policy if exists "pools write" on prize_pools;
create policy "pools write" on prize_pools for all using (is_admin());

-- api_keys: no anon/authenticated access — admins (and service role) only.
drop policy if exists "api_keys admin" on api_keys;
create policy "api_keys admin" on api_keys for all using (is_admin());

-- ============================================================================
-- Grants
--
-- Supabase's dashboard SQL editor auto-grants the API roles, but the Management
-- API / psql connection used by `npm run db:push` does NOT — without these the
-- REST/JS client fails with "permission denied for table ...". RLS above still
-- governs row visibility for anon/authenticated; service_role bypasses RLS for
-- trusted server-side access.
-- ============================================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- Tell PostgREST to reload its schema cache so new tables/grants are picked up.
notify pgrst, 'reload schema';
