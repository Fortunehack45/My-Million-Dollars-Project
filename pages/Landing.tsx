
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToLandingConfig } from '../services/firebase';
import { LandingConfig } from '../types';
import PublicLayout from '../components/PublicLayout';
import { 
  ArrowRight, 
  Activity, 
  Terminal as TerminalIcon,
  Code2,
  Layers,
  Globe,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Database,
  Loader2,
  Zap
} from 'lucide-react';
import { Link } from 'react-router';

const Landing = () => {
  const { login } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [content, setContent] = useState<LandingConfig | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToLandingConfig((newConfig) => {
      setContent(newConfig);
    });
    return () => unsubscribe();
  }, []);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [beamPos, setBeamPos] = useState({ x: 500, y: 500 });
  // Ref to track beam position for the canvas drawing loop without stale closures
  const beamRef = useRef({ x: 500, y: 500 });
  
  const [logs, setLogs] = useState<Array<{id: number, prefix: string, msg: string, status: string}>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  const [tickerItems, setTickerItems] = useState(() => Array.from({length: 10}).map((_, i) => ({
      id: i,
      hash: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()}...${Math.random().toString(16).slice(2, 6).toUpperCase()}`
  })));

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerItems(prev => prev.map(item => ({
        ...item,
        hash: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()}...${Math.random().toString(16).slice(2, 6).toUpperCase()}`
      })));
    }, 500); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
        const isCritical = Math.random() > 0.7;
        const prefix = isCritical ? "NET" : "SYS";
        const status = isCritical ? `${Math.floor(Math.random() * 40 + 10)}ms` : "OK";
        const newLog = { id, prefix, msg: `${verb}::${noun} [${hash}]`, status };
        const newLogs = [...prev, newLog];
        if (newLogs.length > 8) return newLogs.slice(newLogs.length - 8);
        return newLogs;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const animateBeam = () => {
      setBeamPos(prev => {
        const ease = 0.08; // Adjusted for a punchy but smooth feel
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return prev;
        
        const next = {
          x: prev.x + dx * ease,
          y: prev.y + dy * ease
        };
        beamRef.current = next; // Update ref for canvas
        return next;
      });
      animationFrameId = requestAnimationFrame(animateBeam);
    };
    animateBeam();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // SPOTLIGHT MATRIX EFFECT
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
    // Initialize drops at random vertical positions
    let drops: number[] = new Array(columns).fill(1).map(() => Math.random() * (canvas.height / fontSize));

    const draw = () => {
      // Deep black background with very low trail for clarity
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px JetBrains Mono`;
      const fadeSize = canvas.height * 0.2; 
      const lightRadius = 350; // Radius of the spotlight reveal

      const currentBeam = beamRef.current;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // 1. Calculate base vertical fade
        let verticalOpacity = 1;
        if (y < fadeSize) {
          verticalOpacity = y / fadeSize;
        } else if (y > canvas.height - fadeSize) {
          verticalOpacity = (canvas.height - y) / fadeSize;
        }
        verticalOpacity = Math.max(verticalOpacity, 0);

        // 2. Calculate distance-based illumination (Spotlight)
        const distance = Math.hypot(x - currentBeam.x, y - currentBeam.y);
        let lightIntensity = 0;
        
        if (distance < lightRadius) {
          // Sharp but smooth falloff
          lightIntensity = Math.pow(1 - (distance / lightRadius), 1.5);
        }

        // 3. Final visual composite
        // Base ambient visibility (nearly zero but detectable for "deep" feel)
        const ambient = 0.02;
        const finalOpacity = (ambient + (lightIntensity * 0.9)) * verticalOpacity;

        if (finalOpacity > 0.01) {
          // Dynamic color based on intensity
          if (lightIntensity > 0.7) {
            ctx.fillStyle = `rgba(253, 164, 175, ${finalOpacity})`; // High-light (Pinkish)
          } else {
            ctx.fillStyle = `rgba(244, 63, 94, ${finalOpacity})`; // Standard (Rose)
          }
          ctx.fillText(char, x, y);
        }

        // Move drop
        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.85; // Speed factor
      }
      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (!content) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('roadmap-item')) {
                const index = parseInt(entry.target.getAttribute('data-index') || '0');
                setVisibleItems((prev) => (prev.includes(index) ? prev : [...prev, index]));
            }
            const sectionId = entry.target.getAttribute('data-id');
            if (sectionId) {
                setVisibleSections((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(sectionId);
                    return newSet;
                });
            }
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -100px 0px' });
    const items = document.querySelectorAll('.roadmap-item, [data-id]');
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [content]);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  if (!content) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 text-primary animate-spin" />
             <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Establishing Connection...</p>
           </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
    <div 
      className="bg-black text-zinc-100 flex flex-col relative overflow-x-hidden transition-all duration-700"
      onMouseMove={handleMouseMove}
    >
      {/* PROFESSIONAL SPOTLIGHT BACKGROUND SYSTEM */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        {/* Matrix Rain Canvas (Spotlight Logic inside Draw) */}
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        {/* Subtle Grid - Only visible near cursor */}
        <div 
           className="absolute inset-0 opacity-[0.1]" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(244, 63, 94, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.15) 1px, transparent 1px)', 
             backgroundSize: '40px 40px',
             maskImage: `radial-gradient(circle 400px at ${beamPos.x}px ${beamPos.y}px, black 0%, transparent 100%)`,
             WebkitMaskImage: `radial-gradient(circle 400px at ${beamPos.x}px ${beamPos.y}px, black 0%, transparent 100%)`
           }}
        ></div>
        
        {/* Touch Light Reveal layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {/* Primary Atmospheric Glow */}
           <div 
             className="absolute w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-primary/10 blur-[150px] rounded-full will-change-transform mix-blend-plus-lighter"
             style={{ 
               transform: `translate3d(${beamPos.x - 500}px, ${beamPos.y - 500}px, 0)`,
             }}
           />
           {/* Core Focus Light */}
           <div 
             className="absolute w-[200px] md:w-[350px] h-[200px] md:h-[350px] bg-primary/20 blur-[80px] rounded-full will-change-transform mix-blend-screen"
             style={{ transform: `translate3d(${beamPos.x - 175}px, ${beamPos.y - 175}px, 0)` }}
           />
           {/* Center Needle Point */}
           <div 
             className="absolute w-[40px] h-[40px] bg-white/10 blur-[20px] rounded-full will-change-transform"
             style={{ transform: `translate3d(${beamPos.x - 20}px, ${beamPos.y - 20}px, 0)` }}
           />
        </div>
      </div>

      {/* Main Hero */}
      {content.hero.isVisible && (
      <div className="relative z-10">
        <section className="pt-20 pb-20 md:pt-24 md:pb-32 px-4 md:px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-7 space-y-8 md:space-y-10">
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                   <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Genesis Epoch Active</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.95] md:leading-[0.9]">
                  {content.hero.title}
                </h1>
                
                <p className="text-zinc-400 text-base md:text-lg font-medium max-w-xl leading-relaxed">
                  {content.hero.subtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 pt-2">
                <button onClick={login} className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 rounded-lg">
                   {content.hero.ctaPrimary} <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/whitepaper" className="w-full sm:w-auto px-8 py-4 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 text-[11px] font-black text-white uppercase tracking-widest hover:border-zinc-700 transition-all flex items-center justify-center gap-3 rounded-lg">
                   {content.hero.ctaSecondary} <Code2 className="w-4 h-4 text-zinc-600" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-6 border-t border-zinc-900/50 pt-8">
                <div>
                   <p className="text-xl md:text-[2rem] font-mono font-bold text-white leading-none">40<span className="text-primary text-sm md:text-lg">+</span></p>
                   <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase mt-1 tracking-widest">Node Regions</p>
                </div>
                <div>
                   <p className="text-xl md:text-[2rem] font-mono font-bold text-white leading-none">12<span className="text-primary text-sm md:text-lg">ms</span></p>
                   <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase mt-1 tracking-widest">Global Latency</p>
                </div>
                <div>
                   <p className="text-xl md:text-[2rem] font-mono font-bold text-white leading-none">24<span className="text-primary text-sm md:text-lg">k</span></p>
                   <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase mt-1 tracking-widest">Active Peers</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative w-full">
               <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent blur-2xl opacity-50"></div>
               <div className="relative bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                  <div className="bg-zinc-900/50 px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                     <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <TerminalIcon className="w-3 h-3" />
                        <span>root@argus-core:~</span>
                     </div>
                  </div>
                  
                  <div className="p-4 md:p-6 font-mono text-[10px] md:text-xs h-[280px] md:h-[320px] flex flex-col relative">
                     <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_2px]"></div>

                     <div className="space-y-2 md:space-y-3 flex-1 overflow-hidden flex flex-col justify-end pb-4 relative z-10">
                        {logs.map((log) => (
                           <div key={log.id} className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold ${log.prefix === 'NET' ? 'text-primary' : 'text-zinc-600'}`}>[{log.prefix}]</span>
                              <span className="text-zinc-400 truncate flex-1">&gt; {log.msg}</span>
                              <span className={`text-[10px] font-bold ${log.status === 'OK' ? 'text-zinc-500' : 'text-white'}`}>{log.status}</span>
                           </div>
                        ))}
                        <div className="flex items-center gap-3 opacity-80">
                           <span className="text-[10px] font-bold text-primary">[CMD]</span>
                           <div className="h-3 md:h-4 w-1.5 md:w-2 bg-primary animate-pulse"></div>
                        </div>
                     </div>

                     <div className="mt-auto pt-4 md:pt-6 border-t border-zinc-900/50 relative z-10">
                        <div className="flex justify-between items-end">
                           <div>
                              <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mb-1">Current Yield</p>
                              <p className="text-xl md:text-2xl text-white font-bold">1.25 <span className="text-sm text-zinc-500">ARG/hr</span></p>
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
      </div>
      )}

      {/* Scrolling Ticker */}
      <div className="bg-zinc-900/10 backdrop-blur-sm border-y border-zinc-900/50 py-3 overflow-hidden relative group">
           <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
           <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

           <div className="flex items-center animate-marquee whitespace-nowrap will-change-transform w-max">
              {tickerItems.map((item, i) => (
                 <div key={`s1-${i}`} className="flex items-center gap-4 px-8 md:px-12">
                    <Activity className="w-3 h-3 text-zinc-700" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500">TX_HASH::{item.hash}</span>
                    <span className="text-[10px] font-mono font-bold text-primary">CONFIRMED</span>
                 </div>
              ))}
              {tickerItems.map((item, i) => (
                 <div key={`s2-${i}`} className="flex items-center gap-4 px-8 md:px-12">
                    <Activity className="w-3 h-3 text-zinc-700" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500">TX_HASH::{item.hash}</span>
                    <span className="text-[10px] font-mono font-bold text-primary">CONFIRMED</span>
                 </div>
              ))}
           </div>
        </div>

      {content.partners.isVisible && (
        <section className="py-16 md:py-20 border-b border-zinc-900/50 relative z-10">
           <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
              <p className="label-meta text-zinc-600">{content.partners.title}</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                 {content.partners.items.map((name: string, i: number) => (
                    <h3 key={i} className="text-sm md:text-lg font-black tracking-tighter text-white uppercase">{name.replace('_', ' ')}</h3>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* Content Sections */}
      {content.architecture.isVisible && (
        <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
              <div className="space-y-8 md:space-y-12">
                 <div 
                   data-id="arch-header"
                   className={`space-y-6 transition-all duration-1000 ease-out will-change-transform ${visibleSections.has('arch-header') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
                 >
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                       {content.architecture.title}
                    </h2>
                    <p className="text-zinc-500 text-base md:text-lg leading-relaxed max-w-md">
                       {content.architecture.description}
                    </p>
                 </div>
                 
                 <div className="space-y-6">
                    {content.architecture.layers.map((layer: any, i: number) => (
                       <div 
                         key={i} 
                         data-id={`arch-layer-${i}`}
                         className={`flex gap-6 group transition-all duration-1000 ease-out will-change-transform ${visibleSections.has(`arch-layer-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                         style={{ transitionDelay: `${i * 150}ms` }}
                       >
                          <div className="w-12 h-12 border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center rounded-lg shrink-0 group-hover:border-primary/50 transition-colors">
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

              <div 
                data-id="arch-visual"
                className={`relative transition-all duration-1000 ease-out will-change-transform ${visibleSections.has('arch-visual') ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 translate-x-12 blur-sm'}`}
              >
                 <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                 <div className="relative border border-zinc-800 bg-zinc-950/80 backdrop-blur-md rounded-2xl p-6 md:p-8 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                       <span className="label-meta text-primary">Stack_View</span>
                       <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                          <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                       </div>
                    </div>
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
                          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Argus Consensus (GhostDAG)</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {content.features.isVisible && (
        <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto w-full border-t border-zinc-900 relative z-10">
           <div 
             data-id="feat-header"
             className={`mb-16 md:mb-20 max-w-2xl transition-all duration-1000 ease-out will-change-transform ${visibleSections.has('feat-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
           >
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">{content.features.title}</h2>
              <p className="text-zinc-500 text-lg">{content.features.description}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.features.items.map((f: any, i: number) => {
                 const Icon = f.icon === 'Globe' ? Globe : f.icon === 'ShieldCheck' ? ShieldCheck : Cpu;
                 return (
                 <div 
                    key={i}
                    data-id={`feat-card-${i}`}
                    className={`group p-8 md:p-10 border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-1000 rounded-none relative overflow-hidden ease-out will-change-transform ${visibleSections.has(`feat-card-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${i * 200}ms` }}
                 >
                    <div className="w-12 h-12 bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-8 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                       <Icon className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                 </div>
              )})}
           </div>
        </section>
      )}

      {content.roadmap.isVisible && (
        <section className="py-24 md:py-32 bg-black/40 backdrop-blur-sm relative overflow-hidden border-t border-zinc-900 relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Protocol Map</span>
                     </div>
                     <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">{content.roadmap.title}</h2>
                     <p className="text-zinc-500 text-lg">{content.roadmap.description}</p>
                </div>

                <div className="relative">
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-zinc-800 to-zinc-900 transform md:-translate-x-1/2"></div>

                    <div className="space-y-16 md:space-y-32">
                        {content.roadmap.phases.map((item: any, index: number) => (
                            <div 
                                key={index}
                                data-index={index}
                                className={`roadmap-item flex flex-col md:flex-row items-center gap-8 md:gap-0 relative transition-all duration-1000 ease-out will-change-transform ${visibleItems.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
                            >
                                <div className={`absolute left-4 md:left-1/2 w-4 h-4 bg-black border-2 ${item.status === 'LIVE' ? 'border-primary shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'border-zinc-700'} rounded-full transform -translate-x-1/2 z-20`}></div>

                                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-24 md:text-right' : 'md:pl-24 md:order-last text-left'}`}>
                                    <div className="space-y-6 group">
                                        <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-4xl font-black text-zinc-800/50 group-hover:text-primary/20 transition-colors duration-500">Phase {item.phase}</span>
                                                {item.status === 'LIVE' && (
                                                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest rounded animate-pulse">
                                                        Active
                                                    </span>
                                                )}
                                                {item.status !== 'LIVE' && (
                                                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px] font-bold uppercase tracking-widest rounded">
                                                        {item.status}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">{item.title}</h3>
                                            <p className="text-zinc-500 font-mono text-sm mt-1">{item.period}</p>
                                        </div>
                                        <p className="text-zinc-400 text-sm leading-relaxed max-w-sm ml-auto mr-auto md:mx-0">{item.desc}</p>
                                        
                                        <div className={`pt-4 flex flex-col gap-2 ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                                            {item.features.map((feat: string, fIdx: number) => (
                                                <div key={fIdx} className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg w-fit hover:border-zinc-700 transition-colors">
                                                    {index % 2 === 0 ? null : <CheckCircle2 className={`w-4 h-4 ${item.status === 'LIVE' ? 'text-primary' : 'text-zinc-700'}`} />}
                                                    <span className="text-xs text-zinc-300 font-medium">{feat}</span>
                                                    {index % 2 === 0 ? <CheckCircle2 className={`w-4 h-4 ${item.status === 'LIVE' ? 'text-primary' : 'text-zinc-700'}`} /> : null}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block md:w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
      )}

      {content.faq.isVisible && (
        <section className="py-20 md:py-32 px-6 max-w-4xl mx-auto w-full border-t border-zinc-900/50 relative z-10">
           <h2 
             data-id="faq-header"
             className={`text-3xl font-black text-white uppercase tracking-tighter mb-16 text-center transition-all duration-1000 ease-out will-change-transform ${visibleSections.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
           >
             {content.faq.title}
           </h2>
           <div className="space-y-4">
              {content.faq.items.map((item: any, i: number) => (
                 <div 
                   key={i} 
                   data-id={`faq-item-${i}`}
                   className={`border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm overflow-hidden transition-all duration-1000 ease-out will-change-transform ${visibleSections.has(`faq-item-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                   style={{ transitionDelay: `${i * 100}ms` }}
                 >
                    <button 
                       onClick={() => toggleFaq(i)}
                       className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-900/50 transition-colors"
                    >
                       <span className="font-bold text-white text-xs md:text-sm uppercase tracking-wide pr-4">{item.q}</span>
                       <Plus className={`w-4 h-4 text-zinc-500 transition-transform duration-300 shrink-0 ${openFaq === i ? 'rotate-45' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                       <div className="p-6 pt-0 text-zinc-500 text-xs md:text-sm leading-relaxed border-t border-zinc-900/50 mt-2">
                          {item.a}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </section>
      )}

      {content.cta.isVisible && (
        <section className="py-24 md:py-48 border-t border-zinc-900 relative overflow-hidden group/cta relative z-10">
           {/* Background professional visual layers */}
           <div className="absolute inset-0 bg-primary/[0.01]"></div>
           
           {/* Dynamic multi-layered pulse reactive to state */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-primary/5 blur-[100px] md:blur-[160px] rounded-full pointer-events-none animate-pulse-slow"></div>
           
           {/* Tech scanning line visual */}
           <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scanline blur-[1px]"></div>
           </div>

           <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-12">
              <div className="space-y-6">
                <div 
                  data-id="cta-badge"
                  className={`inline-flex items-center gap-3 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full transition-all duration-1000 ${visibleSections.has('cta-badge') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                   <Zap className="w-3 h-3 text-primary animate-float" />
                   <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Network_Access_Handshake</span>
                </div>

                <h2 
                  data-id="cta-title"
                  className={`text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] transition-all duration-1000 ease-out will-change-transform ${visibleSections.has('cta-title') ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}
                >
                   {content.cta.title}
                </h2>
                
                <p 
                  data-id="cta-desc"
                  className={`text-zinc-500 text-base md:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ease-out will-change-transform ${visibleSections.has('cta-desc') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: '200ms' }}
                >
                   {content.cta.description}
                </p>
              </div>
              
              <div 
                data-id="cta-btn"
                className={`flex flex-col items-center gap-6 pt-4 transition-all duration-1000 ease-out will-change-transform ${visibleSections.has('cta-btn') ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transitionDelay: '400ms' }}
              >
                 <button 
                  onClick={login} 
                  className="h-16 px-12 bg-primary text-white text-sm font-black uppercase tracking-[0.2em] rounded-lg transition-all duration-500 shadow-[0_20px_60px_rgba(244,63,94,0.4)] hover:shadow-[0_0_80px_rgba(244,63,94,0.7)] hover:-translate-y-1 active:translate-y-0.5 flex items-center gap-4 group relative overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-4">
                      {content.cta.buttonText} 
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                 </button>
                 
                 <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Encrypted Tunnel</span>
                    <span className="text-zinc-800">•</span>
                    <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> Low Latency</span>
                 </div>
              </div>
           </div>

           {/* Decorative corner elements */}
           <div className="absolute bottom-10 left-10 hidden lg:block opacity-20">
              <div className="w-32 h-32 border-l border-b border-primary/40"></div>
           </div>
           <div className="absolute top-10 right-10 hidden lg:block opacity-20">
              <div className="w-32 h-32 border-r border-t border-primary/40"></div>
           </div>
        </section>
      )}
    </div>
    </PublicLayout>
  );
};

export default Landing;
