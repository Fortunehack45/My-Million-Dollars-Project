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
  Code, 
  Copy, 
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for class merging
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/50 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <span className="text-xs font-mono text-zinc-500">{language}</span>
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-zinc-300"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
};

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'purple' | 'green' | 'rose' }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider", colors[color])}>
      {children}
    </span>
  );
};

const Section = ({ id, title, icon: Icon, children }: { id: string; title: string; icon?: any; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-24 mb-16">
    <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
      {Icon && <Icon className="w-6 h-6 text-primary" />}
      <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
    </div>
    <div className="space-y-4 text-zinc-400 leading-relaxed">
      {children}
    </div>
  </section>
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
        "w-full text-left px-4 py-2 text-sm border-l-2 transition-colors",
        activeSection === id 
          ? "border-primary text-white font-medium bg-primary/5" 
          : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
      )}
    >
      {label}
    </button>
  );

  return (
    <PublicLayout>
      <div className="min-h-screen bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-4">Contents</h3>
                  <nav className="space-y-1">
                    <NavItem id="overview" label="Overview" />
                    <NavItem id="architecture" label="Architecture" />
                    <NavItem id="crates" label="Crate Map" />
                    <NavItem id="prerequisites" label="Prerequisites" />
                    <NavItem id="quick-start" label="Quick Start" />
                    <NavItem id="api" label="API Reference" />
                    <NavItem id="streams" label="WebSocket Streams" />
                    <NavItem id="math" label="Under the Hood" />
                  </nav>
                </div>
                
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <h4 className="text-sm font-medium text-white mb-2">Need Help?</h4>
                  <p className="text-xs text-zinc-500 mb-3">Join our community of protocol engineers.</p>
                  <a href="#" className="text-xs text-primary hover:text-rose-400 flex items-center gap-1">
                    Join Discord <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              
              {/* Hero Section */}
              <section id="overview" className="mb-16 scroll-mt-24">
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge color="purple">Argus Orchestration</Badge>
                  <Badge color="blue">GhostDAG</Badge>
                  <Badge color="green">Agentic Infrastructure</Badge>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                  Argus Protocol
                  <span className="block text-2xl md:text-3xl font-normal text-zinc-500 mt-2">
                    Zero-Ops Agentic Gateway for GhostDAG
                  </span>
                </h1>

                <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 bg-zinc-900/30 rounded-r-lg">
                  <p className="text-xl text-zinc-300 italic font-serif">"From Tangled DAGs to Deterministic Streams."</p>
                </blockquote>

                <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                  Argus is a <strong className="text-white">senior-grade orchestration layer</strong> that sits on top of a GhostDAG / Kaspa node. 
                  It requires zero manual intervention — it monitors its own position in the k-cluster, recovers from blue-set 
                  divergence autonomously, linearizes the 3D block-DAG into a real-time edge stream for GNNs, and dynamically 
                  tunes the k-parameter using a live PPO reinforcement learning agent.
                </p>

                <div className="flex gap-4">
                  <a href="https://github.com/ArgusProtocol/Argus-Synapse.git" target="_blank" rel="noopener noreferrer" 
                     className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors">
                    <GitBranch size={18} />
                    Repository
                  </a>
                  <a href="https://argus-protocol.xyz" target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors border border-zinc-700">
                    <ExternalLink size={18} />
                    Website
                  </a>
                </div>
              </section>

              <Section id="architecture" title="Architecture" icon={Network}>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 overflow-x-auto font-mono text-xs md:text-sm text-zinc-300 leading-none shadow-2xl shadow-black/50">
                  <pre>{`
┌─────────────────────────────────────────────────────────────────┐
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
└─────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </Section>

              <Section id="crates" title="Crate Map (Core Stack)" icon={Box}>
                <div className="overflow-hidden rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900/50 text-zinc-400">
                      <tr>
                        <th className="px-6 py-4 font-medium">Crate</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-950/30">
                      {[
                        { name: 'argus-ghostdag', role: 'Mathematical core. Implements bit-perfect k-cluster coloring.' },
                        { name: 'argus-agent', role: 'Autonomous 4-state FSM for self-healing and recovery.' },
                        { name: 'argus-linearizer', role: 'Flattening engine for GNN-ready JSON streams.' },
                        { name: 'argus-pybridge', role: 'High-performance PyO3 bridge for Python orchestration.' },
                        { name: 'argus_rl', role: 'RL environment + PPO training for k-parameter tuning.' },
                        { name: 'argus_gateway', role: 'Zero-Ops FastAPI gateway for developers.' },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-primary">{item.name}</td>
                          <td className="px-6 py-4 text-zinc-300">{item.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id="prerequisites" title="Prerequisites" icon={Check}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { tool: 'Rust', version: '≥ 1.75', note: 'Install via rustup' },
                    { tool: 'Python', version: '≥ 3.10', note: 'Required for RL and Gateway' },
                    { tool: 'kaspad', version: 'latest', note: 'Node binary with --utxoindex' },
                    { tool: 'OpenSSL', version: 'any', note: 'For secure RPC communication' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/20 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">{item.tool}</div>
                        <div className="text-xs text-zinc-500">{item.note}</div>
                      </div>
                      <div className="px-2 py-1 rounded bg-zinc-800 text-xs font-mono text-zinc-300">
                        {item.version}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="quick-start" title="Quick Start" icon={Zap}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-400 border border-zinc-700">1</span>
                      Build and Initialize (Rust CLI)
                    </h3>
                    <CodeBlock code={`git clone https://github.com/ArgusProtocol/Argus-Synapse.git
cd Argus-Synapse

# Build the unified CLI binary
cargo build -p argus-cli --release`} />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-400 border border-zinc-700">2</span>
                      Activate the CLI Node
                    </h3>
                    <p className="text-sm text-zinc-400 mb-2 ml-8">Once built, the <code className="text-primary">argus</code> binary is the primary entry point.</p>
                    <CodeBlock code={`# Check connectivity to your local kaspad node
./target/release/argus check --endpoint http://localhost:9293

# Start the Argus Orchestration Layer
./target/release/argus start --rpc-port 9293 --ws-port 9292 --k 3`} />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs text-zinc-400 border border-zinc-700">3</span>
                      Setup Orchestrator (Python Gateway)
                    </h3>
                    <CodeBlock code={`cd python
pip install -r requirements.txt
uvicorn argus_gateway.main:app --host 0.0.0.0 --port 8080`} />
                  </div>
                  
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-3">
                    <Check className="w-5 h-5 shrink-0" />
                    Argus is now accessible at http://localhost:8080
                  </div>
                </div>
              </Section>

              <Section id="api" title="API Reference" icon={Server}>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">GET</span>
                      <code className="text-white font-mono">/agent/health</code>
                    </div>
                    <p className="text-sm text-zinc-400">Returns the primary operational dashboard for the agent.</p>
                    <CodeBlock language="json" code={`{
  "status": "SYNCED",
  "current_k": 18,
  "orphan_rate": 0.042,
  "rl_confidence": 0.91,
  "local_blue_score": 81204931,
  "network_blue_score": 81204931,
  "version": "0.1.0"
}`} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">GET</span>
                      <code className="text-white font-mono">/dag/snapshot?n=100</code>
                    </div>
                    <p className="text-sm text-zinc-400">Returns the recent sub-graph formatted for <strong>Graph Neural Networks (GNNs)</strong>.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">POST</span>
                      <code className="text-white font-mono">/tx/submit-smart</code>
                    </div>
                    <p className="text-sm text-zinc-400">Guarantees the fastest inclusion by pointing new transactions to the 3-5 "Bluest" tips autonomously.</p>
                  </div>
                </div>
              </Section>

              <Section id="streams" title="WebSocket Streams" icon={Activity}>
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">WS</span>
                    <code className="text-white font-mono">/v1/stream/blocks</code>
                  </div>
                  <p className="text-sm text-zinc-400">Real-time linearized block stream with PHANTOM total ordering.</p>
                </div>

                <div className="overflow-hidden rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900/50 text-zinc-400">
                      <tr>
                        <th className="px-6 py-4 font-medium">Edge Type</th>
                        <th className="px-6 py-4 font-medium">Meaning</th>
                        <th className="px-6 py-4 font-medium">GNN Utility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-950/30">
                      {[
                        { type: 'PARENT_OF', meaning: 'Structural parent link', utility: 'Topology analysis' },
                        { type: 'BLUE_PAST', meaning: 'Block is in blue cluster', utility: 'Trust signal' },
                        { type: 'RED_PAST', meaning: 'Block is orphaned (red)', utility: 'Latency signal' },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-purple-400">{item.type}</td>
                          <td className="px-6 py-4 text-zinc-300">{item.meaning}</td>
                          <td className="px-6 py-4 text-zinc-400">{item.utility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id="math" title="Under the Hood: The Math" icon={Cpu}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/20">
                    <h3 className="text-lg font-bold text-white mb-4">PHANTOM Total Ordering</h3>
                    <p className="text-sm text-zinc-400 mb-4">Argus resolves parallel block conflicts by applying the PHANTOM sorting rule:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
                      <li><span className="font-semibold text-primary">Primary:</span> Sort by <code className="font-mono text-xs bg-zinc-800 px-1 py-0.5 rounded">BlueScore(B)</code> ascending.</li>
                      <li><span className="font-semibold text-primary">Secondary:</span> XOR tie-break: <code className="font-mono text-xs bg-zinc-800 px-1 py-0.5 rounded">Hash(B) ⊕ Hash(SelectedParent(B))</code>.</li>
                    </ol>
                  </div>

                  <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/20">
                    <h3 className="text-lg font-bold text-white mb-4">RL k-Optimization</h3>
                    <p className="text-sm text-zinc-400 mb-4">The RL agent (Stable-Baselines3 PPO) monitors network metrics and adjusts <em>k</em> to maximize:</p>
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-center font-mono text-sm text-primary">
                      R = ω₁(TPS) - ω₂(OrphanRate) - ω₃(SecurityMargin)
                    </div>
                  </div>
                </div>
              </Section>

              <Section id="security" title="Security & Reliability" icon={Shield}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Memoized Traversals', desc: 'past(B) and anticone(B) use internal caching. Amortized O(1).' },
                    { title: 'Thread Safety', desc: 'RwLock-protected DAG storage for parallel Read/Write throughput.' },
                    { title: 'RPC Resiliency', desc: 'Automatic retries and robust chunked JSON parsing.' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
                      <h4 className="font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-xs text-zinc-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <section className="mt-24 pt-12 border-t border-zinc-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Argus Protocol</h3>
                    <p className="text-sm text-zinc-500">Distributed under the MIT License.</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-1">
                    <div className="text-sm font-medium text-white">Alex</div>
                    <div className="text-xs text-zinc-500">Senior Principal Protocol Engineer</div>
                    <a href="https://argus-protocol.xyz" className="text-xs text-primary hover:underline mt-1">argus-protocol.xyz</a>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Docs;
