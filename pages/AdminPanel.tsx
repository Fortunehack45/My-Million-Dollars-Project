import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  addNewTask, 
  subscribeToUsers, 
  subscribeToNetworkStats, 
  subscribeToOnlineUsers, 
  subscribeToTasks,
  deleteTask,
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
  Activity,
  Radio,
  Trash2,
  Clock,
  List,
  Globe
} from 'lucide-react';

const AdminPanel = () => {
  const { user, firebaseUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onlineUids, setOnlineUids] = useState<string[]>([]);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    points: 100,
    icon: 'web',
    link: '',
    actionLabel: 'Initialize',
    timerSeconds: 0
  });

  const isAuthorized = 
    firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || 
    user?.role === 'admin';

  useEffect(() => {
    if (!isAuthorized) return;
    
    const unsubscribeUsers = subscribeToUsers(setUsers);
    const unsubscribeStats = subscribeToNetworkStats(setNetStats);
    const unsubscribeOnline = subscribeToOnlineUsers(setOnlineUids);
    const unsubscribeTasks = subscribeToTasks(setTasks);
    
    return () => {
      unsubscribeUsers();
      unsubscribeStats();
      unsubscribeOnline();
      unsubscribeTasks();
    };
  }, [isAuthorized]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;
    try {
      await addNewTask(newTask);
      alert("DIRECTIVE_INJECTED: Task deployed.");
      setNewTask({ title: '', description: '', points: 100, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0 });
    } catch (err) { alert("INJECTION_ERROR: Operation blocked."); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("TERMINATE_DIRECTIVE: Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
    } catch (err) { alert("ERASE_ERROR: Failed to delete directive."); }
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
           </p>
        </div>
      </div>
    );
  }

  // Derived Metrics from Real-time Data
  const onlineUsers = users.filter(u => onlineUids.includes(u.uid));
  const activeMiningCount = users.filter(u => u.miningActive).length;
  const totalRegistered = users.length;

  return (
    <div className="w-full space-y-12">
      <header className="space-y-2">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-primary flex items-center justify-center rounded">
              <ShieldAlert className="w-5 h-5 text-black" />
           </div>
           <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Command_Center</h1>
             <p className="text-zinc-500 text-sm font-medium">Privileged session: <span className="text-primary font-mono">{firebaseUser?.email}</span></p>
           </div>
        </div>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Network Nodes */}
        <div className="surface p-8 rounded-2xl">
           <div className="flex items-center gap-3 mb-6">
              <Globe className="w-4 h-4 text-zinc-400" />
              <p className="label-meta text-zinc-500">Total Network Nodes</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{totalRegistered}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Registered Identities</p>
        </div>

        {/* Active Mining Nodes */}
        <div className="surface p-8 rounded-2xl border-primary/20 bg-primary/5">
           <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-4 h-4 text-primary" />
              <p className="label-meta text-primary/70">Active Miners</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{activeMiningCount}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Computing Clusters</p>
        </div>

        {/* Live Presence */}
        <div className="surface p-8 rounded-2xl border-emerald-500/20 bg-emerald-500/5">
           <div className="flex items-center gap-3 mb-6">
              <Radio className="w-4 h-4 text-emerald-500 animate-ping" />
              <p className="label-meta text-emerald-500/70">Live Presence</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{onlineUsers.length}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Online Sessions</p>
        </div>

        {/* Distribution */}
        <div className="surface p-8 rounded-2xl">
           <div className="flex items-center gap-3 mb-6">
              <Database className="w-4 h-4 text-zinc-600" />
              <p className="label-meta">Liquidity</p>
           </div>
           <h3 className="text-3xl font-mono font-bold text-white">{Math.floor(netStats.totalMined).toLocaleString()}</h3>
           <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2">Total Mined NEX</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Creator */}
        <div className="surface p-10 rounded-3xl space-y-8">
           <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-primary" />
              <h3 className="label-meta text-white">Inject_Task_Directive</h3>
           </div>
           
           <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Directive Title</label>
                    <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none" placeholder="Task Name" />
                 </div>
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Bounty (NEX)</label>
                    <input required type="number" value={newTask.points} onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Task Link</label>
                    <input required value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none" placeholder="https://..." />
                 </div>
                 <div className="space-y-2">
                    <label className="label-meta text-[9px] text-zinc-500">Timer (Sec) - Optional</label>
                    <div className="relative">
                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                       <input type="number" value={newTask.timerSeconds} onChange={e => setNewTask({...newTask, timerSeconds: parseInt(e.target.value) || 0})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 pl-9 font-mono text-xs rounded-lg outline-none" placeholder="0 = instant" />
                    </div>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="label-meta text-[9px] text-zinc-500">Description</label>
                 <textarea required value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-3 font-mono text-xs rounded-lg outline-none h-24 resize-none" placeholder="Task requirements..." />
              </div>
              <button className="btn-primary w-full">Broadcast Global Directive</button>
           </form>
        </div>

        {/* Live Tasks List */}
        <div className="surface rounded-3xl flex flex-col overflow-hidden">
           <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <List className="w-4 h-4 text-primary" />
                 <h3 className="label-meta text-white">Active_Directives</h3>
              </div>
           </div>
           <div className="flex-1 p-6 space-y-4 font-mono text-[10px] overflow-y-auto max-h-[400px]">
              {tasks.length === 0 && <p className="text-center text-zinc-700 py-10">No tasks currently broadcasted.</p>}
              {tasks.map((t) => (
                <div key={t.id} className="flex justify-between items-center border-l-2 border-primary pl-4 py-3 bg-primary/[0.03] mb-2 rounded-r-lg">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{t.title}</span>
                      <span className="text-zinc-700">|</span>
                      <span className="text-primary font-black">+{t.points} NEX</span>
                    </div>
                    <div className="flex gap-4">
                       <span className="text-zinc-500">TIMER: {t.timerSeconds || 0}s</span>
                       <span className="text-zinc-600 truncate max-w-[200px]">{t.link}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-primary hover:border-primary transition-all rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Live Operators List */}
      <div className="surface rounded-3xl flex flex-col overflow-hidden">
         <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <Activity className="w-4 h-4 text-emerald-500" />
               <h3 className="label-meta text-white">Live_Node_Telemetry</h3>
            </div>
            <span className="text-[8px] font-mono text-emerald-500 font-black animate-pulse">{onlineUsers.length} ONLINE</span>
         </div>
         <div className="flex-1 p-6 space-y-4 font-mono text-[10px] overflow-y-auto max-h-[400px]">
            {onlineUsers.length === 0 && <p className="text-center text-zinc-700 py-10">No live operators detected.</p>}
            {onlineUsers.map((u, i) => (
              <div key={i} className="flex justify-between items-center border-l-2 border-emerald-500 pl-4 py-3 bg-emerald-500/[0.03] mb-2 rounded-r-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{u.displayName}</span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-500 lowercase">{u.email}</span>
                  </div>
                  <div className="flex gap-4">
                     <span className="text-emerald-500">[STATUS: AUTHENTICATED]</span>
                     <span className={`${u.miningActive ? "text-primary font-bold" : "text-zinc-600"}`}>
                       {u.miningActive ? "CORE: MINING (ACTIVE)" : "CORE: IDLE"}
                     </span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-emerald-400 font-black">{u.points.toFixed(2)} NEX</p>
                </div>
              </div>
            ))}
         </div>
         <div className="p-6 bg-zinc-900/20 border-t border-zinc-800 mt-auto">
            <div className="flex items-center gap-3 text-zinc-600">
               <Server className="w-3 h-3" />
               <p className="text-[8px] font-bold uppercase tracking-widest">Protocol Kernel v2.6.0 | Total Operator Count: {totalRegistered}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;