
import React from 'react';
import { useAuth } from '../context/AuthContext';
// Add missing 'Globe' import from lucide-react.
import { 
  Lock, Shield, Cpu, Zap, Box, 
  AlertTriangle, ScanLine, Fingerprint, 
  Activity, ArrowUpRight, ShieldCheck,
  ChevronRight, Timer, Globe
} from 'lucide-react';

const TierCard = ({ tier, points, required, status, icon: Icon }: any) => (
  <div className={`p-5 rounded-2xl border transition-all duration-500 group ${
    status === 'ELIGIBLE' 
      ? 'bg-emerald-500/5 border-emerald-500/20' 
      : 'bg-zinc-900/20 border-zinc-800 hover:border-zinc-700'
  }`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${status === 'ELIGIBLE' ? 'bg-emerald-500/20' : 'bg-zinc-950'}`}>
        <Icon className={`w-4 h-4 ${status === 'ELIGIBLE' ? 'text-emerald-500' : 'text-zinc-600'}`} />
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
        status === 'ELIGIBLE' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'
      }`}>
        {status}
      </span>
    </div>
    <h4 className="text-xs font-black text-white uppercase tracking-tight mb-1">{tier}</h4>
    <div className="flex justify-between items-end">
      <p className="text-[10px] text-zinc-500 font-mono">{required.toLocaleString()} ARG</p>
      {status !== 'ELIGIBLE' && (
        <div className="text-right">
          <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1">Progress</p>
          <div className="w-24 h-1 bg-zinc-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${Math.min(100, (points / required) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  </div>
);

const NFTSection = () => {
  const { user } = useAuth();
  const points = user?.points || 0;

  const tiers = [
    { tier: 'Alpha Genesis', required: 10000, icon: ShieldCheck, status: points >= 10000 ? 'ELIGIBLE' : 'LOCKED' },
    { tier: 'Beta Operator', required: 5000, icon: Activity, status: points >= 5000 ? 'ELIGIBLE' : 'LOCKED' },
    { tier: 'Node Aspirant', required: 1000, icon: Cpu, status: points >= 1000 ? 'ELIGIBLE' : 'LOCKED' },
  ];

  return (
    <div className="w-full min-h-[90vh] flex flex-col relative overflow-hidden pb-20 animate-in fade-in duration-700">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.03),transparent_70%)]"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="relative z-10 w-full">
        
        {/* Institutional Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-zinc-900 pb-12">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                 <Timer className="w-3 h-3 text-primary animate-pulse" />
                 <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Mainnet Epoch Transition: Pending</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                 Node<br /><span className="text-zinc-700">Licenses</span>
              </h1>
           </div>

           <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex items-center gap-6 backdrop-blur-sm min-w-[300px]">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
                 <Fingerprint className="w-6 h-6 text-primary" />
              </div>
              <div>
                 <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Operator Balance</p>
                 <p className="text-2xl font-mono font-black text-white">{points.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-xs text-zinc-600">ARG</span></p>
              </div>
           </div>
        </header>

        {/* Vault Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* Left: Requirements & Tiers */}
           <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
              <div className="flex items-center gap-2 mb-4">
                 <Shield className="w-4 h-4 text-zinc-500" />
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">Eligibility Protocol</h3>
              </div>
              <div className="grid gap-4">
                 {tiers.map((t, i) => (
                    <TierCard key={i} {...t} points={points} />
                 ))}
              </div>
              <div className="p-6 bg-zinc-900/10 border border-zinc-800 border-dashed rounded-2xl mt-8">
                 <p className="text-[10px] text-zinc-600 font-medium leading-relaxed italic text-center">
                   "Minting protocol is currently locked until Epoch 1 transition. Points earned during Testnet_v2.8 act as priority-pass weight for Genesis licenses."
                 </p>
              </div>
           </div>

           {/* Center: Hero Hologram */}
           <div className="lg:col-span-4 order-1 lg:order-2">
              <div className="relative group">
                 {/* Card Outer Glow */}
                 <div className="absolute -inset-4 bg-primary/5 blur-[60px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 
                 {/* The Asset Card */}
                 <div className="relative aspect-[3/4] bg-zinc-950 rounded-[2.5rem] border border-zinc-800 p-3 shadow-2xl overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]">
                    
                    {/* Interior Design */}
                    <div className="h-full w-full bg-zinc-900/20 rounded-[2rem] border border-zinc-800/50 flex flex-col items-center justify-center relative overflow-hidden">
                       
                       {/* Animated Scanning Line */}
                       <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="w-full h-[20%] bg-gradient-to-b from-transparent via-primary/10 to-transparent absolute top-0 animate-[scanline_4s_linear_infinite]"></div>
                       </div>

                       {/* Central Core */}
                       <div className="relative z-10 flex flex-col items-center">
                          <div className="relative mb-12">
                             <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
                             <div className="relative w-28 h-28 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center shadow-2xl">
                                <Lock className="w-12 h-12 text-primary" />
                             </div>
                             {/* Orbiting Elements */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-primary/10 rounded-full animate-spin-slow"></div>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-t border-primary/30 rounded-full animate-spin-slow"></div>
                          </div>

                          <div className="text-center space-y-2">
                             <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Vault_Locked</h3>
                             <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Epoch_Mismatch</span>
                             </div>
                          </div>
                       </div>

                       {/* Bottom Status Panel */}
                       <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-zinc-950 to-transparent pt-24">
                          <div className="flex justify-between items-end border-t border-zinc-900/80 pt-4">
                             <div className="space-y-1">
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Current Multiplier</p>
                                <p className="text-xl font-mono font-bold text-zinc-400">0.00x</p>
                             </div>
                             <div className="text-right space-y-1">
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Serial Number</p>
                                <p className="text-xl font-mono font-bold text-zinc-400">#---</p>
                             </div>
                          </div>
                       </div>

                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Technical Metadata */}
           <div className="lg:col-span-4 space-y-6 order-3">
              <div className="flex items-center gap-2 mb-4">
                 <Activity className="w-4 h-4 text-zinc-500" />
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">Protocol Metadata</h3>
              </div>

              <div className="space-y-4">
                 {[
                   { label: 'Blockchain', val: 'Argus_GhostDAG' },
                   { label: 'Contract Standard', val: 'ERC-721-Authority' },
                   { label: 'Royalties', val: '2.5% Perpetual' },
                   { label: 'Governance Power', val: '2x Voting Weight' },
                 ].map((meta, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-zinc-950/50 border border-zinc-900 rounded-xl hover:border-zinc-700 transition-colors">
                       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{meta.label}</span>
                       <span className="text-xs font-mono font-bold text-white">{meta.val}</span>
                    </div>
                 ))}
              </div>

              <div className="pt-8">
                 <button 
                   disabled 
                   className="w-full py-5 bg-zinc-900 border border-zinc-800 text-zinc-600 font-black uppercase tracking-[0.2em] rounded-2xl cursor-not-allowed flex items-center justify-center gap-3 transition-all group"
                 >
                   <ScanLine className="w-4 h-4 group-hover:text-zinc-400" />
                   Wait for Handshake
                 </button>
                 <p className="text-center text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-4">
                    Identity validation required for mainnet access
                 </p>
              </div>

              {/* Utility Feature List */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                 <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl text-center space-y-2">
                    <Zap className="w-4 h-4 text-zinc-600 mx-auto" />
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Yield Boost</p>
                 </div>
                 <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl text-center space-y-2">
                    <Globe className="w-4 h-4 text-zinc-600 mx-auto" />
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Priority Exit</p>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default NFTSection;
