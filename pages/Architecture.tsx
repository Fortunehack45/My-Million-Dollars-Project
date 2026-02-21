
import React, { useState, useEffect, useRef } from 'react';
import PublicLayout from '../components/PublicLayout';
import {
   GitMerge, Database, Cpu, Shield, Zap,
   Lock, Globe, Activity, Hash, Clock, Layers, GitBranch, Share2, Box, TrendingUp
} from 'lucide-react';
import { subscribeToContent, DEFAULT_ARCHITECTURE_CONFIG } from '../services/firebase';
import { ArchitecturePageConfig } from '../types';
import MatrixBackground from '../components/MatrixBackground';

const GhostDAGExplainer = () => {
   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-64 relative">
         {/* Subtle Institutional Detail */}
         <div className="absolute -left-32 top-0 w-[500px] h-[500px] bg-maroon/[0.03] rounded-full blur-[150px] pointer-events-none"></div>

         <div className="space-y-12 relative z-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl">
               <div className="w-2 h-2 rounded-full bg-maroon animate-pulse-gentle"></div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] font-mono italic">Topology_Protocol_Ref: GhostDAG_v2.8</span>
            </div>

            <div className="space-y-8">
               <h2 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85]">GhostDAG: The Death of Orphans</h2>
               <p className="text-zinc-500 leading-relaxed text-lg md:text-xl font-medium border-l-2 border-maroon pl-8">
                  Traditional serial blockchains discard parallel blocks as <span className="text-white italic underline underline-offset-8 decoration-maroon/30">orphans</span>. GhostDAG integrates them into a unified directed acyclic graph, ensuring zero-waste security.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="p-10 silk-panel rounded-[2.5rem] space-y-6 hover:border-emerald-500/20 group/node">
                  <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-900 flex items-center justify-center group-hover/node:bg-emerald-500 transition-all duration-700">
                     <GitBranch className="w-7 h-7 text-emerald-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-2 font-mono">Blue_Set_Canonical</h4>
                     <p className="text-sm text-zinc-500 leading-relaxed font-medium">High-connectivity nodes forming the high-integrity topological path.</p>
                  </div>
               </div>
               <div className="p-10 silk-panel rounded-[2.5rem] space-y-6 hover:border-maroon/20 group/node">
                  <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-900 flex items-center justify-center group-hover/node:bg-maroon transition-all duration-700">
                     <Share2 className="w-7 h-7 text-maroon group-hover:text-white transition-colors" />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-2 font-mono">Red_Set_Outliers</h4>
                     <p className="text-sm text-zinc-500 leading-relaxed font-medium">Isolated or malicious blocks logically pruned from the active topology.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="relative group">
            {/* Schematic Frame */}
            <div className="absolute -inset-8 border border-white/[0.02] rounded-[4rem] opacity-50 pointer-events-none"></div>
            <div className="silk-panel p-2 rounded-[3.5rem] border-white/[0.05] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(128,0,0,0.06),transparent)]"></div>

               <div className="relative p-12 space-y-12">
                  <div className="h-96 border border-white/[0.03] bg-black/40 rounded-[2.5rem] flex items-center justify-center p-12 relative overflow-hidden">
                     {/* Scanning Detail */}
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.04] to-transparent h-1/2 w-full animate-scanline pointer-events-none"></div>

                     <div className="w-full flex justify-around items-center gap-6 relative z-10">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="flex flex-col items-center gap-10">
                              <div className="w-20 h-20 bg-zinc-950 border border-zinc-900 flex items-center justify-center rounded-3xl relative shadow-2xl group-hover:border-maroon/50 transition-all duration-1000">
                                 <Box className="w-8 h-8 text-zinc-700 group-hover:text-white transition-colors" />
                                 {i === 2 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>}
                              </div>
                              <div className="h-32 w-px bg-gradient-to-b from-zinc-800 via-maroon/20 to-transparent"></div>
                              <div className="w-16 h-16 bg-zinc-950/40 border border-white/[0.02] flex items-center justify-center rounded-2xl">
                                 <Box className="w-6 h-6 text-zinc-800" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/[0.03] pt-10">
                     <div className="space-y-3">
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] font-mono italic">Topology_Vector_State</p>
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter">PHANTOM_LINEARIZATION</h4>
                     </div>
                     <div className="flex flex-col items-end gap-3 pb-1">
                        <div className="flex gap-1.5">
                           {[1, 2, 3, 4, 5].map(j => <div key={j} className="w-1.5 h-4 bg-emerald-500/20 rounded-full animate-pulse" style={{ animationDelay: `${j * 100}ms` }}></div>)}
                        </div>
                        <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-[0.3em]">Network_Sync_Optimal</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

