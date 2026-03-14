import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Search, Star, Bell, TrendingUp, TrendingDown, Zap,
  Plus, X, Copy, ExternalLink, ChevronRight, ChevronDown,
  ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2,
  Twitter, MessageCircle, Shield, BarChart2, List, Upload,
  Activity, Flame, Clock, Award, Eye, Trash2, Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchCoins, fetchCoin, createCoin, recordTransaction,
  fetchTransactions, subscribeToTrades, subscribeToCoin,
  fetchWatchlist, addToWatchlist, removeFromWatchlist,
  fetchAlerts, createAlert, deleteAlert, triggerAlert,
  boostCoin, fetchHolders, BOOST_TIERS,
} from '../services/supabase';
import {
  CURRENT_ARG_PRICE, calculateCurrentBlockHeight,
} from '../services/firebase';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import type { LaunchpadCoin, LaunchpadTrade, PriceAlert } from '../types';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CREATION_FEE_ARG = 25;
const P = (v: number, d = 4) => v.toLocaleString(undefined, { maximumFractionDigits: d });
const PA = (v: number) => `${P(v, 4)} AGR`;
const SHORTEN = (s: string) => s ? `${s.slice(0, 6)}…${s.slice(-4)}` : '—';
const PANEL = 'bg-zinc-950/80 border border-white/[0.05] rounded-2xl backdrop-blur-xl';
const LABEL = 'text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600';
const VAL = 'text-sm font-black text-white tracking-tight';

// ─── STUB: Simulated price oracle (replaces real DEX until mainnet) ───────────
function getBasePrice(coin: LaunchpadCoin): number {
  const seed = coin.address.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return (seed % 1000) / 10000 + 0.0001;
}

function generateCandles(count: number, basePrice: number) {
  const candles = [];
  let last = basePrice;
  for (let i = 0; i < count; i++) {
    const r = (Math.sin(i * 1.7 + basePrice * 100) * 0.15 + 1);
    const o = last;
    const c = o * r;
    const h = Math.max(o, c) * (1 + Math.abs(Math.sin(i)) * 0.05);
    const l = Math.min(o, c) * (1 - Math.abs(Math.cos(i)) * 0.05);
    candles.push({ o, h, l, c, t: Date.now() - (count - i) * 60000 });
    last = c;
  }
  return candles;
}

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-2 p-1 hover:text-maroon transition-all">
      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-600" />}
    </button>
  );
};

