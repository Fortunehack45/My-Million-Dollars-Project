import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Server, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Validators = () => {
  const { login } = useAuth();

  return (
    <PublicLayout>
      <div className="pt-20 pb-32 max-w-7xl mx-auto px-6">
         <div className="flex flex-col md:flex-row gap-16 items-start">
            
            <div className="flex-1 space-y-8">
               <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                  Secure the<br />Network
               </h1>
               <p className="text-xl text-zinc-400 max-w-xl">
                  Validators are the backbone of Argus. Run a node, secure the chain, and earn yield in ARG.
               </p>
               
               <div className="flex flex-col gap-4">
                  <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-start gap-4">
                     <CheckCircle2 className="w-6 h-6 text-primary mt-1" />
                     <div>
                        <h4 className="text-white font-bold uppercase">Passive Yield</h4>
                        <p className="text-sm text-zinc-500 mt-1">Earn 8-12% APY on staked ARG.</p>
                     </div>
                  </div>
                  <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-start gap-4">
                     <CheckCircle2 className="w-6 h-6 text-primary mt-1" />
                     <div>
                        <h4 className="text-white font-bold uppercase">Governance Rights</h4>
                        <p className="text-sm text-zinc-500 mt-1">Vote on protocol upgrades and parameter changes.</p>
                     </div>
                  </div>
               </div>

               <button onClick={login} className="btn-primary w-full md:w-auto flex items-center justify-center gap-3">
                  Start Validator Node <ArrowRight className="w-4 h-4" />
               </button>
            </div>

            <div className="flex-1 w-full">
               <div className="surface p-8 rounded-3xl border border-zinc-900 space-y-8">
                  <div className="flex items-center gap-3 border-b border-zinc-900 pb-6">
                     <Server className="w-6 h-6 text-zinc-400" />
                     <h3 className="text-xl font-bold text-white uppercase tracking-tight">Hardware Requirements</h3>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between mb-2">
                           <span className="text-sm font-bold text-white">CPU</span>
                           <span className="text-xs font-mono text-primary">Minimum</span>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                           <p className="text-sm text-zinc-400 font-mono">4 Cores / 8 Threads (AVX2 Support)</p>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between mb-2">
                           <span className="text-sm font-bold text-white">RAM</span>
                           <span className="text-xs font-mono text-primary">Minimum</span>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                           <p className="text-sm text-zinc-400 font-mono">16 GB DDR4</p>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between mb-2">
                           <span className="text-sm font-bold text-white">Storage</span>
                           <span className="text-xs font-mono text-primary">Minimum</span>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                           <p className="text-sm text-zinc-400 font-mono">1 TB NVMe SSD (3000 MB/s+ R/W)</p>
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between mb-2">
                           <span className="text-sm font-bold text-white">Bandwidth</span>
                           <span className="text-xs font-mono text-primary">Minimum</span>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                           <p className="text-sm text-zinc-400 font-mono">100 Mbps Up/Down</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                     <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                     <p className="text-[10px] text-amber-200/80 leading-relaxed">
                        Failure to maintain 99.9% uptime results in stake slashing. Ensure redundant power and internet connection before initializing mainnet validators.
                     </p>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </PublicLayout>
  );
};

export default Validators;