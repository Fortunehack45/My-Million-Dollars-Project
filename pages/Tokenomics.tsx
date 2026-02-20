
import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, subscribeToNetworkStats, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig, NetworkStats } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';

const IconMap: any = { Zap, ShieldCheck, Lock, Activity, Layers, TrendingUp };

const Tokenomics = () => {
   const [content, setContent] = useState<TokenomicsConfig>(DEFAULT_TOKENOMICS_CONFIG);
   const [stats, setStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
   const [visible, setVisible] = useState(false);
   const [activeIndex, setActiveIndex] = useState<number | null>(null);

   useEffect(() => {
      const unsubContent = subscribeToContent('tokenomics', DEFAULT_TOKENOMICS_CONFIG, setContent);
      const unsubStats = subscribeToNetworkStats(setStats);

      // Slight delay to ensure content is ready before animating in
      const timer = setTimeout(() => setVisible(true), 150);
      return () => {
         unsubContent();
         unsubStats();
         clearTimeout(timer);
      };
   }, []);

   // Format real-time supply nicely (e.g. 145,000,000)
   const circulatingSupplyDisplay = Math.floor(stats.totalMined).toLocaleString();

   // --- SVG Chart Math ---
   const RADIUS = 15.9155;
   const CIRCUMFERENCE = 100;

   let cumulativePercent = 0;

   const chartData = content.distribution.map((item, index) => {
      const startOffset = cumulativePercent;
      cumulativePercent += item.percentage;

      const gap = content.distribution.length > 1 ? 0.5 : 0;
      const value = Math.max(0, item.percentage - gap);
      const offset = 25 - startOffset;

      return {
         ...item,
         strokeDasharray: `${value} ${CIRCUMFERENCE - value}`,
         strokeDashoffset: offset,
         originalIndex: index
      };
   });

   const activeItem = activeIndex !== null ? content.distribution[activeIndex] : null;

   return (
      <PublicLayout>
         <div className="relative pt-24 pb-32 min-h-screen overflow-hidden will-change-premium">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
               <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-maroon/5 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
               <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen animate-float"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

               {/* Header */}
               <div className={`text-center max-w-4xl mx-auto mb-20 transition-all duration-1000 ease-out-expo ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-full mb-8">
                     <PieChart className="w-3.5 h-3.5 text-maroon animate-pulse" />
                     <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em]">System_Economics_Model v2.0</span>
                  </div>
                  <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-none drop-shadow-2xl">{content.title}</h1>
                  <p className="border-l-2 border-maroon pl-4 text-zinc-500 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed italic text-center">{content.subtitle}</p>
               </div>

               {/* Supply Cards - Premium Institutional Aesthetic */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                  <div className={`silk-panel p-10 rounded-[2.5rem] flex items-center justify-between transition-silk duration-1000 delay-150 border-zinc-900 hover:border-maroon/30 group shadow-2xl relative overflow-hidden ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent -translate-y-full animate-scanline opacity-20"></div>
                     <div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">Maximum Supply Protocol</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-5xl md:text-7xl font-black text-white tracking-tighter group-hover:text-maroon transition-colors duration-500 select-none">{content.totalSupply}</p>
                           <p className="text-[10px] font-mono text-zinc-700 font-black uppercase tracking-[0.4em] ml-1">Hard_Cap_Genesis</p>
                        </div>
                     </div>
                     <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner group-hover:border-maroon/20 transition-all duration-700">
                        <Lock className="w-8 h-8 text-zinc-700 group-hover:text-maroon transition-colors" />
                     </div>
                  </div>
                  <div className={`silk-panel p-10 rounded-[2.5rem] flex items-center justify-between transition-silk duration-1000 delay-300 border-zinc-900 hover:border-maroon/30 group shadow-2xl relative overflow-hidden ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent -translate-y-full animate-scanline opacity-20 pointer-events-none"></div>
                     <div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse"></div>
                           <div className="flex items-center gap-2">
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">Market Circulation</p>
                              <Tooltip text="Sum of all ARG credits successfully mined by network participants." position="right">
                                 <Info className="w-3 h-3 text-zinc-800 hover:text-maroon transition-colors cursor-help" />
                              </Tooltip>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <p className="text-5xl md:text-7xl font-black text-white tracking-tighter group-hover:scale-[1.02] transition-transform origin-left duration-500">
                              {circulatingSupplyDisplay} <span className="text-xl text-zinc-600 font-mono tracking-normal">ARG</span>
                           </p>
                           <p className="text-[10px] font-mono text-maroon font-black uppercase tracking-[0.4em] ml-1">Verified_Uptime_Mint</p>
                        </div>
                     </div>
                     <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
                        <Activity className="w-8 h-8 text-maroon animate-pulse-slow" />
                     </div>
                  </div>
               </div>

               {/* Interactive Distribution Section */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-32">
                  {/* Chart Visualization */}
                  <div className={`lg:col-span-5 relative flex items-center justify-center transition-all duration-1000 delay-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                     <div className="relative w-full max-w-[500px] aspect-square">
                        {/* Background Glow - Rotates slowly */}
                        <div className="absolute inset-0 bg-maroon/5 blur-[80px] rounded-full animate-spin-slow"></div>

                        <svg viewBox="0 0 42 42" className="w-full h-full transform drop-shadow-2xl">
                           {/* Placeholder ring background */}
                           <circle cx="21" cy="21" r={RADIUS} fill="transparent" stroke="#18181b" strokeWidth="5" />

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
                                    strokeWidth={isActive ? 6 : 5}
                                    strokeDasharray={item.strokeDasharray}
                                    strokeDashoffset={item.strokeDashoffset}
                                    className={`
                                  ${item.color.includes('bg-') ? item.color.replace('bg-', 'text-') : 'text-zinc-500'} 
                                  transition-all duration-500 ease-out cursor-pointer origin-center
                                  ${isActive ? 'brightness-125 scale-105' : 'hover:brightness-110'}
                                  ${visible ? 'opacity-100' : 'opacity-0'}
                               `}
                                    style={{
                                       color: !item.color.startsWith('bg-') ? item.color : undefined,
                                       transformOrigin: 'center',
                                       transitionDelay: `${i * 100}ms` // Staggered entry for segments
                                    }}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                 />
                              );
                           })}
                        </svg>

                        {/* Center Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <div className="bg-zinc-950/90 backdrop-blur-xl rounded-full w-[55%] h-[55%] flex flex-col items-center justify-center border border-zinc-800 shadow-2xl p-4 transition-all duration-300 z-10">
                              {activeItem ? (
                                 <div className="animate-in fade-in zoom-in-95 duration-200">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 text-center">{activeItem.label}</p>
                                    <p className={`text-4xl md:text-5xl font-black text-center transition-colors ${activeItem.color.replace('bg-', 'text-')}`}>
                                       {activeItem.percentage}%
                                    </p>
                                    <p className="text-xs font-mono text-zinc-400 mt-1 font-bold text-center">{activeItem.value}</p>
                                 </div>
                              ) : (
                                 <div className="animate-in fade-in zoom-in-95 duration-200">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 text-center">Total Allocation</p>
                                    <p className="text-4xl md:text-5xl font-black text-white text-center">100%</p>
                                    <p className="text-xs font-mono text-zinc-600 mt-1 font-bold text-center">1B TOKENS</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Interactive Legend */}
                  <div className="lg:col-span-7 space-y-4">
                     {content.distribution.map((item, i) => (
                        <div
                           key={i}
                           onMouseEnter={() => setActiveIndex(i)}
                           onMouseLeave={() => setActiveIndex(null)}
                           className={`
                         silk-panel p-6 rounded-2xl flex items-center justify-between cursor-pointer border
                         transition-silk duration-500 group relative overflow-hidden
                         ${activeIndex === i ? 'bg-zinc-900/60 border-maroon/40 translate-x-2' : 'border-transparent hover:bg-zinc-900/40'}
                         ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}
                       `}
                           style={{ transitionDelay: `${600 + (i * 100)}ms` }}
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full animate-scanline opacity-10 pointer-events-none"></div>
                           <div className="flex items-center gap-5 relative z-10">
                              <div className={`w-4 h-4 rounded-full ${item.color} shadow-[0_0_12px_currentColor] transition-transform duration-300 ${activeIndex === i ? 'scale-125' : ''}`}></div>
                              <div>
                                 <p className={`text-sm font-bold uppercase transition-colors ${activeIndex === i ? 'text-white' : 'text-zinc-300'}`}>{item.label}</p>
                                 <p className="text-[10px] text-zinc-600 font-mono mt-0.5 uppercase tracking-widest">Protocol_Allocation_ID: {item.value.split(' ')[0]}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`text-2xl font-black transition-colors ${activeIndex === i ? 'text-white' : 'text-zinc-500'}`}>{item.percentage}%</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Utility Grid */}
               <div className="mb-32">
                  <div className={`text-center mb-16 transition-all duration-1000 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                     <div className="inline-flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-zinc-500" />
                        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Network Utility</h2>
                     </div>
                     <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Token Functions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {content.utility.map((u, i) => {
                        const Icon = IconMap[u.icon] || Zap;
                        return (
                           <div key={i} className={`silk-panel p-10 rounded-[2.5rem] border border-zinc-900 hover:border-maroon/30 transition-silk duration-700 group hover:-translate-y-2 relative overflow-hidden ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${800 + (i * 150)}ms` }}>
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
                              <div className="relative z-10">
                                 <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                    <Icon className="w-7 h-7 text-zinc-400 group-hover:text-maroon transition-colors" />
                                 </div>
                                 <h3 className="text-xl font-bold text-white uppercase mb-4 group-hover:text-maroon transition-colors">{u.title}</h3>
                                 <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400">{u.desc}</p>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>

               {/* Release Schedule */}
               <div className={`glass-panel p-1 rounded-[2.5rem] overflow-hidden transition-all duration-1000 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  <div className="bg-zinc-950 rounded-[2.4rem] overflow-hidden border border-zinc-900">
                     <div className="p-10 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center group/card">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-scanline opacity-10 pointer-events-none"></div>
                        <div className="relative z-10">
                           <h3 className="text-2xl font-black text-white uppercase tracking-tight">Vesting Schedule</h3>
                           <p className="text-zinc-500 text-sm mt-1">Emission timeline for Genesis participants.</p>
                        </div>
                        <Info className="w-5 h-5 text-zinc-600 hidden md:block group-hover/card:text-maroon transition-colors" />
                     </div>
                     <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left text-sm">
                           <thead>
                              <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-widest bg-zinc-900/10">
                                 <th className="p-8 font-bold">Phase Protocol</th>
                                 <th className="p-8 font-bold">Activation Date</th>
                                 <th className="p-8 font-bold">Liquidity Event</th>
                                 <th className="p-8 font-bold">Mechanism</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-zinc-900">
                              {content.schedule.map((row, i) => (
                                 <tr key={i} className="hover:bg-zinc-900/40 transition-colors group">
                                    <td className="p-10 font-black text-white flex items-center gap-4">
                                       <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-maroon animate-ping' : 'bg-zinc-800'}`}></div>
                                       <div className="flex flex-col">
                                          <span className="text-base tracking-tighter">{row.phase}</span>
                                          <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">{i === 0 ? 'Protocol_Active' : 'Awaiting_Activation'}</span>
                                       </div>
                                    </td>
                                    <td className="p-10 text-zinc-400 font-mono text-xs">{row.date}</td>
                                    <td className="p-10">
                                       <span className="inline-block px-5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-maroon font-mono font-black text-xs group-hover:border-maroon/30 transition-all">
                                          {row.allocation}
                                       </span>
                                    </td>
                                    <td className="p-10 text-zinc-500 font-black text-xs flex items-center gap-3 uppercase tracking-widest">
                                       {row.action} <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-maroon transition-all group-hover:translate-x-2" />
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </PublicLayout>
   );
};

export default Tokenomics;
