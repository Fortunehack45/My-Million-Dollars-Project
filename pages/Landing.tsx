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
  Cpu
} from 'lucide-react';

const Landing = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [telemetry, setTelemetry] = useState({ latency: 12, nodes: 24802, blocks: 104290 });
  
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
        latency: Math.floor(Math.random() * 4 + 11),
        nodes: prev.nodes + (Math.random() > 0.85 ? 1 : 0),
        blocks: prev.blocks + 1
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. High-Precision Cursor Tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // 3. System Override Logic
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

  // 4. Monochrome Matrix Engine (Silver/White Spectrum)
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
      ctx.fillStyle = "rgba(3, 3, 3, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        if (isEmergency) {
          ctx.fillStyle = "#F43F5E"; // Critical Red
        } else {
          // Pure silver/zinc spectrum for a premium look
          ctx.fillStyle = isMatrixActive ? "#ffffff" : "#27272a";
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Rare "Lead" spark for high-end depth
        if (Math.random() > 0.97) {
          ctx.fillStyle = "#fff";
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        }
        
        const resetThreshold = isMatrixActive ? 0.985 : 0.998;
        if (drops[i] * fontSize > canvas.height && Math.random() > resetThreshold) {
          drops[i] = 0;
        }
        drops[i] += isMatrixActive ? 1.4 : 0.5;
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
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white transition-all duration-700 ${isEmergency ? 'grayscale contrast-125' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* --- PREMIUM INFRASTRUCTURE BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Pass 1: Monochrome Digital Rain */}
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 transition-opacity duration-[3000ms] ${isMatrixActive ? 'opacity-30' : 'opacity-[0.08]'}`}
        />

        {/* Pass 2: High-End Header Luminance */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-white/[0.04] via-transparent to-transparent opacity-50 blur-[150px] pointer-events-none z-10"></div>

        {/* Pass 3: Geometric Grid Hierarchy */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
        </div>

        {/* Pass 4: Institutional Floating Metadata */}
        <div className="absolute inset-0 opacity-[0.15]">
           <span className="absolute top-[15%] left-[10%] -rotate-12 font-mono text-[8px] text-zinc-700 tracking-[0.5em] uppercase flex items-center gap-3 animate-float-premium">
             <Activity className="w-2.5 h-2.5" /> SECURE_MESH_INITIALIZED
           </span>
           <span className="absolute top-[45%] right-[22%] rotate-3 font-mono text-[8px] text-zinc-800 border border-zinc-900 p-4 rounded backdrop-blur-[2px] animate-float-premium" style={{ animationDelay: '1.2s' }}>
             ENCRYPT_HANDSHAKE: AUTH_OK
           </span>
           <span className="absolute bottom-[35%] left-[18%] font-mono text-[8px] text-zinc-800 animate-float-premium" style={{ animationDelay: '2s' }}>
             ALLOCATION_VAULT_GENESIS
           </span>
        </div>

        {/* Pass 5: Professional White Optic Scanner (High-Fidelity Ray) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isMatrixActive ? 'opacity-0' : 'opacity-100'}`}>
          {/* Static High-Contrast Mask */}
          <div className="absolute inset-0 bg-zinc-950/96 mix-blend-multiply"></div>
          
          {/* THE OPTIC RAY SYSTEM */}
          <div className="absolute inset-0 pointer-events-none">
             {/* Main Precision Filament (The Sharp White Ray) */}
             <div 
               className="absolute w-[1.5px] h-[1200px] bg-gradient-to-b from-transparent via-white/60 to-transparent blur-[0.5px] transition-transform duration-[450ms] ease-out"
               style={{ 
                 transform: `translate(${mousePos.x}px, ${mousePos.y - 600}px) rotate(32deg)`,
               }}
             />

             {/* Soft Volumetric Beam (Professional Torch Wash) */}
             <div 
               className="absolute w-[180px] h-[900px] bg-gradient-to-b from-transparent via-white/[0.04] to-transparent blur-[60px] transition-transform duration-[600ms] ease-out opacity-80"
               style={{ 
                 transform: `translate(${mousePos.x - 90}px, ${mousePos.y - 450}px) rotate(32deg)` 
               }}
             />

             {/* The Focal Point (The "Pupil" Flare) */}
             <div 
               className="absolute w-[120px] h-[120px] bg-white/[0.12] rounded-full blur-[35px] transition-transform duration-300 ease-out"
               style={{ transform: `translate(${mousePos.x - 60}px, ${mousePos.y - 60}px)` }}
             />

             {/* Sharp High-Intensity Glint */}
             <div 
               className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_20px_2px_white] transition-transform duration-100 ease-out"
               style={{ transform: `translate(${mousePos.x - 0.75}px, ${mousePos.y - 0.75}px)` }}
             />
          </div>
        </div>
      </div>

      {/* Navigation (Billion-Dollar Cleanliness) */}
      <nav className="sticky top-0 z-[100] bg-zinc-950/80 backdrop-blur-3xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 border border-white/10 bg-white/5 flex items-center justify-center rounded-xl transition-all hover:border-white/40 group">
              <Hexagon className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-2xl tracking-tighter uppercase italic text-white leading-none">NexusNode</span>
              <span className="label-meta text-[7px] text-zinc-600 tracking-[0.4em] font-black">SYSTEM_PROTOCOL_v2.8</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-14">
            {['Protocol', 'Validators', 'Intelligence', 'Terminal'].map((item) => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <button onClick={login} className="bg-white text-black text-[11px] font-black uppercase tracking-[0.25em] py-4 px-12 rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-4">
            Authorize <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content Hero */}
      <div className="relative z-10">
        <section className="pt-32 pb-56 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-7 space-y-16">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]"></div>
                  <span className="label-meta text-[10px] text-zinc-400 font-bold tracking-[0.2em]">EPOCH_01_GENESIS_OPEN</span>
                </div>
                <h1 className="text-7xl md:text-[8.5rem] font-black text-white tracking-tighter uppercase italic leading-[0.78]">
                  Orchestrate <br/>
                  <span className="text-primary">Compute</span> <br/>
                  Liquidity.
                </h1>
                <p className="text-zinc-500 text-lg md:text-2xl font-medium max-w-xl leading-relaxed opacity-90">
                  Join the elite infrastructure layer. Deploy validator nodes to the global mesh, verify network state, and claim your allocation of the Genesis supply.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-10 pt-6">
                <button onClick={login} className="bg-primary text-white text-[13px] font-black uppercase tracking-[0.25em] py-7 px-16 rounded-2xl hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_30px_60px_rgba(244,63,94,0.3)]">
                   Connect Node Terminal
                </button>
                <div className="flex flex-col gap-4">
                  <p className="label-meta text-zinc-600 text-[10px] tracking-widest font-black uppercase">Mesh_Saturation</p>
                  <div className="flex gap-1.5">
                    {Array.from({length: 15}).map((_, i) => (
                      <div key={i} className={`w-2.5 h-8 rounded-sm ${i < 12 ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.08)]' : 'bg-zinc-900'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className={`bg-zinc-900/30 backdrop-blur-3xl border p-1.5 rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] transition-all duration-1000 ${isEmergency ? 'border-primary shadow-[0_0_100px_rgba(244,63,94,0.3)]' : 'border-white/10'}`}>
                <div className="bg-zinc-950 rounded-[1.7rem] overflow-hidden border border-white/5">
                  <div className="bg-zinc-900/60 px-8 py-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-800"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-800"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <TerminalIcon className={`w-4 h-4 ${isEmergency ? 'text-primary animate-pulse' : 'text-zinc-600'}`} />
                      <span className="label-meta text-[9px] text-zinc-500 font-bold uppercase tracking-widest">GATEWAY::OS_X08</span>
                    </div>
                  </div>
                  <div className="p-12 space-y-12 font-mono">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-600 tracking-widest uppercase font-black">Integrity_Monitor</span>
                        <span className={`${isEmergency ? 'text-primary' : 'text-white'} font-bold`}>{statusText}</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-[2500ms] ${isEmergency ? 'bg-primary w-full shadow-[0_0_30px_#f43f5e]' : 'bg-white w-[94%] shadow-[0_0_30px_white]'}`}></div>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="flex gap-6">
                        <div className={`w-1.5 rounded-full ${isEmergency ? 'bg-primary animate-pulse' : 'bg-primary/20'}`}></div>
                        <div className="space-y-2">
                          <p className="text-[11px] text-zinc-500 uppercase font-black tracking-[0.2em]">{isEmergency ? 'PROTOCOL_OVERRIDE_ENABLED' : 'Mining Multiplier'}</p>
                          <p className="text-4xl text-white font-bold tracking-tighter italic leading-none">{isEmergency ? 'ELITE_AUTH' : '1.25x'} <span className="text-[11px] text-zinc-800 tracking-widest ml-2 uppercase">S-Priority</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/5">
                      <p className="text-[10px] text-zinc-700 leading-relaxed font-medium italic opacity-50 uppercase tracking-tight">
                        {isEmergency ? `// Authority confirmed. Handshake bypass active... <br/> await genesis.unlock_allocation();` : `// Waiting for terminal peer synchronization... <br/> await protocol.peer_auth({ level: "L1" });`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Infrastructure Grid */}
        <section className="py-32 bg-white/[0.01] border-y border-white/5">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                 { icon: Cpu, title: "Distributed Consensus", desc: "Enterprise-grade high-availability mesh design." },
                 { icon: Globe, title: "Global Topology", desc: "Low-latency peering across 40+ strategic node zones." },
                 { icon: Zap, title: "Compute Liquidity", desc: "Elastic scaling protocol for decentralized workload distribution." }
              ].map((feature, i) => (
                <div key={i} className="space-y-6 group">
                   <div className="w-14 h-14 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-center transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
                      <feature.icon className="w-6 h-6 text-zinc-500 group-hover:text-primary transition-colors" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{feature.title}</h3>
                      <p className="text-zinc-600 text-sm leading-relaxed font-medium">{feature.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Global Stats Ticker */}
        <div className="py-10 overflow-hidden relative border-b border-white/5">
          <div className="flex items-center gap-40 animate-marquee whitespace-nowrap opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {Array.from({length: 6}).map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-10">
                  <span className="label-meta text-[11px] text-zinc-600 font-black tracking-[0.4em]">NETWORK_PULSE</span>
                  <span className="text-[12px] font-mono font-bold text-zinc-400">SYNC_BLOCK: #{telemetry.blocks}</span>
                  <span className="text-[12px] font-mono font-bold text-white">NODES: {telemetry.nodes.toLocaleString()}</span>
                  <span className="text-[12px] font-mono font-bold text-primary">LATENCY: {telemetry.latency}MS</span>
                </div>
                <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer (Billion-Dollar Elegance) */}
        <footer className="pt-48 pb-20 px-6 max-w-7xl mx-auto w-full">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-24">
              <div className="md:col-span-6 space-y-12">
                 <div className="flex items-center gap-6">
                    <Hexagon className="w-12 h-12 text-white" />
                    <span className="font-black text-4xl tracking-tighter uppercase italic text-white leading-none">NexusNode</span>
                 </div>
                 <p className="text-zinc-600 text-lg leading-relaxed max-w-sm font-medium">
                    The institutional layer for verifiable compute infrastructure. Participate in the foundation of the global decentralized mesh.
                 </p>
              </div>
              <div className="md:col-span-6 grid grid-cols-2 gap-16">
                 <div className="space-y-10">
                    <p className="label-meta text-[12px] text-white font-black tracking-widest uppercase">Protocol</p>
                    <ul className="space-y-6">
                       {['Governance', 'Staking v2', 'API Docs', 'Audits'].map(link => (
                         <li key={link}><a href="#" className="text-[11px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.3em]">{link}</a></li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-10">
                    <p className="label-meta text-[12px] text-white font-black tracking-widest uppercase">Ecosystem</p>
                    <ul className="space-y-6">
                       {['Marketplace', 'Node Maps', 'Telemetry', 'Careers'].map(link => (
                         <li key={link}><a href="#" className="text-[11px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-[0.3em]">{link}</a></li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
           <div className="mt-40 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
              <p className="label-meta text-[9px] text-zinc-800 tracking-[0.5em] font-black">© 2025 NEXUSNODE INFRASTRUCTURE. ALL RIGHTS RESERVED. v2.8.4_STABLE</p>
              <div className="flex items-center gap-6 px-8 py-4 bg-zinc-900 border border-white/5 rounded-full shadow-2xl">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="label-meta text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Institutional Kernel Operational</span>
              </div>
           </div>
        </footer>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes float-premium {
          0%, 100% { transform: translateY(0) rotate(-12deg); opacity: 0.8; }
          50% { transform: translateY(-20px) rotate(-10deg); opacity: 1; }
        }
        .animate-float-premium { animation: float-premium 8s ease-in-out infinite; }
        .animate-marquee {
          display: flex;
          animation: marquee 50s linear infinite;
          width: fit-content;
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