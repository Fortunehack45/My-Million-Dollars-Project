
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
   Lock, Shield, Cpu, Zap, Box,
   ShieldCheck, Timer, Globe,
   Activity, Fingerprint, Scan,
   ChevronRight, Boxes, Landmark
} from 'lucide-react';

const NFT_IMAGE_URL = "/argus_genesis_license.png";

const TierCard = ({ tier, points, required, status, icon: Icon }: any) => {
   const isEligible = status === 'ELIGIBLE';
   const progress = Math.min(100, (points / required) * 100);

   return (
      <div className={`relative p-8 rounded-[2rem] border transition-all duration-1000 group overflow-hidden ${isEligible
         ? 'bg-emerald-500/[0.02] border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)]'
         : 'bg-zinc-950/40 border-zinc-900/50 hover:border-zinc-800'
         }`}>

         {/* Background ID Watermark */}
         <div className="absolute top-4 right-6 opacity-[0.03] select-none pointer-events-none">
            <span className="text-[40px] font-black font-mono tracking-tighter">ARG_{required.toString().slice(0, 2)}</span>
         </div>

         <div className="flex justify-between items-start mb-8 relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-2xl ${isEligible ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 scale-110' : 'bg-zinc-900 border border-zinc-800 text-zinc-600 group-hover:text-zinc-400 group-hover:scale-105'}`}>
               <Icon className="w-7 h-7" />
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl backdrop-blur-md ${isEligible ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-zinc-900/80 text-zinc-700 border-zinc-800'}`}>
               {status}
            </div>
         </div>

         <div className="space-y-4 relative z-10">
            <div>
               <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">{tier}</h4>
               <p className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase">Protocol_Class_{required / 1000}k</p>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest">
                  <span className="text-zinc-600">Verification Scale</span>
                  <span className={isEligible ? 'text-emerald-500' : 'text-zinc-700'}>{progress.toFixed(1)}%</span>
               </div>
               <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div
                     className={`h-full transition-all duration-1000 ease-out ${isEligible ? 'bg-emerald-500' : 'bg-maroon/40'}`}
                     style={{ width: `${progress}%` }}
                  />
               </div>
            </div>

            <div className="flex items-center justify-between pt-2">
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Auth_Req</p>
               <p className={`text-xs font-mono font-black ${isEligible ? 'text-emerald-400' : 'text-zinc-500'}`}>{required.toLocaleString()} ARG</p>
            </div>
         </div>

         {/* Interactive Hover Glow */}
         <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-maroon/0 blur-3xl rounded-full transition-all duration-1000 group-hover:bg-maroon/5 group-hover:scale-150 pointer-events-none" />
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
                  <div className="absolute -inset-24 bg-maroon/20 blur-[150px] rounded-full opacity-40 group-hover:opacity-70 transition-all duration-1000 scale-90 group-hover:scale-110" />

                  {/* Premium Institutional Frame */}
                  <div className="w-[320px] md:w-[420px] aspect-[3/4.2] bg-zinc-950 rounded-[3.5rem] p-6 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] transition-all duration-1000 hover:scale-[1.03] border border-white/5 ring-1 ring-white/5 hover:ring-maroon/30 group">

                     {/* Inner Obsidian Bezel */}
                     <div className="absolute inset-2 border border-white/[0.03] rounded-[3rem] pointer-events-none" />

                     {/* The Main Asset Component */}
                     <div className="w-full h-full rounded-[2.8rem] bg-black border border-white/5 relative overflow-hidden group/asset">
                        {/* Dynamic Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />

                        {/* The Actual License Asset */}
                        <img
                           src={NFT_IMAGE_URL}
                           alt="Argus Genesis License"
                           className="w-full h-full object-cover opacity-80 group-hover/asset:opacity-100 group-hover/asset:scale-110 transition-all duration-[2000ms] ease-out-expo"
                        />

                        {/* Glass Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-maroon/5 via-transparent to-white/[0.03] pointer-events-none" />
                        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]" />

                        {/* Interactive UI Layers */}
                        <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
                           <div className="space-y-1">
                              <p className="text-[8px] font-black text-maroon uppercase tracking-[0.4em] opacity-80">System_Authenticated</p>
                              <div className="h-0.5 w-8 bg-maroon/30 rounded-full" />
                           </div>
                           <ShieldCheck className="w-5 h-5 text-maroon/50" />
                        </div>

                        {/* Scanning HUD Effect */}
                        <div className="absolute inset-0 pointer-events-none">
                           <div className="absolute top-1/4 left-0 w-full h-[1px] bg-maroon/30 shadow-[0_0_15px_rgba(128,0,0,0.5)] -translate-y-full animate-scanline opacity-40" />
                           <div className="absolute inset-0 border-[0.5px] border-white/5 m-12 opacity-20" />
                        </div>

                        {/* Stasis Badge */}
                        <div className="absolute bottom-10 left-10 right-10 p-5 bg-black/80 backdrop-blur-2xl border border-white/5 rounded-2xl flex flex-col gap-3 group-hover/asset:border-maroon/30 transition-colors duration-700">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                 <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Protocol Stasis</span>
                              </div>
                              <span className="text-[8px] font-mono text-zinc-600">ID_0X8F3..</span>
                           </div>
                           <div className="h-[1px] w-full bg-zinc-900" />
                           <div className="flex justify-between items-center">
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Network Authority</span>
                              <span className="text-[10px] font-black text-maroon uppercase tracking-tighter">Genesis_Root</span>
                           </div>
                        </div>
                     </div>

                     {/* Premium Corner Details */}
                     <div className="absolute top-10 right-10 flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        <div className="w-1.5 h-1.5 rounded-full bg-maroon/20" />
                     </div>
                  </div>

                  {/* Geometric Decor - Floating Elements */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 border-t-2 border-r-2 border-maroon/10 rounded-tr-[5rem] animate-pulse-slow" />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 border-b-2 border-l-2 border-zinc-900 rounded-bl-[5rem]" />

                  {/* Floating Tech Bits */}
                  <div className="absolute top-1/2 -right-20 -translate-y-1/2 flex flex-col items-center gap-4 opacity-30 group-hover:opacity-60 transition-opacity duration-1000 hidden xl:flex">
                     <div className="w-0.5 h-20 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                     <p className="text-[8px] font-mono [writing-mode:vertical-rl] text-zinc-600 uppercase tracking-[0.5em]">ARG_TOPOLOGY_LAYER_0</p>
                     <div className="w-0.5 h-20 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                  </div>
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
