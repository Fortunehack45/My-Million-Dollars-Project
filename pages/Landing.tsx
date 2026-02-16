import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Hexagon, 
  ArrowRight, 
  Activity, 
  ChevronRight,
  Terminal as TerminalIcon,
  Code2,
  Layers,
  Zap,
  Globe,
  Cpu,
  Server,
  ShieldCheck,
  Network,
  CheckCircle2,
  Lock,
  Box,
  ChevronDown,
  Plus,
  GitCommit,
  Share2,
  Database
} from 'lucide-react';

const Landing = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState({ latency: 12, nodes: 24802, blocks: 104290 });
  
  // Interactive Background States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState(0);

  // Terminal Logs State
  const [logs, setLogs] = useState<Array<{id: number, prefix: string, msg: string, status: string}>>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

  // 1. Infinite Terminal Logic
  useEffect(() => {
    // Initial Hydration
    setLogs([
       { id: 1, prefix: "SYS", msg: "initializing_handshake_protocol", status: "OK" },
       { id: 2, prefix: "NET", msg: "establishing_secure_tunnel", status: "OK" },
       { id: 3, prefix: "SEC", msg: "verifying_integrity_hash", status: "OK" },
    ]);

    const verbs = ["allocating", "hashing", "syncing", "verifying", "connecting", "broadcasting", "compressing", "indexing"];
    const nouns = ["block_header", "mempool_buffer", "peer_node", "dag_topology", "sharded_state", "zk_proof", "execution_layer"];
    
    const interval = setInterval(() => {
      setLogs(prev => {
        const id = Date.now();
        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const hash = "0x" + Math.random().toString(16).substr(2, 6).toUpperCase();
        
        // Randomize urgency
        const isCritical = Math.random() > 0.7;
        const prefix = isCritical ? "NET" : "SYS";
        const status = isCritical ? `${Math.floor(Math.random() * 40 + 10)}ms` : "OK";
        
        const newLog = { id, prefix, msg: `${verb}::${noun} [${hash}]`, status };
        
        // Keep last 8 lines to fit perfectly in container
        const newLogs = [...prev, newLog];
        if (newLogs.length > 8) return newLogs.slice(newLogs.length - 8);
        return newLogs;
      });
    }, 500); // Fast, active update rate

    return () => clearInterval(interval);
  }, []);

  // 2. Telemetry Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        latency: Math.floor(Math.random() * 8 + 12),
        nodes: prev.nodes + (Math.random() > 0.7 ? 1 : 0),
        blocks: prev.blocks + 1
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 3. Precision Cursor Tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // 4. System Override Logic
  const triggerRootOverride = () => {
    setIsEmergency(true);
    setTimeout(() => {
      setIsEmergency(false);
      setIsMatrixActive(true);
    }, 2000);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === konamiCode[konamiProgress] || e.key.toLowerCase() === konamiCode[konamiProgress]) {
      const next = konamiProgress + 1;
      setKonamiProgress(next);
      if (next === konamiCode.length) {
        triggerRootOverride();
        setKonamiProgress(0);
      }
    } else {
      setKonamiProgress(0);
    }
  }, [konamiProgress]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 5. Matrix Engine (Red/Black Spec)
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

    const katakana = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
    const technical = "01-NEXUS-NODE-HASH-BLOCK-";
    const alphabet = katakana + technical;
    const fontSize = 13;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * canvas.height / fontSize);

    const draw = () => {
      ctx.fillStyle = "rgba(3, 3, 3, 0.15)"; // Dark fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        if (isEmergency) {
          ctx.fillStyle = "#ffffff"; 
        } else {
          // Red Spectrum
          const isHighlight = Math.random() > 0.98;
          ctx.fillStyle = isHighlight ? "#fda4af" : "#F43F5E"; // Highlight Rose vs Primary Red
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) {
          drops[i] = 0;
        }
        drops[i] += 0.75;
      }
      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isMatrixActive, isEmergency]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div 
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white transition-all duration-700 ${isEmergency ? 'grayscale contrast-125' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* --- INFRASTRUCTURE BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Pass 1: Digital Rain (Red) */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 opacity-[0.15]"
        />

        {/* Pass 2: Technical Grid */}
        <div className="absolute inset-0 opacity-[0.06]" 
             style={{ backgroundImage: 'linear-gradient(rgba(244, 63, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Pass 3: Volumetric Beam (Red Blend) */}
        <div className="absolute inset-0 pointer-events-none">
           {/* Darkening Mask to focus beam */}
           <div className="absolute inset-0 bg-zinc-950/80 mix-blend-multiply"></div>
           
           {/* The Pure Beam - Soft Red */}
           <div 
             className="absolute w-[500px] h-[1400px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-[80px] transition-transform duration-100 ease-out will-change-transform"
             style={{ 
               transform: `translate(${mousePos.x - 250}px, ${mousePos.y - 400}px) rotate(20deg)`,
             }}
           />
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-zinc-900 border border-primary/30 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <Hexagon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-bold text-xl tracking-tight text-white">Nexus<span className="text-zinc-500">Node</span></span>
              <span className="text-[9px] font-mono text-primary/80 tracking-widest uppercase">Testnet_v2.8</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['Architecture', 'Validators', 'Explorer', 'Docs'].map((item) => (
              <a key={item} href="#" className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </div>
          <button onClick={login} className="flex items-center gap-3 px-6 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all">
             Initialize Console
          </button>
        </div>
      </nav>

      {/* Main Hero */}
      <div className="relative z-10">
        <section className="pt-24 pb-32 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Text Content */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                   <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Genesis Epoch Active</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                  Decentralized <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Compute</span> Layer.
                </h1>
                
                <p className="text-zinc-400 text-lg font-medium max-w-xl leading-relaxed">
                  Deploy high-performance validator nodes. Verify network integrity, mine <span className="text-white font-bold">NEX Credits</span>, and secure your allocation of the Genesis supply.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                <button onClick={login} className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 rounded-lg">
                   Start Validator Node <ArrowRight className="w-4 h-4" />
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-800 text-[11px] font-black text-white uppercase tracking-widest hover:border-zinc-700 transition-all flex items-center justify-center gap-3 rounded-lg">
                   Read Whitepaper <Code2 className="w-4 h-4 text-zinc-600" />
                </button>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-6 border-t border-zinc-900/50 pt-8">
                <div>
                   <p className="text-[2rem] font-mono font-bold text-white leading-none">40<span className="text-primary text-lg">+</span></p>
                   <p className="text-[9px] font-black text-zinc-600 uppercase mt-1 tracking-widest">Node Regions</p>
                </div>
                <div>
                   <p className="text-[2rem] font-mono font-bold text-white leading-none">12<span className="text-primary text-lg">ms</span></p>
                   <p className="text-[9px] font-black text-zinc-600 uppercase mt-1 tracking-widest">Global Latency</p>
                </div>
                <div>
                   <p className="text-[2rem] font-mono font-bold text-white leading-none">24<span className="text-primary text-lg">k</span></p>
                   <p className="text-[9px] font-black text-zinc-600 uppercase mt-1 tracking-widest">Active Peers</p>
                </div>
              </div>
            </div>

            {/* Terminal Visual */}
            <div className="lg:col-span-5 relative">
               <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent blur-2xl opacity-50"></div>
               <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                  {/* Terminal Header */}
                  <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                     <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <TerminalIcon className="w-3 h-3" />
                        <span>root@nexus-node:~</span>
                     </div>
                  </div>
                  
                  {/* Terminal Body - Live Infinite Feed */}
                  <div className="p-6 font-mono text-xs h-[320px] flex flex-col relative">
                     <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_2px]"></div>

                     <div className="space-y-3 flex-1 overflow-hidden flex flex-col justify-end pb-4 relative z-10">
                        {logs.map((log) => (
                           <div key={log.id} className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold ${log.prefix === 'NET' ? 'text-primary' : 'text-zinc-600'}`}>[{log.prefix}]</span>
                              <span className="text-zinc-400 truncate flex-1">&gt; {log.msg}</span>
                              <span className={`text-[10px] font-bold ${log.status === 'OK' ? 'text-zinc-500' : 'text-white'}`}>{log.status}</span>
                           </div>
                        ))}
                        {/* Active Cursor Line */}
                        <div className="flex items-center gap-3 opacity-80">
                           <span className="text-[10px] font-bold text-primary">[CMD]</span>
                           <div className="h-4 w-2 bg-primary animate-pulse"></div>
                        </div>
                     </div>

                     <div className="mt-auto pt-6 border-t border-zinc-900/50 relative z-10">
                        <div className="flex justify-between items-end">
                           <div>
                              <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mb-1">Current Yield</p>
                              <p className="text-2xl text-white font-bold">1.25 <span className="text-sm text-zinc-500">NEX/hr</span></p>
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded border border-primary/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                              <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Mining</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Scrolling Ticker */}
        <div className="bg-zinc-900/30 border-y border-zinc-900 py-3 overflow-hidden">
           <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
              {Array.from({length: 8}).map((_, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <Activity className="w-3 h-3 text-zinc-700" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500">TX_HASH::0x{Math.random().toString(16).slice(2, 10)}...</span>
                    <span className="text-[10px] font-mono font-bold text-primary">CONFIRMED</span>
                 </div>
              ))}
           </div>
        </div>

        {/* Ecosystem Logos */}
        <section className="py-20 border-b border-zinc-900">
           <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
              <p className="label-meta text-zinc-600">Infrastructure Supported By</p>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                 {/* Placeholders for "Institutions" - Using Text for "Human/Clean" look instead of random SVGs */}
                 {['SEQUOIA_COMPUTE', 'ANDREESSEN_CLOUD', 'BINANCE_LABS', 'COINBASE_VENTURES', 'POLYCHAIN_CAPITAL'].map((name, i) => (
                    <h3 key={i} className="text-lg font-black tracking-tighter text-white uppercase">{name.replace('_', ' ')}</h3>
                 ))}
              </div>
           </div>
        </section>

        {/* Technical Architecture */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                 <div className="space-y-6">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                       Modular <br/> <span className="text-zinc-600">Architecture</span>
                    </h2>
                    <p className="text-zinc-500 text-lg leading-relaxed max-w-md">
                       Separating consensus from execution allows NexusNode to achieve linear scalability. Our proprietary <span className="text-white font-bold">GhostDAG</span> protocol ensures instant finality.
                    </p>
                 </div>
                 
                 <div className="space-y-6">
                    {[
                       { title: 'Consensus Layer', desc: 'Proof-of-Uptime verification engine.' },
                       { title: 'Data Availability', desc: 'Sharded storage across 40k+ nodes.' },
                       { title: 'Execution Layer', desc: 'WASM-based high performance VM.' }
                    ].map((layer, i) => (
                       <div key={i} className="flex gap-6 group">
                          <div className="w-12 h-12 border border-zinc-800 bg-zinc-950 flex items-center justify-center rounded-lg group-hover:border-primary/50 transition-colors">
                             <Layers className="w-5 h-5 text-zinc-500 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                             <h4 className="text-lg font-bold text-white">{layer.title}</h4>
                             <p className="text-sm text-zinc-600">{layer.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Diagram Visual */}
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                 <div className="relative border border-zinc-800 bg-zinc-950 rounded-2xl p-8 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                       <span className="label-meta text-primary">Stack_View</span>
                       <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                          <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                       </div>
                    </div>
                    {/* Abstract Blocks */}
                    <div className="space-y-2">
                       <div className="h-16 w-full bg-zinc-900/50 border border-zinc-800 rounded flex items-center justify-center">
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Application Layer (dApps)</span>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <div className="h-24 bg-primary/5 border border-primary/20 rounded flex flex-col items-center justify-center gap-2">
                             <Cpu className="w-4 h-4 text-primary" />
                             <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Execution</span>
                          </div>
                          <div className="h-24 bg-zinc-900/50 border border-zinc-800 rounded flex flex-col items-center justify-center gap-2">
                             <Database className="w-4 h-4 text-zinc-500" />
                             <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Storage</span>
                          </div>
                       </div>
                       <div className="h-12 w-full bg-zinc-900/80 border border-zinc-800 rounded flex items-center justify-center">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Nexus Consensus (GhostDAG)</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Features Grid - Refined */}
        <section className="py-32 px-6 max-w-7xl mx-auto w-full border-t border-zinc-900">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                 { icon: Globe, title: "Global Mesh", desc: "Low-latency topology distributed across 40+ regions." },
                 { icon: ShieldCheck, title: "Proof of Uptime", desc: "Cryptographic verification of node availability and performance." },
                 { icon: Cpu, title: "Elastic Compute", desc: "Dynamic resource allocation scaling with network demand." }
              ].map((f, i) => (
                 <div key={i} className="group p-10 border border-zinc-900 bg-zinc-950 hover:border-primary/30 transition-all duration-500 rounded-none relative overflow-hidden">
                    <div className="w-12 h-12 bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                       <f.icon className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                 </div>
              ))}
           </div>
        </section>

        {/* Roadmap - Linear Professional */}
        <section className="py-32 bg-zinc-950 border-y border-zinc-900 relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="mb-20">
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Execution Roadmap</h2>
              </div>
              
              <div className="relative border-l border-zinc-800 ml-4 md:ml-0 space-y-16">
                 {[
                    { phase: "PHASE_1", title: "Genesis Testnet", date: "Q1 2025", status: "CURRENT", items: ["Node Registry Live", "Mining Algorithm V1", "Faucet Deployment"] },
                    { phase: "PHASE_2", title: "Incentivized Devnet", date: "Q3 2025", status: "UPCOMING", items: ["Smart Contracts Support", "Bridge Integration", "Public Stress Test"] },
                    { phase: "PHASE_3", title: "Mainnet Beta", date: "Q1 2026", status: "LOCKED", items: ["Token TGE", "Governance DAO", "Global Sharding"] }
                 ].map((stage, i) => (
                    <div key={i} className="md:grid md:grid-cols-12 gap-8 items-start pl-8 md:pl-0 relative">
                       {/* Timeline Dot */}
                       <div className={`absolute left-[-5px] md:left-auto md:right-auto md:col-start-4 w-2.5 h-2.5 rounded-full border border-zinc-950 ${stage.status === 'CURRENT' ? 'bg-primary shadow-[0_0_10px_#f43f5e]' : 'bg-zinc-800'}`}></div>

                       <div className="md:col-span-3 text-right hidden md:block pr-12">
                          <span className="text-2xl font-black text-white block">{stage.date}</span>
                          <span className={`text-[10px] font-mono font-bold tracking-widest ${stage.status === 'CURRENT' ? 'text-primary' : 'text-zinc-600'}`}>{stage.status}</span>
                       </div>

                       <div className="md:col-span-9">
                          <div className="flex items-center gap-4 mb-4">
                             <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{stage.phase}</span>
                             <h3 className="text-xl font-bold text-white">{stage.title}</h3>
                             <span className="md:hidden text-xs text-zinc-500 ml-auto">{stage.date}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             {stage.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 border border-zinc-900 bg-zinc-900/20">
                                   <CheckCircle2 className={`w-4 h-4 ${stage.status === 'CURRENT' ? 'text-white' : 'text-zinc-700'}`} />
                                   <span className="text-xs text-zinc-400 font-medium">{item}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FAQ - Accordion Style */}
        <section className="py-32 px-6 max-w-4xl mx-auto w-full">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-16 text-center">Protocol FAQ</h2>
           <div className="space-y-4">
              {[
                 { q: "What are the hardware requirements for a node?", a: "NexusNode is designed to be lightweight. A standard VPS with 2 vCPUs, 4GB RAM, and 50GB SSD is sufficient for the testnet phase." },
                 { q: "How are mining rewards calculated?", a: "Rewards are based on uptime proofs and referral topology. The base rate is 0.06 NEX/hr, with multipliers for verified referral connections." },
                 { q: "Is the testnet incentivized?", a: "Yes. Points earned during the Genesis Epoch will be converted to mainnet tokens at TGE based on a vesting schedule defined in the whitepaper." },
                 { q: "Can I run multiple nodes?", a: "During Phase 1, we limit one validator ID per KYC/Identity to ensure fair distribution and network decentralization." }
              ].map((item, i) => (
                 <div key={i} className="border border-zinc-900 bg-zinc-950 overflow-hidden">
                    <button 
                       onClick={() => toggleFaq(i)}
                       className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-900/50 transition-colors"
                    >
                       <span className="font-bold text-white text-sm uppercase tracking-wide">{item.q}</span>
                       <Plus className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                       <div className="p-6 pt-0 text-zinc-500 text-sm leading-relaxed border-t border-zinc-900/50 mt-2">
                          {item.a}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 border-t border-zinc-900 relative">
           <div className="absolute inset-0 bg-primary/5"></div>
           <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                 Secure the <br/> <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-black/50">Genesis Block</span>
              </h2>
              <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                 Join 24,000+ validators securing the next generation of decentralized compute. Early participation ensures maximum allocation.
              </p>
              <div className="flex justify-center gap-6 pt-8">
                 <button onClick={login} className="h-14 px-10 bg-primary text-white text-[13px] font-bold uppercase tracking-[0.1em] hover:bg-white hover:text-black transition-colors duration-300 shadow-[0_10px_40px_rgba(244,63,94,0.2)] flex items-center gap-3">
                    Initialize Node <TerminalIcon className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 pt-24 pb-12 px-6">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <Hexagon className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold text-white tracking-tight">NexusNode</span>
                 </div>
                 <p className="text-xs text-zinc-600 max-w-xs">Building the verification layer for the decentralized web.</p>
              </div>
              <div className="flex gap-16">
                 <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Network</span>
                    <a href="#" className="text-xs text-zinc-500 hover:text-primary transition-colors">Explorer</a>
                    <a href="#" className="text-xs text-zinc-500 hover:text-primary transition-colors">Staking</a>
                 </div>
                 <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Resources</span>
                    <a href="#" className="text-xs text-zinc-500 hover:text-primary transition-colors">Documentation</a>
                    <a href="#" className="text-xs text-zinc-500 hover:text-primary transition-colors">API</a>
                 </div>
              </div>
           </div>
           <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-900/50 flex justify-between items-center">
              <span className="text-[10px] text-zinc-700 font-mono">© 2026 NEXUS LABS.</span>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Systems Operational</span>
              </div>
           </div>
        </footer>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .Database { /* Dummy class to ensure icon import usage if needed in future */ }
      `}</style>
    </div>
  );
};

export default Landing;