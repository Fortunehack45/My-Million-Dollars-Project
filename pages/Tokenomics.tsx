
import React, { useState, useEffect } from 'react';
import { subscribeToContent, subscribeToNetworkStats, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig, NetworkStats } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight, TrendingUp, Info, LayoutTemplate, Globe, Server, Minus, ChevronRight, Binary, Cpu, Database } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixBackground from '../components/MatrixBackground';

const IconMap: any = { Zap, ShieldCheck, Lock, Activity, Layers, TrendingUp, Globe, Server, Binary, Cpu, Database };

const Tokenomics = () => {
   const [content, setContent] = useState<TokenomicsConfig>(DEFAULT_TOKENOMICS_CONFIG);
   const [stats, setStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
   const [visible, setVisible] = useState(false);
   const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

   // --- Chart Logic ---
   const RADIUS = 15.9155;
   const CIRCUMFERENCE = 100;
   let cumulativePercent = 0;

   const chartData = content.distribution.map((item, index) => {
      const startOffset = cumulativePercent;
      cumulativePercent += item.percentage;
      const gap = content.distribution.length > 1 ? 0.3 : 0;
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
      <div className="relative pt-32 pb-64 min-h-screen bg-black overflow-hidden selection:bg-maroon selection:text-white font-sans">
         {/* Layered Architectural Background */}
         <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <MatrixBackground color="rgba(128, 0, 0, 0.03)" opacity={0.15} />
            
            {/* Structural Glows */}
            <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-full h-[600px] bg-maroon/[0.03] rounded-full blur-[180px] animate-pulse-slow"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-maroon/20 to-transparent"></div>
         </div>

         <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
            
            {/* --- SECTION 1: PANORAMIC PULSE --- */}
            <div className={`mb-40 transition-all duration-[2000ms] ease-out-expo ${visible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
               <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-white/[0.05] pb-24">
                  <div className="max-w-4xl">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-px bg-maroon/40"></div>
                        <span className="text-[9px] font-black text-maroon uppercase tracking-[0.6em] font-mono">Protocol_Financial_Architecture</span>
                     </div>
                     <h1 className="text-6xl md:text-[9rem] font-black text-white uppercase tracking-tighter leading-[0.8] mb-8">
                        {content.title}
                     </h1>
                     <p className="text-zinc-500 text-xl md:text-3xl max-w-3xl leading-tight font-medium opacity-80 pl-2">
                        {content.subtitle}
                     </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-16 lg:mb-4">
                     {[
                        { label: "Genesis_Max_Cap", value: content.totalSupply, icon: Lock },
                        { label: "Circulating_Live", value: circulatingSupplyDisplay, icon: Activity, accent: true }
                     ].map((m, i) => (
                        <div key={i} className="space-y-4 group">
                           <div className="flex items-center gap-3">
                              <m.icon className={`w-3 h-3 ${m.accent ? 'text-maroon animate-pulse' : 'text-zinc-700'}`} />
                              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-[0.4em]">{m.label}</span>
                           </div>
                           <div className="text-5xl md:text-6xl font-black text-white tracking-tighter tabular-nums group-hover:text-maroon transition-colors duration-500">
                              {m.value}
                           </div>
                           <div className="h-[2px] w-full bg-zinc-900 overflow-hidden">
                              <div className={`h-full bg-maroon/40 transition-all duration-[2000ms] ${visible ? 'w-full' : 'w-0'}`}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* --- SECTION 2: SYSTEM BLUEPRINT (PANORAMIC DASHBOARD) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-56 items-stretch">
               
               {/* Left: Interactive Blueprint Chart */}
               <div className={`lg:col-span-8 bg-zinc-950/20 backdrop-blur-3xl border border-white/[0.04] rounded-[3rem] p-12 md:p-20 relative overflow-hidden transition-all duration-[1500ms] delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                     <Binary className="w-32 h-32 text-maroon" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-20 h-full">
                     <div className="relative w-full max-w-[450px] shrink-0">
                        <svg viewBox="0 0 42 42" className="w-full h-full transform transition-all duration-[1200ms] ease-out-expo italic drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                           <circle cx="21" cy="21" r={RADIUS} fill="transparent" stroke="rgba(255,255,255,0.01)" strokeWidth="6.5" />
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
                                       ${item.color.includes('bg-') ? item.color.replace('bg-', 'text-') : 'text-zinc-800'} 
                                       transition-all duration-700 ease-out-expo cursor-pointer origin-center
                                       ${isActive ? 'brightness-125 saturate-150 drop-shadow-[0_0_30px_currentColor]' : 'opacity-20 hover:opacity-40'}
                                    `}
                                    style={{
                                       color: !item.color.startsWith('bg-') ? item.color : undefined,
                                       transform: isActive ? 'scale(1.05) rotate(2deg)' : 'scale(1)',
                                       strokeLinecap: 'butt'
                                    }}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                 />
                              );
                           })}
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 pointer-events-none">
                           <div className="w-full h-full rounded-full border border-white/[0.03] bg-black/40 backdrop-blur-[50px] flex flex-col items-center justify-center text-center shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                              <AnimatePresence mode="wait">
                                 {activeItem ? (
                                    <motion.div 
                                       key={activeItem.label}
                                       initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                       animate={{ opacity: 1, scale: 1, y: 0 }}
                                       exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                       className="space-y-4"
                                    >
                                       <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.6em] font-mono">{activeItem.label}</span>
                                       <div className={`text-7xl md:text-8xl font-black tracking-tighter ${activeItem.color.replace('bg-', 'text-')} drop-shadow-lg`}>
                                          {activeItem.percentage}<span className="text-2xl ml-1">%</span>
                                       </div>
                                       <div className="flex items-center justify-center gap-4 opacity-40">
                                          <div className="h-px w-12 bg-white/20"></div>
                                          <p className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 capitalize">{activeItem.value}</p>
                                          <div className="h-px w-12 bg-white/20"></div>
                                       </div>
                                    </motion.div>
                                 ) : (
                                    <motion.div 
                                       initial={{ opacity: 0 }}
                                       animate={{ opacity: 1 }}
                                       className="space-y-6"
                                    >
                                       <LayoutTemplate className="w-8 h-8 text-maroon/20 mx-auto" />
                                       <div className="space-y-1">
                                          <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] font-mono">System_Flow_Audit</p>
                                          <p className="text-zinc-600 text-xs font-medium italic">Hover mapping nodes</p>
                                       </div>
                                    </motion.div>
                                 )}
                              </AnimatePresence>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 space-y-10 group">
                        <div className="space-y-4">
                           <h3 className="text-3xl font-black text-white uppercase tracking-tight">Technical Allocation</h3>
                           <p className="text-zinc-500 text-lg font-medium leading-relaxed opacity-80">
                              Data-centric distribution of protocol credits across foundational network layers. Corrective flow adjustments are executed via Genesis constraints.
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 border-t border-white/[0.03] pt-10">
                           <div className="space-y-2">
                              <p className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-[0.3em]">Total_Distribution_Points</p>
                              <p className="text-4xl font-black text-white">09 <span className="text-maroon">VECTORS</span></p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-[0.3em]">Deployment_Status</p>
                              <p className="text-4xl font-black text-green-500/80">OPERATIONAL</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Real-time Registry Legend */}
               <div className={`lg:col-span-4 flex flex-col gap-5 transition-all duration-[1500ms] delay-400 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                  {content.distribution.map((item, i) => (
                     <div
                        key={i}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`
                           group relative bg-zinc-950/40 backdrop-blur-2xl border p-7 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all duration-500 flex-1
                           ${activeIndex === i ? 'border-maroon/40 -translate-x-4 shadow-[20px_0_60px_-15px_rgba(128,0,0,0.3)]' : 'border-white/[0.03] hover:border-white/[0.08]'}
                        `}
                        style={{ transitionDelay: `${i * 80}ms` }}
                     >
                        <div className="flex items-center gap-6">
                           <div className={`w-1.5 h-12 rounded-full ${item.color} shadow-[0_0_20px_currentColor] transition-all duration-700 ${activeIndex === i ? 'opacity-100 scale-y-110' : 'opacity-20 backdrop-grayscale'}`}></div>
                           <div className="space-y-0.5">
                              <p className={`text-base font-black uppercase tracking-tight transition-colors duration-500 ${activeIndex === i ? 'text-white' : 'text-zinc-500'}`}>{item.label}</p>
                              <p className="text-[9px] font-mono font-bold text-zinc-700 uppercase tracking-widest">{item.value.split(' ')[0]}</p>
                           </div>
                        </div>
                        <div className={`text-4xl font-black tabular-nums transition-all duration-500 ${activeIndex === i ? 'text-maroon scale-110' : 'text-zinc-800'}`}>
                           {item.percentage}%
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* --- SECTION 3: BENTO UTILITY CLOUD --- */}
            <div className="mb-64">
               <div className={`flex items-end justify-between mb-24 transition-all duration-[1200ms] delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 text-maroon">
                        <Cpu className="w-5 h-5 opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-[0.7em] font-mono">System_Utility_Mosaic</span>
                     </div>
                     <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none m-0">Protocol Dynamics</h2>
                  </div>
                  <div className="hidden lg:block h-px flex-1 mx-20 bg-gradient-to-r from-zinc-900 to-transparent"></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8 auto-rows-[250px] md:auto-rows-[300px]">
                  {content.utility.map((u, i) => {
                     const Icon = IconMap[u.icon] || Zap;
                     const isLarge = i === 0 || i === 4;
                     return (
                        <div 
                           key={i} 
                           className={`
                              group relative overflow-hidden transition-all duration-1000 
                              ${isLarge ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2'}
                              ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
                           `} 
                           style={{ transitionDelay: `${i * 120}ms` }}
                        >
                           <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="relative h-full bg-zinc-950/20 backdrop-blur-3xl rounded-[3rem] p-12 flex flex-col border border-white/[0.04] group-hover:border-white/[0.1] transition-all duration-700">
                              <div className="flex items-start justify-between mb-auto">
                                 <div className={`w-14 h-14 bg-zinc-900/40 rounded-2xl flex items-center justify-center border border-white/[0.04] transition-all duration-700 group-hover:bg-maroon overflow-hidden`}>
                                    <Icon className="w-7 h-7 text-zinc-600 group-hover:text-white transition-colors" />
                                 </div>
                                 <span className="text-[9px] font-mono font-black text-zinc-800 uppercase tracking-widest opacity-40">U_ID: 0{i+1}</span>
                              </div>
                              
                              <div className="space-y-6 mt-12">
                                 <h4 className={`font-black text-white uppercase tracking-tight group-hover:text-maroon transition-colors duration-500 ${isLarge ? 'text-4xl' : 'text-2xl'}`}>{u.title}</h4>
                                 <p className={`text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors opacity-80 ${isLarge ? 'text-xl max-w-sm' : 'text-base line-clamp-2'}`}>{u.desc}</p>
                              </div>

                              {isLarge && (
                                 <div className="mt-12 flex items-center gap-4 text-zinc-700 group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono underline underline-offset-8">Explore Architecture</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                 </div>
                              )}
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>

            {/* --- SECTION 4: BLOCK EXPLORER LEDGER --- */}
            <div className={`relative transition-all duration-[2000ms] delay-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
               <div className="flex items-center gap-6 mb-12">
                  <Database className="w-6 h-6 text-maroon opacity-50" />
                  <h3 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter">Emission Ledger</h3>
                  <div className="h-px flex-1 bg-white/[0.02]"></div>
                  <div className="flex gap-4">
                     {['Mainnet', 'Validated', 'Encrypted'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-zinc-950 border border-white/[0.03] text-[8px] font-mono font-black text-zinc-700 uppercase tracking-widest rounded-md">{tag}</span>
                     ))}
                  </div>
               </div>

               <div className="bg-zinc-950/30 backdrop-blur-3xl rounded-[3rem] border border-white/[0.04] overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left whitespace-nowrap">
                        <thead>
                           <tr className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.6em] bg-white/[0.01]">
                              <th className="p-10 pl-16 font-bold opacity-30">Block_Sequence</th>
                              <th className="p-10 font-bold opacity-30">Horizon_Timestamp</th>
                              <th className="p-10 font-bold opacity-30">Volumetric_Alloc</th>
                              <th className="p-10 pr-16 font-bold text-right opacity-30">Execution_Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                           {content.schedule.map((row, i) => (
                              <tr key={i} className="group hover:bg-white/[0.02] transition-all duration-500">
                                 <td className="p-12 pl-16">
                                    <div className="flex items-center gap-10">
                                       <span className="text-[10px] font-mono text-zinc-800 font-black">#000{i+1}</span>
                                       <div className="flex flex-col">
                                          <span className="text-xl font-black text-white group-hover:text-maroon transition-colors tracking-tight uppercase">{row.phase}</span>
                                          <span className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-widest opacity-40">Contract_Hash: 0x{Math.random().toString(16).substring(2, 8).toUpperCase()}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-12">
                                    <p className="text-zinc-500 font-mono font-black text-xs uppercase tracking-[0.2em]">{row.date}</p>
                                 </td>
                                 <td className="p-12">
                                    <div className="flex items-center gap-6">
                                       <span className="text-2xl font-black text-zinc-300 tabular-nums">{row.allocation}</span>
                                       <div className="h-1.5 w-24 bg-zinc-900/50 rounded-full border border-white/[0.02] overflow-hidden p-[2px]">
                                          <div className={`h-full bg-maroon rounded-full transition-all duration-[3000ms] ease-out-expo ${visible ? (i === 0 ? 'w-full' : 'w-1/3 opacity-20') : 'w-0'}`}></div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-12 pr-16 text-right">
                                    <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-full border border-white/[0.03] transition-all duration-700 bg-black/40 ${i === 0 ? 'group-hover:border-maroon/40 group-hover:bg-maroon/5 shadow-[0_0_20px_rgba(128,0,0,0.1)]' : 'opacity-40'}`}>
                                       <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-maroon' : 'text-zinc-600'}`}>{row.action}</span>
                                       <ChevronRight className={`w-4 h-4 transition-all ${i === 0 ? 'text-maroon group-hover:translate-x-1' : 'text-zinc-800'}`} />
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  <div className="p-10 bg-white/[0.02] border-t border-white/[0.02] flex justify-between items-center px-16">
                     <p className="text-[8px] font-mono font-black text-zinc-800 uppercase tracking-[0.5em]">System_Sync_Lock: SECURE</p>
                     <p className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-[0.5em] group-hover:text-maroon transition-colors cursor-pointer">View Archive Ledger</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Tokenomics;
