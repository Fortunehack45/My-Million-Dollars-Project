
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Share2, Users, ShieldCheck, Zap, Info, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { MAX_REFERRALS, REFERRAL_BOOST, REFERRAL_BONUS_POINTS, db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const Referrals = () => {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralLogs, setReferralLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const copyLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/#/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.referralCode || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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
    <div className="w-full space-y-16 animate-in fade-in duration-700 pb-32 relative">

      {/* Background Dramatic Atmospherics */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-maroon/[0.03] blur-[200px] -z-10 pointer-events-none" />

      {/* HEADER - Institutional Operations Interface */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-zinc-900/50 relative overflow-hidden">
        <div className="absolute -left-20 top-0 w-64 h-64 bg-maroon/[0.05] blur-[100px] rounded-full pointer-events-none" />
        <div className="flex items-start gap-8 relative z-10">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 flex items-center justify-center rounded-[1.5rem] shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Users className="w-8 h-8 text-maroon animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Authorization Bridge</h1>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest leading-none font-bold">Network_Expansion: Active</p>
              </div>
              <div className="h-1 w-1 rounded-full bg-zinc-800" />
              <p className="text-[11px] font-mono text-maroon font-black uppercase tracking-widest leading-none italic">
                Argus_Bridge_v2.8
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10 relative z-10 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Authorized_Network_Peers</p>
            <div className="flex items-center justify-end gap-3">
              <p className="text-2xl font-mono font-black text-white tracking-widest">{activeRefs}</p>
              <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest font-mono">/ 20</span>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-900" />
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Aggregate_Velocity_Mod</p>
            <p className="text-2xl font-mono font-black text-maroon tracking-widest">+{(activeRefs * REFERRAL_BOOST).toFixed(2)}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Interaction Card */}
        <div className="xl:col-span-12 2xl:col-span-7 silk-panel p-1.5 rounded-[4rem] bg-zinc-950 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
          <div className="bg-zinc-950 h-full rounded-[3.9rem] p-10 md:p-14 border border-zinc-900 group-hover:border-maroon/20 transition-all duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.03] to-transparent opacity-50 pointer-events-none" />
            <div className="flex flex-col gap-12 relative z-10">
              <div className="flex items-center gap-8 border-b border-white/[0.03] pb-8">
                <div className="p-4 bg-maroon/10 rounded-2xl border border-maroon/20">
                  <Share2 className="w-8 h-8 text-maroon" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Transmission Source</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-mono font-black italic">Peer_Invitation_Protocol // SECURE</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* URL Container */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono px-2">Direct_Sync_Vector</p>
                  <div className="bg-black/60 p-8 rounded-[2rem] border border-white/[0.02] space-y-8 group/link hover:border-maroon/30 transition-all duration-700">
                    <code className="block text-zinc-500 font-mono text-[11px] leading-relaxed break-all bg-zinc-900/50 p-6 rounded-2xl border border-white/[0.01]">
                      {window.location.origin}/#/?ref={user.referralCode}
                    </code>
                    <button
                      onClick={copyLink}
                      className={`h-20 w-full rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.5em] transition-all duration-700 flex items-center justify-center gap-5 relative overflow-hidden ${copiedLink ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-maroon text-white hover:bg-white hover:text-black shadow-[0_20px_40px_-10px_rgba(128,0,0,0.4)]'}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                      {copiedLink ? <><CheckCircle2 className="w-5 h-5" /> SYNC_COPIED</> : <><Share2 className="w-5 h-5" /> COPY_VECTOR</>}
                    </button>
                  </div>
                </div>

                {/* Code Container */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono px-2">Access_Key_Authorization</p>
                  <div className="bg-black/60 p-8 rounded-[2rem] border border-white/[0.02] space-y-8 group/code hover:border-maroon/30 transition-all duration-700">
                    <div className="bg-maroon/5 p-6 rounded-2xl border border-maroon/10 text-center">
                      <code className="text-3xl font-black text-maroon tracking-[0.3em] font-mono uppercase">
                        {user.referralCode}
                      </code>
                    </div>
                    <button
                      onClick={copyCode}
                      className={`h-20 w-full rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.5em] transition-all duration-700 flex items-center justify-center gap-5 relative overflow-hidden ${copiedCode ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-transparent border border-zinc-800 text-zinc-500 hover:border-maroon hover:text-white'}`}
                    >
                      {copiedCode ? <><CheckCircle2 className="w-5 h-5" /> KEY_COPIED</> : <><Zap className="w-5 h-5" /> COPY_AUTHORITY</>}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/30 p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-10 group/alert hover:border-maroon/20 transition-all">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover/alert:border-maroon/40 transition-all shadow-2xl relative">
                  <Info className="w-6 h-6 text-maroon animate-pulse" />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <p className="text-[10px] font-black text-maroon uppercase tracking-[0.4em] font-mono">Reward Allocation Protocol</p>
                  <p className="text-zinc-500 text-sm md:text-lg leading-relaxed italic font-medium">
                    Instant Grant: <span className="text-white font-bold">+{REFERRAL_BONUS_POINTS} ARG</span> per peer.
                    Velocity Boost: <span className="text-maroon font-black">+{REFERRAL_BOOST} ARG/hr</span> permanent modifier per active node.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
          </div>
        </div>

        {/* Efficiency & Depth Controls */}
        <div className="xl:col-span-12 2xl:col-span-5 space-y-10">
          <div className="silk-panel p-1.5 rounded-[3.5rem] bg-zinc-950 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] group relative overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="bg-zinc-950 h-full rounded-[3.4rem] p-12 flex flex-col items-center justify-center text-center gap-8 border border-white/[0.02] group-hover:border-maroon/20 transition-all duration-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-zinc-900/50 rounded-3xl flex items-center justify-center border border-zinc-800 group-hover:border-maroon/40 transition-all shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)]">
                <Zap className="w-12 h-12 text-maroon animate-pulse" />
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] font-mono italic">Topology_Velocity_Matrix</p>
                <h3 className="text-5xl font-black text-white tracking-widest">+{(activeRefs * REFERRAL_BOOST).toFixed(2)} <span className="text-xs text-maroon">ARG/HR</span></h3>
              </div>
            </div>
          </div>

          <div className="silk-panel p-1.5 rounded-[3.5rem] bg-zinc-950 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] group relative overflow-hidden transition-all duration-700">
            <div className="bg-zinc-950 h-full rounded-[3.4rem] p-12 space-y-12 border border-white/[0.02] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
                <p className="text-[10px] font-black text-maroon uppercase tracking-[0.4em] font-mono">Sync_Efficiency_Depth</p>
                <p className="text-sm font-mono font-black text-white italic">{(activeRefs / 20 * 100).toFixed(0)}% SYNCED</p>
              </div>
              <div className="space-y-10">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest font-mono">Authorized_Peers</p>
                    <p className="text-5xl font-black text-white tracking-tighter italic">{activeRefs}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-zinc-700 uppercase tracking-widest font-mono italic">Sync_Limit</p>
                    <p className="text-2xl font-black text-zinc-800 tracking-tighter">20/20</p>
                  </div>
                </div>
                <div className="h-6 bg-zinc-950 border border-zinc-900 p-1.5 rounded-full overflow-hidden shadow-inner relative group/bar">
                  <div
                    className="h-full bg-gradient-to-r from-maroon/80 to-maroon shadow-[0_0_20px_rgba(128,0,0,0.5)] rounded-full transition-all duration-[2000ms] relative"
                    style={{ width: `${(activeRefs / 20) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                  </div>
                  <div className="absolute inset-0 flex justify-around pointer-events-none opacity-20">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="w-px h-full bg-white/10" />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em] font-mono animate-pulse">Scanning_Topology_Vector...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History - Institutional Ledger */}
      <div className="p-1.5 silk-panel rounded-[4rem] bg-zinc-950 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)] relative group overflow-hidden">
        <div className="bg-zinc-950 h-full rounded-[3.9rem] overflow-hidden border border-zinc-900/50 relative">
          <div className="px-12 py-10 bg-black/40 border-b border-white/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-2xl relative z-20">
            <div className="flex items-center gap-6">
              <div className="w-3 h-3 bg-maroon rounded-full animate-pulse shadow-[0_0_12px_rgba(128,0,0,0.8)]"></div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Synchronization Manifest</h3>
                <p className="text-[9px] font-mono text-zinc-600 font-black uppercase tracking-[0.4em] italic mt-1">Peer_Activation_Sequence_Logs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Protocol_Standard:</span>
              <span className="text-[10px] font-black text-maroon uppercase tracking-widest font-mono italic">PEER_SYNC_v2.8</span>
            </div>
          </div>

          <div className="min-h-[400px] bg-zinc-950/20 relative z-10 overflow-x-auto custom-scrollbar">
            {isLoadingLogs ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-32">
                <Loader2 className="w-16 h-16 text-maroon animate-spin" />
                <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.6em] animate-pulse font-mono">Scanning_Network_Continuum...</p>
              </div>
            ) : referralLogs.length > 0 ? (
              <div className="divide-y divide-white/[0.02]">
                {referralLogs.map((log, index) => {
                  const chronologicalIndex = totalReferrals - 1 - index;
                  const isBoosted = chronologicalIndex < MAX_REFERRALS;
                  const date = log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'ARCH_ERROR';

                  return (
                    <div key={log.uid} className="px-12 py-10 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-white/[0.01] transition-all duration-500 gap-10 group/row">
                      <div className="flex items-center gap-10 min-w-0">
                        <div className="w-16 h-16 bg-zinc-950 rounded-[1.5rem] border border-zinc-900 flex items-center justify-center text-zinc-700 transition-all duration-700 group-hover/row:border-maroon/40 shadow-2xl relative overflow-hidden shrink-0">
                          <div className="absolute inset-0 bg-maroon/5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-700" />
                          <ShieldCheck className="w-8 h-8 group-hover/row:text-maroon transition-all relative z-10" />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <p className={`text-xl font-black uppercase tracking-tighter transition-colors ${user?.uid === log.uid ? 'text-maroon' : 'text-white group-hover/row:text-maroon'}`}>{log.displayName}</p>
                          <div className="flex flex-wrap items-center gap-5">
                            <span className="text-[10px] font-mono font-black text-zinc-700 bg-black/40 px-4 py-1 rounded-full border border-white/[0.02] uppercase tracking-[0.2em]">
                              PEER_ID: {log.uid.slice(0, 16)}
                            </span>
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-zinc-800" />
                              <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest font-mono italic">{date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-12 bg-black/20 p-8 rounded-[2.5rem] border border-white/[0.03] relative overflow-hidden group/rewards hover:border-maroon/10 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full group-hover/rewards:translate-x-full transition-transform duration-[2000ms] pointer-events-none"></div>

                        <div className="text-right space-y-1 shrink-0">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Grant_Allocation</p>
                          <p className="text-xl font-mono font-black text-white tracking-widest">+{REFERRAL_BONUS_POINTS.toFixed(2)} <span className="text-[10px] text-zinc-600 font-black">ARG</span></p>
                        </div>

                        <div className="h-10 w-px bg-zinc-900" />

                        <div className="text-right space-y-1">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Velocity_Modifier</p>
                          <div className="flex items-center justify-end gap-3">
                            <p className={`text-xl font-mono font-black tracking-widest ${isBoosted ? 'text-maroon' : 'text-zinc-800'}`}>
                              {isBoosted ? `+${REFERRAL_BOOST.toFixed(2)}` : 'CAP_MET'}
                            </p>
                            <Zap className={`w-5 h-5 ${isBoosted ? 'text-maroon animate-pulse' : 'text-zinc-900'}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-40 text-center space-y-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(128,0,0,0.02),transparent_70%)]" />
                <div className="w-32 h-32 bg-zinc-950 border border-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto grayscale opacity-20 relative z-10 transition-all duration-700 group-hover:scale-110">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <div className="space-y-4 relative z-10">
                  <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.8em] font-mono">Zero_Peers_Indexed</p>
                  <p className="text-zinc-700 text-lg font-medium italic max-w-xl mx-auto">Topology continuum currently isolated. Transmit handshake vectors to expand network authority.</p>
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
        </div>
      </div>

      <div className="flex justify-between items-center opacity-40 px-12">
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-zinc-700">Argus_Expansion_Relay // SECURE_HANDSHAKE</p>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-zinc-700 italic">Auth_Bridge_Cycle_9812</p>
      </div>
    </div>
  );
};

export default Referrals;