// ─── COIN CARD ────────────────────────────────────────────────────────────────
const CoinCard: React.FC<{ coin: LaunchpadCoin; watchlist: string[]; onSelect: () => void; onWatch: () => void }> = ({ coin, watchlist, onSelect, onWatch }) => {
  const price = getBasePrice(coin);
  const inWatch = watchlist.includes(coin.address);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`${PANEL} p-5 cursor-pointer relative group`} onClick={onSelect}>
      {coin.isBoosted && (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase tracking-widest rounded-tr-2xl rounded-bl-xl flex items-center gap-1">
          <Flame className="w-2.5 h-2.5" /> BOOSTED
        </div>
      )}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-maroon/10 border border-maroon/20 flex items-center justify-center text-lg font-black text-maroon overflow-hidden flex-shrink-0">
          {coin.iconUrl ? <img src={coin.iconUrl} alt={coin.ticker} className="w-full h-full object-cover" /> : coin.ticker.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">{coin.name}</p>
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">${coin.ticker}</p>
        </div>
        <button onClick={e => { e.stopPropagation(); onWatch(); }}
          className={`p-1.5 rounded-lg transition-all ${inWatch ? 'text-yellow-500' : 'text-zinc-700 hover:text-yellow-500'}`}>
          <Star className="w-3.5 h-3.5" fill={inWatch ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={LABEL}>Price</p>
          <p className={VAL}>{PA(price)}</p>
        </div>
        <div className="text-right">
          <p className={LABEL}>24h</p>
          <p className={`text-sm font-black ${coin.priceChange24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {coin.priceChange24h >= 0 ? '+' : ''}{P(coin.priceChange24h, 2)}%
          </p>
        </div>
        <div>
          <p className={LABEL}>Mkt Cap</p>
          <p className="text-[11px] font-black text-zinc-400">{PA(coin.marketCap || price * coin.circulatingSupply)}</p>
        </div>
        <div className="text-right">
          <p className={LABEL}>Volume</p>
          <p className="text-[11px] font-black text-zinc-400">{PA(coin.volume24h)}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${coin.riskScore > 70 ? 'bg-emerald-500' : coin.riskScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">
            {coin.riskScore > 70 ? 'LOW' : coin.riskScore > 40 ? 'MED' : 'HIGH'} RISK
          </span>
        </div>
        <span className="text-[8px] text-zinc-800 font-black">{SHORTEN(coin.address)}</span>
      </div>
    </motion.div>
  );
};

// ─── PRICE CHART (Candlestick / Line) ────────────────────────────────────────
const PriceChart: React.FC<{ coin: LaunchpadCoin; tf: string }> = ({ coin, tf }) => {
  const [mode, setMode] = useState<'candle' | 'line'>('candle');
  const candles = generateCandles(60, getBasePrice(coin));
  const minL = Math.min(...candles.map(c => c.l));
  const maxH = Math.max(...candles.map(c => c.h));
  const range = maxH - minL || 0.0001;
  const yPct = (v: number) => ((v - minL) / range) * 100;
  const W = 100 / candles.length;

  return (
    <div className={`${PANEL} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Price_Chart</p>
        <div className="flex items-center gap-2">
          {['candle', 'line'].map(m => (
            <button key={m} onClick={() => setMode(m as any)}
              className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-maroon text-white' : 'text-zinc-700 hover:text-white'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-48 w-full">
        {mode === 'candle' ? (
          <div className="flex items-end h-full gap-px">
            {candles.map((c, i) => {
              const bull = c.c >= c.o;
              const bodyBot = Math.min(yPct(c.o), yPct(c.c));
              const bodyH = Math.abs(yPct(c.c) - yPct(c.o)) || 0.5;
              return (
                <div key={i} className="flex-1 relative h-full" title={`H:${P(c.h)} L:${P(c.l)}`}>
                  <div className={`absolute left-1/2 -translate-x-px w-px ${bull ? 'bg-emerald-500/60' : 'bg-red-500/60'}`}
                    style={{ bottom: `${yPct(c.l)}%`, height: `${yPct(c.h) - yPct(c.l)}%` }} />
                  <div className={`absolute left-0 right-0 min-h-px ${bull ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ bottom: `${bodyBot}%`, height: `${bodyH}%` }} />
                </div>
              );
            })}
          </div>
        ) : (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={candles.map((c, i) => `${i * W + W / 2},${100 - yPct(c.c)}`).join(' ')}
              fill="none" stroke="#800000" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            <polyline
              points={`0,100 ${candles.map((c, i) => `${i * W + W / 2},${100 - yPct(c.c)}`).join(' ')} 100,100`}
              fill="url(#chartGrad)" stroke="none" />
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#800000" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#800000" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
      <div className="flex justify-between text-[8px] text-zinc-800 font-black mt-2">
        {['-60m', '-45m', '-30m', '-15m', 'NOW'].map(t => <span key={t}>{t}</span>)}
      </div>
    </div>
  );
};

// ─── TRADING PANEL ────────────────────────────────────────────────────────────
const TradingPanel: React.FC<{ coin: LaunchpadCoin; userWallet: string; onTrade: (trade: LaunchpadTrade) => void }> = ({ coin, userWallet, onTrade }) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [tp, setTp] = useState('');
  const [sl, setSl] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const price = getBasePrice(coin);

  const execute = async () => {
    if (!amount || !userWallet) return;
    setBusy(true);
    setMsg(null);
    const blockHeight = calculateCurrentBlockHeight();
    const txHash = `0xargus${blockHeight.toString(16)}${Date.now().toString(16)}`;
    const trade: LaunchpadTrade = {
      id: txHash, coinAddress: coin.address, walletAddress: userWallet,
      type: side, amount: parseFloat(amount), price, timestamp: Date.now(), txHash,
    };
    const ok = await recordTransaction(trade);
    if (ok) {
      setMsg({ ok: true, text: `${side} of ${amount} ${coin.ticker} confirmed on block #${blockHeight}` });
      onTrade(trade);
      setAmount('');
    } else {
      setMsg({ ok: false, text: 'Transaction failed. Retry or check your AGR balance.' });
    }
    setBusy(false);
  };

  return (
    <div className={`${PANEL} p-6 space-y-5`}>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Trading_Terminal</p>
      <div className="flex p-1 bg-black/60 rounded-xl">
        {(['BUY', 'SELL'] as const).map(s => (
          <button key={s} onClick={() => setSide(s)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${side === s ? (s === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-red-600 text-white') : 'text-zinc-600 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <div>
          <label className={`${LABEL} block mb-1`}>Amount ({coin.ticker})</label>
          <div className="relative">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-sm font-black text-white outline-none focus:border-maroon/40 transition-all" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600 font-black">{coin.ticker}</span>
          </div>
          {amount && <p className="text-[9px] text-zinc-600 mt-1">≈ {PA(parseFloat(amount) * price)}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`${LABEL} block mb-1`}>Take Profit (AGR)</label>
            <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="Optional"
              className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs font-black text-white outline-none focus:border-emerald-500/40 transition-all" />
          </div>
          <div>
            <label className={`${LABEL} block mb-1`}>Stop Loss (AGR)</label>
            <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="Optional"
              className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs font-black text-white outline-none focus:border-red-500/40 transition-all" />
          </div>
        </div>
        {tp && <p className="text-[9px] text-emerald-700"><CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />Auto-sell at {PA(parseFloat(tp))}</p>}
        {sl && <p className="text-[9px] text-red-700"><AlertCircle className="w-2.5 h-2.5 inline mr-1" />Stop-loss at {PA(parseFloat(sl))}</p>}
      </div>
      <div className="space-y-2 pt-1 border-t border-white/5 text-[9px] text-zinc-600">
        <div className="flex justify-between"><span>Current Price</span><span className="text-white">{PA(price)}</span></div>
        <div className="flex justify-between"><span>Creator Commission</span><span className="text-maroon">{coin.commissionRate}%</span></div>
        {amount && <div className="flex justify-between font-black"><span>Total</span><span className="text-white">{PA(parseFloat(amount) * price * (1 + coin.commissionRate / 100))}</span></div>}
      </div>
      {msg && (
        <div className={`p-3 rounded-xl text-[9px] font-black ${msg.ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
          {msg.text}
        </div>
      )}
      <button onClick={execute} disabled={!amount || busy || !userWallet}
        className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 ${side === 'BUY' ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
        {busy ? 'Broadcasting...' : !userWallet ? 'Login Required' : `${side} ${coin.ticker}`}
      </button>
    </div>
  );
};

// ─── COIN DETAIL VIEW ─────────────────────────────────────────────────────────
const CoinDetailView: React.FC<{ coin: LaunchpadCoin; userWallet: string; watchlist: string[]; onToggleWatch: (a: string) => void; onBack: () => void }> = ({ coin, userWallet, watchlist, onToggleWatch, onBack }) => {
  const [trades, setTrades] = useState<LaunchpadTrade[]>([]);
  const [holders, setHolders] = useState<{ wallet: string; balance: number }[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertDir, setAlertDir] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [showBoost, setShowBoost] = useState(false);
  const [tf, setTf] = useState('1h');
  const price = getBasePrice(coin);
  const inWatch = watchlist.includes(coin.address);

  useEffect(() => {
    fetchTransactions(coin.address).then(setTrades);
    fetchHolders(coin.address).then(setHolders);
    if (userWallet) fetchAlerts(userWallet).then(a => setAlerts(a.filter(x => x.coinAddress === coin.address)));
    const unsub = subscribeToTrades(coin.address, t => setTrades(prev => [t, ...prev.slice(0, 49)]));
    return unsub;
  }, [coin.address, userWallet]);

  const addAlert = async () => {
    if (!alertPrice || !userWallet) return;
    const ok = await createAlert({ userWallet, coinAddress: coin.address, targetPrice: parseFloat(alertPrice), direction: alertDir });
    if (ok) { setAlertPrice(''); fetchAlerts(userWallet).then(a => setAlerts(a.filter(x => x.coinAddress === coin.address))); }
  };

  const buySellVol = trades.reduce((a, t) => {
    if (t.type === 'BUY') a.buy += t.amount * t.price;
    else a.sell += t.amount * t.price;
    return a;
  }, { buy: 0, sell: 0 });
  const totalVol = buySellVol.buy + buySellVol.sell || 1;

  const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
  const STATS: [string, string][] = [
    ['Price (AGR)', PA(price)],
    ['Price (USD)', `$${P(price * CURRENT_ARG_PRICE, 6)}`],
    ['Market Cap', PA(price * coin.circulatingSupply)],
    ['FDV', PA(price * coin.totalSupply)],
    ['Total Supply', P(coin.totalSupply, 0)],
    ['Circulating', P(coin.circulatingSupply, 0)],
    ['Liquidity', PA(coin.liquidity)],
    ['Volume 24h', PA(coin.volume24h)],
    ['Commission', `${coin.commissionRate}%`],
    ['Risk Score', `${coin.riskScore}/100`],
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] text-zinc-600 hover:text-white font-black uppercase tracking-widest transition-all">
          <ChevronRight className="w-4 h-4 rotate-180" /> All_Coins
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => onToggleWatch(coin.address)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${inWatch ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500' : 'border-white/5 bg-zinc-900 text-zinc-600 hover:text-white'}`}>
            <Star className="w-3 h-3" fill={inWatch ? 'currentColor' : 'none'} />
            {inWatch ? 'Watching' : 'Watch'}
          </button>
          {userWallet === coin.creatorWallet && (
            <button onClick={() => setShowBoost(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-all">
              <Flame className="w-3 h-3" /> Boost
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center text-2xl font-black text-maroon overflow-hidden">
          {coin.iconUrl ? <img src={coin.iconUrl} alt={coin.name} className="w-full h-full object-cover" /> : coin.ticker.slice(0, 2)}
        </div>
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">{coin.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-black text-maroon uppercase tracking-widest">${coin.ticker}</span>
            <span className={`text-[9px] font-black ${coin.priceChange24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {coin.priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(coin.priceChange24h).toFixed(2)}% 24h
            </span>
          </div>
        </div>
      </div>

      {/* Chart + TF */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={() => setTf(t)}
              className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${tf === t ? 'bg-maroon text-white' : 'bg-zinc-900 text-zinc-600 hover:text-white border border-white/5'}`}>
              {t}
            </button>
          ))}
        </div>
        <PriceChart coin={coin} tf={tf} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Stats */}
        <div className={`${PANEL} p-6 lg:col-span-2`}>
          <p className={`${LABEL} mb-4`}>Market_Data</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {STATS.map(([l, v]) => (
              <div key={l} className="flex justify-between border-b border-white/[0.03] pb-2">
                <span className={LABEL}>{l}</span>
                <span className={VAL}>{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className={LABEL}>Contract</span>
              <div className="flex items-center text-[10px] font-mono text-zinc-400">
                {SHORTEN(coin.address)} <CopyButton text={coin.address} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={LABEL}>Creator</span>
              <div className="flex items-center text-[10px] font-mono text-zinc-400">
                {SHORTEN(coin.creatorWallet)} <CopyButton text={coin.creatorWallet} />
              </div>
            </div>
          </div>
          {/* Buy/Sell Bar */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex justify-between text-[9px] font-black mb-2">
              <span className="text-emerald-500">BUY {P(buySellVol.buy / totalVol * 100, 1)}%</span>
              <span className="text-red-500">SELL {P(buySellVol.sell / totalVol * 100, 1)}%</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 transition-all" style={{ width: `${buySellVol.buy / totalVol * 100}%` }} />
              <div className="bg-red-500 flex-1" />
            </div>
          </div>
          {/* Socials */}
          {(coin.socials.twitter || coin.socials.telegram || coin.socials.discord) && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
              <span className={LABEL}>Socials</span>
              {coin.socials.twitter && <a href={coin.socials.twitter} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>}
              {coin.socials.telegram && <a href={coin.socials.telegram} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-all"><MessageCircle className="w-4 h-4" /></a>}
              {coin.socials.discord && <a href={coin.socials.discord} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-all"><MessageCircle className="w-4 h-4" /></a>}
            </div>
          )}
        </div>

        {/* Trading + Alerts */}
        <div className="space-y-4">
          <TradingPanel coin={coin} userWallet={userWallet} onTrade={t => setTrades(p => [t, ...p])} />
          {/* Price Alert */}
          <div className={`${PANEL} p-5 space-y-3`}>
            <p className={`${LABEL}`}>Price_Alert</p>
            <div className="flex gap-2">
              {(['ABOVE', 'BELOW'] as const).map(d => (
                <button key={d} onClick={() => setAlertDir(d)}
                  className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${alertDir === d ? 'border-maroon bg-maroon/10 text-maroon' : 'border-white/5 text-zinc-600 hover:text-white'}`}>
                  {d}
                </button>
              ))}
            </div>
            <input type="number" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} placeholder="Target price (AGR)"
              className="w-full bg-black/60 border border-white/5 rounded-xl px-3 py-2.5 text-xs font-black text-white outline-none focus:border-maroon/40" />
            <button onClick={addAlert} disabled={!alertPrice || !userWallet}
              className="w-full py-2 bg-maroon/10 border border-maroon/20 text-maroon rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-maroon hover:text-white transition-all disabled:opacity-40">
              <Bell className="w-3 h-3 inline mr-1" /> Set Alert
            </button>
            {alerts.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 bg-black/40 border border-white/[0.03] rounded-lg">
                <span className="text-[9px] text-zinc-500">{a.direction} {PA(a.targetPrice)}</span>
                <button onClick={() => deleteAlert(a.id).then(() => setAlerts(p => p.filter(x => x.id !== a.id)))} className="text-zinc-700 hover:text-red-500 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holders */}
      {holders.length > 0 && (
        <div className={`${PANEL} p-6`}>
          <p className={`${LABEL} mb-4`}>Top_Holders ({holders.length})</p>
          <div className="space-y-2">
            {holders.slice(0, 10).map((h, i) => (
              <div key={h.wallet} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[8px] text-zinc-800 w-4 text-right">{i + 1}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{SHORTEN(h.wallet)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-maroon/60 rounded-full" style={{ width: `${(h.balance / (holders[0]?.balance || 1)) * 100}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-600 w-20 text-right">{P(h.balance, 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Trade Feed */}
      <div className={`${PANEL} p-6`}>
        <p className={`${LABEL} mb-4`}>Live_Activity_Feed</p>
        {trades.length === 0 ? (
          <p className="text-center text-zinc-700 text-xs py-8 italic">No transactions yet. Be the first to trade!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {trades.map(t => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-black/40 border border-white/[0.03] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-5 flex items-center justify-center rounded text-[8px] font-black ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.type}
                  </span>
                  <div>
                    <p className="text-[9px] font-mono text-zinc-500">{t.socialHandle || SHORTEN(t.walletAddress)}</p>
                    <p className="text-[8px] text-zinc-700">{new Date(t.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black ${t.type === 'BUY' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {t.type === 'BUY' ? '+' : '-'}{P(t.amount, 2)} {coin.ticker}
                  </p>
                  <p className="text-[8px] text-zinc-700">{PA(t.price)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Boost Modal */}
      <AnimatePresence>
        {showBoost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setShowBoost(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`${PANEL} p-8 max-w-md w-full space-y-6`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-white italic">Boost_{coin.ticker}</p>
                <button onClick={() => setShowBoost(false)} className="text-zinc-600 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Boosted coins appear at the top of all filter tabs and the homepage.</p>
              <div className="space-y-3">
                {BOOST_TIERS.map(t => (
                  <button key={t.tier} onClick={() => boostCoin(coin.address, userWallet, t.tier).then(() => setShowBoost(false))}
                    className={`w-full flex items-center justify-between p-4 bg-black/60 border border-white/5 rounded-2xl hover:border-maroon/30 transition-all group`}>
                    <div className="text-left">
                      <p className={`text-sm font-black ${t.color}`}>{t.tier}</p>
                      <p className="text-[9px] text-zinc-600 font-bold mt-0.5">{t.label} of boosting</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{t.costARG} AGR</p>
                      <p className="text-[8px] text-zinc-700">${P(t.costARG * CURRENT_ARG_PRICE, 2)} USD</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── COIN CREATION FORM ───────────────────────────────────────────────────────
const CoinCreationForm: React.FC<{ userWallet: string; onCreated: (c: LaunchpadCoin) => void; onClose: () => void }> = ({ userWallet, onCreated, onClose }) => {
  const [form, setForm] = useState({ name: '', ticker: '', description: '', totalSupply: '1000000000', liquidity: '100', allocation: '10', commission: '2', twitter: '', telegram: '', discord: '', iconUrl: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.ticker || !userWallet) { setErr('Please fill all required fields and connect your wallet.'); return; }
    setBusy(true); setErr('');
    const address = ArgusSynapseService.generateAddress(`coin_${form.ticker}_${Date.now()}`);
    const coin = await createCoin({
      contract_address: address, name: form.name, ticker: form.ticker.toUpperCase(),
      description: form.description, icon_url: form.iconUrl,
      total_supply: parseFloat(form.totalSupply), liquidity: parseFloat(form.liquidity),
      creator_wallet: userWallet, creator_allocation: parseFloat(form.allocation),
      commission_rate: parseFloat(form.commission),
      social_links: { twitter: form.twitter || undefined, telegram: form.telegram || undefined, discord: form.discord || undefined },
    });
    setBusy(false);
    if (coin) { onCreated(coin); } else { setErr('Failed to deploy coin. Check Supabase connection.'); }
  };

  const INPUT = 'w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-maroon/40 transition-all placeholder:text-zinc-800';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-6 overflow-y-auto"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className={`${PANEL} p-8 max-w-2xl w-full my-6 space-y-6`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter">Launch_Coin</h2>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Deploy your meme coin on the Argus blockchain</p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={`${LABEL} block mb-1.5`}>Coin Name *</label><input value={form.name} onChange={F('name')} placeholder="Argus Doge" className={INPUT} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>Ticker *</label><input value={form.ticker} onChange={F('ticker')} placeholder="ADOGE" className={INPUT} /></div>
          <div className="md:col-span-2"><label className={`${LABEL} block mb-1.5`}>Description</label><textarea value={form.description} onChange={F('description')} placeholder="Describe your coin..." rows={3} className={`${INPUT} resize-none`} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>Icon URL</label><input value={form.iconUrl} onChange={F('iconUrl')} placeholder="https://..." className={INPUT} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>Total Supply</label><input type="number" value={form.totalSupply} onChange={F('totalSupply')} className={INPUT} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>Initial Liquidity (AGR)</label><input type="number" value={form.liquidity} onChange={F('liquidity')} className={INPUT} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>Creator Allocation (%)</label><input type="number" value={form.allocation} onChange={F('allocation')} min="0" max="50" className={INPUT} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>Commission Rate (%)</label><input type="number" value={form.commission} onChange={F('commission')} min="0" max="10" className={INPUT} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>X (Twitter)</label><input value={form.twitter} onChange={F('twitter')} placeholder="https://x.com/..." className={INPUT} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>Telegram</label><input value={form.telegram} onChange={F('telegram')} placeholder="https://t.me/..." className={INPUT} /></div>
          <div><label className={`${LABEL} block mb-1.5`}>Discord</label><input value={form.discord} onChange={F('discord')} placeholder="https://discord.gg/..." className={INPUT} /></div>
        </div>
        <div className="p-4 bg-maroon/5 border border-maroon/10 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-maroon flex-shrink-0" />
          <div>
            <p className="text-[10px] font-black text-maroon uppercase tracking-widest">Creation Fee: {CREATION_FEE_ARG} AGR</p>
            <p className="text-[9px] text-zinc-600 font-bold mt-0.5">This fee is paid to the Argus Launchpad protocol upon deployment.</p>
          </div>
        </div>
        {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500">{err}</div>}
        {!userWallet && <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] font-black text-yellow-500">You must be logged in to deploy a coin.</div>}
        <button onClick={submit} disabled={busy || !userWallet}
          className="w-full py-4 bg-maroon hover:bg-maroon/80 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-maroon/20 disabled:opacity-40">
          {busy ? 'Deploying to Argus...' : `Deploy & List · ${CREATION_FEE_ARG} AGR`}
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── MAIN LAUNCHPAD ───────────────────────────────────────────────────────────
const FILTER_TABS = ['Trending', 'Newest', 'Gainers', 'Losers', 'Top', 'Boosted', 'Watchlist'] as const;
type FilterTab = typeof FILTER_TABS[number];

const ArgusLaunchpad: React.FC = () => {
  const { user } = useAuth();
  const userWallet = user?.argAddress || user?.uid || '';
  const [coins, setCoins] = useState<LaunchpadCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('Trending');
  const [selected, setSelected] = useState<LaunchpadCoin | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Load coins + watchlist
  useEffect(() => {
    fetchCoins().then(c => { setCoins(c); setLoading(false); });
    if (userWallet) {
      fetchWatchlist(userWallet).then(setWatchlist);
      fetchAlerts(userWallet).then(setAlerts);
    }
  }, [userWallet]);

  // Alert price-check loop
  useEffect(() => {
    if (!alerts.length || !coins.length) return;
    const interval = setInterval(() => {
      alerts.forEach(alert => {
        const coin = coins.find(c => c.address === alert.coinAddress);
        if (!coin) return;
        const price = getBasePrice(coin);
        const triggered = alert.direction === 'ABOVE' ? price >= alert.targetPrice : price <= alert.targetPrice;
        if (triggered) {
          triggerAlert(alert.id);
          setAlerts(p => p.filter(a => a.id !== alert.id));
          setNotification(`🔔 Alert fired: ${coin.ticker} is ${alert.direction} ${PA(alert.targetPrice)}`);
          setTimeout(() => setNotification(null), 5000);
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts, coins]);

  const toggleWatch = useCallback(async (address: string) => {
    if (!userWallet) return;
    const inList = watchlist.includes(address);
    if (inList) { await removeFromWatchlist(userWallet, address); setWatchlist(p => p.filter(a => a !== address)); }
    else { await addToWatchlist(userWallet, address); setWatchlist(p => [...p, address]); }
  }, [userWallet, watchlist]);

  const handleCreated = (coin: LaunchpadCoin) => {
    setCoins(p => [coin, ...p]);
    setShowCreate(false);
    setSelected(coin);
  };

  // Filtering
  const filtered = coins
    .filter(c => {
      if (search) return c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase()) || c.ticker.toLowerCase().includes(search.toLowerCase());
      if (filter === 'Watchlist') return watchlist.includes(c.address);
      if (filter === 'Boosted') return c.isBoosted;
      return true;
    })
    .sort((a, b) => {
      if (filter === 'Trending') return b.volume24h - a.volume24h;
      if (filter === 'Newest') return b.createdAt - a.createdAt;
      if (filter === 'Gainers') return b.priceChange24h - a.priceChange24h;
      if (filter === 'Losers') return a.priceChange24h - b.priceChange24h;
      if (filter === 'Top') return b.marketCap - a.marketCap;
      return b.createdAt - a.createdAt;
    });

  if (selected) {
    return (
      <div className="text-zinc-300 font-mono animate-in fade-in duration-500">
        <div className="max-w-[1400px] mx-auto">
          <CoinDetailView coin={selected} userWallet={userWallet} watchlist={watchlist} onToggleWatch={toggleWatch} onBack={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative text-zinc-300 font-mono animate-in fade-in duration-500">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[99] px-6 py-3 bg-zinc-950 border border-maroon/30 rounded-2xl text-[10px] font-black text-maroon shadow-2xl shadow-maroon/20">
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CoinCreationForm userWallet={userWallet} onCreated={handleCreated} onClose={() => setShowCreate(false)} />}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto relative z-10 space-y-10">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-maroon/5 border border-maroon/10 rounded-full">
              <Rocket className="w-3.5 h-3.5 text-maroon animate-pulse" />
              <span className="text-[9px] font-black text-maroon uppercase tracking-[0.3em] italic">Argus_Chain · AGR_Native</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none italic">
              Argus<span className="text-maroon">Pad.</span>
            </h1>
            <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.4em] opacity-60">
              The institutional meme coin launchpad for the Argus high-throughput economy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH COIN / ADDRESS..."
                className="w-72 bg-black/80 border border-white/5 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-mono text-white outline-none focus:border-maroon/40 transition-all placeholder:text-zinc-800 uppercase" />
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-maroon hover:bg-maroon/80 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-maroon/20">
              <Plus className="w-4 h-4" /> Launch Coin
            </button>
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/[0.05] pb-4">
          {FILTER_TABS.map(tab => (
            <button key={tab} onClick={() => { setFilter(tab); setSearch(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab ? 'bg-maroon text-white shadow-lg shadow-maroon/20 -translate-y-0.5' : 'text-zinc-600 hover:text-white hover:bg-zinc-900 border border-white/5'}`}>
              {tab === 'Trending' && <Flame className="w-3.5 h-3.5" />}
              {tab === 'Newest' && <Clock className="w-3.5 h-3.5" />}
              {tab === 'Gainers' && <TrendingUp className="w-3.5 h-3.5" />}
              {tab === 'Losers' && <TrendingDown className="w-3.5 h-3.5" />}
              {tab === 'Top' && <Award className="w-3.5 h-3.5" />}
              {tab === 'Boosted' && <Zap className="w-3.5 h-3.5" />}
              {tab === 'Watchlist' && <Star className="w-3.5 h-3.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Coin Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${PANEL} p-5 h-48 animate-pulse`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-40 text-center">
            <Rocket className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <p className="text-xl font-black text-white italic uppercase tracking-tight mb-2">
              {filter === 'Watchlist' ? 'No coins in watchlist' : 'No coins found'}
            </p>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
              {filter === 'Watchlist' ? 'Star a coin to add it to your watchlist.' : 'Be the first to launch a meme coin on Argus.'}
            </p>
            <button onClick={() => setShowCreate(true)} className="mt-8 px-8 py-3 bg-maroon text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-maroon/30 transition-all">
              <Plus className="w-4 h-4 inline mr-2" /> Launch First Coin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(coin => (
              <CoinCard key={coin.address} coin={coin} watchlist={watchlist}
                onSelect={() => setSelected(coin)}
                onWatch={() => toggleWatch(coin.address)} />
            ))}
          </div>
        )}

        {/* Active Alerts Banner */}
        {alerts.length > 0 && (
          <div className={`${PANEL} p-5 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-maroon animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {alerts.length} Active Price Alert{alerts.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {alerts.map(a => {
                const coin = coins.find(c => c.address === a.coinAddress);
                return (
                  <div key={a.id} className="flex items-center gap-2 px-3 py-1 bg-maroon/5 border border-maroon/10 rounded-lg">
                    <span className="text-[9px] text-zinc-500">{coin?.ticker || SHORTEN(a.coinAddress)}</span>
                    <span className={`text-[9px] font-black ${a.direction === 'ABOVE' ? 'text-emerald-500' : 'text-red-500'}`}>{a.direction}</span>
                    <span className="text-[9px] text-maroon">{PA(a.targetPrice)}</span>
                    <button onClick={() => deleteAlert(a.id).then(() => setAlerts(p => p.filter(x => x.id !== a.id)))} className="text-zinc-700 hover:text-red-500 transition-all"><X className="w-2.5 h-2.5" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer badge */}
        <div className="py-8 border-t border-white/[0.03] flex items-center justify-between opacity-40 hover:opacity-100 transition-all">
          <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Argus Launchpad · Powered by AGR · All fees on-chain</p>
          <p className="text-[9px] text-zinc-800 font-black uppercase tracking-widest">Block #{calculateCurrentBlockHeight().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ArgusLaunchpad;
