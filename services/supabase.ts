/**
 * Argus Launchpad — Supabase Service Layer
 * All off-chain data: coins, transactions, watchlists, alerts, boosts, holders
 *
 * NOTE: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
 */
import { createClient } from '@supabase/supabase-js';
import type { LaunchpadCoin, LaunchpadTrade, PriceAlert, WatchlistEntry, CoinBoost } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

// Prevent app crash on invalid URL formatting if user enters wrong ENV vars on host
let validUrl = SUPABASE_URL;
try {
  new URL(SUPABASE_URL);
} catch (e) {
  validUrl = 'https://placeholder.supabase.co';
}

export const supabase = createClient(validUrl, SUPABASE_ANON_KEY);

// ─── COIN HELPERS ───────────────────────────────────────────────────────────

/** Map a raw DB row to our LaunchpadCoin model */
function mapCoin(row: any): LaunchpadCoin {
  return {
    address: row.contract_address,
    name: row.name,
    ticker: row.ticker,
    description: row.description,
    iconUrl: row.icon_url || '',
    totalSupply: Number(row.total_supply),
    circulatingSupply: Number(row.circulating_supply || row.total_supply),
    liquidity: Number(row.liquidity),
    creatorWallet: row.creator_wallet,
    commissionRate: Number(row.commission_rate || 2),
    socials: row.social_links || {},
    riskScore: Number(row.risk_score || 50),
    volume24h: Number(row.volume_24h || 0),
    priceChange24h: Number(row.price_change_24h || 0),
    marketCap: Number(row.market_cap || 0),
    isBoosted: row.is_boosted || false,
    boostExpiry: row.boost_expiry ? Number(row.boost_expiry) : undefined,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/** Compute a risk score (0-100) from coin data */
export function computeRiskScore(coin: Partial<LaunchpadCoin>): number {
  let score = 100;
  // Lower liquidity = higher risk
  if ((coin.liquidity || 0) < 100) score -= 30;
  else if ((coin.liquidity || 0) < 1000) score -= 15;
  // Young coin = higher risk
  const ageHours = (Date.now() - (coin.createdAt || Date.now())) / 3_600_000;
  if (ageHours < 1) score -= 25;
  else if (ageHours < 24) score -= 10;
  return Math.max(0, Math.min(100, score));
}

// ─── COINS ──────────────────────────────────────────────────────────────────

export const fetchCoins = async (): Promise<LaunchpadCoin[]> => {
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchCoins:', error); return []; }
  return (data || []).map(mapCoin);
};

export const fetchCoin = async (address: string): Promise<LaunchpadCoin | null> => {
  const { data, error } = await supabase
    .from('coins')
    .select('*')
    .eq('contract_address', address)
    .single();
  if (error) { console.error('fetchCoin:', error); return null; }
  return data ? mapCoin(data) : null;
};

export const createCoin = async (payload: {
  contract_address: string;
  name: string;
  ticker: string;
  description: string;
  icon_url: string;
  total_supply: number;
  liquidity: number;
  creator_wallet: string;
  creator_allocation: number;
  commission_rate: number;
  social_links: { twitter?: string; telegram?: string; discord?: string };
}): Promise<LaunchpadCoin | null> => {
  const risk_score = computeRiskScore({ liquidity: payload.liquidity, createdAt: Date.now() });
  const { data, error } = await supabase
    .from('coins')
    .insert([{ ...payload, risk_score, volume_24h: 0, price_change_24h: 0, market_cap: 0, is_boosted: false }])
    .select()
    .single();
  if (error) { console.error('createCoin:', error); return null; }
  return data ? mapCoin(data) : null;
};

export const subscribeToCoin = (address: string, callback: (coin: LaunchpadCoin) => void) => {
  const channel = supabase
    .channel(`coin_${address}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'coins', filter: `contract_address=eq.${address}` }, payload => {
      if (payload.new) callback(mapCoin(payload.new));
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
};

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

export const recordTransaction = async (tx: Omit<LaunchpadTrade, 'id'>): Promise<boolean> => {
  const { error } = await supabase.from('transactions').insert([{
    tx_hash: tx.txHash,
    coin_address: tx.coinAddress,
    wallet_address: tx.walletAddress,
    type: tx.type,
    amount: tx.amount,
    price: tx.price,
    timestamp: new Date(tx.timestamp).toISOString(),
    social_handle: tx.socialHandle || null,
  }]);
  if (error) { console.error('recordTransaction:', error); return false; }
  return true;
};

export const fetchTransactions = async (coinAddress: string, limitN = 50): Promise<LaunchpadTrade[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('coin_address', coinAddress)
    .order('timestamp', { ascending: false })
    .limit(limitN);
  if (error) { console.error('fetchTransactions:', error); return []; }
  return (data || []).map(r => ({
    id: r.id,
    coinAddress: r.coin_address,
    walletAddress: r.wallet_address,
    socialHandle: r.social_handle,
    type: r.type as 'BUY' | 'SELL',
    amount: Number(r.amount),
    price: Number(r.price),
    timestamp: new Date(r.timestamp).getTime(),
    txHash: r.tx_hash,
  }));
};

export const subscribeToTrades = (coinAddress: string, callback: (trade: LaunchpadTrade) => void) => {
  const channel = supabase
    .channel(`trades_${coinAddress}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `coin_address=eq.${coinAddress}` }, payload => {
      const r = payload.new as any;
      callback({
        id: r.id, coinAddress: r.coin_address, walletAddress: r.wallet_address,
        socialHandle: r.social_handle, type: r.type as 'BUY' | 'SELL',
        amount: Number(r.amount), price: Number(r.price),
        timestamp: new Date(r.timestamp).getTime(), txHash: r.tx_hash,
      });
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
};

// ─── WATCHLISTS ──────────────────────────────────────────────────────────────

export const fetchWatchlist = async (userWallet: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('watchlists').select('coin_address').eq('user_wallet', userWallet);
  if (error) { console.error('fetchWatchlist:', error); return []; }
  return (data || []).map(r => r.coin_address);
};

export const addToWatchlist = async (userWallet: string, coinAddress: string): Promise<boolean> => {
  const { error } = await supabase.from('watchlists').upsert([{
    user_wallet: userWallet, coin_address: coinAddress, added_at: new Date().toISOString()
  }]);
  if (error) { console.error('addToWatchlist:', error); return false; }
  return true;
};

export const removeFromWatchlist = async (userWallet: string, coinAddress: string): Promise<boolean> => {
  const { error } = await supabase.from('watchlists')
    .delete().eq('user_wallet', userWallet).eq('coin_address', coinAddress);
  if (error) { console.error('removeFromWatchlist:', error); return false; }
  return true;
};

// ─── ALERTS ──────────────────────────────────────────────────────────────────

export const fetchAlerts = async (userWallet: string): Promise<PriceAlert[]> => {
  const { data, error } = await supabase
    .from('alerts').select('*').eq('user_wallet', userWallet).eq('triggered', false);
  if (error) { console.error('fetchAlerts:', error); return []; }
  return (data || []).map(r => ({
    id: r.id, userWallet: r.user_wallet, coinAddress: r.coin_address,
    targetPrice: Number(r.target_price), direction: r.direction as 'ABOVE' | 'BELOW',
    triggered: r.triggered, createdAt: new Date(r.created_at).getTime(),
  }));
};

export const createAlert = async (alert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>): Promise<boolean> => {
  const { error } = await supabase.from('alerts').insert([{
    user_wallet: alert.userWallet, coin_address: alert.coinAddress,
    target_price: alert.targetPrice, direction: alert.direction, triggered: false,
  }]);
  if (error) { console.error('createAlert:', error); return false; }
  return true;
};

export const triggerAlert = async (alertId: string): Promise<void> => {
  await supabase.from('alerts').update({ triggered: true }).eq('id', alertId);
};

export const deleteAlert = async (alertId: string): Promise<void> => {
  await supabase.from('alerts').delete().eq('id', alertId);
};

// ─── BOOSTS ──────────────────────────────────────────────────────────────────

export const BOOST_TIERS = [
  { tier: 'BASIC',   durationHours: 6,  costARG: 50,  label: '6 Hours',  color: 'text-zinc-400' },
  { tier: 'PREMIUM', durationHours: 24, costARG: 150, label: '24 Hours', color: 'text-blue-400' },
  { tier: 'ELITE',   durationHours: 72, costARG: 400, label: '72 Hours', color: 'text-yellow-400' },
] as const;

export const boostCoin = async (coinAddress: string, boostedBy: string, tier: CoinBoost['tier']): Promise<boolean> => {
  const tierId = BOOST_TIERS.find(t => t.tier === tier);
  if (!tierId) return false;
  const expiresAt = new Date(Date.now() + tierId.durationHours * 3_600_000).toISOString();
  const [boostErr] = await Promise.all([
    supabase.from('boosts').insert([{ coin_address: coinAddress, boosted_by: boostedBy, amount_paid: tierId.costARG, expires_at: expiresAt }]).then(r => r.error),
    supabase.from('coins').update({ is_boosted: true, boost_expiry: expiresAt }).eq('contract_address', coinAddress).then(r => r.error),
  ]);
  if (boostErr) { console.error('boostCoin:', boostErr); return false; }
  return true;
};

// ─── HOLDERS ─────────────────────────────────────────────────────────────────

export const fetchHolders = async (coinAddress: string) => {
  const { data, error } = await supabase
    .from('holders').select('*').eq('coin_address', coinAddress).order('balance', { ascending: false }).limit(50);
  if (error) { console.error('fetchHolders:', error); return []; }
  return (data || []).map(r => ({
    wallet: r.wallet_address, balance: Number(r.balance), lastUpdated: new Date(r.last_updated).getTime()
  }));
};

export const upsertHolder = async (coinAddress: string, wallet: string, balance: number): Promise<void> => {
  await supabase.from('holders').upsert([{
    coin_address: coinAddress, wallet_address: wallet, balance, last_updated: new Date().toISOString()
  }]);
};

// ─── LAUNCHPAD USER PROFILE ───────────────────────────────────────────────────

export const upsertLaunchpadUser = async (wallet: string, username?: string, socialHandle?: string): Promise<void> => {
  await supabase.from('users').upsert([{
    wallet_address: wallet, username: username || null, social_handle: socialHandle || null,
  }], { onConflict: 'wallet_address' });
};

export const fetchLaunchpadUser = async (wallet: string) => {
  const { data } = await supabase.from('users').select('*').eq('wallet_address', wallet).single();
  return data;
};

// ─── SUPABASE SQL SCHEMA (for documentation / migrations) ────────────────────
export const SCHEMA_SQL = `
-- Run this in your Supabase SQL editor to initialise the Argus Launchpad database.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  username text,
  social_handle text,
  created_at timestamptz default now()
);

create table if not exists coins (
  id uuid primary key default gen_random_uuid(),
  contract_address text unique not null,
  name text not null,
  ticker text not null,
  description text,
  icon_url text,
  total_supply numeric not null,
  circulating_supply numeric,
  liquidity numeric not null,
  creator_wallet text not null,
  creator_allocation numeric default 10,
  commission_rate numeric default 2,
  social_links jsonb default '{}',
  risk_score numeric default 50,
  market_cap numeric default 0,
  volume_24h numeric default 0,
  price_change_24h numeric default 0,
  is_boosted boolean default false,
  boost_expiry timestamptz,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  tx_hash text unique not null,
  coin_address text references coins(contract_address),
  wallet_address text not null,
  social_handle text,
  type text check (type in ('BUY','SELL')) not null,
  amount numeric not null,
  price numeric not null,
  timestamp timestamptz default now()
);

create table if not exists watchlists (
  user_wallet text not null,
  coin_address text not null,
  added_at timestamptz default now(),
  primary key (user_wallet, coin_address)
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_wallet text not null,
  coin_address text not null,
  target_price numeric not null,
  direction text check (direction in ('ABOVE','BELOW')) not null,
  triggered boolean default false,
  created_at timestamptz default now()
);

create table if not exists boosts (
  id uuid primary key default gen_random_uuid(),
  coin_address text references coins(contract_address),
  boosted_by text not null,
  amount_paid numeric not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists holders (
  coin_address text not null,
  wallet_address text not null,
  balance numeric not null,
  last_updated timestamptz default now(),
  primary key (coin_address, wallet_address)
);

-- Enable realtime on key tables
alter publication supabase_realtime add table coins;
alter publication supabase_realtime add table transactions;
`;
