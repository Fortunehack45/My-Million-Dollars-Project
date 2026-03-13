
import React, { useState, useEffect, useRef } from 'react';
import { subscribeToContent, subscribeToNetworkStats, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig, NetworkStats } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight, TrendingUp, Info, LayoutTemplate, Globe, Server, Minus, ChevronRight, Binary, Cpu, Database, Blocks, Fingerprint } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import MatrixBackground from '../components/MatrixBackground';

const IconMap: any = { Zap, ShieldCheck, Lock, Activity, Layers, TrendingUp, Globe, Server, Binary, Cpu, Database, Blocks, Fingerprint };

const Tokenomics = () => {
   const [content, setContent] = useState<TokenomicsConfig>(DEFAULT_TOKENOMICS_CONFIG);
   const [stats, setStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
   const [visible, setVisible] = useState(false);
   const [activeIndex, setActiveIndex] = useState<number | null>(null);
   const pageRef = useRef(null);

   const { scrollYProgress } = useScroll({
      target: pageRef,
      offset: ["start start", "end end"]
   });

   const bgOpacity = useTransform(scrollYProgress, [0, 0.2], [0.15, 0.05]);

   useEffect(() => {
      const unsubContent = subscribeToContent('tokenomics', DEFAULT_TOKENOMICS_CONFIG, setContent);
      const unsubStats = subscribeToNetworkStats(setStats);
      const timer = setTimeout(() => setVisible(true), 150);
      return () => {
         unsubContent();
         unsubStats();
         clearTimeout(timer);
      };
   }, []);

   const circulatingSupplyDisplay = Math.floor(stats.totalMined).toLocaleString();

   // --- Halo Chart Logic ---
   const RADIUS = 15.9155;
   const CIRCUMFERENCE = 100;
   let cumulativePercent = 0;

   const chartData = content.distribution.map((item, index) => {
      const startOffset = cumulativePercent;
      cumulativePercent += item.percentage;
      const gap = content.distribution.length > 1 ? 0.25 : 0;
      const value = Math.max(0, item.percentage - gap);
      const offset = 25 - startOffset;
      return {
         ...item,
         strokeDasharray: `${value} ${CIRCUMFERENCE - value}`,
         strokeDashoffset: offset
      };
   });

   const activeItem = activeIndex !== null ? content.distribution[activeIndex] : null;

   return (
      <div ref={pageRef} className="relative bg-black min-h-screen text-white overflow-hidden selection:bg-maroon selection:text-white font-sans selection:bg-white selection:text-black">
         
         {/* CINEMATIC BACKGROUND LAYERS */}
         <div className="fixed inset-0 z-0 pointer-events-none">
            <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0">
               <MatrixBackground color="rgba(255, 255, 255, 0.02)" opacity={0.1} />
            </motion.div>
            
            {/* Focal Point Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-full bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.08)_0%,transparent_60%)] opacity-40"></div>
            
            {/* Top Mesh Gradient */}
            <div className="absolute top-0 left-0 w-full h-[1000px] bg-gradient-to-b from-maroon/[0.03] to-transparent"></div>
            
            {/* Subtle Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
         </div>

         <div className="relative z-10 pt-48 pb-64">
            
            {/* --- HERO: MASSIVE SCALE --- */}
            <div className="max-w-7xl mx-auto px-6 mb-72">
               <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-12"
               >
                  <div className="flex items-center gap-6">
                     <span className="h-px w-16 bg-white/20"></span>
                     <span className="text-[10px] font-black uppercase tracking-[0.8em] text-zinc-500 font-mono">Protocol_Genesisv5.0</span>
                  </div>
                  
                  <h1 className="text-7xl md:text-[11rem] lg:text-[13rem] font-black uppercase tracking-[-0.08em] leading-[0.75] italic">
                     {content.title}
                  </h1>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                     <p className="lg:col-span-7 text-2xl md:text-4xl text-zinc-400 font-medium leading-[1.1] tracking-tight text-balance">
                        {content.subtitle}
                     </p>
                     <div className="lg:col-span-5 flex justify-end">
                        <div className="flex items-center gap-4 text-maroon group cursor-pointer">
                           <span className="text-[10px] font-black uppercase tracking-[0.4em]">Audit_Report_2026</span>
                           <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>

            {/* --- THE BIG THREE: METRIC SUITE --- */}
            <div className="max-w-[1600px] mx-auto px-6 mb-80">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-1px bg-white/[0.03] border-y border-white/[0.03]">
                  {[
                     { label: "Genesis Max Supply", value: content.totalSupply, sub: "FIXED_ALGORITHM_CONSTRAINT" },
                     { label: "Verified Circulation", value: circulatingSupplyDisplay, sub: "REALTIME_NODE_SETTLEMENT", accent: true },
                     { label: "Market Domain", value: "Institutional", sub: "TOPOLOGICAL_DISTRIBUTION" }
                  ].map((m, i) => (
                     <motion.div 
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2, duration: 1 }}
                        className="bg-black py-24 md:py-32 px-12 space-y-10 group hover:bg-zinc-950 transition-colors duration-700"
                     >
                        <div className="flex items-center gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                           <div className={`w-2 h-2 rounded-full ${m.accent ? 'bg-maroon animate-pulse shadow-[0_0_10px_#800000]' : 'bg-white'}`}></div>
                           <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono text-zinc-500">{m.label}</span>
                        </div>
                        <div className="text-6xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter tabular-nums leading-none">
                           {m.value}
                        </div>
                        <p className="text-[10px] font-mono font-bold text-zinc-800 uppercase tracking-widest">{m.sub}</p>
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* --- THE HALO: CINEMATIC DISTRIBUTION --- */}
            <div className="max-w-7xl mx-auto px-6 mb-96 text-center overflow-hidden">
               <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative py-32"
               >
                  {/* Background Aura */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_70%)] opacity-50"></div>
                  
                  <div className="relative inline-block w-full max-w-[800px]">
                     <svg viewBox="0 0 42 42" className="w-full h-full transform transition-all duration-[1200ms] ease-out-expo drop-shadow-[0_0_80px_rgba(0,0,0,0.8)] filter grayscale-[0.2] hover:grayscale-0 transition-all duration-1000">
                        <circle cx="21" cy="21" r={RADIUS} fill="transparent" stroke="rgba(255,255,255,0.015)" strokeWidth="6" />
                        {chartData.map((item, i) => {
                           const isActive = activeIndex === i;
                           return (
                              <circle
                                 key={i}
                                 cx="21"
                                 cy="21"
                                 r={RADIUS}
                                 fill="transparent"
                                 stroke="currentColor"
                                 strokeWidth={isActive ? 7.5 : 6}
                                 strokeDasharray={item.strokeDasharray}
                                 strokeDashoffset={item.strokeDashoffset}
                                 className={`
                                    ${item.color.includes('bg-') ? item.color.replace('bg-', 'text-') : 'text-zinc-900'} 
                                    transition-all duration-1000 ease-out-expo cursor-pointer origin-center
                                    ${isActive ? 'brightness-125 saturate-150 drop-shadow-[0_0_40px_currentColor]' : 'opacity-20 hover:opacity-40'}
                                 `}
                                 style={{
                                    color: !item.color.startsWith('bg-') ? item.color : undefined,
                                    transform: isActive ? 'scale(1.04)' : 'scale(1)',
                                    strokeLinecap: 'butt'
                                 }}
                                 onMouseEnter={() => setActiveIndex(i)}
                                 onMouseLeave={() => setActiveIndex(null)}
                              />
                           );
                        })}
                     </svg>

                     {/* Center Master Informant */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-24 pointer-events-none">
                        <AnimatePresence mode="wait">
                           {activeItem ? (
                              <motion.div 
                                 key={activeItem.label}
                                 initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                 exit={{ opacity: 0, scale: 0.9, y: -30 }}
                                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                 className="space-y-6"
                              >
                                 <span className="text-[12px] font-black text-white uppercase tracking-[0.8em] font-mono blur-[0.3px]">{activeItem.label}</span>
                                 <div className={`text-8xl md:text-[11rem] font-black tracking-[-0.05em] leading-none ${activeItem.color.replace('bg-', 'text-')} drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]`}>
                                    {activeItem.percentage}<span className="text-4xl ml-2 font-mono opacity-40">%</span>
                                 </div>
                                 <div className="flex items-center justify-center gap-6 opacity-30">
                                    <div className="h-[2px] w-24 bg-white"></div>
                                    <p className="text-[14px] font-mono font-black tracking-[0.3em] text-white uppercase">{activeItem.value}</p>
                                    <div className="h-[2px] w-24 bg-white"></div>
                                 </div>
                              </motion.div>
                           ) : (
                              <motion.div 
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 className="space-y-8"
                              >
                                 <Fingerprint className="w-16 h-16 text-zinc-900 mx-auto animate-pulse" />
                                 <div className="space-y-2">
                                    <p className="text-[10px] font-black text-white/5 uppercase tracking-[1em] font-mono">Select_Allocation_Node</p>
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               </motion.div>
               
               {/* Radial Legend Overlay - Sophisticated positioning */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
                  {content.distribution.map((item, i) => (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`
                           group p-8 rounded-[2rem] border border-white/[0.03] transition-all duration-700 cursor-pointer
                           ${activeIndex === i ? 'bg-zinc-950 border-maroon/20 scale-105 shadow-2xl' : 'hover:border-white/10'}
                        `}
                     >
                        <div className="flex flex-col items-center gap-6">
                           <div className={`w-3 h-3 rounded-full ${item.color} ${activeIndex === i ? 'shadow-[0_0_15px_currentColor] animate-pulse' : 'opacity-20 backdrop-grayscale'}`}></div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{item.label}</p>
                              <p className="text-3xl font-black">{item.percentage}%</p>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* --- UTILITY MATRIX: PURE ICONOGRAPHY --- */}
            <div className="max-w-[1400px] mx-auto px-6 mb-80">
               <div className="mb-32 space-y-6">
                  <div className="flex items-center gap-6">
                     <Blocks className="w-6 h-6 text-maroon opacity-50" />
                     <span className="text-[10px] font-black uppercase tracking-[0.8em] font-mono text-zinc-600">Protocol_Primitive_Logic</span>
                  </div>
                  <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic">Network Utility</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.03] border border-white/[0.03] rounded-[4rem] overflow-hidden">
                  {content.utility.map((u, i) => {
                     const Icon = IconMap[u.icon] || Zap;
                     return (
                        <div key={i} className="group relative bg-black p-16 md:p-24 transition-all duration-700 hover:bg-zinc-950 border-white/[0.01]">
                           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-20 transition-opacity">
                              <Icon className="w-32 h-32" />
                           </div>
                           <div className="relative z-10 space-y-10">
                              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:bg-maroon group-hover:scale-110">
                                 <Icon className="w-8 h-8 text-white group-hover:text-white" />
                              </div>
                              <div className="space-y-6">
                                 <h4 className="text-3xl font-black uppercase tracking-tight group-hover:text-maroon transition-colors duration-500">{u.title}</h4>
                                 <p className="text-zinc-500 text-lg leading-relaxed font-medium opacity-80 group-hover:text-zinc-300 transition-colors">{u.desc}</p>
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>

            {/* --- INSTITUTIONAL LEDGER: RAZOR SHARP --- */}
            <div className="max-w-7xl mx-auto px-6">
               <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
                  <div className="space-y-6">
                     <span className="text-[10px] font-black uppercase tracking-[0.8em] font-mono text-zinc-700">Audit_Sequence_Timeline</span>
                     <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic m-0">Emission Cycle</h2>
                  </div>
                  <button className="px-12 py-6 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-500 active:scale-95">
                     Technical_Whitepaper.pdf
                  </button>
               </div>

               <div className="space-y-px bg-white/[0.05]">
                  {content.schedule.map((row, i) => (
                     <div 
                        key={i} 
                        className="group bg-black flex flex-col md:flex-row items-center justify-between py-16 px-12 transition-all duration-700 hover:bg-zinc-950 border-white/[0.01]"
                     >
                        <div className="flex items-center gap-16 w-full md:w-1/3">
                           <span className="text-[12px] font-mono font-black text-zinc-800 group-hover:text-maroon transition-colors">#00{i+1}</span>
                           <div className="space-y-1">
                              <h3 className="text-3xl font-black uppercase group-hover:translate-x-3 transition-transform duration-700">{row.phase}</h3>
                              <p className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">{row.action}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-8 w-full md:w-1/3 py-8 md:py-0">
                           <span className="text-zinc-500 text-[11px] font-mono font-bold tracking-[0.3em] uppercase">{row.date}</span>
                           <div className="h-[2px] flex-1 bg-zinc-900 overflow-hidden relative">
                              <div className={`absolute inset-0 bg-maroon transition-all duration-[3000ms] ${visible ? (i === 0 ? 'w-full' : 'w-1/4 opacity-20') : 'w-0'}`}></div>
                           </div>
                        </div>

                        <div className="w-full md:w-1/4 text-right">
                           <span className="text-4xl font-black text-white">{row.allocation}</span>
                           <span className="text-[10px] font-mono text-zinc-700 ml-4 font-bold">TOTAL_VEC</span>
                        </div>
                     </div>
                  ))}
               </div>
               
               <div className="mt-20 pt-12 border-t border-white/[0.03] flex justify-between items-center text-[9px] font-mono font-black text-zinc-800 uppercase tracking-[0.6em]">
                  <p>System_Security_Status: Verified</p>
                  <p className="hover:text-white cursor-pointer transition-colors">Access full protocol logs</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Tokenomics;
