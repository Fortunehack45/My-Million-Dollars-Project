import React, { useState, useEffect, useRef } from 'react';
import PublicLayout from '../components/PublicLayout';
import { 
  GitMerge, Database, Cpu, Network, Shield, Zap, Server, Code, 
  Lock, Globe, Activity, Hash, Clock, Layers, Wifi, Map, 
  Terminal, ArrowRight
} from 'lucide-react';

// --- World Map SVG Paths (Simplified Mercator) ---
const WorldMap = () => (
  <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none fill-zinc-700 stroke-zinc-600 stroke-[0.5]">
     {/* North America */}
     <path d="M150,80 L250,50 L350,50 L300,150 L200,200 L100,150 Z" className="fill-zinc-800/50" /> 
     {/* South America */}
     <path d="M220,220 L300,220 L320,350 L250,450 L200,350 Z" className="fill-zinc-800/50" />
     {/* Europe / Africa */}
     <path d="M420,80 L520,80 L550,200 L500,400 L400,300 L400,150 Z" className="fill-zinc-800/50" />
     {/* Asia */}
     <path d="M550,80 L800,80 L850,200 L750,300 L600,250 Z" className="fill-zinc-800/50" />
     {/* Australia */}
     <path d="M750,350 L850,350 L850,450 L750,450 Z" className="fill-zinc-800/50" />
     
     {/* Accurate-ish Abstract Shapes for better visual cue */}
     <path d="M 120 70 Q 200 20 350 50 L 320 180 L 250 210 L 150 150 Z" /> {/* NA */}
     <path d="M 260 220 L 330 230 L 300 420 L 240 350 Z" /> {/* SA */}
     <path d="M 430 80 L 530 70 L 520 160 L 450 150 Z" /> {/* EU */}
     <path d="M 440 170 L 540 170 L 500 380 L 420 300 Z" /> {/* AF */}
     <path d="M 550 70 L 850 80 L 820 250 L 700 280 L 600 200 Z" /> {/* AS */}
     <path d="M 760 320 L 880 320 L 860 420 L 750 400 Z" /> {/* AU */}
  </svg>
);

