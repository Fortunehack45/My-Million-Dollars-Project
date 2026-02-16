import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { 
  GitMerge, Database, Cpu, Shield, Zap, 
  Lock, Globe, Activity, Hash, Clock, Layers
} from 'lucide-react';

// --- Benchmark Chart Component ---
const BenchmarkChart = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {[
          { label: 'Transactions Per Second', argus: '400,000', eth: '29', sol: '65,000', unit: 'TPS' },
          { label: 'Time to Finality', argus: '400ms', eth: '12m', sol: '12.8s', unit: 'Time' },
          { label: 'Validator Reqs', argus: 'Standard', eth: '32 ETH', sol: 'High-End', unit: 'Hardware' },
       ].map((metric, i) => (
          <div key={i} className="surface p-6 rounded-2xl space-y-4">
             <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">{metric.label}</h4>
             
             <div className="space-y-3">
                {/* Argus */}
                <div className="space-y-1">
                   <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-primary">Argus Protocol</span>
                      <span className="text-white">{metric.argus}</span>
                   </div>
                   <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-full shadow-[0_0_10px_#f43f5e]"></div>
                   </div>
                </div>
                
                {/* Solana */}
                <div className="space-y-1 opacity-60">
                   <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-zinc-400">Solana</span>
                      <span className="text-zinc-400">{metric.sol}</span>
                   </div>
                   <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-700 w-[60%]"></div>
                   </div>
                </div>

                {/* Ethereum */}
                <div className="space-y-1 opacity-40">
                   <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-zinc-400">Ethereum</span>
                      <span className="text-zinc-400">{metric.eth}</span>
                   </div>
                   <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-700 w-[15%]"></div>
                   </div>
                </div>
             </div>
          </div>
       ))}
    </div>
  );
};

const Architecture = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            if (id) {
              setVisibleSections((prev) => {
                const newSet = new Set(prev);
                newSet.add(id);
                return newSet;
              });
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    document.querySelectorAll('[data-id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <PublicLayout>
      <div className="relative pt-24 pb-32 overflow-hidden min-h-screen">
        {/* Background Grid Animation */}
        <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div 
              data-id="hero-badge" 
              className={`inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 backdrop-blur-md rounded-full mb-8 transition-all duration-1000 ${isVisible('hero-badge') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
               <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Argus Stack V2.8 (RC1)</span>
            </div>
            
            <h1 
              data-id="hero-title"
              className={`text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9] transition-all duration-1000 delay-100 ${isVisible('hero-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              The Global<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">Truth Layer</span>
            </h1>
            
            <p 
              data-id="hero-desc"
              className={`text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto transition-all duration-1000 delay-200 ${isVisible('hero-desc') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              Argus decouples consensus from execution using a novel BlockDAG topology.
              <br className="hidden md:block"/> Linear scalability with atomic composability for institutional finance.
            </p>
          </div>

          {/* New Live Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32 border-y border-zinc-900/50 py-8">
             {[
                { label: 'Block Height', val: '14,021,992', icon: Hash },
                { label: 'Epoch Time', val: '400ms', icon: Clock },
                { label: 'Global Hashrate', val: '42.5 EH/s', icon: Activity },
                { label: 'Active Shards', val: '128', icon: Layers },
             ].map((stat, i) => (
                <div key={i} className="text-center md:text-left border-r last:border-0 border-zinc-900 px-4">
                   <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-zinc-500">
                      <stat.icon className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                   </div>
                   <p className="text-xl font-mono font-bold text-white">{stat.val}</p>
                </div>
             ))}
          </div>

          {/* Core Layers Diagram - ICONS UNIFIED TO WHITE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40 relative">
             {/* Connection Lines (Desktop Only) */}
             <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2 z-0"></div>

             {[
               { 
                 id: 'layer-1',
                 icon: GitMerge, 
                 title: 'GhostDAG Consensus', 
                 desc: 'Non-linear block ordering allowing parallel block creation without orphans.',
                 stat: '400k TPS', 
                 color: 'text-white' 
               },
               { 
                 id: 'layer-2',
                 icon: Database, 
                 title: 'Hyper-Sharding', 
                 desc: 'Dynamic state partitioning based on account access patterns.',
                 stat: 'Dynamic Shards', 
                 color: 'text-white' 
               },
               { 
                 id: 'layer-3',
                 icon: Cpu, 
                 title: 'ArgusVM', 
                 desc: 'Parallelized WASM execution environment with EVM transpiler.',
                 stat: '< 400ms Latency', 
                 color: 'text-white' 
               }
             ].map((layer, i) => (
               <div 
                 key={i}
                 data-id={`card-${i}`}
                 className={`surface p-1 rounded-[2rem] relative group transition-all duration-1000 ease-out z-10 ${isVisible(`card-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
                 style={{ transitionDelay: `${i * 150}ms` }}
               >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"></div>
                  <div className="bg-zinc-950 h-full rounded-[1.9rem] p-8 flex flex-col justify-between relative overflow-hidden border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                     {/* Hover Glow */}
                     <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                     
                     <div className="space-y-6 relative z-10">
                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                           {/* Unified Icon Color */}
                           <layer.icon className={`w-7 h-7 text-white`} />
                        </div>
                        <div>
                           <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">Layer 0{i + 1}</span>
                           <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{layer.title}</h3>
                           <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                              {layer.desc}
                           </p>
                        </div>
                     </div>
                     
                     <div className="mt-8 pt-6 border-t border-zinc-900/80 flex justify-between items-center relative z-10">
                        <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase">Performance</span>
                        <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-3 py-1 rounded border border-zinc-800">{layer.stat}</span>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          {/* New Performance Benchmarks Section */}
          <div className="mb-32">
             <div className="text-center mb-12">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Protocol Benchmarks</h3>
                <p className="text-zinc-500">Comparative analysis against legacy networks.</p>
             </div>
             <BenchmarkChart />
          </div>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
                { title: "Mempool Encryption", desc: "Transactions are encrypted until ordering is finalized to prevent MEV exploitation.", icon: Lock },
                { title: "Stake Slashing", desc: "Validators signing conflicting blocks are automatically penalized by the protocol.", icon: Zap },
                { title: "Global Sharding", desc: "Network automatically partitions state as node count increases.", icon: Globe },
             ].map((feat, i) => (
                <div 
                  key={i}
                  data-id={`sec-${i}`}
                  className={`p-8 rounded-2xl bg-zinc-900/20 border border-zinc-900 hover:bg-zinc-900/40 transition-all duration-700 ${isVisible(`sec-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                   <feat.icon className="w-8 h-8 text-zinc-600 mb-4" />
                   <h4 className="text-white font-bold mb-2">{feat.title}</h4>
                   <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
                </div>
             ))}
          </div>

        </div>
      </div>
    </PublicLayout>
  );
};

export default Architecture;