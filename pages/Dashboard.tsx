import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  startMiningSession, 
  claimPoints, 
  subscribeToNetworkStats, 
  TOTAL_SUPPLY,
  BASE_MINING_RATE,
  REFERRAL_BOOST,
  MAX_REFERRALS
} from '../services/firebase';
import { Clock, Database, Activity, Cpu, ShieldCheck, Box, HardDrive, Zap, AlertTriangle } from 'lucide-react';
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
    <div className="w-full space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Infrastructure</h1>
          <p className="text-zinc-500 text-sm font-medium">Monitoring active node contribution. Mining speed: <span className="text-primary font-mono">{currentHourlyRate.toFixed(2)} NEX/hr</span></p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className="label-meta text-[8px] text-zinc-600">Protocol_Scarcity_Index</p>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-primary">{(leftToMine / 1000000).toFixed(2)}M NEX LEFT</p>
              <div className="w-48 h-1.5 bg-zinc-900 mt-1 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-primary shadow-[0_0_10px_#f43f5e]" style={{ width: `${miningPercent}%` }}></div>
              </div>
            </div>
            <Box className="w-8 h-8 text-zinc-800" />
          </div>
        </div>
      </header>

      {/* Boost Panel */}
      <div className="surface p-8 rounded-3xl border-primary/20 bg-gradient-to-br from-zinc-900/50 to-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30">
            <Zap className="w-6 h-6 text-primary fill-primary/20" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Efficiency Protocol Active</h3>
            <p className="text-xs text-zinc-500">Base: 0.06/hr + Referral Boost: { (referrals * REFERRAL_BOOST).toFixed(2) }/hr ({referrals}/20 peers)</p>
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`w-1.5 h-6 rounded-full transition-all ${i < referrals ? 'bg-primary shadow-[0_0_8px_#f43f5e]' : 'bg-zinc-800'}`}></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Asset Balance', value: Math.floor(user.points * 100) / 100, unit: 'NEX', icon: Database },
          { label: 'Session Time', value: formatTime(miningTimer), unit: 'REMAINING', icon: Clock },
          { label: 'Active Nodes', value: netStats.activeNodes.toLocaleString(), unit: 'LIVE', icon: Activity },
          { label: 'Cumulative Mined', value: Math.floor(netStats.totalMined).toLocaleString(), unit: 'NEX', icon: Box }
        ].map((stat, i) => (
          <div key={i} className="surface p-8 rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
              <div className="h-1 w-8 bg-zinc-800 rounded-full"></div>
            </div>
            <p className="label-meta mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-mono font-bold text-white tracking-tight">{stat.value}</h3>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 surface p-12 rounded-3xl flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="absolute top-6 left-6 flex items-center gap-2">
             <p className="label-meta">Instance::ALPHA</p>
             <div className={`w-1 h-1 rounded-full ${user.miningActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`}></div>
          </div>

          {user.miningActive ? (
            <div className="text-center space-y-12 w-full max-w-sm">
              <div className="space-y-2">
                <p className={`label-meta ${isSessionComplete ? 'text-emerald-500' : 'text-primary'}`}>
                  {isSessionComplete ? 'SESSION COMPLETE - READY TO CLAIM' : 'ACCUMULATING CREDITS...'}
                </p>
                <h2 className="text-7xl font-mono font-bold text-white tracking-tighter tabular-nums">
                  {pendingPoints.toFixed(4)}
                </h2>
                <p className="text-[10px] text-zinc-600 font-mono">ESTIMATED YIELD AT {currentHourlyRate.toFixed(2)} NEX/HR</p>
              </div>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={handleClaim} 
                  className={`w-full py-4 font-black uppercase tracking-widest text-xs rounded-xl transition-all ${isSessionComplete ? 'bg-emerald-500 text-black hover:bg-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white hover:border-zinc-700'}`}
                >
                  {isSessionComplete ? 'Claim 24h Yield' : 'Stop & Claim Early'}
                </button>
                {isSessionComplete && (
                   <div className="flex items-center justify-center gap-2 text-emerald-500/50">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[8px] font-bold uppercase">Integrity Verified</span>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 max-w-sm">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                <Cpu className="w-8 h-8 text-zinc-700" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Core Idle</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">Initialize a 24-hour mining sequence to secure your allocation of the genesis supply.</p>
              </div>
              <button onClick={handleStartMining} className="btn-primary w-full group relative overflow-hidden">
                <span className="relative z-10">Initiate 24H Sequence</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="surface p-8 rounded-3xl flex-1 border-emerald-500/10 bg-emerald-500/[0.02]">
            <h3 className="label-meta mb-8 flex justify-between items-center text-emerald-500">
              Protocol Telemetry
              <span className="animate-pulse font-black">Online</span>
            </h3>
            <div className="space-y-6 font-mono text-[10px]">
              {[
                { msg: 'Auth Key Validated', time: 'SUCCESS', status: 'OK' },
                { msg: `Current Hash: ${currentHourlyRate.toFixed(2)} NEX/HR`, time: 'YIELD', status: 'OK' },
                { msg: `${referrals}/20 Peering Status`, time: 'NODES', status: 'OK' },
                { msg: `24H Cycle Initialized`, time: 'CORE', status: 'INFO' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 border-l-2 border-emerald-500/20 pl-4 py-1">
                  <span className="text-zinc-600">{log.time}</span>
                  <p className="text-zinc-400 font-medium">
                    [{log.status}] {log.msg}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="surface p-8 rounded-3xl bg-zinc-900/30 border-dashed border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <p className="label-meta text-primary/80">Operator Warning</p>
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">
              Mining requires periodic check-ins. Re-initialize your node every 24 hours to ensure continuous credit accumulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;