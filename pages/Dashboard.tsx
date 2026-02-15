import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { startMiningSession, claimPoints, subscribeToNetworkStats, TOTAL_SUPPLY } from '../services/firebase';
import { Zap, Clock, Database, Activity, Cpu, ShieldCheck, Box } from 'lucide-react';
import { NetworkStats } from '../types';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [miningTimer, setMiningTimer] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  
  const MINING_RATE_PER_SECOND = 0.5;
  const MAX_SESSION_TIME = 24 * 60 * 60;

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
    const finalSeconds = Math.min(elapsedSeconds, MAX_SESSION_TIME);
    setMiningTimer(finalSeconds);
    setPendingPoints(finalSeconds * MINING_RATE_PER_SECOND);
  }, [user]);

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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  const leftToMine = TOTAL_SUPPLY - netStats.totalMined;
  const miningPercent = (netStats.totalMined / TOTAL_SUPPLY) * 100;

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Infrastructure</h1>
          <p className="text-zinc-500 text-sm font-medium">Monitoring active node contribution and block-sequence synchronization.</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className="label-meta text-[8px] text-zinc-600">Protocol_Scarcity_Index</p>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-zinc-400">{(leftToMine / 1000000).toFixed(1)}M LEFT</p>
              <div className="w-32 h-1 bg-zinc-900 mt-1 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${miningPercent}%` }}></div>
              </div>
            </div>
            <Box className="w-8 h-8 text-zinc-800" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Personal Credits', value: Math.floor(user.points).toLocaleString(), unit: 'NEX', icon: Database },
          { label: 'Uptime Protocol', value: formatTime(miningTimer), unit: 'HMS', icon: Clock },
          { label: 'Active Peers', value: netStats.activeNodes.toLocaleString(), unit: 'LIVE', icon: Activity },
          { label: 'Network Total', value: Math.floor(netStats.totalMined).toLocaleString(), unit: 'NEX', icon: Box }
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
             <p className="label-meta">Instance::042</p>
             <div className={`w-1 h-1 rounded-full ${user.miningActive ? 'bg-primary' : 'bg-zinc-800'}`}></div>
          </div>

          {user.miningActive ? (
            <div className="text-center space-y-12 w-full max-w-sm">
              <div className="space-y-2">
                <p className="label-meta text-primary">Accumulating Credits</p>
                <h2 className="text-7xl font-mono font-bold text-white tracking-tighter tabular-nums">
                  {pendingPoints.toFixed(2)}
                </h2>
              </div>
              <button onClick={handleClaim} className="btn-primary w-full">Claim Rewards</button>
            </div>
          ) : (
            <div className="text-center space-y-8 max-w-sm">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                <Cpu className="w-8 h-8 text-zinc-700" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Core Inactive</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">Initialize node sequence to participate in the current network epoch.</p>
              </div>
              <button onClick={handleStartMining} className="btn-primary w-full">Initiate Handshake</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="surface p-8 rounded-3xl flex-1">
            <h3 className="label-meta mb-8 flex justify-between items-center">
              Network Logs
              <span className="text-primary animate-pulse font-black">Live</span>
            </h3>
            <div className="space-y-6 font-mono text-[10px]">
              {[
                { msg: 'Peer Handshake Verified', time: 'SECURE', status: 'OK' },
                { msg: 'Block Sequence Mapped', time: 'SYNC', status: 'OK' },
                { msg: `${netStats.totalUsers} Operators Joined`, time: 'STAT', status: 'INFO' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 border-l-2 border-zinc-800 pl-4 py-1">
                  <span className="text-zinc-600">{log.time}</span>
                  <p className={`font-bold ${log.status === 'OK' ? 'text-zinc-400' : 'text-primary'}`}>
                    [{log.status}] {log.msg}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="surface p-8 rounded-3xl bg-zinc-900/30 border-dashed border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="label-meta text-zinc-300">Security Note</p>
            </div>
            <p className="text-xs text-zinc-500 italic leading-relaxed font-medium">
              "Mining rates may oscillate based on total active protocol participants."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;