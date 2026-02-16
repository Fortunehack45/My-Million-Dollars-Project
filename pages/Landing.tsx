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
    // Optimization: Direct DOM manipulation for light ray can be smoother, 
    // but React state is fine for this frame rate.
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

  // 4. Monochrome Matrix Engine (Silver/White Spectrum) - Ultra Subtle
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
      // High fade factor for cleaner look
      ctx.fillStyle = "rgba(3, 3, 3, 0.2)"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        if (isEmergency) {
          ctx.fillStyle = "#F43F5E"; 
        } else {
          // Extremely subtle gray for "texture" feel rather than "matrix effect"
          ctx.fillStyle = isMatrixActive ? "#ffffff" : "rgba(255, 255, 255, 0.03)";
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Occasional brighter glint
        if (Math.random() > 0.995) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
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
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-white selection:text-black transition-all duration-700 ${isEmergency ? 'grayscale contrast-125' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* --- PREMIUM INFRASTRUCTURE BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Pass 1: Subliminal Texture Rain */}
        <canvas 
          ref={canvasRef} 
          className={`absolute inset-0 transition-opacity duration-[3000ms] ${isMatrixActive ? 'opacity-30' : 'opacity-100'}`}
        />

        {/* Pass 2: Geometric Grid Hierarchy - Extremely Subtle */}
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '120px 120px' }}>
        </div>

        {/* Pass 3: Institutional Floating Metadata (Static, architectural) */}
        <div className="absolute inset-0 opacity-[0.15]">
           <span className="absolute top-[12%] left-[5%] font-mono text-[9px] text-zinc-500 tracking-[0.2em] uppercase flex items-center gap-3">
             <Activity className="w-2.5 h-2.5" /> MESH_ID_084
           </span>
           <span className="absolute bottom-[15%] right-[5%] font-mono text-[9px] text-zinc-600 tracking-[0.2em] uppercase">
             LATENCY_OPTIMIZED
           </span>
        </div>

        {/* Pass 4: The Billion-Dollar Light Beam */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isMatrixActive ? 'opacity-0' : 'opacity-100'}`}>
          {/* 
             Heavy darkening mask. 
             This ensures the screen is mostly pitch black, and the light reveals the texture.
          */}
          <div className="absolute inset-0 bg-zinc-950/95 mix-blend-multiply"></div>
          
          {/* THE BEAM */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {/* 
                Single, elegant, volumetric wash. 
                No hard lines. No dots. Just pure lux.
             */}
             <div 
               className="absolute w-[500px] h-[1400px] bg-gradient-to-b from-white/[0.08] via-white/[0.01] to-transparent blur-[80px] transition-transform duration-75 ease-linear will-change-transform"
               style={{ 
                 transform: `translate(${mousePos.x - 250}px, ${mousePos.y - 400}px) rotate(25deg)`,
               }}
             />
          </div>
        </div>
      </div>

      {/* Navigation - Solid & Slick */}
      <nav className="sticky top-0 z-[100] bg-zinc-950/80 backdrop-blur-md border-b border-white/[0.02]">
        <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-lg shadow-lg shadow-white/5">
              <Hexagon className="w-5 h-5 text-black fill-black" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-bold text-xl tracking-tight text-white leading-none">NexusNode</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-12">
            {['Protocol', 'Network', 'Governance'].map((item) => (
              <a key={item} href="#" className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>
          <button onClick={login} className="group flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-white/20 transition-all">
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Console Access</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
          </button>
        </div>
      </nav>

      {/* Main Content Hero */}
      <div className="relative z-10">
        <section className="pt-32 pb-48 px-6 max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            
            {/* Left Column: Typographic Powerhouse */}
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-full backdrop-blur-xl">
                  <span className="label-meta text-[9px] text-zinc-400 font-bold tracking-[0.2em] uppercase">Epoch_01 Live</span>
                  <div className="w-1 h-1 rounded-full bg-white/50"></div>
                  <span className="label-meta text-[9px] text-zinc-400 font-bold tracking-[0.2em] uppercase">Genesis Staging</span>
                </div>
                
                <h1 className="text-7xl md:text-[7rem] lg:text-[8rem] font-medium text-white tracking-[-0.04em] leading-[0.9]">
                  Compute <br/>
                  Liquidity.
                </h1>
                
                <p className="text-zinc-400 text-lg md:text-xl font-normal max-w-lg leading-relaxed tracking-wide">
                  The institutional layer for verifiable decentralized infrastructure. Deploy nodes, validate the mesh, and secure the network state.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
                <button onClick={login} className="h-14 px-10 bg-white text-black text-[13px] font-bold uppercase tracking-[0.1em] rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center gap-3">
                   Start Validator Node <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4 text-zinc-500 hover:text-white transition-colors cursor-pointer group">
                  <Code2 className="w-5 h-5" />
                  <span className="text-[12px] font-medium tracking-wider border-b border-transparent group-hover:border-white transition-all pb-0.5">Read Protocol Documentation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Slick Terminal Component */}
            <div className="lg:col-span-5 relative perspective-[2000px]">
              <div 
                className="relative bg-[#050505] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 hover:border-white/20 group"
                style={{ transform: `rotateY(${(mousePos.x - window.innerWidth/2) / 80}deg) rotateX(${-(mousePos.y - window.innerHeight/2) / 80}deg)` }}
              >
                {/* Glossy sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                {/* Terminal Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700"></div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-widest">Active_Session</span>
                </div>

                {/* Terminal Content */}
                <div className="p-10 font-mono text-xs space-y-8 min-h-[300px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-zinc-500 font-bold tracking-widest uppercase">Node_Status</span>
                      <span className="text-emerald-500 font-bold tracking-widest uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Operational
                      </span>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-zinc-400">
                        <span>Uptime_Check</span>
                        <span className="text-white">99.99%</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Block_Height</span>
                        <span className="text-white">{telemetry.blocks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Peer_Latency</span>
                        <span className="text-white">{telemetry.latency}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/5">
                    <p className="text-[10px] text-zinc-500 mb-2">OUTPUT_LOG</p>
                    <div className="space-y-1 text-zinc-300">
                      <p>> Connecting to global mesh...</p>
                      <p>> <span className="text-emerald-500">SUCCESS</span> Handshake verify</p>
                      <p>> Allocating bandwidth: <span className="text-white">10GB/s</span></p>
                      <p className="animate-pulse">> _</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid - Minimalist */}
        <section className="py-32 border-t border-white/[0.05] bg-black">
           <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                 { title: "Verifiable", desc: "Cryptographically proven uptime metrics for every node." },
                 { title: "Scalable", desc: "Elastic compute topology that expands with demand." },
                 { title: "Decentralized", desc: "No single point of failure. Owned by the operators." }
              ].map((feature, i) => (
                <div key={i} className="space-y-6 group cursor-default">
                   <div className="w-8 h-0.5 bg-zinc-800 group-hover:bg-white transition-colors duration-500"></div>
                   <div className="space-y-3">
                      <h3 className="text-2xl font-medium text-white tracking-tight">{feature.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">{feature.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Footer - Architectural */}
        <footer className="py-24 px-6 border-t border-white/[0.05] bg-zinc-950">
           <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
              <div className="space-y-2">
                 <span className="text-lg font-bold text-white tracking-tight">NexusNode</span>
                 <p className="text-zinc-600 text-xs max-w-xs">Institutional infrastructure layer.</p>
              </div>
              
              <div className="flex gap-12">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Platform</span>
                  <a href="#" className="text-xs text-zinc-600 hover:text-white transition-colors">Terminal</a>
                  <a href="#" className="text-xs text-zinc-600 hover:text-white transition-colors">Network</a>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Company</span>
                  <a href="#" className="text-xs text-zinc-600 hover:text-white transition-colors">Careers</a>
                  <a href="#" className="text-xs text-zinc-600 hover:text-white transition-colors">Legal</a>
                </div>
              </div>
           </div>
           <div className="max-w-[1400px] mx-auto mt-24 pt-8 border-t border-white/[0.05] flex justify-between items-center">
             <span className="text-[10px] text-zinc-700 uppercase tracking-widest">© 2025 Nexus Labs</span>
             <span className="text-[10px] text-zinc-700 uppercase tracking-widest">System Operational</span>
           </div>
        </footer>
      </div>

      <style>{`
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default Landing;