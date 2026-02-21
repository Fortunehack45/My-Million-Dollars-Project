
import React, { useEffect, useState } from 'react';
import { subscribeToLeaderboard } from '../services/firebase';
import { LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown } from 'lucide-react';

const Leaderboard = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((entries) => {
      setData(entries);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-zinc-300 fill-zinc-300/20" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-700 fill-amber-700/20" />;
    return <span className="text-zinc-600 font-mono text-xs w-4 text-center">{rank}</span>;
  };

  return (
    <div className="w-full space-y-16 animate-in fade-in duration-700 pb-32 relative">

      {/* Background Dramatic Atmospherics */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-maroon/[0.03] blur-[200px] -z-10 pointer-events-none" />

      {/* HEADER - Institutional Operations Interface */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-zinc-900/50 relative overflow-hidden">
        <div className="absolute -left-20 top-0 w-64 h-64 bg-maroon/[0.05] blur-[100px] rounded-full pointer-events-none" />
        <div className="flex items-start gap-8 relative z-10">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 flex items-center justify-center rounded-[1.5rem] shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Trophy className="w-8 h-8 text-maroon animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Authority Index</h1>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest leading-none font-bold">Ranking_Service: Active</p>
              </div>
              <div className="h-1 w-1 rounded-full bg-zinc-800" />
              <p className="text-[11px] font-mono text-maroon font-black uppercase tracking-widest leading-none italic">
                Authority_Quorum_v2.8
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10 relative z-10 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Top_Node_Operator</p>
            <p className="text-2xl font-mono font-black text-white tracking-widest truncate max-w-[150px]">{data[0]?.displayName || 'ARCH_SYNC'}</p>
          </div>
          <div className="h-10 w-px bg-zinc-900" />
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Total_Indexed_Nodes</p>
            <p className="text-2xl font-mono font-black text-white tracking-widest">#{data.length}</p>
          </div>
        </div>
      </header>

      {/* Top 3 Cards - Premium Institutional Display */}
      {!loading && data.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 items-end px-4">
          {/* SECOND PLACE */}
          <div className="silk-panel p-1.5 rounded-[3rem] bg-zinc-950 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] order-2 md:order-1 h-[320px] transition-all duration-700 hover:-translate-y-2 group">
            <div className="bg-zinc-950 h-full rounded-[2.9rem] p-12 flex flex-col items-center justify-center text-center border border-white/[0.02] group-hover:border-zinc-800 transition-all duration-700 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 shadow-2xl group-hover:bg-zinc-800 transition-all">
                <span className="text-lg font-black text-zinc-400">#2</span>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono italic">Beta_Sector_Authority</p>
                <h3 className="text-3xl font-black text-white truncate max-w-full px-6">{data[1]?.displayName}</h3>
                <p className="text-xl font-mono font-black text-maroon/60 tracking-widest">{data[1]?.points.toLocaleString()} <span className="text-[11px] text-zinc-700 uppercase">ARG</span></p>
              </div>
            </div>
          </div>

          {/* FIRST PLACE */}
          <div className="silk-panel p-1.5 rounded-[4rem] bg-zinc-950 shadow-[0_60px_120px_-30px_rgba(128,0,0,0.3)] order-1 md:order-2 h-[420px] transition-all duration-700 hover:scale-[1.02] group relative">
            <div className="bg-zinc-950 h-full rounded-[3.9rem] p-14 flex flex-col items-center justify-center text-center border border-maroon/20 group-hover:border-maroon/40 transition-all duration-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-maroon/[0.08] to-transparent pointer-events-none" />
              <div className="absolute -inset-20 bg-maroon/5 blur-[100px] animate-pulse pointer-events-none" />

              <Crown className="w-24 h-24 text-maroon mb-10 animate-pulse drop-shadow-[0_0_30px_rgba(128,0,0,0.6)] relative z-10" />
              <div className="space-y-4 relative z-10">
                <p className="text-[11px] font-black text-maroon uppercase tracking-[0.5em] font-mono animate-pulse">Alpha_Prime_Protocol</p>
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter truncate max-w-full px-8">{data[0]?.displayName}</h3>
                <div className="h-px w-20 bg-maroon/20 mx-auto group-hover:w-40 transition-all duration-700" />
                <p className="text-2xl font-mono font-black text-white tracking-widest">{data[0]?.points.toLocaleString()} <span className="text-xs text-maroon">ARG</span></p>
              </div>

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.02] to-transparent -translate-y-full animate-scanline opacity-20 pointer-events-none"></div>
            </div>
          </div>

          {/* THIRD PLACE */}
          <div className="silk-panel p-1.5 rounded-[3rem] bg-zinc-950 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] order-3 h-[320px] transition-all duration-700 hover:-translate-y-2 group">
            <div className="bg-zinc-950 h-full rounded-[2.9rem] p-12 flex flex-col items-center justify-center text-center border border-white/[0.02] group-hover:border-amber-950/20 transition-all duration-700 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-900/10 to-transparent" />
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 shadow-2xl group-hover:bg-amber-950/10 transition-all">
                <span className="text-lg font-black text-amber-900/60">#3</span>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono italic">Gamma_Sector_Authority</p>
                <h3 className="text-3xl font-black text-white truncate max-w-full px-6">{data[2]?.displayName}</h3>
                <p className="text-xl font-mono font-black text-maroon/60 tracking-widest">{data[2]?.points.toLocaleString()} <span className="text-[11px] text-zinc-700 uppercase">ARG</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TABLE - Institutional Ledger Style */}
      <div className="p-1.5 silk-panel rounded-[4rem] bg-zinc-950 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)] relative group overflow-hidden">
        <div className="bg-zinc-950 h-full rounded-[3.9rem] overflow-hidden border border-zinc-900/50 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(128,0,0,0.02),transparent_80%)]" />
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] font-mono border-b border-white/[0.03] bg-black/40 backdrop-blur-xl">
                  <th className="px-12 py-10">Vector_Rank</th>
                  <th className="px-12 py-10">Operator_Node_Identity_Header</th>
                  <th className="px-12 py-10 text-right">Accumulated_Credit_Manifest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="bg-black/20">
                      <td className="px-12 py-8"><div className="skeleton w-6 h-6 rounded-lg" /></td>
                      <td className="px-12 py-8"><div className="skeleton h-6 w-64 rounded-xl" /></td>
                      <td className="px-12 py-8 text-right flex justify-end"><div className="skeleton h-6 w-32 rounded-xl" /></td>
                    </tr>
                  ))
                ) : (
                  data.map((entry) => (
                    <tr key={entry.uid} className={`group/row transition-all duration-500 hover:bg-white/[0.01] relative ${user?.uid === entry.uid ? 'bg-maroon/[0.03]' : ''}`}>
                      <td className="px-12 py-8 font-mono text-zinc-600 font-black text-xs">
                        <div className="flex items-center gap-4">
                          {entry.rank <= 3 ? <div className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse shadow-[0_0_8px_#800000]" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />}
                          {String(entry.rank).padStart(3, '0')}
                        </div>
                      </td>
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-6">
                          <div className={`w-2 h-2 rounded-full shadow-[0_0_12px] shrink-0 transition-all duration-700 ${user?.uid === entry.uid ? 'bg-maroon shadow-maroon animate-pulse-gentle scale-125' : 'bg-zinc-800 group-hover/row:bg-zinc-600'}`}></div>
                          <div className="flex flex-col gap-1">
                            <span className={`text-sm md:text-base uppercase tracking-tight group-hover/row:text-maroon transition-colors ${user?.uid === entry.uid ? 'text-white font-black' : 'text-zinc-400 font-bold'}`}>{entry.displayName}</span>
                            <span className="text-[9px] font-mono text-zinc-700 font-black uppercase tracking-widest opacity-0 group-hover/row:opacity-100 transition-opacity">node_{entry.uid.slice(0, 16)}_auth_ok</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`font-mono text-xl md:text-2xl font-black tabular-nums transition-colors ${entry.rank <= 3 ? 'text-white group-hover/row:text-maroon' : 'text-zinc-500 group-hover/row:text-white'}`}>
                            {entry.points.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest font-mono">Verified_ARG</span>
                            {entry.rank <= 3 && <div className="w-1 h-1 rounded-full bg-maroon" />}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
      </div>

      <div className="flex justify-between items-center opacity-40 px-10">
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-zinc-700">Genesis_Epoch_01 // SECURE_LEDGER</p>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-zinc-700 italic">Auth_Sync_Cycle_3482</p>
      </div>
    </div>
  );
};

export default Leaderboard;
