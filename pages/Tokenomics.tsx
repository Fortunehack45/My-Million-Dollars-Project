
import React, { useState, useEffect } from 'react';
import { subscribeToContent, subscribeToNetworkStats, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig, NetworkStats } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight, TrendingUp, Info, LayoutTemplate, Globe, Server, Minus } from 'lucide-react';
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
      const gap = content.distribution.length > 1 ? 0.4 : 0;
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
      <div className="relative pt-32 pb-64 min-h-screen bg-black overflow-hidden selection:bg-maroon selection:text-white">
         {/* Glassmorphism 3.0: Nuanced Ambient Layers */}
         <div className="fixed inset-0 z-0">
            <MatrixBackground color="rgba(128, 0, 0, 0.05)" opacity={0.2} />
            <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-maroon/[0.04] rounded-full blur-[180px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-maroon/[0.03] rounded-full blur-[150px] animate-pulse-slow delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.02)_0%,transparent_100%)] pointer-events-none"></div>
         </div>

         <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            
            {/* Elegant Hero Section */}
            <div className={`mb-48 max-w-6xl transition-all duration-[1800ms] cubic-bezier(0.16, 1, 0.3, 1) ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
               <div className="flex items-center gap-5 mb-10">
                  <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-950/40 backdrop-blur-2xl border border-white/[0.03] rounded-full">
                     <PieChart className="w-3 h-3 text-maroon" />
                     <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em] font-mono">Ledger_System_v3.0</span>
                  </div>
                  <div className="h-px w-24 bg-gradient-to-r from-maroon/40 to-transparent"></div>
               </div>
               
               <h1 className="text-5xl md:text-8xl lg:text-[7.5rem] font-black text-white uppercase tracking-tighter mb-10 leading-[0.85] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {content.title}
               </h1>
               
               <div className="relative max-w-3xl">
                  <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-maroon/60 via-maroon/20 to-transparent"></div>
                  <p className="pl-10 text-zinc-500 text-lg md:text-2xl leading-relaxed font-medium opacity-90">
                     {content.subtitle}
                  </p>
               </div>
            </div>

            {/* Premium Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-72">
               {[
                  { label: "Maximum_Supply_Cap", value: content.totalSupply, icon: Lock, sub: "Institutional_Genesis_Constraint", delay: 100, accent: false },
                  { label: "Verified_Circulation", value: circulatingSupplyDisplay, icon: Activity, sub: "Argus_Network_Realtime", delay: 200, accent: true, unit: "ARG" }
               ].map((metric, idx) => (
                  <div key={idx} className={`group relative transition-all duration-[1400ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${metric.delay}ms` }}>
                     <div className="absolute -inset-[1px] bg-gradient-to-b from-white/[0.05] to-transparent rounded-[2.5rem] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                     <div className="relative h-full bg-zinc-950/30 backdrop-blur-3xl border border-white/[0.03] rounded-[2.5rem] p-12 md:p-14 overflow-hidden flex items-center justify-between hover:border-maroon/20 transition-all duration-700">
                        <div className="space-y-10 relative z-10">
                           <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${metric.accent ? 'bg-maroon animate-pulse shadow-[0_0_8px_#800000]' : 'bg-zinc-800'}`}></div>
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em] font-mono">{metric.label}</p>
                           </div>
                           <div className="space-y-4">
                              <div className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white tracking-tighter tabular-nums leading-none group-hover:translate-x-1 transition-transform duration-700">
                                 {metric.value}
                                 {metric.unit && <span className="text-xl md:text-2xl text-maroon font-mono ml-4 tracking-normal opacity-80">{metric.unit}</span>}
                              </div>
                              <div className="flex items-center gap-3 opacity-40">
                                 <p className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-[0.5em]">{metric.sub}</p>
                              </div>
                           </div>
                        </div>
                        <div className={`w-20 h-20 bg-zinc-900/40 rounded-2xl flex items-center justify-center border border-white/[0.03] shadow-inner transition-all duration-700 ${metric.accent ? 'group-hover:bg-maroon' : 'group-hover:bg-zinc-800'}`}>
                           <metric.icon className={`w-10 h-10 ${metric.accent ? 'text-maroon group-hover:text-white' : 'text-zinc-700 group-hover:text-zinc-400'} transition-colors`} />
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* High-Fidelity Interactive Distribution Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-center mb-80">
               {/* Left: Liquid Chart */}
               <div className={`lg:col-span-5 relative aspect-square transition-all duration-[1600ms] delay-400 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.04)_0%,transparent_100%)] animate-pulse-slow"></div>
                  
                  <div className="relative w-full max-w-[500px] mx-auto group/chart">
                     <svg viewBox="0 0 42 42" className="w-full h-full transform transition-all duration-[1000ms] ease-out-expo">
                        <circle cx="21" cy="21" r={RADIUS} fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                        
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
                                 strokeWidth={isActive ? 7 : 5.8}
                                 strokeDasharray={item.strokeDasharray}
                                 strokeDashoffset={item.strokeDashoffset}
                                 className={`
                                    ${item.color.includes('bg-') ? item.color.replace('bg-', 'text-') : 'text-zinc-800'} 
                                    transition-all duration-700 ease-out-expo cursor-pointer origin-center
                                    ${isActive ? 'brightness-125 drop-shadow-[0_0_25px_currentColor]' : 'opacity-30 hover:opacity-50'}
                                 `}
                                 style={{
                                    color: !item.color.startsWith('bg-') ? item.color : undefined,
                                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                                    strokeLinecap: 'butt'
                                 }}
                                 onMouseEnter={() => setActiveIndex(i)}
                                 onMouseLeave={() => setActiveIndex(null)}
                              />
                           );
                        })}
                     </svg>

                     {/* Center HUD Informant */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-20">
                        <div className="bg-zinc-950/60 backdrop-blur-[40px] rounded-full w-full h-full border border-white/[0.04] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-center transition-all duration-700 overflow-hidden relative">
                           <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
                           {activeItem ? (
                              <div className="animate-in fade-in zoom-in-95 duration-700 space-y-4 px-8 relative z-10">
                                 <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.5em] font-mono italic">{activeItem.label}</p>
                                 <div className={`text-6xl md:text-8xl font-black tracking-tighter ${activeItem.color.replace('bg-', 'text-')} transition-all duration-500 tabular-nums`}>
                                    {activeItem.percentage}<span className="text-2xl ml-1">%</span>
                                 </div>
                                 <div className="flex items-center justify-center gap-3">
                                    <div className="h-px w-8 bg-zinc-800"></div>
                                    <p className="text-[10px] font-mono text-zinc-400 font-bold tracking-widest uppercase">{activeItem.value}</p>
                                    <div className="h-px w-8 bg-zinc-800"></div>
                                 </div>
                              </div>
                           ) : (
                              <div className="animate-in fade-in duration-1000 space-y-5 px-8 relative z-10">
                                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em] font-mono">Consolidated_Grant</p>
                                 <div className="text-6xl md:text-8xl font-black text-white tracking-tighter opacity-10">100<span className="text-2xl ml-1">%</span></div>
                                 <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-[1px] bg-zinc-900"></div>
                                    <p className="text-[10px] font-mono text-zinc-800 font-bold uppercase tracking-widest">Protocol_Metrics_v3</p>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Technical Legend */}
               <div className="lg:col-span-7 space-y-5">
                  {content.distribution.map((item, i) => (
                     <div
                        key={i}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`
                           group relative bg-zinc-950/20 backdrop-blur-xl border p-8 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all duration-700
                           ${activeIndex === i ? 'border-maroon/30 bg-zinc-950/40 translate-x-4 shadow-2xl' : 'border-white/[0.02] hover:border-white/[0.06]'}
                        `}
                        style={{ transitionDelay: `${i * 100}ms` }}
                     >
                        <div className="flex items-center gap-10 relative z-10">
                           <div className={`w-12 h-12 rounded-xl border border-white/[0.05] ${item.color} shadow-[0_0_30px_currentColor] group-hover:shadow-[0_0_40px_currentColor] transition-all duration-700 ${activeIndex === i ? 'scale-110 shadow-maroon animate-pulse-gentle' : 'opacity-20 backdrop-grayscale'}`}></div>
                           <div className="space-y-1.5 focus:outline-none">
                              <h4 className={`text-lg font-black uppercase tracking-tight transition-colors duration-500 ${activeIndex === i ? 'text-maroon' : 'text-zinc-100'}`}>{item.label}</h4>
                              <div className="flex items-center gap-3">
                                 <span className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-widest">Grant_Ref_ID:</span>
                                 <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">{item.value.split(' ')[0]}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className={`text-4xl font-black tabular-nums transition-all duration-500 ${activeIndex === i ? 'text-white scale-110' : 'text-zinc-800'}`}>
                              {item.percentage}%
                           </div>
                           <p className="text-[8px] font-mono text-zinc-800 font-black uppercase tracking-[0.3em] mt-1">Allocation_Matrix</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Utility Grid: High Institutional Precision */}
            <div className="mb-80 px-4">
               <div className={`space-y-8 mb-24 transition-all duration-[1200ms] delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="flex items-center gap-4 text-maroon">
                     <span className="text-[10px] font-black uppercase tracking-[0.6em] font-mono opacity-50">Operational_Primitives</span>
                     <div className="w-16 h-px bg-maroon/20"></div>
                  </div>
                  <h3 className="text-6xl md:text-[7rem] font-black text-white uppercase tracking-tighter leading-none m-0">Token Utilities</h3>
                  <p className="text-zinc-500 text-xl md:text-2xl font-medium max-w-4xl leading-relaxed opacity-70 italic">
                     Argus credits enable state transformation across the topological node distribution layer.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {content.utility.map((u, i) => {
                     const Icon = IconMap[u.icon] || Zap;
                     return (
                        <div key={i} className={`group relative transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                           <div className="relative h-full bg-zinc-950/20 backdrop-blur-3xl rounded-[2.5rem] p-12 flex flex-col border border-white/[0.02] hover:border-maroon/10 hover:-translate-y-3 transition-all duration-700 overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/[0.01] rounded-full blur-3xl group-hover:bg-maroon/[0.03] transition-colors"></div>
                              <div className="w-16 h-16 bg-zinc-900/40 rounded-2xl flex items-center justify-center border border-white/[0.03] mb-12 shadow-xl group-hover:scale-110 transition-transform">
                                 <Icon className="w-8 h-8 text-zinc-700 group-hover:text-maroon transition-colors" />
                              </div>
                              <div className="space-y-6 flex-1 relative z-10">
                                 <h4 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-maroon transition-colors duration-500">{u.title}</h4>
                                 <p className="text-base text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors opacity-80">{u.desc}</p>
                              </div>
                              <div className="mt-12 pt-8 border-t border-white/[0.03] flex justify-between items-center group/more cursor-pointer relative z-10">
                                 <span className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-widest italic group-hover/more:text-maroon transition-colors">Technical_Spec_0{i+1}</span>
                                 <ArrowRight className="w-4 h-4 text-zinc-800 transition-all group-hover/more:translate-x-2 group-hover/more:text-white" />
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>

            {/* Institutional Emission Ledger (Table) */}
            <div className={`relative transition-all duration-[1800ms] delay-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
               <div className="bg-zinc-950/20 backdrop-blur-3xl rounded-[3rem] border border-white/[0.03] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                  <div className="p-16 md:p-20 border-b border-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-maroon/[0.02] to-transparent pointer-events-none"></div>
                     <div className="space-y-4 relative z-10 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                           <LayoutTemplate className="w-5 h-5 text-maroon opacity-60" />
                           <h3 className="text-3xl md:text-5xl font-black text-zinc-100 uppercase tracking-tighter">Emission Schedule</h3>
                        </div>
                        <p className="text-zinc-500 text-base font-medium opacity-60">Verified distribution ledger for institutional liquidity activation.</p>
                     </div>
                     <button className="relative px-10 py-5 bg-zinc-900/50 text-white font-black text-[10px] rounded-2xl border border-white/[0.05] uppercase tracking-[0.4em] overflow-hidden group/btn hover:bg-maroon transition-all duration-700 active:scale-95 flex items-center gap-4">
                        <TrendingUp className="w-4 h-4 text-maroon group-hover/btn:text-white transition-colors" />
                        Download_Audit_Logs
                     </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                     <table className="w-full text-left whitespace-nowrap">
                        <thead>
                           <tr className="text-zinc-600 font-mono text-[9px] uppercase tracking-[0.6em] border-b border-white/[0.02]">
                              <th className="p-12 pl-20 font-bold opacity-40">Phase_ID</th>
                              <th className="p-12 font-bold opacity-40">Activation_Horizon</th>
                              <th className="p-12 font-bold opacity-40">Allocation_Vol</th>
                              <th className="p-12 pr-20 font-bold text-right opacity-40">Protocol_Vector</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.01]">
                           {content.schedule.map((row, i) => (
                              <tr key={i} className="group hover:bg-white/[0.02] transition-colors duration-500">
                                 <td className="p-12 pl-20">
                                    <div className="flex items-center gap-8">
                                       <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-maroon shadow-[0_0_12px_#800000] scale-125' : 'bg-zinc-900 border border-zinc-800 scale-75'}`}></div>
                                       <div className="flex flex-col gap-1">
                                          <span className="text-xl font-black text-zinc-200 group-hover:text-maroon transition-colors tracking-tight">{row.phase}</span>
                                          <div className="flex items-center gap-2">
                                             <span className={`text-[8px] font-mono font-black uppercase tracking-[0.25em] italic ${i === 0 ? 'text-maroon' : 'text-zinc-700'}`}>
                                                {i === 0 ? '● Active' : '○ Standby'}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-12">
                                    <p className="text-zinc-500 font-mono font-bold text-[11px] uppercase tracking-widest italic">{row.date}</p>
                                 </td>
                                 <td className="p-12">
                                    <div className="flex items-center gap-6">
                                       <span className="text-lg font-black text-zinc-300 tabular-nums">{row.allocation}</span>
                                       <div className="h-1 w-20 bg-zinc-950 rounded-full border border-white/[0.02] overflow-hidden">
                                          <div className={`h-full bg-maroon transition-all duration-[2500ms] ease-out-expo ${visible ? (i === 0 ? 'w-full' : 'w-1/4 opacity-10') : 'w-0'}`}></div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-12 pr-20 text-right">
                                    <div className="inline-flex items-center gap-6 px-6 py-2.5 bg-zinc-950/40 rounded-xl border border-white/[0.03] group-hover:border-maroon/20 group-hover:shadow-lg transition-all duration-700">
                                       <span className="text-[9px] font-black text-zinc-600 group-hover:text-white uppercase tracking-widest transition-colors">{row.action}</span>
                                       <ArrowRight className="w-3.5 h-3.5 text-zinc-800 group-hover:text-maroon transition-all group-hover:translate-x-1" />
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
