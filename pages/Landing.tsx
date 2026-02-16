
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
  Plus
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
  
  const [logs, setLogs] = useState<Array<{id: number, prefix: string, msg: string, status: string, level: 'info' | 'warn' | 'crit'}>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    setLogs([
       { id: 1, prefix: "SYS", msg: "KERNEL_INIT_SUCCESS", status: "OK", level: 'info' },
       { id: 2, prefix: "NET", msg: "ESTABLISHING_TLS_TUNNEL", status: "PENDING", level: 'warn' },
       { id: 3, prefix: "SEC", msg: "SHIELD_PROTOCOL_ACTIVE", status: "SECURE", level: 'info' },
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
        const newLog = { 
          id, 
          prefix: isCrit ? "CRIT" : "PROC", 
          msg: `${verb}_${noun} [${hash}]`, 
          status: isCrit ? "RETRIEVING" : "SUCCESS",
          level: isCrit ? 'crit' : 'info'
        };
        const newLogs = [...prev, newLog];
        return newLogs.slice(-10);
      });
    }, 700);
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
        const next = { x: prev.x + dx * ease, y: prev.y + dy * ease };
        beamRef.current = next; 
        return next;
      });
      animationFrameId = requestAnimationFrame(animateBeam);
    };
    animateBeam();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // PROFESSIONAL GLOBAL MATRIX RAIN (ARCHITECTURE STYLE)
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
      // Background trail for deep black aesthetic
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px 'JetBrains Mono'`;
      const fadeSize = canvas.height * 0.25;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Vertical Edge Fading (Architecture Style)
        let verticalOpacity = 1;
        if (y < fadeSize) {
          verticalOpacity = y / fadeSize;
        } else if (y > canvas.height - fadeSize) {
          verticalOpacity = (canvas.height - y) / fadeSize;
        }
        verticalOpacity = Math.max(verticalOpacity, 0);

        // Matrix rain is pure WHITE with subtle primary rose tinting in architecture style
        // Here we keep it White as previously requested but with the global Architecture behavior
        ctx.fillStyle = `rgba(255, 255, 255, ${verticalOpacity * 0.4})`;
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
    <div 
      className="bg-black text-zinc-100 flex flex-col relative overflow-x-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* GLOBAL MATRIX BACKGROUND SYSTEM */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {/* Atmospheric Grain Overlay */}
           <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
           </div>

           {/* Cursor-Following Dissolved Glowing Accents (Not revealers anymore) */}
           <div 
             className="absolute w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full will-change-transform opacity-30"
             style={{ transform: `translate3d(${beamPos.x - 400}px, ${beamPos.y - 400}px, 0)` }}
           />
           
           <div 
             className="absolute w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full will-change-transform mix-blend-plus-lighter"
             style={{ 
               transform: `translate3d(${beamPos.x - 200}px, ${beamPos.y - 200}px, 0)`,
               maskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)',
               WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)'
             }}
           />

           {/* Professional Vertical Beam Accent */}
           <div 
             className="absolute w-[1px] h-[200vh] bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-[3px] opacity-10 origin-top animate-pulse-slow"
             style={{ 
               left: `${beamPos.x}px`,
               top: `${beamPos.y - 300}px`,
               transform: `rotate(${Math.sin(Date.now() / 2500) * 1.2}deg)`
             }}
           />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                 <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2em]">Genesis_Epoch_Active</span>
              </div>
              
              <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                {content.hero.title}
              </h1>
              
              <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                {content.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button onClick={login} className="w-full sm:w-auto px-12 py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 rounded-xl group">
                {content.hero.ctaPrimary} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link to="/whitepaper" className="w-full sm:w-auto px-12 py-6 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 text-[12px] font-black text-white uppercase tracking-[0.2em] hover:border-zinc-600 transition-all flex items-center justify-center gap-3 rounded-xl">
                {content.hero.ctaSecondary} <Code2 className="w-5 h-5 text-zinc-600" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-12 pt-12 border-t border-zinc-900/50">
              {[
                { val: '40+', label: 'Regions' },
                { val: '12ms', label: 'Latency' },
                { val: '24k', label: 'Nodes' }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl md:text-5xl font-mono font-bold text-white tracking-tighter">{stat.val}</p>
                  <p className="text-[9px] font-black text-zinc-600 uppercase mt-2 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Terminal UI */}
          <div className="lg:col-span-5 relative">
             <div className="relative bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                {/* OS Header */}
                <div className="bg-zinc-900 px-5 py-4 flex items-center justify-between border-b border-zinc-800">
                   <div className="flex gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700"></div>
                      <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700"></div>
                      <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700"></div>
                   </div>
                   <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
                      <TerminalIcon className="w-3 h-3" />
                      <span>Argus_OS_Terminal_v4.2</span>
                   </div>
                   <div className="flex gap-4">
                      <Minus className="w-3 h-3 text-zinc-700" />
                      <Maximize2 className="w-3 h-3 text-zinc-700" />
                      <X className="w-3 h-3 text-zinc-700" />
                   </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center gap-6 px-6 py-2 bg-zinc-900/30 border-b border-zinc-900 text-[8px] font-mono font-bold uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                      <span className="text-zinc-600">CPU:</span>
                      <span className="text-primary">{Math.floor(Math.random() * 20 + 5)}%</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-zinc-600">MEM:</span>
                      <span className="text-emerald-500">2.4GB</span>
                   </div>
                   <div className="ml-auto flex items-center gap-2 text-zinc-700">
                      <span>ROOT_ACCESS: GRANTED</span>
                   </div>
                </div>
                
                {/* Log Feed */}
                <div className="p-8 font-mono text-[10px] h-[360px] flex flex-col justify-end gap-2.5 overflow-hidden">
                   {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 animate-in slide-in-from-bottom-1 duration-300">
                         <span className={`font-black shrink-0 ${
                            log.level === 'crit' ? 'text-primary' : 
                            log.level === 'warn' ? 'text-amber-500' : 'text-zinc-700'
                         }`}>
                            [{log.prefix}]
                         </span>
                         <span className="text-zinc-500 flex-1">&gt; {log.msg}</span>
                         <span className={`shrink-0 font-bold ${
                            log.status === 'OK' || log.status === 'SUCCESS' ? 'text-emerald-500' : 
                            log.status === 'PENDING' ? 'text-zinc-600' : 'text-primary'
                         }`}>
                            {log.status}
                         </span>
                      </div>
                   ))}
                   <div className="flex items-center gap-3 pt-2 border-t border-zinc-900/50">
                      <span className="text-primary font-black">[CMD]</span>
                      <span className="text-zinc-300">sh run initialization_sequence</span>
                      <div className="h-4 w-1.5 bg-primary animate-pulse ml-1"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Content Section with Glass Backdrop */}
      <section className="relative z-10 py-32 border-t border-zinc-900/50 bg-black/40 backdrop-blur-md">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-black text-zinc-600 mb-12 uppercase tracking-[0.3em]">{content.partners.title}</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {content.partners.items.map((name, i) => (
                  <h3 key={i} className="text-lg font-black text-white uppercase tracking-tighter">{name.replace('_', ' ')}</h3>
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
                 
                 <div className="space-y-10">
                    {content.architecture.layers.map((layer, i) => (
                       <div key={i} className="flex gap-8 group">
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
              
              <div className="relative">
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

      {/* FAQ Section */}
      {content.faq.isVisible && (
        <section className="py-24 md:py-32 px-6 max-w-4xl mx-auto relative z-10 border-t border-zinc-900/50">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-16 text-center">{content.faq.title}</h2>
           <div className="space-y-4">
              {content.faq.items.map((item, i) => (
                 <div key={i} className="border border-zinc-900 bg-black/40 backdrop-blur-md rounded-xl overflow-hidden">
                    <button 
                       onClick={() => toggleFaq(i)}
                       className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-900/20 transition-colors"
                    >
                       <span className="font-bold text-white text-sm uppercase tracking-wide">{item.q}</span>
                       <Plus className={`w-4 h-4 text-zinc-500 transition-transform ${openFaq === i ? 'rotate-45' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                       <div className="p-6 pt-0 text-zinc-500 text-sm leading-relaxed border-t border-zinc-900/50 mt-2">
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
                 <button onClick={login} className="h-24 px-20 bg-primary text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_20px_80px_rgba(244,63,94,0.4)] hover:shadow-[0_0_100px_rgba(244,63,94,0.7)] hover:-translate-y-2 flex items-center gap-4 group">
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
