
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  startMiningSession,
  claimPoints,
  subscribeToNetworkStats,
  syncReferralStats,
  subscribeToOnlineUsers,
  calculateCurrentBlockHeight,
  TOTAL_SUPPLY,
  BASE_MINING_RATE,
  REFERRAL_BOOST,
  MAX_REFERRALS
} from '../services/firebase';
import {
  Database, Activity, Cpu, Box, Zap,
  AlertTriangle, ArrowUpRight, GitMerge, Layers,
  Server, Terminal, CheckCircle2, Globe, Clock, Wifi, Info
} from 'lucide-react';
import { NetworkStats } from '../types';
import { Tooltip } from '../components/Tooltip';
import Skeleton from '../components/Skeleton';

const DashboardSkeleton = () => (
  <div className="w-full space-y-6 animate-pulse pb-12">
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
      <div className="flex items-center gap-4">
        <Skeleton variant="rect" className="w-12 h-12" />
        <div className="space-y-2">
          <Skeleton variant="rect" className="w-48 h-6" />
          <Skeleton variant="rect" className="w-32 h-3" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Skeleton variant="rect" className="w-24 h-8" />
        <Skeleton variant="rect" className="w-24 h-8" />
      </div>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} variant="rect" className="h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <Skeleton variant="rect" className="h-[300px] mb-6" />
        <Skeleton variant="rect" className="h-[150px]" />
      </div>
      <div className="lg:col-span-4">
        <Skeleton variant="rect" className="h-full min-h-[470px]" />
      </div>
    </div>
  </div>
);

// Enhanced GhostDAG Topology Visualization
const GhostDAGVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let nodes: Array<{ x: number, y: number, vx: number, vy: number, id: number, type: 'blue' | 'red' | 'pending' }> = [];
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

    // Initial seed
    for (let i = 0; i < 5; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        id: nextId++,
        type: 'blue'
      });
    }

    const addNode = () => {
      if (nodes.length > 35) {
        nodes.shift();
        const activeIds = new Set(nodes.map(n => n.id));
        links = links.filter(l => activeIds.has(l.source) && activeIds.has(l.target));
      }

      const newNode = {
        x: canvas.width + 10,
        y: Math.random() * canvas.height,
        vx: -0.8 - Math.random(), // Faster flow for professional look
        vy: (Math.random() - 0.5) * 0.3,
        id: nextId++,
        type: Math.random() > 0.9 ? 'red' : 'blue' // Fewer red blocks
      };

      const targetCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < targetCount; i++) {
        if (nodes.length > 0) {
          const target = nodes[Math.floor(Math.random() * nodes.length)];
          links.push({ source: newNode.id, target: target.id });
        }
      }
      nodes.push(newNode as any);
    };

    const interval = setInterval(addNode, 600); // Higher throughput visualization

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
      });

      ctx.lineWidth = 1;
      links.forEach(link => {
        const s = nodes.find(n => n.id === link.source);
        const t = nodes.find(n => n.id === link.target);
        if (s && t) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
          ctx.strokeStyle = 'rgba(82, 82, 91, 0.4)';
          ctx.stroke();
        }
      });

      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.type === 'red' ? 2.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = node.type === 'blue' ? '#10b981' : '#800000';
        ctx.fill();
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full opacity-50" />
    </div>
  );
};

