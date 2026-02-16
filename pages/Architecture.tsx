import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { 
  Layers, Database, Cpu, Network, Shield, Zap, Server, Code, 
  GitMerge, Box, Lock, Globe, Info, Activity, Hash, 
  Clock, ArrowUpRight, CheckCircle2, Share2 
} from 'lucide-react';

// --- Advanced GhostDAG Visualization Component ---
const GhostDAGVisual = () => {
  const [activeId, setActiveId] = useState<string>('tip');
  const [tick, setTick] = useState(0);

  // Simulation loop for "live" feel
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  // Topological Data Structure
  const nodes = [
    { id: 'gen', x: 60, y: 250, type: 'finalized', label: 'GEN', hash: '0x0000...0000', score: 0, time: 'T-12s' },
    { id: 'a1', x: 160, y: 150, type: 'blue', label: 'A1', hash: '0x3F2A...91B2', score: 140, time: 'T-9s' },
    { id: 'b1', x: 160, y: 350, type: 'red', label: 'B1', hash: '0x81C2...29A1', score: 132, time: 'T-9s' },
    { id: 'a2', x: 280, y: 180, type: 'blue', label: 'A2', hash: '0x9B21...11C2', score: 290, time: 'T-6s' },
    { id: 'b2', x: 280, y: 320, type: 'red', label: 'B2', hash: '0x1C99...44D3', score: 285, time: 'T-6s' },
    { id: 'c1', x: 400, y: 120, type: 'blue', label: 'C1', hash: '0x77A1...88B2', score: 450, time: 'T-3s' },
    { id: 'tip', x: 520, y: 250, type: 'pending', label: 'TIP', hash: '0xFFFF...EEEE', score: 610, time: 'NOW' },
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
    <div className="w-full h-[550px] bg-[#050505] rounded-3xl border border-zinc-900 overflow-hidden relative group shadow-2xl flex">
       {/* --- LEFT: Graph Visualization Area (70%) --- */}
       <div className="flex-1 relative h-full overflow-hidden cursor-crosshair" onClick={() => setActiveId('tip')}>
          {/* Cyberpunk Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
             <defs>
                <linearGradient id="lineGradientBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#3f3f46" stopOpacity="0.2" />
                   <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="3" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
             </defs>

             {/* Edges */}
             {edges.map((edge, i) => {
                const f = nodes.find(n => n.id === edge.from)!;
                const t = nodes.find(n => n.id === edge.to)!;
                const isActivePath = activeId === edge.to || activeId === edge.from;
                
                return (
                   <g key={i}>
                      <path 
                         d={`M ${f.x} ${f.y} C ${f.x + 50} ${f.y}, ${t.x - 50} ${t.y}, ${t.x} ${t.y}`}
                         fill="none"
                         stroke={edge.type === 'parent' ? "url(#lineGradientBlue)" : "#27272a"}
                         strokeWidth={edge.type === 'parent' ? 2 : 1}
                         strokeDasharray={edge.type === 'merge' ? "4 4" : "none"}
                         className="transition-all duration-500"
                         style={{ opacity: isActivePath ? 1 : 0.4 }}
                      />
                      {/* Data Particle */}
                      {edge.type === 'parent' && (
                         <circle r="2" fill="#F43F5E">
                            <animateMotion 
                               dur={`${2 + (i % 2)}s`} 
                               repeatCount="indefinite"
                               path={`M ${f.x} ${f.y} C ${f.x + 50} ${f.y}, ${t.x - 50} ${t.y}, ${t.x} ${t.y}`}
                            />
                         </circle>
                      )}
                   </g>
                );
             })}
          </svg>

          {/* Interactive Nodes */}
          {nodes.map((node) => {
             const isActive = activeId === node.id;
             const isTip = node.id === 'tip';
             
             return (
                <div 
                   key={node.id}
                   className={`absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center transition-all duration-300 z-10
                      ${isActive ? 'scale-125 z-20' : 'scale-100'}
                   `}
                   style={{ left: node.x, top: node.y }}
                   onMouseEnter={(e) => { e.stopPropagation(); setActiveId(node.id); }}
                >
                   {/* Node Shape */}
                   <div className={`relative w-full h-full rounded-lg border flex items-center justify-center backdrop-blur-sm transition-colors duration-300
                      ${node.type === 'blue' || node.type === 'pending' 
                         ? 'bg-zinc-900/80 border-primary/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                         : 'bg-zinc-950 border-zinc-800'}
                      ${isActive ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : ''}
                   `}>
                      {/* Inner Dot */}
                      <div className={`w-2 h-2 rounded-full 
                         ${node.type === 'blue' ? 'bg-primary' : node.type === 'pending' ? 'bg-white animate-pulse' : 'bg-zinc-600'}
                      `}></div>

                      {/* Ripple for Tip */}
                      {isTip && (
                         <div className="absolute inset-0 rounded-lg border border-primary/50 animate-ping"></div>
                      )}
                   </div>

                   {/* Label */}
                   <div className={`absolute -bottom-6 text-[9px] font-mono font-bold tracking-wider transition-colors
                      ${isActive ? 'text-white' : 'text-zinc-600'}
                   `}>
                      {node.label}
                   </div>
                </div>
             );
          })}
          
          <div className="absolute top-4 left-4 flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Topology</span>
             </div>
             <span className="text-[9px] font-mono text-zinc-600">Tick: {tick} | Propagation: 12ms</span>
          </div>
       </div>

       {/* --- RIGHT: HUD Inspector Panel (30%) --- */}
       <div className="w-80 bg-zinc-900/95 border-l border-zinc-800 backdrop-blur-xl flex flex-col relative z-20">
          <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
             <div className="flex items-center gap-3 mb-1">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Block Inspector</h3>
             </div>
             <p className="text-[10px] text-zinc-500 font-mono">Real-time metadata analysis</p>
          </div>

          <div className="p-6 space-y-8 flex-1 overflow-y-auto">
             {/* Main ID */}
             <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                   <Hash className="w-3 h-3" /> Block Hash
                </span>
                <div className="font-mono text-sm text-white break-all leading-tight bg-zinc-950 p-3 rounded border border-zinc-800">
                   {activeNode.hash}
                </div>
             </div>

             {/* Status Grid */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">State</span>
                   <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded border w-fit ${
                      activeNode.type === 'blue' || activeNode.type === 'pending'
                         ? 'bg-primary/10 text-primary border-primary/20'
                         : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                   }`}>
                      {activeNode.type === 'pending' ? 'PENDING' : 'ACCEPTED'}
                   </div>
                </div>
                <div className="space-y-1">
                   <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Blue Score</span>
                   <div className="text-xs font-mono font-bold text-white px-2 py-1">
                      {activeNode.score}
                   </div>
                </div>
             </div>

             {/* Parents */}
             <div className="space-y-3">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                   <Share2 className="w-3 h-3" /> Parent References
                </span>
                <div className="space-y-1">
                   {activeNode.id === 'gen' ? (
                      <span className="text-[10px] text-zinc-600 italic">Genesis Block (No Parents)</span>
                   ) : (
                      edges.filter(e => e.to === activeNode.id).map((e, i) => (
                         <div key={i} className="flex items-center justify-between text-[10px] p-2 bg-zinc-950 rounded border border-zinc-800">
                            <span className="font-mono text-zinc-400">Node_{e.from.toUpperCase()}</span>
                            <span className={`font-bold ${e.type === 'parent' ? 'text-primary' : 'text-zinc-600'}`}>
                               {e.type.toUpperCase()}
                            </span>
                         </div>
                      ))
                   )}
                </div>
             </div>

             {/* Timestamp */}
             <div className="pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Timestamp
                   </span>
                   <span className="text-[10px] font-mono text-white">{activeNode.time}</span>
                </div>
             </div>
          </div>
          
          <div className="p-4 bg-zinc-950 border-t border-zinc-800">
             <button className="w-full py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                View Raw Data <ArrowUpRight className="w-3 h-3" />
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