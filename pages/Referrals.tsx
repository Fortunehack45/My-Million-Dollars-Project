
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
    <div className="w-full space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-24 relative px-0.5">

      {/* Background Subtle Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-maroon/5 blur-[150px] -z-10 animate-pulse-slow"></div>

      {/* Institutional Header - Resized to Dashboard Standards */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-900 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded-xl">
            <Users className="w-5 h-5 text-maroon animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-tight">Authorization_Bridge</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Network expansion active · v2.8</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="label-meta mb-0.5">Authorized_Peers</p>
            <p className="text-sm font-mono font-black text-white">{activeRefs} <span className="text-zinc-600 text-[10px]">SYNCED</span></p>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="w-9 h-9 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center">
            <Share2 className="w-5 h-5 text-maroon/60" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interaction Card */}
        <div className="lg:col-span-12 xl:col-span-7 silk-panel p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] space-y-8">
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
            <div className="bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group/link">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-maroon/30 to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity"></div>
              <code className="text-maroon font-mono text-[10px] sm:text-xs font-black tracking-tight bg-maroon/5 px-4 py-2 rounded-lg border border-maroon/10 truncate w-full relative z-10">
                {window.location.origin}/#/?ref={user.referralCode}
              </code>
              <button onClick={copyToClipboard} className="btn-silk-inv !px-10 !py-4 w-full md:w-auto text-[10px] font-black uppercase tracking-widest relative z-10">
                {copied ? 'HASH_COPIED' : 'COPY_HANDSHAKE_LINK'}
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
        <div className="lg:col-span-12 xl:col-span-5 space-y-6 md:space-y-8">
          <div className="silk-panel p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-between group relative overflow-hidden transition-all duration-700 hover:border-maroon/20">
            <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center border border-zinc-900 group-hover:border-maroon/40 transition-silk shadow-2xl">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-500 group-hover:text-maroon transition-silk" />
              </div>
              <div>
                <p className="label-meta text-white">Authorized Peers</p>
                <p className="text-[8px] sm:text-[10px] text-zinc-600 font-mono uppercase mt-1 tracking-widest">Active_Node_Connections</p>
              </div>
            </div>
            <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter group-hover:text-maroon transition-silk relative z-10">{activeRefs}</span>
          </div>

          <div className="silk-panel p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] space-y-8 sm:space-y-10 group relative overflow-hidden transition-all duration-700 hover:border-maroon/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-maroon/[0.03] blur-[80px] rounded-full pointer-events-none group-hover:bg-maroon/[0.06] transition-all duration-1000"></div>
            <div className="relative z-10 flex items-center justify-between">
              <p className="label-meta text-maroon font-black tracking-[0.2em]">Synchronization Efficiency</p>
              <Zap className="w-5 h-5 text-maroon animate-pulse shadow-[0_0_15px_rgba(128,0,0,0.4)]" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-end">
                <span className="label-meta text-zinc-400">Topology Depth</span>
                <span className="text-4xl font-black text-white tracking-tighter italic">{activeRefs} <span className="text-sm text-zinc-800 font-mono">/ 20</span></span>
              </div>
              <div className="h-4 bg-zinc-950 border border-zinc-900 p-1 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-maroon/80 to-maroon shadow-[0_0_20px_#800000] rounded-full transition-all duration-1000 relative" style={{ width: `${(activeRefs / 20) * 100}%` }}>
                  <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/40 p-3 rounded-xl border border-white/5">
                <p className="label-meta text-[9px] text-zinc-500 uppercase tracking-widest">Aggregate Velocity Boost</p>
                <span className="text-xs font-black text-maroon">+{(activeRefs * REFERRAL_BOOST).toFixed(2)} <span className="text-[9px]">ARG/HR</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History - Technical Feed */}
      <div className="silk-panel rounded-2xl sm:rounded-[2.5rem] border-zinc-900/50 overflow-hidden shadow-2xl">
        <div className="px-6 sm:px-10 py-6 sm:py-8 bg-zinc-950/50 border-b border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-maroon rounded-full animate-pulse shadow-[0_0_8px_rgba(128,0,0,0.6)]"></div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Protocol_Synchronization_Logs</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-lg border border-zinc-800">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Filter_Status:</span>
            <span className="text-[9px] font-black text-maroon uppercase">All_Synced_Peers</span>
          </div>
        </div>

        <div className="min-h-[300px] bg-zinc-950/20">
          {isLoadingLogs ? (
            <div className="p-24 flex flex-col items-center justify-center gap-5">
              <Loader2 className="w-10 h-10 text-maroon animate-spin" />
              <p className="label-meta text-zinc-600 animate-pulse">Syncing Network Logs...</p>
            </div>
          ) : referralLogs.length > 0 ? (
            <div className="divide-y divide-zinc-900/40">
              {referralLogs.map((log, index) => {
                const chronologicalIndex = totalReferrals - 1 - index;
                const isBoosted = chronologicalIndex < MAX_REFERRALS;
                const date = log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Unknown';

                return (
                  <div key={log.uid} className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-white/[0.01] transition-all duration-500 gap-6 sm:gap-8 group/row">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-950 rounded-xl sm:rounded-2xl border border-zinc-900 flex items-center justify-center text-zinc-600 transition-silk group-hover/row:border-maroon/30 shadow-xl relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-maroon/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 group-hover/row:text-maroon transition-silk relative z-10" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-white uppercase tracking-tight group-hover/row:text-maroon transition-colors truncate">{log.displayName}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                          <span className="text-[9px] font-mono font-black text-zinc-600 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-widest">
                            Node_ID: {log.uid.slice(0, 12)}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-600 flex items-center gap-2 uppercase tracking-tight">
                            <Clock className="w-3 h-3" /> {date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 md:gap-12 bg-zinc-900/20 p-4 sm:p-6 rounded-2xl border border-white/5 relative overflow-hidden overflow-x-auto no-scrollbar">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
                      <div className="flex items-center gap-3 sm:gap-4 relative z-10 shrink-0">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Grant_Allocation</p>
                          <p className="text-sm font-mono font-black text-white">+{REFERRAL_BONUS_POINTS.toFixed(2)} <span className="text-[10px] text-zinc-500">ARG</span></p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>
                      <div className="w-px h-10 bg-zinc-800"></div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Velocity_Mod</p>
                          <p className={`text-sm font-mono font-black ${isBoosted ? 'text-maroon' : 'text-zinc-700'}`}>
                            {isBoosted ? `+${REFERRAL_BOOST.toFixed(2)} /hr` : 'CAP_MET'}
                          </p>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isBoosted ? 'bg-maroon/10 border-maroon/20 shadow-[0_0_15px_rgba(128,0,0,0.2)]' : 'bg-zinc-950 border-zinc-900'}`}>
                          <Zap className={`w-4 h-4 ${isBoosted ? 'text-maroon animate-pulse' : 'text-zinc-800'}`} />
                        </div>
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
