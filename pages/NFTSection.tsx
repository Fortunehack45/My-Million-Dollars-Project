
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
   Lock, Shield, Cpu, Zap, Box,
   AlertTriangle, ScanLine, Fingerprint,
   Activity, ArrowUpRight, ShieldCheck,
   ChevronRight, Timer, Globe, Loader2, CheckCircle2
} from 'lucide-react';

const TierCard = ({ tier, points, required, status, icon: Icon }: any) => (
   <div className={`p-5 rounded-2xl border transition-all duration-500 group ${status === 'ELIGIBLE'
      ? 'bg-emerald-500/5 border-emerald-500/20'
      : 'bg-zinc-900/20 border-zinc-800 hover:border-zinc-700'
      }`}>
      <div className="flex justify-between items-start mb-4">
         <div className={`p-2 rounded-lg ${status === 'ELIGIBLE' ? 'bg-emerald-500/20' : 'bg-zinc-950'}`}>
            <Icon className={`w-4 h-4 ${status === 'ELIGIBLE' ? 'text-emerald-500' : 'text-zinc-600'}`} />
         </div>
         <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${status === 'ELIGIBLE' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'
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
                     className="h-full bg-maroon"
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

   return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in zoom-in duration-1000 will-change-premium">

         {/* Background Effects */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-maroon/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"></div>
         </div>

         <div className="relative z-10 text-center space-y-12 max-w-2xl px-6">
            <div className="flex flex-col items-center space-y-6">
               <div className="relative group perspective-1000">
                  <div className="absolute -inset-10 bg-maroon/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <div className="w-48 h-48 bg-zinc-950 border border-white/5 rounded-[3rem] flex items-center justify-center relative overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-110 hover:border-maroon/40 active:scale-95">
                     <div className="absolute inset-0 bg-gradient-to-t from-maroon/20 to-transparent"></div>
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent -translate-y-full animate-scanline opacity-30"></div>
                     <Lock className="w-20 h-20 text-maroon drop-shadow-[0_0_20px_rgba(128,0,0,0.6)] animate-pulse" />
                  </div>

                  {/* Corner Ornaments */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-maroon/30 rounded-tl-2xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-maroon/30 rounded-br-2xl"></div>
               </div>

               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full">
                     <div className="w-1.5 h-1.5 bg-maroon rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em]">Protocol_v2.8_Secure</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                     NFT_Vault <span className="text-maroon">Offline</span>
                  </h1>
                  <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                     Minting protocols are currently in stasis.<br />
                     Estimated availability: <span className="text-white">Epoch_1_Mainnet</span>
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="silk-panel p-6 rounded-3xl border-zinc-900 group hover:border-maroon/20 transition-all text-left">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                        <Shield className="w-4 h-4 text-zinc-500 group-hover:text-maroon transition-colors" />
                     </div>
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Validation_Required</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed font-mono">
                     Final verification of Genesis Operator identifiers is in progress. Historical ARG credits will act as weights.
                  </p>
               </div>
               <div className="silk-panel p-6 rounded-3xl border-zinc-900 group hover:border-maroon/20 transition-all text-left">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                        <Zap className="w-4 h-4 text-zinc-500 group-hover:text-maroon transition-colors" />
                     </div>
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Handshake_Sequence</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed font-mono">
                     Institutional liquidity bridges must achieve 100% synchronization before license issuance can resume.
                  </p>
               </div>
            </div>

            <div className="pt-6">
               <div className="p-6 bg-maroon/5 border border-maroon/10 rounded-2xl flex items-center justify-center gap-4 group hover:bg-maroon/10 transition-colors">
                  <Timer className="w-5 h-5 text-maroon animate-pulse" />
                  <p className="text-[11px] font-mono font-bold text-maroon uppercase tracking-[0.2em]">Synchronization in progress: 92.4% complete</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default NFTSection;
