import React, { useState, useEffect } from 'react';
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
      <div className="max-w-3xl mx-auto px-6 py-24 space-y-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{config.title}</h1>
        <div className="silk-panel p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-maroon/30 transition-silk duration-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 blur-3xl rounded-full group-hover:bg-maroon/10 transition-silk"></div>
          <div className="flex gap-6 relative z-10">
            <div className="shrink-0 w-1.5 h-16 bg-maroon rounded-full blur-[1px] animate-pulse" />
            <div>
              <h4 className="label-meta text-maroon mb-2">Core Philosophy</h4>
              <p className="text-xl text-zinc-300 font-light leading-relaxed italic tracking-tight group-hover:text-white transition-silk">
                "From Tangled DAGs to Deterministic Streams."
              </p>
            </div>
          </div>
        </div>
        <p className="text-zinc-500 text-sm">Last Updated: {config.lastUpdated}</p>

        <div className="silk-panel p-10 md:p-16 rounded-[2.5rem] space-y-12">
          {config.sections.map((section, index) => (
            <div key={index} className="group">
              <h3 className="text-xl font-black text-white uppercase mb-4 group-hover:text-maroon transition-silk">{section.heading}</h3>
              <p className="whitespace-pre-wrap text-zinc-400 leading-relaxed italic">{section.content}</p>
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
      <div className="max-w-3xl mx-auto px-6 py-24 space-y-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{config.title}</h1>
        <p className="text-zinc-500 text-sm">Last Updated: {config.lastUpdated}</p>

        <div className="silk-panel p-10 md:p-16 rounded-[2.5rem] space-y-12">
          {config.sections.map((section, index) => (
            <div key={index} className="group">
              <h3 className="text-xl font-black text-white uppercase mb-4 group-hover:text-maroon transition-silk">{section.heading}</h3>
              <p className="whitespace-pre-wrap text-zinc-400 leading-relaxed italic">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};
