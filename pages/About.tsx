
import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Users, Globe, Target } from 'lucide-react';
import { subscribeToContent, DEFAULT_ABOUT_CONFIG } from '../services/firebase';
import { AboutConfig } from '../types';

const About = () => {
  const [content, setContent] = useState<AboutConfig>(DEFAULT_ABOUT_CONFIG);

  useEffect(() => {
    const unsubscribe = subscribeToContent('about', DEFAULT_ABOUT_CONFIG, setContent);
    return () => unsubscribe();
  }, []);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
           <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-8">{content.title}</h1>
           <p className="text-xl text-zinc-400">
              {content.subtitle}
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
           <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center">
                 <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase">{content.mission.title}</h3>
              <p className="text-sm text-zinc-500">{content.mission.desc}</p>
           </div>
           <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center">
                 <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase">{content.vision.title}</h3>
              <p className="text-sm text-zinc-500">{content.vision.desc}</p>
           </div>
           <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center">
                 <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase">{content.collective.title}</h3>
              <p className="text-sm text-zinc-500">{content.collective.desc}</p>
           </div>
        </div>

        <div className="surface p-12 rounded-3xl border border-zinc-900">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 text-center">Strategic Partners</h2>
           <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale">
              {content.partners.map((p) => (
                 <span key={p} className="text-lg font-black text-white">{p.replace('_', ' ')}</span>
              ))}
           </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;
