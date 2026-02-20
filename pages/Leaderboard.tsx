
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
    <div className="w-full space-y-10 animate-in fade-in duration-500">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Protocol Rank</h1>
        <p className="text-zinc-500 text-sm font-medium">Global index of verified node performance and network contribution.</p>
      </header>

      {/* Top 3 Cards (Desktop Only) */}
      {!loading && data.length >= 3 && (
        <div className="hidden md:grid grid-cols-3 gap-6 mb-8 items-end">
          {/* 2nd Place */}
          <div className="silk-panel p-6 rounded-[2rem] border-t-2 border-t-zinc-400 relative overflow-hidden flex flex-col items-center text-center order-1 h-44 justify-center group hover:-translate-y-1 transition-silk">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 group-hover:border-zinc-400/50 transition-silk">
              <span className="text-xs font-black text-zinc-400">#2</span>
            </div>
            <p className="font-bold text-white truncate max-w-full px-2 group-hover:text-maroon transition-silk">{data[1]?.displayName}</p>
            <p className="label-meta text-[10px] mt-2 italic opacity-60">{data[1]?.points.toLocaleString()} ARG</p>
          </div>

          {/* 1st Place */}
          <div className="silk-panel p-10 rounded-[2.5rem] border-t-2 border-t-maroon relative overflow-hidden flex flex-col items-center text-center order-2 h-56 justify-center shadow-[0_30px_60px_rgba(128,0,0,0.2)] bg-gradient-to-b from-maroon/10 to-transparent group hover:scale-[1.02] transition-silk">
            <div className="absolute inset-0 bg-gradient-to-tr from-maroon/5 to-transparent opacity-50"></div>
            <Crown className="w-12 h-12 text-maroon mb-5 animate-pulse drop-shadow-[0_0_15px_rgba(128,0,0,0.6)] relative z-10" />
            <p className="text-xl font-black text-white truncate max-w-full px-2 relative z-10">{data[0]?.displayName}</p>
            <p className="label-meta text-maroon mt-2 font-black relative z-10 tracking-[0.3em]">{data[0]?.points.toLocaleString()} ARG</p>
          </div>

          {/* 3rd Place */}
          <div className="silk-panel p-6 rounded-[2rem] border-t-2 border-t-amber-800 relative overflow-hidden flex flex-col items-center text-center order-3 h-44 justify-center group hover:-translate-y-1 transition-silk">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 group-hover:border-amber-800/50 transition-silk">
              <span className="text-xs font-black text-amber-800">#3</span>
            </div>
            <p className="font-bold text-white truncate max-w-full px-2 group-hover:text-maroon transition-silk">{data[2]?.displayName}</p>
            <p className="label-meta text-[10px] mt-2 italic opacity-60">{data[2]?.points.toLocaleString()} ARG</p>
          </div>
        </div>
      )}

      <div className="silk-panel rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/50">
                <th className="px-6 md:px-8 py-4 text-left text-zinc-500 font-black">Rank</th>
                <th className="px-6 md:px-8 py-4 text-left text-zinc-500 font-black">Operator Entity</th>
                <th className="px-6 md:px-8 py-4 text-right text-zinc-500 font-black">Accumulated Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-zinc-600 font-mono">
                    <span className="animate-pulse">Querying Network States...</span>
                  </td>
                </tr>
              ) : (
                data.map((entry) => (
                  <tr key={entry.uid} className={`hover:bg-zinc-900/40 transition-colors ${user?.uid === entry.uid ? 'bg-maroon/5 border-l-2 border-maroon' : ''}`}>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-3">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-2 h-2 rounded-full ${user?.uid === entry.uid ? 'bg-maroon animate-pulse' : 'bg-zinc-800'}`}></div>
                        <div className="flex flex-col">
                          <span className={`text-xs ${user?.uid === entry.uid ? 'text-maroon font-black' : 'text-white font-bold'}`}>{entry.displayName}</span>
                          <span className="text-[9px] font-mono text-zinc-600 font-medium lowercase hidden md:block">uid_{entry.uid.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 text-right">
                      <span className={`font-mono text-sm ${entry.rank <= 3 ? 'text-white font-black' : 'text-zinc-400'}`}>
                        {entry.points.toLocaleString()}
                      </span>
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
