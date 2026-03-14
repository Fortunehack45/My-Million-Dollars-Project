import React, { useState, useEffect } from 'react';
import { subscribeToContent, DEFAULT_CAREERS_CONFIG } from '../services/firebase';
import { CareersConfig } from '../types';
import { Briefcase, MapPin, ArrowUpRight, Users, Terminal, Radio } from 'lucide-react';
import MatrixBackground from '../components/MatrixBackground';
import SEO from '../components/SEO';

const Careers = () => {
   const [content, setContent] = useState<CareersConfig>(DEFAULT_CAREERS_CONFIG);

   useEffect(() => {
      const unsub = subscribeToContent('careers', DEFAULT_CAREERS_CONFIG, setContent);
      return () => unsub();
   }, []);

   return (
      <div className="relative min-h-screen bg-[#050505] text-zinc-300 font-mono selection:bg-maroon selection:text-white overflow-x-hidden">
         <SEO 
            title="Careers" 
            description="Join the Argus Collective and help build the next generation of institutional compute infrastructure for the multi-chain economy."
         />
         
         {/* SYSTEM OVERLAY */}
         <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
           <MatrixBackground color="rgba(128, 0, 0, 0.05)" opacity={0.15} />
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(128,0,0,0.06),rgba(128,0,0,0.02),rgba(128,0,0,0.06))] bg-[length:100%_2px,3px_100%]"></div>
         </div>

         <div className="pt-40 pb-32 max-w-[1700px] mx-auto px-6 relative z-10 w-full">
            
            <div className="text-left mb-32 md:mb-48 relative">
               <div className="inline-flex items-center gap-4 px-6 py-3 bg-zinc-950/80 backdrop-blur-xl border border-white/[0.05] rounded-xl shadow-2xl mb-12">
                  <Terminal className="w-4 h-4 text-maroon animate-pulse" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">Argus_Collective_v2.4</span>
               </div>
               <h1 className="text-6xl md:text-[8rem] font-black text-white uppercase tracking-tighter leading-[0.8] mb-12 drop-shadow-2xl italic">
                  Build the<br />
                  <span className="text-maroon italic">Frontier.</span>
               </h1>
               <p className="text-xl md:text-3xl text-zinc-500 max-w-2xl leading-relaxed font-bold italic uppercase tracking-tight border-l-4 border-maroon pl-12 inline-block">
                  {content.subtitle}
               </p>
            </div>

            <div className="grid gap-8 relative z-10">
               {content.positions.map((job, i) => (
                  <div key={job.title} className="group relative bg-zinc-950/50 border border-white/[0.05] p-10 md:p-16 rounded-xl overflow-hidden transition-all duration-700 hover:border-maroon/30">
                     <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <Terminal className="w-48 h-48 text-white" />
                     </div>

                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                        <div className="space-y-6 flex-1">
                           <div className="flex flex-wrap items-center gap-4">
                              <span className="text-[10px] font-black bg-maroon/10 text-maroon px-5 py-2 rounded-lg border border-maroon/20 uppercase tracking-[0.2em]">{job.department}</span>
                              <div className="flex items-center gap-5">
                                 <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-2 uppercase tracking-widest leading-none">
                                    <Briefcase className="w-4 h-4" /> {job.type}
                                 </span>
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                 <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-2 uppercase tracking-widest leading-none">
                                    <MapPin className="w-4 h-4" /> {job.location}
                                 </span>
                              </div>
                           </div>
                           <h3 className="text-3xl md:text-5xl font-black text-white group-hover:text-maroon transition-colors tracking-tighter uppercase italic">{job.title}</h3>
                           <p className="text-zinc-500 text-base md:text-xl max-w-4xl font-bold leading-relaxed italic uppercase tracking-tight border-l border-white/5 pl-8 group-hover:border-maroon/30 transition-all">
                              {job.description}
                           </p>
                        </div>

                        <button className="h-20 px-12 bg-zinc-900 border border-white/[0.05] text-white rounded-xl hover:bg-maroon transition-all duration-700 font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl shrink-0 group/btn relative overflow-hidden group-hover:border-maroon/40">
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
                           <span className="flex items-center gap-4 relative z-10 italic">
                              Apply_Now <ArrowUpRight className="w-5 h-5" />
                           </span>
                        </button>
                     </div>
                  </div>
               ))}

               {content.positions.length === 0 && (
                  <div className="bg-zinc-950/30 p-24 rounded-xl text-center border border-dashed border-zinc-900">
                     <p className="text-zinc-600 text-xl font-black uppercase tracking-[0.5em] italic">No_Open_Vectors_Available</p>
                     <p className="text-[10px] text-zinc-800 mt-4 font-black uppercase tracking-[0.3em]">Retrying_Sync_Cycle_3...</p>
                  </div>
               )}
            </div>

            {/* CALL TO ACTION */}
            <div className="mt-40 relative group bg-zinc-950/50 border border-white/[0.05] p-16 md:p-32 rounded-xl overflow-hidden shadow-2xl transition-all duration-700 hover:border-maroon/20">
               <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                  <Radio className="w-64 h-64 text-white" />
               </div>

               <div className="space-y-6 relative z-10 text-center">
                  <p className="text-[10px] font-black text-maroon uppercase tracking-[0.5em]">Speculative_Talent_Pool</p>
                  <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight italic">Beyond the Framework</h3>
                  <p className="text-zinc-500 text-lg md:text-2xl max-w-2xl mx-auto italic font-bold uppercase tracking-tight opacity-70 mb-12">
                     The Argus Collective is always evolving. If your vector isn't listed, define it yourself.
                  </p>
                  
                  <div className="flex justify-center">
                     <a href="mailto:careers@argus.network" className="h-20 px-24 bg-maroon text-white rounded-xl hover:brightness-110 transition-all duration-700 flex items-center justify-center gap-5 text-[11px] font-black uppercase tracking-[0.5em] group/link shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
                        <span className="relative z-10 italic">Define_Vector</span>
                        <ArrowUpRight className="w-5 h-5 relative z-10" />
                     </a>
                  </div>
               </div>

               <div className="mt-20 pt-12 border-t border-white/[0.05] flex justify-center opacity-10">
                  <p className="text-[8px] font-black uppercase tracking-[1em] text-zinc-500">Argus_HR_Relay_Secure_Transmission</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Careers;
