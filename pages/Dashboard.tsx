

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  startMiningSession,
  claimPoints,
  subscribeToNetworkStats,
  subscribeToActiveMinerCount,
  syncReferralStats,
  subscribeToOnlineUsers,
  calculateCurrentBlockHeight,
  TOTAL_SUPPLY,
  BASE_MINING_RATE,
  REFERRAL_BOOST,
  MAX_REFERRALS
} from '../services/firebase';
import {
  Database, Activity, Cpu, Zap,
  AlertTriangle, GitMerge, Layers,
  Server, Terminal, Globe, Info,
  TrendingUp, Shield, Clock
} from 'lucide-react';
import { NetworkStats } from '../types';
import { Tooltip } from '../components/Tooltip';
import Skeleton from '../components/Skeleton';

const DashboardSkeleton = () => (
  <div className="w-full space-y-5 pb-16">
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-900">
      <div className="flex items-center gap-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="skeleton h-10 w-24" />
        <div className="skeleton h-10 w-24" />
      </div>
    </header>

    <div className="grid grid-cols-2 lg:grid-cols-4 border border-zinc-900 overflow-hidden rounded-2xl">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-36 bg-zinc-950 p-6 space-y-4 border-r border-zinc-900 last:border-r-0">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-6 w-24" />
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8 space-y-5">
        <div className="skeleton h-[380px] w-full rounded-2xl" />
        <div className="skeleton h-[160px] w-full rounded-2xl" />
      </div>
      <div className="lg:col-span-4 space-y-5">
        <div className="skeleton h-[340px] w-full rounded-2xl" />
        <div className="skeleton h-[120px] w-full rounded-2xl" />
      </div>
    </div>
  </div>
);

// GhostDAG Topology Canvas
const GhostDAGVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let nodes: Array<{ x: number, y: number, vx: number, vy: number, id: number, type: 'white' | 'red' }> = [];
    let links: Array<{ source: number, target: number }> = [];
    let nextId = 0;

    const resize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 6; i++) {
      nodes.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, id: nextId++, type: 'white' });
    }

    const addNode = () => {
      if (nodes.length > 40) {
        nodes.shift();
        const activeIds = new Set(nodes.map(n => n.id));
        links = links.filter(l => activeIds.has(l.source) && activeIds.has(l.target));
      }
      const newNode = { x: canvas.width + 10, y: Math.random() * canvas.height, vx: -0.9 - Math.random(), vy: (Math.random() - 0.5) * 0.3, id: nextId++, type: Math.random() > 0.88 ? 'red' : 'white' as any };
      const targetCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < targetCount; i++) {
        if (nodes.length > 0) {
          const target = nodes[Math.floor(Math.random() * nodes.length)];
          links.push({ source: newNode.id, target: target.id });
        }
      }
      nodes.push(newNode);
    };

    const interval = setInterval(addNode, 550);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(node => { node.x += node.vx; node.y += node.vy; });
      ctx.lineWidth = 0.8;
      links.forEach(link => {
        const s = nodes.find(n => n.id === link.source);
        const t = nodes.find(n => n.id === link.target);
        if (s && t) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
          ctx.strokeStyle = 'rgba(63, 63, 70, 0.35)';
          ctx.stroke();
        }
      });
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.type === 'red' ? 2.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = node.type === 'white' ? '#FFFFFF' : '#800000';
        ctx.fill();
        if (node.type === 'red') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#800000';
        } else {
          ctx.shadowBlur = 0;
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => { window.removeEventListener('resize', resize); clearInterval(interval); cancelAnimationFrame(animationFrameId); };
  }, []);

  return <div ref={containerRef} className="absolute inset-0"><canvas ref={canvasRef} className="w-full h-full opacity-60" /></div>;
};

