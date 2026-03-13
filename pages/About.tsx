import React, { useState, useEffect } from 'react';
import { Users, Globe, Target, Terminal, Radio } from 'lucide-react';
import { subscribeToContent, DEFAULT_ABOUT_CONFIG } from '../services/firebase';
import { AboutConfig } from '../types';
import { motion } from 'framer-motion';
import MatrixBackground from '../components/MatrixBackground';

const About = () => {
   const [content, setContent] = useState<AboutConfig>(DEFAULT_ABOUT_CONFIG);

   useEffect(() => {
      const unsubscribe = subscribeToContent('about', DEFAULT_ABOUT_CONFIG, setContent);
      return () => unsubscribe();
   }, []);

   return (
      <div className="relative min-h-screen bg-[#050505] text-zinc-300 font-mono selection:bg-maroon selection:text-white overflow-x-hidden">
         
         {/* SYSTEM OVERLAY */}
         <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
           <MatrixBackground color="rgba(128, 0, 0, 0.05)" opacity={0.15} />
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(128,0,0,0.06),rgba(128,0,0,0.02),rgba(128,0,0,0.06))] bg-[length:100%_2px,3px_100%]"></div>
         </div>

         <div className="pt-40 pb-32 max-w-[1700px] mx-auto px-6 relative z-10 w-full">
            
            {/* HEADER - Dramatic Institutional Intro */}
            <div className="text-left space-y-12 mb-32 md:mb-48 relative">
               <div className="inline-flex items-center gap-4 px-6 py-3 bg-zinc-950/80 backdrop-blur-xl border border-white/[0.05] rounded-xl shadow-2xl">
                  <Terminal className="w-4 h-4 text-maroon animate-pulse" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">Protocol_Foundation_v1.0</span>
               </div>
               <div className="space-y-10">
                  <h1 className="text-6xl md:text-[10rem] font-black text-white uppercase tracking-tighter leading-[0.8] drop-shadow-2xl italic">
                     The Last<br />
                     <span className="text-maroon italic">Blockchain.</span>
                  </h1>
                  <p className="border-l-4 border-maroon pl-12 text-zinc-500 text-xl md:text-3xl max-w-3xl leading-relaxed font-bold italic uppercase tracking-tight">
                     {content.subtitle}
                  </p>
               </div>
            </div>

            {/* CORE VALUES GRID - Premium Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 md:mb-48">
               {[
                  { icon: Target, title: content.mission.title, desc: content.mission.desc, label: 'Strategic_Directive' },
                  { icon: Globe, title: content.vision.title, desc: content.vision.desc, label: 'Global_Continuum' },
                  { icon: Users, title: content.collective.title, desc: content.collective.desc, label: 'Standard_Protocol' }
               ].map((item, i) => (
                  <div key={item.label} className="group relative bg-zinc-950/50 border border-white/[0.05] p-10 rounded-xl overflow-hidden transition-all duration-700 hover:border-maroon/30">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <item.icon className="w-24 h-24 text-maroon" />
                     </div>
                     
                     <div className="relative z-10 space-y-6">
                        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic mb-2">{item.label}</p>
                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter group-hover:text-maroon transition-colors duration-700 italic">{item.title}</h3>
                        <div className="h-px w-12 bg-maroon/20 group-hover:w-24 transition-all duration-700" />
                        <p className="text-sm md:text-base text-zinc-500 font-bold leading-relaxed italic uppercase tracking-tight group-hover:text-zinc-400 transition-colors">
                           {item.desc}
                        </p>
                     </div>
                  </div>
               ))}
            </div>

            {/* STRATEGIC PARTNERS - High-Fidelity Strip */}
            <div className="relative group bg-zinc-950/50 border border-white/[0.05] p-16 md:p-32 rounded-xl overflow-hidden shadow-2xl transition-all duration-700 hover:border-maroon/20">
               <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                  <Radio className="w-64 h-64 text-white" />
               </div>

               <div className="text-center space-y-4 relative z-10 mb-20">
                  <p className="text-[10px] font-black text-maroon uppercase tracking-[0.5em]">Institutional_Backing</p>
                  <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">Strategic Partnerships</h2>
               </div>

               <div className="flex flex-wrap justify-center gap-12 md:gap-32 relative z-10">
                  {content.partners.map((p) => (
                     <div key={p} className="group/logo flex flex-col items-center gap-4 transition-all duration-700 hover:scale-110">
                        <span className="text-2xl md:text-4xl font-black text-zinc-800 group-hover/logo:text-white transition-all uppercase tracking-tighter italic">
                           {p.replace('_', ' ')}
                        </span>
                        <div className="h-[2px] w-0 bg-maroon group-hover/logo:w-full transition-all duration-700 shadow-[0_0_10px_#800000]" />
                     </div>
                  ))}
               </div>

               <div className="mt-24 pt-12 border-t border-white/[0.05] flex justify-center opacity-20">
                  <p className="text-[8px] font-mono font-black uppercase tracking-[1em] text-zinc-500">Argus_Protocol_Core_Infrastructure_Relay</p>
               </div>
            </div>

            {/* METRIC STRIP - Bonus Detail */}
            <div className="mt-32 border-t border-white/[0.05] pt-12 flex flex-col md:flex-row justify-between items-center gap-10 opacity-30 group hover:opacity-100 transition-opacity duration-700">
               <div className="flex items-center gap-8">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Est_Network_Value</p>
                     <p className="text-2xl font-black text-white italic tracking-tighter opacity-80 group-hover:opacity-100">$1.4B+</p>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Global_Latency</p>
                     <p className="text-2xl font-black text-white italic tracking-tighter opacity-80 group-hover:opacity-100">380MS</p>
                  </div>
               </div>
               <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic mb-2 group-hover:text-maroon transition-colors">Argus_Protocol_Core © 2026</p>
            </div>
         </div>
      </div>
   );
};

export default About;
