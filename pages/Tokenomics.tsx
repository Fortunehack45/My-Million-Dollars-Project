
import React, { useState, useEffect } from 'react';
import { subscribeToContent, subscribeToNetworkStats, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig, NetworkStats } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight, TrendingUp, Info, LayoutTemplate, Globe, Server } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';
import MatrixBackground from '../components/MatrixBackground';

const IconMap: any = { Zap, ShieldCheck, Lock, Activity, Layers, TrendingUp, Globe, Server };

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
      const gap = content.distribution.length > 1 ? 0.6 : 0;
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
      <div className="relative pt-32 pb-48 min-h-screen bg-black overflow-hidden selection:bg-maroon selection:text-white">
         {/* Premium Ambient Background */}
         <div className="fixed inset-0 z-0">
            <MatrixBackground color="rgba(128, 0, 0, 0.08)" opacity={0.3} />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-maroon/5 rounded-full blur-[150px] animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-maroon/3 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
         </div>

         <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            {/* Header Section - Modern Institutional Typography */}
            <div className={`mb-32 max-w-5xl transition-all duration-[1500ms] ease-out-expo ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-12 bg-maroon/50"></div>
                  <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-950/50 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl">
                     <PieChart className="w-3.5 h-3.5 text-maroon" />
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] font-mono italic">Protocol_Allocation_Matrix</span>
                  </div>
               </div>
               
               <h1 className="text-6xl md:text-[8rem] font-black text-white uppercase tracking-tighter mb-12 leading-[0.8] drop-shadow-2xl">
                  {content.title}
               </h1>
               
               <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-maroon via-maroon/50 to-transparent"></div>
                  <p className="pl-12 text-zinc-400 text-xl md:text-3xl max-w-4xl leading-tight font-medium opacity-80 italic">
                     {content.subtitle}
                  </p>
               </div>
            </div>

            {/* Core Metrics Grid - Glassmorphism 2.0 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-56">
               <div className={`group relative transition-all duration-[1200ms] delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  {/* Card Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-maroon/20 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="relative bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.05] rounded-[3rem] p-10 md:p-14 overflow-hidden flex items-center justify-between group-hover:border-maroon/30 transition-all duration-700">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                     <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] font-mono">Maximum_Supply_Cap</p>
                        </div>
                        <div className="space-y-4">
                           <div className="text-6xl md:text-8xl font-black text-white tracking-tighter group-hover:text-maroon transition-colors duration-700 drop-shadow-xl tabular-nums leading-none">
                              {content.totalSupply}
                           </div>
                           <p className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-[0.4em] ml-1 opacity-60">Genesis_Settlement_Constraint</p>
                        </div>
                     </div>
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900/50 rounded-[2rem] flex items-center justify-center border border-white/[0.05] shadow-2xl group-hover:bg-maroon transition-all duration-700 shrink-0 ml-8 group-hover:rotate-[10deg]">
                        <Lock className="w-10 h-10 text-zinc-700 group-hover:text-white transition-colors" />
                     </div>
                  </div>
               </div>

               <div className={`group relative transition-all duration-[1200ms] delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  <div className="absolute -inset-1 bg-gradient-to-l from-maroon/20 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="relative bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.05] rounded-[3rem] p-10 md:p-14 overflow-hidden flex items-center justify-between group-hover:border-maroon/30 transition-all duration-700">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                     <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-maroon shadow-[0_0_10px_#800000]"></div>
                           <div className="flex items-center gap-3">
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] font-mono">Verified_Circulation</p>
                              <Tooltip text="Sum of all ARG credits successfully mined by network participants." position="right">
                                 <Info className="w-3.5 h-3.5 text-zinc-800 hover:text-maroon transition-colors cursor-help" />
                              </Tooltip>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="text-6xl md:text-8xl font-black text-white tracking-tighter tabular-nums leading-none flex items-baseline gap-4">
                              {circulatingSupplyDisplay}
                              <span className="text-2xl text-maroon font-mono tracking-normal">ARG</span>
                           </div>
                           <p className="text-[10px] font-mono text-maroon font-bold uppercase tracking-[0.4em] ml-1 opacity-80">Realtime_Algorithm_Output</p>
                        </div>
                     </div>
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-900/50 rounded-[2rem] flex items-center justify-center border border-white/[0.05] shadow-2xl shrink-0 ml-8 group-hover:bg-zinc-900 transition-all duration-700">
                        <Activity className="w-10 h-10 text-maroon animate-pulse" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Interactive Distribution Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-40 items-center mb-64">
               {/* Left: Interactive Chart Visualization */}
               <div className={`relative aspect-square flex items-center justify-center transition-all duration-[1500ms] delay-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.05)_0%,transparent_70%)] animate-pulse-slow"></div>
                  
                  <div className="relative w-full max-w-[550px] group/chart">
                     <svg viewBox="0 0 42 42" className="w-full h-full transform transition-all duration-1000 ease-out italic">
                        <circle cx="21" cy="21" r={RADIUS} fill="transparent" stroke="#0c0c0e" strokeWidth="6" />
                        <circle cx="21" cy="21" r={RADIUS} fill="transparent" stroke="#141417" strokeWidth="5.5" />

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
                                    ${item.color.includes('bg-') ? item.color.replace('bg-', 'text-') : 'text-zinc-700'} 
                                    transition-all duration-700 ease-out-expo cursor-pointer origin-center
                                    ${isActive ? 'brightness-150 drop-shadow-[0_0_20px_currentColor]' : 'hover:brightness-110 opacity-70'}
                                 `}
                                 style={{
                                    color: !item.color.startsWith('bg-') ? item.color : undefined,
                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                    strokeLinecap: 'round'
                                 }}
                                 onMouseEnter={() => setActiveIndex(i)}
                                 onMouseLeave={() => setActiveIndex(null)}
                              />
                           );
                        })}
                     </svg>

                     {/* Chart Center Informant */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-16">
                        <div className="bg-zinc-950/80 backdrop-blur-3xl rounded-full w-full h-full border border-white/[0.05] shadow-[0_40px_100px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center transition-all duration-700">
                           {activeItem ? (
                              <div className="animate-in fade-in zoom-in-95 duration-500 space-y-3 px-8">
                                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono italic">{activeItem.label}</p>
                                 <div className={`text-7xl md:text-8xl font-black tracking-tighter ${activeItem.color.replace('bg-', 'text-')} transition-all duration-500`}>
                                    {activeItem.percentage}<span className="text-2xl ml-1">%</span>
                                 </div>
                                 <div className="h-px w-16 bg-white/10 mx-auto mb-4"></div>
                                 <p className="text-xs font-mono text-zinc-400 font-bold tracking-widest uppercase">{activeItem.value}</p>
                              </div>
                           ) : (
                              <div className="animate-in fade-in duration-700 space-y-4 px-8">
                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] font-mono">Topological_Grant</p>
                                 <div className="text-7xl md:text-8xl font-black text-white tracking-tighter">100<span className="text-2xl ml-1">%</span></div>
                                 <div className="h-px w-16 bg-white/5 mx-auto"></div>
                                 <p className="text-xs font-mono text-zinc-700 font-bold tracking-widest uppercase">Protocol_Aggregate</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Legend Grid */}
               <div className="space-y-6">
                  {content.distribution.map((item, i) => (
                     <div
                        key={i}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`
                           relative p-1 rounded-[2.5rem] transition-all duration-700
                           ${activeIndex === i ? 'bg-gradient-to-r from-maroon/20 to-transparent translate-x-4' : 'bg-transparent'}
                        `}
                        style={{ transitionDelay: `${i * 100}ms` }}
                     >
                        <div className={`
                           group bg-zinc-950/40 backdrop-blur-2xl p-8 rounded-[2.4rem] border flex items-center justify-between cursor-pointer transition-all duration-500
                           ${activeIndex === i ? 'border-maroon/40 shadow-2xl' : 'border-white/[0.05] hover:border-white/[0.1]'}
                        `}>
                           <div className="flex items-center gap-8 relative z-10">
                              <div className={`w-14 h-14 rounded-2xl ${item.color} shadow-[0_0_25px_currentColor] transition-all duration-700 ${activeIndex === i ? 'scale-110 rotate-12' : 'opacity-80'}`}></div>
                              <div className="space-y-1">
                                 <p className={`text-xl font-black uppercase tracking-tight transition-colors duration-500 ${activeIndex === i ? 'text-maroon' : 'text-white'}`}>{item.label}</p>
                                 <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-[0.3em] opacity-60">Alloc_Ref: {item.value.split(' ')[0]}</p>
                              </div>
                           </div>
                           <div className="text-right space-y-1">
                              <p className={`text-4xl font-black tabular-nums transition-all duration-500 ${activeIndex === i ? 'text-white scale-110' : 'text-zinc-700'}`}>{item.percentage}%</p>
                              <p className="text-[9px] font-mono text-zinc-800 font-black uppercase tracking-widest">Protocol_Allocation</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Utility Matrix - Refined Grid & Visuals */}
            <div className="mb-64">
               <div className={`space-y-8 mb-24 transition-all duration-1000 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  <div className="flex items-center gap-4 text-maroon">
                     <div className="w-10 h-px bg-maroon/30"></div>
                     <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono">Network_Utility_Vector</span>
                  </div>
                  <h3 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none m-0">
                     Utility Logic
                  </h3>
                  <p className="text-zinc-500 text-lg md:text-2xl font-medium border-l-2 border-maroon/20 pl-10 max-w-3xl leading-relaxed opacity-80">
                     Argus credits facilitate institutional state transitions across the topological stack.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {content.utility.map((u, i) => {
                     const Icon = IconMap[u.icon] || Zap;
                     return (
                        <div key={i} className={`group relative transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                           <div className="absolute -inset-1 bg-gradient-to-b from-maroon/10 to-transparent rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                           
                           <div className="relative h-full bg-zinc-950/40 backdrop-blur-3xl rounded-[3rem] p-12 flex flex-col border border-white/[0.05] group-hover:border-maroon/30 group-hover:-translate-y-4 transition-all duration-700">
                              <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center border border-white/[0.05] group-hover:bg-maroon transition-all duration-700 shadow-2xl mb-12 group-hover:rotate-6">
                                 <Icon className="w-10 h-10 text-zinc-600 group-hover:text-white transition-colors duration-700" />
                              </div>
                              <div className="space-y-6 flex-1">
                                 <h4 className="text-3xl font-black text-white uppercase tracking-tight group-hover:text-maroon transition-colors duration-500">{u.title}</h4>
                                 <p className="text-lg text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-all duration-500 opacity-80">{u.desc}</p>
                              </div>
                              <div className="mt-12 pt-8 border-t border-white/[0.03] flex justify-between items-center group/more cursor-pointer relative z-10 transition-colors">
                                 <span className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-widest group-hover/more:text-maroon transition-colors italic">Doc_Ref: {u.title.substring(0,3).toUpperCase()}_TX</span>
                                 <ArrowRight className="w-5 h-5 text-zinc-700 group-hover/more:text-maroon group-hover/more:translate-x-2 transition-all" />
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>

            {/* Institutional Emission Matrix (Table) */}
            <div className={`relative transition-all duration-[1500ms] delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
               <div className="bg-zinc-950/40 backdrop-blur-3xl rounded-[4rem] border border-white/[0.05] overflow-hidden shadow-2xl">
                  <div className="p-16 md:p-20 border-b border-white/[0.03] bg-gradient-to-r from-black/40 to-transparent flex flex-col md:flex-row justify-between items-center gap-10">
                     <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                           <LayoutTemplate className="w-6 h-6 text-maroon" />
                           <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Emission Matrix</h3>
                        </div>
                        <p className="text-zinc-500 text-lg font-medium opacity-80">Algorithmic distribution ledger for long-term stakeholders.</p>
                     </div>
                     <button className="px-10 py-5 bg-white text-black font-black text-[11px] rounded-2xl uppercase tracking-[0.3em] shadow-2xl hover:bg-maroon hover:text-white transition-all duration-500 active:scale-95 flex items-center gap-4">
                        <TrendingUp className="w-4 h-4" />
                        Download_Audit_CSV
                     </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                     <table className="w-full text-left whitespace-nowrap">
                        <thead>
                           <tr className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.5em] border-b border-white/[0.02]">
                              <th className="p-12 pl-20 font-bold">Protocol_Phase</th>
                              <th className="p-12 font-bold">Activation</th>
                              <th className="p-12 font-bold">Liquidity</th>
                              <th className="p-12 pr-20 font-bold text-right">Deployment_Vector</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                           {content.schedule.map((row, i) => (
                              <tr key={i} className="group hover:bg-white/[0.02] transition-all duration-500">
                                 <td className="p-14 pl-20">
                                    <div className="flex items-center gap-8">
                                       <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-maroon animate-pulse shadow-[0_0_15px_#800000]' : 'bg-zinc-800'}`}></div>
                                       <div className="flex flex-col gap-1">
                                          <span className="text-2xl font-black text-white group-hover:text-maroon transition-colors tracking-tight">{row.phase}</span>
                                          <span className={`text-[9px] font-mono font-black uppercase tracking-[0.2em] italic ${i === 0 ? 'text-maroon shadow-maroon' : 'text-zinc-600 opacity-60'}`}>
                                             {i === 0 ? 'STATUS: ACTIVE_LEDGER' : 'STATUS: PENDING_ACTIVATION'}
                                          </span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-14">
                                    <p className="text-zinc-400 font-mono font-bold text-xs uppercase tracking-widest">{row.date}</p>
                                 </td>
                                 <td className="p-14">
                                    <div className="flex items-center gap-6">
                                       <span className="text-lg font-black text-white tabular-nums">{row.allocation}</span>
                                       <div className="h-1.5 w-24 bg-zinc-900/50 rounded-full overflow-hidden border border-white/[0.02]">
                                          <div className={`h-full bg-maroon transition-all duration-[2000ms] ${visible ? (i === 0 ? 'w-full' : 'w-1/3 opacity-30') : 'w-0'}`}></div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-14 pr-20 text-right">
                                    <div className="inline-flex items-center gap-6 px-8 py-3 bg-zinc-900/40 rounded-xl border border-white/[0.05] group-hover:border-maroon/30 transition-all duration-500">
                                       <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-widest">{row.action}</span>
                                       <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-all group-hover:translate-x-1" />
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
   );
};

export default Tokenomics;
