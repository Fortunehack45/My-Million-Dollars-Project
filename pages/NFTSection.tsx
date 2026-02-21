
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
   Lock, Shield, Cpu, Zap, Box,
   ShieldCheck, Timer, Globe,
   Activity, Fingerprint, Scan,
   ChevronRight, Boxes, Landmark
} from 'lucide-react';

const NFT_IMAGE_URL = "/public/nft-asset.png"; // Placeholder for the actual NFT asset

const TierCard = ({ tier, points, required, status, icon: Icon }: any) => {
   const isEligible = status === 'ELIGIBLE';
   const progress = Math.min(100, (points / required) * 100);

   return (
      <div className={`relative p-6 rounded-3xl border transition-all duration-700 group overflow-hidden ${isEligible
         ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]'
         : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'
         }`}>

         {/* Progress Bar Background */}
         <div className="absolute bottom-0 left-0 h-[1px] bg-zinc-800 w-full" />
         <div
            className={`absolute bottom-0 left-0 h-[2px] transition-all duration-1000 ${isEligible ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-maroon'}`}
            style={{ width: `${progress}%` }}
         />

         <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isEligible ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-zinc-900 border border-zinc-800 group-hover:bg-zinc-800'}`}>
               <Icon className={`w-6 h-6 ${isEligible ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
            </div>
            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${isEligible ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900 text-zinc-600 border-zinc-800'}`}>
               {status}
            </div>
         </div>

         <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{tier}</h4>
            <div className="flex items-baseline justify-between">
               <p className="text-[10px] text-zinc-500 font-mono italic">Requirement</p>
               <p className={`text-xs font-mono font-bold ${isEligible ? 'text-emerald-400' : 'text-zinc-400'}`}>{required.toLocaleString()} ARG</p>
            </div>
         </div>

         {/* Decoration */}
         <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.01] blur-2xl rounded-full pointer-events-none group-hover:bg-maroon/5 transition-colors" />
      </div>
   );
};

const NFTSection = () => {
   const { user } = useAuth();
   const points = user?.points || 0;
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   const tiers = [
      { tier: "Sentinel Alpha", required: 5000, icon: Shield, status: points >= 5000 ? 'ELIGIBLE' : 'LOCKED' },
      { tier: "Validator Prime", required: 25000, icon: Cpu, status: points >= 25000 ? 'ELIGIBLE' : 'LOCKED' },
      { tier: "Protocol Genesis", required: 100000, icon: Landmark, status: points >= 100000 ? 'ELIGIBLE' : 'LOCKED' },
      { tier: "Archon Sovereign", required: 500000, icon: Boxes, status: points >= 500000 ? 'ELIGIBLE' : 'LOCKED' },
   ];

   return (
      <div className="w-full min-h-[90vh] py-12 px-6 flex flex-col items-center relative overflow-hidden">

         {/* Premium Ambient Background */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-maroon/[0.03] blur-[150px] rounded-full animate-pulse-slow font-gothic" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
         </div>

         <div className={`w-full max-w-6xl mx-auto space-y-20 relative z-10 transition-all duration-1000 ease-out-expo ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

            {/* Hero Visual Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

               {/* Left: The NFT Frame */}
               <div className="relative group mx-auto lg:mx-0">
                  <div className="absolute -inset-20 bg-maroon/10 blur-[120px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />

                  {/* Glass Frame */}
                  <div className="w-[320px] md:w-[400px] aspect-[3/4] glass-panel rounded-[3rem] p-4 relative overflow-hidden shadow-2xl transition-all duration-700 hover:scale-[1.02] hover:-rotate-1 border border-white/10 group">
                     {/* Internal Tech Layer */}
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                     <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-black/20" />

                     {/* The Asset - High Quality Placeholder or Visual Effect */}
                     <div className="w-full h-full rounded-[2.2rem] bg-zinc-900/80 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-maroon/20 to-transparent" />

                        {/* Animated Scanning Beam */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/40 to-transparent -translate-y-full animate-scanline h-[20%] opacity-30" />

                        {/* Central Icon / Identity */}
                        <div className="relative z-10 space-y-6 text-center">
                           <div className="w-24 h-24 mx-auto bg-maroon/10 rounded-full border border-maroon/20 flex items-center justify-center p-6 backdrop-blur-md shadow-[0_0_40px_rgba(128,0,0,0.2)]">
                              <Fingerprint className="w-full h-full text-maroon animate-pulse" />
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] font-mono font-black text-maroon uppercase tracking-[0.4em]">Argus_License_Core</p>
                              <div className="h-0.5 w-12 bg-maroon/30 mx-auto rounded-full" />
                           </div>
                        </div>

                        {/* Stasis Badge */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3">
                           <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Protocol Stasis</span>
                        </div>
                     </div>

                     {/* Edge Ornaments */}
                     <div className="absolute top-6 left-6 flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                     </div>
                  </div>

                  {/* External Decor */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 border-t border-r border-maroon/20 rounded-tr-[4rem] hidden md:block" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 border-b border-l border-maroon/20 rounded-bl-[4rem] hidden md:block" />
               </div>

               {/* Right: Info Content */}
               <div className="space-y-10 text-center lg:text-left">
                  <div className="space-y-6">
                     <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-full">
                        <Zap className="w-4 h-4 text-maroon animate-pulse" />
                        <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.25em]">Registry_Locked</span>
                     </div>
                     <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                        Institutional<br />
                        <span className="text-maroon">Licenses</span>
                     </h1>
                     <p className="text-zinc-500 text-base md:text-xl font-medium max-w-xl leading-relaxed italic border-l-2 border-maroon/50 pl-6 lg:mx-0 mx-auto">
                        Genesis Operator Licenses grant high-priority execution threads and governance weight within the Argus decentralized topology.
                     </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 lg:justify-start justify-center">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Current Surplus</span>
                        <div className="flex items-center gap-2">
                           <span className="text-2xl font-black text-white">{points.toLocaleString()}</span>
                           <span className="text-[10px] font-mono font-bold text-maroon bg-maroon/10 px-2 py-0.5 rounded border border-maroon/20 uppercase">ARG Credits</span>
                        </div>
                     </div>
                     <div className="h-10 w-px bg-zinc-800 hidden sm:block" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status</span>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <span className="text-sm font-black text-white uppercase tracking-tighter">Ready for Epoch 1</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tiers Grid */}
            <div className="space-y-10">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-white uppercase tracking-tight">License Tiers</h3>
                     <p className="text-[11px] text-zinc-500 uppercase font-mono tracking-widest">Calculated based on verified uptime contributions.</p>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-600">
                     <Activity className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Verification Active</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {tiers.map((t, i) => (
                     <TierCard key={i} {...t} points={points} />
                  ))}
               </div>
            </div>

            {/* Footer Alert */}
            <div className="pt-12">
               <div className="bg-maroon/5 border border-maroon/10 rounded-[2.5rem] p-12 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-maroon/5 to-transparent -translate-x-full animate-scanline pointer-events-none" />
                  <div className="flex flex-col items-center gap-6">
                     <Timer className="w-10 h-10 text-maroon animate-pulse" />
                     <div className="space-y-2">
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">Mainnet Synchronization Pending</h4>
                        <p className="text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed italic">
                           Minting functionality will activate upon the threshold of 100,000 active nodes. Final security audit in progress.
                        </p>
                     </div>
                     <div className="inline-flex items-center gap-4 px-6 py-2 bg-maroon text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl animate-pulse">
                        Progress: 92.4% Complete
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default NFTSection;
