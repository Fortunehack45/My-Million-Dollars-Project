import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Layers, Database, Cpu, Network, Shield, Zap, Server, Code, GitMerge, Box, Lock, ArrowDown, Globe } from 'lucide-react';

const GhostDAGVisual = () => {
  return (
    <div className="relative w-full h-[400px] bg-zinc-950/50 rounded-3xl border border-zinc-900/80 overflow-hidden flex items-center justify-center shadow-inner group">
       {/* Dynamic Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>
       <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950"></div>
       
       {/* Main Diagram Container */}
       <div className="relative w-full max-w-3xl h-64 mx-auto select-none">
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
             <defs>
                <filter id="glow-primary" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="3" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
             </defs>
             
             {/* Static Connections (Darker) */}
             <g className="stroke-zinc-800/60 stroke-[2px] fill-none">
                {/* From Genesis */}
                <path d="M50 128 C 100 128, 100 64, 150 64" />
                <path d="M50 128 C 100 128, 100 128, 150 128" />
                <path d="M50 128 C 100 128, 100 192, 150 192" />
                
                {/* From Layer 1 */}
                <path d="M182 64 C 232 64, 232 96, 282 96" />
                <path d="M182 128 C 232 128, 232 96, 282 96" />
                <path d="M182 128 C 232 128, 232 160, 282 160" />
                <path d="M182 192 C 232 192, 232 160, 282 160" />

                {/* From Layer 2 */}
                <path d="M314 96 C 364 96, 364 128, 414 128" />
                <path d="M314 160 C 364 160, 364 128, 414 128" />
                
                {/* To Pending */}
                <path d="M446 128 L 520 128" strokeDasharray="4 4" />
             </g>

             {/* Animated Active Path (Blue Set) */}
             <g className="stroke-primary/40 stroke-[2px] fill-none" style={{ filter: 'url(#glow-primary)' }}>
                <path className="dag-anim-path" strokeDasharray="10 5" d="M50 128 C 100 128, 100 128, 150 128" />
                <path className="dag-anim-path delay-1" strokeDasharray="10 5" d="M182 128 C 232 128, 232 96, 282 96" />
                <path className="dag-anim-path delay-2" strokeDasharray="10 5" d="M314 96 C 364 96, 364 128, 414 128" />
             </g>
          </svg>

          {/* --- NODES --- */}

          {/* Genesis Node */}
          <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.2)] z-20 hover:scale-110 transition-transform">
             <Box className="w-4 h-4 text-black" />
          </div>

          {/* Layer 1 Nodes */}
          <div className="absolute left-[150px] top-[48px] w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center z-10 group/node hover:border-zinc-500 transition-colors cursor-help">
             <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 px-3 py-2 rounded-md opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50">
                <span className="font-bold text-red-400">Red Block</span> (Parallel)
             </div>
          </div>
          
          <div className="absolute left-[150px] top-1/2 -translate-y-1/2 w-9 h-9 bg-primary border-2 border-primary/50 rounded-lg flex items-center justify-center z-20 shadow-[0_0_20px_rgba(244,63,94,0.4)] group/node cursor-help animate-pulse">
             <div className="w-2 h-2 bg-white rounded-full"></div>
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-primary/30 text-[10px] text-zinc-300 px-3 py-2 rounded-md opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50">
                <span className="font-bold text-primary">Blue Block</span> (Selected Parent)
             </div>
          </div>

          <div className="absolute left-[150px] bottom-[48px] w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center z-10 group/node hover:border-zinc-500 transition-colors cursor-help">
             <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
             <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 px-3 py-2 rounded-md opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50">
                <span className="font-bold text-red-400">Red Block</span> (Parallel)
             </div>
          </div>

          {/* Layer 2 Nodes */}
          <div className="absolute left-[282px] top-[80px] w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center z-10 group/node hover:border-zinc-500 transition-colors">
             <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
          </div>
          <div className="absolute left-[282px] bottom-[80px] w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center z-10 group/node hover:border-zinc-500 transition-colors">
             <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
          </div>

          {/* Layer 3 - Convergence */}
          <div className="absolute left-[414px] top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-800 border border-zinc-600 rounded-lg flex items-center justify-center z-10 shadow-lg group/node">
             <GitMerge className="w-4 h-4 text-zinc-400" />
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 px-3 py-2 rounded-md opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50">
                <span className="font-bold text-white">Merge Set</span> (Converged)
             </div>
          </div>

          {/* Pending Tip */}
          <div className="absolute right-[60px] top-1/2 -translate-y-1/2 flex items-center gap-3">
             <div className="w-8 h-8 border-2 border-dashed border-zinc-700/80 rounded-lg flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
             </div>
             <div className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-widest">
                Mempool
             </div>
          </div>
       </div>

       {/* Legend */}
       <div className="absolute bottom-6 left-6 flex gap-6 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 backdrop-blur-sm">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#F43F5E]"></div>
             <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-wide">Blue Set (Main)</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-zinc-700 rounded-full border border-zinc-600"></div>
             <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wide">Red Set (Orphan)</span>
          </div>
       </div>

       <style>{`
         .dag-anim-path {
           animation: dash 3s linear infinite;
         }
         .dag-anim-path.delay-1 { animation-delay: 0.5s; }
         .dag-anim-path.delay-2 { animation-delay: 1.0s; }
         
         @keyframes dash {
           from { stroke-dashoffset: 200; opacity: 0; }
           50% { opacity: 1; }
           to { stroke-dashoffset: 0; opacity: 0; }
         }
       `}</style>
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
                  className={`relative transition-all duration-1000 delay-300 ${isVisible('dag-vis') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                >
                   {/* Decorative Elements */}
                   <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                      <Network className="w-32 h-32 text-primary" />
                   </div>
                   <div className="absolute -left-12 bottom-12 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

                   <h3 className="text-xl font-bold text-white mb-2 relative z-10">GhostDAG Topology</h3>
                   <p className="text-sm text-zinc-500 mb-8 relative z-10">Visualizing parallel block references and consensus ordering.</p>

                   {/* REPLACED CSS VISUAL WITH NEW COMPONENT */}
                   <GhostDAGVisual />
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