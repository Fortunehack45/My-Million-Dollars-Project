import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, DEFAULT_LEGAL_CONFIG } from '../services/firebase';
import { LegalConfig } from '../types';

export const Terms = () => {
  const [config, setConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.terms);

  useEffect(() => {
    const unsubscribe = subscribeToContent('terms', DEFAULT_LEGAL_CONFIG.terms, setConfig);
    return () => unsubscribe();
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-32 space-y-16 relative">
        {/* Background Subtle Accents */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-maroon/[0.03] blur-[120px] -z-10 animate-pulse-slow"></div>

        <header className="space-y-6 relative border-b border-zinc-900 pb-10 md:pb-12">
          <div className="inline-flex items-center gap-3 px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-full">
            <ShieldCheck className="w-3 h-3 text-maroon animate-pulse" />
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Governance_Framework_v2.8</span>
          </div>
          <h1 className="text-3xl md:text-7xl font-black text-white tracking-[-0.05em] uppercase leading-tight md:leading-none">
            {config.title.split(' ')[0]}<br /><span className="text-zinc-800">{config.title.split(' ').slice(1).join('_')}</span>
          </h1>
          <p className="text-zinc-500 text-xs md:text-lg max-w-2xl leading-relaxed italic">Last Authority Synchronization: <span className="text-zinc-400 font-mono">{config.lastUpdated}</span></p>
        </header>

        <div className="silk-panel p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] relative overflow-hidden group hover:border-maroon/30 transition-all duration-700 bg-gradient-to-br from-maroon/5 to-transparent">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-maroon/20 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-maroon/5 blur-3xl rounded-full group-hover:bg-maroon/10 transition-silk pointer-events-none"></div>
          <div className="flex gap-6 sm:gap-8 relative z-10 items-center">
            <div className="shrink-0 w-1 h-12 sm:w-1.5 sm:h-20 bg-maroon rounded-full blur-[2px] animate-pulse shadow-[0_0_15px_rgba(128,0,0,0.6)]" />
            <div>
              <h4 className="text-[9px] font-black text-maroon uppercase tracking-[0.3em] mb-2 sm:mb-3">Institutional_Mandate</h4>
              <p className="text-lg sm:text-2xl text-zinc-300 font-light leading-snug italic tracking-tight group-hover:text-white transition-silk max-w-xl">
                "From Tangled_DAGs to Deterministic_Streams."
              </p>
            </div>
          </div>
        </div>

        <div className="silk-panel p-6 sm:p-10 md:p-20 rounded-2xl sm:rounded-[3rem] border-zinc-900/50 space-y-12 md:space-y-20 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,4px_100%] opacity-20 pointer-events-none"></div>
          {config.sections.map((section, index) => (
            <div key={index} className="group/section relative z-10">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <span className="text-[9px] font-mono text-maroon/50 font-black">[{String(index + 1).padStart(2, '0')}]</span>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter group-hover/section:text-maroon transition-silk">{section.heading.replace(' ', '_')}</h3>
              </div>
              <p className="whitespace-pre-wrap text-zinc-400 text-base md:text-lg leading-relaxed italic border-l border-zinc-900 pl-6 md:pl-8 group-hover/section:border-maroon/30 transition-all duration-700">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export const Privacy = () => {
  const [config, setConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.privacy);

  useEffect(() => {
    const unsubscribe = subscribeToContent('privacy', DEFAULT_LEGAL_CONFIG.privacy, setConfig);
    return () => unsubscribe();
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-32 space-y-16 relative">
        {/* Background Subtle Accents */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-maroon/[0.03] blur-[120px] -z-10 animate-pulse-slow"></div>

        <header className="space-y-6 relative border-b border-zinc-900 pb-10 md:pb-12">
          <div className="inline-flex items-center gap-3 px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-full">
            <ShieldCheck className="w-3 h-3 text-maroon animate-pulse" />
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Privacy_Protocol_v2.8</span>
          </div>
          <h1 className="text-3xl md:text-7xl font-black text-white tracking-[-0.05em] uppercase leading-tight md:leading-none">
            {config.title.split(' ')[0]}<br /><span className="text-zinc-800">{config.title.split(' ').slice(1).join('_')}</span>
          </h1>
          <p className="text-zinc-500 text-xs md:text-lg max-w-2xl leading-relaxed italic">Last Authority Synchronization: <span className="text-zinc-400 font-mono">{config.lastUpdated}</span></p>
        </header>

        <div className="silk-panel p-6 sm:p-10 md:p-20 rounded-2xl sm:rounded-[3rem] border-zinc-900/50 space-y-12 md:space-y-20 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[size:100%_4px,4px_100%] opacity-20 pointer-events-none"></div>
          {config.sections.map((section, index) => (
            <div key={index} className="group/section relative z-10">
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <span className="text-[9px] font-mono text-maroon/50 font-black">[{String(index + 1).padStart(2, '0')}]</span>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter group-hover/section:text-maroon transition-silk">{section.heading.replace(' ', '_')}</h3>
              </div>
              <p className="whitespace-pre-wrap text-zinc-400 text-base md:text-lg leading-relaxed italic border-l border-zinc-900 pl-6 md:pl-8 group-hover/section:border-maroon/30 transition-all duration-700">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};
