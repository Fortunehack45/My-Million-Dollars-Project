
import React, { useState, useEffect } from 'react';
import { subscribeToContent, subscribeToNetworkStats, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig, NetworkStats } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight, TrendingUp, Info, LayoutTemplate, Globe, Server, Minus, ChevronRight, Binary, Cpu, Database, Blocks, Fingerprint, Terminal, Share2, Box, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixBackground from '../components/MatrixBackground';
import SEO from '../components/SEO';

const IconMap: any = { Zap, ShieldCheck, Lock, Activity, Layers, TrendingUp, Globe, Server, Binary, Cpu, Database, Blocks, Fingerprint };

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

   // --- Distribution Chart Logic ---
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
      <div className="relative pt-32 pb-40 min-h-screen bg-[#050505] text-zinc-300 font-mono selection:bg-maroon selection:text-white">
         <SEO 
            title="Network Tokenomics" 
            description="Insight into Argus Protocol's economic model, token distribution, and the utility of ARG credits in the decentralized compute economy."
         />
         
         {/* DASHBOARD SYSTEM OVERLAY */}
         <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
            <MatrixBackground color="rgba(128, 0, 0, 0.05)" opacity={0.15} />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(128,0,0,0.06),rgba(128,0,0,0.02),rgba(128,0,0,0.06))] bg-[length:100%_2px,3px_100%]"></div>
         </div>

         <div className={`max-w-[1700px] mx-auto px-6 relative z-10 transition-all duration-1000 ${visible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
            
            {/* --- TOP BAR: NETWORK OPERATIONS --- */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-zinc-950/80 border border-white/[0.05] p-6 rounded-xl backdrop-blur-md">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-maroon/10 rounded-lg flex items-center justify-center border border-maroon/20">
                     <Radio className="w-6 h-6 text-maroon animate-pulse" />
                  </div>
                  <div>
                     <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">Network Operations</h1>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">System Operational — {stats.activeNodes} Peers</span>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-12 text-right">
                  <div className="space-y-1">
                     <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Protocol_Uptime</p>
                     <p className="text-xl font-black text-white">99.999%</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Block_Height</p>
                     <p className="text-xl font-black text-maroon">#168,421,003</p>
                  </div>
               </div>
            </div>

            {/* --- CORE METRICS PANEL --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               {[
                  { label: "Node Balance", value: "164.48", unit: "ARG", icon: Database, color: "text-white" },
                  { label: "Unmined Supply", value: circulatingSupplyDisplay, sub: "Cap: 1,000,000,000 ARG", icon: Layers, color: "text-white" },
                  { label: "Network Throughput", value: "407,013", unit: "TPS", sub: "Finality: < 400ms", icon: Zap, color: "text-white" },
                  { label: "Active Validators", value: stats.activeNodes, icon: Share2, color: "text-white" }
               ].map((m, i) => (
                  <div key={i} className="bg-zinc-950/50 border border-white/[0.05] p-6 rounded-xl hover:border-maroon/30 transition-all duration-500 group">
                     <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/[0.05] group-hover:bg-maroon/10 transition-colors">
                           <m.icon className="w-5 h-5 text-zinc-500 group-hover:text-maroon transition-colors" />
                        </div>
                        {i === 0 && <span className="text-[10px] text-emerald-500 font-black">+2.4%</span>}
                        {i === 2 && <span className="text-[10px] text-emerald-500 font-black px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">Stable</span>}
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{m.label}</p>
                        <div className="flex items-baseline gap-2">
                           <span className={`text-3xl font-black ${m.color} tabular-nums`}>{m.value}</span>
                           {m.unit && <span className="text-xs font-black text-zinc-500">{m.unit}</span>}
                        </div>
                        {m.sub && <p className="text-[9px] text-zinc-700 font-bold uppercase">{m.sub}</p>}
                     </div>
                  </div>
               ))}
            </div>

            {/* --- MIDDLE SECTION: TOPOLOGY & LEGEND --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
               
               {/* Distribution Topology Panel */}
               <div className="lg:col-span-8 bg-zinc-950/50 border border-white/[0.05] rounded-xl p-8 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-maroon" />
                        <span className="text-xs font-black uppercase text-white tracking-widest">GhostDAG_Topology_Live</span>
                     </div>
                     <span className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Latency: 12ms</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-16">
                     <div className="relative w-64 md:w-80 shrink-0">
                        <svg viewBox="0 0 42 42" className="w-full h-full transform transition-all duration-[1000ms] cursor-crosshair">
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
                                    strokeWidth={isActive ? 7.5 : 6}
                                    strokeDasharray={item.strokeDasharray}
                                    strokeDashoffset={item.strokeDashoffset}
                                    className={`
                                       ${item.color.includes('bg-') ? item.color.replace('bg-', 'text-') : 'text-zinc-800'} 
                                       transition-all duration-500 ease-out-expo cursor-pointer origin-center
                                       ${isActive ? 'brightness-125 saturate-150 drop-shadow-[0_0_15px_currentColor]' : 'opacity-20 hover:opacity-40'}
                                    `}
                                    style={{ color: !item.color.startsWith('bg-') ? item.color : undefined }}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                 />
                              );
                           })}
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 pointer-events-none">
                           <div className="w-full h-full rounded-full border border-white/[0.02] bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center">
                              <AnimatePresence mode="wait">
                                 {activeItem ? (
                                    <motion.div 
                                       key={activeItem.label}
                                       initial={{ opacity: 0, scale: 0.9 }}
                                       animate={{ opacity: 1, scale: 1 }}
                                       exit={{ opacity: 0, scale: 0.9 }}
                                       className="space-y-1"
                                    >
                                       <p className="text-[11px] font-black text-white uppercase tracking-tight">{activeItem.percentage}%</p>
                                       <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{activeItem.label.split(' ')[0]}</p>
                                    </motion.div>
                                 ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 opacity-20">
                                       <Box className="w-5 h-5 text-white mx-auto mb-1" />
                                       <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Scanning...</p>
                                    </motion.div>
                                 )}
                              </AnimatePresence>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 space-y-6">
                        <div className="space-y-4">
                           <h3 className="text-lg font-black text-white uppercase tracking-tight">System Allocation Matrix</h3>
                           <p className="text-xs text-zinc-500 leading-relaxed font-bold opacity-80">
                              Protocol state transition metrics indexed via DAG-topology. All unmined supply remains in the Genesis vault.
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-white/[0.05] pt-6">
                           <div className="space-y-1">
                              <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Supply_Locked</p>
                              <p className="text-xl font-black text-white">99.8%</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Vault_Security</p>
                              <p className="text-xl font-black text-emerald-500">OPTIMAL</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Command Log / Legend Panel */}
               <div className="lg:col-span-4 bg-[#0a0a0a] border border-white/[0.05] rounded-xl flex flex-col group">
                  <div className="p-5 border-b border-white/[0.05] flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-maroon" />
                        <span className="text-xs font-black uppercase text-white tracking-widest">System_Kernel</span>
                     </div>
                     <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                     </div>
                  </div>
                  <div className="flex-1 p-6 space-y-4 custom-scrollbar overflow-y-auto max-h-[400px]">
                     {content.distribution.map((item, i) => (
                        <div
                           key={i}
                           onMouseEnter={() => setActiveIndex(i)}
                           onMouseLeave={() => setActiveIndex(null)}
                           className={`
                              flex items-center justify-between p-4 rounded-lg transition-all duration-300 cursor-pointer
                              ${activeIndex === i ? 'bg-maroon/10 border-l-2 border-maroon' : 'bg-zinc-950/30 border-l-2 border-transparent'}
                           `}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-sm ${item.color} ${activeIndex === i ? 'animate-pulse' : 'opacity-40'}`}></div>
                              <div>
                                 <p className={`text-[11px] font-black uppercase tracking-tight ${activeIndex === i ? 'text-white' : 'text-zinc-500'}`}>{item.label}</p>
                                 <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">{item.value.split(' ')[0]}</p>
                              </div>
                           </div>
                           <p className={`text-sm font-black tabular-nums transition-colors ${activeIndex === i ? 'text-maroon' : 'text-zinc-800'}`}>{item.percentage}%</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* --- UTILITY GRID: MODULE BLOCKS --- */}
            <div className="mb-8">
               <div className="flex items-center gap-4 mb-6">
                  <Cpu className="w-4 h-4 text-maroon" />
                  <span className="text-xs font-black uppercase text-white tracking-widest">Operational Modules</span>
                  <div className="h-px flex-1 bg-white/[0.05]"></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {content.utility.map((u, i) => {
                     const Icon = IconMap[u.icon] || Zap;
                     return (
                        <div key={i} className="bg-zinc-950/50 border border-white/[0.05] p-8 rounded-xl hover:border-maroon/20 hover:bg-zinc-900/30 transition-all duration-500 group relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                              <Icon className="w-16 h-16" />
                           </div>
                           <div className="flex items-start justify-between mb-10">
                              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/[0.05] group-hover:bg-maroon/10 transition-colors">
                                 <Icon className="w-6 h-6 text-zinc-500 group-hover:text-maroon transition-colors" />
                              </div>
                              <span className="text-[10px] text-emerald-500/50 font-black px-2 py-0.5 border border-emerald-500/10 rounded">ACC_GRANTED</span>
                           </div>
                           <div className="space-y-4">
                              <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-maroon transition-colors">{u.title}</h3>
                              <p className="text-xs text-zinc-500 leading-relaxed font-bold opacity-80">{u.desc}</p>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>

            {/* --- TERMINAL LEDGER: EMISSION LOG --- */}
            <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl overflow-hidden shadow-2xl">
               <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Blocks className="w-4 h-4 text-maroon" />
                     <span className="text-xs font-black uppercase text-white tracking-widest">Protocol_Emission_Ledger</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest animate-pulse">Live_Sync_Active</span>
                     <div className="w-1.5 h-1.5 rounded-full bg-maroon"></div>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-white/[0.01] text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                           <th className="p-6 pl-10 border-b border-white/[0.05]">Sequence_ID</th>
                           <th className="p-6 border-b border-white/[0.05]">Time_Horizon</th>
                           <th className="p-6 border-b border-white/[0.05]">Volumetric_Alloc</th>
                           <th className="p-6 pr-10 border-b border-white/[0.05] text-right">State_Protocol</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.03]">
                        {content.schedule.map((row, i) => (
                           <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="p-6 pl-10">
                                 <div className="flex items-center gap-6">
                                    <span className="text-[11px] font-black text-zinc-800">#00{i+1}</span>
                                    <span className="text-sm font-black text-white group-hover:text-maroon transition-colors uppercase">{row.phase}</span>
                                 </div>
                              </td>
                              <td className="p-6 text-xs text-zinc-500 font-bold uppercase">{row.date}</td>
                              <td className="p-6">
                                 <div className="flex items-center gap-6">
                                    <span className="text-lg font-black text-zinc-300 tabular-nums">{row.allocation}</span>
                                    <div className="h-1 w-20 bg-zinc-900 overflow-hidden rounded-full">
                                       <div className={`h-full bg-maroon transition-all duration-[2000ms] ${visible ? (i === 0 ? 'w-full' : 'w-1/4 opacity-10') : 'w-0'}`}></div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6 pr-10 text-right">
                                 <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-md border border-white/[0.05] ${i === 0 ? 'bg-maroon/10 border-maroon/20 text-maroon' : 'opacity-30'}`}>
                                    <span className="text-[10px] font-black uppercase tracking-tight">{row.action}</span>
                                    <ChevronRight className="w-3 h-3" />
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               
               <div className="p-6 bg-black flex justify-between items-center text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em] border-t border-white/[0.05]">
                  <p>Consensus_ID: ed74-90a2-bf3c</p>
                  <p className="hover:text-zinc-600 transition-colors cursor-pointer">Export Metadata (JSON)</p>
               </div>
            </div>

         </div>
      </div>
   );
};

export default Tokenomics;
