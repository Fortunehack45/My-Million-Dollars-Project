import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { 
  Hexagon, 
  ArrowRight, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Server,
  Terminal as TerminalIcon,
  ChevronRight,
  Database,
  Users
} from 'lucide-react';

const Landing = () => {
  const { login } = useAuth();
  const [tickerOffset, setTickerOffset] = useState(0);

  // Simulated live feed
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden">
      {/* Background Grid & FX */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-primary/40 bg-primary/5 flex items-center justify-center rounded-lg">
            <Hexagon className="w-5 h-5 text-primary" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">NexusNode</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <a href="#protocol" className="label-meta text-[10px] hover:text-white transition-colors">Protocol</a>
            <a href="#topology" className="label-meta text-[10px] hover:text-white transition-colors">Topology</a>
            <a href="#governance" className="label-meta text-[10px] hover:text-white transition-colors">Governance</a>
          </div>
          <button onClick={login} className="btn-secondary !px-6 !py-2.5">Access Terminal</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                <span className="label-meta text-[8px] text-zinc-400">EPOCH_01 :: Genesis Provisioning Active</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                The Future of <br/>
                <span className="text-primary">Decentralized</span> <br/>
                Compute.
              </h1>
              <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                A high-performance infrastructure layer for the next generation of decentralized applications. Mine network credits, validate nodes, and secure your place in the Genesis epoch.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button onClick={login} className="btn-primary !px-10 !py-5 w-full sm:w-auto flex items-center justify-center gap-3 group">
                Initialize Node Authorization
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4 px-6 py-4 rounded-xl border border-zinc-900 bg-zinc-900/20">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border border-zinc-950 bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-500">OP</div>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-zinc-500">14.2k Active Validators</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Terminal Preview Card */}
            <div className="surface p-1 rounded-3xl rotate-2 hover:rotate-0 transition-transform duration-700 shadow-2xl">
              <div className="bg-zinc-950 rounded-[1.4rem] overflow-hidden border border-zinc-800">
                <div className="bg-zinc-900/50 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                  </div>
                  <span className="label-meta text-[8px]">CORE_INFRA_STAGING</span>
                </div>
                <div className="p-8 space-y-6 font-mono">
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-600">[0.00s] Initializing NexusNode Kernel...</p>
                    <p className="text-[10px] text-emerald-500">[0.12s] Peer topology verified: 128 nodes</p>
                    <p className="text-[10px] text-primary animate-pulse">[0.45s] Awaiting Authorization...</p>
                  </div>
                  <div className="h-40 border border-zinc-900 bg-zinc-900/20 rounded-lg flex items-end p-4 gap-1">
                    {Array.from({length: 20}).map((_, i) => (
                      <div key={i} className="flex-1 bg-primary/20" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
                    <div className="space-y-1">
                      <p className="label-meta text-[8px]">Session_Yield</p>
                      <p className="text-white font-bold">12.043 NEX</p>
                    </div>
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Stats Bar */}
      <div className="border-y border-zinc-900 bg-zinc-900/20 backdrop-blur-sm relative z-20">
        <div className="flex items-center overflow-hidden h-12 whitespace-nowrap">
          <div className="flex gap-12 animate-marquee py-3">
            {Array.from({length: 10}).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="label-meta text-[9px] text-zinc-600">NODE_ID::{Math.random().toString(36).substring(2, 7).toUpperCase()}</span>
                <span className="label-meta text-[9px] text-emerald-500 font-bold">CONNECTED</span>
                <span className="label-meta text-[9px] text-zinc-800">///</span>
                <span className="label-meta text-[9px] text-zinc-600">LATENCY::{Math.floor(Math.random() * 50)}MS</span>
                <span className="label-meta text-[9px] text-zinc-800">///</span>
                <span className="label-meta text-[9px] text-zinc-600">BLOCK_HEIGHT::{Math.floor(100000 + Math.random() * 5000)}</span>
                <span className="label-meta text-[9px] text-zinc-800">///</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="protocol" className="relative z-10 py-32 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-24">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Engineered for Performance</h2>
          <p className="text-zinc-500 text-sm font-medium">The NexusNode protocol utilizes a custom Proof-of-Uptime consensus to reward high-availability infrastructure operators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Elastic Mining', 
              desc: 'Participate in the 24-hour mining cycle. Each epoch resets the compute buffer, ensuring fair allocation across the network.',
              icon: Cpu,
              tag: 'UTILITY'
            },
            { 
              title: 'Topology P2P', 
              desc: 'Expand the network mesh by inviting peers. Each connection increases your infrastructure priority and credit yield.',
              icon: Globe,
              tag: 'NETWORK'
            },
            { 
              title: 'Genesis Authority', 
              desc: 'Claim Genesis NFTs to authenticate your node class. Authority holders receive permanent multipliers and DAO voting weight.',
              icon: ShieldCheck,
              tag: 'GOVERNANCE'
            }
          ].map((f, i) => (
            <div key={i} className="surface p-10 rounded-3xl space-y-8 hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <f.icon className="w-6 h-6 text-zinc-600 group-hover:text-primary" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white uppercase italic">{f.title}</h3>
                  <span className="label-meta text-[8px] text-zinc-700">{f.tag}</span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
              <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-primary uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                Read Documentation <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Telemetry / Data Section */}
      <section className="relative z-10 py-32 bg-zinc-900/20 border-y border-zinc-900">
        <div className="px-6 md:px-12 max-w-7xl mx-auto w-full">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                   <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-tight">Global Infrastructure <br/> Telemetry</h2>
                   <p className="text-zinc-500 text-sm leading-relaxed font-medium">Monitoring the health of the Nexus mesh. Our dashboard provides real-time visibility into the compute distribution across all major regions.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <p className="label-meta text-zinc-600">Total Provisioned</p>
                      <p className="text-3xl font-mono font-bold text-white tracking-tighter">1.2B NEX</p>
                   </div>
                   <div className="space-y-1">
                      <p className="label-meta text-zinc-600">Active Nodes</p>
                      <p className="text-3xl font-mono font-bold text-white tracking-tighter">24,802</p>
                   </div>
                   <div className="space-y-1">
                      <p className="label-meta text-zinc-600">Network Health</p>
                      <p className="text-3xl font-mono font-bold text-emerald-500 tracking-tighter">99.98%</p>
                   </div>
                   <div className="space-y-1">
                      <p className="label-meta text-zinc-600">Security Class</p>
                      <p className="text-3xl font-mono font-bold text-zinc-400 tracking-tighter">L-TYPE</p>
                   </div>
                </div>
              </div>

              <div className="relative">
                 {/* Decorative Pulse Map */}
                 <div className="surface p-8 rounded-3xl aspect-video flex flex-col items-center justify-center relative overflow-hidden bg-zinc-950">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-64 h-64 border border-zinc-900 rounded-full animate-ping opacity-20"></div>
                       <div className="w-48 h-48 border border-zinc-900 rounded-full animate-ping opacity-10"></div>
                    </div>
                    <Globe className="w-32 h-32 text-zinc-900" />
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#f43f5e]"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                    <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-primary rounded-full opacity-50"></div>
                    
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                       <Activity className="w-4 h-4 text-primary" />
                       <span className="label-meta text-[10px] text-zinc-500 font-bold uppercase">Uptime_Sequence::Monitoring</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-40 px-6 md:px-12 text-center space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">Ready to provision?</h2>
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
            Join the staging epoch today. The Genesis supply is limited to the first phase of validators.
          </p>
        </div>
        <button onClick={login} className="btn-primary !px-12 !py-6 text-sm uppercase font-black group relative overflow-hidden">
          <span className="relative z-10">Access Terminal Now</span>
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3 grayscale opacity-40">
              <Hexagon className="w-5 h-5 text-white" />
              <span className="font-black text-sm tracking-tighter uppercase italic text-white">NexusNode</span>
           </div>
           
           <div className="flex gap-12">
              <div className="space-y-3">
                 <p className="label-meta text-[8px] text-zinc-600">Infrastructure</p>
                 <div className="flex flex-col gap-2">
                    <a href="#" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase">Documentation</a>
                    <a href="#" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase">Network Map</a>
                 </div>
              </div>
              <div className="space-y-3">
                 <p className="label-meta text-[8px] text-zinc-600">Company</p>
                 <div className="flex flex-col gap-2">
                    <a href="#" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase">Whitepaper</a>
                    <a href="#" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase">Terms</a>
                 </div>
              </div>
           </div>

           <div className="text-center md:text-right">
              <p className="label-meta text-[8px] text-zinc-700">© 2025 NEXUSNODE PROTOCOL KERNEL. <br/> ALL RIGHTS RESERVED. SYS_REV: 2.8.4</p>
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 40s linear infinite;
          width: fit-content;
        }
      `}</style>
    </div>
  );
};

export default Landing;