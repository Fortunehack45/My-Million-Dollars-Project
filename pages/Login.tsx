import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Hexagon, ArrowRight, ShieldCheck, Terminal, Fingerprint } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Structural Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="grid grid-cols-12 h-full w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-white h-full"></div>
          ))}
        </div>
      </div>

      <div className="max-w-md w-full relative z-10 space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl group transition-all duration-500 hover:border-primary/50">
            <Hexagon className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">NexusNode</h1>
            <p className="label-meta tracking-[0.3em] text-zinc-600">Infrastructure Terminal Access</p>
          </div>
        </div>

        <div className="surface p-12 rounded-[2.5rem] space-y-10">
          <div className="text-center space-y-2">
             <h2 className="text-lg font-bold text-white tracking-tight uppercase">Authentication Required</h2>
             <p className="text-zinc-500 text-xs font-medium">Link your operator identity to initialize the validator environment.</p>
          </div>

          <button
            onClick={login}
            className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center space-x-4 group shadow-2xl shadow-primary/10"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 grayscale brightness-200" />
            <span className="text-[11px] font-black uppercase tracking-widest">Connect with Google</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="grid grid-cols-3 gap-4 pt-6">
             {[
               { label: 'Encrypted', icon: ShieldCheck },
               { label: 'Sandbox', icon: Terminal },
               { label: 'Verified', icon: Fingerprint }
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                     <item.icon className="w-4 h-4 text-zinc-600" />
                  </div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{item.label}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-4 justify-center opacity-20">
              <div className="h-[1px] bg-white flex-1"></div>
              <span className="label-meta text-[8px]">Protocol v2.0.4</span>
              <div className="h-[1px] bg-white flex-1"></div>
           </div>
           <p className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-tight leading-relaxed px-12">
             By accessing the terminal, you verify compliance with the staging epoch agreement.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;