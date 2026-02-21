
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
         <div className="pt-32 pb-48 max-w-7xl mx-auto px-6 min-h-screen relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_0%,rgba(128,0,0,0.03),transparent_70%)] pointer-events-none" />

            {/* HEADER - Dramatic Institutional Intro */}
            <div className="text-left space-y-12 mb-32 md:mb-48 relative z-10">
               <div className="inline-flex items-center gap-4 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl">
                  <div className="w-1.5 h-1.5 bg-maroon rounded-full animate-pulse shadow-[0_0_10px_#800000]" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono italic">Protocol_Foundation_v1.0</span>
               </div>
               <div className="space-y-10">
                  <h1 className="text-6xl md:text-[9rem] font-black text-white uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
                     The Last<br />
                     <span className="text-maroon italic">Blockchain.</span>
                  </h1>
                  <p className="border-l-4 border-maroon pl-12 text-zinc-500 text-xl md:text-3xl max-w-2xl leading-relaxed font-medium italic">
                     {content.subtitle}
                  </p>
               </div>
            </div>

            {/* CORE VALUES GRID - Premium Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 mb-32 md:mb-48">
               {[
                  { icon: Target, title: content.mission.title, desc: content.mission.desc, label: 'Strategic_Directive' },
                  { icon: Globe, title: content.vision.title, desc: content.vision.desc, label: 'Global_Continuum' },
                  { icon: Users, title: content.collective.title, desc: content.collective.desc, label: 'Standard_Protocol' }
               ].map((item, i) => (
                  <div key={i} className="group relative p-1.5 rounded-[3rem] silk-panel transition-all duration-700 hover:-translate-y-2">
                     <div className="bg-zinc-950 h-full rounded-[2.9rem] p-12 flex flex-col items-center text-center border border-white/[0.02] group-hover:border-maroon/20 transition-all duration-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center border border-white/5 group-hover:bg-maroon transition-all duration-700 shadow-2xl mb-12 relative z-10">
                           <item.icon className="w-10 h-10 text-zinc-600 group-hover:text-white transition-colors duration-700" />
                        </div>

                        <div className="relative z-10 space-y-6">
                           <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono italic mb-2">{item.label}</p>
                           <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter group-hover:text-maroon transition-colors duration-700">{item.title}</h3>
                           <div className="h-px w-12 bg-maroon/20 mx-auto group-hover:w-24 transition-all duration-700" />
                           <p className="text-sm md:text-base text-zinc-500 font-medium leading-relaxed italic group-hover:text-zinc-400 transition-colors">
                              {item.desc}
                           </p>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
                     </div>
                  </div>
               ))}
            </div>

            {/* STRATEGIC PARTNERS - High-Fidelity Strip */}
            <div className="relative group">
               <div className="absolute -inset-4 bg-maroon/[0.02] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="silk-panel p-16 md:p-24 rounded-[4rem] border-zinc-900 bg-zinc-950 flex flex-col items-center gap-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />

                  <div className="text-center space-y-4 relative z-10">
                     <p className="text-[10px] font-black text-maroon uppercase tracking-[0.5em] font-mono">Institutional_Backing</p>
                     <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Strategic Partnerships</h2>
                  </div>

                  <div className="flex flex-wrap justify-center gap-12 md:gap-32 relative z-10">
                     {content.partners.map((p) => (
                        <div key={p} className="group/logo flex flex-col items-center gap-4 transition-all duration-700 hover:scale-110">
                           <span className="text-2xl md:text-4xl font-black text-zinc-700 group-hover/logo:text-white transition-all uppercase tracking-tighter">
                              {p.replace('_', ' ')}
                           </span>
                           <div className="h-[2px] w-0 bg-maroon group-hover/logo:w-full transition-all duration-700" />
                        </div>
                     ))}
                  </div>

                  <div className="absolute bottom-10 left-0 w-full flex justify-center opacity-10">
                     <p className="text-[8px] font-mono font-black uppercase tracking-[1em] text-zinc-500 underline decoration-maroon underline-offset-8">Confidential_Release_Alpha</p>
                  </div>
               </div>
            </div>

            {/* METRIC STRIP - Bonus Detail */}
            <div className="mt-32 border-t border-white/[0.03] pt-12 flex flex-col md:flex-row justify-between items-center gap-10 opacity-30 group hover:opacity-100 transition-opacity duration-700">
               <div className="flex items-center gap-8">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-zinc-600 uppercase font-mono tracking-widest">Est_Network_Value</p>
                     <p className="text-xl font-black text-white font-mono">$1.4B+</p>
                  </div>
                  <div className="h-10 w-px bg-zinc-900" />
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-zinc-600 uppercase font-mono tracking-widest">Global_Latency</p>
                     <p className="text-xl font-black text-white font-mono">380ms</p>
                  </div>
               </div>
               <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono">Argus_Protocol_Core © 2026</p>
            </div>
         </div>
      </PublicLayout>
   );
};

export default About;
