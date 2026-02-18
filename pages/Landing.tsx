
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
  ShieldCheck,
  Globe,
  MapPin,
  CheckCircle2,
  Activity,
  HardDrive,
  Lock,
  Wifi,
  BarChart3,
  Plus
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
  const [memoryState, setMemoryState] = useState<number[]>(new Array(48).fill(0));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  // Set initial beam position to the terminal location
  useEffect(() => {
    const updateInitialPos = () => {
       const isDesktop = window.innerWidth >= 1024;
       const x = isDesktop ? window.innerWidth * 0.75 : window.innerWidth * 0.5;
       const y = isDesktop ? window.innerHeight * 0.45 : window.innerHeight * 0.6;
       
       setInitialTerminalPos({ x, y });
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
         if (Math.random() > 0.98) return 3; 
         if (Math.random() > 0.95) return Math.floor(Math.random() * 3); 
         if (val === 3) return 1; 
         return val;
      }));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Terminal Logs Simulation
  useEffect(() => {
    setLogs([
       { id: 1, prefix: "SYS", msg: "KERNEL_BOOT [0x1A2B3C]", status: "OK", level: 'info' },
       { id: 2, prefix: "NET", msg: "TUNNEL_ESTABLISHED", status: "SYNCED", level: 'info' },
       { id: 3, prefix: "SEC", msg: "SHIELD_ENABLED", status: "ACTIVE", level: 'info' },
    ]);
    const verbs = ["ALLOCATING", "HASHING", "SYNCING", "VERIFYING", "ENCRYPTING", "BROADCASTING", "SIGNING", "INDEXING"];
    const nouns = ["BLOCK_H", "MEMPOOL", "PEER_ID", "DAG_STATE", "ZK_PROOF", "SHARD_L", "VAL_SIG"];
    
    const interval = setInterval(() => {
      setLogs(prev => {
        const id = Date.now();
        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const hash = "0x" + Math.random().toString(16).substr(2, 4).toUpperCase();
        const isCrit = Math.random() > 0.92;
        const newLog: { id: number; prefix: string; msg: string; status: string; level: 'info' | 'warn' | 'crit' } = { 
          id, 
          prefix: isCrit ? "ERR!" : "PROC", 
          msg: `${verb}_${noun} [${hash}]`, 
          status: isCrit ? "RETRY" : "OK",
          level: isCrit ? 'crit' : 'info'
        };
        return [...prev.slice(-9), newLog]; 
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

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

  // RED MATRIX RAIN CANVAS
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

      const beamX = beamRef.current.x;
      const beamY = beamRef.current.y + window.scrollY; 
      const radius = 350; 

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        // Calculate interactive alpha based on "flashlight"
        const dx = x - beamX;
        const dy = y - (beamY - window.scrollY); 
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let opacity = 0.2; // Base matrix opacity
        if (dist < radius) {
            let interactAlpha = 1 - (dist / radius);
            opacity = Math.max(opacity, interactAlpha * interactAlpha);
        }

        ctx.fillStyle = `rgba(244, 63, 94, ${opacity})`; 
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
      
      {/* MATRIX BACKGROUND */}
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
      <section id="hero" className="relative z-10 pt-32 pb-48 px-4 md:px-6 max-w-7xl mx-auto w-full min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-24 items-center w-full">
          {/* ... (Hero content same as before) ... */}
          <div className="lg:col-span-7 space-y-12 animate-fade-in-up relative z-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                 <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Genesis_Epoch_Active</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-5xl xl:text-7xl 2xl:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
                {content.hero.title}
              </h1>
              
              <p className="text-zinc-500 text-base md:text-xl font-medium max-w-xl leading-relaxed animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                {content.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
              <button onClick={login} className="w-full sm:w-auto px-10 py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 rounded-xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">{content.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <Link to="/whitepaper" className="w-full sm:w-auto px-10 py-6 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 text-[12px] font-black text-white uppercase tracking-[0.2em] hover:border-zinc-600 transition-all flex items-center justify-center gap-3 rounded-xl group">
                {content.hero.ctaSecondary} <Code2 className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative mt-12 lg:mt-0 animate-fade-in-right opacity-0 hidden lg:block z-10" style={{ animationDelay: '0.5s' }}>
             <div className="relative max-w-lg ml-auto bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),0_0_50px_rgba(244,63,94,0.05)] font-mono text-[10px] ring-1 ring-white/5">
                {/* ... (Terminal UI kept same for brevity, it is working) ... */}
                <div className="bg-zinc-900/90 px-5 py-3 flex items-center justify-between border-b border-white/5 backdrop-blur-xl">
                   <div className="flex gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/40"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/40"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/40"></div>
                   </div>
                   <div className="flex items-center gap-2 text-zinc-400 font-bold tracking-[0.3em] text-[8px] uppercase">
                      <ShieldCheck className="w-3 h-3 text-primary" />
                      ARGUS_OS_X1
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                         <div className="w-1 h-1 bg-emerald-500 animate-pulse rounded-full"></div>
                         <span className="text-[7px] text-emerald-500 font-black">ROOT_ACCESS</span>
                      </div>
                   </div>
                </div>
                <div className="flex h-[480px] relative">
                   <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%] opacity-20"></div>
                   <div className="absolute inset-0 bg-primary/5 pointer-events-none mix-blend-overlay"></div>
                   <div className="flex-1 flex flex-col p-6 min-w-0">
                      <div className="flex-1 flex flex-col justify-end space-y-1.5 min-h-0 overflow-hidden">
                            {logs.map((log) => (
                               <div key={log.id} className="grid grid-cols-[40px_1fr_45px] gap-4 items-baseline text-[9px]">
                                  <span className={`font-black tracking-tighter ${
                                     log.level === 'crit' ? 'text-red-500' : 
                                     log.level === 'warn' ? 'text-amber-500' : 'text-zinc-600'
                                  }`}>
                                     [{log.prefix}]
                                  </span>
                                  <span className="text-zinc-400 truncate tracking-tight">
                                     &gt; {log.msg}
                                  </span>
                                  <span className={`text-right font-black ${
                                     log.status === 'SYNCED' || log.status === 'OK' || log.status === 'ACTIVE' ? 'text-emerald-500' : 'text-primary'
                                  }`}>
                                     {log.status}
                                  </span>
                               </div>
                            ))}
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
           {/* ... (Features Content same as before) ... */}
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
           {/* ... (Architecture Content same as before) ... */}
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
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* ENHANCED ROADMAP SECTION */}
      {content.roadmap?.isVisible && (
        <section id="roadmap" className="py-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10 border-t border-zinc-900/30">
            <div className={`mb-24 text-center transition-all duration-1000 ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
                  <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Protocol Timeline</span>
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">{content.roadmap.title}</h2>
               <p className="text-zinc-500 text-lg max-w-2xl mx-auto">{content.roadmap.description}</p>
            </div>

            <div className="relative">
               {/* Animated Central Timeline */}
               <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-900 md:-translate-x-1/2 rounded-full">
                  <div 
                    className={`absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary to-transparent transition-all duration-[2000ms] ease-out shadow-[0_0_15px_#f43f5e] ${visibleSections.has('roadmap') ? 'h-full opacity-100' : 'h-0 opacity-0'}`}
                  ></div>
               </div>

               <div className="space-y-16 md:space-y-32">
                  {content.roadmap.phases.map((phase, i) => (
                     <div 
                        key={i} 
                        className={`flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center relative ${i % 2 === 0 ? '' : 'md:flex-row-reverse'} group`}
                     >
                        {/* Timeline Node */}
                        <div 
                           className={`absolute left-[20px] md:left-1/2 w-10 h-10 -ml-[20px] bg-zinc-950 border-4 ${phase.status === 'LIVE' ? 'border-primary shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'border-zinc-800'} rounded-full flex items-center justify-center z-10 transition-all duration-700 delay-[${i * 300}ms] ${visibleSections.has('roadmap') ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                        >
                           <div className={`w-2.5 h-2.5 rounded-full ${phase.status === 'LIVE' ? 'bg-primary animate-ping' : 'bg-zinc-700'}`}></div>
                        </div>

                        {/* Content Card */}
                        <div 
                           className={`pl-16 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-24 md:text-right' : 'md:pl-24 md:text-left'} transition-all duration-1000 ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                           style={{ transitionDelay: `${i * 300}ms` }}
                        >
                           <div className={`relative p-8 bg-zinc-900/20 border ${phase.status === 'LIVE' ? 'border-primary/30 bg-primary/5' : 'border-zinc-800'} rounded-3xl backdrop-blur-sm group-hover:border-zinc-700 transition-all duration-500 overflow-hidden`}>
                              {/* Glitch/Scan Effect for Active Phase */}
                              {phase.status === 'LIVE' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                              )}

                              <div className={`flex flex-col ${i % 2 === 0 ? 'md:items-end' : 'md:items-start'} relative z-10`}>
                                 <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded border ${phase.status === 'LIVE' ? 'bg-primary text-white border-primary' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}>
                                       {phase.status}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-zinc-500">{phase.period}</span>
                                 </div>
                                 <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{phase.title}</h3>
                                 <p className="text-sm text-zinc-400 leading-relaxed mb-6">{phase.desc}</p>
                                 
                                 <div className={`space-y-2 w-full ${i % 2 === 0 ? 'md:items-end' : 'md:items-start'} flex flex-col`}>
                                    {phase.features.map((feat, idx) => (
                                       <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg bg-zinc-950/50 border border-zinc-900/50 w-full md:w-auto ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                          <CheckCircle2 className={`w-4 h-4 ${phase.status === 'LIVE' ? 'text-primary' : 'text-zinc-700'}`} />
                                          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">{feat}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
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
           {/* ... (FAQ Content same as before) ... */}
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
