import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import {
  Terminal,
  Cpu,
  Network,
  Shield,
  Zap,
  GitBranch,
  Box,
  Activity,
  Server,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Hash,
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for class merging
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const CodeBlock = ({ code, language = 'bash', title }: { code: string; language?: string; title?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-zinc-800/50 bg-[#070707] shadow-2xl group/code">
      {(title || language) && (
        <div className="flex items-center justify-between px-6 py-3 bg-zinc-900/20 border-b border-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 backdrop-blur-md">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/10"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/10"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-maroon/20 border border-maroon/10"></div>
            </div>
            {title && <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{title}</span>}
            {!title && <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{language}</span>}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1 hover:bg-zinc-800/50 rounded-lg transition-all text-zinc-500 hover:text-white"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest">{copied ? 'Copied' : 'Copy'}</span>
            {copied ? <Check size={12} className="text-maroon" /> : <Copy size={12} />}
          </button>
        </div>
      )}
      <div className="p-6 overflow-x-auto custom-scrollbar">
        <pre className="text-[13px] font-mono text-zinc-300 leading-relaxed selection:bg-maroon/20">
          {code}
        </pre>
      </div>
    </div>
  );
};

const Endpoint = ({ method, path, description }: { method: 'GET' | 'POST' | 'WS'; path: string; description: string }) => {
  const colors = {
    GET: 'bg-maroon/10 text-maroon border-maroon/20',
    POST: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    WS: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-baseline gap-3 py-3 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-3 shrink-0">
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border font-mono", colors[method])}>
          {method}
        </span>
        <code className="text-sm font-mono text-zinc-200">{path}</code>
      </div>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
};

const SectionHeading = ({ id, children, icon: Icon }: { id: string; children: React.ReactNode; icon?: any }) => (
  <h2 id={id} className="group flex items-center gap-3 text-2xl font-black text-white uppercase tracking-tight mt-20 mb-8 scroll-mt-32">
    {Icon && <Icon className="w-5 h-5 text-zinc-700 group-hover:text-maroon transition-all duration-500" />}
    {children}
    <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-400 transition-opacity">
      <Hash size={16} />
    </a>
  </h2>
);

const Docs = () => {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'architecture', 'crates', 'prerequisites', 'quick-start', 'api', 'streams', 'math'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const NavItem = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => scrollTo(id)}
      className={cn(
        "w-full text-left px-3 py-1.5 text-[13px] border-l transition-all duration-200",
        activeSection === id
          ? "border-maroon text-maroon font-medium"
          : "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
      )}
    >
      {label}
    </button>
  );

  return (
    <PublicLayout>
      <div className="min-h-screen bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-16">

            {/* Sidebar Navigation */}
            <div className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-28">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 pl-3">Documentation</h3>
                <nav className="space-y-0.5">
                  <NavItem id="overview" label="Introduction" />
                  <NavItem id="architecture" label="Architecture" />
                  <NavItem id="crates" label="Core Stack" />
                  <NavItem id="prerequisites" label="Prerequisites" />
                  <NavItem id="quick-start" label="Quick Start" />
                  <NavItem id="api" label="API Reference" />
                  <NavItem id="streams" label="WebSocket Streams" />
                  <NavItem id="math" label="Mathematical Model" />
                </nav>

                <div className="mt-10 pl-3">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Community</h4>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-2 text-[13px] text-zinc-500 hover:text-maroon transition-colors mb-2"
                  >
                    GitHub Repository <ExternalLink size={12} />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-2 text-[13px] text-zinc-500 hover:text-maroon transition-colors"
                  >
                    Discord Server <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 max-w-3xl">

              {/* Hero Section */}
              <section id="overview" className="mb-16 scroll-mt-32">
                <div className="flex items-center gap-2 mb-6 text-sm text-zinc-500">
                  <span>Docs</span>
                  <ChevronRight size={14} />
                  <span className="text-zinc-300">Introduction</span>
                </div>

                <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
                  Argus<br />
                  <span className="text-maroon">Protocol.</span>
                </h1>

                <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed mb-12 font-medium border-l-2 border-zinc-900 pl-8">
                  A zero-ops orchestration layer for GhostDAG nodes. Argus linearizes the 3D block-DAG into deterministic streams for GNNs and autonomously optimizes network parameters using reinforcement learning.
                </p>

                <div className="flex gap-6 mb-16">
                  <button
                    onClick={() => scrollTo('quick-start')}
                    className="h-12 px-8 bg-white text-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center gap-3 active:scale-95"
                  >
                    Start_Building
                    <ArrowRight size={16} />
                  </button>
                  <a
                    href="https://github.com/ArgusProtocol/Argus-Synapse.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 px-8 bg-zinc-900/50 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-3 backdrop-blur-md"
                  >
                    <GitBranch size={16} className="text-zinc-500" />
                    Source_Core
                  </a>
                </div>

                <div className="silk-panel p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-maroon/30 transition-silk duration-700">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 blur-3xl rounded-full group-hover:bg-maroon/10 transition-silk"></div>
                  <div className="flex gap-6 relative z-10">
                    <div className="shrink-0 w-1.5 h-16 bg-maroon rounded-full blur-[1px] animate-pulse" />
                    <div>
                      <h4 className="label-meta text-maroon mb-2">Core Philosophy</h4>
                      <p className="text-xl text-zinc-300 font-light leading-relaxed italic tracking-tight group-hover:text-white transition-silk">
                        "From Tangled DAGs to Deterministic Streams."
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-zinc-900 w-full mb-12" />

              <SectionHeading id="architecture" icon={Network}>Architecture</SectionHeading>
              <p className="text-zinc-400 leading-7 mb-6">
                Argus sits between the raw GhostDAG node and your application layer. It acts as a linearization engine, flattening the complex 3D graph structure into a consumable edge stream.
              </p>

              <div className="bg-[#0D0D0D] border border-zinc-800 rounded-lg p-6 overflow-x-auto shadow-inner">
                <pre className="font-mono text-xs md:text-[13px] text-zinc-400 leading-tight">
                  {`┌─────────────────────────────────────────────────────────────────┐
│                     Frontend / GNN Client                        │
│       REST (JSON)  +  WebSocket (JSON stream)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │  Zero-Ops API  (port 8080)
┌────────────────────────▼────────────────────────────────────────┐
│                  ARGUS ORCHESTRATION LAYER                       │
│                                                                  │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐  │
│  │  Self-Healing    │  │     Linearization Engine            │  │
│  │  Agent (FSM)     │  │  GhostDAG 3D → flat edge stream    │  │
│  │  + Recovery Loop │  │  PARENT_OF / BLUE_PAST / RED_PAST  │  │
│  └────────┬─────────┘  └──────────────────┬──────────────────┘  │
│           │                               │                      │
│  ┌────────▼───────────────────────────────▼──────────────────┐  │
│  │          PPO k-Optimizer  (orphan rate → k suggestion)    │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │  JSON-RPC + WebSocket
┌─────────────────────────────────▼───────────────────────────────┐
│                  GhostDAG Node  (unmodified kaspad)              │
│   GHOSTDAG(G,k) consensus — blue_score, past(), anticone()       │
└─────────────────────────────────────────────────────────────────┘`}
                </pre>
              </div>

              <SectionHeading id="crates" icon={Box}>Core Stack</SectionHeading>
              <p className="text-zinc-400 leading-7 mb-6">
                The protocol is modularized into specialized crates, each handling a specific aspect of the orchestration pipeline.
              </p>
              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium w-48">Crate</th>
                      <th className="px-6 py-3 font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                    {[
                      { name: 'argus-ghostdag', role: 'Mathematical core. Implements bit-perfect k-cluster coloring.' },
                      { name: 'argus-agent', role: 'Autonomous 4-state FSM for self-healing and recovery.' },
                      { name: 'argus-linearizer', role: 'Flattening engine for GNN-ready JSON streams.' },
                      { name: 'argus-pybridge', role: 'High-performance PyO3 bridge for Python orchestration.' },
                      { name: 'argus_rl', role: 'RL environment + PPO training for k-parameter tuning.' },
                      { name: 'argus_gateway', role: 'Zero-Ops FastAPI gateway for developers.' },
                    ].map((item, i) => (
                      <tr key={i} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-maroon text-xs">{item.name}</td>
                        <td className="px-6 py-4 text-zinc-400">{item.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionHeading id="prerequisites" icon={Check}>Prerequisites</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { tool: 'Rust', version: '≥ 1.75', note: 'Install via rustup' },
                  { tool: 'Python', version: '≥ 3.10', note: 'Required for RL and Gateway' },
                  { tool: 'kaspad', version: 'latest', note: 'Node binary with --utxoindex' },
                  { tool: 'OpenSSL', version: 'any', note: 'For secure RPC communication' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/10 flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white mb-1">{item.tool}</div>
                      <div className="text-xs text-zinc-500">{item.note}</div>
                    </div>
                    <div className="px-2 py-1 rounded bg-zinc-900 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                      {item.version}
                    </div>
                  </div>
                ))}
              </div>

              <SectionHeading id="quick-start" icon={Zap}>Quick Start</SectionHeading>

              <div className="space-y-8">
                <div>
                  <h3 className="text-base font-medium text-white mb-3">1. Build and Initialize</h3>
                  <p className="text-sm text-zinc-400 mb-4">Clone the repository and build the unified CLI binary using Cargo.</p>
                  <CodeBlock
                    title="Terminal"
                    code={`git clone https://github.com/ArgusProtocol/Argus-Synapse.git
cd Argus-Synapse

# Build the unified CLI binary
cargo build -p argus-cli --release`}
                  />
                </div>

                <div>
                  <h3 className="text-base font-medium text-white mb-3">2. Activate the CLI Node</h3>
                  <p className="text-sm text-zinc-400 mb-4">The <code className="text-maroon bg-maroon/10 px-1 rounded">argus</code> binary is the primary entry point.</p>
                  <CodeBlock
                    title="Terminal"
                    code={`# Check connectivity to your local kaspad node
./target/release/argus check --endpoint http://localhost:9293

# Start the Argus Orchestration Layer
./target/release/argus start --rpc-port 9293 --ws-port 9292 --k 3`}
                  />
                </div>

                <div>
                  <h3 className="text-base font-medium text-white mb-3">3. Setup Orchestrator</h3>
                  <p className="text-sm text-zinc-400 mb-4">Initialize the Python gateway for the RL agent.</p>
                  <CodeBlock
                    title="Terminal"
                    code={`cd python
pip install -r requirements.txt
uvicorn argus_gateway.main:app --host 0.0.0.0 --port 8080`}
                  />
                </div>
              </div>

              <SectionHeading id="api" icon={Server}>API Reference</SectionHeading>
              <div className="space-y-2">
                <Endpoint
                  method="GET"
                  path="/agent/health"
                  description="Returns the primary operational dashboard for the agent, including sync status and RL confidence."
                />
                <Endpoint
                  method="GET"
                  path="/dag/snapshot?n=100"
                  description="Returns the recent sub-graph formatted for Graph Neural Networks (GNNs)."
                />
                <Endpoint
                  method="POST"
                  path="/tx/submit-smart"
                  description="Guarantees the fastest inclusion by pointing new transactions to the 3-5 'Bluest' tips autonomously."
                />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-white mb-3">Example Response</h4>
                <CodeBlock
                  language="json"
                  title="Response Body"
                  code={`{
  "status": "SYNCED",
  "current_k": 18,
  "orphan_rate": 0.042,
  "rl_confidence": 0.91,
  "local_blue_score": 81204931,
  "network_blue_score": 81204931,
  "version": "0.1.0"
}`}
                />
              </div>

              <SectionHeading id="streams" icon={Activity}>WebSocket Streams</SectionHeading>
              <p className="text-zinc-400 leading-7 mb-6">
                Argus provides a real-time linearized block stream with PHANTOM total ordering via <code className="text-sm font-mono text-zinc-300">ws://localhost:8080/v1/stream/blocks</code>.
              </p>

              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Edge Type</th>
                      <th className="px-6 py-3 font-medium">Meaning</th>
                      <th className="px-6 py-3 font-medium">GNN Utility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                    {[
                      { type: 'PARENT_OF', meaning: 'Structural parent link', utility: 'Topology analysis' },
                      { type: 'BLUE_PAST', meaning: 'Block is in blue cluster', utility: 'Trust signal' },
                      { type: 'RED_PAST', meaning: 'Block is orphaned (red)', utility: 'Latency signal' },
                    ].map((item, i) => (
                      <tr key={i} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-purple-400 text-xs">{item.type}</td>
                        <td className="px-6 py-4 text-zinc-400">{item.meaning}</td>
                        <td className="px-6 py-4 text-zinc-500">{item.utility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionHeading id="math" icon={Cpu}>Mathematical Model</SectionHeading>
              <div className="space-y-6">
                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/10">
                  <h3 className="text-base font-bold text-white mb-3">PHANTOM Total Ordering</h3>
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    Argus resolves parallel block conflicts by applying the PHANTOM sorting rule. This ensures a deterministic ordering of the DAG.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 text-sm text-zinc-300">
                      <span className="font-mono text-zinc-500">01.</span>
                      <span>Sort by <code className="font-mono text-xs bg-zinc-800 px-1 py-0.5 rounded text-maroon">BlueScore(B)</code> ascending.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-zinc-300">
                      <span className="font-mono text-zinc-500">02.</span>
                      <span>XOR tie-break: <code className="font-mono text-xs bg-zinc-800 px-1 py-0.5 rounded">Hash(B) ⊕ Hash(SelectedParent(B))</code>.</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/10">
                  <h3 className="text-base font-bold text-white mb-3">RL k-Optimization</h3>
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                    The RL agent (Stable-Baselines3 PPO) monitors network metrics and adjusts <em>k</em> to maximize the reward function:
                  </p>
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded flex justify-center">
                    <code className="font-mono text-sm text-zinc-300">
                      R = ω₁(TPS) - ω₂(OrphanRate) - ω₃(SecurityMargin)
                    </code>
                  </div>
                </div>
              </div>

              <SectionHeading id="security" icon={Shield}>Security & Reliability</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Memoized Traversals', desc: 'past(B) and anticone(B) use internal caching. Amortized O(1).' },
                  { title: 'Thread Safety', desc: 'RwLock-protected DAG storage for parallel Read/Write throughput.' },
                  { title: 'RPC Resiliency', desc: 'Automatic retries and robust chunked JSON parsing.' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/10">
                    <h4 className="font-medium text-white mb-2 text-sm">{item.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-24 pt-8 border-t border-zinc-900 flex justify-between items-center">
                <div className="text-xs text-zinc-600">
                  Last updated: <span className="text-zinc-400">February 18, 2026</span>
                </div>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-maroon hover:underline">Edit this page on GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Docs;
