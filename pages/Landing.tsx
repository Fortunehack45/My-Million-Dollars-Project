
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
        const ease = 0.08; 
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return prev;
        
        const next = {
          x: prev.x + dx * ease,
          y: prev.y + dy * ease
        };
        beamRef.current = next; 
        return next;
      });
      animationFrameId = requestAnimationFrame(animateBeam);
    };
    animateBeam();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // PROFESSIONAL DISSOLVED SPOTLIGHT MATRIX EFFECT (WHITE CHARACTERS)
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
      // Deep black clearing with low trail for maximum contrast
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px JetBrains Mono`;
      const lightRadius = 450; 

      const currentBeam = beamRef.current;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const dx = x - currentBeam.x;
        const dy = y - currentBeam.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let revealAlpha = 0;
        if (distance < lightRadius) {
          // Sharp exponential falloff for a "dissolved" reveal feel
          const normalizedDist = distance / lightRadius;
          revealAlpha = Math.pow(1 - normalizedDist, 3.8); 
        }

        if (revealAlpha > 0.01) {
          // Matrix rain is pure WHITE when illuminated by the spotlight
          ctx.fillStyle = `rgba(255, 255, 255, ${revealAlpha})`;
          ctx.fillText(char, x, y);
        }

        if (y > canvas.height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i] += 0.9;
      }
      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (!content) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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
      }, { threshold: 0.1 });
    const items = document.querySelectorAll('[data-id]');
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [content]);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  if (!content) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <PublicLayout>
    <div 
      className="bg-black text-zinc-100 flex flex-col relative overflow-x-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
      {/* THE DISSOLVED SPOTLIGHT SYSTEM */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        {/* Matrix Rain Reveal Canvas (White Characters) */}
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        {/* Dissolved Atmospheric Light Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {/* Atmospheric Grain Overlay for the "Dissolved" feel */}
           <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
           </div>

           {/* Large outer atmospheric glow (Dissolved edges) */}
           <div 
             className="absolute w-[1200px] h-[1200px] bg-primary/5 blur-[300px] rounded-full will-change-transform mix-blend-screen opacity-40"
             style={{ transform: `translate3d(${beamPos.x - 600}px, ${beamPos.y - 600}px, 0)` }}
           />
           
           {/* Primary Dissolved Spotlight Core */}
           <div 
             className="absolute w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-[140px] rounded-full will-change-transform mix-blend-plus-lighter"
             style={{ 
               transform: `translate3d(${beamPos.x - 300}px, ${beamPos.y - 300}px, 0)`,
               maskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)',
               WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)'
             }}
           />

           {/* Focused White Center Point */}
           <div 
             className="absolute w-[120px] h-[120px] bg-white/10 blur-[50px] rounded-full will-change-transform"
             style={{ transform: `translate3d(${beamPos.x - 60}px, ${beamPos.y - 60}px, 0)` }}
           />

           {/* Dissolved Light Ray (The Beam) */}
           <div 
             className="absolute w-[1.5px] h-[180vh] bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-[4px] opacity-10 origin-top animate-pulse-slow"
             style={{ 
               left: `${beamPos.x}px`,
               top: `${beamPos.y - 300}px`,
               transform: `rotate(${Math.sin(Date.now() / 2500) * 1.2}deg)`
             }}
           />
        </div>
      </div>

      {/* Main Hero */}
      {content.hero.isVisible && (
      <div className="relative z-10">
        <section className="pt-24 pb-32 px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                   <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Genesis Epoch Active</span>
                </div>
                
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                  {content.hero.title}
                </h1>
                
                <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                  {content.hero.subtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button onClick={login} className="w-full sm:w-auto px-10 py-5 bg-primary text-white text-[12px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 rounded-xl">
                   {content.hero.ctaPrimary} <ArrowRight className="w-5 h-5" />
                </button>
                <Link to="/whitepaper" className="w-full sm:w-auto px-10 py-5 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 text-[12px] font-black text-white uppercase tracking-widest hover:border-zinc-700 transition-all flex items-center justify-center gap-3 rounded-xl">
                   {content.hero.ctaSecondary} <Code2 className="w-5 h-5 text-zinc-600" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-10 border-t border-zinc-900/50">
                {[
                  { val: '40+', label: 'Node Regions' },
                  { val: '12ms', label: 'Latency' },
                  { val: '24k', label: 'Validators' }
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-2xl md:text-4xl font-mono font-bold text-white leading-none">{stat.val}</p>
                    <p className="text-[9px] font-black text-zinc-600 uppercase mt-2 tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative">
               <div className="relative bg-black/40 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-zinc-900/40 px-5 py-3.5 flex items-center justify-between border-b border-zinc-800">
                     <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                        <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <TerminalIcon className="w-3 h-3" />
                        <span>argus-shell</span>
                     </div>
                  </div>
                  
                  <div className="p-6 font-mono text-[11px] h-[340px] flex flex-col justify-end gap-3 pb-8">
                     {logs.map((log) => (
                        <div key={log.id} className="flex items-center gap-4">
                           <span className={`font-bold ${log.prefix === 'NET' ? 'text-primary' : 'text-zinc-700'}`}>[{log.prefix}]</span>
                           <span className="text-zinc-500 truncate flex-1">&gt; {log.msg}</span>
                           <span className="text-zinc-600 font-bold">{log.status}</span>
                        </div>
                     ))}
                     <div className="flex items-center gap-3">
                        <span className="text-primary font-bold">[CMD]</span>
                        <div className="h-4 w-2 bg-primary animate-pulse"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>
      )}

      {/* Content sections below with slight backdrop to catch the spotlight rain reveal */}
      <section className="relative z-10 py-32 border-t border-zinc-900/50 bg-black/5 backdrop-blur-[1px]">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="label-meta text-zinc-600 mb-12">{content.partners.title}</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {content.partners.items.map((name, i) => (
                  <h3 key={i} className="text-lg font-black text-white uppercase">{name.replace('_', ' ')}</h3>
               ))}
            </div>
         </div>
      </section>

      {content.architecture.isVisible && (
        <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                 <div data-id="arch-header" className="space-y-6">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                       {content.architecture.title}
                    </h2>
                    <p className="text-zinc-500 text-lg md:text-xl leading-relaxed">
                       {content.architecture.description}
                    </p>
                 </div>
                 
                 <div className="space-y-8">
                    {content.architecture.layers.map((layer, i) => (
                       <div key={i} className="flex gap-8 group">
                          <div className="w-14 h-14 border border-zinc-800 bg-zinc-900/30 backdrop-blur-md flex items-center justify-center rounded-xl shrink-0 group-hover:border-primary/50 transition-colors">
                             <Layers className="w-6 h-6 text-zinc-600 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-white mb-1">{layer.title}</h4>
                             <p className="text-zinc-500">{layer.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full"></div>
                 <div className="relative border border-zinc-800 bg-black/60 backdrop-blur-xl rounded-3xl p-10 space-y-8">
                    <div className="h-20 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center">
                       <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Compute Sharding Layer</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-32 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3">
                          <Cpu className="w-5 h-5 text-zinc-600" />
                          <span className="text-[10px] font-mono font-bold text-zinc-500">Execution</span>
                       </div>
                       <div className="h-32 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3">
                          <Database className="w-5 h-5 text-zinc-600" />
                          <span className="text-[10px] font-mono font-bold text-zinc-500">Persistence</span>
                       </div>
                    </div>
                    <div className="h-16 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-center">
                       <span className="text-[10px] font-mono font-bold text-zinc-400">Consensus Engine (RC1)</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* CTA Section */}
      {content.cta.isVisible && (
        <section className="py-48 border-t border-zinc-900 relative z-10 overflow-hidden bg-black/20 backdrop-blur-sm">
           <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full">
                   <Zap className="w-4 h-4 text-primary animate-pulse" />
                   <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Awaiting_Handshake</span>
                </div>

                <h2 className="text-5xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                   {content.cta.title}
                </h2>
                
                <p className="text-zinc-500 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
                   {content.cta.description}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-8 pt-6">
                 <button onClick={login} className="h-20 px-16 bg-primary text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_20px_60px_rgba(244,63,94,0.4)] hover:shadow-[0_0_80px_rgba(244,63,94,0.7)] hover:-translate-y-2 flex items-center gap-4 group">
                    {content.cta.buttonText} 
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-300" />
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
