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
  const requestRef = useRef<number>(null);
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
    setStatusText("KERNEL_OVERRIDE_INIT");
    setTimeout(() => {
      setIsEmergency(false);
      setIsMatrixActive(true);
      setStatusText("ROOT_ACCESS_GRANTED");
    }, 1800);
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

  // 4. Advanced Fluid Matrix Logic
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
    const technical = "01ABCDEF-NEXUS-NODE-0101-ROOT-INFRA-";
    const alphabet = katakana + technical;
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * canvas.height / fontSize);

    const draw = () => {
      ctx.fillStyle = "rgba(3, 3, 3, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        const isNearHeader = drops[i] * fontSize < 250;
        
        if (isEmergency) {
          ctx.fillStyle = "#F43F5E";
        } else if (isMatrixActive) {
          ctx.fillStyle = isNearHeader ? "#34d399" : "#10b981";
        } else {
          ctx.fillStyle = isNearHeader ? "#065f46" : "#064e3b";
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (Math.random() > 0.95) {
          ctx.fillStyle = "#fff";
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        }
        
        const resetThreshold = isMatrixActive ? 0.98 : 0.995;
        if (drops[i] * fontSize > canvas.height && Math.random() > resetThreshold) {
          drops[i] = 0;
        }
        drops[i] += isMatrixActive ? 1.2 : 0.6;
      }
      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isMatrixActive, isEmergency]);

  return (
    <div 
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white transition-all duration-700 ${isEmergency ? 'grayscale contrast-150 animate-pulse' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* --- INFRASTRUCTURE BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Pass 1: Global Digital Rain Matrix */}
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 transition-opacity duration-[3000ms] ${isMatrixActive ? 'opacity-40' : 'opacity-[0.12]'}`}
        />

        {/* Pass 2: Header Aura Mask (Intensifies Matrix around Header) */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent opacity-30 blur-3xl pointer-events-none z-10"></div>

        {/* Pass 3: Floating Encrypted Metadata */}
        <div className="absolute inset-0 opacity-[0.18]">
           <span className="absolute top-[18%] left-[10%] -rotate-12 font-mono text-[9px] text-zinc-600 tracking-widest uppercase flex items-center gap-2 animate-float">
             <Activity className="w-2 h-2" /> INFRA_PROTOCOL_SYN_08
           </span>
           <span className="absolute top-[38%] right-[25%] rotate-3 font-mono text-[9px] text-zinc-600 border border-zinc-900/40 p-2 rounded backdrop-blur-[2px] animate-float" style={{ animationDelay: '1s' }}>
             OVERRIDE_SEQUENCE: ↑ ↑ ↓ ↓ ← →
           </span>
           <span className="absolute bottom-[35%] left-[22%] rotate-1 font-mono text-[9px] text-zinc-600 animate-float" style={{ animationDelay: '2.5s' }}>
             ROOT_GENESIS_GATEWAY_V2
           </span>
        </div>

        {/* Pass 4: Structural Grid */}
        <div className="absolute inset-0 opacity-[0.04]" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
        </div>

        {/* Pass 5: Fluid Amoeba-Ray Diagnostic Scanner (Torch Light Effect) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isMatrixActive ? 'opacity-0' : 'opacity-100'}`}>
          {/* Black high-contrast mask */}
          <div className="absolute inset-0 bg-zinc-950/92 mix-blend-multiply"></div>
          
          {/* Gooey Ray Container */}
          <div className="absolute inset-0 filter-goo">
             {/* Main Core Beam - Uneven Shapeless Light */}
             <div 
               className="absolute w-[350px] h-[500px] bg-emerald-500/10 transition-transform duration-300 ease-out animate-wobble-ray"
               style={{ 
                 transform: `translate(${mousePos.x - 175}px, ${mousePos.y - 250}px) rotate(15deg)`,
                 clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' 
               }}
             />

             {/* Secondary Amoeba Fluid Light */}
             <div 
               className="absolute w-[450px] h-[450px] bg-emerald-500/20 rounded-full blur-[60px] transition-transform duration-500 ease-out animate-wobble"
               style={{ transform: `translate(${mousePos.x - 225}px, ${mousePos.y - 225}px)` }}
             />

             {/* Dynamic Light Filament (The "Ray") */}
             <div 
               className="absolute w-[120px] h-[700px] bg-emerald-500/30 blur-[40px] transition-transform duration-[400ms] ease-out animate-ray-flicker"
               style={{ 
                 transform: `translate(${mousePos.x - 60}px, ${mousePos.y - 350}px) rotate(-20deg) skewX(10deg)` 
               }}
             />

             {/* Additional Gooey Droplets for "Shapeless" feel */}
             <div 
               className="absolute w-[150px] h-[150px] bg-emerald-500/40 rounded-full blur-[30px] transition-transform duration-[700ms] ease-out animate-wobble-alt"
               style={{ transform: `translate(${mousePos.x + 80}px, ${mousePos.y - 50}px)` }}
             />
          </div>
          
          {/* Ambient Glow Aura */}
          <div 
            className="absolute w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[150px] transition-transform duration-[600ms] ease-out pointer-events-none"
            style={{ transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)` }}
          />
        </div>
      </div>

      {/* SVG Filters for Gooey Fluid Dynamics */}
      <svg className="absolute w-0 h-0 invisible">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 border border-primary/50 bg-primary/10 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <Hexagon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-lg tracking-tighter uppercase italic text-white">NexusNode</span>
              <span className="label-meta text-[7px] text-zinc-600">INFRA_PROTOCOL v2.8</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['Protocol', 'Validators', 'Network', 'Docs'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </div>
          <button onClick={login} className="btn-primary !py-3 !px-8 flex items-center gap-3 relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2">Initialize Terminal <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </nav>

      {/* Elevated Content Container */}
      <div className="relative z-10">
        <section className="pt-24 pb-40 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="label-meta text-[8px] text-zinc-400">EPOCH_01_PROVISIONING :: ACTIVE_CONTRIBUTION</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
                  Validate the <br/>
                  <span className="text-primary">Global Compute</span> <br/>
                  Mesh.
                </h1>
                <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                  Deploy infrastructure nodes on an elastic compute layer designed for high-availability decentralized applications. Mine credits and secure the Genesis supply.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <button onClick={login} className="btn-primary !px-12 !py-6 w-full sm:w-auto text-sm group relative overflow-hidden rounded-xl">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Deploy Genesis Node <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <div className="flex flex-col">
                  <p className="label-meta text-zinc-600 mb-2">Network Peer Density</p>
                  <div className="flex gap-1">
                    {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className={`w-1.5 h-6 rounded-sm ${i < 10 ? 'bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-zinc-800'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className={`surface p-1 rounded-2xl shadow-2xl relative z-10 transition-all duration-500 ${isEmergency ? 'border-primary shadow-[0_0_60px_rgba(244,63,94,0.4)]' : 'border-zinc-800'}`}>
                <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-900">
                  <div className="bg-zinc-900/50 px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TerminalIcon className={`w-3 h-3 ${isEmergency ? 'text-primary animate-pulse' : 'text-zinc-600'}`} />
                      <span className="label-meta text-[7px] text-zinc-400">CONSOLE_INSTANCE::084</span>
                    </div>
                  </div>
                  <div className="p-8 space-y-8 font-mono">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-zinc-600 tracking-widest uppercase font-black">Kernel_Status</span>
                        <span className={`${isEmergency ? 'text-primary' : 'text-emerald-500'} font-bold`}>{statusText}</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-[2000ms] ${isEmergency ? 'bg-primary w-full shadow-[0_0_15px_#f43f5e]' : 'bg-emerald-500 w-[94%] shadow-[0_0_15px_#10b981]'}`}></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className={`w-1 rounded-full ${isEmergency ? 'bg-primary animate-pulse' : 'bg-primary/40'}`}></div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-zinc-500 uppercase font-black">{isEmergency ? 'PROTOCOL_OVERRIDE' : 'Current Yield Rate'}</p>
                          <p className="text-2xl text-white font-bold tracking-tighter italic">{isEmergency ? 'AUTH_KERNEL' : '24.08'} <span className="text-[10px] text-zinc-700">NEX / HR</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-zinc-900">
                      <p className="text-[8px] text-zinc-700 leading-relaxed italic font-medium">
                        {isEmergency ? `// Authority confirmed. Bypassing Genesis restrictions... <br/> await kernel.inject_root();` : `// Initialize handshake sequence... <br/> await protocol.peer_auth({ level: "S-RANK" });`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Ticker */}
        <div className="border-y border-zinc-900/50 bg-zinc-950/40 backdrop-blur-md relative py-4 overflow-hidden">
          <div className="flex items-center gap-24 animate-marquee whitespace-nowrap">
            {Array.from({length: 6}).map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-6">
                  <span className="label-meta text-[9px] text-zinc-800">INFRA_METRICS</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 italic">TPS: {Math.floor(Math.random() * 50 + 420)}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500/80 uppercase">Epoch: #{telemetry.blocks}</span>
                  <span className="text-[10px] font-mono font-bold text-primary/80">Active_Nodes: {telemetry.nodes}</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-700">Ping: {telemetry.latency}MS</span>
                </div>
                <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Technical Showcase */}
        <section id="protocol" className="py-40 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4 space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Protocol <br/> Architecture</h2>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">Verifiable proof-of-uptime mesh designed for high-availability enterprise compute demand.</p>
              </div>
              <div className="space-y-4">
                {['Elastic Compute Scaling', 'Global Peer Topology'].map((item, i) => (
                  <button 
                    key={item}
                    onClick={() => setActiveTab(i)}
                    className={`w-full text-left p-8 rounded-2xl border transition-all flex items-center justify-between group ${activeTab === i ? 'bg-primary/5 border-primary/30 text-white' : 'bg-zinc-900/10 border-zinc-900 text-zinc-600 hover:border-zinc-800'}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === i ? 'translate-x-1 text-primary' : 'group-hover:translate-x-1'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="surface p-12 rounded-3xl h-full border-zinc-900 bg-zinc-950 flex flex-col justify-center shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center border border-zinc-800">
                      <Layers className="w-7 h-7 text-primary" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Distributed Consensus</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">Hierarchical validation tiers ensure zero-latency data contribution tracking across the entire global mesh network.</p>
                    </div>
                  </div>
                  <div className="relative overflow-hidden bg-zinc-900/30 rounded-2xl border border-zinc-900 p-8 flex flex-col justify-center font-mono group hover:border-primary/20 transition-all">
                     <p className="label-meta text-[8px] text-primary mb-6 flex items-center gap-2">
                       <Code2 className="w-3 h-3" /> Kernel_Handshake_Logic
                     </p>
                     <pre className="text-[10px] text-zinc-600 leading-relaxed font-medium">
                        <code>{`define validator_node_0x1 {
  topology: "MESH_GLOBAL",
  priority: "GENESIS_A",
  contribution: "ACTIVE",
  multiplier: 1.25x
}`}</code>
                     </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-900/50 bg-zinc-950 py-24 px-6 relative">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-20">
             <div className="md:col-span-5 space-y-10">
                <div className="flex items-center gap-4">
                  <Hexagon className="w-10 h-10 text-primary" />
                  <span className="font-black text-3xl tracking-tighter uppercase italic text-white">NexusNode</span>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed max-w-xs font-medium">
                  The primary staging layer for decentralized infrastructure validation and compute distribution.
                </p>
             </div>
             <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                <div className="space-y-8">
                   <p className="label-meta text-[11px] text-white">Handshake</p>
                   <ul className="space-y-4">
                      {['Consensus Map', 'Validator Docs', 'API Terminal'].map(link => (
                        <li key={link}><a href="#" className="text-[11px] font-bold text-zinc-700 hover:text-primary transition-colors uppercase tracking-widest">{link}</a></li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
          <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-8">
             <p className="label-meta text-[8px] text-zinc-800 tracking-[0.3em]">© 2025 NEXUSNODE INFRASTRUCTURE. BUILD_VERSION: 2.8.4_STABLE</p>
             <div className="flex items-center gap-5 px-6 py-3 bg-zinc-900/40 border border-zinc-800 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                <span className="label-meta text-[8px] text-zinc-600 uppercase font-black tracking-widest">Protocol Kernel Operational</span>
             </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-15px) rotate(-10deg); }
        }
        @keyframes wobble {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: scale(1); }
          33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: scale(1.1) rotate(5deg); }
          66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: scale(0.9) rotate(-5deg); }
        }
        @keyframes wobble-ray {
          0%, 100% { transform: scaleY(1) skewX(0deg); opacity: 0.8; }
          50% { transform: scaleY(1.2) skewX(5deg); opacity: 1; }
        }
        @keyframes ray-flicker {
          0%, 100% { opacity: 0.2; filter: blur(40px); }
          50% { opacity: 0.5; filter: blur(60px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-wobble { animation: wobble 8s ease-in-out infinite; }
        .animate-wobble-alt { animation: wobble 12s ease-in-out infinite reverse; }
        .animate-wobble-ray { animation: wobble-ray 4s ease-in-out infinite; }
        .animate-ray-flicker { animation: ray-flicker 2s ease-in-out infinite; }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
          width: fit-content;
        }
        .filter-goo {
          filter: url('#goo');
        }
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default Landing;