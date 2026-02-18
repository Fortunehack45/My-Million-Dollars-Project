
import React from 'react';
import { Hexagon, Lock, ShieldAlert, Cpu } from 'lucide-react';

const NFTSection = () => {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center space-y-12 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-6">
        <div className="flex flex-col items-center gap-6">
           <div className="w-24 h-24 bg-zinc-950 border border-zinc-800 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.15)] relative group">
              <div className="absolute inset-0 rounded-[2rem] bg-primary/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <Lock className="w-10 h-10 text-primary relative z-10" />
              <div className="absolute -bottom-3 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500">
                 Phase 03
              </div>
           </div>
           
           <div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                 Genesis Mint<br /><span className="text-zinc-800">Locked</span>
              </h1>
              <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-lg mx-auto">
                 Node authority credential minting is currently paused for the network stabilization epoch.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mx-auto opacity-60">
           <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-zinc-900 rounded-lg"><Cpu className="w-5 h-5 text-zinc-600" /></div>
              <div className="text-left">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Protocol</p>
                 <p className="text-xs font-mono text-zinc-400">ERC-721 Standard</p>
              </div>
           </div>
           <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center gap-4">
              <div className="p-2 bg-zinc-900 rounded-lg"><ShieldAlert className="w-5 h-5 text-zinc-600" /></div>
              <div className="text-left">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</p>
                 <p className="text-xs font-mono text-primary animate-pulse">Awaiting Signal</p>
              </div>
           </div>
        </div>

        <div className="pt-8">
           <button disabled className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-[0.2em] rounded-xl cursor-not-allowed text-xs">
              Notify on Unlock
           </button>
        </div>
      </div>
    </div>
  );
};

export default NFTSection;
