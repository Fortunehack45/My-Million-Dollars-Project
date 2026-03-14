-- ============================================================
-- ARGUS LAUNCHPAD — Complete Supabase Schema Migration
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- 1. USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  username text,
  social_handle text,
  created_at timestamptz default now()
);

-- 2. COINS
create table if not exists public.coins (
  id uuid primary key default gen_random_uuid(),
  contract_address text unique not null,
  name text not null,
  ticker text not null,
  description text,
  icon_url text,
  total_supply numeric not null default 1000000000,
  circulating_supply numeric,
  liquidity numeric not null default 0,
  creator_wallet text not null,
  creator_allocation numeric default 10,
  commission_rate numeric default 2,
  social_links jsonb default '{}'::jsonb,
  risk_score numeric default 50,
  market_cap numeric default 0,
  volume_24h numeric default 0,
  price_change_24h numeric default 0,
  is_boosted boolean default false,
  boost_expiry timestamptz,
  created_at timestamptz default now()
);

-- 3. TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  tx_hash text unique not null,
  coin_address text references public.coins(contract_address) on delete cascade,
  wallet_address text not null,
  social_handle text,
  type text check (type in ('BUY','SELL')) not null,
  amount numeric not null,
  price numeric not null,
  timestamp timestamptz default now()
);

-- 4. WATCHLISTS
create table if not exists public.watchlists (
  user_wallet text not null,
  coin_address text not null,
  added_at timestamptz default now(),
  primary key (user_wallet, coin_address)
);

-- 5. ALERTS
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_wallet text not null,
  coin_address text not null,
  target_price numeric not null,
  direction text check (direction in ('ABOVE','BELOW')) not null,
  triggered boolean default false,
  created_at timestamptz default now()
);

-- 6. BOOSTS
create table if not exists public.boosts (
  id uuid primary key default gen_random_uuid(),
  coin_address text references public.coins(contract_address) on delete cascade,
  boosted_by text not null,
  amount_paid numeric not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- 7. HOLDERS
create table if not exists public.holders (
  coin_address text not null,
  wallet_address text not null,
  balance numeric not null default 0,
  last_updated timestamptz default now(),
  primary key (coin_address, wallet_address)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Open read, authenticated write
-- ============================================================

alter table public.users enable row level security;
alter table public.coins enable row level security;
alter table public.transactions enable row level security;
alter table public.watchlists enable row level security;
alter table public.alerts enable row level security;
alter table public.boosts enable row level security;
alter table public.holders enable row level security;

-- Allow everyone to read all coin data (public launchpad)
create policy "Public read coins" on public.coins for select using (true);
create policy "Public read transactions" on public.transactions for select using (true);
create policy "Public read holders" on public.holders for select using (true);
create policy "Public read boosts" on public.boosts for select using (true);

-- Allow anon key to insert (our app uses anon key with service logic)
create policy "Allow insert coins" on public.coins for insert with check (true);
create policy "Allow insert transactions" on public.transactions for insert with check (true);
create policy "Allow insert watchlists" on public.watchlists for all using (true);
create policy "Allow insert alerts" on public.alerts for all using (true);
create policy "Allow insert boosts" on public.boosts for insert with check (true);
create policy "Allow upsert holders" on public.holders for all using (true);
create policy "Allow upsert users" on public.users for all using (true);
create policy "Allow read users" on public.users for select using (true);

-- ============================================================
-- REALTIME — Enable live subscriptions for coins + transactions
-- ============================================================
alter publication supabase_realtime add table public.coins;
alter publication supabase_realtime add table public.transactions;

-- ============================================================
-- INDEXES — Performance optimisation
-- ============================================================
create index if not exists idx_transactions_coin on public.transactions(coin_address);
create index if not exists idx_transactions_time on public.transactions(timestamp desc);
create index if not exists idx_holders_coin on public.holders(coin_address);
create index if not exists idx_alerts_user on public.alerts(user_wallet, triggered);
create index if not exists idx_watchlists_user on public.watchlists(user_wallet);
create index if not exists idx_boosts_expires on public.boosts(expires_at);

-- ============================================================
-- DONE! After running this, add your project credentials to .env:
-- VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
-- VITE_SUPABASE_ANON_KEY=<your-anon-key>
-- ============================================================
