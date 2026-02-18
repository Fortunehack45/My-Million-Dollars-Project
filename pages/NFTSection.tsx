
import React from 'react';
import { Lock, Shield, Cpu, Zap, Box, AlertTriangle, ScanLine } from 'lucide-react';

const NFTSection = () => {
  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden px-6 py-12 animate-in fade-in duration-700">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-16 space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full mb-2 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phase 03: Mainnet Authority</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
              Genesis Node<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-700">Licenses</span>
           </h1>
        </div>

        {/* Main Vault Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
           
           {/* Left: Status & Info */}
           <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl backdrop-blur-sm group hover:border-zinc-800 transition-colors">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-zinc-900 rounded-lg"><Cpu className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" /></div>
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Asset Class</span>
                 </div>
                 <p className="text-sm text-zinc-500 leading-relaxed">
                    ERC-721 Authority Credential allowing operation of a Mainnet Validator Node. Non-transferable during vesting period.
                 </p>
              </div>

              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl backdrop-blur-sm group hover:border-zinc-800 transition-colors">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-zinc-900 rounded-lg"><Zap className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" /></div>
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Utility</span>
                 </div>
                 <ul className="space-y-3">
                    {['Governance Weight: 2x Multiplier', 'Staking APY Boost: +15%', 'Zero-Fee Bridge Access'].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                          <div className="w-1 h-1 bg-primary rounded-full shrink-0"></div>
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>

           {/* Center: The Locked Card (Hero) */}
           <div className="lg:col-span-4 order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-sm aspect-[3/4] bg-zinc-950 rounded-[2rem] border border-zinc-800 p-2 shadow-2xl group transition-transform hover:scale-[1.02] duration-500">
                 {/* Card Inner */}
                 <div className="h-full w-full bg-zinc-900/30 rounded-[1.5rem] relative overflow-hidden flex flex-col items-center justify-center border border-zinc-800/50 backdrop-blur-md">
                    
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(244,63,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    
                    {/* Lock Icon with Rings */}
                    <div className="relative z-10 mb-10">
                       <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
                       <div className="relative w-24 h-24 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center shadow-2xl z-20">
                          <Lock className="w-10 h-10 text-primary" />
                       </div>
                       {/* Rotating Rings */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-dashed border-zinc-700/50 rounded-full animate-[spin_10s_linear_infinite] z-10"></div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dotted border-zinc-800/50 rounded-full animate-[spin_15s_linear_infinite_reverse] z-0"></div>
                    </div>

                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 relative z-10">Access Denied</h3>
                    <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg relative z-10 backdrop-blur-sm">
                       <p className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> Epoch_Inactive
                       </p>
                    </div>

                    {/* Footer of Card */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 to-transparent pt-20">
                       <div className="flex justify-between items-end border-t border-zinc-800/50 pt-4">
                          <div>
                             <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Mint Price</p>
                             <p className="text-lg font-mono font-bold text-zinc-400">TBD</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Total Supply</p>
                             <p className="text-lg font-mono font-bold text-zinc-400">500,000</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Technical Specs & Requirements */}
           <div className="lg:col-span-4 space-y-6 order-3">
              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl backdrop-blur-sm flex flex-col gap-5 hover:border-zinc-800 transition-colors">
                 <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Eligibility Tier</span>
                    <span className="text-xs font-mono text-zinc-300">Min. Points</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                       <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">Tier 1: Alpha</span>
                       <span className="font-mono font-bold text-primary group-hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-all">10,000 ARG</span>
                    </div>
                    <div className="flex justify-between items-center group">
                       <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">Tier 2: Beta</span>
                       <span className="font-mono font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">5,000 ARG</span>
                    </div>
                    <div className="flex justify-between items-center opacity-50">
                       <span className="text-sm text-zinc-400">Public Sale</span>
                       <span className="font-mono font-bold text-zinc-600">N/A</span>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl border-dashed">
                 <p className="text-[10px] text-zinc-500 leading-relaxed text-center font-mono">
                    "Only the first 500 nodes to reach Tier 1 will receive the 'Genesis' metadata trait, granting perpetual royalty revenue."
                 </p>
              </div>

              <button disabled className="w-full py-5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.2em] rounded-xl cursor-not-allowed text-xs hover:bg-zinc-800/50 transition-colors flex items-center justify-center gap-2 group">
                 <ScanLine className="w-4 h-4 group-hover:text-zinc-400 transition-colors" />
                 Notify on Protocol Unlock
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default NFTSection;
