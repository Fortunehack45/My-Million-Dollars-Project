
import React, { useState, useEffect, useRef } from 'react';
import PublicLayout from '../components/PublicLayout';
import {
   GitMerge, Database, Cpu, Shield, Zap,
   Lock, Globe, Activity, Hash, Clock, Layers, GitBranch, Share2, Box
} from 'lucide-react';
import { subscribeToContent, DEFAULT_ARCHITECTURE_CONFIG } from '../services/firebase';
import { ArchitecturePageConfig } from '../types';

const GhostDAGExplainer = () => {
   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center mb-40 relative">
         {/* Background Blueprint Grid Detail */}
         <div className="absolute -left-24 top-0 w-96 h-96 bg-maroon/[0.02] border border-maroon/5 rounded-full blur-3xl pointer-events-none"></div>

         <div className="space-y-10 relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-xl">
               <div className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse shadow-[0_0_8px_#800000]"></div>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Core_Protocol_Schema_v2</span>
            </div>

            <div className="space-y-6">
               <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">GhostDAG: The Death of Orphans</h2>
               <p className="text-zinc-400 leading-relaxed text-lg font-medium">
                  Traditional serial blockchains discard parallel blocks as <span className="text-white italic underline decoration-maroon/50 underline-offset-4">orphans</span>. GhostDAG integrates them into a unified directed acyclic graph.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="p-6 silk-panel rounded-[2rem] space-y-4 hover:border-emerald-500/20 transition-silk group/node">
                  <div className="w-10 h-10 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-center group-hover/node:bg-emerald-500/10 transition-colors">
                     <GitBranch className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Blue Set (Honest)</h4>
                     <p className="text-xs text-zinc-500 leading-relaxed">High-connectivity nodes forming the canonical chain path.</p>
                  </div>
               </div>
               <div className="p-6 silk-panel rounded-[2rem] space-y-4 hover:border-maroon/20 transition-silk group/node">
                  <div className="w-10 h-10 bg-maroon/5 rounded-xl border border-maroon/10 flex items-center justify-center group-hover/node:bg-maroon/10 transition-colors">
                     <Share2 className="w-5 h-5 text-maroon" />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Red Set (Outliers)</h4>
                     <p className="text-xs text-zinc-500 leading-relaxed">Isolated or conflicting blocks pruned from the blue topology.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="relative group">
            {/* Schematic Frame */}
            <div className="absolute -inset-4 border border-zinc-900 rounded-[3rem] opacity-50 pointer-events-none"></div>
            <div className="silk-panel p-1.5 rounded-[3rem] border-zinc-900/50 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(128,0,0,0.05),transparent)]"></div>

               <div className="relative p-10 space-y-10">
                  <div className="h-72 border border-zinc-800/50 bg-black/40 rounded-[2rem] flex items-center justify-center p-10 relative overflow-hidden">
                     {/* Scanning Detail */}
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.03] to-transparent h-1/2 w-full animate-scanline pointer-events-none"></div>

                     <div className="w-full flex justify-around items-center gap-4 relative z-10">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="flex flex-col items-center gap-8">
                              <div className="w-14 h-14 bg-zinc-900 border border-zinc-800/50 flex items-center justify-center rounded-2xl relative shadow-2xl group-hover:border-maroon/30 transition-all duration-500">
                                 <Box className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                                 {i === 2 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>}
                              </div>
                              <div className="h-24 w-px bg-gradient-to-b from-zinc-800 to-transparent"></div>
                              <div className="w-14 h-14 bg-zinc-900/50 border border-zinc-800/30 flex items-center justify-center rounded-2xl">
                                 <Box className="w-6 h-6 text-zinc-700" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-zinc-900 pt-8 px-2">
                     <div className="space-y-2">
                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.25em]">Topological_State</p>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Linearized_DAG</h4>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1">
                           {[1, 2, 3, 4, 5].map(j => <div key={j} className="w-1 h-3 bg-emerald-500/20 rounded-full"></div>)}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Optimal_Sync</span>
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

   // MATRIX RAIN EFFECT
   useEffect(() => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
         canvas.width = window.innerWidth;
         canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      const chars = "01";
      const fontSize = 16;
      let columns = Math.floor(canvas.width / fontSize);
      let drops: number[] = new Array(columns).fill(1).map(() => Math.random() * (canvas.height / fontSize));

      const draw = () => {
         ctx.fillStyle = "rgba(9, 9, 11, 0.08)";
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.font = fontSize + "px monospace";
         const fadeSize = canvas.height * 0.25;

         for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            let opacity = 1;
            if (y < fadeSize) opacity = y / fadeSize;
            else if (y > canvas.height - fadeSize) opacity = (canvas.height - y) / fadeSize;
            opacity = Math.max(opacity, 0);

            ctx.fillStyle = `rgba(244, 63, 94, ${opacity * 0.7})`;
            ctx.fillText(char, x, y);
            if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
         }
         requestRef.current = requestAnimationFrame(draw);
      };

      requestRef.current = requestAnimationFrame(draw);
      return () => {
         if (requestRef.current) cancelAnimationFrame(requestRef.current);
         window.removeEventListener('resize', resize);
      };
   }, []);

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
            {/* Background Animation System */}
            <div className="fixed inset-0 z-0 pointer-events-none">
               <canvas ref={canvasRef} className="absolute inset-0 opacity-[0.15]" />
               <div className="absolute inset-0 bg-[linear-gradient(rgba(128,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(128,0,0,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-maroon/10 blur-[120px] rounded-full mix-blend-screen"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

               {/* Header */}
               <div className="text-center max-w-4xl mx-auto mb-20">
                  <div
                     data-id="hero-badge"
                     className={`inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 backdrop-blur-md rounded-full mb-8 transition-all duration-1000 ${isVisible('hero-badge') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  >
                     <span className="w-2 h-2 rounded-full bg-maroon animate-pulse"></span>
                     <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">GhostDAG Stack V2.8 (PHANTOM)</span>
                  </div>

                  <h1
                     data-id="hero-title"
                     className={`text-6xl md:text-[9rem] font-black text-white uppercase tracking-tighter mb-12 leading-[0.8] transition-all duration-1000 delay-100 ${isVisible('hero-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  >
                     The Parallel Economy
                  </h1>

                  <p
                     data-id="hero-desc"
                     className={`text-xl md:text-2xl text-zinc-500 leading-relaxed max-w-2xl mx-auto transition-all duration-1000 delay-200 font-medium ${isVisible('hero-desc') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  >
                     Argus Protocol utilizes a novel <span className="text-zinc-200">GhostDAG topology</span> to decouple consensus from throughput. We solve the trilemma through topological finality.
                  </p>
               </div>

               {/* New Live Metrics Strip */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32 border-y border-zinc-900/50 py-8">
                  {[
                     { label: 'BlockDAG Height', val: '14,021,992', icon: Hash },
                     { label: 'Ghost Time', val: '400ms', icon: Clock },
                     { label: 'DAG Density', val: '98.2%', icon: Activity },
                     { label: 'Active Clusters', val: '128', icon: Layers },
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

               <GhostDAGExplainer />

               {/* Core Layers Diagram */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40 relative">
                  <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2 z-0"></div>

                  {content.layers.map((layer, i) => {
                     const Icon = layerIcons[i] || Layers;
                     return (
                        <div
                           key={i}
                           data-id={`card-${i}`}
                           className={`silk-panel p-1 rounded-[2rem] relative group transition-silk duration-1000 ease-out z-10 ${isVisible(`card-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
                           style={{ transitionDelay: `${i * 150}ms` }}
                        >
                           <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"></div>
                           <div className="bg-zinc-950 h-full rounded-[1.9rem] p-8 flex flex-col justify-between relative overflow-hidden border border-zinc-900 group-hover:border-zinc-700 transition-colors">
                              <div className="absolute -right-12 -top-12 w-48 h-48 bg-maroon/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                              <div className="space-y-6 relative z-10">
                                 <div className="w-14 h-14 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                    <Icon className={`w-7 h-7 text-white`} />
                                 </div>
                                 <div>
                                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">Layer 0{i + 1}</span>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-maroon transition-colors">{layer.title}</h3>
                                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                       {layer.desc}
                                    </p>
                                 </div>
                              </div>

                              <div className="mt-8 pt-6 border-t border-zinc-900/80 flex justify-between items-center relative z-10">
                                 <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase">Throughput</span>
                                 <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-3 py-1 rounded border border-zinc-800">{layer.stat}</span>
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>

               <div className="mb-32">
                  <div className="text-center mb-12">
                     <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Topology Benchmarks</h3>
                     <p className="text-zinc-500">GhostDAG parallel block ordering compared to legacy serial chains.</p>
                  </div>
                  <BenchmarkChart />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {content.features.map((feat, i) => {
                     const Icon = featureIcons[i] || Shield;
                     return (
                        <div
                           key={i}
                           data-id={`sec-${i}`}
                           className={`p-8 rounded-2xl silk-panel border-zinc-900 hover:bg-zinc-900/40 transition-silk duration-700 ${isVisible(`sec-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                           style={{ transitionDelay: `${i * 150}ms` }}
                        >
                           <Icon className="w-8 h-8 text-zinc-600 mb-4" />
                           <h4 className="text-white font-bold mb-2">{feat.title}</h4>
                           <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
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