// Professional Stat Card
const StatCard = ({ label, value, subValue, icon: Icon, trend, trendUp, tooltip }: any) => (
  <div className="group relative transition-all duration-700 hover:-translate-y-1.5 h-full">
    <div className="frosted-glass border border-white/5 h-full p-6 flex flex-col justify-between relative z-10 bg-zinc-950/90 shadow-2xl">
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-2.5 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/5 group-hover:border-maroon/30 transition-all duration-500">
          <Icon className="w-4 h-4 text-zinc-500 group-hover:text-maroon transition-all duration-500" />
        </div>
        {trend && (
          <span className={`text-[9px] font-mono font-black px-2 py-1 rounded-md border ${trendUp !== false ? 'text-maroon bg-white/5 border-maroon/20' : 'text-zinc-500 bg-zinc-800 border-zinc-700'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <p className="label-meta">{label}</p>
          <Tooltip text={tooltip} position="right">
            <div className="p-1 -m-1 cursor-help group/info hover:scale-110 transition-transform duration-300">
              <Info className="w-3.5 h-3.5 text-zinc-700 group-hover/info:text-maroon transition-colors" />
            </div>
          </Tooltip>
        </div>
        <p className="text-2xl font-mono font-black text-white tracking-tight group-hover:text-maroon/90 transition-all duration-500">{value}</p>
        {subValue && <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">{subValue}</p>}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, refreshUser, loading } = useAuth();
  const [miningTimer, setMiningTimer] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [activeMinerCount, setActiveMinerCount] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);
  const [tps, setTps] = useState(0);
  const [hashrate, setHashrate] = useState(402.1);
  const [isClaiming, setIsClaiming] = useState(false);

  const MAX_SESSION_TIME = 24 * 60 * 60;

  const referrals = Math.min(user?.referralCount || 0, MAX_REFERRALS);
  const currentHourlyRate = BASE_MINING_RATE + (referrals * REFERRAL_BOOST);
  const ratePerSecond = currentHourlyRate / 3600;

  useEffect(() => {
    if (user) {
      syncReferralStats(user.uid, user.referralCount, user.points).then((updatedData) => {
        if (updatedData) refreshUser({ ...user, referralCount: updatedData.referralCount, points: updatedData.points });
      });
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsubStats = subscribeToNetworkStats(s => setNetStats(s));
    // Live count from actual user documents — same source as Admin Panel
    const unsubMiners = subscribeToActiveMinerCount(setActiveMinerCount);
    const unsubPresence = subscribeToOnlineUsers((uids) => {
      const count = Math.max(1, uids.length);
      setHashrate(402.1 + count * 0.05);
    });
    return () => { unsubStats(); unsubMiners(); unsubPresence(); };
  }, []);

  useEffect(() => {
    const update = () => {
      setBlockHeight(calculateCurrentBlockHeight());
      setTps(Math.floor(402000 + Math.sin(Date.now() / 2000) * 15000));
    };
    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, []);

  const calculateProgress = useCallback(() => {
    if (!user?.miningActive || !user.miningStartTime) { setMiningTimer(0); setPendingPoints(0); return; }
    const elapsed = Math.floor((Date.now() - user.miningStartTime) / 1000);
    const clamped = Math.min(elapsed, MAX_SESSION_TIME);
    setMiningTimer(clamped);
    setPendingPoints(clamped * ratePerSecond);
  }, [user, ratePerSecond]);

  useEffect(() => {
    calculateProgress();
    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, [calculateProgress]);

  const handleStartMining = async () => {
    if (!user) return;
    try {
      await startMiningSession(user.uid);
      refreshUser({ ...user, miningActive: true, miningStartTime: Date.now() });
    } catch (e) { console.error(e); }
  };

  const handleClaim = async () => {
    if (!user || pendingPoints === 0 || isClaiming) return;
    setIsClaiming(true);
    try {
      await claimPoints(user.uid, pendingPoints);
      refreshUser({ ...user, miningActive: false, miningStartTime: null, points: user.points + pendingPoints });
      setPendingPoints(0);
      setMiningTimer(0);
    } catch (e) { console.error(e); }
    setIsClaiming(false);
  };

  const formatCountdown = (seconds: number) => {
    const r = Math.max(0, MAX_SESSION_TIME - seconds);
    const h = Math.floor(r / 3600), m = Math.floor((r % 3600) / 60), s = r % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

  if (loading || !user) return <DashboardSkeleton />;

  const leftToMine = Math.max(0, TOTAL_SUPPLY - netStats.totalMined);
  const isSessionComplete = miningTimer >= MAX_SESSION_TIME;
  const progress = (miningTimer / MAX_SESSION_TIME) * 100;

  return (
    <div className="w-full space-y-5 pb-16">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded-xl">
            <Activity className="w-5 h-5 text-maroon" />
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-tight">Network Operations</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-maroon rounded-full animate-pulse shadow-[0_0_8px_#800000]" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active_Kernel · {activeMinerCount.toLocaleString()} Verified Nodes</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="label-meta mb-0.5">Hashrate</p>
            <p className="text-sm font-mono font-black text-white">{hashrate.toFixed(1)} <span className="text-zinc-600 text-xs">PH/s</span></p>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="text-right">
            <p className="label-meta mb-0.5">Block Height</p>
            <p className="text-sm font-mono font-black text-maroon">#{blockHeight.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <StatCard
          label="Node Balance"
          value={`${user.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARG`}
          subValue={`≈ $${(user.points * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`}
          icon={Database}
          trend="+2.4%"
          trendUp={true}
          tooltip="Total accumulated ARG credits and their current USD market valuation."
        />
        <StatCard label="Unmined Supply" value={fmt(leftToMine)} subValue={`Cap: ${fmt(TOTAL_SUPPLY)} ARG`} icon={Layers} tooltip="Remaining ARG pool for Genesis Epoch distribution." />
        <StatCard label="Network Throughput" value={`${tps.toLocaleString()} TPS`} subValue="Finality: < 400ms" icon={Zap} trend="Stable" trendUp={null} tooltip="Aggregate transactions per second across all global shards." />
        <StatCard label="Active Miners" value={activeMinerCount.toLocaleString()} subValue={`Mining Now · Shards: ${Math.max(1, Math.floor(activeMinerCount / 50))}`} icon={Server} tooltip="Live count of verified nodes currently securing the GhostDAG and mining ARG." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-5">

          {/* GHOSTDAG VISUALIZER */}
          <div className="h-[340px] md:h-[380px] rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col frosted-glass bg-zinc-950/90 group/viz shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(24,24,27,0.2),rgba(3,3,5,1)_80%)]" />
            <div className="relative z-10 px-5 py-3.5 border-b border-white/[0.04] flex justify-between items-center bg-black/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <GitMerge className="w-3.5 h-3.5 text-maroon animate-pulse" />
                <span className="label-meta text-zinc-400">GhostDAG_Topology · Synchronized</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                  <span className="text-[8px] font-mono text-zinc-600">Sync Block</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-maroon" />
                  <span className="text-[8px] font-mono text-zinc-600">Red Block</span>
                </div>
                <span className="label-meta opacity-40">Latency: 12ms</span>
              </div>
            </div>
            <div className="relative flex-1 w-full overflow-hidden">
              <GhostDAGVisualizer />
            </div>
          </div>

          {/* MINING CONTROLLER */}
          <div className="rounded-[2.5rem] border border-white/5 frosted-glass bg-zinc-950/90 p-6 md:p-8 relative overflow-hidden shadow-2xl group/mining">
            <div className="absolute top-0 right-0 w-72 h-72 bg-maroon/[0.04] blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
              <div className="flex-1 w-full space-y-5">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">Consensus Engine</h3>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.miningActive ? 'bg-maroon shadow-[0_0_8px_#800000] animate-pulse' : 'bg-zinc-700'}`} />
                      <span className="label-meta">{user.miningActive ? 'KERNEL_ACTIVE · SHA-256G' : 'NODE_STANDBY'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="label-meta mb-1">Session Yield</p>
                    <p className="text-2xl md:text-3xl font-mono font-black text-white tabular-nums">
                      {pendingPoints.toFixed(4)} <span className="text-xs text-zinc-600">ARG</span>
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-wider">
                      ≈ ${(pendingPoints * 0.5).toFixed(4)} USD
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isSessionComplete ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'bg-maroon shadow-[0_0_12px_rgba(128,0,0,0.35)]'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Tooltip text="Base 0.06 ARG/h + 0.1 per referral" position="top">
                      <span className="label-meta cursor-help hover:text-zinc-300 transition-colors">Rate: {currentHourlyRate.toFixed(2)} ARG/h</span>
                    </Tooltip>
                    <span className="label-meta">{isSessionComplete ? 'Session Complete ✓' : `T-minus: ${formatCountdown(miningTimer)}`}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="w-full md:w-52 shrink-0">
                {user.miningActive ? (
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className={`w-full h-14 btn-silk ${isSessionComplete ? 'btn-silk' : 'btn-ghost'} text-[10px]`}
                  >
                    {isClaiming ? 'Claiming...' : isSessionComplete ? '⚡ Secure Block' : 'Terminate & Claim'}
                  </button>
                ) : (
                  <button onClick={handleStartMining} className="w-full h-14 btn-silk-inv text-[10px]">
                    Initialize Node
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-5">

          {/* SYSTEM LOG — macOS Style */}
          <div className="rounded-2xl border border-white/[0.05] bg-black/80 backdrop-blur-2xl flex flex-col h-[292px] md:h-[340px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/terminal">
            <div className="px-4 py-3 border-b border-white/[0.03] flex items-center justify-between bg-zinc-900/40 relative">
              <div className="flex gap-1.5 group/controls">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
              </div>
              <span className="absolute left-1/2 -translate-x-1/2 label-meta flex items-center gap-2 text-zinc-500 opacity-60 text-[8px] font-bold tracking-widest uppercase">
                <Terminal className="w-2.5 h-2.5 text-maroon/70" /> argus_kernel — 80×24
              </span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 animate-pulse" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2 font-mono text-[9px] bg-black/40 relative">
              {/* Terminal scanline effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px]" />

              {[
                { type: 'sys', msg: 'Mounting /ghost_dag volume...', time: '00:00:01' },
                { type: 'ok', msg: `Nodes synchronized: ${activeMinerCount} [OK]`, time: '00:00:02' },
                { type: 'info', msg: `Syncing block: #${blockHeight.toLocaleString()}`, time: '00:00:05' },
                { type: 'warn', msg: 'Mempool state: High consensus load', time: '00:00:12' },
                { type: 'ok', msg: 'Consensus achieved (k=18)', time: '00:00:15' },
                { type: 'info', msg: `Network TPS: ${tps.toLocaleString()}`, time: '00:00:20' },
                user.miningActive ? { type: 'ok', msg: `Mining: +${ratePerSecond.toFixed(6)} ARG/s`, time: 'NOW' } : null,
              ].filter(Boolean).map((log: any, i) => (
                <div key={`${log.time}-${i}`} className="flex gap-3 opacity-90 hover:opacity-100 transition-opacity">
                  <span className="text-zinc-600 shrink-0 w-14 text-right">[{log.time}]</span>
                  <span className={`${log.type === 'ok' ? 'text-white font-bold' : log.type === 'warn' ? 'text-maroon' : log.type === 'sys' ? 'text-maroon font-bold' : 'text-zinc-300'}`}>
                    {log.msg}
                  </span>
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <span className="text-zinc-600 shrink-0 w-14 text-right">[{new Date().toLocaleTimeString('en-GB', { hour12: false })}]</span>
                <div className="text-maroon animate-pulse font-black flex items-center">
                  <span className="mr-2">➜</span>
                  <span className="w-1.5 h-3 bg-maroon ml-1"></span>
                </div>
              </div>
            </div>
          </div>

          {/* CORE CAPABILITIES — Elevated Visual Polish */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Security', value: 'RSA-4096-AES', icon: Shield, tooltip: 'End-to-end encrypted packet transmission with rotating keys.' },
              { label: 'Referrals', value: `${referrals}/${MAX_REFERRALS} ACTIVE`, icon: TrendingUp, tooltip: 'Network growth contribution and active referral count.' },
              { label: 'Node Version', value: 'PROTOCOL_v2.4', icon: Cpu, tooltip: 'Current operational kernel version of the Argus client.' },
              { label: 'Tasks Done', value: `${user.completedTasks?.length || 0} COMPLETE`, icon: Clock, tooltip: 'Total network verification and social tasks completed.' }
            ].map((cap, i) => (
              <div key={cap.label} className="group relative transition-all duration-500 hover:-translate-y-1">
                <div className="frosted-glass border border-white/5 p-4 rounded-3xl bg-zinc-950/90 relative overflow-hidden h-full">
                  {/* Subtle refractive highlight */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-zinc-900/50 rounded-xl border border-white/5 group-hover:border-maroon/30 transition-colors duration-500">
                      <cap.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-maroon transition-colors" />
                    </div>
                    <Tooltip text={cap.tooltip} position="top">
                      <Info className="w-3 h-3 text-zinc-800 hover:text-maroon transition-colors cursor-help" />
                    </Tooltip>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{cap.label}</p>
                    <p className="text-[10px] font-mono font-black text-white group-hover:text-maroon transition-colors duration-500 truncate">{cap.value}</p>
                  </div>

                  {/* Glass shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {/* PROTOCOL ADVISORY */}
          <div className="rounded-xl border border-amber-900/25 bg-amber-950/10 p-4 flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 text-maroon shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-maroon uppercase tracking-widest mb-1">Protocol Advisory</p>
              <p className="text-[9px] text-zinc-500 leading-relaxed font-mono">
                Verification blocks require absolute consensus. Maintain continuous connectivity to optimize GhostDAG performance.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
