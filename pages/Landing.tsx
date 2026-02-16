import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Hexagon, 
  ArrowRight, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Server,
  ChevronRight,
  Database,
  Terminal as TerminalIcon,
  Code2,
  Layers,
  Network
} from 'lucide-react';

const Landing = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [telemetry, setTelemetry] = useState({ latency: 14, nodes: 24802, blocks: 104290 });
  
  // Interactive Background States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState(0);
  const [statusText, setStatusText] = useState("STAGING_READY");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

  // 1. Telemetry Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        latency: Math.floor(Math.random() * 5 + 12),
        nodes: prev.nodes + (Math.random() > 0.8 ? 1 : 0),
        blocks: prev.blocks + 1
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Diagnostic Scanner Tracker
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // 3. Konami & Override Logic
  const triggerRootOverride = () => {
    setIsEmergency(true);
    setTimeout(() => {
      setIsEmergency(false);
      setIsMatrixActive(true);
      setStatusText("ROOT_ACCESS_GRANTED");
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

  // 4. Matrix Background Logic (Professional Rain)
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
    const technical = "01ABCDEF-NEXUS-NODE-";
    const alphabet = katakana + technical;
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      // Fade effect for trails
      ctx.fillStyle = "rgba(3, 3, 3, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Select color based on state
      ctx.fillStyle = isEmergency ? "#F43F5E" : (isMatrixActive ? "#10b981" : "#14532d");
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Speed control
        const speed = isMatrixActive ? 0.98 : 0.992;
        if (drops[i] * fontSize > canvas.height && Math.random() > speed) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, [isMatrixActive, isEmergency]);

  return (
    <div 
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white transition-all duration-700 ${isEmergency ? 'grayscale contrast-150' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* --- INFRASTRUCTURE BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Layer 1: Digital Rain Matrix (Subtle background texture) */}
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 transition-opacity duration-[3000ms] ${isMatrixActive ? 'opacity-40' : 'opacity-[0.08]'}`}
        />

        {/* Layer 2: Encrypted Metadata Clues (Revealed by scanner) */}
        <div className="absolute inset-0 opacity-[0.15]">
           <span className="absolute top-[15%] left-[12%] -rotate-12 font-mono text-[9px] text-zinc-600 tracking-widest uppercase">INFRA_PROTOCOL_IDENTIFIED</span>
           <span className="absolute top-[35%] right-[22%] rotate-3 font-mono text-[9px] text-zinc-600 border border-zinc-900/50 p-2">CODE: ↑ ↑ ↓ ↓ ← →</span>
           <span className="absolute bottom-[30%] left-[18%] rotate-6 font-mono text-[9px] text-zinc-600">OFFSET_GENESIS_0x8F</span>
           <span className="absolute bottom-[12%] right-[28%] -rotate-2 font-mono text-[9px] text-zinc-600">ROOT_B_A_SEQUENCE</span>
           <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] text-zinc-900 font-black select-none opacity-20 italic">?</span>
        </div>

        {/* Layer 3: Structural Grid Geometry */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Layer 4: Diagnostic Scanner (High-Fidelity Flashlight) */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ${isMatrixActive ? 'opacity-0' : 'opacity-100'}`}
          style={{
            background: `radial-gradient(circle 320px at ${mousePos.x}px ${mousePos.y}px, 
              transparent 0%, 
              rgba(16, 185, 129, 0.05) 15%, 
              rgba(3, 3, 3, 0.45) 40%, 
              rgba(3, 3, 3, 0.92) 65%, 
              #030303 100%)`
          }}
        />
      </div>
      {/* --- END BACKGROUND SYSTEM --- */}

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 border border-primary/50 bg-primary/10 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <Hexagon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-lg tracking-tighter uppercase italic text-white">NexusNode</span>
              <span className="label-meta text-[7px] text-zinc-600">STAGING_NET v2.8</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['Protocol', 'Validators', 'Roadmap', 'Docs'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </div>
          <button onClick={login} className="btn-primary !py-3 !px-8 flex items-center gap-3">
            Initialize Access <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Main Content (Elevated Z-Index) */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-40 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="label-meta text-[8px] text-zinc-400">EPOCH_01_PROVISIONING :: 82% CAPACITY</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
                  Validate the <br/>
                  <span className="text-primary">Global Compute</span> <br/>
                  Mesh.
                </h1>
                <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                  Deploy infrastructure nodes on an elastic compute layer designed for high-availability decentralized applications. Mine credits and secure the Genesis registry.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <button onClick={login} className="btn-primary !px-12 !py-6 w-full sm:w-auto text-sm group relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Provision Node <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                <div className="flex flex-col">
                  <p className="label-meta text-zinc-600 mb-2">Network Health</p>
                  <div className="flex gap-1">
                    {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className={`w-1.5 h-6 rounded-sm ${i < 10 ? 'bg-emerald-500/40' : 'bg-zinc-800'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className={`surface p-1 rounded-2xl shadow-2xl relative z-10 transition-all duration-500 ${isEmergency ? 'border-primary shadow-[0_0_50px_rgba(244,63,94,0.3)]' : ''}`}>
                <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                  <div className="bg-zinc-900/50 px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TerminalIcon className={`w-3 h-3 ${isEmergency ? 'text-primary animate-pulse' : 'text-zinc-600'}`} />
                      <span className="label-meta text-[7px] text-zinc-400">TERMINAL_INSTANCE::084</span>
                    </div>
                  </div>
                  <div className="p-8 space-y-8 font-mono">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-600">ID::NEXUS_CORE</span>
                        <span className={`${isEmergency ? 'text-primary' : 'text-emerald-500'} font-bold`}>{statusText}</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-[3000ms] ${isEmergency ? 'bg-primary w-full shadow-[0_0_10px_#f43f5e]' : 'bg-emerald-500 w-[94%] shadow-[0_0_10px_#10b981]'}`}></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className={`w-1 rounded-full ${isEmergency ? 'bg-primary' : 'bg-primary/40'}`}></div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-zinc-500 uppercase font-black">{isEmergency ? 'OVERRIDE_MODE' : 'Current Yield Rate'}</p>
                          <p className="text-2xl text-white font-bold tracking-tighter">{isEmergency ? 'AUTH_ROOT' : '24.08'} <span className="text-[10px] text-zinc-700">NEX / HR</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-900">
                      <p className="text-[8px] text-zinc-700 leading-relaxed italic">
                        {isEmergency ? `// Root authority established. <br/> await mainframe.unlock();` : `// Initialize node validation sequence <br/> await protocol.handshake({ auth: "GENESIS" });`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker Bar */}
        <div className="border-y border-zinc-900 bg-zinc-950/50 backdrop-blur-md relative py-4 overflow-hidden">
          <div className="flex items-center gap-24 animate-marquee whitespace-nowrap">
            {Array.from({length: 6}).map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-4">
                  <span className="label-meta text-[9px] text-zinc-700">SYS_TELEMETRY</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">TPS: {Math.floor(Math.random() * 50 + 400)}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">BLOCK: #{telemetry.blocks}</span>
                  <span className="text-[10px] font-mono font-bold text-primary">NODES: {telemetry.nodes}</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-600">PING: {telemetry.latency}MS</span>
                </div>
                <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Feature Sections */}
        <section id="protocol" className="py-40 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4 space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Protocol <br/> Architecture</h2>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">Verifiable proof-of-uptime network designed for institutional compute demand.</p>
              </div>
              <div className="space-y-4">
                {['Elastic Scaling', 'Mesh Topology'].map((item, i) => (
                  <button 
                    key={item}
                    onClick={() => setActiveTab(i)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group ${activeTab === i ? 'bg-primary/5 border-primary/20 text-white' : 'bg-zinc-900/20 border-zinc-900 text-zinc-600 hover:border-zinc-800'}`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{item}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === i ? 'translate-x-1 text-primary' : 'group-hover:translate-x-1'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="surface p-12 rounded-3xl h-full border-zinc-900 bg-zinc-950 flex flex-col justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                      <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Layered Verification</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">Hierarchical validation tiers. Every minute, nodes perform a cryptographically secure heartbeat check.</p>
                  </div>
                  <div className="relative overflow-hidden bg-zinc-900/20 rounded-2xl border border-zinc-900 p-8 flex flex-col justify-center font-mono">
                     <p className="label-meta text-[8px] text-primary">Deployment_Logic</p>
                     <pre className="text-[10px] text-zinc-500 leading-relaxed mt-4">
                        <code>{`define validator_01 {
  type: "ELASTIC",
  region: "GLOBAL",
  multiplier: 1.2x
}`}</code>
                     </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 py-20 px-6">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-16">
             <div className="md:col-span-5 space-y-8">
                <div className="flex items-center gap-4">
                  <Hexagon className="w-8 h-8 text-primary" />
                  <span className="font-black text-2xl tracking-tighter uppercase italic text-white">NexusNode</span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-medium">Decentralized compute staging network for infrastructure engineers.</p>
             </div>
             <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                <div className="space-y-6">
                   <p className="label-meta text-[10px] text-white">Protocol</p>
                   <ul className="space-y-3">
                      {['Consensus', 'Governance'].map(link => (
                        <li key={link}><a href="#" className="text-[11px] font-bold text-zinc-600 hover:text-primary transition-colors uppercase tracking-widest">{link}</a></li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900/50 flex justify-between items-center">
             <p className="label-meta text-[8px] text-zinc-800">© 2025 NEXUSNODE PROTOCOL. REV_BUILD: 2.8.4_STABLE</p>
             <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/30 border border-zinc-900 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="label-meta text-[7px] text-zinc-500 uppercase font-black">All Systems Operational</span>
             </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
          width: fit-content;
        }
      `}</style>
    </div>
  );
};

export default Landing;