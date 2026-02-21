
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { subscribeToLandingConfig, subscribeToLiveValidators } from '../services/firebase';
import { LandingConfig } from '../types';
import PublicLayout from '../components/PublicLayout';
import Logo from '../components/Logo';
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
   Globe,
   Milestone
} from 'lucide-react';
import MatrixBackground from '../components/MatrixBackground';

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
      { text: "ARGUS_SECURE_KERNEL v2.8.4 initialized.", delay: 20, type: 'system' },
      { text: "Loading institutional-grade primitives [EDDSA]... OK", delay: 10, type: 'success' },
      { text: "Mounting persistent sharding layer... OK", delay: 15, type: 'success' },
      { text: "Verifying consensus topology integrity...", delay: 30, type: 'info' },
      { text: "> 14,021,992 operations synchronized locally.", delay: 5, type: 'info' },
      { text: "Establishing secure p2p-handshake...", delay: 40, type: 'warning' },
      { text: "Encryption: Institutional AES-GCM-256 enabled.", delay: 10, type: 'success' },
      { text: "Mempool state: 428 transactions identified.", delay: 25, type: 'info' },
      { text: "Parallel processing engine active [8 threads].", delay: 15, type: 'info' },
      { text: "SYSTEM_REACHABLE: Awaiting institutional bridge.", delay: 100, type: 'success' }
   ];

   const activityLogs = [
      "Synchronizing block status #14022001",
      "Updating peer distribution metrics...",
      "Executing state transition proof...",
      "Indexing canonical protocol trie...",
      "Merge request validated (Latency: 12ms)",
      "Generating institutional consensus proof..."
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
         scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
         });
      }
   }, [logs, currentLine]);

   return (
      <div className="relative w-full h-[400px] xl:h-[500px] bg-zinc-950 rounded-2xl border border-zinc-900 shadow-2xl flex flex-col overflow-hidden font-mono text-[10px] xl:text-[11px] group animate-fade-in-right hover:border-zinc-800 transition-all duration-500">

         {/* SCANLINE OVERLAY */}
         <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
         <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent animate-scanline h-[20%]" />

         {/* CRT GLOW */}
         <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.05)_0%,transparent_70%)]" />

         {/* Header - Refined */}
         <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/40 border-b border-zinc-900">
            <div className="flex gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
            </div>
            <div className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[8px] flex items-center gap-2 opacity-60">
               <TerminalIcon className="w-3 h-3" /> Argus_Core_Interface
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1 h-1 bg-emerald-500/50 rounded-full animate-pulse"></div>
               <span className="text-zinc-600 text-[8px] font-bold tracking-widest uppercase">STABLE</span>
            </div>
         </div>

         {/* Body */}
         <div className="relative flex-1 p-0 overflow-hidden bg-black/40">
            {/* Subtle grid line overlay for tech feel */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100% 24px' }}>
            </div>

            <div ref={scrollRef} className="absolute inset-0 p-5 overflow-y-auto custom-scrollbar space-y-1.5">
               {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 leading-relaxed opacity-90 hover:opacity-100 transition-opacity">
                     <span className="text-zinc-600 shrink-0 select-none w-14 text-right">[{log.timestamp.split('.')[0]}]</span>
                     <div className={`break-words ${log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-amber-400' :
                           log.type === 'success' ? 'text-emerald-400' :
                              log.type === 'system' ? 'text-maroon font-bold' :
                                 'text-zinc-300'
                        }`}>
                        {log.type === 'system' && <span className="text-maroon mr-2">➜</span>}
                        {log.text}
                     </div>
                  </div>
               ))}
               <div className="flex gap-3 pt-1">
                  <span className="text-zinc-600 shrink-0 select-none w-14 text-right">[{getLocalTime().split('.')[0]}]</span>
                  <div className="text-maroon break-words leading-relaxed flex items-center">
                     <span className="mr-2">➜</span>
                     {currentLine}
                     <span className="w-2 h-4 bg-maroon ml-1 animate-[pulse_1s_steps(2)_infinite]"></span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

