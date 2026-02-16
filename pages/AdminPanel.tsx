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
  FileCode,
  X,
  ChevronDown,
  ChevronUp,
  Plus
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

  // --- CMS Helper Functions ---
  const updateSection = (section: keyof LandingConfig, key: string, value: any) => {
    setLandingConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  // Helper to safely update arrays within sections
  const updateArrayItem = (section: keyof LandingConfig, arrayName: string, index: number, field: string | null, value: any) => {
    setLandingConfig(prev => {
      const sectionData = { ...prev[section] };
      const newArray = [...sectionData[arrayName]];
      if (field) {
        newArray[index] = { ...newArray[index], [field]: value };
      } else {
        newArray[index] = value; // Direct value update for simple arrays
      }
      return { ...prev, [section]: { ...sectionData, [arrayName]: newArray } };
    });
  };

  const addArrayItem = (section: keyof LandingConfig, arrayName: string, initialItem: any) => {
    setLandingConfig(prev => {
      const sectionData = { ...prev[section] };
      return { ...prev, [section]: { ...sectionData, [arrayName]: [...sectionData[arrayName], initialItem] } };
    });
  };

  const removeArrayItem = (section: keyof LandingConfig, arrayName: string, index: number) => {
    setLandingConfig(prev => {
      const sectionData = { ...prev[section] };
      const newArray = [...sectionData[arrayName]];
      newArray.splice(index, 1);
      return { ...prev, [section]: { ...sectionData, [arrayName]: newArray } };
    });
  };

  const activeMiningCount = useMemo(() => users.filter(u => u.miningActive).length, [users]);

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono">ACCESS DENIED</div>;

  return (
    <div className="w-full space-y-8 pb-20">
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
        <div className="animate-in fade-in duration-300 space-y-8">
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
        </div>
      )}

      {/* CMS TAB */}
      {activeTab === 'cms' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          
          {/* Sticky CMS Header */}
          <div className="flex items-center justify-between bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 sticky top-4 z-50 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-zinc-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Landing Page CMS</h2>
                <p className="text-[10px] text-zinc-500 font-mono">Real-time content modification</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-mono font-bold uppercase ${cmsStatus.includes('ERROR') ? 'text-red-500' : 'text-emerald-500'}`}>
                 {cmsStatus}
              </span>
              <button onClick={handleSaveCMS} className="btn-primary flex items-center gap-2 !py-2 !px-4">
                 <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* HERO SECTION EDITOR */}
            <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
               <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <h3 className="label-meta text-primary uppercase">Hero Section</h3>
                  <div className="flex items-center gap-2">
                     <label className="text-[9px] text-zinc-500 font-bold">VISIBLE</label>
                     <input type="checkbox" checked={landingConfig.hero.isVisible} onChange={(e) => updateSection('hero', 'isVisible', e.target.checked)} className="accent-primary" />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[9px] text-zinc-600 font-bold uppercase">Main Title</label>
                     <input value={landingConfig.hero.title} onChange={(e) => updateSection('hero', 'title', e.target.value)} className="cms-input" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[9px] text-zinc-600 font-bold uppercase">Subtitle</label>
                     <textarea value={landingConfig.hero.subtitle} onChange={(e) => updateSection('hero', 'subtitle', e.target.value)} className="cms-input h-24" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] text-zinc-600 font-bold uppercase">CTA Primary</label>
                     <input value={landingConfig.hero.ctaPrimary} onChange={(e) => updateSection('hero', 'ctaPrimary', e.target.value)} className="cms-input" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] text-zinc-600 font-bold uppercase">CTA Secondary</label>
                     <input value={landingConfig.hero.ctaSecondary} onChange={(e) => updateSection('hero', 'ctaSecondary', e.target.value)} className="cms-input" />
                  </div>
               </div>
            </div>

            {/* PARTNERS EDITOR */}
            <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
               <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <h3 className="label-meta text-primary uppercase">Partners / Investors</h3>
                  <input type="checkbox" checked={landingConfig.partners.isVisible} onChange={(e) => updateSection('partners', 'isVisible', e.target.checked)} className="accent-primary" />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase">Section Title</label>
                  <input value={landingConfig.partners.title} onChange={(e) => updateSection('partners', 'title', e.target.value)} className="cms-input" />
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase">Partner Names (One per line)</label>
                  {landingConfig.partners.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                       <input value={item} onChange={(e) => updateArrayItem('partners', 'items', idx, null, e.target.value)} className="cms-input" />
                       <button onClick={() => removeArrayItem('partners', 'items', idx)} className="p-2 bg-zinc-900 rounded hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('partners', 'items', 'NEW_PARTNER')} className="text-xs flex items-center gap-2 text-primary hover:text-white transition-colors font-bold mt-2">
                     <PlusCircle className="w-4 h-4" /> Add Partner
                  </button>
               </div>
            </div>

            {/* FEATURES EDITOR */}
            <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
               <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <h3 className="label-meta text-primary uppercase">Core Features</h3>
                  <input type="checkbox" checked={landingConfig.features.isVisible} onChange={(e) => updateSection('features', 'isVisible', e.target.checked)} className="accent-primary" />
               </div>
               <div className="space-y-4">
                  <input value={landingConfig.features.title} onChange={(e) => updateSection('features', 'title', e.target.value)} className="cms-input" placeholder="Title" />
                  <textarea value={landingConfig.features.description} onChange={(e) => updateSection('features', 'description', e.target.value)} className="cms-input h-16" placeholder="Description" />
               </div>
               <div className="space-y-4">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase block">Feature Cards</label>
                  {landingConfig.features.items.map((item, idx) => (
                     <div key={idx} className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-3 relative group">
                        <button onClick={() => removeArrayItem('features', 'items', idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500"><X className="w-4 h-4" /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <input value={item.title} onChange={(e) => updateArrayItem('features', 'items', idx, 'title', e.target.value)} className="cms-input" placeholder="Feature Title" />
                           <select value={item.icon} onChange={(e) => updateArrayItem('features', 'items', idx, 'icon', e.target.value)} className="cms-input">
                              <option value="Globe">Globe Icon</option>
                              <option value="ShieldCheck">Shield Icon</option>
                              <option value="Cpu">CPU Icon</option>
                           </select>
                           <div className="md:col-span-2">
                              <textarea value={item.desc} onChange={(e) => updateArrayItem('features', 'items', idx, 'desc', e.target.value)} className="cms-input h-16" placeholder="Feature Description" />
                           </div>
                        </div>
                     </div>
                  ))}
                  <button onClick={() => addArrayItem('features', 'items', { title: 'New Feature', desc: 'Description', icon: 'Cpu' })} className="btn-secondary w-full border-dashed">
                     + Add Feature Card
                  </button>
               </div>
            </div>

            {/* ROADMAP EDITOR */}
            <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
               <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <h3 className="label-meta text-primary uppercase">Roadmap Phases</h3>
                  <input type="checkbox" checked={landingConfig.roadmap.isVisible} onChange={(e) => updateSection('roadmap', 'isVisible', e.target.checked)} className="accent-primary" />
               </div>
               <div className="space-y-4">
                  <input value={landingConfig.roadmap.title} onChange={(e) => updateSection('roadmap', 'title', e.target.value)} className="cms-input" />
                  <textarea value={landingConfig.roadmap.description} onChange={(e) => updateSection('roadmap', 'description', e.target.value)} className="cms-input h-16" />
               </div>
               <div className="space-y-4">
                  {landingConfig.roadmap.phases.map((phase, idx) => (
                     <div key={idx} className="p-6 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-4 relative">
                        <div className="flex justify-between items-start">
                           <span className="label-meta text-zinc-500">PHASE {idx + 1}</span>
                           <button onClick={() => removeArrayItem('roadmap', 'phases', idx)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <input value={phase.phase} onChange={(e) => updateArrayItem('roadmap', 'phases', idx, 'phase', e.target.value)} className="cms-input" placeholder="01" />
                           <input value={phase.period} onChange={(e) => updateArrayItem('roadmap', 'phases', idx, 'period', e.target.value)} className="cms-input" placeholder="Q1 2025" />
                           <select value={phase.status} onChange={(e) => updateArrayItem('roadmap', 'phases', idx, 'status', e.target.value)} className="cms-input">
                              <option value="LIVE">LIVE</option>
                              <option value="UPCOMING">UPCOMING</option>
                              <option value="LOCKED">LOCKED</option>
                           </select>
                           <div className="md:col-span-1"></div>
                           <div className="col-span-2 md:col-span-4">
                              <input value={phase.title} onChange={(e) => updateArrayItem('roadmap', 'phases', idx, 'title', e.target.value)} className="cms-input" placeholder="Phase Title" />
                           </div>
                           <div className="col-span-2 md:col-span-4">
                              <textarea value={phase.desc} onChange={(e) => updateArrayItem('roadmap', 'phases', idx, 'desc', e.target.value)} className="cms-input h-16" placeholder="Phase Description" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] text-zinc-600 font-bold uppercase">Features List (Comma Separated for UI simplicity in this view)</label>
                           {/* Simplified editing for string array */}
                           <textarea 
                              value={phase.features.join('\n')} 
                              onChange={(e) => updateArrayItem('roadmap', 'phases', idx, 'features', e.target.value.split('\n'))}
                              className="cms-input h-24 font-mono text-xs"
                              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                           />
                        </div>
                     </div>
                  ))}
                  <button onClick={() => addArrayItem('roadmap', 'phases', { phase: '0X', title: 'New Phase', period: 'TBD', status: 'LOCKED', desc: 'Description', features: [] })} className="btn-secondary w-full border-dashed">
                     + Add Roadmap Phase
                  </button>
               </div>
            </div>

            {/* ARCHITECTURE EDITOR */}
            <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
               <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <h3 className="label-meta text-primary uppercase">Architecture</h3>
                  <input type="checkbox" checked={landingConfig.architecture.isVisible} onChange={(e) => updateSection('architecture', 'isVisible', e.target.checked)} className="accent-primary" />
               </div>
               <input value={landingConfig.architecture.title} onChange={(e) => updateSection('architecture', 'title', e.target.value)} className="cms-input" />
               <textarea value={landingConfig.architecture.description} onChange={(e) => updateSection('architecture', 'description', e.target.value)} className="cms-input h-20" />
               
               <div className="space-y-3">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase">Layers</label>
                  {landingConfig.architecture.layers.map((layer, idx) => (
                     <div key={idx} className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                           <input value={layer.title} onChange={(e) => updateArrayItem('architecture', 'layers', idx, 'title', e.target.value)} className="cms-input" placeholder="Layer Title" />
                           <input value={layer.desc} onChange={(e) => updateArrayItem('architecture', 'layers', idx, 'desc', e.target.value)} className="cms-input" placeholder="Layer Description" />
                        </div>
                        <button onClick={() => removeArrayItem('architecture', 'layers', idx)} className="p-2 mt-1 text-zinc-600 hover:text-red-500"><X className="w-4 h-4" /></button>
                     </div>
                  ))}
                  <button onClick={() => addArrayItem('architecture', 'layers', { title: 'New Layer', desc: 'Description' })} className="text-xs text-primary font-bold flex items-center gap-2 mt-2">
                     <Plus className="w-4 h-4" /> Add Layer
                  </button>
               </div>
            </div>

             {/* FAQ EDITOR */}
             <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
               <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <h3 className="label-meta text-primary uppercase">FAQ Section</h3>
                  <input type="checkbox" checked={landingConfig.faq.isVisible} onChange={(e) => updateSection('faq', 'isVisible', e.target.checked)} className="accent-primary" />
               </div>
               <input value={landingConfig.faq.title} onChange={(e) => updateSection('faq', 'title', e.target.value)} className="cms-input" />
               
               <div className="space-y-4">
                  {landingConfig.faq.items.map((item, idx) => (
                     <div key={idx} className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-3 relative">
                        <button onClick={() => removeArrayItem('faq', 'items', idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        <div className="pr-10">
                           <input value={item.q} onChange={(e) => updateArrayItem('faq', 'items', idx, 'q', e.target.value)} className="cms-input mb-2 font-bold" placeholder="Question" />
                           <textarea value={item.a} onChange={(e) => updateArrayItem('faq', 'items', idx, 'a', e.target.value)} className="cms-input h-20 text-zinc-400" placeholder="Answer" />
                        </div>
                     </div>
                  ))}
                  <button onClick={() => addArrayItem('faq', 'items', { q: 'New Question?', a: 'Answer.' })} className="btn-secondary w-full border-dashed">
                     + Add FAQ Item
                  </button>
               </div>
            </div>

             {/* CTA & FOOTER */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="surface p-8 rounded-3xl border-zinc-900 space-y-4">
                  <div className="flex justify-between border-b border-zinc-900 pb-4 mb-2">
                     <h3 className="label-meta text-primary">CTA Section</h3>
                     <input type="checkbox" checked={landingConfig.cta.isVisible} onChange={(e) => updateSection('cta', 'isVisible', e.target.checked)} className="accent-primary" />
                  </div>
                  <input value={landingConfig.cta.title} onChange={(e) => updateSection('cta', 'title', e.target.value)} className="cms-input" placeholder="Title" />
                  <textarea value={landingConfig.cta.description} onChange={(e) => updateSection('cta', 'description', e.target.value)} className="cms-input h-24" placeholder="Description" />
                  <input value={landingConfig.cta.buttonText} onChange={(e) => updateSection('cta', 'buttonText', e.target.value)} className="cms-input" placeholder="Button Text" />
               </div>

               <div className="surface p-8 rounded-3xl border-zinc-900 space-y-4">
                  <div className="flex justify-between border-b border-zinc-900 pb-4 mb-2">
                     <h3 className="label-meta text-primary">Footer</h3>
                     <input type="checkbox" checked={landingConfig.footer.isVisible} onChange={(e) => updateSection('footer', 'isVisible', e.target.checked)} className="accent-primary" />
                  </div>
                  <input value={landingConfig.footer.title} onChange={(e) => updateSection('footer', 'title', e.target.value)} className="cms-input" placeholder="Brand Name" />
                  <textarea value={landingConfig.footer.description} onChange={(e) => updateSection('footer', 'description', e.target.value)} className="cms-input h-24" placeholder="Footer Blurb" />
                  <input value={landingConfig.footer.copyright} onChange={(e) => updateSection('footer', 'copyright', e.target.value)} className="cms-input" placeholder="Copyright Text" />
               </div>
             </div>

          </div>
        </div>
      )}

      {/* Styles for CMS Inputs */}
      <style>{`
         .cms-input {
            width: 100%;
            background-color: #09090b;
            border: 1px solid #27272a;
            color: #f4f4f5;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.75rem;
            font-family: 'JetBrains Mono', monospace;
            outline: none;
            transition: all 0.2s;
         }
         .cms-input:focus {
            border-color: #f43f5e;
            background-color: #0c0c0e;
         }
      `}</style>
    </div>
  );
};

export default AdminPanel;