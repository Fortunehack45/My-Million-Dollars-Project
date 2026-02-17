
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
    const unsubscribe = subscribeToLandingConfig(setContent);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );
    document.querySelectorAll('section').forEach((s) => s.id && observer.observe(s));
    return () => observer.disconnect();
  }, [content]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const beamRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [memoryState, setMemoryState] = useState<number[]>(new Array(48).fill(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryState(p => p.map(v => Math.random() > 0.95 ? Math.floor(Math.random() * 4) : v === 3 ? 1 : v));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const verbs = ["ORDERING", "SYNCING", "VERIFYING", "HASHING", "SIGNING"];
    const nouns = ["GHOSTDAG", "SET_BLUE", "EPOCH", "V_NODE", "PARALLEL"];
    const interval = setInterval(() => {
      setLogs(p => [...p.slice(-8), {
        id: Date.now(),
        msg: `${verbs[Math.floor(Math.random()*verbs.length)]}_${nouns[Math.floor(Math.random()*nouns.length)]}`,
        status: Math.random() > 0.9 ? 'RETRY' : 'OK',
        color: Math.random() > 0.9 ? 'text-primary' : 'text-emerald-500'
      }]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

    const chars = "01ABCDEF";
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = new Array(columns).fill(1).map(() => Math.random() * (canvas.height / fontSize));

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `900 ${fontSize}px monospace`;

      const beamX = beamRef.current.x;
      const beamY = beamRef.current.y;
      const radius = 400;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        const dx = x - beamX;
        const dy = y - beamY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        let opacity = 0.08;
        if (dist < radius) {
            opacity = Math.max(opacity, (1 - dist / radius) * 0.8);
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

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX;
    const y = e.clientY;
    setMousePos({ x, y });
    beamRef.current = { x, y };
  };

  if (!content) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <PublicLayout>
    <div className="bg-black text-zinc-100 flex flex-col relative overflow-hidden" onMouseMove={handleMouseMove}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      
      <section id="hero" className="relative z-10 pt-32 pb-48 px-6 max-w-7xl mx-auto w-full min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center w-full">
          <div className={`lg:col-span-7 space-y-12 transition-all duration-1000 ease-out ${visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-xl">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Protocol_vRC.1_Online</span>
              </div>
              <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.8] italic drop-shadow-[0_0_30px_rgba(244,63,94,0.15)]">
                {content.hero.title}
              </h1>
              <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                {content.hero.subtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button onClick={login} className="w-full sm:w-auto px-10 py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_20px_50px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                {content.hero.ctaPrimary} <ArrowRight className="w-5 h-5" />
              </button>
              <Link to="/whitepaper" className="w-full sm:w-auto px-10 py-6 bg-white/5 border border-white/10 text-[12px] font-black text-white uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-xl">
                {content.hero.ctaSecondary} <Code2 className="w-5 h-5 text-zinc-500" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
             <div className="relative bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl font-mono text-[10px] animate-float">
                <div className="bg-zinc-900/50 px-5 py-3 flex items-center justify-between border-b border-white/5">
                   <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                   </div>
                   <span className="text-zinc-500 uppercase tracking-widest text-[8px] font-black">Argus_Terminal</span>
                </div>
                <div className="p-6 space-y-6">
                   <div className="grid grid-cols-2 gap-4 h-24">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                         <p className="text-[7px] text-zinc-600 mb-2 uppercase font-black">Memory_Heap</p>
                         <div className="grid grid-cols-8 gap-1">
                            {memoryState.map((s, i) => (
                               <div key={i} className={`h-1 rounded-[1px] ${s === 3 ? 'bg-primary' : s === 2 ? 'bg-zinc-700' : 'bg-zinc-900'}`} />
                            ))}
                         </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                         <p className="text-[7px] text-zinc-600 mb-2 uppercase font-black">IO_Traffic</p>
                         <div className="h-full flex items-end gap-0.5">
                            {Array.from({length: 15}).map((_, i) => (
                               <div key={i} className="flex-1 bg-primary/40 rounded-t-[1px]" style={{height: `${Math.random()*100}%`}} />
                            ))}
                         </div>
                      </div>
                   </div>
                   <div className="space-y-1.5 min-h-[160px]">
                      {logs.map((l) => (
                         <div key={l.id} className="flex justify-between items-center text-zinc-400">
                            <span>> {l.msg}</span>
                            <span className={`font-black ${l.color}`}>{l.status}</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-48 px-6 max-w-7xl mx-auto relative z-10">
         <div className={`text-center mb-32 transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 italic italic">High-Velocity Infrastructure</h2>
            <p className="text-zinc-500 text-xl max-w-2xl mx-auto">{content.features.description}</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {content.features.items.map((item, i) => {
               const Icon = IconMap[item.icon] || Globe;
               return (
                 <div key={i} style={{ transitionDelay: `${i * 150}ms` }} className={`p-10 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 hover:border-primary/40 transition-all duration-700 group hover:-translate-y-4 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:bg-primary/20 transition-colors">
                       <Icon className="w-8 h-8 text-zinc-500 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{item.title}</h3>
                    <p className="text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
                 </div>
            )})}
         </div>
      </section>

      <section id="cta" className={`py-64 relative z-10 overflow-hidden border-t border-white/5 transition-all duration-1000 ${visibleSections.has('cta') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
         <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full translate-y-1/2"></div>
         <div className="max-w-5xl mx-auto px-6 text-center space-y-16 relative">
            <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.8] italic">
               Finalize_Authority
            </h2>
            <p className="text-zinc-500 text-xl md:text-2xl max-w-2xl mx-auto font-medium">
               Join the high-speed consensus layer. Genesis validators are onboarding now.
            </p>
            <button onClick={login} className="px-20 py-8 bg-primary text-white text-[14px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_80px_rgba(244,63,94,0.5)] hover:shadow-[0_0_120px_rgba(244,63,94,0.7)] hover:-translate-y-2 transition-all flex items-center gap-6 mx-auto">
               Initialize Node <ArrowRight className="w-8 h-8" />
            </button>
         </div>
      </section>
    </div>
    </PublicLayout>
  );
};

export default Landing;
