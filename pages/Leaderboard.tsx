
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
          <div className="surface p-6 rounded-2xl border-t-4 border-t-zinc-400 relative overflow-hidden flex flex-col items-center text-center order-1 h-40 justify-center">
             <div className="w-8 h-8 rounded-full bg-zinc-400/10 flex items-center justify-center mb-3">
                <span className="text-sm font-black text-zinc-400">#2</span>
             </div>
             <p className="font-bold text-white truncate max-w-full px-2">{data[1]?.displayName}</p>
             <p className="text-xs font-mono text-zinc-500 mt-1">{data[1]?.points.toLocaleString()} ARG</p>
          </div>
          
          {/* 1st Place */}
          <div className="surface p-8 rounded-2xl border-t-4 border-t-yellow-500 relative overflow-hidden flex flex-col items-center text-center order-2 h-48 justify-center shadow-[0_0_30px_rgba(234,179,8,0.1)] bg-gradient-to-b from-yellow-500/5 to-zinc-950">
             <Crown className="w-8 h-8 text-yellow-500 mb-4 animate-bounce" />
             <p className="text-lg font-black text-white truncate max-w-full px-2">{data[0]?.displayName}</p>
             <p className="text-sm font-mono text-yellow-500/80 mt-1 font-bold">{data[0]?.points.toLocaleString()} ARG</p>
          </div>

          {/* 3rd Place */}
          <div className="surface p-6 rounded-2xl border-t-4 border-t-amber-700 relative overflow-hidden flex flex-col items-center text-center order-3 h-40 justify-center">
             <div className="w-8 h-8 rounded-full bg-amber-700/10 flex items-center justify-center mb-3">
                <span className="text-sm font-black text-amber-700">#3</span>
             </div>
             <p className="font-bold text-white truncate max-w-full px-2">{data[2]?.displayName}</p>
             <p className="text-xs font-mono text-zinc-500 mt-1">{data[2]?.points.toLocaleString()} ARG</p>
          </div>
        </div>
      )}

      <div className="surface rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/30">
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
                  <tr key={entry.uid} className={`hover:bg-zinc-900/40 transition-colors ${user?.uid === entry.uid ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-3">
                         {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-2 h-2 rounded-full ${user?.uid === entry.uid ? 'bg-primary animate-pulse' : 'bg-zinc-800'}`}></div>
                        <div className="flex flex-col">
                           <span className={`text-xs ${user?.uid === entry.uid ? 'text-primary font-black' : 'text-white font-bold'}`}>{entry.displayName}</span>
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