// --- Benchmark Chart Component ---
const BenchmarkChart = () => {
   return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { label: 'Transactions Per Second', argus: '400,000', eth: '29', sol: '65,000', unit: 'TPS' },
            { label: 'Time to Finality', argus: '400ms', eth: '12m', sol: '12.8s', unit: 'Time' },
            { label: 'Validator Reqs', argus: 'GhostDAG', eth: '32 ETH', sol: 'High-End', unit: 'Logic' },
         ].map((metric, i) => (
            <div key={i} className="silk-panel p-6 rounded-2xl space-y-4 border-zinc-900 transition-silk">
               <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">{metric.label}</h4>

               <div className="space-y-3">
                  {/* Argus */}
                  <div className="space-y-1">
                     <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-maroon">Argus GhostDAG</span>
                        <span className="text-white">{metric.argus}</span>
                     </div>
                     <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-maroon w-full shadow-[0_0_10px_#800000]"></div>
                     </div>
                  </div>

                  {/* Solana */}
                  <div className="space-y-1 opacity-60">
                     <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-zinc-400">Solana (Serial)</span>
                        <span className="text-zinc-400">{metric.sol}</span>
                     </div>
                     <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-700 w-[60%]"></div>
                     </div>
                  </div>

                  {/* Ethereum */}
                  <div className="space-y-1 opacity-40">
                     <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-zinc-400">Ethereum (L1)</span>
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
   const [content, setContent] = useState<ArchitecturePageConfig>(DEFAULT_ARCHITECTURE_CONFIG);
   const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const requestRef = useRef<number>(null);

   useEffect(() => {
      const unsubscribe = subscribeToContent('architecture_page', DEFAULT_ARCHITECTURE_CONFIG, setContent);
      return () => unsubscribe();
   }, []);

   // MATRIX RAIN EFFECT handled by MatrixBackground component.

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
   const layerIcons = [GitMerge, Database, Cpu];
   const featureIcons = [Lock, Zap, Globe];

   return (
      <PublicLayout>
         <div className="relative pt-24 pb-32 overflow-hidden min-h-screen">
            {/* Matrix Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-black">
               <MatrixBackground color="rgba(128, 0, 0, 0.2)" speed={1.1} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

               {/* Header - Institutional Command */}
               <div className="max-w-6xl mb-32 group/arch-header">
                  <div
                     data-id="hero-badge"
                     className={`inline-flex items-center gap-3 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full mb-10 transition-all duration-1000 ${isVisible('hero-badge') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  >
                     <div className="w-2 h-2 rounded-full bg-maroon animate-pulse-gentle"></div>
                     <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] font-mono italic">Topology_Stack: GhostDAG_v2.8_PHANTOM</span>
                  </div>

                  <h1
                     data-id="hero-title"
                     className={`text-5xl md:text-[11rem] font-black text-white uppercase tracking-tighter mb-12 md:mb-16 leading-[0.8] transition-all duration-1000 delay-100 group-hover/arch-header:tracking-[-0.03em] ${isVisible('hero-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  >
                     The Parallel<br />
                     <span className="text-maroon">Economy.</span>
                  </h1>

                  <p
                     data-id="hero-desc"
                     className={`text-xl md:text-3xl text-zinc-500 leading-relaxed max-w-3xl transition-all duration-1000 delay-200 font-medium border-l-2 border-zinc-900 pl-10 ${isVisible('hero-desc') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  >
                     Argus Protocol utilizes a novel <span className="text-white italic underline underline-offset-8 decoration-maroon/30">GhostDAG topology</span> to decouple consensus from throughput, reaching topological finality in sub-second intervals.
                  </p>
               </div>

               {/* New Live Metrics Strip - Argus High Fidelity */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-48 border-y border-white/[0.03] py-16">
                  {[
                     { label: 'BlockDAG Height', val: '14,021,992', icon: Hash },
                     { label: 'Finality Latency', val: '400ms', icon: Clock },
                     { label: 'Topological Density', val: '98.2%', icon: Activity },
                     { label: 'Parallel Chains', val: '128', icon: Layers },
                  ].map((stat, i) => (
                     <div key={i} className="space-y-4 group/stat">
                        <div className="flex items-center gap-3 text-zinc-600 group-hover/stat:text-maroon transition-colors duration-500">
                           <stat.icon className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">{stat.label}</span>
                        </div>
                        <p className="text-3xl md:text-5xl font-black text-white group-hover/stat:translate-x-2 transition-transform duration-700">{stat.val}</p>
                     </div>
                  ))}
               </div>

               <GhostDAGExplainer />

               {/* Core Layers Diagram - Vertical Integration */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-64 relative">
                  <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-maroon/20 to-transparent z-0"></div>

                  {content.layers.map((layer, i) => {
                     const Icon = layerIcons[i] || Layers;
                     return (
                        <div
                           key={i}
                           data-id={`card-${i}`}
                           className={`p-1.5 rounded-[3rem] silk-panel relative group transition-all duration-1000 ease-out z-10 ${isVisible(`card-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
                           style={{ transitionDelay: `${i * 150}ms` }}
                        >
                           <div className="bg-zinc-950 h-full rounded-[2.8rem] p-12 flex flex-col justify-between relative overflow-hidden border border-zinc-900 group-hover:border-maroon/30 transition-all duration-700">
                              <div className="absolute -right-16 -top-16 w-64 h-64 bg-maroon/[0.04] blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                              <div className="space-y-10 relative z-10">
                                 <div className="w-20 h-20 bg-zinc-950 rounded-3xl border border-zinc-900 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-700 group-hover:bg-maroon">
                                    <Icon className={`w-9 h-9 text-zinc-500 group-hover:text-white transition-colors duration-700`} />
                                 </div>
                                 <div className="space-y-4">
                                    <span className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-[0.4em] block font-mono">Infrastructure_Layer_0{i + 1}</span>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight group-hover:text-maroon transition-colors duration-500">{layer.title}</h3>
                                    <p className="text-base text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors duration-500">
                                       {layer.desc}
                                    </p>
                                 </div>
                              </div>

                              <div className="mt-12 pt-8 border-t border-white/[0.03] flex justify-between items-center relative z-10">
                                 <span className="text-[10px] font-mono font-black text-zinc-700 uppercase tracking-widest">Efficiency_Metric</span>
                                 <span className="text-xs font-mono font-black text-maroon bg-maroon/5 px-4 py-2 rounded-xl border border-maroon/10 shadow-lg">{layer.stat}</span>
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>

               <div className="mb-64">
                  <div className="space-y-6 mb-20">
                     <div className="flex items-center gap-3 text-maroon">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono">Metric_Comparisons</span>
                     </div>
                     <h3 className="text-3xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">Topological Benchmarks</h3>
                     <p className="text-zinc-500 text-lg md:text-xl font-medium border-l-2 border-zinc-900 pl-8 max-w-2xl">GhostDAG parallel block ordering establishes a new standard for throughput compared to legacy serial chains.</p>
                  </div>
                  <BenchmarkChart />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {content.features.map((feat, i) => {
                     const Icon = featureIcons[i] || Shield;
                     return (
                        <div
                           key={i}
                           data-id={`sec-${i}`}
                           className={`p-12 rounded-[2.5rem] silk-panel border-white/[0.03] hover:border-maroon/20 hover:bg-black/50 transition-all duration-1000 ${isVisible(`sec-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                           style={{ transitionDelay: `${i * 150}ms` }}
                        >
                           <div className="bg-zinc-950 w-16 h-16 rounded-2xl flex items-center justify-center border border-zinc-900 mb-10 group hover:border-maroon/30 transition-all duration-700">
                              <Icon className="w-8 h-8 text-zinc-600 group-hover:text-maroon transition-colors" />
                           </div>
                           <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{feat.title}</h4>
                           <p className="text-sm text-zinc-500 leading-relaxed font-medium">{feat.desc}</p>
                        </div>
                     )
                  })}
               </div>

            </div>
         </div>
      </PublicLayout>
   );
};

export default Architecture;