// Simplified Network Activity Indicator
const NetworkStatus = () => (
   <div className="flex items-center gap-6 px-6 py-3 bg-zinc-950/50 border border-white/[0.03] backdrop-blur-xl rounded-2xl">
      <div className="flex -space-x-2">
         {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
               <div className="w-full h-full bg-gradient-to-tr from-zinc-800 to-zinc-700"></div>
            </div>
         ))}
      </div>
      <div className="h-4 w-px bg-zinc-800"></div>
      <div className="flex items-center gap-2">
         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
         <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mainnet_Operational</span>
      </div>
      <div className="hidden md:flex items-center gap-4 ml-4">
         <span className="text-[10px] font-mono text-zinc-600">v2.8.4</span>
         <span className="text-[10px] font-mono text-zinc-600">402k_TPS</span>
      </div>
   </div>
);

const MobileStatusCard = () => (
   <div className="w-full bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex items-center justify-between mb-8 animate-fade-in-up">
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
            <Activity className="w-5 h-5 text-maroon" />
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
   const navigate = useNavigate();
   const [openFaq, setOpenFaq] = useState<number | null>(null);
   const [content, setContent] = useState<LandingConfig | null>(null);
   const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
   const [liveValidators, setLiveValidators] = useState(1);

   useEffect(() => {
      const unsubscribe = subscribeToLandingConfig((newConfig) => {
         setContent(newConfig);
      });
      return () => unsubscribe();
   }, []);

   useEffect(() => {
      const unsubscribe = subscribeToLiveValidators(setLiveValidators);
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
         { threshold: 0.1, rootMargin: "0px 0px -10% 0px" } // Softer trigger for smoother transitions
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

      let lastTime = 0;
      const fps = 30; // Stabilized framerate
      const interval = 1000 / fps;

      const draw = (timestamp: number) => {
         requestRef.current = requestAnimationFrame(draw);

         const delta = timestamp - lastTime;
         if (delta < interval) return;
         lastTime = timestamp - (delta % interval);

         ctx.fillStyle = "rgba(9, 9, 11, 0.05)";
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.font = fontSize + "px 'JetBrains Mono', monospace";

         const beamX = mousePos.x;
         const beamY = mousePos.y;
         const radius = 400;

         for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            let alpha = 0.02; // Reduced baseline for professional feel
            if (!isMobile) {
               const dx = x - beamX;
               const dy = y - beamY;
               const dist = Math.sqrt(dx * dx + dy * dy);
               if (dist < radius) {
                  const intensity = 1 - (dist / radius);
                  alpha = Math.max(alpha, intensity * 0.4); // Softer beam
               }
            }

            ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
            ctx.fillText(char, x, y);

            if (y > canvas.height && Math.random() > 0.995) drops[i] = 0; // Much slower reset
            drops[i] += 0.5; // Half speed falling
         }
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
         <Loader2 className="w-8 h-8 text-maroon animate-spin" />
      </div>
   );

   return (
      <PublicLayout>
         <div
            className="bg-black text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-maroon selection:text-white"
            onMouseMove={handleMouseMove}
         >

            {/* MATRIX BACKGROUND */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
               <MatrixBackground color="rgba(128, 0, 0, 0.2)" speed={1.1} />
            </div>

            {/* Hero Section - The First Impression */}
            <section id="hero" className="relative z-10 pt-40 pb-24 md:pt-48 md:pb-64 px-6 max-w-7xl mx-auto w-full min-h-[90vh] flex items-center">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32 items-center w-full">

                  <div className="lg:col-span-12 xl:col-span-12 text-center lg:text-left space-y-12 animate-fade-in-up">
                     <div className="space-y-10 group/hero-text">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-gentle"></div>
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] font-mono italic">Protocol_Handshake_Status: v2.8_Operational</span>
                        </div>

                        <div className="space-y-6">
                           <h1 className="text-4xl sm:text-7xl md:text-[8rem] lg:text-[11rem] font-black text-white tracking-[-0.05em] uppercase leading-[0.8] transition-all duration-[1500ms] group-hover/hero-text:tracking-[-0.02em] perspective-1000">
                              <span className="inline-block animate-fade-in-up" style={{ animationDelay: '200ms' }}>Argus</span><br />
                              <span className="text-maroon inline-block animate-fade-in-up" style={{ animationDelay: '400ms' }}>Protocol.</span>
                           </h1>
                        </div>

                        <p className="text-zinc-500 text-lg md:text-2xl font-medium max-w-3xl mx-auto lg:mx-0 leading-relaxed text-pretty opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                           {content.hero.subtitle}
                        </p>
                     </div>

                     <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 pt-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                        <button onClick={() => navigate('/login')} className="btn-premium-maroon w-full sm:w-auto hover:scale-105 transition-transform">
                           {content.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
                        </button>
                        <Link to="/whitepaper" className="btn-premium w-full sm:w-auto hover:scale-105 transition-transform">
                           {content.hero.ctaSecondary} <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:translate-x-1" />
                        </Link>
                     </div>

                     {/* Institutional Proof Metrics */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-16 border-t border-white/[0.03]">
                        {[
                           { label: 'Network Hashrate', value: '402.4 PH/s' },
                           { label: 'Active Validators', value: liveValidators.toLocaleString() },
                           { label: 'Block Latency', value: '0.4s' },
                           { label: 'Market Cap Circ', value: '$842.1M' }
                        ].map((stat, i) => (
                           <div key={i} className="space-y-2 group/stat">
                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono group-hover/stat:text-maroon transition-colors">{stat.label}</p>
                              <p className="text-2xl font-black text-white group-hover/stat:translate-x-1 transition-transform">{stat.value}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </section>

            <section id="partners" className={`relative z-10 py-12 md:py-24 border-t border-zinc-900/50 bg-black/40 backdrop-blur-md transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) ${visibleSections.has('partners') ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
               <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                  <p className="text-[10px] font-black text-zinc-600 mb-8 md:mb-12 uppercase tracking-[0.5em] font-mono animate-pulse-gentle">{content.partners.title}</p>
                  <div className="flex flex-wrap justify-center gap-x-8 gap-y-8 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-1000">
                     {content.partners.items.map((name, i) => (
                        <h3 key={i} style={{ transitionDelay: `${i * 100}ms` }} className={`text-xs md:text-xl font-black text-white hover:text-maroon uppercase tracking-tighter transition-all duration-700 cursor-default ${visibleSections.has('partners') ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-sm translate-y-8'}`}>{name.replace('_', ' ')}</h3>
                     ))}
                  </div>
               </div>
            </section>

            {/* Features Index - Precise Visual Grid */}
            {content.features?.isVisible && (
               <section id="features" className="py-32 md:py-64 px-6 max-w-7xl mx-auto relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-end">
                     <div className={`lg:col-span-8 space-y-8 transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                        <div className="flex items-center gap-3 text-maroon">
                           <Zap className="w-5 h-5 animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.6em] font-mono">Infrastructure_Core</span>
                        </div>
                        <h2 className="text-4xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.8]">{content.features.title}</h2>
                     </div>
                     <div className={`lg:col-span-4 transition-all duration-1000 delay-300 ${visibleSections.has('features') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                        <p className="text-zinc-500 text-lg md:text-2xl leading-relaxed font-medium pb-2 border-l-4 border-maroon pl-10 text-pretty italic">
                           {content.features.description}
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                     {content.features.items.map((item, i) => {
                        const Icon = IconMap[item.icon] || Globe;
                        return (
                           <div key={i} className={`group p-12 rounded-[2.5rem] silk-panel border-white/[0.03] hover:border-maroon/20 relative overflow-hidden transition-all duration-700 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                 <Icon className="w-32 h-32 text-white" />
                              </div>
                              <div className="relative z-10">
                                 <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-maroon hover:scale-110 transition-all duration-700">
                                    <Icon className="w-7 h-7 text-maroon group-hover:text-white transition-colors duration-700" />
                                 </div>
                                 <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">{item.title}</h3>
                                 <p className="text-sm text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors duration-700">{item.desc}</p>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </section>
            )}

            {/* Architecture Section - Institutional Engineering */}
            {content.architecture.isVisible && (
               <section id="architecture" className="py-32 md:py-64 px-6 max-w-7xl mx-auto relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                     <div className={`space-y-12 transition-all duration-1000 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                        <div className="space-y-8">
                           <div className="flex items-center gap-3 text-maroon">
                              <Layers className="w-5 h-5" />
                              <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono">Structural_Integrity</span>
                           </div>
                           <h2 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                              {content.architecture.title}
                           </h2>
                           <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-lg font-medium border-l-2 border-zinc-900 pl-8">
                              {content.architecture.description}
                           </p>
                        </div>
                        <div className="space-y-10">
                           {content.architecture.layers.map((layer, i) => (
                              <div key={i} style={{ transitionDelay: `${300 + (i * 150)}ms` }} className={`flex gap-8 group transition-all duration-700 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                                 <div className="w-16 h-16 border border-zinc-900 bg-zinc-950 flex items-center justify-center rounded-2xl shrink-0 group-hover:border-maroon/50 group-hover:bg-zinc-900 transition-all duration-500">
                                    <span className="text-zinc-800 group-hover:text-maroon font-black text-xl transition-colors">0{i + 1}</span>
                                 </div>
                                 <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-maroon transition-colors">{layer.title}</h4>
                                    <p className="text-zinc-500 text-sm leading-relaxed font-medium">{layer.desc}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className={`relative hidden lg:block transition-all duration-1000 delay-300 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                        <div className="absolute inset-0 bg-maroon/5 blur-[150px] rounded-full"></div>
                        <div className="relative border border-white/[0.03] bg-black/40 backdrop-blur-3xl rounded-[3rem] p-16 space-y-12 shadow-2xl">
                           <div className="h-32 bg-maroon/[0.03] border border-maroon/10 rounded-3xl flex items-center justify-center group hover:bg-maroon/[0.06] transition-all duration-700">
                              <span className="text-[11px] font-mono font-black text-maroon uppercase tracking-[0.4em] animate-pulse-gentle">Secure_Parallel_Compute</span>
                           </div>
                           <div className="grid grid-cols-2 gap-8">
                              <div className="h-48 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-maroon/30 transition-all duration-700 shadow-xl">
                                 <Cpu className="w-8 h-8 text-zinc-700 group-hover:text-maroon group-hover:scale-110 transition-all duration-700" />
                                 <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">Logic_Kernel</span>
                              </div>
                              <div className="h-48 bg-zinc-950 border border-zinc-900 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-maroon/30 transition-all duration-700 shadow-xl">
                                 <Database className="w-8 h-8 text-zinc-700 group-hover:text-maroon group-hover:scale-110 transition-all duration-700" />
                                 <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">State_Archive</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>
            )}

            {/* ENHANCED ROADMAP SECTION - Precision Timeline */}
            {content.roadmap?.isVisible && (
               <section id="roadmap" className="py-48 md:py-96 relative z-10 overflow-hidden bg-zinc-950/20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.03)_0%,transparent_70%)] opacity-50"></div>

                  <div className="max-w-7xl mx-auto px-6 relative z-10">
                     <div className={`max-w-4xl mb-32 transition-all duration-1000 ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <div className="flex items-center gap-3 text-maroon mb-8">
                           <Milestone className="w-5 h-5" />
                           <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono">Evolutionary_Trajectory</span>
                        </div>
                        <h2 className="text-5xl md:text-9xl font-black text-white uppercase tracking-tighter mb-10 leading-[0.85]">{content.roadmap.title}</h2>
                        <p className="text-zinc-500 text-lg md:text-2xl leading-relaxed font-medium max-w-2xl">{content.roadmap.description}</p>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {content.roadmap.phases.map((phase, i) => (
                           <div
                              key={i}
                              className={`relative group bg-zinc-950/40 border border-white/[0.03] p-10 rounded-[2.5rem] hover:border-maroon/30 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(185,28,28,0.15)] group hover:bg-zinc-900/40 overflow-hidden ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                              style={{ transitionDelay: `${i * 150}ms` }}
                           >
                              <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                              <div className="flex items-center justify-between mb-12">
                                 <span className="text-[10px] font-mono font-black text-maroon uppercase tracking-[0.3em] px-3 py-1 bg-maroon/5 rounded-full border border-maroon/10">
                                    Phase 0{phase.phase}
                                 </span>
                                 {phase.status === 'LIVE' && (
                                    <div className="flex items-center gap-2">
                                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                       <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest font-mono">LIVE</span>
                                    </div>
                                 )}
                              </div>

                              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-maroon transition-all duration-500 group-hover:translate-x-2">{phase.title}</h3>
                              <p className="text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] mb-10 font-mono italic opacity-60 group-hover:opacity-100 transition-opacity">{phase.period}</p>

                              <div className="space-y-4 mb-12">
                                 {phase.features.slice(0, 3).map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-3 group/feat">
                                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/feat:bg-maroon transition-colors"></div>
                                       <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide group-hover:text-zinc-300 transition-colors">{feat}</span>
                                    </div>
                                 ))}
                              </div>

                              <div className="absolute bottom-10 right-10">
                                 <span className="text-7xl font-black text-white/[0.02] group-hover:text-maroon/[0.05] transition-all duration-700 select-none">0{phase.phase}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>
            )}

            {/* FAQ Section - Institutional Knowledge Base */}
            {content.faq.isVisible && (
               <section id="faq" className="py-32 md:py-64 px-6 max-w-4xl mx-auto relative z-10 border-t border-white/[0.02]">
                  <div className="text-center space-y-6 mb-24">
                     <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono text-maroon">Inquiry_Archive</span>
                     <h2 className={`text-4xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none transition-all duration-1000 ${visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{content.faq.title}</h2>
                  </div>

                  <div className="space-y-4">
                     {content.faq.items.map((item, i) => (
                        <div key={i} style={{ transitionDelay: `${i * 100}ms` }} className={`border border-white/[0.03] bg-zinc-950/40 backdrop-blur-3xl rounded-[2rem] overflow-hidden hover:border-maroon/20 hover:bg-zinc-950/60 transition-all duration-700 ${visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                           <button
                              onClick={() => toggleFaq(i)}
                              className="w-full flex items-center justify-between p-8 md:p-10 text-left transition-colors"
                           >
                              <span className="font-black text-white text-xs md:text-sm uppercase tracking-[0.1em] pr-4">{item.q}</span>
                              <div className={`p-2 rounded-full border border-zinc-800 transition-all duration-500 ${openFaq === i ? 'rotate-180 bg-maroon border-maroon' : ''}`}>
                                 <Plus className={`w-4 h-4 text-zinc-500 transition-all duration-500 ${openFaq === i ? 'rotate-45 text-white' : ''} shrink-0`} />
                              </div>
                           </button>
                           <div
                              className={`grid transition-all duration-700 ease-in-out-expo ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                           >
                              <div className="overflow-hidden">
                                 <div className="p-8 md:p-10 pt-0 text-zinc-500 text-sm md:text-base leading-relaxed font-medium border-t border-white/[0.02] mt-2">
                                    {item.a}
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            )}

            {/* CTA Section - The Vault Entry */}
            {content.cta.isVisible && (
               <section id="cta" className={`py-48 md:py-96 relative z-10 overflow-hidden bg-black/40 transition-all duration-1000 ease-out ${visibleSections.has('cta') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.05)_0%,transparent_80%)]"></div>

                  <div className="max-w-7xl mx-auto px-6 text-center space-y-16 md:space-y-24 relative z-10">
                     <div className="space-y-12">
                        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-black/60 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl">
                           <Zap className="w-5 h-5 text-maroon animate-pulse" />
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] font-mono">System_Status: Awaiting_Auth_Token</span>
                        </div>

                        <h2 className="text-5xl sm:text-7xl md:text-[8rem] lg:text-[11rem] font-black text-white uppercase tracking-tighter leading-[0.8] transition-all duration-1000 hover:tracking-tight">
                           {content.cta.title}
                        </h2>

                        <p className="text-zinc-500 text-lg md:text-3xl max-w-3xl mx-auto leading-relaxed font-medium">
                           {content.cta.description}
                        </p>
                     </div>

                     <div className="flex flex-col items-center gap-12">
                        <button onClick={() => navigate('/login')} className="btn-premium-maroon h-20 md:h-28 px-12 md:px-24 text-[12px] md:text-[14px]">
                           {content.cta.buttonText}
                           <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-4 transition-transform duration-700" />
                        </button>
                        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] font-mono">End_To_End_Enrypted_Infrastructure</p>
                     </div>
                  </div>
               </section>
            )}
         </div>
      </PublicLayout>
   );
};

export default Landing;
