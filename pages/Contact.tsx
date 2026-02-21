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
         <div className="pt-24 pb-32 max-w-7xl mx-auto px-6 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
               {/* Info Side */}
               <div className="space-y-12">
                  <div className="space-y-6">
                     <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{content.title}</h1>
                     <p className="text-xl text-zinc-400 max-w-md">{content.subtitle}</p>
                  </div>

                  <div className="space-y-6">
                     <div className="p-8 silk-panel rounded-[2rem] flex items-start gap-6 group">
                        <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-maroon/50 transition-silk group-hover:scale-110">
                           <Mail className="w-7 h-7 text-zinc-400 group-hover:text-maroon transition-silk" />
                        </div>
                        <div>
                           <h3 className="label-meta text-zinc-500 mb-2">Direct Uplink</h3>
                           <a href={`mailto:${content.email}`} className="text-2xl font-black text-white hover:text-maroon transition-silk tracking-tight">{content.email}</a>
                        </div>
                     </div>

                     <div className="p-8 silk-panel rounded-[2rem] flex items-start gap-6 group">
                        <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-maroon/50 transition-silk group-hover:scale-110">
                           <MapPin className="w-7 h-7 text-zinc-400 group-hover:text-maroon transition-silk" />
                        </div>
                        <div>
                           <h3 className="label-meta text-zinc-500 mb-2">Physical Node</h3>
                           <p className="text-2xl font-black text-white whitespace-pre-line tracking-tight">{content.address}</p>
                        </div>
                     </div>

                     <div className="p-8 silk-panel rounded-[2rem] flex items-start gap-6 group">
                        <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-maroon/50 transition-silk group-hover:scale-110">
                           <Clock className="w-7 h-7 text-zinc-400 group-hover:text-maroon transition-silk" />
                        </div>
                        <div>
                           <h3 className="label-meta text-zinc-500 mb-2">Support Window</h3>
                           <p className="text-2xl font-black text-white tracking-tight">{content.supportHours}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Visual Form Side */}
               <div className="silk-panel rounded-[3rem] p-8 md:p-16 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-maroon/10 blur-[120px] rounded-full group-hover:bg-maroon/20 transition-silk"></div>

                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center gap-3 mb-8">
                        <MessageSquare className="w-5 h-5 text-maroon" />
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Encrypted Transmission</span>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Identity</label>
                           <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Your Name / Org"
                              className="w-full bg-zinc-950/50 border border-zinc-800/80 text-white px-6 py-4 rounded-xl focus:border-maroon/50 focus:bg-zinc-900 outline-none transition-all placeholder:text-zinc-700"
                              disabled={status === 'submitting' || status === 'success'}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Return Frequency</label>
                           <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="email@domain.com"
                              className="w-full bg-zinc-950/50 border border-zinc-800/80 text-white px-6 py-4 rounded-xl focus:border-maroon/50 focus:bg-zinc-900 outline-none transition-all placeholder:text-zinc-700"
                              disabled={status === 'submitting' || status === 'success'}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Payload</label>
                           <textarea
                              rows={5}
                              value={formData.payload}
                              onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
                              placeholder="Message content..."
                              className="w-full bg-zinc-950/50 border border-zinc-800/80 text-white px-6 py-4 rounded-xl focus:border-maroon/50 focus:bg-zinc-900 outline-none transition-all resize-none placeholder:text-zinc-700"
                              disabled={status === 'submitting' || status === 'success'}
                           ></textarea>
                        </div>
                     </div>

                     {status === 'success' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4 animate-fade-in-up">
                           <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Transmission Successful</p>
                              <p className="text-[10px] text-emerald-500/70 mt-0.5">Your payload has been securely logged.</p>
                           </div>
                        </div>
                     )}

                     {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 animate-fade-in-up">
                           <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-red-500 uppercase tracking-widest">Transmission Failure</p>
                              <p className="text-[10px] text-red-500/70 mt-0.5">Network uplink interrupted. Please check your connection and attempt re-entry.</p>
                           </div>
                        </div>
                     )}

                     <button
                        onClick={handleSubmit}
                        disabled={status === 'submitting' || status === 'success' || !formData.name || !formData.email || !formData.payload}
                        className={`w-full py-5 rounded-xl flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${status === 'submitting' || status === 'success' || !formData.name || !formData.email || !formData.payload
                           ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                           : 'bg-maroon text-white hover:bg-[#a00000] hover:scale-[1.02] shadow-[0_0_20px_rgba(128,0,0,0.3)]'
                           }`}
                     >
                        {status === 'submitting' ? 'Encrypting & Transmitting...' : status === 'success' ? 'Secured' : 'Transmit Data'}
                        {status !== 'submitting' && status !== 'success' && <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                     </button>

                     <p className="text-[9px] text-zinc-600 text-center uppercase tracking-widest font-mono">
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
