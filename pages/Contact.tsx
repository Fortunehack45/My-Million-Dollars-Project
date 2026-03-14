import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, AlertTriangle, Terminal, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitContactMessage, subscribeToContent, DEFAULT_CONTACT_CONFIG } from '../services/firebase';
import { ContactConfig } from '../types';
import MatrixBackground from '../components/MatrixBackground';
import SEO from '../components/SEO';

const Contact = () => {
   const { user } = useAuth();
   const [content, setContent] = useState<ContactConfig>(DEFAULT_CONTACT_CONFIG);
   const [formData, setFormData] = useState({ name: '', payload: '' });
   const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

   useEffect(() => {
      const unsub = subscribeToContent('contact', DEFAULT_CONTACT_CONFIG, setContent);
      return () => unsub();
   }, []);

   const handleSubmit = async () => {
      if (!formData.name || !formData.payload) return;

      const sanitizedPayload = formData.payload.trim().slice(0, 2000).replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const sanitizedName = formData.name.trim().slice(0, 100).replace(/</g, "&lt;").replace(/>/g, "&gt;");

      setStatus('submitting');
      try {
         await submitContactMessage({
            uid: user?.uid || null,
            name: sanitizedName,
            payload: sanitizedPayload
         });
         setStatus('success');
         setFormData({ name: '', payload: '' });
         setTimeout(() => setStatus('idle'), 5000);
      } catch (err) {
         console.error(err);
         setStatus('error');
         setTimeout(() => setStatus('idle'), 5000);
      }
   };

   return (
      <div className="relative min-h-screen bg-[#050505] text-zinc-300 font-mono selection:bg-maroon selection:text-white overflow-x-hidden">
         <SEO 
            title="Contact Us" 
            description="Establish an uplink with Argus Protocol. Secure communication channels for institutional inquiries and support."
         />
         
         {/* SYSTEM OVERLAY */}
         <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
           <MatrixBackground color="rgba(128, 0, 0, 0.05)" opacity={0.15} />
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(128,0,0,0.06),rgba(128,0,0,0.02),rgba(128,0,0,0.06))] bg-[length:100%_2px,3px_100%]"></div>
         </div>

         <div className="pt-40 pb-32 max-w-[1700px] mx-auto px-6 relative z-10 w-full">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
               {/* Info Side - Institutional Profile */}
               <div className="space-y-16">
                  <div className="space-y-10">
                     <div className="inline-flex items-center gap-4 px-6 py-3 bg-zinc-950/80 backdrop-blur-xl border border-white/[0.05] rounded-xl shadow-2xl">
                        <Terminal className="w-4 h-4 text-maroon animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">Protocol_Comms_v2.1</span>
                     </div>
                     <h1 className="text-6xl md:text-[8rem] font-black text-white uppercase tracking-tighter leading-[0.8] drop-shadow-2xl italic group">
                        Establish<br />
                        <span className="text-maroon italic group-hover:text-white transition-silk duration-700">Uplink.</span>
                     </h1>
                     <p className="border-l-4 border-maroon pl-12 text-zinc-500 text-xl md:text-2xl max-w-3xl leading-relaxed font-bold italic uppercase tracking-tight">
                        {content.subtitle}
                     </p>
                  </div>

                  <div className="space-y-6">
                     {[
                        { icon: MapPin, label: 'Physical_Vector', val: content.address, type: 'text' },
                        { icon: Clock, label: 'Continuum_Window', val: content.supportHours, type: 'text' }
                     ].map((item, i) => (
                        <div key={i} className="group relative glass-panel p-10 rounded-2xl overflow-hidden transition-all duration-700 hover:border-maroon/30 shadow-2xl">
                           <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                              <item.icon className="w-24 h-24 text-white" />
                           </div>
                           <div className="flex items-start gap-8 relative z-10">
                              <div className="w-16 h-16 bg-zinc-900/50 rounded-xl flex items-center justify-center border border-white/5 group-hover:bg-maroon transition-all duration-700 shadow-2xl shrink-0 group-hover:scale-110">
                                 <item.icon className="w-7 h-7 text-zinc-600 group-hover:text-white transition-colors duration-700" />
                              </div>
                              <div>
                                 <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-3 italic">{item.label}</h3>
                                 <p className="text-2xl md:text-3xl font-black text-zinc-100 group-hover:text-white transition-all whitespace-pre-line tracking-tighter leading-tight uppercase italic">{item.val}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Encryption Form Side */}
               <div className="relative">
                  <div className="glass-panel p-1.5 rounded-[2.5rem] bg-zinc-950/30 backdrop-blur-3xl border border-white/[0.05] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group">
                     <div className="bg-zinc-950/40 h-full rounded-[2.4rem] p-10 md:p-16 border border-white/[0.02] group-hover:border-maroon/20 transition-all duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                           <Radio className="w-64 h-64 text-white" />
                        </div>

                        <div className="relative z-10 space-y-12">
                           <div className="flex items-center justify-between border-b border-white/[0.05] pb-10">
                              <div className="flex items-center gap-4">
                                 <MessageSquare className="w-5 h-5 text-maroon animate-pulse" />
                                 <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] italic">Encrypted_Transmission_Link</span>
                              </div>
                              <Terminal className="w-4 h-4 text-zinc-800" />
                           </div>

                           <div className="space-y-10">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] ml-1 flex items-center gap-3 italic">
                                    <div className="w-1.5 h-1.5 rounded-full bg-maroon" /> Identity_Vector
                                 </label>
                                 <div className="relative group/name">
                                    <input
                                       type="text"
                                       value={formData.name}
                                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                       placeholder="ENTER_NAME_OR_IDENTIFIER"
                                       className="w-full bg-black/40 border border-white/[0.05] text-white px-8 py-6 rounded-xl focus:border-maroon/40 focus:bg-zinc-950/80 outline-none transition-all placeholder:text-zinc-800 font-black text-[11px] tracking-widest uppercase italic"
                                       disabled={status === 'submitting' || status === 'success'}
                                    />
                                    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-maroon transition-all duration-700 group-focus-within/name:w-full" />
                                 </div>
                              </div>
                              
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] ml-1 flex items-center gap-3 italic">
                                    <div className="w-1.5 h-1.5 rounded-full bg-maroon" /> Payload_Manifest
                                 </label>
                                 <textarea
                                    rows={8}
                                    value={formData.payload}
                                    onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
                                    placeholder="INITIATING_MESSAGE_PAYLOAD_HERE..."
                                    className="w-full bg-black/40 border border-white/[0.05] text-white px-8 py-6 rounded-xl focus:border-maroon/40 focus:bg-zinc-950/80 outline-none transition-all resize-none placeholder:text-zinc-800 font-black text-[11px] tracking-widest uppercase italic h-[250px]"
                                    disabled={status === 'submitting' || status === 'success'}
                                 ></textarea>
                              </div>
                           </div>

                           {status === 'success' && (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-xl flex items-center gap-6 animate-in fade-in zoom-in duration-500">
                                 <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                                 </div>
                                 <div className="flex-1">
                                    <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] italic leading-tight">Transmission_Successful</p>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none mt-2">Payload_Authenticated_And_Logged_Successfully</p>
                                 </div>
                              </div>
                           )}

                           {status === 'error' && (
                              <div className="bg-maroon/5 border border-maroon/10 p-8 rounded-xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                 <div className="w-14 h-14 bg-maroon/10 rounded-xl flex items-center justify-center shrink-0 border border-maroon/20">
                                    <AlertTriangle className="w-7 h-7 text-maroon" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[11px] font-black text-maroon uppercase tracking-[0.4em] italic">Uplink_Failure</p>
                                    <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest leading-none mt-1">Packet_Loss_Detected // REATTEMPT_LINK</p>
                                 </div>
                              </div>
                           )}

                           <button
                              onClick={handleSubmit}
                              disabled={status === 'submitting' || status === 'success' || !formData.name || !formData.payload}
                              className={`w-full py-8 rounded-xl flex items-center justify-center gap-5 text-[12px] font-black uppercase tracking-[0.6em] transition-all duration-700 relative overflow-hidden group/btn ${status === 'submitting' || status === 'success' || !formData.name || !formData.payload
                                 ? 'bg-zinc-900/30 text-zinc-700 cursor-not-allowed border border-white/[0.02]'
                                 : 'bg-white text-black hover:bg-maroon hover:text-white shadow-[0_0_50px_rgba(128,0,0,0.3)]'
                                 }`}
                           >
                              <span className="relative z-10 italic">{status === 'submitting' ? 'SIGINT & TRANSMITTING...' : status === 'success' ? 'TRANSMISSION_SECURED' : 'INITIATE_UPLINK'}</span>
                              {status !== 'submitting' && status !== 'success' && <Send className="w-5 h-5 relative z-10 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform" />}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
                           </button>

                           <div className="flex items-center justify-center gap-4 pt-4 opacity-20">
                              <div className="h-px w-10 bg-zinc-800" />
                              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-black italic">Argus_KeyExchange_v2.1</p>
                              <div className="h-px w-10 bg-zinc-800" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Contact;
