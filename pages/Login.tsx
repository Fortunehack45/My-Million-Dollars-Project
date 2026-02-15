import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Hexagon, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  Fingerprint, 
  Activity, 
  Globe, 
  Cpu, 
  Lock
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [timestamp, setTimestamp] = useState(new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date().toISOString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row relative">
      
      {/* Left Pane: Network Status (Desktop Only) */}
      <div className="hidden lg:flex lg:w-3/5 border-r border-zinc-900 flex-col p-10 relative overflow-hidden">
        {/* Dynamic Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-6 mb-16">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
              <Hexagon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Nexus_Staging</h1>
              <p className="label-meta mt-1">V2.4.0 // Global Infrastructure</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary" />
                <span className="label-meta text-zinc-400">Network_Health</span>
              </div>
              <div className="h-24 surface rounded-lg flex items-end p-4 gap-1">
                {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors cursor-help" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <div className="flex justify-between font-mono text-[9px] text-zinc-600">
                <span>00:00:00</span>
                <span>LATENCY: 14MS</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-zinc-400" />
                <span className="label-meta text-zinc-400">Node_Distribution</span>
              </div>
              <div className="surface p-4 rounded-lg flex flex-col justify-center space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-mono">NORTH_AMERICA</span>
                  <span className="text-[10px] text-white font-mono">1,402 ACTIVE</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-3/4"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-mono">EUROPE_WEST</span>
                  <span className="text-[10px] text-white font-mono">942 ACTIVE</span>
                </div>
                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary/50 h-full w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="surface p-6 rounded-xl bg-zinc-900/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <p className="label-meta text-zinc-300">Live_Protocol_Feed</p>
              </div>
              <div className="space-y-2 font-mono text-[10px]">
                <p className="text-zinc-600"><span className="text-primary mr-2">OK</span> [14:42:01] Block #840,122 validated by Peer_0492</p>
                <p className="text-zinc-600"><span className="text-primary mr-2">OK</span> [14:42:05] Consensus reached for Staging_Epoch_12</p>
                <p className="text-zinc-400 font-bold underline cursor-default tracking-tight">
                  {">> "}SYSTEM READY FOR OPERATOR HANDSHAKE
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Access Terminal */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative bg-zinc-950">
        
        {/* Top Meta Info */}
        <div className="absolute top-10 right-10 flex flex-col items-end space-y-1">
          <p className="label-meta text-[9px]">{timestamp}</p>
          <p className="label-meta text-[9px] text-primary">ACCESS_MODE: ENCRYPTED</p>
        </div>

        <div className="w-full max-w-sm space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
              Terminal_Access
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
              Initialize your validator identity to secure the Argus network protocol.
            </p>
          </div>

          <div className="space-y-6">
            <div className="surface p-8 rounded-2xl space-y-8 relative group">
              {/* Corner Accents */}
              <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-primary opacity-40"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-primary opacity-40"></div>

              <div className="space-y-6">
                <button
                  onClick={login}
                  className="btn-primary w-full py-4 flex items-center justify-between group px-6"
                >
                  <div className="flex items-center gap-4">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-4 h-4 grayscale brightness-200 contrast-200" />
                    <span className="tracking-[0.15em]">Auth_Google</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] bg-zinc-900 flex-1"></div>
                  <span className="label-meta opacity-20">OR</span>
                  <div className="h-[1px] bg-zinc-900 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-zinc-600" />
                    <span className="text-[8px] font-black text-zinc-600 uppercase">Hardware_Key</span>
                  </div>
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col items-center gap-2">
                    <Lock className="w-4 h-4 text-zinc-600" />
                    <span className="text-[8px] font-black text-zinc-600 uppercase">Seed_Phrase</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-zinc-700" />
                <span className="text-[9px] font-mono font-bold text-zinc-700 uppercase">Sys_Arch: 64-bit</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-emerald-500/50" />
                <span className="text-[9px] font-mono font-bold text-zinc-700 uppercase">SSL: AES-256</span>
              </div>
            </div>
          </div>

          <footer className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed text-center">
              NexusNode Operating Environment // Proprietary & Confidential // Restricted Access 
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;