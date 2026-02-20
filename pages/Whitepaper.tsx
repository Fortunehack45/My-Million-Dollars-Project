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
         <div className="relative pt-32 pb-48 overflow-hidden bg-[#050505]">
            {/* Editorial Background Accents */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-maroon/[0.02] to-transparent pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-px h-full bg-zinc-900/50 ml-[5%] pointer-events-none hidden lg:block"></div>

            <div className="max-w-5xl mx-auto px-8 relative z-10">
               {/* Document Header */}
               <div className="mb-24 border-l-2 border-maroon pl-12 py-4">
                  <div className="flex items-center gap-4 mb-8">
                     <span className="text-[10px] font-black text-maroon uppercase tracking-[0.4em] px-3 py-1 bg-maroon/5 border border-maroon/10 rounded-md">
                        Technical_Paper_{content.version}
                     </span>
                     <div className="h-px flex-grow bg-zinc-900"></div>
                  </div>

                  <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-10 leading-[0.85] whitespace-pre-line select-none">
                     {content.title}
                  </h1>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <p className="text-2xl text-zinc-400 font-medium italic tracking-tight max-w-2xl leading-relaxed">
                        "{content.subtitle}"
                     </p>
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Argus_Labs_Core</span>
                        <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Est._2024_PHANTOM</span>
                     </div>
                  </div>
               </div>

               {/* Content Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                  {/* Table of Contents - Sidebar */}
                  <div className="lg:col-span-3 sticky top-32 h-fit hidden lg:block">
                     <div className="space-y-6">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Index_Structure</p>
                        <nav className="space-y-4">
                           {content.sections.map((section, idx) => (
                              <a
                                 key={idx}
                                 href={`#section-${idx}`}
                                 className="group flex items-center gap-3 text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-all"
                              >
                                 <span className="text-maroon group-hover:translate-x-1 transition-transform">0{idx + 1}</span>
                                 {section.title.split(' ')[0]}
                              </a>
                           ))}
                        </nav>
                     </div>
                  </div>

                  {/* Main Text Area */}
                  <div className="lg:col-span-9 space-y-32">
                     {content.sections.map((section, idx) => (
                        <section
                           key={idx}
                           id={`section-${idx}`}
                           className="group scroll-mt-32"
                        >
                           <div className="flex items-center gap-4 mb-10">
                              <span className="text-xs font-mono font-black text-maroon/40 group-hover:text-maroon transition-colors duration-700">0{idx + 1}_</span>
                              <h3 className="text-3xl font-black text-white uppercase tracking-tight group-hover:translate-x-2 transition-all duration-700">{section.title}</h3>
                           </div>

                           <div className="relative">
                              <div className="absolute -left-10 top-0 bottom-0 w-px bg-zinc-900 group-hover:bg-maroon/20 transition-colors duration-1000"></div>
                              <p className="whitespace-pre-wrap text-zinc-400 leading-[1.8] text-lg font-medium selection:bg-maroon/20">
                                 {section.content}
                              </p>
                           </div>
                        </section>
                     ))}

                     {/* Editorial Footer */}
                     <div className="pt-24 border-t border-zinc-900 flex justify-between items-center opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Argus Protocol</p>
                           <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">End_Of_Transmission</p>
                        </div>
                        <div className="w-12 h-12 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-center">
                           <div className="w-1.5 h-1.5 bg-maroon rounded-full animate-pulse"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </PublicLayout>
   );
};

export default Whitepaper;
