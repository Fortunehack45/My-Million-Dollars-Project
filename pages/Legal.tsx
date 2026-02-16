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
        <p className="text-zinc-500 text-sm">Last Updated: {config.lastUpdated}</p>
        
        <div className="space-y-6 text-zinc-300 leading-relaxed text-sm">
          {config.sections.map((section, index) => (
            <div key={index}>
               <h3 className="text-white font-bold uppercase mb-2">{section.heading}</h3>
               <p className="whitespace-pre-wrap">{section.content}</p>
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
        
        <div className="space-y-6 text-zinc-300 leading-relaxed text-sm">
          {config.sections.map((section, index) => (
            <div key={index}>
               <h3 className="text-white font-bold uppercase mb-2">{section.heading}</h3>
               <p className="whitespace-pre-wrap">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};