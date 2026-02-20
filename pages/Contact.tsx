
import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { subscribeToContent, DEFAULT_CONTACT_CONFIG } from '../services/firebase';
import { ContactConfig } from '../types';
import { Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [content, setContent] = useState<ContactConfig>(DEFAULT_CONTACT_CONFIG);

  useEffect(() => {
    const unsub = subscribeToContent('contact', DEFAULT_CONTACT_CONFIG, setContent);
    return () => unsub();
  }, []);

  return (
    <PublicLayout>
      <div className="pt-24 pb-32 max-w-7xl mx-auto px-6 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
           {/* Info Side */}
           <div className="space-y-12">
              <div className="space-y-6">
                 <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{content.title}</h1>
                 <p className="text-xl text-zinc-400 max-w-md">{content.subtitle}</p>
              </div>

              <div className="space-y-6">
                 <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex items-start gap-6 group hover:border-maroon/30 transition-colors">
                    <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-maroon/50 transition-colors">
                       <Mail className="w-6 h-6 text-zinc-400 group-hover:text-maroon" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Direct Uplink</h3>
                       <a href={`mailto:${content.email}`} className="text-2xl font-bold text-white hover:text-maroon transition-colors">{content.email}</a>
                    </div>
                 </div>

                 <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex items-start gap-6 group hover:border-maroon/30 transition-colors">
                    <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-maroon/50 transition-colors">
                       <MapPin className="w-6 h-6 text-zinc-400 group-hover:text-maroon" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Physical Node</h3>
                       <p className="text-lg font-bold text-white whitespace-pre-line">{content.address}</p>
                    </div>
                 </div>

                 <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex items-start gap-6 group hover:border-maroon/30 transition-colors">
                    <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-maroon/50 transition-colors">
                       <Clock className="w-6 h-6 text-zinc-400 group-hover:text-maroon" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Support Window</h3>
                       <p className="text-lg font-bold text-white">{content.supportHours}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Visual Form Side */}
           <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/5 blur-[100px] rounded-full"></div>
              
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-3 mb-8">
                    <MessageSquare className="w-5 h-5 text-maroon" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Encrypted Transmission</span>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Identity</label>
                       <input type="text" placeholder="Your Name / Org" className="w-full bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:border-maroon/50 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Return Frequency</label>
                       <input type="email" placeholder="email@domain.com" className="w-full bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:border-maroon/50 outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Payload</label>
                       <textarea rows={4} placeholder="Message content..." className="w-full bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl focus:border-maroon/50 outline-none transition-colors resize-none"></textarea>
                    </div>
                 </div>

                 <button className="w-full py-5 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-[0.15em] text-xs rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg">
                    Transmit Data <Send className="w-4 h-4" />
                 </button>
                 
                 <p className="text-[9px] text-zinc-600 text-center uppercase tracking-widest">
                    Secured by Argus Relay Protocol v2
                 </p>
              </div>
           </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Contact;
