

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
import Layout from '../components/Layout';
import MatrixBackground from '../components/MatrixBackground';

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

// Professional Stat Card - Institutional Argus Onyx
const StatCard = ({ label, value, subValue, icon: Icon, trend, trendUp, tooltip }: any) => (
  <div className="silk-panel p-1 rounded-[2.5rem] group hover:-translate-y-1 transition-all duration-700 relative overflow-hidden h-full">
    <div className="bg-zinc-950 h-full rounded-[2.4rem] p-8 flex flex-col justify-between border border-white/[0.02] group-hover:border-maroon/20 transition-all duration-700 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="flex justify-between items-start mb-10">
        <div className="w-14 h-14 bg-zinc-900/50 rounded-2xl border border-white/5 flex items-center justify-center group-hover:bg-maroon transition-all duration-700 shadow-2xl">
          <Icon className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors duration-700" />
        </div>
        {trend && (
          <div className={`px-4 py-1.5 rounded-full border text-[10px] font-mono font-black tracking-widest ${trendUp !== false ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-zinc-500 bg-zinc-800/50 border-white/5'}`}>
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono">{label}</p>
          <Tooltip text={tooltip} position="top">
            <Info className="w-3.5 h-3.5 text-zinc-800 hover:text-maroon cursor-help transition-colors" />
          </Tooltip>
        </div>
        <div className="space-y-1.5">
          <p className="text-3xl md:text-4xl font-black text-white tracking-tighter group-hover:text-maroon transition-colors duration-700 leading-none">{value}</p>
          {subValue && <p className="text-[11px] text-zinc-600 font-mono font-black uppercase tracking-widest">{subValue}</p>}
        </div>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
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
    <Layout>
      <div className="relative flex flex-col p-4 md:p-8 overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-900 shadow-2xl">
        {/* Matrix Rain Background */}
        <MatrixBackground color="rgba(185, 28, 28, 0.12)" opacity={0.45} />

        {/* Global Terminal Scanning Line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.015] to-transparent -translate-y-full animate-scanline pointer-events-none z-10"></div>

        <div className="relative z-10 w-full space-y-12 pb-24">

          {/* HEADER - Institutional Operations Interface */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-zinc-900/50 relative overflow-hidden">
            <div className="absolute -left-20 top-0 w-64 h-64 bg-maroon/[0.05] blur-[100px] rounded-full pointer-events-none" />
            <div className="flex items-start gap-8 relative z-10">
              <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 flex items-center justify-center rounded-[1.5rem] shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Activity className="w-8 h-8 text-maroon animate-pulse" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Argus Protocol</h1>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest leading-none font-bold">Consensus: Operational</p>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-zinc-800" />
                  <p className="text-[11px] font-mono text-maroon font-black uppercase tracking-widest leading-none italic animate-pulse-gentle">
                    Node_Trust_Score: 99.8%
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-10 relative z-10 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Global_Throughput</p>
                <p className="text-2xl font-mono font-black text-white">{hashrate.toFixed(1)} <span className="text-maroon text-xs">PH/s</span></p>
              </div>
              <div className="h-10 w-px bg-zinc-900" />
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Current_Epoch_H</p>
                <p className="text-2xl font-mono font-black text-white tracking-widest">#{blockHeight.toLocaleString()}</p>
              </div>
            </div>
          </header>

          {/* STATS GRID - Premium Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
            <div className="md:col-span-2 lg:col-span-4 h-full">
              <StatCard
                label="Node Balance"
                value={`${user.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARG`}
                subValue={`≈ $${(user.points * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`}
                icon={Database}
                trend="+2.4%"
                trendUp={true}
                tooltip="Total accumulated ARG credits and their current USD market valuation."
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 h-full">
              <StatCard label="Validators" value={activeMinerCount.toLocaleString()} subValue="Health: 99.99%" icon={Shield} tooltip="Verified nodes currently participating in consensus and security." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 h-full">
              <StatCard label="Network Load" value={`${tps.toLocaleString()} TPS`} subValue="Latency: 382ms" icon={Zap} trend="Optimal" trendUp={null} tooltip="Real-time transaction processing volume across the GhostDAG topology." />
            </div>
            <div className="md:col-span-2 lg:col-span-2 h-full">
              <div className="silk-panel p-1 rounded-[2.5rem] bg-zinc-950/20 h-full border border-maroon/20 hover:bg-maroon/5 transition-all duration-700 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-10 h-10 bg-maroon/10 rounded-xl flex items-center justify-center border border-maroon/20">
                  <Globe className="w-5 h-5 text-maroon animate-spin-slow" />
                </div>
                <p className="text-[9px] font-black text-maroon uppercase tracking-widest font-mono italic">Primary_Shard</p>
                <p className="text-xl font-black text-white">EU_WEST_1</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-8">

              {/* GHOSTDAG VISUALIZER - Institutional Frame */}
              <div className="h-[400px] md:h-[460px] rounded-[3rem] silk-panel relative overflow-hidden flex flex-col bg-zinc-950 p-1.5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                <div className="bg-zinc-950 h-full rounded-[2.9rem] relative overflow-hidden flex flex-col border border-white/[0.02]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.03),transparent_80%)]" />
                  <div className="relative z-10 px-10 py-8 border-b border-white/[0.03] flex justify-between items-center bg-black/40 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-maroon/10 rounded-lg">
                        <GitMerge className="w-4 h-4 text-maroon animate-pulse" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] font-mono">Consensus_Topological_Graph</span>
                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest font-black">Cluster_Alpha_v4 // SECURE_SYNC</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">Honest_Set</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-maroon shadow-[0_0_10px_#800000]" />
                        <span className="text-[9px] font-black font-mono text-zinc-500 uppercase tracking-widest">Outlier_Set</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex-1 w-full overflow-hidden">
                    <GhostDAGVisualizer />
                  </div>
                </div>
              </div>

              {/* MINING CONTROLLER - Terminal Interface */}
              <div className="rounded-[3rem] silk-panel bg-zinc-950 p-1.5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative group">
                <div className="bg-zinc-950 h-full rounded-[2.9rem] p-10 md:p-14 border border-zinc-900 group-hover:border-maroon/20 transition-all duration-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.03] to-transparent opacity-50 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>

                  <div className="flex flex-col xl:flex-row gap-12 items-start xl:items-center relative z-10">
                    <div className="flex-1 w-full space-y-8">
                      <div className="flex items-start justify-between border-b border-white/[0.03] pb-8">
                        <div className="space-y-3">
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Consensus Engine</h3>
                          <div className="flex items-center gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${user.miningActive ? 'bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse' : 'bg-amber-500 shadow-[0_0_15px_#f59e0b]'}`} />
                            <span className="text-[11px] font-black font-mono text-zinc-500 uppercase tracking-[0.3em] italic">{user.miningActive ? 'Status: BLOCK_PRODUCTION_ACTIVE' : 'Status: LOCAL_DAEMON_IDLE'}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono">Accumulated_Credit_Pending</p>
                          <div className="flex flex-col items-end">
                            <p className="text-4xl md:text-6xl font-black text-white tracking-tighter tabular-nums leading-none">
                              {pendingPoints.toFixed(4)} <span className="text-lg md:text-xl text-zinc-700 ml-1">ARG</span>
                            </p>
                            <p className="text-xs font-mono text-emerald-500/60 font-black uppercase tracking-widest mt-2 bg-emerald-500/5 px-4 py-1.5 rounded-full border border-emerald-500/10">
                              Value: ${(pendingPoints * 0.5).toFixed(4)} USD
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end mb-2">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest font-mono">Session_Progress_Matrix</p>
                            <p className="text-sm font-black text-white uppercase tracking-tight italic">
                              {isSessionComplete ? 'PROTOCOL_HARD_CAP_REACHED' : 'Syncing_Topology_Continuum...'}
                            </p>
                          </div>
                          <span className="text-[11px] font-black font-mono text-maroon uppercase tracking-[0.3em]">{isSessionComplete ? 'DONE' : formatCountdown(miningTimer)}</span>
                        </div>
                        <div className="h-4 bg-zinc-900/50 rounded-full overflow-hidden border border-white/[0.02] p-1 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${isSessionComplete ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-maroon shadow-[0_0_20px_rgba(185,28,28,0.4)]'}`}
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                          </div>
                        </div>
                        <div className="flex justify-between pt-2">
                          <Tooltip text="Variable epoch rate based on network hash weight and referral vectors." position="top">
                            <div className="pk-badge bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-maroon transition-colors cursor-help group/rate">
                              <span className="text-[9px] uppercase tracking-widest font-black">Coefficient:</span>
                              <span className="text-[9px] font-mono font-black text-white ml-2 group-hover/rate:text-maroon">{(currentHourlyRate / 3600).toFixed(8)} ARG/s</span>
                            </div>
                          </Tooltip>
                          <div className="flex gap-2">
                            <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest font-mono italic">REF: GEN_v2_DAEMON</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full xl:w-64 shrink-0 flex flex-col gap-5">
                      {user.miningActive ? (
                        <button
                          onClick={handleClaim}
                          disabled={isClaiming}
                          className={`w-full h-24 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-700 flex flex-col items-center justify-center gap-3 relative overflow-hidden group/btn ${isSessionComplete ? 'bg-white text-black hover:bg-maroon hover:text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-maroon/40 hover:text-maroon'}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1000ms] ease-out-expo pointer-events-none" />
                          <span className="relative z-10">{isClaiming ? 'Processing_Claim...' : isSessionComplete ? '⚡ Finalize_Block' : 'SIGTERM & CLAIM'}</span>
                          <div className="h-px w-8 bg-current opacity-20" />
                          <span className="text-[9px] font-mono opacity-50 italic">REF_ID: CLAIM_TX</span>
                        </button>
                      ) : (
                        <button onClick={handleStartMining} className="w-full h-24 bg-maroon text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(185,28,28,0.4)] relative overflow-hidden group/btn">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
                          <span className="relative z-10">INITIALIZE_NODE</span>
                        </button>
                      )}
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center gap-3 group-hover:border-maroon/20 transition-all">
                        <Clock className="w-4 h-4 text-zinc-700 group-hover:text-maroon transition-colors" />
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest font-mono">System_Uptime: 99.99%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-8">

              {/* SYSTEM LOG - Terminal Aesthetics */}
              <div className="rounded-[2.5rem] silk-panel bg-zinc-950 flex flex-col h-[320px] md:h-[400px] overflow-hidden p-1.5 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)]">
                <div className="bg-zinc-950 h-full rounded-[2.35rem] overflow-hidden flex flex-col border border-white/[0.03]">
                  <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between bg-black/40 backdrop-blur-md">
                    <span className="text-[10px] font-black flex items-center gap-3 text-zinc-400 uppercase tracking-[0.3em] font-mono">
                      <Terminal className="w-4 h-4 text-maroon" /> Session_Telemetry_v2
                    </span>
                    <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 animate-pulse delay-150" />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 font-mono text-[10px] bg-black/50">
                    {[
                      { type: 'sys', msg: 'DAEMON_INIT: Booting Argus Core...', time: '04:21:01' },
                      { type: 'ok', msg: `PEER_SYNC: ${activeMinerCount} valid nodes verified`, time: '04:21:05' },
                      { type: 'info', msg: `DAG_TOPOLOGY: Block_Parity established at #${blockHeight.toLocaleString()}`, time: '04:21:08' },
                      { type: 'ok', msg: `HASH_WORK: Nonce found (Target: 00000x...)`, time: '04:22:12' },
                      { type: 'sys', msg: `ENTROPY_POOL: State transition validated`, time: '04:22:15' },
                      user.miningActive ? { type: 'ok', msg: `PARALLEL_MINING: [THREAD_0-7] Executing work...`, time: 'LIVE' } : null,
                      user.miningActive ? { type: 'info', msg: `CREDIT_FLOW: +${ratePerSecond.toFixed(8)} ARG/s`, time: 'LIVE' } : null,
                    ].filter(Boolean).map((log: any, i) => (
                      <div key={i} className="flex gap-4 border-l-2 border-white/5 pl-4 hover:border-maroon/40 transition-colors py-1 group/log">
                        <span className="text-zinc-700 shrink-0 font-bold group-hover/log:text-zinc-500 transition-colors">{log.time}</span>
                        <span className={`${log.type === 'ok' ? 'text-emerald-500' : log.type === 'warn' ? 'text-maroon font-black underline' : log.type === 'sys' ? 'text-white' : 'text-zinc-500'} tracking-tight`}>
                          {log.msg}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 text-maroon mt-6 px-4 py-2 bg-maroon/5 border border-maroon/10 rounded-lg">
                      <span className="animate-pulse">▌</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] font-mono">Awaiting_Consensus_Handshake</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NODE STATS MINI CARDS - Refined Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Security_Core', val: 'RSA-4096-AES', icon: Shield },
                  { label: 'Referral_Vector', val: `${referrals}/${MAX_REFERRALS}_Nodes`, icon: TrendingUp },
                  { label: 'Firmware_Ref', val: 'Node_Argon_v2.4', icon: Cpu },
                  { label: 'Archival_H', val: `${user.completedTasks?.length || 0}_Ledgers`, icon: Clock },
                ].map((item, i) => (
                  <div key={i} className="rounded-3xl silk-panel bg-zinc-950 p-6 space-y-4 group hover:border-maroon/20 hover:scale-[1.02] transition-all duration-500 shadow-xl border border-white/[0.02]">
                    <item.icon className="w-5 h-5 text-zinc-800 group-hover:text-maroon transition-all duration-700 transform group-hover:rotate-12" />
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest font-mono italic">{item.label}</p>
                      <p className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-tighter transition-colors group-hover:text-white">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PROTOCOL ADVISORY - High Fidelity Alert */}
              <div className="rounded-3xl silk-panel bg-maroon/5 p-6 border border-maroon/20 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-maroon animate-pulse opacity-[0.03] pointer-events-none" />
                <div className="flex gap-5 items-start relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-maroon/10 flex items-center justify-center border border-maroon/20 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-maroon" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-maroon uppercase tracking-[0.3em] font-mono italic">Protocol_Continuum_Alert</p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-mono font-bold uppercase tracking-tight group-hover:text-zinc-400 transition-colors">
                      Red-set outlier blocks do not yield parity credits. Continuous topological sync is required to scale mining vectors.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