const StatCard = ({ label, value, subValue, icon: Icon, trend, tooltip }: any) => (
  <div className="bg-zinc-950 border border-zinc-900 p-5 flex flex-col justify-between h-full group hover:border-zinc-800 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-900/50 rounded-lg border border-zinc-800 group-hover:border-zinc-700 transition-colors">
        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white" />
      </div>
      {trend && (
        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          {trend}
        </span>
      )}
    </div>
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <Tooltip text={tooltip} position="right">
          <Info className="w-2.5 h-2.5 text-zinc-700 hover:text-zinc-400 transition-colors cursor-help" />
        </Tooltip>
      </div>
      <p className="text-xl font-mono font-bold text-white tracking-tight">{value}</p>
      {subValue && <p className="text-[10px] text-zinc-600 mt-1 font-medium">{subValue}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, refreshUser, loading } = useAuth();
  const [miningTimer, setMiningTimer] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [livePeers, setLivePeers] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);
  const [tps, setTps] = useState(0);
  const [hashrate, setHashrate] = useState(402.1);

  const MAX_SESSION_TIME = 24 * 60 * 60;

  const referrals = Math.min(user?.referralCount || 0, MAX_REFERRALS);
  const currentHourlyRate = BASE_MINING_RATE + (referrals * REFERRAL_BOOST);
  const ratePerSecond = currentHourlyRate / 3600;

  useEffect(() => {
    if (user) {
      syncReferralStats(user.uid, user.referralCount, user.points)
        .then((updatedData) => {
          if (updatedData) {
            refreshUser({
              ...user,
              referralCount: updatedData.referralCount,
              points: updatedData.points
            });
          }
        });
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsubscribeStats = subscribeToNetworkStats(setStats => setNetStats(setStats));
    const unsubscribePresence = subscribeToOnlineUsers((uids) => {
      const activeCount = Math.max(1, uids.length);
      setLivePeers(activeCount);
      // Dynamic hashrate based on real connected peers
      setHashrate(402.1 + (activeCount * 0.05));
    });
    return () => {
      unsubscribeStats();
      unsubscribePresence();
    };
  }, []);

  useEffect(() => {
    const updateChainMetrics = () => {
      const height = calculateCurrentBlockHeight();
      setBlockHeight(height);
      const baseTps = 402000;
      const fluctuation = Math.sin(Date.now() / 2000) * 15000;
      setTps(Math.floor(baseTps + fluctuation));
    };
    updateChainMetrics();
    const interval = setInterval(updateChainMetrics, 100);
    return () => clearInterval(interval);
  }, []);

  const calculateProgress = useCallback(() => {
    if (!user?.miningActive || !user.miningStartTime) {
      setMiningTimer(0);
      setPendingPoints(0);
      return;
    }
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - user.miningStartTime) / 1000);

    if (elapsedSeconds >= MAX_SESSION_TIME) {
      setMiningTimer(MAX_SESSION_TIME);
      setPendingPoints(MAX_SESSION_TIME * ratePerSecond);
    } else {
      setMiningTimer(elapsedSeconds);
      setPendingPoints(elapsedSeconds * ratePerSecond);
    }
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
    } catch (error) { console.error(error); }
  };

  const handleClaim = async () => {
    if (!user || pendingPoints === 0) return;
    try {
      await claimPoints(user.uid, pendingPoints);
      refreshUser({
        ...user,
        miningActive: false,
        miningStartTime: null,
        points: user.points + pendingPoints
      });
      setPendingPoints(0);
      setMiningTimer(0);
    } catch (error) { console.error(error); }
  };

  const formatTime = (seconds: number) => {
    const remaining = Math.max(0, MAX_SESSION_TIME - seconds);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !user) return <DashboardSkeleton />;

  // Real data calculations
  const leftToMine = Math.max(0, TOTAL_SUPPLY - netStats.totalMined);
  const isSessionComplete = miningTimer >= MAX_SESSION_TIME;

  // Format large numbers cleanly
  const formatLargeNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-12">

      {/* PROFESSIONAL HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <Activity className="w-6 h-6 text-maroon" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-tight leading-none">Network Operations</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Operational • {livePeers.toLocaleString()} Peers</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Hashrate</p>
            <p className="text-sm font-mono font-bold text-white">{hashrate.toFixed(1)} <span className="text-zinc-600">PH/s</span></p>
          </div>
          <div className="h-8 w-px bg-zinc-900"></div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Block Height</p>
            <p className="text-sm font-mono font-bold text-maroon">#{blockHeight.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* PRIMARY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 overflow-hidden">
        <StatCard
          label="Node Balance"
          value={`${user.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARG`}
          icon={Database}
          trend="+2.4%"
          tooltip="Total accumulated credits for this node identity."
        />
        <StatCard
          label="Unmined Supply"
          value={formatLargeNumber(leftToMine)}
          subValue={`Cap: ${formatLargeNumber(TOTAL_SUPPLY)} ARG`}
          icon={Layers}
          tooltip="Remaining ARG pool allocated for Genesis Epoch distribution."
        />
        <StatCard
          label="Network Throughput"
          value={`${tps.toLocaleString()} TPS`}
          subValue="Finality: < 400ms"
          icon={Zap}
          trend="Stable"
          tooltip="Aggregate transaction volume processed per second across global shards."
        />
        <StatCard
          label="Active Validators"
          value={livePeers.toLocaleString()}
          subValue={`Global Shards: ${Math.max(1, Math.floor(livePeers / 50))}`}
          icon={Server}
          tooltip="Current count of verified peer nodes securing the GhostDAG."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: MAIN VISUALIZER & MINING CONTROLLER */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visualizer Panel */}
          <div className="bg-zinc-950 border border-zinc-900 h-[300px] relative overflow-hidden flex flex-col group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.5),rgba(9,9,11,1))]" />

            {/* Overlay Header */}
            <div className="relative z-10 px-4 py-3 border-b border-zinc-900/50 flex justify-between items-center bg-zinc-950/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <GitMerge className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">GhostDAG_Topology_Live</span>
              </div>
              <div className="flex gap-3">
                <span className="text-[9px] font-mono text-zinc-600">LATENCY: 12ms</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative flex-1 w-full overflow-hidden">
              <GhostDAGVisualizer />
            </div>
          </div>

          {/* Mining Controller - Professional Hardware Look */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Consensus Engine</h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className={`w-2 h-2 rounded-full ${user.miningActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    {user.miningActive ? 'RUNNING :: SHA-256-GHOST' : 'STANDBY :: IDLE'}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Session Yield</p>
                  <p className="text-2xl font-mono font-bold text-white">{pendingPoints.toFixed(4)} <span className="text-sm text-zinc-600">ARG</span></p>
                </div>
              </div>

              {/* Progress Bar styled as hardware meter */}
              <div className="h-2 bg-zinc-900 w-full mb-6 relative overflow-hidden">
                <div className="absolute inset-0 flex">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i} className="w-px bg-zinc-950 h-full flex-1"></div>
                  ))}
                </div>
                <div
                  className={`h-full ${isSessionComplete ? 'bg-emerald-500' : 'bg-maroon'} relative z-10 transition-all duration-1000`}
                  style={{ width: `${(miningTimer / MAX_SESSION_TIME) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase">
                <Tooltip text="Composite mining speed calculated as [Base 0.06] + [Referral Boosts]" position="top">
                  <span className="cursor-help hover:text-zinc-300 transition-colors">Rate: {currentHourlyRate.toFixed(2)} ARG/h</span>
                </Tooltip>
                <span>T-Minus: {formatTime(miningTimer)}</span>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0">
              {user.miningActive ? (
                <button
                  onClick={handleClaim}
                  className={`w-full md:w-48 h-14 font-black uppercase tracking-widest text-[10px] border transition-all flex items-center justify-center gap-2 ${isSessionComplete ? 'bg-emerald-500 border-emerald-500 text-black hover:bg-emerald-400' : 'bg-transparent border-zinc-700 text-white hover:border-zinc-500 hover:bg-zinc-900'}`}
                >
                  {isSessionComplete ? 'Secure Block' : 'Terminate & Claim'}
                </button>
              ) : (
                <button
                  onClick={handleStartMining}
                  className="w-full md:w-48 h-14 bg-maroon text-white font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-colors shadow-[0_0_20px_rgba(128,0,0,0.2)]"
                >
                  Initialize Node
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: SYSTEM LOGS & ALERTS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Technical Log Feed */}
          <div className="bg-zinc-950 border border-zinc-900 p-0 flex flex-col h-[300px]">
            <div className="px-4 py-3 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3 h-3" /> System_Kernel
              </h3>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 font-mono text-[9px] bg-black/20">
              {[
                { type: 'sys', msg: 'Mounting volume /ghost_dag...', time: '00:00:01' },
                { type: 'ok', msg: `Peers connected: ${livePeers} [OK]`, time: '00:00:02' },
                { type: 'info', msg: `Syncing height: ${blockHeight}`, time: '00:00:05' },
                { type: 'warn', msg: 'Mempool pressure rising (Shard 4)', time: '00:00:12' },
                { type: 'ok', msg: 'Consensus achieved (k=18)', time: '00:00:15' },
                { type: 'sys', msg: 'Awaiting next cluster...', time: '00:00:18' },
                user.miningActive ? { type: 'ok', msg: 'Mining credits accumulating...', time: 'NOW' } : null
              ].filter(Boolean).map((log: any, i) => (
                <div key={i} className="flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
                  <span className="text-zinc-600 shrink-0">{log.time}</span>
                  <span className={`${log.type === 'ok' ? 'text-emerald-500' : log.type === 'warn' ? 'text-amber-500' : log.type === 'sys' ? 'text-maroon' : 'text-zinc-400'}`}>
                    {log.msg}
                  </span>
                </div>
              ))}
              <div className="animate-pulse text-maroon font-bold">_</div>
            </div>
          </div>

          {/* Network Alert */}
          <div className="border border-amber-900/30 bg-amber-900/10 p-5 flex gap-4 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Protocol Advisory</h4>
              <p className="text-[10px] text-amber-500/70 leading-relaxed font-mono">
                Ensure continuous uptime to prevent GhostDAG orphan rates. Red-set blocks do not yield ARG credits.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
