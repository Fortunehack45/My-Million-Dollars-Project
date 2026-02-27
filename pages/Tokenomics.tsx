
import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, subscribeToNetworkStats, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig, NetworkStats } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';
import { ContentRenderer } from '../components/ContentRenderer';
import MatrixBackground from '../components/MatrixBackground';

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
            {/* Matrix Rain Background */}
            <MatrixBackground color="rgba(128, 0, 0, 0.1)" opacity={0.4} />

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-maroon/5 rounded-full blur-[100px] mix-blend-screen"></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-maroon/5 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

               {/* Header - Institutional Economic Model */}
               <div className={`max-w-6xl mb-32 transition-all duration-[1500ms] ease-out-expo ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full mb-10 shadow-2xl">
                     <PieChart className="w-4 h-4 text-maroon animate-pulse-gentle" />
                     <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] font-mono italic">Economic_Protocol_Ref: ARG_TOKEN_v2.0</span>
                  </div>
                  <h1 className="text-5xl md:text-[6rem] font-black text-white uppercase tracking-tighter mb-12 leading-[0.8] drop-shadow-2xl">
                     {content.title}
                  </h1>
                  <p className="border-l-2 border-maroon pl-10 text-zinc-500 text-lg md:text-2xl max-w-3xl leading-relaxed font-medium">
                     {content.subtitle}
                  </p>
               </div>

               {/* Supply Cards - Argus High Fidelity */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-48">
                  <div className={`silk-panel p-1 rounded-[2.5rem] transition-all duration-[1200ms] delay-150 relative overflow-hidden group ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                     <div className="bg-zinc-950 h-full rounded-[2.4rem] p-8 md:p-12 flex items-center justify-between border border-zinc-900 group-hover:border-maroon/30 transition-all duration-700">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.02] to-transparent -translate-y-full animate-scanline opacity-20 pointer-events-none"></div>
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono">Maximum_Supply_Cap</p>
                           </div>
                           <div className="space-y-4">
                              <p className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter group-hover:text-maroon transition-colors duration-700 select-none leading-none">
                                 {content.totalSupply}
                              </p>
                              <p className="text-[10px] font-mono text-zinc-600 font-black uppercase tracking-[0.4em] ml-1">Hard_Coded_Genesis_Constraint</p>
                           </div>
                        </div>
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-900 shadow-2xl group-hover:bg-maroon transition-all duration-700 shrink-0 ml-4">
                           <Lock className="w-8 h-8 md:w-9 md:h-9 text-zinc-700 group-hover:text-white transition-colors" />
                        </div>
                     </div>
                  </div>

                  <div className={`silk-panel p-1 rounded-[2.5rem] transition-all duration-[1200ms] delay-300 relative overflow-hidden group ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                     <div className="bg-zinc-950 h-full rounded-[2.4rem] p-8 md:p-12 flex items-center justify-between border border-zinc-900 group-hover:border-maroon/30 transition-all duration-700">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.02] to-transparent -translate-y-full animate-scanline opacity-20 pointer-events-none"></div>
                        <div className="space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-maroon animate-pulse-gentle shadow-[0_0_10px_#800000]"></div>
                              <div className="flex items-center gap-3">
                                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono">Verified_In_Circulation</p>
                                 <Tooltip text="Sum of all ARG credits successfully mined by network participants." position="right">
                                    <Info className="w-4 h-4 text-zinc-800 hover:text-maroon transition-colors cursor-help" />
                                 </Tooltip>
                              </div>
                           </div>
                           <div className="space-y-4">
                              <p className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter group-hover:translate-x-2 transition-transform duration-700 leading-none">
                                 {circulatingSupplyDisplay} <span className="text-xl md:text-2xl text-zinc-700 font-mono tracking-normal ml-1">ARG</span>
                              </p>
                              <p className="text-[10px] font-mono text-maroon font-black uppercase tracking-[0.4em] ml-1">Algorithmically_Minted_Uptime</p>
                           </div>
                        </div>
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-900 shadow-2xl shrink-0 ml-4">
                           <Activity className="w-8 h-8 md:w-9 md:h-9 text-maroon animate-pulse" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Interactive Distribution Section - High Fidelity */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32 items-center mb-64">
                  {/* Chart Visualization */}
                  <div className={`lg:col-span-5 relative flex items-center justify-center transition-all duration-[1200ms] delay-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                     <div className="relative w-full max-w-[600px] aspect-square">
                        {/* Complex Background Glow System */}
                        <div className="absolute inset-0 bg-maroon/[0.03] blur-[120px] rounded-full animate-pulse-slow"></div>
                        <div className="absolute inset-[15%] bg-maroon/[0.02] border border-maroon/5 rounded-full animate-spin-slow"></div>

                        <svg viewBox="0 0 42 42" className="w-full h-full transform drop-shadow-[0_0_35px_rgba(0,0,0,0.5)] transition-all duration-700">
                           {/* Structural ring background */}
                           <circle cx="21" cy="21" r={RADIUS} fill="transparent" stroke="#09090b" strokeWidth="6" />
                           <circle cx="21" cy="21" r={RADIUS} fill="transparent" stroke="#18181b" strokeWidth="5.5" />

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
                                    strokeWidth={isActive ? 6.5 : 5.5}
                                    strokeDasharray={item.strokeDasharray}
                                    strokeDashoffset={item.strokeDashoffset}
                                    className={`
                                   ${item.color.includes('bg-') ? item.color.replace('bg-', 'text-') : 'text-zinc-600'} 
                                   transition-all duration-700 ease-out-expo cursor-pointer origin-center
                                   ${isActive ? 'brightness-125 scale-[1.03] drop-shadow-[0_0_10px_currentColor]' : 'hover:brightness-110'}
                                   ${visible ? 'opacity-100' : 'opacity-0'}
                                `}
                                    style={{
                                       color: !item.color.startsWith('bg-') ? item.color : undefined,
                                       transformOrigin: 'center',
                                       transitionDelay: `${i * 150}ms`
                                    }}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                 />
                              );
                           })}
                        </svg>

                        {/* High Fidelity Center Status */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <div className="bg-zinc-950/90 backdrop-blur-3xl rounded-full w-[60%] h-[60%] flex flex-col items-center justify-center border border-white/[0.05] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] p-12 transition-all duration-700 z-10 group-hover:scale-[1.05]">
                              {activeItem ? (
                                 <div className="animate-in fade-in zoom-in-95 duration-500 text-center space-y-4">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono italic">{activeItem.label}</p>
                                    <p className={`text-5xl md:text-7xl font-black transition-all duration-500 tracking-tighter ${activeItem.color.replace('bg-', 'text-')}`}>
                                       {activeItem.percentage}<span className="text-xl md:text-2xl ml-1">%</span>
                                    </p>
                                    <div className="h-0.5 w-12 bg-white/5 mx-auto"></div>
                                    <p className="text-xs font-mono text-zinc-400 font-black tracking-widest">{activeItem.value}</p>
                                 </div>
                              ) : (
                                 <div className="animate-in fade-in zoom-in-95 duration-500 text-center space-y-4">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] font-mono">Topological_Grant</p>
                                    <p className="text-5xl md:text-7xl font-black text-white tracking-tighter">100<span className="text-2xl ml-1">%</span></p>
                                    <div className="h-0.5 w-12 bg-white/5 mx-auto"></div>
                                    <p className="text-xs font-mono text-zinc-700 font-black tracking-widest uppercase">1B_ARG_UNITS</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Interactive Legend - High End Grid */}
                  <div className="lg:col-span-7 space-y-6">
                     {content.distribution.map((item, i) => (
                        <div
                           key={i}
                           onMouseEnter={() => setActiveIndex(i)}
                           onMouseLeave={() => setActiveIndex(null)}
                           className={`
                          silk-panel p-8 rounded-[2rem] flex items-center justify-between cursor-pointer border
                          transition-all duration-700 group relative overflow-hidden
                          ${activeIndex === i ? 'border-maroon/40 translate-x-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]' : 'border-white/[0.02] hover:bg-zinc-950'}
                          ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}
                        `}
                           style={{ transitionDelay: `${600 + (i * 150)}ms` }}
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-maroon/[0.02] to-transparent -translate-x-full animate-scanline opacity-10 pointer-events-none"></div>
                           <div className="flex items-center gap-8 relative z-10">
                              <div className={`w-6 h-6 rounded-2xl ${item.color} shadow-[0_0_20px_currentColor] transition-all duration-500 ${activeIndex === i ? 'scale-125 rotate-45' : ''}`}></div>
                              <div className="space-y-1">
                                 <p className={`text-lg font-black uppercase tracking-tight transition-colors duration-500 ${activeIndex === i ? 'text-maroon' : 'text-white'}`}>{item.label}</p>
                                 <p className="text-[10px] text-zinc-600 font-mono font-black uppercase tracking-[0.3em]">Protocol_Grant_Ref: {item.value.split(' ')[0]}</p>
                              </div>
                           </div>
                           <div className="text-right space-y-1">
                              <p className={`text-4xl font-black transition-all duration-500 ${activeIndex === i ? 'text-white scale-110' : 'text-zinc-700'}`}>{item.percentage}%</p>
                              <p className="text-[9px] font-mono text-zinc-800 font-black uppercase tracking-widest">Reserved_Allocation</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Utility Grid - Institutional Integration */}
               <div className="mb-48 px-2">
                  <div className={`space-y-6 mb-24 transition-all duration-1000 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                     <div className="flex items-center gap-3 text-maroon">
                        <Zap className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono">Network_Utility_Vector</span>
                     </div>
                     <h3 className="text-3xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">Token Functions</h3>
                     <p className="text-zinc-500 text-lg md:text-xl font-medium border-l-2 border-zinc-900 pl-8 max-w-2xl">Argus credits empower every layer of the topological ecosystem, from consensus to compute sharding.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                     {content.utility.map((u, i) => {
                        const Icon = IconMap[u.icon] || Zap;
                        return (
                           <div key={i} className={`p-1.5 rounded-[3rem] silk-panel relative overflow-hidden transition-all duration-1000 group hover:-translate-y-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${800 + (i * 150)}ms` }}>
                              <div className="bg-zinc-950 h-full rounded-[2.8rem] p-12 flex flex-col justify-between border border-zinc-900 group-hover:border-maroon/30 transition-all duration-700">
                                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.02] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
                                 <div className="relative z-10 space-y-12">
                                    <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center border border-zinc-900 group-hover:bg-maroon transition-all duration-700 shadow-2xl">
                                       <Icon className="w-9 h-9 text-zinc-700 group-hover:text-white transition-colors duration-700" />
                                    </div>
                                    <div className="space-y-4">
                                       <h3 className="text-3xl font-black text-white uppercase tracking-tight group-hover:text-maroon transition-colors duration-500">{u.title}</h3>
                                       <p className="text-base text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-all duration-500">{u.desc}</p>
                                    </div>
                                 </div>
                                 <div className="mt-12 pt-8 border-t border-white/[0.03] flex justify-between items-center group/more cursor-pointer relative z-10">
                                    <span className="text-[10px] font-mono font-black text-zinc-700 uppercase tracking-widest group-hover/more:text-maroon transition-colors italic">Documentation_Ref_TX</span>
                                    <ArrowRight className="w-5 h-5 text-zinc-800 group-hover/more:text-maroon group-hover/more:translate-x-3 transition-all" />
                                 </div>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>

               {/* Release Schedule - Institutional Ledger Aesthetic */}
               <div className={`p-1 rounded-[3.5rem] silk-panel overflow-hidden transition-all duration-[1500ms] delay-700 relative z-10 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  <div className="bg-zinc-950/80 backdrop-blur-3xl rounded-[3.4rem] overflow-hidden border border-white/[0.05]">
                     <div className="p-16 border-b border-white/[0.03] bg-black/40 flex flex-col md:flex-row justify-between items-center group/card gap-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-maroon/[0.02] to-transparent -translate-x-full animate-scanline opacity-10 pointer-events-none"></div>
                        <div className="relative z-10 text-center md:text-left space-y-3">
                           <div className="flex items-center justify-center md:justify-start gap-4">
                              <Layers className="w-6 h-6 text-maroon" />
                              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Emission_Matrix</h3>
                           </div>
                           <p className="text-zinc-500 text-lg font-medium">Algorithmic distribution schedule for institutional participants.</p>
                        </div>
                        <div className="bg-maroon text-white font-mono font-black text-[11px] px-8 py-4 rounded-full uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-black transition-all cursor-pointer">
                           Download_CSV_Audit
                        </div>
                     </div>
                     <div className="overflow-x-auto relative z-10 w-full px-8 pb-8">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                           <thead>
                              <tr className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em] border-b border-white/[0.02]">
                                 <th className="p-10 font-bold">Phase Protocol</th>
                                 <th className="p-10 font-bold">Activation Date</th>
                                 <th className="p-10 font-bold">Liquidity Event</th>
                                 <th className="p-10 font-bold">Deployment Mechanism</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/[0.02]">
                              {content.schedule.map((row, i) => (
                                 <tr key={i} className="hover:bg-white/[0.01] transition-all duration-500 group">
                                    <td className="p-12 font-black text-white">
                                       <div className="flex items-center gap-6">
                                          <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-maroon animate-pulse shadow-[0_0_15px_#800000]' : 'bg-zinc-900 border border-zinc-800'}`}></div>
                                          <div className="flex flex-col gap-1">
                                             <span className="text-2xl tracking-tighter group-hover:text-maroon transition-colors">{row.phase}</span>
                                             <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest font-black italic">{i === 0 ? 'STATUS: ACTIVE_NODE' : 'STATUS: QUEUED'}</span>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="p-12 text-zinc-500 font-mono font-black text-xs uppercase tracking-widest">{row.date}</td>
                                    <td className="p-12">
                                       <div className="flex items-center gap-4">
                                          <span className="text-sm font-black text-white group-hover:translate-x-2 transition-transform duration-500">{row.allocation}</span>
                                          <div className={`h-1.5 w-16 bg-zinc-900 rounded-full overflow-hidden ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>
                                             <div className="h-full bg-maroon w-full"></div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="p-12">
                                       <div className="flex items-center justify-between group-hover:bg-maroon transition-all px-6 py-4 rounded-2xl border border-white/[0.03]">
                                          <span className="text-[11px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest transition-colors">{row.action}</span>
                                          <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-all group-hover:translate-x-2" />
                                       </div>
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
