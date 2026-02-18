
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToLandingConfig } from '../services/firebase';
import { LandingConfig } from '../types';
import PublicLayout from '../components/PublicLayout';
import { 
  ArrowRight, 
  Code2,
  Layers,
  Cpu,
  Database,
  Loader2,
  Zap,
  MapPin,
  CheckCircle2,
  Plus,
  Terminal as TerminalIcon,
  Activity,
  Globe
} from 'lucide-react';
import { Link } from 'react-router';

// Icon mapping for dynamic content
const IconMap: Record<string, any> = {
  'Cpu': Cpu,
  'Globe': Globe,
  'Zap': Zap,
  'Database': Database,
  'Layers': Layers,
  'MapPin': MapPin,
  'CheckCircle2': CheckCircle2
};

// --- TERMINAL COMPONENT (Desktop Only Visual) ---
interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  timestamp: string;
}

const Terminal = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<number[]>([]);
  const isMountedRef = useRef(true);

  const getLocalTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  };

  const bootSequence = [
    { text: "ARGUS_KERNEL_V2.8.4 initializing...", delay: 20, type: 'system' },
    { text: "Loading cryptographic modules [SECP256K1]... OK", delay: 10, type: 'success' },
    { text: "Mounting GhostDAG virtual file system... OK", delay: 15, type: 'success' },
    { text: "Verifying blue-set topology integrity...", delay: 30, type: 'info' },
    { text: "> 14,021,992 blocks indexed in 402ms", delay: 5, type: 'info' },
    { text: "Establishing P2P handshake (WSS://NODE_MAIN)...", delay: 40, type: 'warning' },
    { text: "Connection secured: RSA-4096/AES-GCM", delay: 10, type: 'success' },
    { text: "Syncing mempool... [428 txn pending]", delay: 25, type: 'info' },
    { text: "Optimizing DAG traverser threads [8/8 cores]...", delay: 15, type: 'info' },
    { text: "SYSTEM_READY: Awaiting validator signature.", delay: 100, type: 'success' }
  ];

  const activityLogs = [
    "Validating block #14022001 (Hash: 0x8F...2A)",
    "Propagating cluster data to peer 192.168.X.X",
    "Garbage collecting orphaned red-set blocks...",
    "Indexing new account state trie...",
    "Received ghost_dag_merge request (Latency: 12ms)",
    "Signing consensus proof [ED25519]..."
  ];

  useEffect(() => {
    isMountedRef.current = true;
    let lineIndex = 0;
    let charIndex = 0;
    let isBooting = true;

    const addLog = (text: string, type: any = 'info') => {
      if (!isMountedRef.current) return;
      const timestamp = getLocalTime();
      setLogs(prev => [...prev.slice(-12), { // Keep fewer logs for performance
        id: Math.random().toString(36).substr(2, 9), 
        text, 
        type, 
        timestamp 
      }]);
    };

    const typeWriter = () => {
      if (!isMountedRef.current) return;

      if (isBooting) {
        if (lineIndex < bootSequence.length) {
          const currentSeq = bootSequence[lineIndex];
          const targetLine = currentSeq.text;
          
          if (charIndex < targetLine.length) {
            setCurrentLine(targetLine.substring(0, charIndex + 1));
            charIndex++;
            const speed = Math.random() * 30 + 10;
            timeoutsRef.current.push(window.setTimeout(typeWriter, speed));
          } else {
            addLog(targetLine, currentSeq.type);
            setCurrentLine('');
            charIndex = 0;
            lineIndex++;
            const delay = currentSeq.delay * 10 || 300;
            timeoutsRef.current.push(window.setTimeout(typeWriter, delay));
          }
        } else {
          isBooting = false;
          timeoutsRef.current.push(window.setTimeout(typeWriter, 1000));
        }
      } else {
        const randomLog = activityLogs[Math.floor(Math.random() * activityLogs.length)];
        addLog(randomLog, 'info');
        const nextDelay = Math.random() * 2000 + 1000;
        timeoutsRef.current.push(window.setTimeout(typeWriter, nextDelay));
      }
    };

    typeWriter();

    return () => {
      isMountedRef.current = false;
      timeoutsRef.current.forEach(window.clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, currentLine]);

  return (
    <div className="relative w-full h-[400px] xl:h-[520px] bg-zinc-950/90 backdrop-blur-xl rounded-xl border border-zinc-800/80 shadow-2xl flex flex-col overflow-hidden font-mono text-[10px] xl:text-[11px] transform transition-all hover:border-primary/30 group animate-fade-in-right">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800/50">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-sm"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-sm"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-sm"></div>
        </div>
        <div className="text-zinc-500 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2 opacity-70">
          <TerminalIcon className="w-3 h-3" /> Argus_Node_CLI
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-emerald-500 text-[9px] font-bold">NET_ACTIVE</span>
        </div>
      </div>
      <div className="relative flex-1 p-0 overflow-hidden bg-black/50">
        <div ref={scrollRef} className="absolute inset-0 p-5 overflow-y-auto custom-scrollbar space-y-1.5">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 leading-relaxed opacity-90 hover:opacity-100 transition-opacity">
              <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
              <div className={`break-words ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-amber-400' :
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'system' ? 'text-primary font-bold' :
                'text-zinc-300'
              }`}>
                {log.type === 'system' && <span className="text-primary mr-2">➜</span>}
                {log.text}
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-1">
             <span className="text-zinc-600 shrink-0 select-none">[{getLocalTime()}]</span>
             <div className="text-primary break-words leading-relaxed flex items-center">
                <span className="mr-2">➜</span>
                {currentLine}
                <span className="w-2 h-4 bg-primary ml-1 animate-[pulse_1s_steps(2)_infinite]"></span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Mobile Status Card
const MobileStatusCard = () => (
  <div className="w-full bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex items-center justify-between mb-8 animate-fade-in-up">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
        <Activity className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network Status</p>
        <p className="text-xs font-mono font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Operational
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">TPS</p>
      <p className="text-sm font-mono font-bold text-white">402,192</p>
    </div>
  </div>
);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
      if (section.id) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [content]);

  // Mouse & Matrix Effect Logic
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
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

    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 12 : 14;
    const chars = "01";
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = new Array(columns).fill(1).map(() => Math.random() * (canvas.height / fontSize));

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 5, 0.1)"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + "px 'JetBrains Mono', monospace";

      const beamX = mousePos.x;
      const beamY = mousePos.y; 
      const radius = 400; 

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        let alpha = 0.05;
        if (!isMobile) { 
            const dx = x - beamX;
            const dy = y - beamY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < radius) {
                const intensity = 1 - (dist / radius); 
                alpha = Math.max(alpha, intensity * 0.9);
            }
        }

        ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`; 
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
  }, [mousePos]);

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
        <div 
           className="absolute w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full will-change-transform pointer-events-none transition-transform duration-75 ease-out hidden md:block"
           style={{ transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)` }}
        />
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 pt-28 pb-16 md:pt-32 md:pb-48 px-4 md:px-6 max-w-7xl mx-auto w-full min-h-[auto] md:min-h-[85vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-center w-full">
          
          <div className="lg:col-span-7 space-y-8 md:space-y-12 animate-fade-in-up relative z-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full backdrop-blur-md animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-[0.2em]">Genesis_Epoch_Active</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-[0.95] md:leading-[0.9] drop-shadow-2xl text-balance break-words hyphens-auto">
                {content.hero.title}
              </h1>
              
              <p className="text-zinc-400 text-sm md:text-xl font-medium max-w-xl leading-relaxed animate-fade-in opacity-0 text-pretty" style={{ animationDelay: '0.4s' }}>
                {content.hero.subtitle}
              </p>
            </div>

            {/* Mobile Status Card (Visible only on small screens) */}
            <div className="block lg:hidden">
               <MobileStatusCard />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
              <button onClick={login} className="w-full sm:w-auto px-8 py-5 md:px-10 md:py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 rounded-xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">{content.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <Link to="/whitepaper" className="w-full sm:w-auto px-8 py-5 md:px-10 md:py-6 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 text-[12px] font-black text-white uppercase tracking-[0.2em] hover:border-zinc-600 transition-all flex items-center justify-center gap-3 rounded-xl group">
                {content.hero.ctaSecondary} <Code2 className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Terminal UI - Hidden on small mobile, visible on lg */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0 animate-fade-in-right opacity-0 hidden lg:block z-10 pl-4 lg:pl-0" style={{ animationDelay: '0.5s' }}>
             <Terminal />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className={`relative z-10 py-12 md:py-24 border-t border-zinc-900/50 bg-black/40 backdrop-blur-md transition-all duration-1000 ease-out ${visibleSections.has('partners') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
         <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            <p className="text-[10px] font-black text-zinc-600 mb-8 md:mb-12 uppercase tracking-[0.3em]">{content.partners.title}</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 md:gap-24 opacity-40 md:opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {content.partners.items.map((name, i) => (
                  <h3 key={i} style={{ transitionDelay: `${i * 100}ms` }} className={`text-xs md:text-lg font-black text-white uppercase tracking-tighter transition-all duration-700 ${visibleSections.has('partners') ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-sm translate-y-4'}`}>{name.replace('_', ' ')}</h3>
               ))}
            </div>
         </div>
      </section>

      {/* Features Grid */}
      {content.features?.isVisible && (
        <section id="features" className="py-16 md:py-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10">
           <div className={`text-center mb-12 md:mb-16 max-w-3xl mx-auto transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 md:mb-6">{content.features.title}</h2>
              <p className="text-zinc-500 text-sm md:text-lg leading-relaxed">{content.features.description}</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {content.features.items.map((item, i) => {
                 const Icon = IconMap[item.icon] || Globe;
                 return (
                 <div key={i} style={{ transitionDelay: `${i * 150}ms` }} className={`p-6 md:p-8 rounded-3xl bg-zinc-900/20 border border-zinc-900 hover:border-primary/50 transition-all duration-700 group hover:-translate-y-2 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="w-12 h-12 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                       <Icon className="w-6 h-6 text-zinc-500 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-3 uppercase tracking-tight">{item.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                 </div>
              )})}
           </div>
        </section>
      )}

      {/* Architecture Section */}
      {content.architecture.isVisible && (
        <section id="architecture" className="py-16 md:py-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className={`space-y-8 md:space-y-12 transition-all duration-1000 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                 <div className="space-y-4 md:space-y-6">
                    <h2 className="text-3xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                       {content.architecture.title}
                    </h2>
                    <p className="text-zinc-500 text-sm md:text-xl leading-relaxed max-w-lg">
                       {content.architecture.description}
                    </p>
                 </div>
                 <div className="space-y-6 md:space-y-8">
                    {content.architecture.layers.map((layer, i) => (
                       <div key={i} style={{ transitionDelay: `${300 + (i * 150)}ms` }} className={`flex gap-6 md:gap-8 group transition-all duration-700 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                          <div className="w-12 h-12 md:w-16 md:h-16 border border-zinc-800 bg-zinc-900/30 backdrop-blur-md flex items-center justify-center rounded-2xl shrink-0 group-hover:border-primary/50 transition-colors">
                             <Layers className="w-6 h-6 md:w-7 md:h-7 text-zinc-600 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                             <h4 className="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{layer.title}</h4>
                             <p className="text-zinc-500 text-xs md:text-sm leading-relaxed">{layer.desc}</p>
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

      {/* ENHANCED ROADMAP SECTION - MOBILE OPTIMIZED */}
      {content.roadmap?.isVisible && (
        <section id="roadmap" className="py-16 md:py-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10 border-t border-zinc-900/30">
            <div className={`mb-16 md:mb-32 text-center transition-all duration-1000 ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
                  <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Protocol Timeline</span>
               </div>
               <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">{content.roadmap.title}</h2>
               <p className="text-zinc-500 text-sm md:text-lg max-w-2xl mx-auto">{content.roadmap.description}</p>
            </div>

            <div className="relative">
               {/* Central Line - Left aligned on mobile (20px approx), centered on desktop */}
               <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-zinc-900 md:-translate-x-1/2">
                  <div 
                    className={`absolute top-0 left-0 w-full bg-gradient-to-b from-transparent via-primary to-transparent transition-all duration-[2000ms] ease-out opacity-50 ${visibleSections.has('roadmap') ? 'h-full' : 'h-0'}`}
                  ></div>
               </div>

               <div className="space-y-12 md:space-y-24">
                  {content.roadmap.phases.map((phase, i) => (
                     <div 
                        key={i} 
                        className={`flex flex-col md:flex-row gap-6 md:gap-0 items-start relative ${i % 2 === 0 ? '' : 'md:flex-row-reverse'} group`}
                     >
                        {/* Connector Line (Horizontal) - Desktop Only */}
                        <div className={`hidden md:block absolute top-8 ${i % 2 === 0 ? 'left-1/2 right-1/2 w-[40px]' : 'right-1/2 left-auto w-[40px] -translate-x-full'} h-px bg-zinc-800 group-hover:bg-primary/50 transition-colors duration-500`}></div>

                        {/* Timeline Node - Tech Hexagon */}
                        <div 
                           className={`absolute left-[14px] md:left-1/2 md:-translate-x-1/2 top-0 md:top-6 w-3 h-3 z-10 transition-all duration-700 delay-[${i * 200}ms] ${visibleSections.has('roadmap') ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                        >
                           <div className={`w-3 h-3 rotate-45 border-2 ${phase.status === 'LIVE' ? 'bg-zinc-950 border-primary shadow-[0_0_15px_#f43f5e]' : 'bg-zinc-950 border-zinc-700'} transition-all duration-500 group-hover:scale-125`}></div>
                        </div>

                        {/* Spacer for alignment on Desktop */}
                        <div className="hidden md:block md:w-1/2"></div>

                        {/* Content Card */}
                        <div 
                           className={`pl-12 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pl-16' : 'md:pr-16'} transition-all duration-1000 w-full ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                           style={{ transitionDelay: `${i * 200}ms` }}
                        >
                           <div className={`relative bg-zinc-900/10 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/30 p-6 md:p-8 rounded-2xl backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl`}>
                              {/* Decorative Corners */}
                              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 rounded-tl-lg"></div>
                              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-700 rounded-tr-lg"></div>
                              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-700 rounded-bl-lg"></div>
                              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 rounded-br-lg"></div>

                              {/* Status Header */}
                              <div className="flex items-center justify-between mb-6">
                                 <span className="text-[9px] md:text-[10px] font-mono font-bold text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded border border-zinc-900">
                                    PHASE_{phase.phase}
                                 </span>
                                 <div className={`flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${phase.status === 'LIVE' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                                    {phase.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                                    {phase.status}
                                 </div>
                              </div>

                              {/* Content */}
                              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{phase.title}</h3>
                              <p className="text-xs font-mono text-zinc-500 mb-4">{phase.period}</p>
                              <p className="text-sm text-zinc-400 leading-relaxed mb-6">{phase.desc}</p>
                              
                              {/* Features List */}
                              <div className="space-y-3 pt-6 border-t border-zinc-800/50">
                                 {phase.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                       <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${phase.status === 'LIVE' ? 'text-primary' : 'text-zinc-700'}`} />
                                       <span className="text-xs font-medium text-zinc-300">{feat}</span>
                                    </div>
                                 ))}
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
        <section id="faq" className="py-16 md:py-32 px-4 md:px-6 max-w-4xl mx-auto relative z-10 border-t border-zinc-900/50">
           <h2 className={`text-3xl font-black text-white uppercase tracking-tighter mb-12 md:mb-16 text-center transition-all duration-1000 ${visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{content.faq.title}</h2>
           <div className="space-y-4">
              {content.faq.items.map((item, i) => (
                 <div key={i} style={{ transitionDelay: `${i * 100}ms` }} className={`border border-zinc-900 bg-black/40 backdrop-blur-md rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-700 ${visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <button 
                       onClick={() => toggleFaq(i)}
                       className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-zinc-900/20 transition-colors"
                    >
                       <span className="font-bold text-white text-xs md:text-sm uppercase tracking-wide pr-4">{item.q}</span>
                       <Plus className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''} shrink-0`} />
                    </button>
                    <div 
                       className={`grid transition-all duration-500 ease-in-out ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                       <div className="overflow-hidden">
                           <div className="p-5 md:p-6 pt-0 text-zinc-500 text-xs md:text-sm leading-relaxed border-t border-zinc-900/50 mt-2">
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
        <section id="cta" className={`py-24 md:py-48 border-t border-zinc-900 relative z-10 overflow-hidden bg-black/40 backdrop-blur-xl transition-all duration-1000 ease-out ${visibleSections.has('cta') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
           <div className="max-w-5xl mx-auto px-4 md:px-6 text-center space-y-12 md:space-y-16">
              <div className="space-y-6 md:space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full">
                   <Zap className="w-4 h-4 text-primary animate-pulse" />
                   <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest font-mono">Status: Awaiting_Handshake</span>
                </div>

                <h2 className="text-3xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                   {content.cta.title}
                </h2>
                
                <p className="text-zinc-500 text-base md:text-2xl max-w-2xl mx-auto leading-relaxed">
                   {content.cta.description}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-8 pt-6">
                 <button onClick={login} className="h-14 md:h-24 px-8 md:px-20 bg-primary text-white text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_20px_80px_rgba(244,63,94,0.4)] hover:shadow-[0_0_100px_rgba(244,63,94,0.7)] hover:-translate-y-2 flex items-center gap-4 group">
                    {content.cta.buttonText} 
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-3 transition-transform duration-500" />
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
