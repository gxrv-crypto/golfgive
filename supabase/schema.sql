-- ============================================================================
-- GolfGive — Supabase Postgres schema (SystemDesign §05)
-- Run in the Supabase SQL editor of a NEW project. RLS enabled everywhere.
-- The in-memory repository mirrors this shape, so swapping to Supabase is a
-- drop-in change behind getRepos().
-- ============================================================================

create type user_role as enum ('public', 'subscriber', 'admin');
create type sub_status as enum ('active', 'cancelled', 'lapsed', 'pending');
create type draw_logic as enum ('random', 'algorithmic');
create type draw_status as enum ('draft', 'simulated', 'published');
create type winner_status as enum ('pending', 'approved', 'rejected', 'paid');

-- Profiles (1:1 with auth.users) -------------------------------------------------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  name text not null,
  role user_role not null default 'subscriber',
  charity_id uuid,
  charity_pct int not null default 10 check (charity_pct between 10 and 100),
  lucky_numbers int[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Charities ---------------------------------------------------------------------
create table charities (
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

create table charity_events (
  id uuid primary key default gen_random_uuid(),
  charity_id uuid not null references charities on delete cascade,
  title text not null,
  date date not null,
  location text not null
);

alter table profiles
  add constraint profiles_charity_fk
  foreign key (charity_id) references charities on delete set null;

-- Subscriptions -----------------------------------------------------------------
create table subscriptions (
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
create index on subscriptions (user_id, status);

-- Scores: 1 per date, Stableford range enforced at DB level ---------------------
create table scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  value int not null check (value between 1 and 45),
  played_on date not null,
  created_at timestamptz not null default now(),
  unique (user_id, played_on)
);
create index on scores (user_id, played_on desc);

-- Rolling last-5: trim oldest beyond 5 on insert -------------------------------
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

create trigger trg_trim_scores
after insert on scores
for each row execute function trim_scores();

-- Draws & prizes ----------------------------------------------------------------
create table draws (
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

create table prize_pools (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draws on delete cascade,
  tier text not null,
  share_pct int not null,
  amount numeric not null,
  rollover boolean not null default false
);

create table winners (
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
create index on winners (draw_id, status);

create table donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  charity_id uuid not null references charities on delete cascade,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table api_keys (
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
alter table profiles      enable row level security;
alter table subscriptions enable row level security;
alter table scores        enable row level security;
alter table winners       enable row level security;
alter table donations     enable row level security;
alter table charities     enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Owners see their own rows; admins see everything.
create policy "own profile"        on profiles      for select using (id = auth.uid() or is_admin());
create policy "update own profile" on profiles      for update using (id = auth.uid() or is_admin());

create policy "own subs"           on subscriptions for all    using (user_id = auth.uid() or is_admin());
create policy "own scores"         on scores        for all    using (user_id = auth.uid() or is_admin());
create policy "own winnings"       on winners       for select using (user_id = auth.uid() or is_admin());
create policy "admin winners"      on winners       for all    using (is_admin());
create policy "own donations"      on donations     for all    using (user_id = auth.uid() or is_admin());

-- Charities are public to read, admin to write.
create policy "charities read"     on charities     for select using (true);
create policy "charities write"    on charities     for all    using (is_admin());
