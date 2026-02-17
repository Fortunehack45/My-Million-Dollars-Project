
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  startMiningSession, 
  claimPoints, 
  subscribeToNetworkStats, 
  syncReferralStats,
  TOTAL_SUPPLY,
  BASE_MINING_RATE,
  REFERRAL_BOOST,
  MAX_REFERRALS
} from '../services/firebase';
import { Clock, Database, Activity, Cpu, ShieldCheck, Box, Zap, AlertTriangle, ArrowUpRight, GitMerge, Share2 } from 'lucide-react';
import { NetworkStats } from '../types';

// GhostDAG Topology Visualization Component
const GhostDAGVisualizer = () => {
  const [blocks, setBlocks] = useState<Array<{id: number, x: number, y: number, color: string, parents: number[]}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial blocks
    const initial = [
      { id: 0, x: 20, y: 50, color: 'text-emerald-500', parents: [] },
      { id: 1, x: 120, y: 30, color: 'text-emerald-500', parents: [0] },
      { id: 2, x: 120, y: 70, color: 'text-emerald-500', parents: [0] }
    ];
    setBlocks(initial);

    const interval = setInterval(() => {
      setBlocks(prev => {
        const lastBlocks = prev.slice(-3);
        const newId = prev.length;
        const x = (prev[prev.length - 1].x + 80);
        const y = 30 + Math.random() * 40;
        const isBlue = Math.random() > 0.15; // 85% Blue Set probability
        
        const newBlock = {
          id: newId,
          x,
          y,
          color: isBlue ? 'text-emerald-500' : 'text-primary',
          parents: lastBlocks.map(b => b.id).filter(() => Math.random() > 0.4)
        };

        const next = [...prev, newBlock];
        return next.length > 15 ? next.slice(1).map(b => ({...b, x: b.x - 80})) : next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-40 relative overflow-hidden bg-zinc-950/50 rounded-2xl border border-zinc-900 mb-6 group">
      <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
        <GitMerge className="w-3 h-3 text-emerald-500" />
        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">GhostDAG_Topology_Stream</span>
      </div>
      <svg className="w-full h-full">
        {/* Render Connections */}
        {blocks.map(block => 
          block.parents.map(parentId => {
            const parent = blocks.find(b => b.id === parentId);
            if (!parent) return null;
            return (
              <line 
                key={`${block.id}-${parentId}`}
                x1={parent.x} y1={parent.y}
                x2={block.x} y2={block.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-zinc-800 transition-all duration-1000"
              />
            );
          })
        )}
        {/* Render Blocks */}
        {blocks.map(block => (
          <g key={block.id} className="transition-all duration-1000" transform={`translate(${block.x},${block.y})`}>
            <circle r="4" className={`${block.color} fill-current shadow-[0_0_10px_currentColor]`} />
            <circle r="8" className={`${block.color} fill-current opacity-10 animate-pulse`} />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 right-4 flex gap-4 text-[7px] font-bold uppercase tracking-widest">
         <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> <span className="text-zinc-500">Blue_Set</span></div>
         <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> <span className="text-zinc-500">Red_Set</span></div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [miningTimer, setMiningTimer] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  
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
    const unsubscribe = subscribeToNetworkStats(setStats => setNetStats(setStats));
    return () => unsubscribe();
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

  if (!user) return null;

  const leftToMine = TOTAL_SUPPLY - netStats.totalMined;
  const miningPercent = (netStats.totalMined / TOTAL_SUPPLY) * 100;
  const isSessionComplete = miningTimer >= MAX_SESSION_TIME;

  return (
    <div className="w-full space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">GhostDAG Node Operational</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Argus_BlockDAG_Interface</h1>
          <p className="text-zinc-500 text-sm font-medium">Validating parallel block clusters. <span className="text-zinc-400">Blue-Set Velocity:</span> <span className="text-primary font-mono font-bold">{currentHourlyRate.toFixed(2)} ARG/hr</span></p>
        </div>
        <div className="text-right flex flex-col items-end gap-3 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
          <p className="label-meta text-[9px] text-zinc-500 font-bold uppercase tracking-widest">DAG Emission Cap</p>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-mono font-black text-white">{(leftToMine / 1000000).toFixed(2)}M <span className="text-zinc-600">UNMINED</span></p>
              <div className="w-40 h-2 bg-zinc-950 mt-2 rounded-full overflow-hidden border border-zinc-800/50">
                <div className="h-full bg-gradient-to-r from-primary to-rose-400 shadow-[0_0_15px_#f43f5e]" style={{ width: `${miningPercent}%` }}></div>
              </div>
            </div>
            <Box className="w-8 h-8 text-zinc-800" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 surface p-10 rounded-3xl flex flex-col min-h-[480px] relative overflow-hidden border-zinc-900 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.03),transparent_70%)]"></div>
          
          <GhostDAGVisualizer />

          {user.miningActive ? (
            <div className="text-center space-y-10 w-full relative z-10 animate-zoom-in mt-auto pb-4">
              <div className="space-y-4">
                <div className="inline-block">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isSessionComplete ? 'text-emerald-500 animate-pulse' : 'text-primary'}`}>
                    {isSessionComplete ? 'TOPOLOGY SEALED' : 'GHOSTDAG_ACCUMULATION_ACTIVE'}
                  </p>
                  <h2 className="text-7xl font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {pendingPoints.toFixed(4)}
                  </h2>
                </div>
                <div className="flex justify-center gap-4">
                   <div className="text-[9px] text-zinc-500 font-mono bg-zinc-950/80 px-4 py-1.5 rounded-full border border-zinc-900">
                      BLUE_SCORE: <span className="text-emerald-500">+{Math.floor(miningTimer/10)}</span>
                   </div>
                   <div className="text-[9px] text-zinc-500 font-mono bg-zinc-950/80 px-4 py-1.5 rounded-full border border-zinc-900">
                      K_PARAMETER: <span className="text-primary">18</span>
                   </div>
                </div>
              </div>
              
              <div className="w-full max-w-xs mx-auto space-y-4">
                <button 
                  onClick={handleClaim} 
                  className={`w-full py-5 font-black uppercase tracking-[0.15em] text-xs rounded-xl transition-all shadow-lg active:scale-[0.98] ${isSessionComplete ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-600 hover:bg-zinc-800'}`}
                >
                  {isSessionComplete ? 'Secure DAG Reward' : 'Seal Current Cluster'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-10 max-w-sm mx-auto relative z-10 animate-fade-in mt-auto pb-10">
              <div className="w-24 h-24 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative group cursor-pointer hover:border-primary/50 transition-all duration-500" onClick={handleStartMining}>
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-3xl opacity-50"></div>
                <div className="relative w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center border border-zinc-800 group-hover:border-primary/50 transition-colors">
                   <Zap className="w-10 h-10 text-zinc-600 group-hover:text-primary transition-colors duration-300" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">DAG_IDLE</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">Initialize node presence to begin topological block ordering and claim GhostDAG emission rewards.</p>
              </div>
              
              <button 
                onClick={handleStartMining} 
                className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.15em] text-xs rounded-xl shadow-[0_10px_30px_rgba(244,63,94,0.25)] hover:shadow-[0_15px_40px_rgba(244,63,94,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Initialize GhostDAG Sequence</span>
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <div className="surface p-8 rounded-3xl flex-1 border-emerald-500/10 bg-emerald-500/[0.02] flex flex-col justify-between min-h-[220px]">
            <h3 className="label-meta mb-6 flex justify-between items-center text-emerald-500">
              PHANTOM_CONSENSUS_FEED
              <span className="text-[8px] tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">SYNC_OK</span>
            </h3>
            <div className="space-y-4 font-mono text-[10px]">
              {[
                { msg: 'Parenting_Vector_Set', time: 'SUCCESS', status: 'OK', color: 'text-emerald-500' },
                { msg: `Local Blue-Score: ${Math.floor(miningTimer/10)}`, time: 'CLUSTER', status: 'OK', color: 'text-primary' },
                { msg: `K-Cluster Density Optimal`, time: 'CONSENSUS', status: 'OK', color: 'text-zinc-400' },
                { msg: `BlockDAG_Traversal_Active`, time: 'TOPOLOGY', status: 'INFO', color: 'text-zinc-400' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 border-l-2 border-emerald-500/10 pl-4 py-1">
                  <span className="text-zinc-600 w-12">{log.time}</span>
                  <p className="text-zinc-400 font-medium truncate">
                    <span className={`font-bold mr-2 ${log.color}`}>[{log.status}]</span> {log.msg}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="surface p-8 rounded-3xl bg-zinc-900/30 border-zinc-900 border-dashed">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                 <AlertTriangle className="w-4 h-4 text-primary" />
              </div>
              <p className="label-meta text-primary/80">Protocol Restriction</p>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
              GhostDAG requires continuous network connectivity. Orphaned clusters (Red-Set blocks) do not accumulate reward credits. Ensure persistent node uptime.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Cumulative Reward', value: Math.floor(user.points * 100) / 100, unit: 'ARG', icon: Database, color: 'text-white' },
          { label: 'Topology Uptime', value: formatTime(miningTimer), unit: 'REM', icon: Clock, color: 'text-emerald-400' },
          { label: 'Active Validators', value: netStats.activeNodes.toLocaleString(), unit: 'LIVE', icon: Activity, color: 'text-primary' },
          { label: 'DAG Block Count', value: Math.floor(netStats.totalMined * 12).toLocaleString(), unit: 'BLOCKS', icon: Box, color: 'text-indigo-400' }
        ].map((stat, i) => (
          <div key={i} className="surface p-6 rounded-2xl border border-zinc-900 bg-gradient-to-b from-zinc-900/40 to-zinc-950 animate-fade-in-up" style={{ animationDelay: `${0.3 + (i * 0.1)}s` }}>
            <div className="flex items-center justify-between mb-8">
              <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
                 <stat.icon className={`w-4 h-4 text-zinc-500`} />
              </div>
              <ArrowUpRight className="w-3 h-3 text-zinc-700" />
            </div>
            <p className="label-meta mb-1 text-zinc-500">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-mono font-bold tracking-tight ${stat.color}`}>{stat.value}</h3>
              <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
