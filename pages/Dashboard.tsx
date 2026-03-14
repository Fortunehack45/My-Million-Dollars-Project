
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
  MAX_REFERRALS,
  db,
} from '../services/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import {
  Database, Activity, Cpu, Zap,
  AlertTriangle, GitMerge, Layers,
  Server, Terminal, Globe, Info,
  TrendingUp, Shield, Clock, Radio, ChevronRight, Box, Share2
} from 'lucide-react';
import { NetworkStats } from '../types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Tooltip } from '../components/Tooltip';
import Skeleton from '../components/Skeleton';
import { useTokenPrices } from '../services/TokenPriceService';
import { ArgusLogo } from '../components/ArgusLogo';
import { AnimatedNumber } from '../components/AnimatedNumber';
import MatrixBackground from '../components/MatrixBackground';

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

const DashboardSkeleton = () => (
  <div className="w-full space-y-6 pb-20 pt-32 px-6">
    <div className="skeleton h-24 w-full rounded-xl mb-8" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton h-32 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
      <div className="lg:col-span-8 skeleton h-[400px] rounded-xl" />
      <div className="lg:col-span-4 space-y-6">
        <div className="skeleton h-[250px] rounded-xl" />
        <div className="skeleton h-[134px] rounded-xl" />
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
        // Prevent unnecessary repaints by only resizing if strictly necessary
        if (canvas.width !== containerRef.current.clientWidth || canvas.height !== containerRef.current.clientHeight) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
      }
    };

    // Use highly performant ResizeObserver instead of raw window resize events
    const resizeObserver = new ResizeObserver(() => {
        // requestAnimationFrame debounces the observer's callback to prevent layout thrashing
        requestAnimationFrame(resize);
    });

    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    resize();

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
          ctx.strokeStyle = 'rgba(128, 0, 0, 0.15)';
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

    return () => { 
        if (containerRef.current) resizeObserver.unobserve(containerRef.current);
        resizeObserver.disconnect();
        clearInterval(interval); 
        cancelAnimationFrame(animationFrameId); 
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0"><canvas ref={canvasRef} className="w-full h-full opacity-60" /></div>;
};

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
  const [minedArg, setMinedArg] = useState<number | null>(null);
  const { arg } = useTokenPrices();

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
    const unsubMiners = subscribeToActiveMinerCount(setActiveMinerCount);
    const unsubPresence = subscribeToOnlineUsers((uids) => {
      const count = Math.max(1, uids.length);
      setHashrate(402.1 + count * 0.05);
    });
    return () => { unsubStats(); unsubMiners(); unsubPresence(); };
  }, []);

  useEffect(() => {
    if (!user?.uid || !user?.points) return;
    const argAddress = ArgusSynapseService.generateAddress(user.uid);
    const q = query(collection(db, 'wallet_transactions'), where('participants', 'array-contains', argAddress));
    const unsub = onSnapshot(q, snapshot => {
      let totalReceived = 0, totalSent = 0;
      snapshot.docs.forEach(d => {
        const tx = d.data();
        if (tx.chain !== 'ARG') return;
        const amt = parseFloat(tx.amount) || 0;
        if (tx.from === argAddress) totalSent += amt + (tx.gasFee || 0);
        else totalReceived += amt;
      });
      setMinedArg(Math.max(0, user.points - Math.max(0, totalReceived - totalSent)));
    });
    return () => unsub();
  }, [user?.uid, user?.points]);

  useEffect(() => {
    const update = () => {
      setBlockHeight(calculateCurrentBlockHeight());
      setTps(Math.floor(402000 + Math.sin(Date.now() / 2000) * 15000));
    };
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
      setPendingPoints(0); setMiningTimer(0);
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
    <div className="relative pt-32 pb-40 min-h-screen bg-[#050505] text-zinc-300 font-mono selection:bg-maroon selection:text-white">
      
      {/* DASHBOARD SYSTEM OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <MatrixBackground color="rgba(128, 0, 0, 0.05)" opacity={0.15} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(128,0,0,0.06),rgba(128,0,0,0.02),rgba(128,0,0,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-[1700px] mx-auto px-6 relative z-10"
      >
        
        {/* TOP BAR: NETWORK OPERATIONS (Standardized) */}
        <motion.div variants={itemAnim} className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-zinc-950/80 border border-white/[0.05] p-6 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-maroon/10 rounded-lg flex items-center justify-center border border-maroon/20">
              <Radio className="w-6 h-6 text-maroon animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2 italic">Network Operations</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">System Operational — {activeMinerCount.toLocaleString()} Verified Nodes</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-12 text-right">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none">Hashrate_Throughput</p>
              <p className="text-xl font-black text-white">{hashrate.toFixed(1)} <span className="text-xs text-zinc-600">PH/s</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none">Protocol_Block_Height</p>
              <p className="text-xl font-black text-maroon">#{blockHeight.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* CORE METRICS GRID (Standardized) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Mined ARG", value: minedArg !== null ? minedArg : 0, unit: "ARG", sub: minedArg !== null ? `≈ $${(minedArg * arg.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : 'Syncing_Balance...', icon: ArgusLogo, color: "text-white" },
            { label: "Unmined Supply", value: fmt(leftToMine), sub: `Cap: ${fmt(TOTAL_SUPPLY)} ARG`, icon: Layers, color: "text-white" },
            { label: "Network TPS", value: fmt(tps), sub: "Finality: < 400ms", icon: Zap, color: "text-white" },
            { label: "Active Nodes", value: fmt(activeMinerCount), sub: `Synchronization: Optimal`, icon: Share2, color: "text-white" }
          ].map((m, i) => (
            <motion.div key={i} variants={itemAnim} className="bg-zinc-950/50 border border-white/[0.05] p-6 rounded-xl hover:border-maroon/30 transition-all duration-500 group relative overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/[0.05] group-hover:bg-maroon/10 transition-colors">
                     <m.icon className="w-5 h-5 text-zinc-500 group-hover:text-maroon transition-colors" />
                  </div>
                  {i === 2 && <span className="text-[10px] text-emerald-500 font-black px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">Stable</span>}
                  {i === 0 && <span className="text-[10px] text-emerald-500 font-black">+{arg.change24h}%</span>}
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{m.label}</p>
                  <div className="flex items-baseline gap-2">
                     <span className={`text-3xl font-black ${m.color} tabular-nums tracking-tighter`}>{typeof m.value === 'number' ? <AnimatedNumber value={m.value} decimals={i === 0 ? 2 : 0} /> : m.value}</span>
                     {m.unit && <span className="text-xs font-black text-zinc-500">{m.unit}</span>}
                  </div>
                  {m.sub && <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-wider">{m.sub}</p>}
               </div>
            </motion.div>
          ))}
        </div>

        {/* MIDDLE SECTION: TOPOLOGY & CONTROLLER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Topology Panel (Standardized) */}
          <motion.div variants={itemAnim} className="lg:col-span-8 bg-zinc-950/50 border border-white/[0.05] rounded-xl relative overflow-hidden group">
            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between bg-black/40 backdrop-blur-sm relative z-20">
              <div className="flex items-center gap-3">
                <GitMerge className="w-4 h-4 text-maroon animate-pulse" />
                <span className="text-xs font-black uppercase text-white tracking-widest italic">GhostDAG_Topology_Live</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Nodes</span>
                 </div>
                 <div className="flex items-center gap-1.5 opacity-40 mr-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-maroon" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Blocks</span>
                 </div>
                 <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Latency: 12ms</span>
              </div>
            </div>
            <div className="relative h-[420px] bg-black/20">
               <GhostDAGVisualizer />
               <div className="absolute inset-x-0 bottom-0 p-8 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent">
                  <div className="grid grid-cols-3 gap-8">
                     <div className="space-y-1">
                        <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Global_Consensus</p>
                        <p className="text-xl font-black text-white">99.98%</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Synapse_Integrity</p>
                        <p className="text-xl font-black text-emerald-500">TRUSTED</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Active_Kernel</p>
                        <p className="text-xl font-black text-white">SHA-256G</p>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Controller/Kernel Log Panel (Standardized) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* System Kernel Log */}
            <motion.div variants={itemAnim} className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl flex-1 flex flex-col group overflow-hidden">
               <div className="p-5 border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Terminal className="w-4 h-4 text-maroon" />
                     <span className="text-xs font-black uppercase text-white tracking-widest italic">System_Kernel</span>
                  </div>
                  <div className="flex gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-maroon shadow-[0_0_8px_#800000] animate-pulse"></div>
                  </div>
               </div>
               <div className="flex-1 p-6 space-y-3 font-mono text-[9px] overflow-y-auto max-h-[280px] custom-scrollbar bg-black/40">
                  {[
                    { type: 'sys', msg: 'Kernel initialization sequence...', time: '00:00:01' },
                    { type: 'ok', msg: `Miners synced: ${activeMinerCount} [OK]`, time: '00:00:02' },
                    { type: 'info', msg: `Tracking block: #${blockHeight.toLocaleString()}`, time: '00:00:05' },
                    { type: 'warn', msg: 'Mempool weight: High load transition', time: '00:00:12' },
                    { type: 'ok', msg: 'Consensus achieved (k=18)', time: '00:00:15' },
                    user.miningActive ? { type: 'ok', msg: `Yield: +${ratePerSecond.toFixed(6)} ARG/s`, time: 'LIVE' } : null,
                  ].filter(Boolean).map((log: any, i) => (
                    <div key={i} className="flex gap-4 opacity-80 hover:opacity-100 transition-opacity">
                      <span className="text-zinc-700 shrink-0">[{log.time}]</span>
                      <span className={`${log.type === 'ok' ? 'text-white' : log.type === 'warn' ? 'text-maroon' : 'text-zinc-500'}`}>{log.msg}</span>
                    </div>
                  ))}
                  <div className="flex gap-4 animate-pulse">
                     <span className="text-zinc-700">[{new Date().toLocaleTimeString('en-GB', { hour12: false })}]</span>
                     <span className="text-maroon font-black">➜ STANDBY_KERNEL_WAIT</span>
                  </div>
               </div>
            </motion.div>

            {/* Mining Status Quick Panel */}
            <motion.div variants={itemAnim} className="bg-zinc-950/50 border border-white/[0.05] rounded-xl p-6 relative overflow-hidden group">
               <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                     <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none">Yield_Session</p>
                     <p className="text-2xl font-black text-white tabular-nums tracking-tighter italic">
                        <AnimatedNumber value={pendingPoints} decimals={4} /> <span className="text-xs text-zinc-600">ARG</span>
                     </p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${user.miningActive ? 'bg-maroon/10 border-maroon/20' : 'bg-zinc-900 border-white/[0.05]'}`}>
                     <Radio className={`w-4 h-4 ${user.miningActive ? 'text-maroon animate-pulse' : 'text-zinc-700'}`} />
                  </div>
               </div>
               <div className="space-y-2 mb-6">
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.03]">
                     <div className={`h-full bg-maroon transition-all duration-1000 shadow-[0_0_8px_#800000]`} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-black uppercase text-zinc-600 tracking-widest">
                     <span>Time: {formatCountdown(miningTimer)}</span>
                     <span className="text-maroon">{isSessionComplete ? 'COMPLETE' : 'ACTIVE_SYNC'}</span>
                  </div>
               </div>
               <button 
                  onClick={user.miningActive ? handleClaim : handleStartMining}
                  disabled={isClaiming}
                  className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 shadow-2xl relative overflow-hidden group/btn disabled:pointer-events-none disabled:hover:translate-y-0 ${
                     user.miningActive 
                        ? (isSessionComplete 
                           ? 'bg-emerald-500 text-white hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]' 
                           : 'bg-zinc-900 border border-white/[0.05] text-white hover:border-maroon/40') 
                        : 'bg-maroon text-white hover:brightness-110 shadow-[0_10px_30px_-10px_rgba(128,0,0,0.5)]'
                  }`}
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
                  <span className="relative z-10 italic">
                     {isClaiming 
                        ? 'PROCESSING_TRANSACTION...' 
                        : user.miningActive 
                           ? (isSessionComplete ? 'SECURE_BLOCK_CLAIM' : 'TERMINATE_CLAIM') 
                           : 'INITIALIZE_KERNEL'}
                  </span>
               </button>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM SECTION: OPERATIONAL MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Security_Level', value: 'RSA-4096-AES', icon: Shield, extra: 'ACTIVE_GUARD' },
              { label: 'Referral_Bridge', value: `${referrals}/${MAX_REFERRALS} PEERS`, icon: TrendingUp, extra: `+${(referrals * REFERRAL_BOOST).toFixed(2)}/HR` },
              { label: 'Protocol_Version', value: 'v2.8_PRODUCTION', icon: Cpu, extra: 'LATEST' },
              { label: 'Cloud_Sovereignty', value: 'GLOBAL_MESH', icon: Globe, extra: 'CONNECTED' }
            ].map((cap, i) => (
              <motion.div key={cap.label} variants={itemAnim} className="p-6 bg-zinc-950/50 border border-white/[0.05] rounded-xl hover:bg-zinc-900/40 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/[0.05] group-hover:bg-maroon/10 transition-colors">
                    <cap.icon className="w-4 h-4 text-zinc-600 group-hover:text-maroon transition-colors" />
                  </div>
                  <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">{cap.extra}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">{cap.label}</p>
                  <p className="text-sm font-black text-white group-hover:text-maroon transition-colors tracking-tight">{cap.value}</p>
                </div>
              </motion.div>
            ))}
        </div>

        {/* PROTOCOL ADVISORY PANEL */}
        <motion.div variants={itemAnim} className="mt-8 rounded-xl border border-maroon/10 bg-maroon/5 p-5 flex gap-4 items-center">
          <AlertTriangle className="w-5 h-5 text-maroon animate-pulse" />
          <div className="flex-1">
            <p className="text-[10px] font-black text-maroon uppercase tracking-[0.2em] mb-1 italic leading-none">Institutional Protocol Advisory</p>
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider leading-relaxed">
               Argus GhostDAG requires contiguous node alignment. All session data is cryptographically hashed via the local synapse bridge before claiming.
            </p>
          </div>
          <div className="hidden md:flex gap-4">
             <button className="text-[8px] font-black border border-white/[0.05] px-3 py-1.5 rounded uppercase tracking-widest hover:bg-white hover:text-black transition-all">Doc_01</button>
             <button className="text-[8px] font-black border border-white/[0.05] px-3 py-1.5 rounded uppercase tracking-widest hover:bg-white hover:text-black transition-all">Doc_02</button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
