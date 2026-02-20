
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

   const tiers = [
      { tier: 'Alpha Genesis', required: 10000, icon: ShieldCheck, status: points >= 10000 ? 'ELIGIBLE' : 'LOCKED' },
      { tier: 'Beta Operator', required: 5000, icon: Activity, status: points >= 5000 ? 'ELIGIBLE' : 'LOCKED' },
      { tier: 'Node Aspirant', required: 1000, icon: Cpu, status: points >= 1000 ? 'ELIGIBLE' : 'LOCKED' },
   ];

   return (
      <div className="w-full min-h-[90vh] flex flex-col relative overflow-hidden pb-20 animate-in fade-in duration-1000">

         {/* Premium Dynamic Background */}
         <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(128,0,0,0.05),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(128,0,0,0.05),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
         </div>

         <div className="relative z-10 w-full max-w-7xl mx-auto px-6">

            {/* Institutional Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-zinc-900 pb-16 pt-12">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full group">
                     <Timer className="w-3.5 h-3.5 text-maroon animate-pulse" />
                     <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Synchronization Status: <span className="text-maroon">Awaiting_Mainnet_Bridge</span></span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-[-0.05em] leading-[0.85]">
                     Protocol<br /><span className="text-zinc-800 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">Authority_Licenses</span>
                  </h1>
               </div>

               <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] flex items-center gap-8 min-w-[340px] shadow-2xl relative group overflow-hidden transition-all duration-500 hover:border-maroon/20">
                  <div className="absolute inset-0 bg-gradient-to-tr from-maroon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-xl relative z-10">
                     <Fingerprint className="w-8 h-8 text-maroon drop-shadow-[0_0_10px_rgba(128,0,0,0.4)]" />
                  </div>
                  <div className="relative z-10">
                     <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Authenticated_Operator</p>
                     <p className="text-3xl font-mono font-black text-white tracking-tighter">{points.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm text-zinc-600 font-bold ml-1">ARG</span></p>
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
               <div className="lg:col-span-4 order-1 lg:order-2 px-4 md:px-0">
                  <div className="relative group perspective-1000">
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

                                    {/* User Provided License Image */}
                                    <img
                                       src="/argus_license.png"
                                       alt="Argus Authority License"
                                       className="relative z-10 w-full h-full object-cover filter grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 scale-110 group-hover:scale-100"
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
                                    <h3 className="text-5xl font-black text-white uppercase tracking-[-0.07em] leading-none group-hover:text-maroon transition-colors duration-700">Access_Denied</h3>
                                    <p className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-[0.5em]">Security_Protocol_Active</p>
                                 </div>

                                 <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-red-950/20 backdrop-blur-3xl border border-red-500/30 rounded-xl shadow-2xl">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                    <span className="text-[11px] font-mono font-bold text-red-500 uppercase tracking-[0.3em]">Restricted_Epoch_0</span>
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
                                    <p className="text-3xl font-mono font-black text-zinc-500 tracking-tighter">0.00x</p>
                                 </div>
                                 <div className="text-right space-y-3">
                                    <div className="flex items-center justify-end gap-2">
                                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Registry_Serial</p>
                                       <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                                    </div>
                                    <p className="text-3xl font-mono font-black text-zinc-500 tracking-tighter shadow-sm">#SECURE</p>
                                 </div>
                              </div>
                           </div>

                        </div>
                     </div>

                     {/* Advanced Floating Metadata Labels */}
                     <div className="absolute -left-12 top-1/2 -rotate-90 origin-center hidden 2xl:block opacity-30">
                        <div className="flex items-center gap-4">
                           <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.6em] whitespace-nowrap">ID_VERIFICATION_REQUIRED_V2.0</span>
                           <div className="w-20 h-px bg-zinc-800"></div>
                        </div>
                     </div>

                     <div className="absolute -right-12 top-1/2 rotate-90 origin-center hidden 2xl:block opacity-30">
                        <div className="flex items-center gap-4">
                           <div className="w-20 h-px bg-zinc-800"></div>
                           <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.6em] whitespace-nowrap">CRYPTOGRAPHIC_ENCRYPTION_LAYER</span>
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

                  <div className="grid grid-cols-1 gap-5">
                     {[
                        { label: 'Core Infrastructure', val: 'Argus_GhostDAG v2.0' },
                        { label: 'Security Class', val: 'Institutional_Alpha' },
                        { label: 'Resource Yield', val: '2.4x Multiplier' },
                        { label: 'Network Rights', val: 'Root_Authorization' },
                     ].map((meta, i) => (
                        <div key={i} className="flex justify-between items-center p-6 bg-zinc-900/10 backdrop-blur-md border border-white/5 rounded-[1.5rem] hover:border-maroon/30 hover:bg-zinc-900/30 transition-all duration-700 group cursor-default">
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] group-hover:text-zinc-400 transition-colors">{meta.label}</span>
                           <span className="text-[11px] font-mono font-black text-white group-hover:text-maroon transition-colors uppercase tracking-tight">{meta.val}</span>
                        </div>
                     ))}
                  </div>

                  <div className="pt-12">
                     <button
                        disabled
                        className="relative w-full py-7 bg-zinc-900/40 backdrop-blur-3xl border border-white/5 text-zinc-700 font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] cursor-not-allowed group overflow-hidden shadow-2xl"
                     >
                        <div className="relative z-10 flex items-center justify-center gap-5">
                           <div className="relative">
                              <ScanLine className="w-6 h-6 group-hover:text-zinc-500 transition-colors" />
                              <div className="absolute inset-0 bg-maroon animate-ping opacity-0 group-hover:opacity-20 rounded-full"></div>
                           </div>
                           Handshaking_Security_Pipes
                        </div>
                        {/* Seamless Pulsing Loading Interface */}
                        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-zinc-900 overflow-hidden">
                           <div className="w-[40%] h-full bg-gradient-to-r from-transparent via-maroon to-transparent animate-[loading_2.5s_infinite] shadow-[0_0_15px_rgba(128,0,0,0.6)]"></div>
                        </div>
                     </button>
                     <div className="mt-8 flex flex-col items-center gap-3">
                        <p className="text-center text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em] leading-relaxed">
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
