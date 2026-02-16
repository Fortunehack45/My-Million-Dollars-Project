
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToLandingConfig } from '../services/firebase';
import { LandingConfig } from '../types';
import PublicLayout from '../components/PublicLayout';
import { 
  ArrowRight, 
  Terminal as TerminalIcon,
  Code2,
  Layers,
  Cpu,
  Database,
  Loader2,
  Zap,
  Maximize2,
  Minus,
  X,
  Plus,
  ShieldCheck,
  Globe,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router';

// Icon mapping for dynamic content
const IconMap: Record<string, any> = {
  'ShieldCheck': ShieldCheck,
  'Cpu': Cpu,
  'Globe': Globe,
  'Zap': Zap,
  'Database': Database,
  'Layers': Layers,
  'MapPin': MapPin,
  'CheckCircle2': CheckCircle2
};

const Landing = () => {
  const { login } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [content, setContent] = useState<LandingConfig | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = subscribeToLandingConfig((newConfig) => {
      setContent(newConfig);
    });
    return () => unsubscribe();
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
      if (section.id) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [content]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [initialTerminalPos, setInitialTerminalPos] = useState({ x: 0, y: 0 });
  const [beamPos, setBeamPos] = useState({ x: 0, y: 0 });
  const beamRef = useRef({ x: 0, y: 0 });
  
  const [logs, setLogs] = useState<Array<{id: number, prefix: string, msg: string, status: string, level: 'info' | 'warn' | 'crit'}>>([]);
  const [memoryState, setMemoryState] = useState<number[]>(new Array(64).fill(0));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  // Set initial beam position to the terminal location
  useEffect(() => {
    const updateInitialPos = () => {
       const isDesktop = window.innerWidth >= 1024;
       // Approximate location of the CPU Stats (red arrow target)
       const x = isDesktop ? window.innerWidth * 0.72 : window.innerWidth * 0.5;
       const y = isDesktop ? window.innerHeight * 0.42 : window.innerHeight * 0.6;
       
       setInitialTerminalPos({ x, y });
       // Only set beam pos if user hasn't interacted yet to avoid jumping
       if (!hasInteracted) {
         setBeamPos({ x, y });
         beamRef.current = { x, y };
       }
    };
    
    updateInitialPos();
    window.addEventListener('resize', updateInitialPos);
    return () => window.removeEventListener('resize', updateInitialPos);
  }, [hasInteracted]);

  // Terminal Memory Map Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryState(prev => prev.map((val) => {
         // Randomly change state: 0 (idle), 1 (active-green), 2 (locked-red), 3 (flash-white)
         if (Math.random() > 0.98) return 3; // flash
         if (Math.random() > 0.95) return Math.floor(Math.random() * 3); // change state
         if (val === 3) return 1; // decay flash to active
         return val;
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Terminal Logs Simulation
  useEffect(() => {
    setLogs([
       { id: 1, prefix: "SYS", msg: "KERNEL_INIT_SUCCESS [0x1A2B3C]", status: "OK", level: 'info' },
       { id: 2, prefix: "NET", msg: "ESTABLISHING_TLS_TUNNEL [0x4D5E6F]", status: "PENDING", level: 'warn' },
       { id: 3, prefix: "SEC", msg: "SHIELD_PROTOCOL_ACTIVE [0x7G8H9I]", status: "SECURE", level: 'info' },
    ]);
    const verbs = ["ALLOCATING", "HASHING", "SYNCING", "VERIFYING", "CONNECTING", "BROADCASTING", "COMPRESSING", "INDEXING"];
    const nouns = ["BLOCK_HEADER", "MEMPOOL_BUFFER", "PEER_NODE", "DAG_TOPOLOGY", "SHARDED_STATE", "ZK_PROOF", "EXECUTION_LAYER"];
    
    const interval = setInterval(() => {
      setLogs(prev => {
        const id = Date.now();
        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const hash = "0x" + Math.random().toString(16).substr(2, 6).toUpperCase();
        const isCrit = Math.random() > 0.85;
        const newLog: { id: number; prefix: string; msg: string; status: string; level: 'info' | 'warn' | 'crit' } = { 
          id, 
          prefix: isCrit ? "CRIT" : "PROC", 
          msg: `${verb}_${noun} [${hash}]`, 
          status: isCrit ? "RETRIEVING" : "SUCCESS",
          level: isCrit ? 'crit' : 'info'
        };
        const newLogs = [...prev, newLog];
        return newLogs.slice(-8); // Reduced log count to make space for top dashboard
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Handle Mouse Move for Flashlight Effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

  // Smooth Beam Interpolation
  useEffect(() => {
    let animationFrameId: number;
    const animateBeam = () => {
      setBeamPos(prev => {
        const target = hasInteracted ? mousePos : initialTerminalPos;
        const ease = 0.08; 
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return prev;
        const next = { x: prev.x + dx * ease, y: prev.y + dy * ease };
        beamRef.current = next;
        return next;
      });
      animationFrameId = requestAnimationFrame(animateBeam);
    };
    animateBeam();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos, initialTerminalPos, hasInteracted]);

  // MATRIX RAIN CANVAS
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

    const chars = "ABCDEF0123456789";
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = [];
    
    // Initialize drops
    for(let i=0; i<columns; i++) {
        drops[i] = Math.random() * (canvas.height / fontSize);
    }

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${fontSize}px 'JetBrains Mono'`;
      
      const beamX = beamRef.current.x;
      const beamY = beamRef.current.y + window.scrollY; 
      const radius = 350; 

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const dx = x - beamX;
        const dy = y - (beamY - window.scrollY); 
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let alpha = 0;
        if (dist < radius) {
            alpha = 1 - (dist / radius);
            alpha = alpha * alpha * alpha; 
        }

        if (alpha > 0.01) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillText(char, x, y);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.85; 
      }
      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  if (!content) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <PublicLayout>
    <div 
      className="bg-black text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white"
      onMouseMove={handleMouseMove}
    >
      
      {/* GLOBAL MATRIX BACKGROUND SYSTEM */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div 
             className="absolute w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full will-change-transform"
             style={{ transform: `translate3d(${beamPos.x - 300}px, ${beamPos.y - 300}px, 0)` }}
           />
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 pt-32 pb-32 px-4 md:px-6 max-w-7xl mx-auto w-full min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          
          <div className="lg:col-span-7 space-y-12 animate-fade-in-up">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                 <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Genesis_Epoch_Active</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
                {content.hero.title}
              </h1>
              
              <p className="text-zinc-500 text-base md:text-xl font-medium max-w-xl leading-relaxed animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                {content.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
              <button onClick={login} className="w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 rounded-xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">{content.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <Link to="/whitepaper" className="w-full sm:w-auto px-8 md:px-12 py-5 md:py-6 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 text-[12px] font-black text-white uppercase tracking-[0.2em] hover:border-zinc-600 transition-all flex items-center justify-center gap-3 rounded-xl group">
                {content.hero.ctaSecondary} <Code2 className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-zinc-900/50 animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
              {[
                { val: '40+', label: 'Regions' },
                { val: '12ms', label: 'Latency' },
                { val: '24k', label: 'Nodes' }
              ].map((stat, i) => (
                <div key={i} className="group cursor-default">
                  <p className="text-2xl md:text-5xl font-mono font-bold text-white tracking-tighter group-hover:text-primary transition-colors">{stat.val}</p>
                  <p className="text-[9px] font-black text-zinc-600 uppercase mt-2 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Terminal UI */}
          <div className="lg:col-span-5 relative mt-12 lg:mt-0 animate-fade-in-right opacity-0 hidden lg:block" style={{ animationDelay: '0.5s' }}>
             <div className="relative bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-lg overflow-hidden shadow-2xl font-mono text-[10px] leading-relaxed">
                <div className="bg-zinc-900/80 px-4 py-2 flex items-center justify-between border-b border-zinc-800">
                   <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors"></div>
                   </div>
                   <div className="flex items-center gap-2 text-zinc-500 font-bold tracking-widest opacity-80">
                      <TerminalIcon className="w-3 h-3" />
                      ARGUS_OS_TERMINAL_v4.2
                   </div>
                   <div className="w-10"></div>
                </div>

                <div className="flex items-center gap-8 px-4 py-2 bg-black/40 border-b border-zinc-900 text-[9px] font-bold tracking-wider">
                   <div className="flex items-center gap-2">
                      <span className="text-zinc-600">CPU:</span>
                      <span className="text-red-500 animate-pulse">12%</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-zinc-600">MEM:</span>
                      <span className="text-emerald-500">2.4GB</span>
                   </div>
                   <div className="ml-auto flex items-center gap-2 text-zinc-600">
                      <span>ROOT_ACCESS: GRANTED</span>
                   </div>
                </div>
                
                <div className="p-5 h-[450px] flex flex-col justify-between relative overflow-hidden bg-black/20">
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>

                   {/* UPPER SYSTEM DASHBOARD */}
                   <div className="grid grid-cols-2 gap-4 h-32 mb-4 relative z-0">
                      {/* Memory Map Visualizer */}
                      <div className="border border-zinc-800/50 bg-zinc-900/10 rounded p-3 flex flex-col">
                          <div className="flex justify-between items-center text-[8px] text-zinc-500 mb-2 uppercase tracking-wider border-b border-zinc-800/50 pb-1">
                              <span>HEAP_ALLOCATION_TABLE</span>
                              <span className="text-primary animate-pulse">LIVE</span>
                          </div>
                          <div className="flex-1 grid grid-cols-8 gap-1 content-start">
                               {memoryState.map((status, i) => (
                                   <div 
                                      key={i} 
                                      className={`h-1.5 w-full rounded-[1px] transition-colors duration-300 ${
                                          status === 3 ? 'bg-white shadow-[0_0_5px_white]' : 
                                          status === 2 ? 'bg-primary/80' : 
                                          status === 1 ? 'bg-emerald-500/60' : 
                                          'bg-zinc-800/30'
                                      }`} 
                                   />
                               ))}
                          </div>
                      </div>

                      {/* Daemon Process Monitor */}
                      <div className="border border-zinc-800/50 bg-zinc-900/10 rounded p-3 flex flex-col">
                           <div className="flex justify-between items-center text-[8px] text-zinc-500 mb-2 uppercase tracking-wider border-b border-zinc-800/50 pb-1">
                              <span>ACTIVE_DAEMONS</span>
                              <span>PID</span>
                          </div>
                          <div className="space-y-1.5 overflow-hidden text-[9px] font-mono">
                              <div className="flex justify-between items-center">
                                  <span className="text-zinc-300">argus_core</span>
                                  <span className="text-emerald-500">8022</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-zinc-300">net_listener</span>
                                  <span className="text-emerald-500">8023</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-zinc-300">mempool_sync</span>
                                  <span className="text-amber-500 animate-pulse">8041</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-zinc-400">zk_prover</span>
                                  <span className="text-zinc-600">SLEEP</span>
                              </div>
                          </div>
                      </div>
                   </div>

                   {/* LOWER LOGS */}
                   <div className="flex-1 flex flex-col justify-end space-y-1 relative z-0 min-h-0">
                     {logs.map((log) => (
                        <div key={log.id} className="grid grid-cols-[45px_1fr_60px] gap-3 items-baseline animate-slide-in-bottom">
                           <span className={`font-bold ${
                              log.level === 'crit' ? 'text-red-500' : 
                              log.level === 'warn' ? 'text-amber-500' : 'text-zinc-600'
                           }`}>
                              [{log.prefix}]
                           </span>
                           <span className="text-zinc-400 truncate">
                              &gt; {log.msg}
                           </span>
                           <span className={`text-right font-bold ${
                              log.status === 'SUCCESS' || log.status === 'OK' || log.status === 'SECURE' ? 'text-emerald-500' : 
                              log.level === 'crit' ? 'text-red-500' : 'text-amber-500'
                           }`}>
                              {log.status}
                           </span>
                        </div>
                     ))}
                   </div>
                   
                   <div className="grid grid-cols-[45px_1fr] gap-3 items-center mt-3 pt-3 border-t border-zinc-800/50 z-0">
                      <span className="text-primary font-bold">[CMD]</span>
                      <div className="flex items-center text-zinc-200">
                         sh run initialization_sequence<div className="h-4 w-2 bg-primary ml-1 animate-pulse"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className={`relative z-10 py-24 border-t border-zinc-900/50 bg-black/40 backdrop-blur-md transition-all duration-1000 ease-out ${visibleSections.has('partners') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-zinc-600 mb-12 uppercase tracking-[0.3em]">{content.partners.title}</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {content.partners.items.map((name, i) => (
                  <h3 key={i} style={{ transitionDelay: `${i * 100}ms` }} className={`text-sm md:text-lg font-black text-white uppercase tracking-tighter transition-all duration-700 ${visibleSections.has('partners') ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-sm translate-y-4'}`}>{name.replace('_', ' ')}</h3>
               ))}
            </div>
         </div>
      </section>

      {/* Features Grid */}
      {content.features?.isVisible && (
        <section id="features" className="py-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10">
           <div className={`text-center mb-20 max-w-3xl mx-auto transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">{content.features.title}</h2>
              <p className="text-zinc-500 text-lg leading-relaxed">{content.features.description}</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.features.items.map((item, i) => {
                 const Icon = IconMap[item.icon] || Globe;
                 return (
                 <div key={i} style={{ transitionDelay: `${i * 150}ms` }} className={`p-8 rounded-3xl bg-zinc-900/20 border border-zinc-900 hover:border-primary/50 transition-all duration-700 group hover:-translate-y-2 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="w-12 h-12 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                       <Icon className="w-6 h-6 text-zinc-500 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{item.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                 </div>
              )})}
           </div>
        </section>
      )}

      {/* Architecture Section */}
      {content.architecture.isVisible && (
        <section id="architecture" className="py-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className={`space-y-12 transition-all duration-1000 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                 <div className="space-y-6">
                    <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                       {content.architecture.title}
                    </h2>
                    <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-lg">
                       {content.architecture.description}
                    </p>
                 </div>
                 
                 <div className="space-y-10">
                    {content.architecture.layers.map((layer, i) => (
                       <div key={i} style={{ transitionDelay: `${300 + (i * 150)}ms` }} className={`flex gap-8 group transition-all duration-700 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                          <div className="w-16 h-16 border border-zinc-800 bg-zinc-900/30 backdrop-blur-md flex items-center justify-center rounded-2xl shrink-0 group-hover:border-primary/50 transition-colors">
                             <Layers className="w-7 h-7 text-zinc-600 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{layer.title}</h4>
                             <p className="text-zinc-500 text-sm leading-relaxed">{layer.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className={`relative animate-float hidden lg:block transition-all duration-1000 delay-300 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                 <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full"></div>
                 <div className="relative border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl rounded-[2.5rem] p-12 space-y-10 shadow-2xl">
                    <div className="h-24 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center">
                       <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Compute_Sharding_Layer</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="h-40 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-zinc-600 transition-colors">
                          <Cpu className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Execution_Engine</span>
                       </div>
                       <div className="h-40 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-zinc-600 transition-colors">
                          <Database className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Persistence_Core</span>
                       </div>
                    </div>
                    <div className="h-20 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-center">
                       <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Consensus_Protocol_vRC1</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Roadmap Section */}
      {content.roadmap?.isVisible && (
        <section id="roadmap" className="py-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10 border-t border-zinc-900/30">
            <div className={`mb-20 text-center transition-all duration-1000 ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
               <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">{content.roadmap.title}</h2>
               <p className="text-zinc-500">{content.roadmap.description}</p>
            </div>

            <div className="relative">
               {/* Vertical Line */}
               <div className={`absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 md:-translate-x-1/2 ml-4 md:ml-0 transition-all duration-1000 delay-300 ${visibleSections.has('roadmap') ? 'opacity-100 h-full' : 'opacity-0 h-0'}`}></div>

               <div className="space-y-12 md:space-y-24">
                  {content.roadmap.phases.map((phase, i) => (
                     <div key={i} style={{ transitionDelay: `${i * 200}ms` }} className={`flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center relative ${i % 2 === 0 ? '' : 'md:flex-row-reverse'} transition-all duration-1000 ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        {/* Dot */}
                        <div className={`absolute left-0 md:left-1/2 w-9 h-9 bg-zinc-950 border-4 ${phase.status === 'LIVE' ? 'border-primary' : 'border-zinc-800'} rounded-full ml-[0.5px] md:-translate-x-1/2 flex items-center justify-center z-10`}>
                           {phase.status === 'LIVE' && <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></div>}
                        </div>

                        {/* Content */}
                        <div className={`pl-16 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                           <div className="space-y-4">
                              <div className={`flex flex-col ${i % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                                 <span className={`text-[10px] font-black px-2 py-1 rounded mb-2 ${phase.status === 'LIVE' ? 'bg-primary text-white' : 'bg-zinc-900 text-zinc-500'}`}>
                                    {phase.status}
                                 </span>
                                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">{phase.title}</h3>
                                 <span className="text-xs font-mono font-bold text-zinc-500">{phase.period}</span>
                              </div>
                              <p className="text-sm text-zinc-400 leading-relaxed">{phase.desc}</p>
                              <ul className={`space-y-1 ${i % 2 === 0 ? 'md:items-end' : 'md:items-start'} flex flex-col`}>
                                 {phase.features.map((feat, idx) => (
                                    <li key={idx} className="text-xs text-zinc-500 flex items-center gap-2">
                                       {i % 2 !== 0 && <CheckCircle2 className="w-3 h-3 text-zinc-700" />}
                                       {feat}
                                       {i % 2 === 0 && <CheckCircle2 className="w-3 h-3 text-zinc-700" />}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
        </section>
      )}

      {/* FAQ Section */}
      {content.faq.isVisible && (
        <section id="faq" className="py-24 md:py-32 px-4 md:px-6 max-w-4xl mx-auto relative z-10 border-t border-zinc-900/50">
           <h2 className={`text-3xl font-black text-white uppercase tracking-tighter mb-16 text-center transition-all duration-1000 ${visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{content.faq.title}</h2>
           <div className="space-y-4">
              {content.faq.items.map((item, i) => (
                 <div key={i} style={{ transitionDelay: `${i * 100}ms` }} className={`border border-zinc-900 bg-black/40 backdrop-blur-md rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-700 ${visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <button 
                       onClick={() => toggleFaq(i)}
                       className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-900/20 transition-colors"
                    >
                       <span className="font-bold text-white text-sm uppercase tracking-wide pr-4">{item.q}</span>
                       <Plus className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''} shrink-0`} />
                    </button>
                    <div 
                       className={`grid transition-all duration-500 ease-in-out ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                       <div className="overflow-hidden">
                           <div className="p-6 pt-0 text-zinc-500 text-sm leading-relaxed border-t border-zinc-900/50 mt-2">
                              {item.a}
                           </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </section>
      )}

      {/* CTA Section */}
      {content.cta.isVisible && (
        <section id="cta" className={`py-48 border-t border-zinc-900 relative z-10 overflow-hidden bg-black/40 backdrop-blur-xl transition-all duration-1000 ease-out ${visibleSections.has('cta') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
           <div className="max-w-5xl mx-auto px-4 md:px-6 text-center space-y-16">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full">
                   <Zap className="w-4 h-4 text-primary animate-pulse" />
                   <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest font-mono">Status: Awaiting_Handshake</span>
                </div>

                <h2 className="text-4xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                   {content.cta.title}
                </h2>
                
                <p className="text-zinc-500 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
                   {content.cta.description}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-8 pt-6">
                 <button onClick={login} className="h-20 md:h-24 px-12 md:px-20 bg-primary text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_20px_80px_rgba(244,63,94,0.4)] hover:shadow-[0_0_100px_rgba(244,63,94,0.7)] hover:-translate-y-2 flex items-center gap-4 group">
                    {content.cta.buttonText} 
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" />
                 </button>
              </div>
           </div>
        </section>
      )}
    </div>
    </PublicLayout>
  );
};

export default Landing;