// --- Global Network Mesh Visualization ---
const NetworkMesh = () => {
  // Region-based nodes (x,y in percentages)
  const initialNodes = [
    { id: 'US-E', x: 28, y: 35, label: 'US-EAST', active: true },
    { id: 'US-W', x: 15, y: 38, label: 'US-WEST', active: true },
    { id: 'SA-N', x: 32, y: 65, label: 'SA-NODES', active: true },
    { id: 'EU-C', x: 48, y: 28, label: 'EU-CENTRAL', active: true },
    { id: 'EU-W', x: 45, y: 32, label: 'EU-WEST', active: true },
    { id: 'AS-S', x: 75, y: 55, label: 'SINGAPORE', active: true },
    { id: 'AS-E', x: 82, y: 35, label: 'TOKYO', active: true },
    { id: 'AU-S', x: 85, y: 78, label: 'SYDNEY', active: true },
  ];

  const [packets, setPackets] = useState<{id: number, start: {x:number,y:number}, end: {x:number,y:number}, progress: number}[]>([]);
  const [logs, setLogs] = useState<{time: string, msg: string}[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Traffic Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Create Packet
      if (Math.random() > 0.4) {
        const start = initialNodes[Math.floor(Math.random() * initialNodes.length)];
        const end = initialNodes[Math.floor(Math.random() * initialNodes.length)];
        
        if (start.id !== end.id) {
          setPackets(prev => [...prev, {
            id: Date.now() + Math.random(),
            start: {x: start.x, y: start.y},
            end: {x: end.x, y: end.y},
            progress: 0
          }]);

          // 2. Add Log
          const latency = Math.floor(Math.random() * 40 + 10);
          const newLog = {
            time: new Date().toISOString().split('T')[1].slice(0,8),
            msg: `SYNC::${start.id} >> ${end.id} [${latency}ms]`
          };
          setLogs(prev => [...prev.slice(-6), newLog]);
        }
      }

      // 3. Move Packets
      setPackets(prev => prev.map(p => ({
        ...p,
        progress: p.progress + 0.015
      })).filter(p => p.progress < 1));

    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[600px] bg-[#050505] rounded-3xl border border-zinc-900 overflow-hidden relative shadow-2xl group flex flex-col md:flex-row">
      
      {/* Map Area */}
      <div className="relative flex-1 h-full overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none"></div>

        {/* World Map SVG */}
        <WorldMap />

        {/* Data Arcs (SVG Overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
             <linearGradient id="packetGrad" gradientUnits="userSpaceOnUse">
               <stop offset="0%" stopColor="#F43F5E" stopOpacity="0" />
               <stop offset="50%" stopColor="#F43F5E" stopOpacity="1" />
               <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
             </linearGradient>
          </defs>
          {packets.map(p => {
             // Calculate control point for curve (simple quadratic bezier)
             // Lift the curve up (lower Y) based on distance
             const mx = (p.start.x + p.end.x) / 2;
             const my = (p.start.y + p.end.y) / 2;
             const dist = Math.sqrt(Math.pow(p.end.x - p.start.x, 2) + Math.pow(p.end.y - p.start.y, 2));
             const cY = my - (dist * 0.5); // Arch factor

             const pathD = `M ${p.start.x}% ${p.start.y}% Q ${mx}% ${cY}% ${p.end.x}% ${p.end.y}%`;

             return (
                <g key={p.id}>
                   <path d={pathD} stroke="#F43F5E" strokeWidth="1" fill="none" opacity="0.1" />
                   <circle r="2" fill="#fff">
                      <animateMotion dur="1s" repeatCount="1" path={pathD} keyPoints={`${p.progress};${p.progress+0.01}`} keyTimes="0;1" />
                   </circle>
                </g>
             );
          })}
        </svg>

        {/* Nodes */}
        {initialNodes.map(node => (
          <div 
             key={node.id}
             className="absolute -translate-x-1/2 -translate-y-1/2 group/node cursor-pointer"
             style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
             {/* Pulse Ring */}
             <div className="absolute inset-0 -m-4 bg-primary/20 rounded-full blur-md opacity-0 group-hover/node:opacity-100 transition-opacity"></div>
             <div className="relative">
                <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#f43f5e] animate-pulse"></div>
                {/* Tooltip */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded backdrop-blur-md opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                   <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] font-mono font-bold text-white">{node.label}</span>
                   </div>
                   <div className="text-[9px] text-zinc-500 font-mono mt-0.5">Hashrate: 4.2 EH/s</div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Info Panel / Telemetry HUD */}
      <div className="w-full md:w-80 bg-zinc-950/80 backdrop-blur-xl border-t md:border-t-0 md:border-l border-zinc-900 flex flex-col">
         <div className="p-4 border-b border-zinc-900 bg-zinc-900/30">
            <div className="flex items-center gap-2 mb-1">
               <Activity className="w-4 h-4 text-primary" />
               <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Telemetry</h3>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Global State Synchronization</p>
         </div>

         {/* Log Feed */}
         <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px]"
         >
            {logs.map((log, i) => (
               <div key={i} className="flex gap-3 text-zinc-400 border-l-2 border-zinc-800 pl-2 py-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="text-zinc-600 shrink-0">{log.time}</span>
                  <span className="text-white">{log.msg}</span>
               </div>
            ))}
            <div className="flex items-center gap-2 pt-2 animate-pulse">
               <span className="text-primary">_</span>
            </div>
         </div>

         {/* Summary Stats */}
         <div className="p-4 border-t border-zinc-900 bg-zinc-900/20 space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <div className="p-3 rounded bg-zinc-900 border border-zinc-800">
                  <span className="block text-[9px] text-zinc-500 uppercase font-bold mb-1">Active Regions</span>
                  <span className="block text-lg font-mono font-bold text-white">12</span>
               </div>
               <div className="p-3 rounded bg-zinc-900 border border-zinc-800">
                  <span className="block text-[9px] text-zinc-500 uppercase font-bold mb-1">Avg Latency</span>
                  <span className="block text-lg font-mono font-bold text-emerald-500">14ms</span>
               </div>
            </div>
            <button className="w-full py-2 bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors">
               View Full Explorer <ArrowRight className="w-3 h-3" />
            </button>
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

          {/* Deep Dive Section - REPLACED GHOSTDAG WITH NETWORK MAP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24 items-center">
             <div className="lg:col-span-5 space-y-12">
                <div data-id="spec-header" className={`transition-all duration-1000 ${isVisible('spec-header') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-6">Global State<br/>Synchronization</h2>
                   <p className="text-zinc-400 text-lg">
                      Argus utilizes a geographic sharding protocol to minimize latency. 
                      Nodes form localized meshes for millisecond-level consensus before broadcasting to the global state.
                   </p>
                </div>

                <div className="space-y-4">
                   {[
                      { label: 'Geo-Sharding', val: 'Enabled (12 Regions)', icon: Globe },
                      { label: 'Node Distribution', val: 'Fully Decentralized', icon: Network },
                      { label: 'Sybil Resistance', val: 'Proof-of-Uptime (PoU)', icon: Shield },
                      { label: 'Inter-Shard Comms', val: 'Atomic Composability', icon: Wifi },
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

             {/* Visual Representation of Network Map */}
             <div className="lg:col-span-7">
                <div 
                  data-id="dag-vis"
                  className={`relative transition-all duration-1000 delay-300 ${isVisible('dag-vis') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                >
                   {/* NEW NETWORK MESH COMPONENT */}
                   <NetworkMesh />
                </div>
             </div>
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