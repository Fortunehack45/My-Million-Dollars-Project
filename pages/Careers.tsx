
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
      <div className="pt-24 pb-32 max-w-7xl mx-auto px-6 min-h-screen">
         
         <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
               <Users className="w-3 h-3 text-maroon" />
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Argus Collective</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">{content.title}</h1>
            <p className="text-xl text-zinc-400 leading-relaxed">{content.subtitle}</p>
         </div>

         <div className="grid gap-6">
            {content.positions.map((job, i) => (
               <div key={i} className="group relative bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 p-8 rounded-3xl transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="space-y-3">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black bg-zinc-950 text-maroon px-2 py-1 rounded border border-zinc-900 uppercase tracking-widest">{job.department}</span>
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> {job.type}
                           </span>
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {job.location}
                           </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-maroon transition-colors">{job.title}</h3>
                        <p className="text-zinc-400 text-sm max-w-2xl">{job.description}</p>
                     </div>
                     
                     <button className="px-8 py-4 bg-zinc-950 border border-zinc-900 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-white hover:text-black transition-all flex items-center gap-2 shrink-0 group-hover:scale-105">
                        Apply Now <ArrowUpRight className="w-3 h-3" />
                     </button>
                  </div>
               </div>
            ))}

            {content.positions.length === 0 && (
               <div className="text-center py-20 border border-dashed border-zinc-900 rounded-3xl">
                  <p className="text-zinc-500 text-sm font-mono">No open positions available at this time.</p>
               </div>
            )}
         </div>

         <div className="mt-24 p-12 bg-zinc-950 rounded-[2.5rem] border border-zinc-900 text-center">
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-4">Don't see your role?</h3>
            <p className="text-zinc-500 mb-8">We are always looking for exceptional talent to join the protocol.</p>
            <a href="mailto:careers@argus.network" className="inline-flex items-center gap-2 text-maroon font-bold uppercase text-sm hover:underline tracking-widest">
               Email General Application <ArrowUpRight className="w-4 h-4" />
            </a>
         </div>

      </div>
    </PublicLayout>
  );
};

export default Careers;
