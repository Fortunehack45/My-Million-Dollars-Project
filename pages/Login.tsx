import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Hexagon, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Cpu, 
  Lock,
  Terminal as TerminalIcon,
  Server
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [timestamp, setTimestamp] = useState(new Date().toISOString());
  const [bootSequence, setBootSequence] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date().toISOString()), 1000);
    // Boot sequence animation
    const bootTimer = setInterval(() => {
      setBootSequence(prev => (prev < 100 ? prev + 1 : 100));
    }, 20);
    return () => {
      clearInterval(timer);
      clearInterval(bootTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row relative selection:bg-primary selection:text-white">
      
      {/* Left Pane: Heavy Telemetry Dashboard */}
      <div className="hidden lg:flex lg:w-7/12 border-r border-zinc-900 flex-col p-12 relative overflow-hidden bg-zinc-950">
        {/* Fine Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-20">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 border border-primary flex items-center justify-center bg-primary/5">
                <Hexagon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-widest uppercase leading-none">Nexus_Terminal</h1>
                <p className="label-meta mt-1 opacity-50">Infrastructure Authorization Service</p>
              </div>
            </div>
            <div className="text-right">
              <p className="label-meta">Region: AWS-EAST-1</p>
              <p className="label-meta text-primary">Status: Secure_Protocol_v2</p>
            </div>
          </div>

          {/* Main Telemetry Grid */}
          <div className="grid grid-cols-2 gap-1 px-1 border border-zinc-900 bg-zinc-900/20 mb-12">
            <div className="p-8 border-r border-zinc-900 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary" />
                  <span className="label-meta">Epoch_Sync_Health</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">L: 14ms</span>
              </div>
              <div className="h-32 flex items-end gap-[2px]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary/10 hover:bg-primary/40 transition-all cursor-crosshair" 
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <span className="label-meta">Topology_Overview</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['NA_W', 'NA_E', 'EU_W', 'EU_C', 'AS_E', 'AU_S'].map((node) => (
                  <div key={node} className="border border-zinc-800 p-3 flex flex-col items-center gap-2 bg-zinc-900/40 hover:border-primary/50 transition-colors">
                    <span className="text-[8px] font-mono text-zinc-500">{node}</span>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Console Feed */}
          <div className="mt-auto border border-zinc-900 bg-zinc-950 p-6 space-y-4 font-mono text-[10px]">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-3">
               <div className="flex items-center gap-2">
                 <TerminalIcon className="w-3 h-3 text-zinc-600" />
                 <span className="label-meta text-zinc-400">Handshake_Sequence</span>
               </div>
               <span className="text-zinc-700">PID: 8042</span>
            </div>
            <div className="space-y-1 text-zinc-600">
              <p><span className="text-emerald-500 mr-2">OK</span> {timestamp} Booting NexusNode Kernel v2.4.0...</p>
              <p><span className="text-emerald-500 mr-2">OK</span> {timestamp} Initializing encrypted tunnel layers...</p>
              <p><span className="text-primary mr-2">!!</span> {timestamp} Waiting for Operator Credentials</p>
              <div className="pt-2 flex items-center gap-3">
                <div className="h-[2px] bg-zinc-800 flex-1 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${bootSequence}%` }}></div>
                </div>
                <span className="text-primary font-bold">{bootSequence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Access Portal */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative bg-zinc-950">
        <div className="w-full max-w-sm space-y-16">
          <header className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-tight">
              Access_Authority
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium border-l-2 border-zinc-900 pl-4">
              Authorized operators only. Connect your system identity to begin node validation.
            </p>
          </header>

          <div className="space-y-10">
            <div className="p-1 border border-zinc-900 bg-zinc-900/20 rounded-md">
              <button
                onClick={login}
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-primary/50 py-5 flex items-center justify-between group px-8 transition-all relative overflow-hidden active:scale-[0.98]"
              >
                <div className="flex items-center gap-6 relative z-10">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-5 h-5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                  <div className="text-left">
                    <span className="block text-[10px] font-black text-white uppercase tracking-widest">Connect Identity</span>
                    <span className="block text-[8px] text-zinc-600 uppercase font-mono group-hover:text-primary">Via Google Auth Relay</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 border border-zinc-900 space-y-2 bg-zinc-950">
                <ShieldCheck className="w-4 h-4 text-zinc-700" />
                <p className="label-meta text-[8px] opacity-40">Security</p>
                <p className="text-[9px] font-mono text-zinc-400">RSA-4096-AES</p>
              </div>
              <div className="p-5 border border-zinc-900 space-y-2 bg-zinc-950">
                <Cpu className="w-4 h-4 text-zinc-700" />
                <p className="label-meta text-[8px] opacity-40">System</p>
                <p className="text-[9px] font-mono text-zinc-400">Node_v2.4</p>
              </div>
            </div>
          </div>

          <footer className="pt-8 border-t border-zinc-900 flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Server className="w-3 h-3 text-zinc-800" />
              <p className="text-[8px] text-zinc-600 font-mono font-bold uppercase">System: OPERATIONAL</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;