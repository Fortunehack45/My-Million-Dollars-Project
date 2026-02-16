import React, { useState, useEffect, useCallback } from 'react';
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
import { Clock, Database, Activity, Cpu, ShieldCheck, Box, HardDrive, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { NetworkStats } from '../types';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [miningTimer, setMiningTimer] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  
  const MAX_SESSION_TIME = 24 * 60 * 60; // 24 Hours in seconds

  // Mining Rate = (Base + (Refs * Boost)) / 3600 (to get per second)
  const referrals = Math.min(user?.referralCount || 0, MAX_REFERRALS);
  const currentHourlyRate = BASE_MINING_RATE + (referrals * REFERRAL_BOOST);
  const ratePerSecond = currentHourlyRate / 3600;

  // Sync Referrals on Mount
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
  }, [user?.uid]); // Only run when user ID changes (login)

  useEffect(() => {
    const unsubscribe = subscribeToNetworkStats(setNetStats);
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
      // Session expired
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
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Online</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Argus Infrastructure</h1>
          <p className="text-zinc-500 text-sm font-medium">Monitoring active node contribution. <span className="text-zinc-400">Yield Velocity:</span> <span className="text-primary font-mono font-bold">{currentHourlyRate.toFixed(2)} ARG/hr</span></p>
        </div>
        <div className="text-right flex flex-col items-end gap-3 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
          <p className="label-meta text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Protocol Scarcity</p>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-mono font-black text-white">{(leftToMine / 1000000).toFixed(2)}M <span className="text-zinc-600">REMAINING</span></p>
              <div className="w-40 h-2 bg-zinc-950 mt-2 rounded-full overflow-hidden border border-zinc-800/50">
                <div className="h-full bg-gradient-to-r from-primary to-rose-400 shadow-[0_0_15px_#f43f5e]" style={{ width: `${miningPercent}%` }}></div>
              </div>
            </div>
            <Box className="w-8 h-8 text-zinc-800" />
          </div>
        </div>
      </header>

      {/* Boost Panel */}
      <div className="surface p-6 md:p-8 rounded-3xl border-primary/20 bg-gradient-to-br from-zinc-900/80 to-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <Zap className="w-7 h-7 text-primary fill-primary/20" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Efficiency Protocol</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs text-zinc-400 font-medium">Base: 0.06/hr</span>
               <span className="text-zinc-700">•</span>
               <span className="text-xs text-primary font-bold">Boost: +{(referrals * REFERRAL_BOOST).toFixed(2)}/hr</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 relative z-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-8 rounded-full transition-all duration-500 ${i < referrals ? 'bg-primary shadow-[0_0_8px_#f43f5e] scale-y-110' : 'bg-zinc-800 scale-y-75'}`}
              title={`Peer Node ${i+1}`}
            ></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Asset Balance', value: Math.floor(user.points * 100) / 100, unit: 'ARG', icon: Database, color: 'text-white' },
          { label: 'Session Time', value: formatTime(miningTimer), unit: 'REM', icon: Clock, color: 'text-emerald-400' },
          { label: 'Active Nodes', value: netStats.activeNodes.toLocaleString(), unit: 'LIVE', icon: Activity, color: 'text-primary' },
          { label: 'Cumulative Mined', value: Math.floor(netStats.totalMined).toLocaleString(), unit: 'ARG', icon: Box, color: 'text-indigo-400' }
        ].map((stat, i) => (
          <div key={i} className="surface p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-zinc-900 bg-gradient-to-b from-zinc-900/40 to-zinc-950">
            <div className="flex items-center justify-between mb-8">
              <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl group-hover:border-zinc-700 transition-colors">
                 <stat.icon className={`w-4 h-4 text-zinc-500 group-hover:${stat.color} transition-colors`} />
              </div>
              <ArrowUpRight className="w-3 h-3 text-zinc-700 group-hover:text-zinc-500" />
            </div>
            <p className="label-meta mb-1 text-zinc-500">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-mono font-bold tracking-tight ${stat.color}`}>{stat.value}</h3>
              <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 surface p-12 rounded-3xl flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden border-zinc-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.05),transparent_70%)]"></div>
          
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-900 backdrop-blur-md">
             <div className={`w-1.5 h-1.5 rounded-full ${user.miningActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Instance::ALPHA</p>
          </div>

          {user.miningActive ? (
            <div className="text-center space-y-12 w-full max-w-sm relative z-10">
              <div className="space-y-4">
                <div className="inline-block">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isSessionComplete ? 'text-emerald-500 animate-pulse' : 'text-primary'}`}>
                    {isSessionComplete ? 'SESSION COMPLETE' : 'ACCUMULATING CREDITS'}
                  </p>
                  <h2 className="text-7xl font-mono font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {pendingPoints.toFixed(4)}
                  </h2>
                </div>
                <div className="flex justify-center">
                   <p className="text-[10px] text-zinc-500 font-mono bg-zinc-950/80 px-4 py-1 rounded-full border border-zinc-900">
                      ESTIMATED YIELD AT <span className="text-zinc-300">{currentHourlyRate.toFixed(2)} ARG/HR</span>
                   </p>
                </div>
              </div>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={handleClaim} 
                  className={`w-full py-5 font-black uppercase tracking-[0.15em] text-xs rounded-xl transition-all shadow-lg active:scale-[0.98] ${isSessionComplete ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-600 hover:bg-zinc-800'}`}
                >
                  {isSessionComplete ? 'Secure 24h Yield' : 'Stop & Claim Early'}
                </button>
                {isSessionComplete && (
                   <div className="flex items-center justify-center gap-2 text-emerald-500/50 animate-in fade-in slide-in-from-bottom-2">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Integrity Verified</span>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-10 max-w-sm relative z-10">
              <div className="w-24 h-24 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative group cursor-pointer" onClick={handleStartMining}>
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-3xl opacity-50"></div>
                <div className="relative w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center border border-zinc-800 group-hover:border-primary/50 transition-colors">
                   <Cpu className="w-10 h-10 text-zinc-600 group-hover:text-primary transition-colors duration-300" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Core Idle</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">Initialize a 24-hour mining sequence to secure your allocation of the genesis supply.</p>
              </div>
              
              <button 
                onClick={handleStartMining} 
                className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.15em] text-xs rounded-xl shadow-[0_10px_30px_rgba(244,63,94,0.25)] hover:shadow-[0_15px_40px_rgba(244,63,94,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Initiate 24H Sequence</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="surface p-8 rounded-3xl flex-1 border-emerald-500/10 bg-emerald-500/[0.02] flex flex-col justify-between min-h-[220px]">
            <h3 className="label-meta mb-6 flex justify-between items-center text-emerald-500">
              Protocol Telemetry
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                 <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="font-bold text-[8px] tracking-widest text-emerald-400">ONLINE</span>
              </span>
            </h3>
            <div className="space-y-4 font-mono text-[10px]">
              {[
                { msg: 'Auth Key Validated', time: 'SUCCESS', status: 'OK', color: 'text-emerald-500' },
                { msg: `Current Hash: ${currentHourlyRate.toFixed(2)} ARG/HR`, time: 'YIELD', status: 'OK', color: 'text-primary' },
                { msg: `${referrals}/20 Peering Status`, time: 'NODES', status: 'OK', color: 'text-zinc-400' },
                { msg: `24H Cycle Initialized`, time: 'CORE', status: 'INFO', color: 'text-zinc-400' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 border-l-2 border-emerald-500/10 pl-4 py-1 hover:bg-emerald-500/5 transition-colors rounded-r">
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
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                 <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="label-meta text-amber-500/80">Operator Warning</p>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
              Mining requires periodic check-ins. Re-initialize your node every 24 hours to ensure continuous credit accumulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;