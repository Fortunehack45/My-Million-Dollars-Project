import React, { useEffect, useState } from 'react';
import { getLeaderboardData } from '../services/firebase';
import { LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const result = await getLeaderboardData();
        setData(result);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Protocol Rank</h1>
        <p className="text-zinc-500 text-sm font-medium">Global index of verified node performance and network contribution.</p>
      </header>

      <div className="surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-bold uppercase tracking-wider">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/30">
                <th className="px-8 py-4 text-left text-zinc-600 font-black">Rank</th>
                <th className="px-8 py-4 text-left text-zinc-600 font-black">Entity ID</th>
                <th className="px-8 py-4 text-right text-zinc-600 font-black">Credits (NEX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-zinc-600 font-mono">Querying Network States...</td>
                </tr>
              ) : (
                data.map((entry) => (
                  <tr key={entry.uid} className={`hover:bg-zinc-900 transition-colors ${user?.uid === entry.uid ? 'bg-primary/5' : ''}`}>
                    <td className="px-8 py-6 font-mono text-zinc-500">{entry.rank.toString().padStart(2, '0')}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                        <span className={user?.uid === entry.uid ? 'text-primary' : 'text-white'}>{entry.displayName}</span>
                        <span className="text-[9px] font-mono text-zinc-600 font-bold tracking-tight lowercase">uid_{entry.uid.slice(0, 6)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-zinc-300">{entry.points.toLocaleString()}</td>
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