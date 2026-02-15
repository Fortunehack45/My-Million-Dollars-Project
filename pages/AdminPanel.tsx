import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  addNewTask, 
  getAllUsers, 
  subscribeToNetworkStats, 
  subscribeToOnlineUsers, 
  TOTAL_SUPPLY,
  ADMIN_EMAIL
} from '../services/firebase';
import { User, Task, NetworkStats } from '../types';
import { 
  Users, 
  PlusCircle, 
  Database, 
  ShieldAlert, 
  Cpu, 
  TrendingUp, 
  Terminal,
  Server,
  Activity
} from 'lucide-react';

const AdminPanel = () => {
  const { user, firebaseUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [loading, setLoading] = useState(true);
  
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    points: 100,
    icon: 'web',
    link: '',
    actionLabel: 'Initialize'
  });

  // Client-side hardcoded check
  const isAuthorized = firebaseUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAuthorized) return;
    
    const loadData = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
        setLoading(false);
      } catch (err) { console.error("Admin Access Fault:", err); }
    };

    loadData();
    const unsubscribeStats = subscribeToNetworkStats(setNetStats);
    const unsubscribeOnline = subscribeToOnlineUsers(setOnlineCount);
    
    return () => {
      unsubscribeStats();
      unsubscribeOnline();
    };
  }, [isAuthorized]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;
    try {
      await addNewTask(newTask);
      alert("DIRECTIVE_INJECTED: Task deployed.");
      setNewTask({ title: '', description: '', points: 100, icon: 'web', link: '', actionLabel: 'Initialize' });
    } catch (err) { alert("INJECTION_ERROR: Operation blocked."); }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12 bg-zinc-950">
        <div className="surface p-12 rounded-3xl text-center space-y-6 max-w-md border-primary/40 bg-primary/5">
           <ShieldAlert className="w-16 h-16 text-primary mx-auto animate-pulse" />
           <div className="space-y-2">
             <h2 className="text-2xl font-black text-white uppercase italic">Access_Authority_Denied</h2>
             <p className="text-zinc-500 text-xs font-mono">CLIENT_ID: {firebaseUser?.uid.slice(0, 10)}...<br/>EMAIL_MISMATCH: {firebaseUser?.email}</p>
           </div>
           <p className="text-zinc-400 text-sm font-medium leading-relaxed">
             This infrastructure portal is restricted to the <span className="text-white font-black">ROOT_ADMIN</span> account only. 
             Unauthorized access attempts are logged on the protocol kernel.
           </p>
        </div>
      </div>
    );
  }

  const offlineCount = users.length - onlineCount;

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      <header className="space-y-2">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-primary flex items-center justify-center rounded">
              <ShieldAlert className="w-5 h-5 text-black" />
           </div>
           <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Command_Center</h1>
             <p className="text-zinc-500 text-sm font-medium">Signed in as: <span className="text-primary font-mono">{ADMIN_EMAIL}</span></p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="surface p-8 rounded-2xl border-emerald-500/20 bg-emerald-500/5">
           <div className="flex items-center gap-3 mb-6">
              <Activity className="w-4 h-4 text-emerald-500" />
              <p className="label-meta text-emerald-500/70">Heartbeat Matrix</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{onlineCount} LIVE</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Offline: {offlineCount} | Registered: {users.length}</p>
        </div>

        <div className="surface p-8 rounded-2xl border-primary/20 bg-primary/5">
           <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-4 h-4 text-primary" />
              <p className="label-meta text-primary/70">Active Nodes</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{netStats.activeNodes}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Protocol Participation Optimized</p>
        </div>

        <div className="surface p-8 rounded-2xl">
           <div className="flex items-center gap-3 mb-6">
              <Database className="w-4 h-4 text-zinc-600" />
              <p className="label-meta">Global Liquidity</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{Math.floor(netStats.totalMined).toLocaleString()}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">NEX Credits Circulating</p>
        </div>

        <div className="surface p-8 rounded-2xl">
           <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-4 h-4 text-zinc-600" />
              <p className="label-meta">Scarcity Remainder</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{((TOTAL_SUPPLY - netStats.totalMined) / 1000000).toFixed(2)}M</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Supply Cap: 1B NEX</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="surface p-10 rounded-3xl space-y-8">
           <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-primary" />
              <h3 className="label-meta text-white">Directive_Injection</h3>
           </div>
           
           <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Directive Title</label>
                    <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none" placeholder="Task Name" />
                 </div>
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Incentive (NEX)</label>
                    <input type="number" value={newTask.points} onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="label-meta text-[9px] text-zinc-500">Description</label>
                 <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none h-24 resize-none" placeholder="Task requirements..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Target Protocol URL</label>
                    <input value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none" placeholder="https://..." />
                 </div>
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Target Vector</label>
                    <select value={newTask.icon} onChange={e => setNewTask({...newTask, icon: e.target.value as any})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none">
                       <option value="web">WEB_RELAY</option>
                       <option value="twitter">X_TRANSCEIVER</option>
                       <option value="discord">DISC_CH_SYNC</option>
                       <option value="telegram">TELE_GATEWAY</option>
                    </select>
                 </div>
              </div>
              <button className="btn-primary w-full">Broadcast Directive to Network</button>
           </form>
        </div>

        <div className="surface rounded-3xl flex flex-col overflow-hidden">
           <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <Terminal className="w-4 h-4 text-zinc-600" />
                 <h3 className="label-meta text-white">Global_Operator_Registry</h3>
              </div>
              <span className="text-[8px] font-mono text-primary font-black">ROOT_ACCESS_ENABLED</span>
           </div>
           <div className="flex-1 p-6 space-y-4 font-mono text-[10px] overflow-y-auto max-h-[400px]">
              {users.map((u, i) => (
                <div key={i} className="flex justify-between items-center border-l-2 border-zinc-800 pl-4 py-2 hover:border-primary transition-colors bg-zinc-900/10 mb-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{u.displayName}</span>
                      <span className="text-zinc-700">|</span>
                      <span className="text-zinc-600 lowercase">{u.email}</span>
                    </div>
                    <div className="flex gap-4">
                       <span className={u.miningActive ? "text-emerald-500" : "text-zinc-700"}>
                        [{u.miningActive ? "MINING_NODE" : "IDLE_STATE"}]
                      </span>
                      <span className="text-zinc-600">Refs: {u.referralCount}/20</span>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-primary font-black">{u.points.toFixed(2)} NEX</p>
                     <p className="text-zinc-700 text-[8px]">{u.uid.slice(0, 12)}</p>
                  </div>
                </div>
              ))}
           </div>
           <div className="p-6 bg-zinc-900/20 border-t border-zinc-800 mt-auto">
              <div className="flex items-center gap-3 text-zinc-600">
                 <Server className="w-3 h-3" />
                 <p className="text-[8px] font-bold uppercase tracking-widest">Protocol Kernel v2.4.0-STABLE | ADMIN: {ADMIN_EMAIL}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;