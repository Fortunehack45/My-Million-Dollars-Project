
import React, { useState, useEffect, useRef } from 'react';
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
  Play
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
  
  const [logs, setLogs] = useState<Array<{id: number, time: string, prefix: string, msg: string, status: string, level: 'info' | 'warn' | 'crit'}>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    const getLogTime = () => new Date().toISOString().split('T')[1].slice(0, 8);

    setLogs([
       { id: 1, time: getLogTime(), prefix: "SYS", msg: "KERNEL_INIT_SUCCESS", status: "OK", level: 'info' },
       { id: 2, time: getLogTime(), prefix: "NET", msg: "ESTABLISHING_TLS_TUNNEL", status: "PENDING", level: 'warn' },
       { id: 3, time: getLogTime(), prefix: "SEC", msg: "SHIELD_PROTOCOL_ACTIVE", status: "SECURE", level: 'info' },
    ]);
    const verbs = ["ALLOCATING", "HASHING", "SYNCING", "VERIFYING", "CONNECTING", "BROADCASTING", "COMPRESSING", "INDEXING"];
    const nouns = ["BLOCK_HEADER", "MEMPOOL_BUFFER", "PEER_NODE", "DAG_TOPOLOGY", "SHARDED_STATE", "ZK_PROOF", "EXECUTION_LAYER"];
    
    const interval = setInterval(() => {
      setLogs(prev => {
        const id = Date.now();
        const time = getLogTime();
        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const hash = "0x" + Math.random().toString(16).substr(2, 6).toUpperCase();
        const isCrit = Math.random() > 0.90;
        
        const newLog: {
          id: number;
          time: string;
          prefix: string;
          msg: string;
          status: string;
          level: 'info' | 'warn' | 'crit';
        } = { 
          id, 
          time,
          prefix: isCrit ? "CRIT" : "PROC", 
          msg: `${verb}_${noun} [${hash}]`, 
          status: isCrit ? "RETRIEVING" : "SUCCESS",
          level: isCrit ? 'crit' : 'info'
        };
        
        const newLogs = [...prev, newLog];
        // Keep logs list manageable, fill from top
        if (newLogs.length > 18) return newLogs.slice(newLogs.length - 18);
        return newLogs;
      });
    }, 400); // Faster logging for "live" feel
    return () => clearInterval(interval);
  }, []);

  // ARCHITECTURE STYLE MATRIX RAIN (PRIMARY COLOR)
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
      // Dark background with slight trail for smooth fade
      ctx.fillStyle = "rgba(9, 9, 11, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px 'JetBrains Mono'`;
      const fadeSize = canvas.height * 0.25;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Vertical Edge Fading
        let verticalOpacity = 1;
        if (y < fadeSize) {
          verticalOpacity = y / fadeSize;
        } else if (y > canvas.height - fadeSize) {
          verticalOpacity = (canvas.height - y) / fadeSize;
        }
        verticalOpacity = Math.max(verticalOpacity, 0);

        // Primary Color (Architecture Style) - #F43F5E (RGB: 244, 63, 94)
        ctx.fillStyle = `rgba(244, 63, 94, ${verticalOpacity * 0.5})`;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.98) {
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
    <div className="bg-black text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white">
      
      {/* GLOBAL MATRIX BACKGROUND SYSTEM */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        <canvas ref={canvasRef} className="absolute inset-0" />
        {/* Subtle Atmospheric Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.08),transparent_80%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.9),transparent_20%,transparent_80%,rgba(0,0,0,0.9))]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-40 px-6 max-w-7xl mx-auto w-full min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          
          <div className="lg:col-span-7 space-y-12 animate-fade-in-up">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                 <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Genesis_Epoch_Active</span>
              </div>
              
              <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85] drop-shadow-2xl">
                {content.hero.title}
              </h1>
              
              <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                {content.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
              <button onClick={login} className="w-full sm:w-auto px-12 py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(244,63,94,0.4)] hover:shadow-[0_0_60px_rgba(244,63,94,0.6)] flex items-center justify-center gap-3 rounded-xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">{content.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <Link to="/whitepaper" className="w-full sm:w-auto px-12 py-6 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 text-[12px] font-black text-white uppercase tracking-[0.2em] hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-3 rounded-xl group">
                {content.hero.ctaSecondary} <Code2 className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-12 pt-12 border-t border-zinc-800/50 animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
              {[
                { val: '40+', label: 'Regions' },
                { val: '12ms', label: 'Latency' },
                { val: '24k', label: 'Nodes' }
              ].map((stat, i) => (
                <div key={i} className="group">
                  <p className="text-3xl md:text-5xl font-mono font-bold text-white tracking-tighter group-hover:text-primary transition-colors">{stat.val}</p>
                  <p className="text-[9px] font-black text-zinc-600 uppercase mt-2 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Terminal UI - IMPROVED & ANIMATED */}
          <div className="lg:col-span-5 relative mt-12 lg:mt-0 animate-fade-in-right opacity-0" style={{ animationDelay: '0.5s' }}>
             <div className="relative bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/5 group hover:shadow-[0_50px_100px_-20px_rgba(244,63,94,0.1)] transition-shadow duration-500">
                {/* OS Header */}
                <div className="bg-zinc-900/90 px-5 py-4 flex items-center justify-between border-b border-zinc-800">
                   <div className="flex gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
                      <TerminalIcon className="w-3 h-3" />
                      <span>argus_daemon --v2.4</span>
                   </div>
                   <div className="flex gap-3 opacity-50">
                      <Minus className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer" />
                      <Maximize2 className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer" />
                      <X className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer" />
                   </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center gap-6 px-5 py-2.5 bg-black/40 border-b border-zinc-900 text-[9px] font-mono font-bold uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                      <span className="text-zinc-600">CPU:</span>
                      <span className="text-primary animate-pulse">{Math.floor(Math.random() * 20 + 5)}%</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-zinc-600">MEM:</span>
                      <span className="text-emerald-500">2.4GB</span>
                   </div>
                   <div className="ml-auto flex items-center gap-2 text-zinc-700">
                      <span>ROOT: TRUE</span>
                   </div>
                </div>
                
                {/* Log Feed */}
                <div className="p-6 font-mono text-[11px] h-[380px] flex flex-col justify-start gap-3 overflow-hidden relative">
                   {/* Scanline Overlay */}
                   <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none z-10 animate-scanline opacity-30"></div>
                   
                   {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 animate-slide-in-bottom">
                         <span className="text-zinc-700 shrink-0 select-none font-medium text-[9px] pt-0.5 opacity-60">[{log.time}]</span>
                         <span className={`font-black shrink-0 w-12 ${
                            log.level === 'crit' ? 'text-primary' : 
                            log.level === 'warn' ? 'text-amber-500' : 'text-emerald-500'
                         }`}>
                            {log.prefix}
                         </span>
                         <span className="text-zinc-400 flex-1 truncate font-medium">{log.msg}</span>
                      </div>
                   ))}
                   {/* Active Cursor Line at bottom */}
                   <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center gap-2">
                      <span className="text-primary font-black text-lg leading-none">{'>'}</span>
                      <span className="text-zinc-500 font-bold tracking-wider">awaiting_operator_signal</span>
                      <div className="w-2 h-4 bg-primary animate-pulse"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Partners Section with Hover Reveal */}
      <section className="relative z-10 py-32 border-t border-zinc-900/50 bg-black/40 backdrop-blur-md">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-zinc-600 mb-16 uppercase tracking-[0.3em] animate-fade-in">{content.partners.title}</p>
            <div className="flex flex-wrap justify-center gap-16 md:gap-32">
               {content.partners.items.map((name, i) => (
                  <h3 key={i} className="text-xl md:text-2xl font-black text-zinc-800 hover:text-white uppercase tracking-tighter transition-all duration-500 cursor-default scale-100 hover:scale-110">
                    {name.replace('_', ' ')}
                  </h3>
               ))}
            </div>
         </div>
      </section>

      {/* Architecture Section */}
      {content.architecture.isVisible && (
        <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-12">
                 <div className="space-y-6">
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                       {content.architecture.title}
                    </h2>
                    <p className="text-zinc-500 text-lg md:text-xl leading-relaxed max-w-lg">
                       {content.architecture.description}
                    </p>
                 </div>
                 
                 <div className="space-y-8">
                    {content.architecture.layers.map((layer, i) => (
                       <div key={i} className="flex gap-8 group p-6 rounded-2xl hover:bg-zinc-900/30 transition-all border border-transparent hover:border-zinc-800/50">
                          <div className="w-16 h-16 border border-zinc-800 bg-zinc-900/30 backdrop-blur-md flex items-center justify-center rounded-2xl shrink-0 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all shadow-lg">
                             <Layers className="w-7 h-7 text-zinc-600 group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                             <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{layer.title}</h4>
                             <p className="text-zinc-500 text-sm leading-relaxed">{layer.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="relative animate-float">
                 <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full"></div>
                 <div className="relative border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl rounded-[3rem] p-12 space-y-8 shadow-2xl">
                    <div className="h-28 bg-primary/5 border border-primary/20 rounded-3xl flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
                       <span className="relative z-10 text-[11px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Compute_Sharding_Layer</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="h-48 bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-zinc-600 transition-colors">
                          <Cpu className="w-8 h-8 text-zinc-600 group-hover:text-white transition-colors" />
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Execution_Engine</span>
                       </div>
                       <div className="h-48 bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-zinc-600 transition-colors">
                          <Database className="w-8 h-8 text-zinc-600 group-hover:text-white transition-colors" />
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Persistence_Core</span>
                       </div>
                    </div>
                    <div className="h-24 bg-zinc-900/60 border border-zinc-800 rounded-3xl flex items-center justify-center">
                       <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Consensus_Protocol_vRC1</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* FAQ Section */}
      {content.faq.isVisible && (
        <section className="py-24 md:py-32 px-6 max-w-4xl mx-auto relative z-10 border-t border-zinc-900/50">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-16 text-center">{content.faq.title}</h2>
           <div className="space-y-4">
              {content.faq.items.map((item, i) => (
                 <div key={i} className="border border-zinc-900 bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
                    <button 
                       onClick={() => toggleFaq(i)}
                       className="w-full flex items-center justify-between p-8 text-left hover:bg-zinc-900/20 transition-colors"
                    >
                       <span className="font-bold text-white text-sm uppercase tracking-wide pr-8">{item.q}</span>
                       <Plus className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${openFaq === i ? 'rotate-45 text-primary' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                       <div className="p-8 pt-0 text-zinc-500 text-sm leading-relaxed border-t border-zinc-900/50 mt-2">
                          {item.a}
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </section>
      )}

      {/* CTA Section */}
      {content.cta.isVisible && (
        <section className="py-48 border-t border-zinc-900 relative z-10 overflow-hidden bg-black/40 backdrop-blur-xl">
           <div className="max-w-5xl mx-auto px-6 text-center space-y-16">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full">
                   <Zap className="w-4 h-4 text-primary animate-pulse" />
                   <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest font-mono">Status: Awaiting_Handshake</span>
                </div>

                <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                   {content.cta.title}
                </h2>
                
                <p className="text-zinc-500 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
                   {content.cta.description}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-8 pt-6">
                 <button onClick={login} className="h-28 px-24 bg-primary text-white text-[13px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_20px_80px_rgba(244,63,94,0.4)] hover:shadow-[0_0_120px_rgba(244,63,94,0.8)] hover:-translate-y-2 active:translate-y-0 flex items-center gap-6 group relative overflow-hidden">
                    <span className="relative z-10">{content.cta.buttonText}</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-500 relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
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
