import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Layers, Database, Cpu, Network, Shield, Zap, Server, Code, GitMerge, Box, Lock, ArrowDown, Globe } from 'lucide-react';

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
          <div className="text-center max-w-4xl mx-auto mb-32">
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

          {/* Core Layers Diagram */}
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
                 color: 'text-primary' 
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
                           <layer.icon className={`w-7 h-7 ${layer.color}`} />
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

          {/* Deep Dive Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-32 items-center">
             <div className="lg:col-span-5 space-y-12">
                <div data-id="spec-header" className={`transition-all duration-1000 ${isVisible('spec-header') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-6">Protocol<br/>Specifications</h2>
                   <p className="text-zinc-400 text-lg">
                      Engineered for high-frequency trading and real-time settlement. Argus minimizes state bloat while maximizing throughput.
                   </p>
                </div>

                <div className="space-y-4">
                   {[
                      { label: 'Consensus Family', val: 'BlockDAG (GhostDAG)', icon: GitMerge },
                      { label: 'Sybil Resistance', val: 'Proof-of-Uptime (PoU)', icon: Shield },
                      { label: 'Smart Contracts', val: 'Rust, Solidity (via EVM)', icon: Code },
                      { label: 'Finality Time', val: '~400ms (Probabilistic)', icon: Zap },
                      { label: 'Validator Count', val: '24,000+ Active Nodes', icon: Server },
                   ].map((spec, i) => (
                      <div 
                        key={i} 
                        data-id={`spec-row-${i}`}
                        className={`flex items-center justify-between p-4 border-b border-zinc-900 transition-all duration-700 hover:bg-zinc-900/30 ${isVisible(`spec-row-${i}`) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                      >
                         <div className="flex items-center gap-4">
                            <spec.icon className="w-5 h-5 text-zinc-600" />
                            <span className="text-sm font-bold text-zinc-400">{spec.label}</span>
                         </div>
                         <span className="text-sm font-mono font-bold text-white">{spec.val}</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Visual Representation of DAG */}
             <div className="lg:col-span-7">
                <div 
                  data-id="dag-vis"
                  className={`relative bg-zinc-950 border border-zinc-900 rounded-3xl p-8 md:p-12 overflow-hidden transition-all duration-1000 delay-300 ${isVisible('dag-vis') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                >
                   {/* Decorative Elements */}
                   <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                      <Network className="w-32 h-32 text-primary" />
                   </div>
                   <div className="absolute -left-12 bottom-12 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

                   <h3 className="text-xl font-bold text-white mb-2 relative z-10">GhostDAG Topology</h3>
                   <p className="text-sm text-zinc-500 mb-12 relative z-10">Visualizing parallel block references.</p>

                   {/* CSS DAG Visual */}
                   <div className="relative h-[300px] w-full flex items-center justify-center">
                      {/* Blocks */}
                      <div className="relative w-full max-w-lg h-full">
                         {/* Genesis */}
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] z-20">
                            <Box className="w-6 h-6 text-black" />
                         </div>
                         
                         {/* Layer 1 - Parallel */}
                         <div className="absolute left-[25%] top-[20%] w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center z-10 animate-pulse"></div>
                         <div className="absolute left-[25%] top-[50%] -translate-y-1/2 w-10 h-10 bg-primary border border-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_#F43F5E] z-10"></div>
                         <div className="absolute left-[25%] bottom-[20%] w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center z-10 animate-pulse" style={{ animationDelay: '500ms' }}></div>

                         {/* Layer 2 - Interconnected */}
                         <div className="absolute left-[55%] top-[35%] w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center z-10 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                         <div className="absolute left-[55%] bottom-[35%] w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center z-10 animate-pulse" style={{ animationDelay: '700ms' }}></div>

                         {/* Tip */}
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center z-20">
                            <div className="w-3 h-3 bg-zinc-700 rounded-full animate-ping"></div>
                         </div>

                         {/* Connection Lines (SVG) */}
                         <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-zinc-800 stroke-[2px]" style={{ zIndex: 0 }}>
                            <path d="M 48 150 L 125 60" />
                            <path d="M 48 150 L 125 150" />
                            <path d="M 48 150 L 125 240" />
                            
                            <path d="M 165 60 L 275 105" />
                            <path d="M 165 150 L 275 105" />
                            <path d="M 165 150 L 275 195" />
                            <path d="M 165 240 L 275 195" />

                            <path d="M 315 105 L 460 150" />
                            <path d="M 315 195 L 460 150" />
                         </svg>
                      </div>
                   </div>
                </div>
             </div>
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