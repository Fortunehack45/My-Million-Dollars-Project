import React, { useState, useEffect, useMemo } from 'react';
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
  Globe,
  Zap,
  ArrowRight,
  ShieldCheck,
  Signal
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
      alert("DIRECTIVE_INJECTED: Task deployed to all terminals.");
      setNewTask({ title: '', description: '', points: 100, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0 });
    } catch (err) { alert("INJECTION_ERROR: Operation blocked by kernel."); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("TERMINATE_DIRECTIVE: Are you sure you want to erase this task from the protocol?")) return;
    try {
      await deleteTask(taskId);
    } catch (err) { alert("ERASE_ERROR: Failed to delete directive."); }
  };

  // Memoized Live Metrics
  const onlineUsersList = useMemo(() => {
    return users.filter(u => onlineUids.includes(u.uid));
  }, [users, onlineUids]);

  const activeMiningCount = useMemo(() => {
    return users.filter(u => u.miningActive).length;
  }, [users]);

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

  return (
    <div className="w-full space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <ShieldAlert className="w-6 h-6 text-black" />
           </div>
           <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Command_Center</h1>
             <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest font-mono">Kernel_Access::Active_Session [{firebaseUser?.email}]</p>
             </div>
           </div>
        </div>
        <div className="flex gap-4">
           <div className="surface px-4 py-2 rounded-lg flex items-center gap-3 border-zinc-800">
              <Signal className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-mono text-zinc-400">LATENCY: {Math.floor(Math.random() * 20 + 5)}ms</span>
           </div>
        </div>
      </header>

      {/* Real-time Infrastructure Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Network Nodes', val: users.length, sub: 'Registered Entities', icon: Globe, color: 'text-zinc-400' },
          { label: 'Active Miners', val: activeMiningCount, sub: 'Core Computing', icon: Cpu, color: 'text-primary', pulse: true },
          { label: 'Live Presence', val: onlineUids.length, sub: 'WebSocket Heartbeats', icon: Radio, color: 'text-emerald-500', ping: true },
          { label: 'Total Circulation', val: Math.floor(netStats.totalMined).toLocaleString(), sub: 'NEX Credits', icon: Database, color: 'text-zinc-600' }
        ].map((s, i) => (
          <div key={i} className={`surface p-8 rounded-2xl relative overflow-hidden transition-all hover:border-zinc-700`}>
             <div className="flex items-center justify-between mb-6">
                <s.icon className={`w-4 h-4 ${s.color} ${s.ping ? 'animate-bounce' : ''}`} />
                {s.pulse && <div className="flex gap-1"><div className="w-1 h-3 bg-primary/20 rounded-full"></div><div className="w-1 h-3 bg-primary/40 rounded-full animate-pulse"></div></div>}
             </div>
             <p className="label-meta text-zinc-500 text-[8px] mb-1">{s.label}</p>
             <h3 className="text-3xl font-mono font-bold text-white tracking-tighter">{s.val}</h3>
             <p className="text-[9px] text-zinc-600 font-bold uppercase mt-2 tracking-widest">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Task Injection Console */}
        <div className="lg:col-span-3 surface p-10 rounded-3xl space-y-10 border-zinc-900">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                   <PlusCircle className="w-4 h-4 text-primary" />
                </div>
                <h3 className="label-meta text-white">Inject_Directive_Buffer</h3>
              </div>
              <span className="text-[9px] font-mono text-zinc-600">SCHEDULER: READY</span>
           </div>
           
           <form onSubmit={handleCreateTask} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="label-meta text-[9px] text-zinc-600">Directive Title</label>
                    <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-4 font-mono text-xs rounded-xl outline-none transition-all" placeholder="PROTOCOL_NAME" />
                 </div>
                 <div className="space-y-3">
                    <label className="label-meta text-[9px] text-zinc-600">Credit Bounty (NEX)</label>
                    <input required type="number" value={newTask.points} onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-4 font-mono text-xs rounded-xl outline-none transition-all" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="label-meta text-[9px] text-zinc-600">Verification Endpoint</label>
                    <div className="relative">
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                       <input required value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-4 pl-12 font-mono text-xs rounded-xl outline-none transition-all" placeholder="https://..." />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="label-meta text-[9px] text-zinc-600">Sync Timer (SEC)</label>
                    <div className="relative">
                       <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
                       <input type="number" value={newTask.timerSeconds} onChange={e => setNewTask({...newTask, timerSeconds: parseInt(e.target.value) || 0})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-4 pl-12 font-mono text-xs rounded-xl outline-none transition-all" placeholder="0 = instant_auth" />
                    </div>
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="label-meta text-[9px] text-zinc-600">Mission Parameters</label>
                 <textarea required value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 focus:border-primary p-4 font-mono text-xs rounded-xl outline-none h-32 resize-none transition-all" placeholder="Define validation steps..." />
              </div>
              <button className="btn-primary w-full group relative overflow-hidden py-5">
                 <span className="relative z-10 flex items-center justify-center gap-3">
                    Broadcast Global Directive <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </span>
                 <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
           </form>
        </div>

        {/* Live Directive Monitor */}
        <div className="lg:col-span-2 surface rounded-3xl flex flex-col overflow-hidden border-zinc-900">
           <div className="bg-zinc-900/40 p-6 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <List className="w-4 h-4 text-primary" />
                 <h3 className="label-meta text-white">Active_Registry</h3>
              </div>
              <span className="text-[8px] font-mono text-zinc-600 font-black">{tasks.length} SYNCED</span>
           </div>
           <div className="flex-1 p-6 space-y-4 font-mono text-[10px] overflow-y-auto max-h-[600px] scrollbar-hide">
              {tasks.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-800 opacity-50">
                    <Terminal className="w-12 h-12 mb-4" />
                    <p className="label-meta text-[8px]">Buffer_Empty</p>
                 </div>
              )}
              {tasks.map((t) => (
                <div key={t.id} className="group flex justify-between items-center border-l-2 border-primary/40 pl-4 py-4 bg-zinc-900/20 hover:bg-primary/[0.03] transition-all rounded-r-xl border border-zinc-900">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold tracking-tight">{t.title}</span>
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded border border-primary/20">+{t.points} NEX</span>
                    </div>
                    <div className="flex gap-4 items-center opacity-60">
                       <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {t.timerSeconds || 0}S</span>
                       <span className="truncate max-w-[120px]">{t.link.replace('https://', '')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-3 text-zinc-800 hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Advanced Node Telemetry Feed */}
      <div className="surface rounded-3xl flex flex-col overflow-hidden border-zinc-900 bg-zinc-950">
         <div className="bg-zinc-900/30 p-8 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                  <h3 className="label-meta text-white">Live_Node_Telemetry</h3>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase mt-0.5">Real-time peering & authentication feed</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden md:block">
                  <p className="label-meta text-[8px] text-zinc-500">System Capacity</p>
                  <p className="text-[10px] font-mono font-bold text-white">LOW_LATENCY_WEB_SOCKETS</p>
               </div>
               <div className="h-10 w-[1px] bg-zinc-900 hidden md:block"></div>
               <span className="text-[10px] font-mono text-emerald-500 font-black bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 animate-pulse">
                  {onlineUids.length} NODES_ONLINE
               </span>
            </div>
         </div>

         <div className="flex-1 p-8 space-y-3 font-mono text-[10px] overflow-y-auto max-h-[500px]">
            {onlineUsersList.length === 0 ? (
               <div className="py-20 text-center opacity-30 flex flex-col items-center">
                  <Zap className="w-12 h-12 text-zinc-700 mb-6" />
                  <p className="label-meta text-[10px]">No live peers detected on global mesh</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {onlineUsersList.map((u, i) => (
                  <div key={i} className="flex justify-between items-center border border-zinc-900 p-5 bg-zinc-900/20 rounded-2xl hover:border-emerald-500/30 transition-all group">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${u.miningActive ? 'bg-primary shadow-[0_0_8px_#f43f5e] animate-pulse' : 'bg-zinc-800'}`}></div>
                        <span className="text-white font-bold text-xs">{u.displayName}</span>
                        <span className="text-[8px] text-zinc-700 font-black">ID::{u.uid.slice(0, 6)}</span>
                      </div>
                      <div className="flex gap-4">
                         <span className="text-emerald-500/60 font-black tracking-widest">[ AUTH::OK ]</span>
                         <div className="flex items-center gap-2">
                            <Cpu className={`w-2.5 h-2.5 ${u.miningActive ? 'text-primary' : 'text-zinc-700'}`} />
                            <span className={`${u.miningActive ? "text-primary font-bold" : "text-zinc-700"}`}>
                              {u.miningActive ? "MINING_SEQUENCE" : "IDLE_MODE"}
                            </span>
                         </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-white font-bold text-sm tracking-tighter">{u.points.toFixed(2)} <span className="text-zinc-600 text-[9px] font-black">NEX</span></p>
                       <p className="text-[8px] text-zinc-700 mt-1 uppercase font-bold">{u.email?.split('@')[0]}@nexus</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
         </div>

         <div className="p-8 bg-zinc-900/20 border-t border-zinc-900 mt-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-zinc-600">
               <Server className="w-3 h-3" />
               <p className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono">Protocol Kernel v2.8.4-RELEASE | Registry Size: {users.length}</p>
            </div>
            <div className="flex gap-8">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase">Miner_Active</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase">Node_Connected</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;