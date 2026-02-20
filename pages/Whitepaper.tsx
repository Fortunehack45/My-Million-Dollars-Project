import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, DEFAULT_WHITEPAPER_CONFIG } from '../services/firebase';
import { WhitepaperConfig } from '../types';

const Whitepaper = () => {
  const [content, setContent] = useState<WhitepaperConfig>(DEFAULT_WHITEPAPER_CONFIG);

  useEffect(() => {
    const unsubscribe = subscribeToContent('whitepaper', DEFAULT_WHITEPAPER_CONFIG, setContent);
    return () => unsubscribe();
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-24">
         <div className="mb-16 border-b border-zinc-900 pb-8">
            <p className="label-meta text-maroon mb-4">Technical Paper {content.version}</p>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-6 whitespace-pre-line">{content.title}</h1>
            <p className="text-xl text-zinc-400 font-serif italic">{content.subtitle}</p>
         </div>

         <div className="prose prose-invert prose-zinc max-w-none">
            {content.sections.map((section, idx) => (
               <div key={idx} className="mb-12">
                  <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
                  <p className="whitespace-pre-wrap text-zinc-400 leading-relaxed">{section.content}</p>
               </div>
            ))}
         </div>
      </div>
    </PublicLayout>
  );
};

export default Whitepaper;
