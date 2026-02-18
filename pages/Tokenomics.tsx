
import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight, TrendingUp, Info } from 'lucide-react';

const IconMap: any = { Zap, ShieldCheck, Lock, Activity, Layers, TrendingUp };

const Tokenomics = () => {
  const [content, setContent] = useState<TokenomicsConfig>(DEFAULT_TOKENOMICS_CONFIG);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsub = subscribeToContent('tokenomics', DEFAULT_TOKENOMICS_CONFIG, setContent);
    setTimeout(() => setVisible(true), 100);
    return () => unsub();
  }, []);

  // --- SVG Chart Math ---
  // A radius of 15.9155 creates a circumference of exactly 100 (2 * pi * r).
  // This allows us to use percentages directly for stroke-dasharray.
  const RADIUS = 15.9155;
  const CIRCUMFERENCE = 100;
  
  let cumulativePercent = 0;
  
  const chartData = content.distribution.map((item, index) => {
    const startOffset = cumulativePercent;
    cumulativePercent += item.percentage;
    
    // Calculate stroke-dasharray: [length of arc, length of gap]
    // We leave a tiny gap (0.5) for visual separation if there are multiple slices
    const gap = content.distribution.length > 1 ? 0.5 : 0;
    const value = Math.max(0, item.percentage - gap);
    
    // Calculate rotation: start at top (-90deg or 25 units offset)
    // In SVG, positive offset pushes dash back. We want to rotate the circle.
    // Simpler method: rotate the entire circle element or calculate dashoffset.
    // Dashoffset = 25 (top) - cumulativeStart
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
      <div className="relative pt-24 pb-32 min-h-screen overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen animate-float"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          <div className={`text-center max-w-4xl mx-auto mb-20 transition-all duration-1000 ease-out-expo ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full mb-8 backdrop-blur-md shadow-lg shadow-black/20">
                <PieChart className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Argus Economic Model v2.0</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9] drop-shadow-2xl">{content.title}</h1>
             <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">{content.subtitle}</p>
          </div>

          {/* Supply Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
             <div className={`glass-panel p-10 rounded-[2rem] flex items-center justify-between transition-all duration-1000 delay-100 border border-zinc-800 hover:border-zinc-700 group ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-zinc-500" />
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Max Supply (Hard Cap)</p>
                   </div>
                   <p className="text-4xl md:text-6xl font-mono font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">{content.totalSupply}</p>
                </div>
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner group-hover:shadow-primary/10 transition-shadow">
                   <div className="w-3 h-3 bg-zinc-700 rounded-full"></div>
                </div>
             </div>
             <div className={`glass-panel p-10 rounded-[2rem] flex items-center justify-between transition-all duration-1000 delay-200 border border-zinc-800 hover:border-primary/30 group ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Circulating Supply</p>
                   </div>
                   <p className="text-4xl md:text-6xl font-mono font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">{content.circulatingSupply}</p>
                </div>
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner">
                   <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#f43f5e]"></div>
                </div>
             </div>
          </div>

          {/* Interactive Distribution Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-32">
             {/* Chart Visualization */}
             <div className={`lg:col-span-5 relative flex items-center justify-center transition-all duration-1000 delay-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="relative w-full max-w-[500px] aspect-square">
                   {/* Background Glow */}
                   <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full"></div>
                   
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
                                  transition-all duration-300 ease-out cursor-pointer
                                  ${isActive ? 'brightness-125' : 'hover:brightness-110'}
                               `}
                               style={{ color: !item.color.startsWith('bg-') ? item.color : undefined }}
                               onMouseEnter={() => setActiveIndex(i)}
                               onMouseLeave={() => setActiveIndex(null)}
                            />
                         );
                      })}
                   </svg>

                   {/* Center Content */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="bg-zinc-950/80 backdrop-blur-md rounded-full w-[60%] h-[60%] flex flex-col items-center justify-center border border-zinc-800 shadow-2xl p-4 transition-all duration-300">
                         {activeItem ? (
                            <>
                               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 text-center animate-in fade-in slide-in-from-bottom-2">{activeItem.label}</p>
                               <p className={`text-4xl md:text-5xl font-black transition-colors ${activeItem.color.replace('bg-', 'text-')} animate-in zoom-in-50`}>
                                  {activeItem.percentage}%
                               </p>
                               <p className="text-xs font-mono text-zinc-400 mt-1 font-bold">{activeItem.value}</p>
                            </>
                         ) : (
                            <>
                               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Allocation</p>
                               <p className="text-4xl md:text-5xl font-black text-white">100%</p>
                               <p className="text-xs font-mono text-zinc-600 mt-1 font-bold">1B TOKENS</p>
                            </>
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
                         glass-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer border
                         transition-all duration-300 group
                         ${activeIndex === i ? 'bg-zinc-900 border-zinc-700 translate-x-2' : 'border-transparent hover:bg-zinc-900/40 hover:border-zinc-800'}
                         ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}
                      `}
                      style={{ transitionDelay: `${400 + (i * 50)}ms` }}
                   >
                      <div className="flex items-center gap-5">
                         <div className={`w-4 h-4 rounded-full ${item.color} shadow-[0_0_12px_currentColor] transition-transform duration-300 ${activeIndex === i ? 'scale-125' : ''}`}></div>
                         <div>
                            <p className={`text-sm font-bold uppercase transition-colors ${activeIndex === i ? 'text-white' : 'text-zinc-300'}`}>{item.label}</p>
                            <p className="text-xs text-zinc-500 font-mono mt-0.5">{item.value}</p>
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
             <div className="text-center mb-16">
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
                      <div key={i} className={`surface p-10 rounded-[2.5rem] bg-zinc-900/10 border border-zinc-900 hover:border-primary/30 transition-all duration-700 group hover:-translate-y-2 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                         <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 mb-8 group-hover:scale-110 transition-transform duration-500">
                            <Icon className="w-7 h-7 text-zinc-400 group-hover:text-primary transition-colors" />
                         </div>
                         <h3 className="text-xl font-bold text-white uppercase mb-4 group-hover:text-primary transition-colors">{u.title}</h3>
                         <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400">{u.desc}</p>
                      </div>
                   )
                })}
             </div>
          </div>

          {/* Release Schedule */}
          <div className={`glass-panel p-1 rounded-[2.5rem] overflow-hidden transition-all duration-1000 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
             <div className="bg-zinc-950 rounded-[2.4rem] overflow-hidden border border-zinc-900">
                <div className="p-10 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Vesting Schedule</h3>
                      <p className="text-zinc-500 text-sm mt-1">Emission timeline for Genesis participants.</p>
                   </div>
                   <Info className="w-5 h-5 text-zinc-600 hidden md:block" />
                </div>
                <div className="overflow-x-auto">
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
                               <td className="p-8 font-bold text-white flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
                                  {row.phase}
                               </td>
                               <td className="p-8 text-zinc-400 font-mono">{row.date}</td>
                               <td className="p-8">
                                  <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded text-primary font-mono font-bold text-xs group-hover:bg-primary/20 transition-colors">
                                     {row.allocation}
                                  </span>
                               </td>
                               <td className="p-8 text-zinc-500 font-medium flex items-center gap-2">
                                  {row.action} <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-white transition-colors group-hover:translate-x-1" />
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
