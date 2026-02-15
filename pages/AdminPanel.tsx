import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addNewTask, getAllUsers, subscribeToNetworkStats, TOTAL_SUPPLY } from '../services/firebase';
import { User, Task, NetworkStats } from '../types';
import { 
  Users, 
  Activity, 
  PlusCircle, 
  Database, 
  ShieldAlert, 
  Cpu, 
  TrendingUp, 
  Terminal,
  Server
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [loading, setLoading] = useState(true);
  
  // Task form state
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    points: 100,
    icon: 'web',
    link: '',
    actionLabel: 'Initialize'
  });

  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    const loadData = async () => {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setLoading(false);
    };

    loadData();
    const unsubscribe = subscribeToNetworkStats(setNetStats);
    return () => unsubscribe();
  }, [user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNewTask(newTask);
      alert("DIRECTIVE_INJECTED: Task successfully deployed to network.");
      setNewTask({ title: '', description: '', points: 100, icon: 'web', link: '', actionLabel: 'Initialize' });
    } catch (err) {
      alert("INJECTION_ERROR: Operation failed.");
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-12">
        <div className="surface p-12 rounded-3xl text-center space-y-6 max-w-md border-primary/20 bg-primary/5">
           <ShieldAlert className="w-12 h-12 text-primary mx-auto" />
           <h2 className="text-2xl font-black text-white uppercase italic">Access_Denied</h2>
           <p className="text-zinc-500 text-sm font-medium">Your credentials lack the authorization required to access the Administrative Command Center.</p>
        </div>
      </div>
    );
  }

  const activeUsersCount = users.filter(u => u.miningActive).length;
  const offlineUsersCount = users.length - activeUsersCount;

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Command_Center</h1>
        <p className="text-zinc-500 text-sm font-medium">Privileged access to protocol state and global operator monitoring.</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="surface p-8 rounded-2xl border-emerald-500/20 bg-emerald-500/5">
           <div className="flex items-center gap-3 mb-6">
              <Users className="w-4 h-4 text-emerald-500" />
              <p className="label-meta text-emerald-500/70">Total Operators</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{users.length}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Active: {activeUsersCount} | Offline: {offlineUsersCount}</p>
        </div>

        <div className="surface p-8 rounded-2xl border-primary/20 bg-primary/5">
           <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-4 h-4 text-primary" />
              <p className="label-meta text-primary/70">Live Nodes</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{netStats.activeNodes}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Current Epoch Status: OPTIMAL</p>
        </div>

        <div className="surface p-8 rounded-2xl">
           <div className="flex items-center gap-3 mb-6">
              <Database className="w-4 h-4 text-zinc-600" />
              <p className="label-meta">Global Liquidity</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{Math.floor(netStats.totalMined).toLocaleString()}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">NEX Credits Issued</p>
        </div>

        <div className="surface p-8 rounded-2xl">
           <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-4 h-4 text-zinc-600" />
              <p className="label-meta">Cap Available</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{((TOTAL_SUPPLY - netStats.totalMined) / 1000000).toFixed(1)}M</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">NEX Remainder</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Creator */}
        <div className="surface p-10 rounded-3xl space-y-8">
           <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-primary" />
              <h3 className="label-meta text-white">Deploy_Directive</h3>
           </div>
           
           <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Task Title</label>
                    <input 
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none"
                      placeholder="Verification Sequence"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Reward (NEX)</label>
                    <input 
                      type="number"
                      value={newTask.points}
                      onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})}
                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none"
                    />
                 </div>
              </div>
              
              <div className="space-y-2">
                 <label className="label-meta text-[9px] text-zinc-500">Description</label>
                 <textarea 
                   value={newTask.description}
                   onChange={e => setNewTask({...newTask, description: e.target.value})}
                   className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none h-24 resize-none"
                   placeholder="Detailed protocol requirement..."
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Target URL</label>
                    <input 
                      value={newTask.link}
                      onChange={e => setNewTask({...newTask, link: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none"
                      placeholder="https://..."
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Platform Icon</label>
                    <select 
                      value={newTask.icon}
                      onChange={e => setNewTask({...newTask, icon: e.target.value as any})}
                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none"
                    >
                       <option value="web">WEB</option>
                       <option value="twitter">TWITTER</option>
                       <option value="discord">DISCORD</option>
                       <option value="telegram">TELEGRAM</option>
                    </select>
                 </div>
              </div>

              <button className="btn-primary w-full">Broadcast Directive</button>
           </form>
        </div>

        {/* Console / Monitoring */}
        <div className="surface rounded-3xl flex flex-col overflow-hidden">
           <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <Terminal className="w-4 h-4 text-zinc-600" />
                 <h3 className="label-meta">Global_Feed</h3>
              </div>
              <span className="text-[8px] font-mono text-zinc-600">PID: 99421</span>
           </div>
           
           <div className="flex-1 p-6 space-y-4 font-mono text-[10px] overflow-y-auto max-h-[400px]">
              {users.map((u, i) => (
                <div key={i} className="flex justify-between items-center border-l-2 border-zinc-800 pl-4 py-1 hover:border-primary transition-colors">
                  <div className="flex gap-4">
                    <span className="text-zinc-600">{u.displayName}</span>
                    <span className={u.miningActive ? "text-emerald-500" : "text-zinc-700"}>
                      [{u.miningActive ? "ACTIVE_NODE" : "OFFLINE"}]
                    </span>
                  </div>
                  <span className="text-zinc-500">{Math.floor(u.points)} NEX</span>
                </div>
              ))}
           </div>

           <div className="p-6 bg-zinc-900/20 border-t border-zinc-800 mt-auto">
              <div className="flex items-center gap-3 text-zinc-600">
                 <Server className="w-3 h-3" />
                 <p className="text-[8px] font-bold uppercase tracking-widest">Protocol Kernel v2.4.0-STABLE</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;