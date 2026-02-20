
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
   const [mintState, setMintState] = useState<'IDLE' | 'MINTING' | 'CONFIRMING' | 'SUCCESS'>('IDLE');

   const tiers = [
      { tier: 'Alpha Genesis', required: 10000, icon: ShieldCheck, status: points >= 10000 ? 'ELIGIBLE' : 'LOCKED' },
      { tier: 'Beta Operator', required: 5000, icon: Activity, status: points >= 5000 ? 'ELIGIBLE' : 'LOCKED' },
      { tier: 'Node Aspirant', required: 1000, icon: Cpu, status: points >= 1000 ? 'ELIGIBLE' : 'LOCKED' },
   ];

   const handleMint = () => {
      setMintState('MINTING');
      setTimeout(() => setMintState('CONFIRMING'), 2000);
      setTimeout(() => setMintState('SUCCESS'), 4000);
   };

   return (
      <div className="w-full flex flex-col relative overflow-hidden animate-in fade-in duration-1000 will-change-premium">

         {/* Premium Dynamic Background */}
         <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(128,0,0,0.05),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(128,0,0,0.05),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
         </div>

         <div className="relative z-10 w-full max-w-7xl mx-auto px-0">

            {/* Institutional Header - Resized to Dashboard Standards */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-900 mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded-xl">
                     <Timer className="w-5 h-5 text-maroon animate-pulse" />
                  </div>
                  <div>
                     <h1 className="text-base font-black text-white uppercase tracking-tight">Authority_Licenses</h1>
                     <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Awaiting_Handshake · Protocol_v2.8</p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-5">
                  <div className="text-right">
                     <p className="label-meta mb-0.5">Authenticated_Operator</p>
                     <p className="text-sm font-mono font-black text-white">{points.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-zinc-600 text-[10px]">ARG</span></p>
                  </div>
                  <div className="h-6 w-px bg-zinc-800" />
                  <div className="w-9 h-9 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center">
                     <Fingerprint className="w-5 h-5 text-maroon/60" />
                  </div>
               </div>
            </header>

            {/* Vault Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

               {/* Left: Requirements & Tiers */}
               <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-1 h-4 bg-maroon rounded-full"></div>
                     <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Tier_Validation_Protocol</h3>
                  </div>
                  <div className="grid gap-6">
                     {tiers.map((t, i) => (
                        <TierCard key={i} {...t} points={points} />
                     ))}
                  </div>
                  <div className="p-8 bg-zinc-900/20 backdrop-blur-sm border border-zinc-900 border-dashed rounded-3xl mt-12 relative group overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/5 to-transparent -translate-y-full animate-[scanline_6s_linear_infinite]"></div>
                     <p className="text-[11px] text-zinc-500 font-bold leading-relaxed italic text-center relative z-10 uppercase tracking-widest">
                        "Authority licenses are restricted to verified nodes. Credits earned during Epoch 0 transition act as weighted priority for Genesis allocation."
                     </p>
                  </div>
               </div>

               {/* Center: Premium Holographic Artifact */}
               <div className="lg:col-span-4 order-1 lg:order-2 px-0">
                  <div className="relative group perspective-1000 max-w-[320px] mx-auto sm:max-w-none">
                     {/* Intense Dynamic Glow */}
                     <div className="absolute -inset-12 bg-maroon/20 blur-[120px] rounded-full opacity-40 group-hover:opacity-70 transition-all duration-1000 animate-pulse"></div>
                     <div className="absolute -inset-4 bg-gradient-to-tr from-maroon/20 to-transparent blur-3xl rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                     {/* The Main License Frame */}
                     <div className="relative aspect-[3/4.4] bg-black rounded-[3.5rem] border border-white/10 p-5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1),inset_0_1px_2px_rgba(255,255,255,0.1)] overflow-hidden transition-silk group-hover:scale-[1.04] group-hover:border-maroon/40 group-hover:shadow-[0_60px_120px_-20px_rgba(128,0,0,0.3)]">

                        {/* High-Impact Glass Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent z-30 pointer-events-none"></div>

                        {/* Interior High-Tech Foundation */}
                        <div className="h-full w-full bg-[#050505] rounded-[2.8rem] border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden group/hologram">

                           {/* Adaptive Background Grid */}
                           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.05)_0%,transparent_70%)] opacity-50"></div>
                           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                           {/* Multiple Dynamic Scanning Lines */}
                           <div className="absolute inset-0 pointer-events-none z-20">
                              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-maroon to-transparent absolute top-0 animate-[scanline_3s_linear_infinite] opacity-50 shadow-[0_0_20px_rgba(128,0,0,0.8)]"></div>
                              <div className="w-full h-[150px] bg-gradient-to-b from-maroon/10 to-transparent absolute top-0 animate-[scanline_6s_linear_infinite] delay-700 opacity-30"></div>
                              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
                           </div>

                           {/* Central Identity Core */}
                           <div className="relative z-10 flex flex-col items-center w-full px-8">
                              <div className="relative mb-14">
                                 {/* Multi-layered Orb Glow */}
                                 <div className="absolute -inset-12 bg-maroon/30 blur-3xl rounded-full animate-pulse-slow"></div>
                                 <div className="absolute -inset-4 bg-maroon/10 blur-2xl rounded-full animate-pulse"></div>

                                 <div className="relative w-44 h-44 bg-black border-[3px] border-white/10 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,1)] transition-silk group-hover:border-maroon/60 group-hover:shadow-[0_0_100px_rgba(128,0,0,0.5)] overflow-hidden">

                                    {/* Rotating Mechanical Rings */}
                                    <div className="absolute inset-1 border-[1.5px] border-dashed border-white/[0.05] rounded-full animate-spin-slow z-20 pointer-events-none"></div>
                                    <div className="absolute inset-4 border-[2px] border-t-maroon/40 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-reverse z-20 pointer-events-none"></div>
                                    <div className="absolute inset-6 border border-maroon/20 rounded-full z-20 pointer-events-none"></div>

                                    {/* User Provided License Image - New Branding */}
                                    <img
                                       src="/logo.png"
                                       alt="Argus Authority License"
                                       className="relative z-10 w-full h-full object-contain p-8 filter drop-shadow-[0_0_20px_rgba(128,0,0,0.4)] group-hover:drop-shadow-[0_0_30px_rgba(128,0,0,0.6)] transition-all duration-1000 scale-110 group-hover:scale-125"
                                    />

                                    {/* Holographic Scanline Overlay on Image */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-maroon/20 to-transparent opacity-0 group-hover:opacity-40 z-15 transition-opacity duration-700 pointer-events-none"></div>

                                    {/* Digital Micro-Labels */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-zinc-950 px-3 py-1 border border-white/10 rounded-full shadow-2xl z-30">
                                       <span className="text-[7px] font-mono font-black text-zinc-500 uppercase tracking-[0.4em]">Core_Handshake</span>
                                    </div>
                                 </div>

                                 {/* Corner Brackets - Refined */}
                                 <div className="absolute -top-6 -left-6 w-10 h-10 border-t-[3px] border-l-[3px] border-maroon/50 rounded-tl-2xl transition-all duration-700 group-hover:-translate-x-3 group-hover:-translate-y-3"></div>
                                 <div className="absolute -bottom-6 -right-6 w-10 h-10 border-b-[3px] border-r-[3px] border-maroon/50 rounded-br-2xl transition-all duration-700 group-hover:translate-x-3 group-hover:translate-y-3"></div>
                              </div>

                              <div className="text-center space-y-5 w-full">
                                 <div className="space-y-1">
                                    <h3 className="text-5xl font-black text-white uppercase tracking-[-0.07em] leading-none group-hover:text-maroon transition-colors duration-700">
                                       {mintState === 'SUCCESS' ? 'License_Active' : 'Access_Denied'}
                                    </h3>
                                    <p className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-[0.5em]">
                                       {mintState === 'SUCCESS' ? 'Authority_Verified' : 'Security_Protocol_Active'}
                                    </p>
                                 </div>

                                 <div className={`inline-flex items-center gap-4 px-6 py-2.5 backdrop-blur-3xl border rounded-xl shadow-2xl transition-all duration-500 ${mintState === 'SUCCESS' ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full animate-ping ${mintState === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <span className={`text-[11px] font-mono font-bold uppercase tracking-[0.3em] ${mintState === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'
                                       }`}>
                                       {mintState === 'SUCCESS' ? 'Authorized_Identity' : 'Restricted_Epoch_0'}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* Institutional Bottom Status Console */}
                           <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black via-black/90 to-transparent pt-32 z-20">
                              <div className="grid grid-cols-2 gap-10 border-t border-white/10 pt-10">
                                 <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Authority_Weight</p>
                                    </div>
                                    <p className="text-3xl font-mono font-black text-zinc-500 tracking-tighter">
                                       {mintState === 'SUCCESS' ? '1.24x' : '0.00x'}
                                    </p>
                                 </div>
                                 <div className="text-right space-y-3">
                                    <div className="flex items-center justify-end gap-2">
                                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Registry_Serial</p>
                                       <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                                    </div>
                                    <p className="text-3xl font-mono font-black text-zinc-500 tracking-tighter shadow-sm">
                                       {mintState === 'SUCCESS' ? '#VERIFIED' : '#SECURE'}
                                    </p>
                                 </div>
                              </div>
                           </div>

                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Technical Protocol Specs */}
               <div className="lg:col-span-4 space-y-8 order-3">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-1.5 h-5 bg-maroon rounded-full shadow-[0_0_10px_rgba(128,0,0,0.8)]"></div>
                     <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Protocol_Specifications</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                     {[
                        { label: 'Computational Load', val: '64_CORES_ZEN4', icon: Cpu },
                        { label: 'Memory Allocation', val: '256GB_ECC_L5', icon: Box },
                        { label: 'Network Throughput', val: '40GBPS_OPTIC', icon: Globe },
                        { label: 'Registry Status', val: 'PROVISIONED', icon: ShieldCheck },
                     ].map((meta, i) => (
                        <div key={i} className="flex flex-col p-6 bg-zinc-900/10 backdrop-blur-md border border-white/5 rounded-[1.5rem] hover:border-maroon/30 hover:bg-zinc-900/30 transition-all duration-700 group cursor-default relative overflow-hidden text-left">
                           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                              <meta.icon className="w-8 h-8 text-maroon" />
                           </div>
                           <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.25em] group-hover:text-zinc-400 transition-colors mb-2">{meta.label}</span>
                           <span className="text-sm font-mono font-black text-white group-hover:text-maroon transition-colors uppercase tracking-tight">{meta.val}</span>
                        </div>
                     ))}
                  </div>

                  <div className="pt-12">
                     <button
                        onClick={handleMint}
                        disabled={points < 1000 || mintState !== 'IDLE'}
                        className={`relative w-full py-7 font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 ${points >= 1000 && mintState === 'IDLE'
                           ? 'bg-maroon text-white hover:bg-maroon/80 active:scale-95'
                           : 'bg-zinc-900/40 backdrop-blur-3xl border border-white/5 text-zinc-700 cursor-not-allowed'
                           }`}
                     >
                        <div className="relative z-10 flex items-center justify-center gap-5">
                           {mintState === 'IDLE' ? (
                              <>
                                 <ScanLine className="w-6 h-6" />
                                 {points >= 1000 ? 'Initialize Authority Mint' : 'Insufficient ARG Credits'}
                              </>
                           ) : mintState === 'MINTING' ? (
                              <>
                                 <Loader2 className="w-6 h-6 animate-spin" />
                                 Uploading_Handshake...
                              </>
                           ) : mintState === 'CONFIRMING' ? (
                              <>
                                 <Activity className="w-6 h-6 animate-pulse" />
                                 GhostDAG_Validation...
                              </>
                           ) : (
                              <>
                                 <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                 License_Synchronized
                              </>
                           )}
                        </div>
                        {/* Progress bar overlay */}
                        {(mintState === 'MINTING' || mintState === 'CONFIRMING') && (
                           <div className="absolute inset-0 bg-maroon/20">
                              <div className="h-full bg-maroon/40 animate-[loading_4s_linear_forwards]" style={{ width: '100%' }}></div>
                           </div>
                        )}
                     </button>
                     <div className="mt-8 flex flex-col items-center gap-3">
                        <p className="text-center text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em] leading-relaxed">
                           <span className="text-zinc-500">MINT COST: 1,000 ARG (≈ $4,200.00)</span><br />
                           Requires Identity_Vetting_Protocol v.0.12<br />
                           <span className="text-maroon/40 italic">Unauthorized access attempts are logged in GhostDAG</span>
                        </p>
                     </div>
                  </div>

                  {/* Utility Feature Icons */}
                  <div className="grid grid-cols-2 gap-4 mt-10">
                     <div className="p-6 bg-zinc-900/10 border border-white/5 rounded-2xl text-center space-y-3 group hover:border-maroon/20 hover:shadow-2xl hover:shadow-maroon/5 transition-all">
                        <Zap className="w-6 h-6 text-zinc-700 group-hover:text-maroon transition-colors mx-auto" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">Yield_Boost</p>
                     </div>
                     <div className="p-6 bg-zinc-900/10 border border-white/5 rounded-2xl text-center space-y-3 group hover:border-maroon/20 hover:shadow-2xl hover:shadow-maroon/5 transition-all">
                        <Globe className="w-6 h-6 text-zinc-700 group-hover:text-maroon transition-colors mx-auto" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">Priority_Exit</p>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

export default NFTSection;
