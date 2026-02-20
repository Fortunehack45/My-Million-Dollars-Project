
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
               <h1 className="text-6xl font-black text-white uppercase tracking-[-0.05em] leading-[0.85] mb-10">{content.title}</h1>
               <p className="text-xl text-zinc-400 font-medium border-l-2 border-maroon pl-6 italic">
                  {content.subtitle}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
               <div className="space-y-6 text-center group">
                  <div className="w-20 h-20 mx-auto silk-panel rounded-full flex items-center justify-center group-hover:border-maroon/50 group-hover:bg-maroon/5 transition-silk group-hover:scale-110">
                     <Target className="w-10 h-10 text-white group-hover:text-maroon transition-silk" />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">{content.mission.title}</h3>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">{content.mission.desc}</p>
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

            <div className="silk-panel p-16 rounded-[3rem] border-zinc-900 group">
               <h2 className="text-4xl font-black text-white uppercase tracking-[-0.03em] mb-12 text-center group-hover:text-maroon transition-silk">Strategic Partners</h2>
               <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition- silk duration-1000">
                  {content.partners.map((p) => (
                     <span key={p} className="text-xl font-black text-white uppercase tracking-widest">{p.replace('_', ' ')}</span>
                  ))}
               </div>
            </div>
         </div>
      </PublicLayout>
   );
};

export default About;
