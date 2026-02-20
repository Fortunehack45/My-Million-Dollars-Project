
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Share2, Users, ShieldCheck, Zap, Info, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { MAX_REFERRALS, REFERRAL_BOOST, REFERRAL_BONUS_POINTS, db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const Referrals = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralLogs, setReferralLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const copyToClipboard = () => {
    if (!user) return;
    const link = `${window.location.origin}/#/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!user) return;

    const fetchReferrals = async () => {
      try {
        try {
          const q = query(
            collection(db, "users"),
            where("referredBy", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const snap = await getDocs(q);
          setReferralLogs(snap.docs.map(d => d.data()));
        } catch (e) {
          const q = query(
            collection(db, "users"),
            where("referredBy", "==", user.uid)
          );
          const snap = await getDocs(q);
          const sorted = snap.docs.map(d => d.data()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setReferralLogs(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    fetchReferrals();
  }, [user?.uid]);

  if (!user) return null;

  const activeRefs = Math.min(user.referralCount, MAX_REFERRALS);
  const totalReferrals = referralLogs.length;

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Peer Network</h1>
        <p className="text-zinc-500 text-sm font-medium">Expand network topology to earn speed boosts and direct credit bonuses.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interaction Card */}
        <div className="lg:col-span-12 xl:col-span-7 silk-panel p-10 rounded-[2.5rem] space-y-8">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-maroon/10 rounded-2xl border border-maroon/20">
              <Share2 className="w-6 h-6 text-maroon" />
            </div>
            <div>
              <h3 className="label-meta text-white">Handshake Authorization Link</h3>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Global Peer Invitation System</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <code className="text-maroon font-mono text-xs font-black tracking-tight bg-maroon/5 px-4 py-2 rounded-lg border border-maroon/10 truncate w-full md:w-auto">
                {window.location.origin}/#/?ref={user.referralCode}
              </code>
              <button onClick={copyToClipboard} className="btn-premium !px-10 !py-4 w-full md:w-auto text-[10px]">
                {copied ? 'COPIED_HASH' : 'COPY_LINK'}
              </button>
            </div>

            <div className="p-8 bg-zinc-900/40 rounded-[2rem] border border-white/5 flex items-start gap-5 group">
              <div className="p-2 bg-zinc-950 rounded-xl border border-white/5 group-hover:border-maroon/20 transition- silk">
                <Info className="w-5 h-5 text-maroon" />
              </div>
              <div className="space-y-2">
                <p className="label-meta text-zinc-300">Reward Protocol</p>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium italic">
                  Earn <span className="text-white font-bold">+{REFERRAL_BONUS_POINTS} ARG</span> instantly per peer.
                  Unlock <span className="text-maroon font-bold">+{REFERRAL_BOOST} ARG/hr</span> permanent mining speed boost per active node.
                  <span className="text-zinc-600 block mt-2 pt-2 border-t border-white/5 font-mono text-[9px]">STATUS: {activeRefs}/{MAX_REFERRALS} PEERS SYNCED (CAP: 20)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Progress */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          <div className="silk-panel p-10 rounded-[2.5rem] flex items-center justify-between group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-maroon/30 transition-silk">
                <Users className="w-7 h-7 text-zinc-400 group-hover:text-maroon transition-silk" />
              </div>
              <div>
                <p className="label-meta">Connected Peers</p>
                <p className="text-[10px] text-zinc-600 font-mono uppercase mt-1">Total Network Size</p>
              </div>
            </div>
            <span className="text-5xl font-mono font-bold text-white tracking-tighter group-hover:text-maroon transition-silk">{activeRefs}</span>
          </div>

          <div className="silk-panel p-10 rounded-[2.5rem] space-y-10 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between">
              <p className="label-meta text-maroon">Mining Efficiency</p>
              <Zap className="w-5 h-5 text-maroon animate-pulse" />
            </div>
            <div className="relative z-10 space-y-5">
              <div className="flex justify-between items-end">
                <span className="label-meta text-zinc-400">Topology Depth</span>
                <span className="text-3xl font-mono font-bold text-white tracking-tighter">{activeRefs} <span className="text-sm text-zinc-600">/ 20</span></span>
              </div>
              <div className="h-3 bg-zinc-950 border border-white/5 p-0.5 rounded-full overflow-hidden">
                <div className="h-full bg-maroon shadow-[0_0_20px_#800000] rounded-full transition-silk" style={{ width: `${(activeRefs / 20) * 100}%` }}></div>
              </div>
              <p className="label-meta text-[10px] text-zinc-500 italic">Total Speed Boost: <span className="text-maroon">+{(activeRefs * REFERRAL_BOOST).toFixed(2)} ARG/hr</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History - Technical Feed */}
      <div className="silk-panel rounded-[2.5rem] overflow-hidden">
        <div className="p-8 bg-zinc-950/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-maroon" />
            <h3 className="label-meta text-zinc-300">Protocol_Commission_Logs</h3>
          </div>
          <span className="label-meta text-zinc-600">Filter: ALL_PEERS</span>
        </div>

        <div className="min-h-[300px] bg-zinc-950/20">
          {isLoadingLogs ? (
            <div className="p-24 flex flex-col items-center justify-center gap-5">
              <Loader2 className="w-10 h-10 text-maroon animate-spin" />
              <p className="label-meta text-zinc-600 animate-pulse">Syncing Network Logs...</p>
            </div>
          ) : referralLogs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {referralLogs.map((log, index) => {
                const chronologicalIndex = totalReferrals - 1 - index;
                const isBoosted = chronologicalIndex < MAX_REFERRALS;
                const date = log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Unknown';

                return (
                  <div key={log.uid} className="p-8 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-white/5 transition-silk gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-center text-zinc-600 group">
                        <ShieldCheck className="w-7 h-7 group-hover:text-maroon transition-silk" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{log.displayName}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="label-meta text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded border border-white/5">
                            UID: {log.uid.slice(0, 8)}...
                          </span>
                          <span className="label-meta text-zinc-600 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> {date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-10 bg-zinc-950/50 p-6 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="label-meta opacity-50">Instant Reward</p>
                          <p className="text-sm font-mono font-bold text-white">+{REFERRAL_BONUS_POINTS.toFixed(2)} ARG</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="w-px h-10 bg-white/5"></div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="label-meta opacity-50">Speed Reward</p>
                          <p className={`text-sm font-mono font-bold ${isBoosted ? 'text-maroon' : 'text-zinc-600'}`}>
                            {isBoosted ? `+${REFERRAL_BOOST.toFixed(2)} /hr` : 'CAP REACHED'}
                          </p>
                        </div>
                        <Zap className={`w-5 h-5 ${isBoosted ? 'text-maroon' : 'text-zinc-800'}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-24 text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-full flex items-center justify-center mx-auto grayscale opacity-20">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <p className="label-meta text-zinc-400">No active peers identified</p>
                <p className="text-xs text-zinc-600 font-medium italic">Transmit your authorization link to begin topology expansion.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referrals;
