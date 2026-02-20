
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
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
                  <div className="relative group">
                     {/* Intense Card Outer Glow */}
                     <div className="absolute -inset-10 bg-maroon/10 blur-[80px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-1000"></div>

                     {/* The Core Artifact Frame */}
                     <div className="relative aspect-[3/4.2] bg-[#050505] rounded-[3rem] border border-white/10 p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 group-hover:scale-[1.03] group-hover:border-white/20">

                        {/* Interior High-Tech Design */}
                        <div className="h-full w-full bg-[#0a0a0a] rounded-[2.5rem] border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden group/hologram">

                           {/* Multiple Scanning Lines & Glitch Effects */}
                           <div className="absolute inset-0 pointer-events-none z-20">
                              <div className="w-full h-px bg-maroon/40 absolute top-0 animate-[scanline_4s_linear_infinite shadow-[0_0_15px_rgba(128,0,0,0.8)]"></div>
                              <div className="w-full h-[30%] bg-gradient-to-b from-transparent via-maroon/5 to-transparent absolute top-0 animate-[scanline_8s_linear_infinite] delay-1000"></div>
                              {/* Noise Texture */}
                              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
                           </div>

                           {/* Central Authority Core */}
                           <div className="relative z-10 flex flex-col items-center">
                              <div className="relative mb-16 px-8">
                                 {/* Floating Elements */}
                                 <div className="absolute -inset-8 bg-maroon/20 blur-3xl rounded-full animate-pulse"></div>

                                 <div className="relative w-36 h-36 bg-[#030303] border-2 border-white/5 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-700 group-hover:border-maroon/30 group-hover:shadow-[0_0_50px_rgba(128,0,0,0.3)]">
                                    <Logo className="w-16 h-16 text-white group-hover:text-maroon transition-all duration-700 drop-shadow-[0_0_15px_#800000]" />

                                    {/* Orbiting Rings */}
                                    <div className="absolute inset-2 border border-white/[0.03] rounded-full animate-spin-slow"></div>
                                    <div className="absolute inset-4 border-t border-maroon/30 rounded-full animate-spin-slow"></div>
                                 </div>

                                 {/* Outer Tech Accents */}
                                 <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-maroon/40 rounded-tl-xl transition-all duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2"></div>
                                 <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-maroon/40 rounded-br-xl transition-all duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                              </div>

                              <div className="text-center space-y-4">
                                 <h3 className="text-4xl font-black text-white uppercase tracking-[-0.05em] leading-none mb-2">Vault_Locked</h3>
                                 <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-red-950/30 backdrop-blur-md border border-red-900/40 rounded-lg">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                    <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-[0.2em]">EPOCH_0_RESTRICTION</span>
                                 </div>
                              </div>
                           </div>

                           {/* Bottom Status Grid */}
                           <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black to-transparent pt-32">
                              <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                                 <div className="space-y-2">
                                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Authority_Weight</p>
                                    <p className="text-2xl font-mono font-black text-zinc-400 tracking-tighter">0.00x</p>
                                 </div>
                                 <div className="text-right space-y-2">
                                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Registry_Serial</p>
                                    <p className="text-2xl font-mono font-black text-zinc-400 tracking-tighter">#---</p>
                                 </div>
                              </div>
                           </div>

                        </div>
                     </div>

                     {/* Premium Floating Metadata Label */}
                     <div className="absolute -right-6 top-1/4 translate-x-1/2 rotate-90 hidden xl:block">
                        <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] whitespace-nowrap">AUTHENTIC_ARTIFACT_ID_4021</span>
                     </div>
                  </div>
               </div>

               {/* Right: Technical Protocol Specs */}
               <div className="lg:col-span-4 space-y-8 order-3">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-1 h-4 bg-maroon rounded-full"></div>
                     <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Protocol_Technical_Stack</h3>
                  </div>

                  <div className="space-y-4">
                     {[
                        { label: 'Infrastructure', val: 'Argus_GhostDAG' },
                        { label: 'Security Layer', val: 'Proof-of-Authority_Alpha' },
                        { label: 'Royalties', val: 'Institutional Standard' },
                        { label: 'Governance', val: '2x Weighted Access' },
                     ].map((meta, i) => (
                        <div key={i} className="flex justify-between items-center p-5 bg-zinc-900/10 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-maroon/20 hover:bg-zinc-900/30 transition-all duration-500 group">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">{meta.label}</span>
                           <span className="text-xs font-mono font-black text-white group-hover:text-maroon transition-colors uppercase">{meta.val}</span>
                        </div>
                     ))}
                  </div>

                  <div className="pt-10">
                     <button
                        disabled
                        className="relative w-full py-6 bg-zinc-900/50 backdrop-blur-md border border-white/5 text-zinc-600 font-black uppercase tracking-[0.3em] text-[11px] rounded-[1.5rem] cursor-not-allowed group overflow-hidden"
                     >
                        <div className="relative z-10 flex items-center justify-center gap-4">
                           <ScanLine className="w-5 h-5 group-hover:text-zinc-400 transition-colors" />
                           Establishing Secure Connection
                        </div>
                        {/* Pulsing Loading Line */}
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-maroon/20 overflow-hidden">
                           <div className="w-1/3 h-full bg-maroon animate-[loading_2s_infinite]"></div>
                        </div>
                     </button>
                     <p className="text-center text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em] mt-6 leading-relaxed">
                        Identity handshake protocol v2.8 required<br />for mainnet authorization
                     </p>
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
