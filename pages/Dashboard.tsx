

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
    let nodes: Array<{ x: number, y: number, vx: number, vy: number, id: number, type: 'blue' | 'red' }> = [];
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
      nodes.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, id: nextId++, type: 'blue' });
    }

    const addNode = () => {
      if (nodes.length > 40) {
        nodes.shift();
        const activeIds = new Set(nodes.map(n => n.id));
        links = links.filter(l => activeIds.has(l.source) && activeIds.has(l.target));
      }
      const newNode = { x: canvas.width + 10, y: Math.random() * canvas.height, vx: -0.9 - Math.random(), vy: (Math.random() - 0.5) * 0.3, id: nextId++, type: Math.random() > 0.88 ? 'red' : 'blue' as any };
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
        ctx.fillStyle = node.type === 'blue' ? '#10b981' : '#800000';
        ctx.fill();
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
  <div className="bg-zinc-950 p-6 flex flex-col justify-between h-full group hover:bg-zinc-900/40 transition-all duration-500 border-r border-b border-zinc-900 last:border-r-0 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-maroon/0 to-maroon/0 group-hover:from-maroon/[0.03] group-hover:to-transparent transition-all duration-700 pointer-events-none" />
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 group-hover:border-maroon/20 group-hover:bg-zinc-900/80 transition-all duration-500">
        <Icon className="w-4 h-4 text-zinc-500 group-hover:text-maroon transition-all duration-500" />
      </div>
      {trend && (
        <span className={`text-[9px] font-mono font-black px-2 py-1 rounded-md border ${trendUp !== false ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-zinc-500 bg-zinc-800 border-zinc-700'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <p className="label-meta">{label}</p>
        <Tooltip text={tooltip} position="right">
          <Info className="w-3 h-3 text-zinc-700 hover:text-zinc-400 cursor-help transition-colors" />
        </Tooltip>
      </div>
      <p className="text-2xl font-mono font-black text-white tracking-tight group-hover:text-maroon/90 transition-all duration-500">{value}</p>
      {subValue && <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">{subValue}</p>}
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
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Operational · <span className="text-emerald-500/80">{activeMinerCount.toLocaleString()}</span> Active Miners</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-zinc-900 overflow-hidden rounded-2xl">
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
          <div className="h-[340px] md:h-[380px] rounded-2xl border border-zinc-900 relative overflow-hidden flex flex-col bg-zinc-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(24,24,27,0.2),rgba(3,3,5,1)_80%)]" />
            <div className="relative z-10 px-5 py-3.5 border-b border-white/[0.04] flex justify-between items-center bg-zinc-950/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <GitMerge className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span className="label-meta text-zinc-400">GhostDAG_Topology · Live</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-mono text-zinc-600">Blue Block</span>
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
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-maroon/[0.04] blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
              <div className="flex-1 w-full space-y-5">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">Consensus Engine</h3>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.miningActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-amber-500'}`} />
                      <span className="label-meta">{user.miningActive ? 'RUNNING · SHA-256-GHOST' : 'STANDBY · IDLE'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="label-meta mb-1">Session Yield</p>
                    <p className="text-2xl md:text-3xl font-mono font-black text-white tabular-nums">
                      {pendingPoints.toFixed(4)} <span className="text-xs text-zinc-600">ARG</span>
                    </p>
                    <p className="text-[10px] font-mono text-emerald-500/80 mt-1 uppercase tracking-wider">
                      ≈ ${(pendingPoints * 0.5).toFixed(4)} USD
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isSessionComplete ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-maroon shadow-[0_0_12px_rgba(128,0,0,0.35)]'}`}
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

          {/* SYSTEM LOG */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 flex flex-col h-[292px] md:h-[340px] overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/30">
              <span className="label-meta flex items-center gap-2 text-zinc-400">
                <Terminal className="w-3 h-3" /> System_Kernel
              </span>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 font-mono text-[9px] bg-black/30">
              {[
                { type: 'sys', msg: 'Mounting /ghost_dag volume...', time: '00:00:01' },
                { type: 'ok', msg: `Miners connected: ${activeMinerCount} [OK]`, time: '00:00:02' },
                { type: 'info', msg: `Syncing block: #${blockHeight.toLocaleString()}`, time: '00:00:05' },
                { type: 'warn', msg: 'Mempool pressure: Shard 4 elevated', time: '00:00:12' },
                { type: 'ok', msg: 'Consensus achieved (k=18)', time: '00:00:15' },
                { type: 'info', msg: `Network TPS: ${tps.toLocaleString()}`, time: '00:00:20' },
                user.miningActive ? { type: 'ok', msg: `Mining: +${ratePerSecond.toFixed(6)} ARG/s`, time: 'NOW' } : null,
              ].filter(Boolean).map((log: any, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-zinc-700 shrink-0 w-14 text-right">{log.time}</span>
                  <span className={`${log.type === 'ok' ? 'text-emerald-500' : log.type === 'warn' ? 'text-amber-500' : log.type === 'sys' ? 'text-maroon' : 'text-zinc-400'}`}>
                    {log.msg}
                  </span>
                </div>
              ))}
              <div className="text-maroon animate-pulse font-black">▌</div>
            </div>
          </div>

          {/* NODE STATS MINI CARDS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-2 group hover:border-maroon/20 transition-all duration-500">
              <Shield className="w-4 h-4 text-zinc-700 group-hover:text-maroon transition-colors duration-500" />
              <p className="label-meta text-[8px]">Security</p>
              <p className="text-[9px] font-mono text-zinc-300 font-bold">RSA-4096-AES</p>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-2 group hover:border-maroon/20 transition-all duration-500">
              <TrendingUp className="w-4 h-4 text-zinc-700 group-hover:text-maroon transition-colors duration-500" />
              <p className="label-meta text-[8px]">Referrals</p>
              <p className="text-[9px] font-mono text-zinc-300 font-bold">{referrals}/{MAX_REFERRALS} Active</p>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-2 group hover:border-maroon/20 transition-all duration-500">
              <Cpu className="w-4 h-4 text-zinc-700 group-hover:text-maroon transition-colors duration-500" />
              <p className="label-meta text-[8px]">Node Version</p>
              <p className="text-[9px] font-mono text-zinc-300 font-bold">Node_v2.4</p>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-2 group hover:border-maroon/20 transition-all duration-500">
              <Clock className="w-4 h-4 text-zinc-700 group-hover:text-maroon transition-colors duration-500" />
              <p className="label-meta text-[8px]">Tasks Done</p>
              <p className="text-[9px] font-mono text-zinc-300 font-bold">{user.completedTasks?.length || 0} Complete</p>
            </div>
          </div>

          {/* PROTOCOL ADVISORY */}
          <div className="rounded-xl border border-amber-900/25 bg-amber-950/10 p-4 flex gap-3 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Protocol Advisory</p>
              <p className="text-[9px] text-amber-600/70 leading-relaxed font-mono">
                Red-set blocks do not yield ARG credits. Maintain continuous uptime to minimize GhostDAG orphan rates.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
