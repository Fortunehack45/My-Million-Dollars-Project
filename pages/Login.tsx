
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

  const getLocalTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const [timestamp, setTimestamp] = useState(getLocalTime());
  const [bootSequence, setBootSequence] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(getLocalTime()), 1000);
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
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row relative selection:bg-maroon selection:text-white">

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
              <div className="w-10 h-10 border border-maroon flex items-center justify-center bg-maroon/5">
                <span className="font-gothic text-2xl text-maroon leading-none mt-1">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-gothic text-white tracking-normal leading-none">Argus Protocol</h1>
                <p className="label-meta mt-1 opacity-50">Infrastructure Authorization Service</p>
              </div>
            </div>
            <div className="text-right">
              <p className="label-meta">Region: AWS-EAST-1</p>
              <p className="label-meta text-maroon">Status: Secure_Protocol_v2</p>
            </div>
          </div>

          {/* Main Telemetry Grid */}
          <div className="grid grid-cols-2 gap-px border border-zinc-900 bg-zinc-900 mb-12">
            {/* Left: Epoch Sync Health Chart */}
            <div className="p-8 bg-zinc-950 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-maroon" />
                  <span className="label-meta">Epoch_Sync_Health</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600">↑ 99.97%</span>
              </div>
              {/* Deterministic bar chart for professional, stable look */}
              <div className="h-28 flex items-end gap-[2px]">
                {[55, 70, 45, 80, 65, 90, 50, 75, 85, 60, 70, 95, 55, 80, 65, 75, 90, 50, 70, 85, 60, 95, 55, 70, 80, 65, 45, 90, 75, 55, 85, 60, 70, 50, 95, 65, 80, 55, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-all duration-700 cursor-crosshair group"
                    style={{ height: `${h}%` }}
                  >
                    <div className="w-full h-full bg-maroon/[0.15] group-hover:bg-maroon/50 transition-colors duration-300" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <span className="text-[8px] font-mono text-zinc-700">Epoch #14,022,001</span>
                <span className="text-[8px] font-mono text-zinc-700">Δ: 14ms</span>
              </div>
            </div>

            {/* Right: Topology Overview */}
            <div className="p-8 bg-zinc-950 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <span className="label-meta">Topology_Overview</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">6/6 Nodes</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'NA_W', lat: 2 }, { id: 'NA_E', lat: 5 }, { id: 'EU_W', lat: 8 }, { id: 'EU_C', lat: 11 }, { id: 'AS_E', lat: 18 }, { id: 'AU_S', lat: 22 }].map((node) => (
                  <div key={node.id} className="border border-zinc-900 hover:border-maroon/30 p-3 flex flex-col items-center gap-2 bg-zinc-900/30 transition-colors duration-500 group">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)] group-hover:shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div>
                    <span className="text-[8px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">{node.id}</span>
                    <span className="text-[7px] font-mono text-zinc-700">{node.lat}ms</span>
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
              <p><span className="text-emerald-500 mr-2">OK</span> {timestamp} Booting Argus Kernel v2.4.0...</p>
              <p><span className="text-emerald-500 mr-2">OK</span> {timestamp} Initializing encrypted tunnel layers...</p>
              <p><span className="text-maroon mr-2">!!</span> {timestamp} Waiting for Operator Credentials</p>
              <div className="pt-2 flex items-center gap-3">
                <div className="h-[2px] bg-zinc-800 flex-1 overflow-hidden">
                  <div className="h-full bg-maroon" style={{ width: `${bootSequence}%` }}></div>
                </div>
                <span className="text-maroon font-bold">{bootSequence}%</span>
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
            <div className="border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden group/btn transition-all duration-700 bg-zinc-950">
              <button
                onClick={login}
                className="w-full py-6 flex items-center justify-between px-8 relative overflow-hidden active:scale-[0.98] transition-all duration-700"
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-maroon/[0.04] via-zinc-900/0 to-transparent opacity-0 group-hover/btn:opacity-100 transition-all duration-700"></div>
                {/* Left: Google logo + text */}
                <div className="flex items-center gap-6 relative z-10">
                  {/* Full-color Google G logo - Starts grayscale, animates to color on parent hover */}
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover/btn:shadow-lg transition-all duration-700 shrink-0 grayscale group-hover/btn:grayscale-0">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-black text-white uppercase tracking-[0.2em] group-hover/btn:text-zinc-300 transition-all duration-500">Continue with Google</span>
                    <span className="block label-meta mt-1 opacity-40">Encrypted · RSA-4096 · Zero-trust handshake</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-700 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all duration-500 relative z-10" />
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
