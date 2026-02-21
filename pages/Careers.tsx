
import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, DEFAULT_CAREERS_CONFIG } from '../services/firebase';
import { CareersConfig } from '../types';
import { Briefcase, MapPin, ArrowUpRight, Users } from 'lucide-react';

const Careers = () => {
   const [content, setContent] = useState<CareersConfig>(DEFAULT_CAREERS_CONFIG);

   useEffect(() => {
      const unsub = subscribeToContent('careers', DEFAULT_CAREERS_CONFIG, setContent);
      return () => unsub();
   }, []);

   return (
      <PublicLayout>
         <div className="pt-32 pb-48 max-w-7xl mx-auto px-6 min-h-screen relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(128,0,0,0.05),transparent_70%)] pointer-events-none" />

            <div className="text-center max-w-4xl mx-auto mb-32 md:mb-48 relative z-10">
               <div className="inline-flex items-center gap-4 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl mb-12">
                  <Users className="w-4 h-4 text-maroon animate-pulse" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] font-mono italic">Argus_Collective_v2.4</span>
               </div>
               <h1 className="text-6xl md:text-[8rem] font-black text-white uppercase tracking-tighter leading-[0.8] mb-12 drop-shadow-2xl">
                  Build the<br />
                  <span className="text-maroon">Frontier.</span>
               </h1>
               <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed font-medium italic border-l-2 border-maroon pl-10 inline-block text-left">
                  {content.subtitle}
               </p>
            </div>

            <div className="grid gap-10 relative z-10">
               {content.positions.map((job, i) => (
                  <div key={i} className="group relative silk-panel p-1.5 rounded-[3rem] transition-all duration-700 hover:-translate-y-2">
                     <div className="bg-zinc-950 h-full rounded-[2.9rem] p-10 md:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-12 border border-white/[0.02] group-hover:border-maroon/30 transition-all duration-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="space-y-6 flex-1 relative z-10">
                           <div className="flex flex-wrap items-center gap-4">
                              <span className="text-[9px] font-black bg-maroon/10 text-maroon px-4 py-1.5 rounded-full border border-maroon/20 uppercase tracking-[0.2em] font-mono">{job.department}</span>
                              <div className="flex items-center gap-5">
                                 <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-2 uppercase tracking-widest font-mono">
                                    <Briefcase className="w-3.5 h-3.5" /> {job.type}
                                 </span>
                                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                 <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-2 uppercase tracking-widest font-mono">
                                    <MapPin className="w-3.5 h-3.5" /> {job.location}
                                 </span>
                              </div>
                           </div>
                           <h3 className="text-3xl md:text-4xl font-black text-white group-hover:text-maroon transition-colors tracking-tighter uppercase">{job.title}</h3>
                           <p className="text-zinc-500 text-base md:text-lg max-w-3xl font-medium leading-relaxed italic border-l border-white/5 pl-8 group-hover:border-maroon/30 transition-all">
                              {job.description}
                           </p>
                        </div>

                        <button className="h-20 px-12 bg-zinc-900 text-white rounded-[1.5rem] border border-zinc-800 hover:bg-white hover:text-black transition-all duration-700 font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl shrink-0 group/btn relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
                           <span className="flex items-center gap-4 relative z-10">
                              Apply_Now <ArrowUpRight className="w-5 h-5" />
                           </span>
                        </button>

                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
                     </div>
                  </div>
               ))}

               {content.positions.length === 0 && (
                  <div className="silk-panel p-24 rounded-[3.5rem] text-center border-dashed border-zinc-900 bg-black/40">
                     <p className="text-zinc-600 text-lg font-mono font-black uppercase tracking-[0.5em] italic">No_Open_Vectors_Available</p>
                     <p className="text-[10px] text-zinc-800 mt-4 font-mono uppercase tracking-[0.3em]">Retrying_Sync_Cycle_3...</p>
                  </div>
               )}
            </div>

            {/* FOOTER CALL TO ACTION */}
            <div className="mt-40 relative group">
               <div className="absolute -inset-4 bg-maroon/[0.01] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <div className="silk-panel p-16 md:p-24 rounded-[4rem] bg-zinc-950 border-zinc-900/50 flex flex-col items-center text-center gap-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.02] to-transparent pointer-events-none" />

                  <div className="space-y-6 relative z-10">
                     <p className="text-[10px] font-black text-maroon uppercase tracking-[0.5em] font-mono">Speculative_Talent_Pool</p>
                     <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">Beyond the Framework</h3>
                     <p className="text-zinc-500 text-lg max-w-xl mx-auto italic font-medium leading-relaxed">
                        The Argus Collective is always evolving. If your vector isn't listed, define it yourself.
                     </p>
                  </div>

                  <a href="mailto:careers@argus.network" className="h-20 px-16 bg-maroon text-white rounded-[1.5rem] hover:bg-white hover:text-black transition-all duration-700 flex items-center gap-5 text-[11px] font-black uppercase tracking-[0.5em] group/link shadow-[0_20px_40px_-10px_rgba(128,0,0,0.4)] relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
                     <span className="relative z-10">Define_Vector</span>
                     <ArrowUpRight className="w-5 h-5 relative z-10" />
                  </a>

                  <div className="absolute bottom-10 left-0 w-full flex justify-center opacity-10">
                     <p className="text-[8px] font-mono font-black uppercase tracking-[1em] text-zinc-500">Argus_HR_Relay_Secure_Transmission</p>
                  </div>
               </div>
            </div>

         </div>
      </PublicLayout>
   );
};

export default Careers;
