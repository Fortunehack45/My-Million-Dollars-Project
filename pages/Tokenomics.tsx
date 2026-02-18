
import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, DEFAULT_TOKENOMICS_CONFIG } from '../services/firebase';
import { TokenomicsConfig } from '../types';
import { PieChart, Zap, ShieldCheck, Lock, Activity, Layers, ArrowRight } from 'lucide-react';

const IconMap: any = { Zap, ShieldCheck, Lock, Activity, Layers };

const Tokenomics = () => {
  const [content, setContent] = useState<TokenomicsConfig>(DEFAULT_TOKENOMICS_CONFIG);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = subscribeToContent('tokenomics', DEFAULT_TOKENOMICS_CONFIG, setContent);
    setTimeout(() => setVisible(true), 100);
    return () => unsub();
  }, []);

  // Calculate Dash Offsets for Donut Chart
  let cumulativePercent = 0;
  const chartData = content.distribution.map(item => {
    const start = cumulativePercent;
    cumulativePercent += item.percentage;
    return { ...item, startOffset: 100 - start }; // SVG dasharray logic
  });

  return (
    <PublicLayout>
      <div className="relative pt-24 pb-32 min-h-screen overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          <div className={`text-center max-w-4xl mx-auto mb-20 transition-all duration-1000 ease-out-expo ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full mb-8 backdrop-blur-md">
                <PieChart className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Argus Economic Model v2.0</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">{content.title}</h1>
             <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">{content.subtitle}</p>
          </div>

          {/* Supply Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
             <div className={`glass-panel p-8 rounded-3xl flex items-center justify-between transition-all duration-1000 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div>
                   <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Max Supply (Hard Cap)</p>
                   <p className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter">{content.totalSupply}</p>
                </div>
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                   <Lock className="w-6 h-6 text-zinc-500" />
                </div>
             </div>
             <div className={`glass-panel p-8 rounded-3xl flex items-center justify-between transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div>
                   <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Initial Circulating Supply</p>
                   <p className="text-3xl md:text-5xl font-mono font-black text-white tracking-tighter">{content.circulatingSupply}</p>
                </div>
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                   <Activity className="w-6 h-6 text-primary" />
                </div>
             </div>
          </div>

          {/* Distribution Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
             {/* Chart Visualization */}
             <div className={`relative flex items-center justify-center transition-all duration-1000 delay-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <svg viewBox="0 0 100 100" className="w-full max-w-[500px] -rotate-90">
                   {chartData.map((item, i) => (
                      <circle
                         key={i}
                         cx="50"
                         cy="50"
                         r="40"
                         fill="transparent"
                         stroke="currentColor"
                         strokeWidth="10"
                         strokeDasharray={`${item.percentage} 100`}
                         strokeDashoffset={- (100 - item.startOffset)}
                         className={`${item.color.replace('bg-', 'text-')} transition-all duration-1000 hover:opacity-80`}
                      />
                   ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Allocation</p>
                   <p className="text-4xl font-black text-white">100%</p>
                </div>
             </div>

             {/* Legend */}
             <div className="space-y-6">
                {content.distribution.map((item, i) => (
                   <div key={i} className={`glass-panel p-6 rounded-2xl flex items-center justify-between hover:bg-zinc-900/60 transition-all duration-500 delay-[${400 + (i * 100)}ms] ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                      <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`}></div>
                         <div>
                            <p className="text-sm font-bold text-white uppercase">{item.label}</p>
                            <p className="text-xs text-zinc-500 font-mono">{item.value}</p>
                         </div>
                      </div>
                      <p className="text-xl font-black text-white">{item.percentage}%</p>
                   </div>
                ))}
             </div>
          </div>

          {/* Utility Grid */}
          <div className="mb-32">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Token Utility</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {content.utility.map((u, i) => {
                   const Icon = IconMap[u.icon] || Zap;
                   return (
                      <div key={i} className={`surface p-8 rounded-3xl border border-zinc-900 hover:border-zinc-700 transition-all duration-700 hover:-translate-y-2 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${i * 150}ms` }}>
                         <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 mb-6">
                            <Icon className="w-6 h-6 text-white" />
                         </div>
                         <h3 className="text-xl font-bold text-white uppercase mb-3">{u.title}</h3>
                         <p className="text-sm text-zinc-500 leading-relaxed">{u.desc}</p>
                      </div>
                   )
                })}
             </div>
          </div>

          {/* Release Schedule */}
          <div className={`glass-panel p-1 rounded-3xl overflow-hidden transition-all duration-1000 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
             <div className="bg-zinc-950 rounded-[1.4rem] overflow-hidden">
                <div className="p-8 border-b border-zinc-900 bg-zinc-900/20">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight">Vesting Schedule</h3>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead>
                         <tr className="border-b border-zinc-900 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            <th className="p-6 font-bold">Phase</th>
                            <th className="p-6 font-bold">Timeline</th>
                            <th className="p-6 font-bold">Unlock Amount</th>
                            <th className="p-6 font-bold">Mechanism</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                         {content.schedule.map((row, i) => (
                            <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                               <td className="p-6 font-bold text-white">{row.phase}</td>
                               <td className="p-6 text-zinc-400 font-mono">{row.date}</td>
                               <td className="p-6 text-primary font-mono font-bold">{row.allocation}</td>
                               <td className="p-6 text-zinc-400 flex items-center gap-2">
                                  {row.action} <ArrowRight className="w-3 h-3 text-zinc-600" />
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
