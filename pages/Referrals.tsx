
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Share2, Users, ShieldCheck, Zap, Info, Clock, CheckCircle2, Loader2, Radio, Terminal, TrendingUp, Cpu, ChevronRight } from 'lucide-react';
import { MAX_REFERRALS, REFERRAL_BOOST, REFERRAL_BONUS_POINTS, db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion, Variants } from 'framer-motion';
import MatrixBackground from '../components/MatrixBackground';

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

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
        const q = query(
          collection(db, "users"),
          where("referredBy", "==", user.uid)
        );
        const snap = await getDocs(q);
        const sorted = snap.docs.map(d => d.data()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setReferralLogs(sorted);
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
    <div className="relative space-y-6 text-zinc-300 font-mono selection:bg-maroon selection:text-white pb-10 overflow-x-hidden">
      
      {/* SYSTEM OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <MatrixBackground color="rgba(128, 0, 0, 0.05)" opacity={0.15} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(128,0,0,0.06),rgba(128,0,0,0.02),rgba(128,0,0,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-[1700px] mx-auto px-6 relative z-10 w-full">
        
        {/* REFERRAL TOP BAR */}
        <motion.div variants={itemAnim} className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-zinc-950/80 border border-white/[0.05] p-6 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-maroon/10 rounded-lg flex items-center justify-center border border-maroon/20">
              <Users className="w-6 h-6 text-maroon animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-2 italic">Authorization_Bridge</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Expansion_Protocol_Active · v2.8</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-12 text-right">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none">Authorized_Peers</p>
              <p className="text-xl font-black text-white">{activeRefs} <span className="text-xs text-zinc-600">SYNCED</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none">Network_Velocity_Mod</p>
              <p className="text-xl font-black text-maroon">+{(activeRefs * REFERRAL_BOOST).toFixed(2)} <span className="text-xs">/HR</span></p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* INTERACTION PANEL: INVITE FLOW */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <motion.div variants={itemAnim} className="bg-zinc-950/50 border border-white/[0.05] p-8 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Share2 className="w-32 h-32 text-maroon" />
              </div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-6 italic">Transmission_Interface_01</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-4">
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Global_Handshake_URL</p>
                    <div className="bg-black/40 border border-white/[0.05] p-4 rounded-lg font-mono text-[10px] text-zinc-400 break-all select-all">
                      {window.location.origin}/#/?ref={user.referralCode}
                    </div>
                    <button 
                      onClick={copyLink}
                      className={`w-full py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${copiedLink ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' : 'bg-maroon text-white shadow-[0_0_15px_rgba(128,0,0,0.15)] hover:brightness-110'}`}
                    >
                      {copiedLink ? 'LINK_COPIED_IDENT' : 'COPY_HANDSHAKE_LINK'}
                    </button>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Discrete_Access_Code</p>
                    <div className="bg-maroon/5 border border-maroon/20 p-4 rounded-lg font-mono text-xl font-black text-maroon text-center tracking-[0.3em]">
                      {user.referralCode}
                    </div>
                    <button 
                      onClick={copyCode}
                      className={`w-full py-3.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${copiedCode ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' : 'bg-zinc-900 border border-white/5 text-white hover:border-maroon/40'}`}
                    >
                      {copiedCode ? 'CODE_COPIED_IDENT' : 'COPY_DISCRETE_CODE'}
                    </button>
                 </div>
              </div>

              <div className="p-6 bg-maroon/5 border border-maroon/10 rounded-xl flex gap-5 items-start">
                 <div className="p-3 bg-zinc-950 rounded-lg border border-white/[0.05]">
                    <Zap className="w-5 h-5 text-maroon animate-pulse" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Handshake_Reward_Parameters</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed italic">
                       Each verified peer synchronization yields <span className="text-maroon">+{REFERRAL_BONUS_POINTS} ARG</span> instantly. 
                       Permanent velocity boost: <span className="text-white">+{REFERRAL_BOOST} ARG/hr</span> per active node connection (CAP: {MAX_REFERRALS}).
                    </p>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* SIDE PANEL: EFFICIENCY METRICS */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
             <motion.div variants={itemAnim} className="bg-zinc-950/50 border border-white/[0.05] p-8 rounded-xl group overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] italic">Topology_Utilization</p>
                   <Radio className="w-4 h-4 text-maroon animate-pulse" />
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">Synchronization_Depth</p>
                      <p className="text-4xl font-black text-white italic tracking-tighter">{activeRefs} <span className="text-sm text-zinc-700 font-mono">/ {MAX_REFERRALS}</span></p>
                   </div>
                   <div className="h-2 bg-zinc-900 rounded-full border border-white/[0.05] overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(activeRefs / MAX_REFERRALS) * 100}%` }}
                        className="h-full bg-maroon shadow-[0_0_12px_#800000]"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.05]">
                      <div className="space-y-1">
                         <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Current_Velocity_Mod</p>
                         <p className="text-lg font-black text-white italic">+{(activeRefs * REFERRAL_BOOST).toFixed(2)} /HR</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Aggregate_Yield</p>
                         <p className="text-lg font-black text-maroon italic">+{activeRefs * REFERRAL_BONUS_POINTS} ARG</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>

          {/* BOTTOM PANEL: PROTOCOL LOGS */}
          <div className="lg:col-span-12">
             <motion.div variants={itemAnim} className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl overflow-hidden min-h-[400px] flex flex-col">
                <div className="p-6 border-b border-white/[0.05] flex items-center justify-between bg-zinc-900/40 backdrop-blur-sm">
                   <div className="flex items-center gap-3">
                      <Terminal className="w-4 h-4 text-maroon" />
                      <span className="text-xs font-black uppercase text-white tracking-widest italic">Protocol_Synchronization_Logs</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-maroon animate-pulse shadow-[0_0_8px_#800000]"></div>
                      <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">Live_Sync_Feed</span>
                   </div>
                </div>

                <div className="flex-1 bg-black/20 overflow-y-auto max-h-[500px] custom-scrollbar">
                   {isLoadingLogs ? (
                      <div className="h-full flex flex-col items-center justify-center p-20 gap-4 opacity-40">
                         <Loader2 className="w-8 h-8 animate-spin text-maroon" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Syncing_Protocol_Ledger...</p>
                      </div>
                   ) : referralLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-20 opacity-20 text-center">
                         <ShieldCheck className="w-12 h-12 mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No_Active_Peer_Synapses_Identified</p>
                      </div>
                   ) : (
                      <div className="divide-y divide-white/[0.03]">
                         {referralLogs.map((log, i) => (
                            <div key={log.uid} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-all group">
                                <div className="flex items-center gap-6">
                                  <div className="w-12 h-12 bg-zinc-900 border border-white/[0.05] rounded-lg flex items-center justify-center shrink-0 group-hover:bg-maroon/10 transition-colors">
                                     <ShieldCheck className="w-5 h-5 text-zinc-600 group-hover:text-maroon transition-colors" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-sm font-black text-white italic uppercase tracking-tight group-hover:text-maroon transition-colors">{log.displayName}</p>
                                     <div className="flex items-center gap-4 mt-1">
                                        <span className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest">NODE_ID: {log.uid.slice(0, 12)}</span>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(log.createdAt || 0).toLocaleDateString('en-GB')}</span>
                                     </div>
                                  </div>
                               </div>

                               <div className="flex items-center gap-8 bg-black/40 p-4 rounded-lg border border-white/[0.03]">
                                  <div className="text-right">
                                     <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mb-1">Packet_Grant</p>
                                     <p className="text-sm font-black text-white italic tracking-tighter tabular-nums">+{REFERRAL_BONUS_POINTS.toFixed(2)} ARG</p>
                                  </div>
                                  <div className="h-6 w-px bg-white/[0.05]"></div>
                                  <div className="text-right">
                                     <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mb-1">Velocity_Mod</p>
                                     <p className={`text-sm font-black italic tracking-tighter tabular-nums ${i < MAX_REFERRALS ? 'text-maroon' : 'text-zinc-700'}`}>
                                        {i < MAX_REFERRALS ? `+${REFERRAL_BOOST.toFixed(2)} /HR` : 'CAP_STABILIZED'}
                                     </p>
                                  </div>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${i < MAX_REFERRALS ? 'bg-maroon/10 border-maroon/20 text-maroon animate-pulse' : 'bg-zinc-950 border-white/5 text-zinc-800'}`}>
                                     <Zap className="w-4 h-4" />
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </motion.div>
          </div>
        </div>

        {/* BOTTOM ADVISORY */}
        <motion.div variants={itemAnim} className="mt-8 rounded-xl border border-maroon/10 bg-maroon/5 p-5 flex gap-4 items-center">
          <Info className="w-5 h-5 text-maroon" />
          <div className="flex-1">
            <p className="text-[10px] font-black text-maroon uppercase tracking-[0.2em] mb-1 italic leading-none">Topology_Authorization_Notice</p>
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider leading-relaxed">
               All authorization bridge connections are cryptographically verified via the GhostDAG mainnet. Points are allocated once secondary node identity proof is established.
            </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Referrals;
