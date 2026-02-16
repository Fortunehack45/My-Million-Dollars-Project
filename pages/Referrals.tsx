import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Share2, Users, ShieldCheck, Zap, Info } from 'lucide-react';
import { MAX_REFERRALS, REFERRAL_BOOST, REFERRAL_BONUS_POINTS } from '../services/firebase';

const Referrals = () => {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    if (!user) return;
    const link = `${window.location.origin}/#/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  const activeRefs = Math.min(user.referralCount, MAX_REFERRALS);
  const remaining = Math.max(0, MAX_REFERRALS - user.referralCount);

  return (
    <div className="w-full space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Peer Network</h1>
        <p className="text-zinc-500 text-sm font-medium">Expand network topology to earn speed boosts and direct credit bonuses.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Interaction Card */}
        <div className="lg:col-span-7 surface p-10 rounded-3xl space-y-10 border-primary/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="label-meta text-white">Handshake Authorization Link</h3>
              <p className="text-[10px] text-zinc-500">Global Peer Invitation System</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
              <code className="text-primary font-mono text-xs font-black tracking-tight">{window.location.origin}/#/?ref={user.referralCode}</code>
              <button onClick={copyToClipboard} className="btn-primary !px-6 !py-3 w-full md:w-auto">
                {copied ? 'COPIED_HASH' : 'COPY_LINK'}
              </button>
            </div>
            
            <div className="p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800 flex items-start gap-4">
               <Info className="w-5 h-5 text-zinc-600 shrink-0 mt-1" />
               <div className="space-y-1">
                 <p className="text-[11px] text-zinc-400 font-bold uppercase">Reward Protocol</p>
                 <p className="text-[10px] text-zinc-500 leading-relaxed font-medium italic">
                    Earn <span className="text-white">+{REFERRAL_BONUS_POINTS} ARG</span> instantly per peer. 
                    Unlock <span className="text-primary">+{REFERRAL_BOOST} ARG/hr</span> permanent mining speed boost per active node. 
                    <span className="text-zinc-600 block mt-1">Status: {activeRefs}/{MAX_REFERRALS} Peers Synced (Cap: 20)</span>
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Stats and Progress */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface p-8 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
               <Users className="w-5 h-5 text-zinc-600" />
               <p className="label-meta">Connected Peers</p>
            </div>
            <span className="text-4xl font-mono font-bold text-white tracking-tighter">{activeRefs}</span>
          </div>

          <div className="surface p-10 rounded-3xl space-y-8 bg-gradient-to-br from-zinc-950 to-zinc-900">
             <div className="flex items-center justify-between">
                <p className="label-meta text-primary">Mining Efficiency</p>
                <Zap className="w-4 h-4 text-primary" />
             </div>
             <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase">
                   <span>Topology Depth</span>
                   <span className="text-white">{activeRefs} / 20</span>
                </div>
                <div className="h-4 bg-zinc-950 border border-zinc-800 p-0.5 rounded-full overflow-hidden">
                   <div className="h-full bg-primary shadow-[0_0_10px_#f43f5e] rounded-full transition-all duration-1000" style={{ width: `${(activeRefs/20)*100}%` }}></div>
                </div>
                <p className="text-[9px] text-zinc-600 font-medium italic">Total Speed Boost: +{(activeRefs * REFERRAL_BOOST).toFixed(2)} ARG/hr</p>
             </div>
          </div>
        </div>
      </div>

      {/* Referral History - Technical Feed */}
      <div className="surface rounded-3xl overflow-hidden">
         <div className="p-6 bg-zinc-900/30 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="label-meta">Protocol_Commission_Logs</h3>
            <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase">Filter: ALL_PEERS</span>
         </div>
         <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 rounded-full flex items-center justify-center mx-auto grayscale opacity-20">
               <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No active peers identified</p>
               <p className="text-[10px] text-zinc-600 font-medium">Transmit your authorization link to begin topology expansion.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Referrals;