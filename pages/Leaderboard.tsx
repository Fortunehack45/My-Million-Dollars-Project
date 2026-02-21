
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
    <div className="w-full space-y-12 animate-in fade-in duration-700 pb-20 relative">

      {/* Background Subtle Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-maroon/5 blur-[150px] -z-10 animate-pulse-slow"></div>

      {/* Institutional Header - Resized to Dashboard Standards */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-900 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded-xl">
            <Trophy className="w-5 h-5 text-maroon animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-tight">Authority_Index</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Global ranking sync · v2.8</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="label-meta mb-0.5">Top_Operator</p>
            <p className="text-sm font-mono font-black text-white">{data[0]?.displayName || 'Syncing...'}</p>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="w-9 h-9 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center">
            <Medal className="w-5 h-5 text-maroon/60" />
          </div>
        </div>
      </header>

      {/* Top 3 Cards (Desktop Only) */}
      {!loading && data.length >= 3 && (
        <div className="hidden md:grid grid-cols-3 gap-6 mb-8 items-end">
          {/* 2nd Place */}
          <div className="silk-panel p-8 rounded-[2.5rem] border-zinc-900 relative overflow-hidden flex flex-col items-center text-center order-1 h-52 justify-center group hover:border-zinc-700 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent -translate-y-full animate-scanline opacity-30"></div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-zinc-600 transition-colors">
              <span className="text-sm font-black text-zinc-500">#2</span>
            </div>
            <p className="font-black text-white text-lg uppercase tracking-tight truncate max-w-full px-4 group-hover:text-maroon transition-colors">{data[1]?.displayName}</p>
            <p className="text-xs font-mono font-black text-zinc-500 mt-2 tracking-tighter">{data[1]?.points.toLocaleString()} <span className="text-[10px] text-zinc-700">ARG</span></p>
          </div>

          {/* 1st Place */}
          <div className="silk-panel p-10 rounded-[3rem] border-maroon/20 relative overflow-hidden flex flex-col items-center text-center order-2 h-64 justify-center shadow-[0_40px_80px_-20px_rgba(128,0,0,0.3)] bg-gradient-to-b from-maroon/5 to-transparent group hover:scale-[1.02] hover:border-maroon/40 transition-all duration-700">
            {/* Animated Glow */}
            <div className="absolute -inset-10 bg-maroon/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-[0.03]"></div>

            <Crown className="w-16 h-16 text-maroon mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(128,0,0,0.8)] relative z-10" />
            <p className="text-2xl font-black text-white uppercase tracking-tighter truncate max-w-full px-4 relative z-10">{data[0]?.displayName}</p>
            <p className="text-sm font-mono font-black text-maroon mt-2 relative z-10 tracking-[0.2em]">{data[0]?.points.toLocaleString()} ARG</p>
          </div>

          {/* 3rd Place */}
          <div className="silk-panel p-8 rounded-[2.5rem] border-zinc-900 relative overflow-hidden flex flex-col items-center text-center order-3 h-52 justify-center group hover:border-zinc-700 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent -translate-y-full animate-scanline opacity-30"></div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl group-hover:border-zinc-600 transition-colors">
              <span className="text-sm font-black text-amber-900">#3</span>
            </div>
            <p className="font-black text-white text-lg uppercase tracking-tight truncate max-w-full px-4 group-hover:text-maroon transition-colors">{data[2]?.displayName}</p>
            <p className="text-xs font-mono font-black text-zinc-500 mt-2 tracking-tighter">{data[2]?.points.toLocaleString()} <span className="text-[10px] text-zinc-700">ARG</span></p>
          </div>
        </div>
      )}

      <div className="silk-panel rounded-[2.5rem] border-zinc-900/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900/50 bg-zinc-950/50">
                <th className="px-8 py-6">Rank_Index</th>
                <th className="px-8 py-6">Operator_Node_Identity</th>
                <th className="px-8 py-6 text-right">Accumulated_Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-900/40">
                    <td className="px-8 py-6">
                      <div className="skeleton w-4 h-4 rounded" />
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="skeleton w-1.5 h-1.5 rounded-full" />
                        <div className="space-y-2">
                          <div className="skeleton h-4 w-32" />
                          <div className="skeleton h-2 w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <div className="skeleton h-4 w-20" />
                        <div className="skeleton h-2 w-12" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                data.map((entry) => (
                  <tr key={entry.uid} className={`group hover:bg-white/[0.02] transition-colors relative ${user?.uid === entry.uid ? 'bg-maroon/[0.02]' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] shrink-0 ${user?.uid === entry.uid ? 'bg-maroon shadow-maroon/50 animate-pulse' : 'bg-zinc-800 shadow-transparent'}`}></div>
                        <div className="flex flex-col">
                          <span className={`text-xs uppercase tracking-tight ${user?.uid === entry.uid ? 'text-maroon font-black' : 'text-white font-bold'}`}>{entry.displayName}</span>
                          <span className="text-[9px] font-mono text-zinc-600 font-medium lowercase hidden md:block opacity-40">node_{entry.uid.slice(0, 12)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-mono text-sm ${entry.rank <= 3 ? 'text-white font-black' : 'text-zinc-400'}`}>
                          {entry.points.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] text-zinc-700 font-black uppercase">ARG_Tokens</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
