
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  startMiningSession, 
  claimPoints, 
  subscribeToNetworkStats, 
  syncReferralStats,
  TOTAL_SUPPLY,
  BASE_MINING_RATE,
  REFERRAL_BOOST,
  MAX_REFERRALS
} from '../services/firebase';
import { Clock, Database, Activity, Cpu, Box, Zap, AlertTriangle, ArrowUpRight, GitMerge, Layers, Server, Terminal, CheckCircle2 } from 'lucide-react';
import { NetworkStats } from '../types';

// Enhanced GhostDAG Topology Visualization
const GhostDAGVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let nodes: Array<{x: number, y: number, vx: number, vy: number, id: number, type: 'blue' | 'red' | 'pending'}> = [];
    let links: Array<{source: number, target: number}> = [];
    let nextId = 0;

    const resize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Initial seed
    for(let i=0; i<5; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        id: nextId++,
        type: 'blue'
      });
    }

    const addNode = () => {
      if (nodes.length > 30) {
        nodes.shift(); // Remove oldest
        // Clean links
        const activeIds = new Set(nodes.map(n => n.id));
        links = links.filter(l => activeIds.has(l.source) && activeIds.has(l.target));
      }
      
      const newNode = {
        x: canvas.width + 10,
        y: Math.random() * canvas.height,
        vx: -0.5 - Math.random(), // Move left
        vy: (Math.random() - 0.5) * 0.5,
        id: nextId++,
        type: Math.random() > 0.8 ? 'red' : 'blue'
      };

      // Link to 1-3 random existing nodes
      const targetCount = 1 + Math.floor(Math.random() * 2);
      for(let i=0; i<targetCount; i++) {
        if(nodes.length > 0) {
           const target = nodes[Math.floor(Math.random() * nodes.length)];
           links.push({ source: newNode.id, target: target.id });
        }
      }
      nodes.push(newNode as any);
    };

    const interval = setInterval(addNode, 800);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
      });

      // Draw Links
      ctx.lineWidth = 1;
      links.forEach(link => {
        const s = nodes.find(n => n.id === link.source);
        const t = nodes.find(n => n.id === link.target);
        if (s && t) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
          ctx.strokeStyle = 'rgba(82, 82, 91, 0.3)';
          ctx.stroke();
        }
      });

      // Draw Nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.type === 'red' ? 3 : 4, 0, Math.PI * 2);
        ctx.fillStyle = node.type === 'blue' ? '#10b981' : '#f43f5e';
        ctx.fill();
        
        // Glow
        if (node.type === 'blue') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#10b981';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full opacity-60" />
    </div>
  );
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [miningTimer, setMiningTimer] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  
  const MAX_SESSION_TIME = 24 * 60 * 60; 

  const referrals = Math.min(user?.referralCount || 0, MAX_REFERRALS);
  const currentHourlyRate = BASE_MINING_RATE + (referrals * REFERRAL_BOOST);
  const ratePerSecond = currentHourlyRate / 3600;

  useEffect(() => {
    if (user) {
      syncReferralStats(user.uid, user.referralCount, user.points)
        .then((updatedData) => {
          if (updatedData) {
            refreshUser({ 
              ...user, 
              referralCount: updatedData.referralCount, 
              points: updatedData.points 
            });
          }
        });
    }
  }, [user?.uid]); 

  useEffect(() => {
    const unsubscribe = subscribeToNetworkStats(setStats => setNetStats(setStats));
    return () => unsubscribe();
  }, []);

  const calculateProgress = useCallback(() => {
    if (!user?.miningActive || !user.miningStartTime) {
      setMiningTimer(0);
      setPendingPoints(0);
      return;
    }
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - user.miningStartTime) / 1000);
    
    if (elapsedSeconds >= MAX_SESSION_TIME) {
      setMiningTimer(MAX_SESSION_TIME);
      setPendingPoints(MAX_SESSION_TIME * ratePerSecond);
    } else {
      setMiningTimer(elapsedSeconds);
      setPendingPoints(elapsedSeconds * ratePerSecond);
    }
  }, [user, ratePerSecond]);

  useEffect(() => {
    calculateProgress();
    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, [calculateProgress]);

  const handleStartMining = async () => {
    if (!user) return;
    try {
      await startMiningSession(user.uid);
      refreshUser({ ...user, miningActive: true, miningStartTime: Date.now() });
    } catch (error) { console.error(error); }
  };

  const handleClaim = async () => {
    if (!user || pendingPoints === 0) return;
    try {
      await claimPoints(user.uid, pendingPoints);
      refreshUser({
        ...user,
        miningActive: false,
        miningStartTime: null,
        points: user.points + pendingPoints
      });
      setPendingPoints(0);
      setMiningTimer(0);
    } catch (error) { console.error(error); }
  };

  const formatTime = (seconds: number) => {
    const remaining = Math.max(0, MAX_SESSION_TIME - seconds);
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  const leftToMine = TOTAL_SUPPLY - netStats.totalMined;
  const miningPercent = (netStats.totalMined / TOTAL_SUPPLY) * 100;
  const isSessionComplete = miningTimer >= MAX_SESSION_TIME;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 backdrop-blur-md">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">GhostDAG Node Operational</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            Dashboard<span className="text-zinc-700">_View</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Validating parallel block clusters. <span className="text-zinc-600">Blue-Set Velocity:</span> <span className="text-primary font-mono font-bold">{currentHourlyRate.toFixed(2)} ARG/hr</span></p>
        </div>
        
        {/* NETWORK STATS MINI */}
        <div className="text-right flex flex-col items-end gap-3 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 backdrop-blur-sm shadow-xl">
          <p className="label-meta text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <Database className="w-3 h-3" />
            DAG Emission Cap
          </p>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-mono font-black text-white">{(leftToMine / 1000000).toFixed(2)}M <span className="text-zinc-600">UNMINED</span></p>
              <div className="w-48 h-1.5 bg-zinc-950 mt-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-gradient-to-r from-primary to-rose-400 shadow-[0_0_10px_#f43f5e]" style={{ width: `${miningPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: VISUALIZER & CONTROLS */}
        <div className="lg:col-span-8 space-y-8">
           {/* Visualizer Card */}
           <div className="relative bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden min-h-[400px] flex flex-col shadow-2xl group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,0.5),rgba(9,9,11,1))]" />
              
              {/* Header inside card */}
              <div className="relative z-10 px-6 py-4 border-b border-zinc-900/50 flex justify-between items-center bg-zinc-950/50 backdrop-blur-md">
                 <div className="flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GhostDAG_Topology</span>
                 </div>
                 <div className="flex gap-4">
                    <span className="text-[9px] font-mono text-zinc-600">TPS: 402,192</span>
                    <span className="text-[9px] font-mono text-zinc-600">LATENCY: 12ms</span>
                 </div>
              </div>

              {/* Canvas Container */}
              <div className="relative flex-1 w-full h-64 md:h-auto overflow-hidden">
                 <GhostDAGVisualizer />
              </div>

              {/* Footer Control Panel */}
              <div className="relative z-10 p-6 md:p-8 border-t border-zinc-900 bg-zinc-900/10 backdrop-blur-xl">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {user.miningActive ? (
                       <div className="w-full">
                          <div className="flex justify-between items-end mb-4">
                             <div>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isSessionComplete ? 'text-emerald-500 animate-pulse' : 'text-primary'}`}>
                                  {isSessionComplete ? 'TOPOLOGY SEALED' : 'ACCUMULATING_REWARDS'}
                                </p>
                                <h2 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter tabular-nums text-shadow-glow">
                                   {pendingPoints.toFixed(4)} <span className="text-lg text-zinc-600">ARG</span>
                                </h2>
                             </div>
                             <div className="text-right hidden md:block">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Session Timer</p>
                                <p className="text-2xl font-mono text-emerald-400 font-bold">{formatTime(miningTimer)}</p>
                             </div>
                          </div>
                          
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mb-6">
                             <div className={`h-full ${isSessionComplete ? 'bg-emerald-500' : 'bg-primary'} transition-all duration-1000`} style={{ width: `${(miningTimer / MAX_SESSION_TIME) * 100}%` }}></div>
                          </div>

                          <button 
                             onClick={handleClaim} 
                             className={`w-full py-4 font-black uppercase tracking-[0.15em] text-xs rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${isSessionComplete ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white text-black hover:bg-zinc-200'}`}
                          >
                             {isSessionComplete ? <CheckCircle2 className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                             {isSessionComplete ? 'Secure DAG Reward' : 'Seal Current Cluster'}
                          </button>
                       </div>
                    ) : (
                       <div className="w-full flex flex-col md:flex-row items-center gap-6">
                          <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                             <Zap className="w-8 h-8 text-zinc-600" />
                          </div>
                          <div className="flex-1 text-center md:text-left space-y-1">
                             <h3 className="text-lg font-bold text-white uppercase">Node Idle</h3>
                             <p className="text-xs text-zinc-500 max-w-sm">Initialize validation sequence to begin topological ordering and earn rewards.</p>
                          </div>
                          <button 
                             onClick={handleStartMining} 
                             className="w-full md:w-auto px-8 py-4 bg-primary text-white font-black uppercase tracking-[0.15em] text-xs rounded-xl shadow-[0_10px_30px_rgba(244,63,94,0.25)] hover:shadow-[0_15px_40px_rgba(244,63,94,0.4)] hover:-translate-y-1 transition-all duration-300"
                          >
                             Initialize_Node
                          </button>
                       </div>
                    )}
                 </div>
              </div>
           </div>
           
           {/* Secondary Stats Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Cumulative Reward', value: Math.floor(user.points * 100) / 100, unit: 'ARG', icon: Database, color: 'text-white' },
                { label: 'Uptime Score', value: '99.9', unit: '%', icon: Activity, color: 'text-emerald-400' },
                { label: 'Network Peers', value: netStats.activeNodes.toLocaleString(), unit: 'NODES', icon: Server, color: 'text-primary' },
                { label: 'Block Height', value: Math.floor(netStats.totalMined * 12).toLocaleString(), unit: '#', icon: Layers, color: 'text-indigo-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-900/20 border border-zinc-800 p-5 rounded-2xl hover:bg-zinc-900/40 transition-colors group">
                   <div className="flex justify-between items-start mb-3">
                      <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      <ArrowUpRight className="w-3 h-3 text-zinc-700" />
                   </div>
                   <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className={`text-lg md:text-xl font-mono font-bold ${stat.color} truncate`}>
                      {stat.value} <span className="text-[9px] text-zinc-600 ml-1">{stat.unit}</span>
                   </p>
                </div>
              ))}
           </div>
        </div>

        {/* RIGHT COLUMN: LOGS & ALERTS */}
        <div className="lg:col-span-4 space-y-6">
           {/* Protocol Feed */}
           <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-900">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Terminal className="w-4 h-4 text-primary" /> Protocol_Log
                 </h3>
                 <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">LIVE</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 font-mono text-[10px]">
                 {[
                    { type: 'sys', msg: 'Syncing DAG topology...', time: '00:00:01' },
                    { type: 'ok', msg: 'Peer handshake accepted [192.168.x.x]', time: '00:00:02' },
                    { type: 'info', msg: 'Indexing blue-set blocks...', time: '00:00:05' },
                    { type: 'warn', msg: 'High throughput on shard #4', time: '00:00:12' },
                    { type: 'ok', msg: 'Consensus achieved (k=18)', time: '00:00:15' },
                    { type: 'sys', msg: 'Awaiting next cluster...', time: '00:00:18' },
                    user.miningActive ? { type: 'ok', msg: 'Mining credits accumulating...', time: 'NOW' } : null
                 ].filter(Boolean).map((log: any, i) => (
                    <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                       <span className="text-zinc-600 shrink-0">{log.time}</span>
                       <span className={`${log.type === 'ok' ? 'text-emerald-500' : log.type === 'warn' ? 'text-amber-500' : log.type === 'sys' ? 'text-primary' : 'text-zinc-400'}`}>
                          {log.type === 'sys' && '> '}
                          {log.msg}
                       </span>
                    </div>
                 ))}
                 <div className="animate-pulse text-primary font-bold">_</div>
              </div>
           </div>

           {/* Alert Box */}
           <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <AlertTriangle className="w-24 h-24 text-amber-500" />
              </div>
              <div className="relative z-10 space-y-3">
                 <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Notice</span>
                 </div>
                 <p className="text-xs text-amber-200/60 leading-relaxed font-medium">
                    GhostDAG requires continuous network connectivity. Orphaned clusters (Red-Set blocks) do not accumulate reward credits. Ensure persistent node uptime to maximize yield.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
