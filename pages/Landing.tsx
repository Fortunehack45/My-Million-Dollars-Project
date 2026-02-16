
import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Database,
  Terminal as TerminalIcon,
  Code2,
  Layers,
  Network
} from 'lucide-react';

const Landing = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // Simulated live telemetry stream
  const [telemetry, setTelemetry] = useState({
    latency: 14,
    nodes: 24802,
    blocks: 104290
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        latency: Math.floor(Math.random() * 5 + 12),
        nodes: prev.nodes + (Math.random() > 0.8 ? 1 : 0),
        blocks: prev.blocks + 1
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Structural Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-[100] bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 border border-primary/50 bg-primary/10 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <Hexagon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-lg tracking-tighter uppercase italic text-white">NexusNode</span>
              <span className="label-meta text-[7px] text-zinc-600">STAGING_NET v2.8</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Protocol', 'Validators', 'Roadmap', 'Docs'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </div>

          <button onClick={login} className="btn-primary !py-3 !px-8 flex items-center gap-3">
            Initialize Access <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero: Engineering The Mesh */}
      <section className="relative z-10 pt-24 pb-40 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="label-meta text-[8px] text-zinc-400">EPOCH_01_PROVISIONING :: 82% CAPACITY</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
                Validate the <br/>
                <span className="text-primary">Global Compute</span> <br/>
                Mesh.
              </h1>
              
              <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                Deploy infrastructure nodes on an elastic compute layer designed for high-availability decentralized applications. Mine credits and secure the Genesis registry.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <button onClick={login} className="btn-primary !px-12 !py-6 w-full sm:w-auto text-sm group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Provision Node <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <div className="flex flex-col">
                <p className="label-meta text-zinc-600 mb-2">Network Health</p>
                <div className="flex gap-1">
                  {Array.from({length: 12}).map((_, i) => (
                    <div key={i} className={`w-1.5 h-6 rounded-sm ${i < 10 ? 'bg-emerald-500/40' : 'bg-zinc-800'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Professional Terminal Component */}
            <div className="surface p-1 rounded-2xl shadow-2xl relative z-10">
              <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                <div className="bg-zinc-900/50 px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="w-3 h-3 text-zinc-600" />
                    <span className="label-meta text-[7px] text-zinc-400">TERMINAL_INSTANCE::084</span>
                  </div>
                </div>
                
                <div className="p-8 space-y-8 font-mono">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-zinc-600">ID::NEXUS_CORE</span>
                      <span className="text-emerald-500">READY</span>
                    </div>
                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[94%] shadow-[0_0_10px_#10b981]"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1 bg-primary/40 rounded-full"></div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-500 uppercase font-black">Current Yield Rate</p>
                        <p className="text-2xl text-white font-bold tracking-tighter">24.08 <span className="text-[10px] text-zinc-700">NEX / HR</span></p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/40 p-3 border border-zinc-900 rounded-lg">
                        <p className="text-[7px] text-zinc-600 uppercase font-black mb-1">Peering</p>
                        <p className="text-xs text-zinc-400">128 Nodes</p>
                      </div>
                      <div className="bg-zinc-900/40 p-3 border border-zinc-900 rounded-lg">
                        <p className="text-[7px] text-zinc-600 uppercase font-black mb-1">Integrity</p>
                        <p className="text-xs text-zinc-400">L-Level 9</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900">
                    <p className="text-[8px] text-zinc-700 leading-relaxed italic">
                      {/* Fix: Wrapped pseudo-code in template literal to prevent JSX from interpreting curly braces as an expression */}
                      {`// Initialize node validation sequence`} <br/>
                      {`await protocol.handshake({ auth: "GENESIS" });`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decorative Element */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Network Stats Bar: Professional Ticker */}
      <div className="border-y border-zinc-900 bg-zinc-950/50 backdrop-blur-md relative z-20 py-4 overflow-hidden">
        <div className="flex items-center gap-24 animate-marquee whitespace-nowrap">
          {Array.from({length: 6}).map((_, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-4">
                <span className="label-meta text-[9px] text-zinc-700">SYS_TELEMETRY</span>
                <span className="text-[10px] font-mono font-bold text-zinc-400">TPS: {Math.floor(Math.random() * 50 + 400)}</span>
                <span className="text-[10px] font-mono font-bold text-emerald-500">BLOCK: #{telemetry.blocks}</span>
                <span className="text-[10px] font-mono font-bold text-primary">NODES: {telemetry.nodes}</span>
                <span className="text-[10px] font-mono font-bold text-zinc-600">PING: {telemetry.latency}MS</span>
              </div>
              <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Protocol Specs Section */}
      <section id="protocol" className="relative z-10 py-40 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Protocol <br/> Architecture</h2>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">NexusNode isn't just a dashboard—it's a verifiable proof-of-uptime network designed for institutional compute demand.</p>
            </div>
            
            <div className="space-y-4">
              {['Elastic Scaling', 'Sub-Second Consensus', 'Mesh Topology'].map((item, i) => (
                <button 
                  key={item}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group ${activeTab === i ? 'bg-primary/5 border-primary/20 text-white' : 'bg-zinc-900/20 border-zinc-900 text-zinc-600 hover:border-zinc-800'}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">{item}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === i ? 'translate-x-1 text-primary' : 'group-hover:translate-x-1'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="surface p-12 rounded-3xl h-full border-zinc-900 bg-zinc-950 flex flex-col justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                    <Layers className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Layered Verification</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Our protocol uses hierarchical validation tiers. Every minute, nodes perform a cryptographically secure "heartbeat" check to ensure data persistence.</p>
                  <ul className="space-y-3">
                    {['24-Hour Epoch Resets', 'Zero-Knowledge Uptime Logs', 'Genesis Asset Verification'].map(li => (
                      <li key={li} className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        {li}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative overflow-hidden bg-zinc-900/20 rounded-2xl border border-zinc-900 p-8 flex flex-col justify-center">
                   <Code2 className="w-32 h-32 text-zinc-900 absolute -right-10 -bottom-10 rotate-12" />
                   <div className="space-y-4 relative z-10">
                      <p className="label-meta text-[8px] text-primary">Deployment_Logic</p>
                      <pre className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                        <code>
                          {`// Node Provisioning Sequence
define validator_01 {
  type: "ELASTIC_COMPUTE",
  region: "GLOBAL_MESH",
  multiplier: 1.2x,
  active: true
}`}
                        </code>
                      </pre>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Topology Visualization */}
      <section id="validators" className="relative z-10 py-32 bg-zinc-900/10 border-y border-zinc-900">
        <div className="px-6 max-w-7xl mx-auto w-full text-center space-y-16">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Verified Infrastructure</h2>
            <p className="text-zinc-500 text-sm font-medium">Join 24,000+ validators securing the staging network across 12 distinct geographic zones.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Avg Uptime', val: '99.94%', icon: Activity },
              { label: 'Total Mined', val: '1.4B NEX', icon: Database },
              { label: 'Active Nodes', val: '24,802', icon: Server },
              { label: 'Security Level', val: 'L-GRADE 9', icon: ShieldCheck }
            ].map((stat, i) => (
              <div key={i} className="surface p-8 rounded-2xl border-zinc-900 hover:border-zinc-800 transition-all">
                <stat.icon className="w-5 h-5 text-zinc-700 mx-auto mb-6" />
                <p className="label-meta text-[8px] text-zinc-600 mb-1 uppercase tracking-[0.3em]">{stat.label}</p>
                <p className="text-2xl font-mono font-bold text-white tracking-tighter">{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="relative group cursor-crosshair">
            <div className="surface rounded-3xl aspect-[21/9] flex items-center justify-center overflow-hidden bg-zinc-950 border-zinc-800">
              <Network className="w-40 h-40 text-zinc-900 absolute opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent z-10"></div>
              
              {/* Dynamic Map Pins */}
              <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_#f43f5e] animate-pulse"></div>
              <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"></div>
              <div className="absolute bottom-1/4 left-1/2 w-2.5 h-2.5 bg-primary/40 rounded-full"></div>
              
              <div className="relative z-20 space-y-2">
                <p className="label-meta text-[10px] text-zinc-500">Live Global Synchronization</p>
                <div className="flex items-center gap-6 justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-zinc-400">AMER_E</span>
                    <span className="text-xs font-bold text-white">12ms</span>
                  </div>
                  <div className="w-px h-8 bg-zinc-800"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-zinc-400">EURO_W</span>
                    <span className="text-xs font-bold text-white">18ms</span>
                  </div>
                  <div className="w-px h-8 bg-zinc-800"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-zinc-400">ASIA_N</span>
                    <span className="text-xs font-bold text-white">44ms</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 label-meta text-[8px] text-zinc-700 group-hover:text-primary transition-colors">
              // SCROLL_TO_VIEW_CLUSTER_METRICS
            </div>
          </div>
        </div>
      </section>

      {/* Genesis Authority Call-to-Action */}
      <section id="docs" className="relative z-10 py-48 px-6 text-center space-y-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="w-20 h-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(244,63,94,0.15)]">
            <Zap className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
            Secure your <br/>
            <span className="text-primary">Staging Slot</span> Today.
          </h2>
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Provisioning is on a first-come, first-served basis. Secure your node authority before the Genesis Epoch reaches capacity.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-8">
          <button onClick={login} className="btn-primary !px-16 !py-8 text-base font-black group relative overflow-hidden rounded-xl">
            <span className="relative z-10 flex items-center gap-4">
              Access Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          </button>
          <div className="flex items-center gap-12 opacity-40 grayscale">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-6" />
            <div className="w-px h-6 bg-zinc-800"></div>
            <p className="text-[9px] font-mono font-bold text-white tracking-[0.3em] uppercase">RSA-4096 Authenticated</p>
          </div>
        </div>
      </section>

      {/* Footer: Professional Data Registry */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950 py-20 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-16">
           <div className="md:col-span-5 space-y-8">
              <div className="flex items-center gap-4">
                <Hexagon className="w-8 h-8 text-primary" />
                <span className="font-black text-2xl tracking-tighter uppercase italic text-white">NexusNode</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-medium">
                The leading decentralized compute staging network for infrastructure engineers and node operators.
              </p>
              <div className="flex gap-4">
                {Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="w-10 h-10 border border-zinc-900 bg-zinc-900/40 rounded-lg hover:border-zinc-700 transition-colors flex items-center justify-center cursor-pointer">
                    <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              {[
                { title: 'Protocol', links: ['Consensus', 'Validator Map', 'Governance', 'NEX Credits'] },
                { title: 'Resources', links: ['Documentation', 'Terminal Guide', 'API Registry', 'Uptime Status'] },
                { title: 'Legal', links: ['Staging Terms', 'Privacy', 'Security Policy'] }
              ].map(group => (
                <div key={group.title} className="space-y-6">
                   <p className="label-meta text-[10px] text-white">{group.title}</p>
                   <ul className="space-y-3">
                      {group.links.map(link => (
                        <li key={link}>
                          <a href="#" className="text-[11px] font-bold text-zinc-600 hover:text-primary transition-colors uppercase tracking-widest">{link}</a>
                        </li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="label-meta text-[8px] text-zinc-800">© 2025 NEXUSNODE PROTOCOL KERNEL. ALL RIGHTS RESERVED. REV_BUILD: 2.8.4_STABLE</p>
           <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/30 border border-zinc-900 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="label-meta text-[7px] text-zinc-500 uppercase font-black">All Systems Operational</span>
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
          width: fit-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Landing;
