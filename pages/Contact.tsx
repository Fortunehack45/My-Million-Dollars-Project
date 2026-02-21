import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitContactMessage, subscribeToContent, DEFAULT_CONTACT_CONFIG } from '../services/firebase';
import { ContactConfig } from '../types';

const Contact = () => {
   const { user } = useAuth();
   // Assuming landingConfig is available from a parent component or context,
   // or that the user intends to fetch it differently.
   // For now, we'll keep the original content fetching mechanism for 'content'
   // as the edit only shows changing 'content' to 'landingConfig.contact'
   // without providing 'landingConfig' itself.
   // Reverting 'content' back to its original state management for now,
   // as the edit snippet was incomplete regarding 'landingConfig'.
   const [content, setContent] = useState<ContactConfig>(DEFAULT_CONTACT_CONFIG);

   const [formData, setFormData] = useState({ name: '', email: '', payload: '' });
   const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

   // The original useEffect for content subscription is retained as the edit
   // did not provide a full replacement for how 'content' would be sourced
   // if 'landingConfig' was not available.
   useEffect(() => {
      const unsub = subscribeToContent('contact', DEFAULT_CONTACT_CONFIG, setContent);
      return () => unsub();
   }, []);

   const handleSubmit = async () => {
      if (!formData.name || !formData.email || !formData.payload) return;

      // Basic Security Sanitization & Caps
      const sanitizedPayload = formData.payload
         .trim()
         .slice(0, 2000)
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");

      const sanitizedName = formData.name
         .trim()
         .slice(0, 100)
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");

      setStatus('submitting');
      try {
         await submitContactMessage({
            uid: user?.uid || null,
            name: sanitizedName,
            email: formData.email.trim(),
            payload: sanitizedPayload
         });
         setStatus('success');
         setFormData({ name: '', email: '', payload: '' });
         setTimeout(() => setStatus('idle'), 5000);
      } catch (err) {
         console.error(err);
         setStatus('error');
         setTimeout(() => setStatus('idle'), 5000);
      }
   };

   return (
      <PublicLayout>
         <div className="pt-32 pb-48 max-w-7xl mx-auto px-6 min-h-screen relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(128,0,0,0.05),transparent_70%)] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-40 relative z-10">
               {/* Info Side - Institutional Profile */}
               <div className="space-y-20">
                  <div className="space-y-10">
                     <div className="inline-flex items-center gap-3 px-5 py-2 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] font-mono italic">Protocol_Comms_v2.1</span>
                     </div>
                     <h1 className="text-6xl md:text-[8rem] font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
                        Establish<br />
                        <span className="text-maroon">Uplink.</span>
                     </h1>
                     <p className="border-l-2 border-maroon pl-10 text-zinc-500 text-lg md:text-2xl max-w-xl leading-relaxed font-medium italic">
                        {content.subtitle}
                     </p>
                  </div>

                  <div className="space-y-10">
                     {[
                        { icon: Mail, label: 'Secure_Node_Uplink', val: content.email, type: 'mail' },
                        { icon: MapPin, label: 'Physical_Vector', val: content.address, type: 'text' },
                        { icon: Clock, label: 'Continuum_Window', val: content.supportHours, type: 'text' }
                     ].map((item, i) => (
                        <div key={i} className="group relative overflow-hidden p-1.5 rounded-[2.5rem] silk-panel transition-all duration-700 hover:-translate-y-1">
                           <div className="bg-zinc-950 h-full rounded-[2.4rem] p-10 flex items-start gap-8 border border-white/[0.02] group-hover:border-maroon/30 transition-all duration-700">
                              <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-maroon transition-all duration-700 shadow-2xl shrink-0">
                                 <item.icon className="w-7 h-7 text-zinc-600 group-hover:text-white transition-colors duration-700" />
                              </div>
                              <div>
                                 <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono mb-3">{item.label}</h3>
                                 {item.type === 'mail' ? (
                                    <a href={`mailto:${item.val}`} className="text-2xl md:text-3xl font-black text-white hover:text-maroon transition-all tracking-tighter block">{item.val}</a>
                                 ) : (
                                    <p className="text-2xl md:text-3xl font-black text-white whitespace-pre-line tracking-tighter leading-tight">{item.val}</p>
                                 )}
                              </div>
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Encryption Form Side */}
               <div className="relative group">
                  <div className="absolute -inset-4 bg-maroon/[0.02] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="p-1.5 rounded-[4rem] silk-panel bg-zinc-950 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)]">
                     <div className="bg-zinc-950 h-full rounded-[3.9rem] p-10 md:p-20 border border-zinc-900 group-hover:border-maroon/20 transition-all duration-700 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.01] to-transparent -translate-y-full animate-scanline opacity-10 pointer-events-none"></div>

                        <div className="relative z-10 space-y-12">
                           <div className="flex items-center justify-between border-b border-white/[0.03] pb-10">
                              <div className="flex items-center gap-4">
                                 <div className="p-2.5 bg-maroon/10 rounded-xl">
                                    <MessageSquare className="w-5 h-5 text-maroon animate-pulse" />
                                 </div>
                                 <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] font-mono italic">Encrypted_Transmission_Link</span>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                           </div>

                           <div className="space-y-10">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] font-mono ml-1 flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-zinc-800" /> Identity_Vector
                                 </label>
                                 <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ENTER_NAME_OR_IDENTIFIER"
                                    className="w-full bg-black/40 border border-white/[0.03] text-white px-8 py-6 rounded-2xl focus:border-maroon/40 focus:bg-zinc-950 outline-none transition-all placeholder:text-zinc-800 font-mono text-[11px] tracking-widest font-black uppercase"
                                    disabled={status === 'submitting' || status === 'success'}
                                 />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] font-mono ml-1 flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-zinc-800" /> Response_Frequency
                                 </label>
                                 <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="UPLINK@DOMAIN.COM"
                                    className="w-full bg-black/40 border border-white/[0.03] text-white px-8 py-6 rounded-2xl focus:border-maroon/40 focus:bg-zinc-950 outline-none transition-all placeholder:text-zinc-800 font-mono text-[11px] tracking-widest font-black uppercase"
                                    disabled={status === 'submitting' || status === 'success'}
                                 />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] font-mono ml-1 flex items-center gap-3">
                                    <div className="w-1 h-1 rounded-full bg-zinc-800" /> Payload_Manifest
                                 </label>
                                 <textarea
                                    rows={5}
                                    value={formData.payload}
                                    onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
                                    placeholder="INITIATING_MESSAGE_PAYLOAD_HERE..."
                                    className="w-full bg-black/40 border border-white/[0.03] text-white px-8 py-6 rounded-2xl focus:border-maroon/40 focus:bg-zinc-950 outline-none transition-all resize-none placeholder:text-zinc-800 font-mono text-[11px] tracking-widest font-black uppercase h-[200px]"
                                    disabled={status === 'submitting' || status === 'success'}
                                 ></textarea>
                              </div>
                           </div>

                           {status === 'success' && (
                              <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-3xl flex items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
                                 <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] font-mono">Transmission_Successful</p>
                                    <p className="text-[10px] text-zinc-600 font-mono font-bold uppercase tracking-widest">Payload_Authenticated_And_Logged</p>
                                 </div>
                              </div>
                           )}

                           {status === 'error' && (
                              <div className="bg-maroon/5 border border-maroon/10 p-8 rounded-3xl flex items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
                                 <div className="w-14 h-14 bg-maroon/10 rounded-2xl flex items-center justify-center shrink-0 border border-maroon/20">
                                    <AlertTriangle className="w-7 h-7 text-maroon" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[11px] font-black text-maroon uppercase tracking-[0.4em] font-mono">Uplink_Failure</p>
                                    <p className="text-[10px] text-zinc-700 font-mono font-bold uppercase tracking-widest">Packet_Loss_Detected // REATTEMPT_LINK</p>
                                 </div>
                              </div>
                           )}

                           <button
                              onClick={handleSubmit}
                              disabled={status === 'submitting' || status === 'success' || !formData.name || !formData.email || !formData.payload}
                              className={`w-full py-8 rounded-[2rem] flex items-center justify-center gap-5 text-[12px] font-black uppercase tracking-[0.5em] transition-all duration-700 relative overflow-hidden group/btn mb-4 ${status === 'submitting' || status === 'success' || !formData.name || !formData.email || !formData.payload
                                 ? 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed border border-white/[0.02]'
                                 : 'bg-white text-black hover:bg-maroon hover:text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]'
                                 }`}
                           >
                              <span className="relative z-10">{status === 'submitting' ? 'SIGINT & TRANSMITTING...' : status === 'success' ? 'TRANSMISSION_SECURED' : 'INITIATE_UPLINK'}</span>
                              {status !== 'submitting' && status !== 'success' && <Send className="w-5 h-5 relative z-10 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform" />}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
                           </button>

                           <div className="flex items-center justify-center gap-4 py-4 opacity-40">
                              <div className="h-px w-10 bg-zinc-800" />
                              <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-mono font-black italic">Argus_KeyExchange_v2.1</p>
                              <div className="h-px w-10 bg-zinc-800" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </PublicLayout>
   );
};

export default Contact;
