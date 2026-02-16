import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { 
  GitMerge, Database, Cpu, Network, Shield, Zap, Server, Code, 
  Lock, Globe, Activity, Hash, Clock, Share2, ArrowUpRight, 
  CheckCircle2, Box, Layers, PlayCircle, PauseCircle
} from 'lucide-react';

// --- Professional GhostDAG Visualization Component ---
const GhostDAGVisual = () => {
  const [activeId, setActiveId] = useState<string>('tip');
  const [isSimulating, setIsSimulating] = useState(true);
  const [tick, setTick] = useState(0);

  // Simulation loop for "live" telemetry feel
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Topology Data - Statically defined for stability but styled dynamically
  const nodes = [
    { id: 'gen', x: 50, y: 200, type: 'finalized', label: 'GEN', hash: '0x0000...0000', score: 0, time: 'T-12s' },
    { id: 'a1', x: 150, y: 120, type: 'blue', label: 'A1', hash: '0x3F2A...91B2', score: 140, time: 'T-9s' },
    { id: 'b1', x: 150, y: 280, type: 'red', label: 'B1', hash: '0x81C2...29A1', score: 132, time: 'T-9s' },
    { id: 'a2', x: 280, y: 150, type: 'blue', label: 'A2', hash: '0x9B21...11C2', score: 290, time: 'T-6s' },
    { id: 'b2', x: 280, y: 300, type: 'red', label: 'B2', hash: '0x1C99...44D3', score: 285, time: 'T-6s' },
    { id: 'c1', x: 400, y: 100, type: 'blue', label: 'C1', hash: '0x77A1...88B2', score: 450, time: 'T-3s' },
    { id: 'tip', x: 520, y: 200, type: 'pending', label: 'TIP', hash: '0xFFFF...EEEE', score: 610, time: 'NOW' },
  ];

  const edges = [
    { from: 'gen', to: 'a1', type: 'parent' },
    { from: 'gen', to: 'b1', type: 'parent' },
    { from: 'a1', to: 'a2', type: 'parent' },
    { from: 'b1', to: 'a2', type: 'merge' },
    { from: 'a1', to: 'b2', type: 'parent' },
    { from: 'b1', to: 'b2', type: 'merge' },
    { from: 'a2', to: 'c1', type: 'parent' },
    { from: 'b2', to: 'c1', type: 'merge' },
    { from: 'c1', to: 'tip', type: 'parent' },
    { from: 'b2', to: 'tip', type: 'merge' },
  ];

  const activeNode = nodes.find(n => n.id === activeId) || nodes[nodes.length - 1];

  return (
    <div className="w-full h-[600px] bg-[#09090b] rounded-3xl border border-zinc-900 overflow-hidden relative shadow-2xl flex flex-col md:flex-row">
       {/* --- LEFT: Interactive Graph Area --- */}
       <div className="flex-1 relative h-full bg-[#050505] overflow-hidden group select-none">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
          
          {/* Controls */}
          <div className="absolute top-6 left-6 z-30 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full backdrop-blur-md">
                <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">
                    {isSimulating ? 'LIVE_NET' : 'PAUSED'}
                </span>
            </div>
            <button onClick={() => setIsSimulating(!isSimulating)} className="text-zinc-500 hover:text-white transition-colors">
                {isSimulating ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            </button>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
             <defs>
                <linearGradient id="parentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#27272a" stopOpacity="0.1" />
                   <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="mergeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#27272a" stopOpacity="0.1" />
                   <stop offset="100%" stopColor="#52525b" stopOpacity="0.5" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="4" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
             </defs>

             {/* Edges */}
             {edges.map((edge, i) => {
                const f = nodes.find(n => n.id === edge.from)!;
                const t = nodes.find(n => n.id === edge.to)!;
                const isActivePath = activeId === edge.to || activeId === edge.from;
                const isParent = edge.type === 'parent';
                
                return (
                   <g key={i}>
                      <path 
                         d={`M ${f.x} ${f.y} C ${f.x + 80} ${f.y}, ${t.x - 80} ${t.y}, ${t.x} ${t.y}`}
                         fill="none"
                         stroke={isParent ? "url(#parentGrad)" : "url(#mergeGrad)"}
                         strokeWidth={isParent ? 2 : 1}
                         strokeDasharray={isParent ? "0" : "4 4"}
                         className="transition-all duration-500"
                         style={{ opacity: isActivePath ? 1 : 0.3 }}
                      />
                      {/* Data Packet Animation */}
                      {isSimulating && isParent && (
                         <circle r="2" fill={isActivePath ? "#fff" : "#F43F5E"}>
                            <animateMotion 
                               dur={`${1.5 + (i * 0.2)}s`} 
                               repeatCount="indefinite"
                               path={`M ${f.x} ${f.y} C ${f.x + 80} ${f.y}, ${t.x - 80} ${t.y}, ${t.x} ${t.y}`}
                            />
                         </circle>
                      )}
                   </g>
                );
             })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
             const isActive = activeId === node.id;
             const isTip = node.id === 'tip';
             
             return (
                <div 
                   key={node.id}
                   className={`absolute w-12 h-12 -ml-6 -mt-6 cursor-pointer z-10 transition-all duration-300 ${isActive ? 'scale-110 z-20' : 'scale-100 hover:scale-105'}`}
                   style={{ left: node.x, top: node.y }}
                   onClick={() => setActiveId(node.id)}
                >
                   {/* Glow Effect */}
                   <div className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 ${isActive ? 'opacity-40' : 'opacity-0'} ${node.type === 'blue' || isTip ? 'bg-primary' : 'bg-zinc-500'}`}></div>
                   
                   {/* Node Body */}
                   <div className={`relative w-full h-full rounded-xl border flex items-center justify-center backdrop-blur-md transition-colors duration-300
                      ${node.type === 'blue' || isTip 
                         ? 'bg-zinc-900/90 border-primary/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                         : 'bg-zinc-950/90 border-zinc-800'}
                      ${isActive ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : ''}
                   `}>
                      <div className={`w-2.5 h-2.5 rounded-full ${node.type === 'blue' || isTip ? 'bg-primary' : 'bg-zinc-600'}`}></div>
                   </div>

                   {/* Label */}
                   <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold tracking-widest whitespace-nowrap transition-colors
                      ${isActive ? 'text-white' : 'text-zinc-600'}
                   `}>
                      {node.label}
                   </div>
                </div>
             );
          })}
       </div>

       {/* --- RIGHT: Inspector HUD --- */}
       <div className="w-full md:w-96 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-900 flex flex-col z-20">
          <div className="p-6 border-b border-zinc-900 bg-zinc-900/30">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-primary" />
                   <h3 className="text-xs font-black text-white uppercase tracking-widest">Inspector</h3>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[9px] font-mono text-zinc-500">SYNCED</span>
                </div>
             </div>
             <p className="text-[10px] text-zinc-500">Live block metadata stream</p>
          </div>

          <div className="p-6 space-y-8 flex-1 overflow-y-auto">
             {/* Block ID */}
             <div className="space-y-3">
                <span className="label-meta flex items-center gap-2">
                   <Box className="w-3 h-3" /> Block Identifier
                </span>
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-400">HASH</span>
                      <span className="text-[10px] font-mono text-white">{activeNode.hash}</span>
                   </div>
                   <div className="h-px bg-zinc-800 w-full"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-400">NONCE</span>
                      <span className="text-[10px] font-mono text-zinc-500">49201948</span>
                   </div>
                </div>
             </div>

             {/* Topology Metrics */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800 space-y-2">
                   <span className="text-[9px] font-bold text-zinc-500 uppercase">Blue Score</span>
                   <div className="text-lg font-mono font-bold text-white">{activeNode.score}</div>
                </div>
                <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800 space-y-2">
                   <span className="text-[9px] font-bold text-zinc-500 uppercase">DAA Score</span>
                   <div className="text-lg font-mono font-bold text-zinc-400">{(activeNode.score * 1.05).toFixed(0)}</div>
                </div>
             </div>

             {/* Consensus Status */}
             <div className="space-y-3">
                <span className="label-meta flex items-center gap-2">
                   <Shield className="w-3 h-3" /> Consensus State
                </span>
                <div className={`p-3 rounded-lg border flex items-center gap-3 ${
                   activeNode.type === 'blue' || activeNode.type === 'pending' || activeNode.type === 'finalized'
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-zinc-900 border-zinc-800'
                }`}>
                   {activeNode.type === 'pending' ? (
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                   ) : (
                      <CheckCircle2 className={`w-4 h-4 ${activeNode.type === 'blue' || activeNode.type === 'finalized' ? 'text-primary' : 'text-zinc-600'}`} />
                   )}
                   <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      activeNode.type === 'blue' || activeNode.type === 'finalized' ? 'text-white' : 'text-zinc-400'
                   }`}>
                      {activeNode.type === 'pending' ? 'PROPAGATING...' : activeNode.type.toUpperCase()}
                   </span>
                </div>
             </div>

             {/* Parents List */}
             <div className="space-y-3">
                <span className="label-meta flex items-center gap-2">
                   <Share2 className="w-3 h-3" /> DAG Parents
                </span>
                <div className="space-y-2">
                   {activeNode.id === 'gen' ? (
                      <div className="text-[10px] text-zinc-600 italic pl-2">Genesis Block (Root)</div>
                   ) : (
                      edges.filter(e => e.to === activeNode.id).map((e, i) => (
                         <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900/40 rounded border border-zinc-800/50">
                            <span className="text-[10px] font-mono text-zinc-400">BLOCK_{e.from.toUpperCase()}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                               e.type === 'parent' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                               {e.type === 'parent' ? 'SELECTED_PARENT' : 'MERGE_SET'}
                            </span>
                         </div>
                      ))
                   )}
                </div>
             </div>
          </div>
          
          <div className="p-4 bg-zinc-950 border-t border-zinc-900">
             <button className="w-full py-3 bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2">
                Open in Block Explorer <ArrowUpRight className="w-3 h-3" />
             </button>
          </div>
       </div>
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

          {/* Deep Dive Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-32 items-center">
             <div className="lg:col-span-4 space-y-12">
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
             <div className="lg:col-span-8">
                <div 
                  data-id="dag-vis"
                  className={`relative transition-all duration-1000 delay-300 ${isVisible('dag-vis') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                >
                   <div className="mb-6 flex items-center justify-between">
                     <div>
                       <h3 className="text-xl font-bold text-white mb-1">GhostDAG Topology</h3>
                       <p className="text-sm text-zinc-500">Visualizing parallel block references and consensus ordering.</p>
                     </div>
                   </div>

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