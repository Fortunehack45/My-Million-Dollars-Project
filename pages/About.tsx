
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
         <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-maroon/5 border border-maroon/20 rounded-full mb-6">
                  <div className="w-1.5 h-1.5 bg-maroon rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono font-black text-maroon uppercase tracking-[0.2em]">Institutional_Manifesto</span>
               </div>
               <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-[-0.05em] leading-[0.9] mb-8 md:mb-10">{content.title}</h1>
               <p className="text-lg md:text-xl text-zinc-400 font-medium border-l-2 border-maroon pl-6 italic leading-relaxed">
                  {content.subtitle}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-24">
               <div className="silk-panel p-8 sm:p-10 space-y-6 text-center group hover:bg-maroon/[0.02] transition-all duration-700">
                  <div className="w-20 h-20 mx-auto bg-zinc-950 border border-white/5 rounded-full flex items-center justify-center group-hover:border-maroon/50 group-hover:bg-maroon/5 transition-silk group-hover:scale-110 shadow-2xl">
                     <Target className="w-10 h-10 text-white group-hover:text-maroon transition-silk" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{content.mission.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed italic">{content.mission.desc}</p>
               </div>
               <div className="silk-panel p-8 sm:p-10 space-y-6 text-center group hover:bg-maroon/[0.02] transition-all duration-700">
                  <div className="w-20 h-20 mx-auto bg-zinc-950 border border-white/5 rounded-full flex items-center justify-center group-hover:border-maroon/50 group-hover:bg-maroon/5 transition-silk group-hover:scale-110 shadow-2xl">
                     <Globe className="w-10 h-10 text-white group-hover:text-maroon transition-silk" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{content.vision.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed italic">{content.vision.desc}</p>
               </div>
               <div className="silk-panel p-8 sm:p-10 space-y-6 text-center group hover:bg-maroon/[0.02] transition-all duration-700">
                  <div className="w-20 h-20 mx-auto bg-zinc-950 border border-white/5 rounded-full flex items-center justify-center group-hover:border-maroon/50 group-hover:bg-maroon/5 transition-silk group-hover:scale-110 shadow-2xl">
                     <Users className="w-10 h-10 text-white group-hover:text-maroon transition-silk" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{content.collective.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed italic">{content.collective.desc}</p>
               </div>
            </div>

            <div className="silk-panel p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] border-zinc-900 group overflow-hidden">
               <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-[-0.03em] mb-10 md:mb-12 text-center group-hover:text-maroon transition-silk">Strategic Partners</h2>
               <div className="flex flex-wrap justify-center gap-8 md:gap-24 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
                  {content.partners.map((p) => (
                     <span key={p} className="text-sm md:text-xl font-black text-white uppercase tracking-widest">{p.replace('_', ' ')}</span>
                  ))}
               </div>
            </div>
         </div>
      </PublicLayout>
   );
};

export default About;
