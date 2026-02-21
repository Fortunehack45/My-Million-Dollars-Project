import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, DEFAULT_LEGAL_CONFIG } from '../services/firebase';
import { LegalConfig } from '../types';
import { ContentRenderer } from '../components/ContentRenderer';

export const Terms = () => {
  const [config, setConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.terms);

  useEffect(() => {
    const unsubscribe = subscribeToContent('terms', DEFAULT_LEGAL_CONFIG.terms, setConfig);
    return () => unsubscribe();
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-40 space-y-24 relative">
        {/* Background Atmospheric Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-maroon/[0.03] blur-[150px] -z-10 animate-pulse-slow"></div>

        <header className="space-y-10 relative border-b border-zinc-900/50 pb-20">
          <div className="inline-flex items-center gap-4 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl">
            <ShieldCheck className="w-4 h-4 text-maroon animate-pulse" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono italic">Governance_Authority_v2.8</span>
          </div>
          <h1 className="text-6xl md:text-[9rem] font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
            {config.title.split(' ')[0]}<br />
            <span className="text-maroon italic">{config.title.split(' ').slice(1).join('_')}</span>
          </h1>
          <div className="flex items-center gap-6">
            <div className="h-px w-10 bg-maroon" />
            <p className="text-zinc-500 text-sm md:text-xl font-medium italic">
              Last authority synchronization detected: <span className="text-zinc-300 font-mono font-black">{config.lastUpdated}</span>
            </p>
          </div>
        </header>

        <div className="silk-panel p-1.5 rounded-[3.5rem] bg-zinc-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative group">
          <div className="bg-zinc-950 h-full rounded-[3.4rem] p-12 md:p-20 border border-white/[0.02] group-hover:border-maroon/20 transition-all duration-700 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-maroon/20 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/[0.05] blur-[100px] rounded-full pointer-events-none"></div>
            <div className="flex gap-10 relative z-10 items-center">
              <div className="shrink-0 w-2 h-24 bg-maroon rounded-full blur-[2px] animate-pulse shadow-[0_0_30px_rgba(128,0,0,0.8)]" />
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-maroon uppercase tracking-[0.5em] font-mono italic">Institutional_Mandate</h4>
                <p className="text-3xl md:text-4xl text-zinc-200 font-black leading-tight tracking-tighter group-hover:text-white transition-all uppercase italic">
                  "From Tangled_DAGs<br />to Deterministic_Streams."
                </p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
        </div>

        <div className="silk-panel p-1.5 rounded-[4rem] border-zinc-900/50 shadow-2xl relative overflow-hidden bg-zinc-950">
          <div className="bg-zinc-950 h-full rounded-[3.9rem] p-10 md:p-24 space-y-24 border border-zinc-900 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(128,0,0,0.03),transparent_80%)]" />
            {config.sections.map((section, index) => (
              <div key={index} className="group/section relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    <div className="text-[11px] font-mono text-maroon font-black px-4 py-2 bg-maroon/5 border border-maroon/20 rounded-xl shadow-[0_0_15px_rgba(128,0,0,0.1)]">[{String(index + 1).padStart(2, '0')}]</div>
                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter group-hover/section:text-maroon transition-all duration-700">{section.heading.replace(' ', '_')}</h3>
                  </div>
                  <div className="hidden md:flex items-center gap-3 opacity-20 group-hover/section:opacity-60 transition-all duration-700 font-mono text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                    <span>MOD_ID: 0x{((index + 1) * 743).toString(16).toUpperCase()}</span>
                    <div className="w-1 h-1 bg-maroon rounded-full"></div>
                    <span>AUTH_STATE: VERIFIED</span>
                  </div>
                </div>
                <div className="space-y-12 border-l border-white/[0.03] pl-10 group-hover/section:border-maroon/30 transition-all duration-1000">
                  <ContentRenderer html={section.content} className="text-zinc-500 text-lg md:text-xl leading-relaxed italic" />

                  {section.subsections?.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-6 pt-4 border-t border-zinc-900/50">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight italic">{sub.heading.replace(' ', '_')}</h4>
                      <ContentRenderer html={sub.content} className="text-zinc-600 text-base italic" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center opacity-30 py-10 scale-75">
          <div className="flex items-center gap-10">
            <div className="h-px w-20 bg-zinc-800" />
            <p className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-[1em]">Argus_Legal_Nexus_v2.8</p>
            <div className="h-px w-20 bg-zinc-800" />
          </div>
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
      <div className="max-w-5xl mx-auto px-6 py-40 space-y-24 relative">
        {/* Background Subtle Accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-maroon/[0.03] blur-[150px] -z-10 animate-pulse-slow"></div>

        <header className="space-y-10 relative border-b border-zinc-900/50 pb-20">
          <div className="inline-flex items-center gap-4 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl">
            <ShieldCheck className="w-4 h-4 text-maroon animate-pulse" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono italic">Privacy_Preservation_v2.8</span>
          </div>
          <h1 className="text-6xl md:text-[9rem] font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
            {config.title.split(' ')[0]}<br />
            <span className="text-maroon italic">{config.title.split(' ').slice(1).join('_')}</span>
          </h1>
          <div className="flex items-center gap-6">
            <div className="h-px w-10 bg-maroon" />
            <p className="text-zinc-500 text-sm md:text-xl font-medium italic">
              Last authority synchronization detected: <span className="text-zinc-300 font-mono font-black">{config.lastUpdated}</span>
            </p>
          </div>
        </header>

        <div className="silk-panel p-1.5 rounded-[4rem] border-zinc-900/50 shadow-2xl relative overflow-hidden bg-zinc-950">
          <div className="bg-zinc-950 h-full rounded-[3.9rem] p-10 md:p-24 space-y-24 border border-zinc-900 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(128,0,0,0.03),transparent_80%)]" />
            {config.sections.map((section, index) => (
              <div key={index} className="group/section relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    <div className="text-[11px] font-mono text-maroon font-black px-4 py-2 bg-maroon/5 border border-maroon/20 rounded-xl shadow-[0_0_15px_rgba(128,0,0,0.1)]">[{String(index + 1).padStart(2, '0')}]</div>
                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter group-hover/section:text-maroon transition-all duration-700">{section.heading.replace(' ', '_')}</h3>
                  </div>
                  <div className="hidden md:flex items-center gap-3 opacity-20 group-hover/section:opacity-60 transition-all duration-700 font-mono text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                    <span>PRV_ID: 0x{((index + 1) * 912).toString(16).toUpperCase()}</span>
                    <div className="w-1 h-1 bg-maroon rounded-full"></div>
                    <span>ENC_STATE: SECURE</span>
                  </div>
                </div>
                <div className="space-y-12 border-l border-white/[0.02] pl-10 group-hover/section:border-maroon/30 transition-all duration-1000">
                  <ContentRenderer html={section.content} className="text-zinc-500 text-base md:text-lg leading-relaxed italic" />

                  {section.subsections?.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-6 pt-4 border-t border-zinc-900/50">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight italic">{sub.heading.replace(' ', '_')}</h4>
                      <ContentRenderer html={sub.content} className="text-zinc-600 text-sm italic" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center opacity-30 py-10 scale-75">
          <div className="flex items-center gap-10">
            <div className="h-px w-20 bg-zinc-800" />
            <p className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-[1em]">Argus_Privacy_Relay_v2.8</p>
            <div className="h-px w-20 bg-zinc-800" />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};
