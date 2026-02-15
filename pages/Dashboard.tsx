import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { startMiningSession, claimPoints } from '../services/firebase';
import { Zap, Clock, Database, Activity, Cpu, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [miningTimer, setMiningTimer] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  
  const MINING_RATE_PER_SECOND = 0.5;
  const MAX_SESSION_TIME = 24 * 60 * 60;

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

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Infrastructure</h1>
        <p className="text-zinc-500 text-sm font-medium">Monitoring active node contribution and block-sequence synchronization.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Network Credits', value: Math.floor(user.points).toLocaleString(), unit: 'NEX', icon: Database },
          { label: 'Uptime Protocol', value: formatTime(miningTimer), unit: 'HMS', icon: Clock },
          { label: 'Compute Power', value: '0.50', unit: 'P/S', icon: Zap }
        ].map((stat, i) => (
          <div key={i} className="surface p-8 rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
              <div className="h-1 w-8 bg-zinc-800 rounded-full"></div>
            </div>
            <p className="label-meta mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-mono font-bold text-white tracking-tight">{stat.value}</h3>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.unit}</span>
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
              <span className="text-primary">Live</span>
            </h3>
            <div className="space-y-6 font-mono text-[10px]">
              {[
                { msg: 'Peer Handshake Verified', time: '14:21:02', status: 'OK' },
                { msg: 'Block Sequence Mapped', time: '14:18:44', status: 'OK' },
                { msg: 'State Root Synchronized', time: '14:04:12', status: 'WAIT' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 border-l-2 border-zinc-800 pl-4 py-1">
                  <span className="text-zinc-600">{log.time}</span>
                  <p className={`font-bold ${log.status === 'OK' ? 'text-zinc-400' : 'text-primary animate-pulse'}`}>
                    [{log.status}] {log.msg}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="surface p-8 rounded-3xl bg-zinc-900/30 border-dashed">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <p className="label-meta text-zinc-300">Security Note</p>
            </div>
            <p className="text-xs text-zinc-500 italic leading-relaxed font-medium">
              "Maintain consistent uptime to avoid potential slashing of pending rewards."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;