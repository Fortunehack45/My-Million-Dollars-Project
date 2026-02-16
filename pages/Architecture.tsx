import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Layers, Database, Cpu, Network, Shield, Zap } from 'lucide-react';

const Architecture = () => {
  return (
    <PublicLayout>
      <div className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract BG */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-zinc-950 to-zinc-950 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Argus Stack V2.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
              The Global<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-800">Truth Layer</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Argus separates consensus from execution, allowing linear scalability while maintaining atomic composability. 
              Built for institutional throughput.
            </p>
          </div>

          {/* Diagram Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
             <div className="surface p-8 rounded-3xl border-primary/20 relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Layers className="w-24 h-24 text-primary" />
                </div>
                <div className="h-full flex flex-col justify-between relative z-10">
                   <div className="space-y-4">
                      <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Layer 01</span>
                      <h3 className="text-2xl font-bold text-white">GhostDAG Consensus</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                         A blockDAG protocol that orders transactions without discarding parallel blocks. 
                         Achieves instant confirmation times bounded only by network latency.
                      </p>
                   </div>
                   <div className="mt-8 pt-8 border-t border-zinc-900">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-zinc-400">
                         <span>Throughput</span>
                         <span className="text-white">400,000 TPS</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="surface p-8 rounded-3xl relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Database className="w-24 h-24 text-white" />
                </div>
                <div className="h-full flex flex-col justify-between relative z-10">
                   <div className="space-y-4">
                      <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Layer 02</span>
                      <h3 className="text-2xl font-bold text-white">Hyper-Sharding</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                         Dynamic state sharding that adjusts automatically to network load. 
                         Cross-shard atomic commits ensure seamless developer experience.
                      </p>
                   </div>
                   <div className="mt-8 pt-8 border-t border-zinc-900">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-zinc-400">
                         <span>Shards</span>
                         <span className="text-white">Dynamic (1 - 1024)</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="surface p-8 rounded-3xl relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Cpu className="w-24 h-24 text-white" />
                </div>
                <div className="h-full flex flex-col justify-between relative z-10">
                   <div className="space-y-4">
                      <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Layer 03</span>
                      <h3 className="text-2xl font-bold text-white">ArgusVM</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                         A WASM-based execution environment optimized for parallel processing. 
                         Backward compatible with EVM via the Argus Transpiler.
                      </p>
                   </div>
                   <div className="mt-8 pt-8 border-t border-zinc-900">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-zinc-400">
                         <span>Compatibility</span>
                         <span className="text-white">EVM / WASM</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Technical Specs */}
          <div className="surface p-12 rounded-3xl border border-zinc-900">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Protocol Specifications</h3>
                   <div className="space-y-6">
                      {[
                         { label: 'Block Time', value: '400ms' },
                         { label: 'Finality', value: 'Instant (Probabilistic)' },
                         { label: 'Validator Nodes', value: '24,000+' },
                         { label: 'Consensus Mechanism', value: 'Proof-of-Uptime' },
                         { label: 'Smart Contract Lang', value: 'Rust, Solidity, C++' }
                      ].map((spec, i) => (
                         <div key={i} className="flex justify-between items-center border-b border-zinc-900 pb-4">
                            <span className="text-sm font-bold text-zinc-500">{spec.label}</span>
                            <span className="text-sm font-mono font-bold text-white">{spec.value}</span>
                         </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-8">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Security Model</h3>
                   <div className="space-y-6">
                      <div className="flex gap-4">
                         <Shield className="w-6 h-6 text-primary shrink-0" />
                         <div>
                            <h4 className="text-white font-bold text-sm uppercase">Slashing Conditions</h4>
                            <p className="text-xs text-zinc-500 mt-1">Double-signing and extensive downtime result in automatic stake burning.</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <Network className="w-6 h-6 text-primary shrink-0" />
                         <div>
                            <h4 className="text-white font-bold text-sm uppercase">Sybil Resistance</h4>
                            <p className="text-xs text-zinc-500 mt-1">Identity-bound validator keys prevent mass node fabrication.</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <Zap className="w-6 h-6 text-primary shrink-0" />
                         <div>
                            <h4 className="text-white font-bold text-sm uppercase">MEV Protection</h4>
                            <p className="text-xs text-zinc-500 mt-1">Encrypted mempool (FHE) prevents front-running and sandwich attacks.</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
};

export default Architecture;