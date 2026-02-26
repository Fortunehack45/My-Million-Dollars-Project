
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
               <TerminalIcon className="w-3 h-3" /> Core_Sytem_Interface
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
         { threshold: 0.15 } // Increased threshold slightly for better trigger point
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
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
               <canvas ref={canvasRef} className="absolute inset-0" />
               <div
                  className="absolute w-[600px] h-[600px] bg-maroon/5 blur-[120px] rounded-full will-change-transform pointer-events-none transition-transform duration-75 ease-out hidden md:block"
                  style={{ transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)` }}
               />
            </div>

            {/* Hero Section */}
            <section id="hero" className="relative z-10 pt-28 pb-16 md:pt-32 md:pb-48 px-4 md:px-6 max-w-7xl mx-auto w-full min-h-[auto] md:min-h-[85vh] flex items-center">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-center w-full">

                  <div className="lg:col-span-7 space-y-8 md:space-y-12 animate-fade-in-up relative z-20 will-change-transform">
                     <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-full animate-fade-in opacity-0 will-change-transform" style={{ animationDelay: '0.2s' }}>
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em]">Protocol Status: Active</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[6.4rem] xl:text-[7.2rem] font-black text-white tracking-[-0.05em] uppercase leading-[0.85] text-balance break-words animate-fade-in-up opacity-0 lg:will-change-premium" style={{ animationDelay: '0.2s' }}>
                           Argus<br />Protocol
                        </h1>

                        <div className="flex items-center gap-4 animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                           <div className="w-8 h-px bg-maroon/50"></div>
                           <h2 className="text-[10px] md:text-xs font-black text-maroon uppercase tracking-[0.4em] italic">The Parallel Protocol</h2>
                        </div>

                        <p className="text-zinc-400 text-sm md:text-xl font-medium max-w-xl leading-relaxed animate-fade-in opacity-0 text-pretty" style={{ animationDelay: '0.4s' }}>
                           {content.hero.subtitle}
                        </p>
                     </div>

                     {/* Mobile Status Card (Visible only on small screens) */}
                     <div className="block lg:hidden">
                        <MobileStatusCard />
                     </div>

                     <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 animate-fade-in opacity-0 will-change-premium" style={{ animationDelay: '0.6s' }}>
                        <button onClick={() => navigate('/login')} className="btn-premium-maroon text-[10px]">
                           <span className="relative z-10 flex items-center gap-3">{content.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                        </button>
                        <Link to="/whitepaper" className="btn-premium text-[10px]">
                           {content.hero.ctaSecondary} <Code2 className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                        </Link>
                     </div>
                  </div>


                  {/* Hero Right — Terminal UI */}
                  <div className="lg:col-span-5 relative mt-8 lg:mt-0 animate-fade-in-right opacity-0 hidden lg:block" style={{ animationDelay: '0.4s' }}>
                     {/* Live validator badge */}
                     <div className="absolute -top-5 -right-2 z-20 flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-full shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse"></span>
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{liveValidators.toLocaleString()} Live Validators</span>
                     </div>
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
                        <h3 key={name} style={{ transitionDelay: `${i * 100}ms` }} className={`text-xs md:text-lg font-black text-white uppercase tracking-tighter transition-all duration-700 ${visibleSections.has('partners') ? 'opacity-100 blur-0 translate-y-0' : 'opacity-0 blur-sm translate-y-4'}`}>{name.replace('_', ' ')}</h3>
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
                           <div key={item.title} style={{ transitionDelay: `${i * 150}ms` }} className={`p-10 md:p-12 rounded-[2.5rem] silk-panel hover:-translate-y-2 group ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                              <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center mb-8 group-hover:bg-maroon/10 group-hover:border-maroon/20 transition- silk-transition">
                                 <Icon className="w-8 h-8 text-zinc-500 group-hover:text-maroon transition-silk" />
                              </div>
                              <h3 className="text-xl md:text-2xl font-black text-white mb-4 uppercase tracking-tight">{item.title}</h3>
                              <p className="text-sm md:text-base text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-silk">{item.desc}</p>
                           </div>
                        )
                     })}
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
                              <div key={layer.title} style={{ transitionDelay: `${300 + (i * 150)}ms` }} className={`flex gap-6 md:gap-8 group transition-all duration-700 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                                 <div className="w-12 h-12 md:w-16 md:h-16 border border-zinc-800 bg-zinc-900/30 backdrop-blur-md flex items-center justify-center rounded-2xl shrink-0 group-hover:border-maroon/50 transition-colors">
                                    <Layers className="w-6 h-6 md:w-7 md:h-7 text-zinc-600 group-hover:text-maroon transition-colors" />
                                 </div>
                                 <div>
                                    <h4 className="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-maroon transition-colors">{layer.title}</h4>
                                    <p className="text-zinc-500 text-xs md:text-sm leading-relaxed">{layer.desc}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className={`relative animate-float hidden lg:block transition-all duration-1000 delay-300 ${visibleSections.has('architecture') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                        <div className="absolute inset-0 bg-maroon/10 blur-[150px] rounded-full"></div>
                        <div className="relative border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl rounded-[2.5rem] p-12 space-y-10 shadow-2xl">
                           <div className="h-24 bg-maroon/5 border border-maroon/20 rounded-2xl flex items-center justify-center">
                              <span className="text-[10px] font-mono font-bold text-maroon uppercase tracking-[0.2em]">Compute_Sharding_Layer</span>
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
               <section id="roadmap" className="py-24 md:py-32 relative z-10 overflow-hidden">
                  {/* Background decorative elements for roadmap */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-full bg-maroon/5 blur-[100px] pointer-events-none"></div>

                  <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
                     <div className={`text-center max-w-3xl mx-auto mb-20 md:mb-32 transition-all duration-1000 ${visibleSections.has('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full mb-6 backdrop-blur-md">
                           <Milestone className="w-3 h-3 text-maroon" />
                           <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Execution Timeline</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-[0.9]">{content.roadmap.title}</h2>
                        <p className="text-zinc-400 text-sm md:text-lg leading-relaxed">{content.roadmap.description}</p>
                     </div>

                     <div className="relative">
                        {/* Central Spine */}
                        <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 md:translate-x-0 bg-zinc-800/50">
                           {/* Animated Beam Fill - Triggered by scroll visibility */}
                           <div
                              className="absolute top-0 left-0 w-full bg-gradient-to-b from-transparent via-primary to-transparent transition-all duration-[2500ms] ease-out-expo"
                              style={{ height: visibleSections.has('roadmap') ? '100%' : '0%' }}
                           ></div>
                        </div>

                        <div className="space-y-12 md:space-y-32">
                           {content.roadmap.phases.map((phase, i) => {
                              const isEven = i % 2 === 0;
                              return (
                                 <div
                                    key={phase.phase}
                                    className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-24 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} group`}
                                 >
                                    {/* Desktop Connector Line - Grows outwards */}
                                    <div
                                       className={`hidden md:block absolute top-12 ${isEven ? 'left-1/2' : 'right-1/2'} h-px bg-gradient-to-r from-maroon/40 to-transparent transition-all duration-1000 ease-out`}
                                       style={{
                                          width: visibleSections.has('roadmap') ? '3rem' : '0',
                                          transitionDelay: `${i * 300 + 500}ms`
                                       }}
                                    >
                                       <div className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-maroon rounded-full shadow-[0_0_5px_#800000] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>

                                    {/* Central Node */}
                                    <div className="absolute left-[19px] md:left-1/2 -translate-x-1/2 top-0 md:top-8 z-10 flex flex-col items-center justify-center">
                                       <div
                                          className={`w-3 h-3 md:w-4 md:h-4 bg-zinc-950 border-2 ${phase.status === 'LIVE' ? 'border-maroon shadow-[0_0_15px_#800000]' : 'border-zinc-700'} rotate-45 transition-all duration-500 group-hover:scale-125 group-hover:border-white z-20`}
                                          style={{
                                             transitionDelay: `${i * 300}ms`,
                                             opacity: visibleSections.has('roadmap') ? 1 : 0,
                                             transform: visibleSections.has('roadmap') ? 'rotate(45deg) scale(1)' : 'rotate(0deg) scale(0)'
                                          }}
                                       ></div>
                                    </div>

                                    {/* Spacer for desktop layout balance */}
                                    <div className="hidden md:block w-1/2"></div>

                                    {/* Content Card - Staggered Slide In */}
                                    <div
                                       className={`w-full md:w-1/2 pl-12 md:pl-0 transition-all duration-1000 ease-out-expo`}
                                       style={{
                                          transitionDelay: `${i * 300 + 200}ms`,
                                          opacity: visibleSections.has('roadmap') ? 1 : 0,
                                          transform: visibleSections.has('roadmap') ? 'translateX(0)' : `translateX(${isEven ? '50px' : '-50px'})`
                                       }}
                                    >
                                       <div className="relative bg-zinc-950/80 backdrop-blur-sm border border-zinc-900 p-8 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-maroon/5 hover:-translate-y-1">

                                          {/* Large Background Watermark - High End Branding */}
                                          <div className="absolute -right-4 -top-6 font-bold text-[8rem] md:text-[10rem] text-white/[0.02] select-none pointer-events-none transition-transform duration-700 group-hover:scale-105 group-hover:text-white/[0.04]">
                                             0{phase.phase}
                                          </div>

                                          {/* Top Bar */}
                                          <div className="flex items-center justify-between mb-6 relative z-10">
                                             <span className="text-[10px] font-mono font-bold text-maroon uppercase tracking-widest px-2 py-1 bg-maroon/10 rounded border border-maroon/20">
                                                Phase {phase.phase}
                                             </span>
                                             {phase.status === 'LIVE' && (
                                                <div className="flex items-center gap-2">
                                                   <span className="relative flex h-2 w-2">
                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                   </span>
                                                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Protocol</span>
                                                </div>
                                             )}
                                             {phase.status !== 'LIVE' && (
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded">{phase.status}</span>
                                             )}
                                          </div>

                                          {/* Title & Desc */}
                                          <div className="relative z-10 mb-8">
                                             <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-maroon transition-colors duration-300">{phase.title}</h3>
                                             <p className="font-mono text-xs text-zinc-500 mb-4">{phase.period}</p>
                                             <p className="text-sm text-zinc-400 leading-relaxed">{phase.desc}</p>
                                          </div>

                                          {/* Features */}
                                          <div className="space-y-3 relative z-10 border-t border-zinc-900 pt-6">
                                             {phase.features.map((feat, idx) => (
                                                <div key={feat} className="flex items-start gap-3 group/item">
                                                   <div className={`mt-1 w-1.5 h-1.5 rounded-full ${phase.status === 'LIVE' ? 'bg-maroon' : 'bg-zinc-700'} group-hover/item:scale-150 transition-transform`}></div>
                                                   <span className="text-xs font-medium text-zinc-300 group-hover/item:text-white transition-colors">{feat}</span>
                                                </div>
                                             ))}
                                          </div>

                                          {/* Decorative Corner */}
                                          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-zinc-900/50 to-transparent"></div>
                                          <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                                       </div>
                                    </div>
                                 </div>
                              )
                           })}
                        </div>
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
                           <Zap className="w-4 h-4 text-maroon animate-pulse" />
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
                        <button onClick={() => navigate('/login')} className="h-14 md:h-24 px-8 md:px-20 bg-maroon text-white text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_20px_80px_rgba(128,0,0,0.4)] hover:shadow-[0_0_100px_rgba(128,0,0,0.7)] hover:-translate-y-2 flex items-center gap-4 group">
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
