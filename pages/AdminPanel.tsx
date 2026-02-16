import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  addNewTask, 
  subscribeToUsers, 
  subscribeToNetworkStats, 
  subscribeToOnlineUsers, 
  subscribeToTasks,
  deleteTask,
  subscribeToLandingConfig,
  updateLandingConfig,
  DEFAULT_LANDING_CONFIG,
  TOTAL_SUPPLY,
  ADMIN_EMAIL
} from '../services/firebase';
import { User, Task, NetworkStats, LandingConfig } from '../types';
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
  Signal,
  Edit3,
  Save,
  Layout,
  FileCode
} from 'lucide-react';

const AdminPanel = () => {
  const { user, firebaseUser } = useAuth();
  
  // Dashboard State
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onlineUids, setOnlineUids] = useState<string[]>([]);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '', description: '', points: 100, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0
  });

  // CMS State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cms'>('dashboard');
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  const [cmsStatus, setCmsStatus] = useState<string>('');

  const isAuthorized = 
    firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || 
    user?.role === 'admin';

  useEffect(() => {
    if (!isAuthorized) return;
    
    // Subscribe to everything
    const unsubUsers = subscribeToUsers(setUsers);
    const unsubStats = subscribeToNetworkStats(setNetStats);
    const unsubOnline = subscribeToOnlineUsers(setOnlineUids);
    const unsubTasks = subscribeToTasks(setTasks);
    const unsubCMS = subscribeToLandingConfig(setLandingConfig);
    
    return () => {
      unsubUsers(); unsubStats(); unsubOnline(); unsubTasks(); unsubCMS();
    };
  }, [isAuthorized]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNewTask(newTask);
      alert("DIRECTIVE_INJECTED: Task deployed.");
      setNewTask({ title: '', description: '', points: 100, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0 });
    } catch (err) { alert("INJECTION_ERROR"); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("TERMINATE_DIRECTIVE?")) return;
    try { await deleteTask(taskId); } catch (err) { alert("ERASE_ERROR"); }
  };

  const handleSaveCMS = async () => {
    setCmsStatus('SAVING...');
    try {
      await updateLandingConfig(landingConfig);
      setCmsStatus('SAVED_SUCCESSFULLY');
      setTimeout(() => setCmsStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setCmsStatus('ERROR_SAVING');
    }
  };

  // Helper to update specific section key
  const updateSection = (section: keyof LandingConfig, key: string, value: any) => {
    setLandingConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Helper for deeply nested JSON edits (Roadmap, Features)
  const updateComplexSection = (section: keyof LandingConfig, valueString: string) => {
    try {
      const parsed = JSON.parse(valueString);
      setLandingConfig(prev => ({ ...prev, [section]: parsed }));
      setCmsStatus(''); // Clear error
    } catch (e) {
      setCmsStatus('INVALID_JSON_SYNTAX');
    }
  };

  const onlineUsersList = useMemo(() => users.filter(u => onlineUids.includes(u.uid)), [users, onlineUids]);
  const activeMiningCount = useMemo(() => users.filter(u => u.miningActive).length, [users]);

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono">ACCESS DENIED</div>;

  return (
    <div className="w-full space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <ShieldAlert className="w-6 h-6 text-black" />
           </div>
           <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Command_Center</h1>
             <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest font-mono mt-1">
               Admin: {firebaseUser?.email}
             </p>
           </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
           <button 
             onClick={() => setActiveTab('dashboard')}
             className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
           >
             Live Metrics
           </button>
           <button 
             onClick={() => setActiveTab('cms')}
             className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === 'cms' ? 'bg-primary text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
           >
             Content CMS
           </button>
        </div>
      </header>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <>
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
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 surface p-10 rounded-3xl space-y-10 border-zinc-900">
               <div className="flex items-center gap-3 mb-6">
                  <PlusCircle className="w-4 h-4 text-primary" />
                  <h3 className="label-meta text-white">Inject_Directive</h3>
               </div>
               <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs" placeholder="Task Title" />
                     <input required type="number" value={newTask.points} onChange={e => setNewTask({...newTask, points: parseInt(e.target.value)})} className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs" placeholder="Points" />
                  </div>
                  <input required value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs" placeholder="Verification Link" />
                  <input required type="number" value={newTask.timerSeconds} onChange={e => setNewTask({...newTask, timerSeconds: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs" placeholder="Timer (Seconds)" />
                  <textarea required value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs h-24" placeholder="Description" />
                  <button className="btn-primary w-full">Deploy Directive</button>
               </form>
            </div>
            
            <div className="lg:col-span-2 surface rounded-3xl overflow-hidden border-zinc-900 flex flex-col">
               <div className="bg-zinc-900/40 p-6 border-b border-zinc-800 flex justify-between items-center">
                  <span className="label-meta text-white">Active_Registry</span>
                  <span className="text-[8px] font-mono text-zinc-600">{tasks.length} SYNCED</span>
               </div>
               <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
                  {tasks.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-zinc-900/30 rounded border border-zinc-900">
                       <div>
                         <p className="text-white text-xs font-bold">{t.title}</p>
                         <p className="text-zinc-600 text-[10px]">{t.points} NEX</p>
                       </div>
                       <button onClick={() => handleDeleteTask(t.id)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </>
      )}

      {/* CMS TAB */}
      {activeTab === 'cms' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 sticky top-4 z-50 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-zinc-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Landing Page CMS</h2>
                <p className="text-[10px] text-zinc-500 font-mono">Manage public facing content</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-mono font-bold ${cmsStatus.includes('ERROR') || cmsStatus.includes('INVALID') ? 'text-red-500' : 'text-emerald-500'}`}>
                 {cmsStatus}
              </span>
              <button onClick={handleSaveCMS} className="btn-primary flex items-center gap-2">
                 <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Simple Text Sections */}
            {['hero', 'cta', 'footer', 'partners'].map((sectionKey) => {
               const section = landingConfig[sectionKey as keyof LandingConfig];
               if (!section) return null;
               
               return (
                 <div key={sectionKey} className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                       <h3 className="label-meta text-primary uppercase">{sectionKey} Section</h3>
                       <div className="flex items-center gap-2">
                          <label className="text-[9px] text-zinc-500 font-bold">VISIBLE</label>
                          <input 
                            type="checkbox" 
                            checked={section.isVisible} 
                            onChange={(e) => updateSection(sectionKey as keyof LandingConfig, 'isVisible', e.target.checked)}
                            className="w-4 h-4 accent-primary bg-zinc-900" 
                          />
                       </div>
                    </div>
                    
                    {/* Render fields dynamically based on key type */}
                    {Object.keys(section).map(field => {
                       if (field === 'isVisible' || typeof section[field] === 'object') return null;
                       return (
                         <div key={field} className="space-y-2">
                            <label className="text-[9px] text-zinc-600 font-bold uppercase">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                            {field.includes('description') || field.includes('subtitle') ? (
                              <textarea 
                                value={section[field]} 
                                onChange={(e) => updateSection(sectionKey as keyof LandingConfig, field, e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-xs font-mono h-24 focus:border-primary/50 outline-none"
                              />
                            ) : (
                              <input 
                                value={section[field]} 
                                onChange={(e) => updateSection(sectionKey as keyof LandingConfig, field, e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-xs font-mono focus:border-primary/50 outline-none"
                              />
                            )}
                         </div>
                       )
                    })}
                    
                    {/* Specific handling for Partners Array (Simple List) */}
                    {sectionKey === 'partners' && (
                       <div className="space-y-2">
                          <label className="text-[9px] text-zinc-600 font-bold uppercase">PARTNER LIST (JSON ARRAY)</label>
                          <textarea 
                             defaultValue={JSON.stringify(section.items, null, 2)}
                             onChange={(e) => updateComplexSection('partners', JSON.stringify({ ...section, items: JSON.parse(e.target.value || "[]") }))} 
                             className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-[10px] font-mono h-32 text-zinc-400 focus:text-white"
                          />
                       </div>
                    )}
                 </div>
               )
            })}

            {/* Complex JSON Sections (Roadmap, FAQ, Features) */}
            {['roadmap', 'architecture', 'features', 'faq'].map((sectionKey) => {
               const section = landingConfig[sectionKey as keyof LandingConfig];
               return (
                 <div key={sectionKey} className="surface p-8 rounded-3xl border-zinc-900 space-y-6 md:col-span-2">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                       <div className="flex items-center gap-3">
                          <FileCode className="w-4 h-4 text-zinc-600" />
                          <h3 className="label-meta text-primary uppercase">{sectionKey} Configuration (JSON)</h3>
                       </div>
                       <div className="flex items-center gap-2">
                          <label className="text-[9px] text-zinc-500 font-bold">VISIBLE</label>
                          <input 
                            type="checkbox" 
                            checked={section.isVisible} 
                            onChange={(e) => updateSection(sectionKey as keyof LandingConfig, 'isVisible', e.target.checked)}
                            className="w-4 h-4 accent-primary bg-zinc-900" 
                          />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[9px] text-zinc-600 font-bold uppercase">TITLE</label>
                             <input 
                                value={section.title} 
                                onChange={(e) => updateSection(sectionKey as keyof LandingConfig, 'title', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-xs font-mono"
                             />
                          </div>
                          {section.description && (
                            <div className="space-y-2">
                               <label className="text-[9px] text-zinc-600 font-bold uppercase">DESCRIPTION</label>
                               <textarea 
                                  value={section.description} 
                                  onChange={(e) => updateSection(sectionKey as keyof LandingConfig, 'description', e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-xs font-mono h-20"
                               />
                            </div>
                          )}
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[9px] text-zinc-600 font-bold uppercase">FULL CONFIGURATION OBJECT (Advanced)</label>
                          <textarea 
                             value={JSON.stringify(section, null, 2)}
                             onChange={(e) => updateComplexSection(sectionKey as keyof LandingConfig, e.target.value)}
                             className="w-full bg-zinc-950 border border-zinc-900 p-4 rounded-xl text-[10px] font-mono h-64 text-zinc-400 focus:text-white focus:border-primary transition-colors resize-y"
                             spellCheck={false}
                          />
                          <p className="text-[9px] text-zinc-600 italic">
                             Edit the JSON structure directly to modify nested items like layers, phases, or questions. Ensure syntax is valid.
                          </p>
                       </div>
                    </div>
                 </div>
               )
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;