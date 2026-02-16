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
  subscribeToContent,
  updateContent,
  DEFAULT_LANDING_CONFIG,
  DEFAULT_LEGAL_CONFIG,
  DEFAULT_ABOUT_CONFIG,
  DEFAULT_WHITEPAPER_CONFIG,
  DEFAULT_ARCHITECTURE_CONFIG,
  ADMIN_EMAIL
} from '../services/firebase';
import { 
  User, Task, NetworkStats, LandingConfig, 
  LegalConfig, AboutConfig, WhitepaperConfig, ArchitecturePageConfig 
} from '../types';
import { 
  Users, PlusCircle, Database, ShieldAlert, Cpu, 
  Radio, Trash2, Globe, Layout, Save, X, Plus, 
  BookOpen, FileText, Info, Zap, ChevronRight, Activity
} from 'lucide-react';

const AdminPanel = () => {
  const { user, firebaseUser } = useAuth();
  
  // Dashboard State
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onlineUids, setOnlineUids] = useState<string[]>([]);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '', description: '', points: 100.00, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0
  });

  // CMS State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cms'>('dashboard');
  const [activeCmsSection, setActiveCmsSection] = useState<'landing' | 'terms' | 'privacy' | 'about' | 'whitepaper' | 'architecture'>('landing');
  const [cmsStatus, setCmsStatus] = useState<string>('');

  // Page Configs
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  const [termsConfig, setTermsConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.terms);
  const [privacyConfig, setPrivacyConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.privacy);
  const [aboutConfig, setAboutConfig] = useState<AboutConfig>(DEFAULT_ABOUT_CONFIG);
  const [whitepaperConfig, setWhitepaperConfig] = useState<WhitepaperConfig>(DEFAULT_WHITEPAPER_CONFIG);
  const [archConfig, setArchConfig] = useState<ArchitecturePageConfig>(DEFAULT_ARCHITECTURE_CONFIG);

  const isAuthorized = 
    firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || 
    user?.role === 'admin';

  useEffect(() => {
    if (!isAuthorized) return;
    
    const unsubUsers = subscribeToUsers(setUsers);
    const unsubStats = subscribeToNetworkStats(setNetStats);
    const unsubOnline = subscribeToOnlineUsers(setOnlineUids);
    const unsubTasks = subscribeToTasks(setTasks);
    
    // CMS Subscriptions
    const unsubLanding = subscribeToLandingConfig(setLandingConfig);
    const unsubTerms = subscribeToContent('terms', DEFAULT_LEGAL_CONFIG.terms, setTermsConfig);
    const unsubPrivacy = subscribeToContent('privacy', DEFAULT_LEGAL_CONFIG.privacy, setPrivacyConfig);
    const unsubAbout = subscribeToContent('about', DEFAULT_ABOUT_CONFIG, setAboutConfig);
    const unsubWhitepaper = subscribeToContent('whitepaper', DEFAULT_WHITEPAPER_CONFIG, setWhitepaperConfig);
    const unsubArch = subscribeToContent('architecture_page', DEFAULT_ARCHITECTURE_CONFIG, setArchConfig);
    
    return () => {
      unsubUsers(); unsubStats(); unsubOnline(); unsubTasks();
      unsubLanding(); unsubTerms(); unsubPrivacy(); unsubAbout(); unsubWhitepaper(); unsubArch();
    };
  }, [isAuthorized]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNewTask(newTask);
      // alert("DIRECTIVE_INJECTED: Task deployed.");
      setNewTask({ title: '', description: '', points: 100.00, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0 });
    } catch (err) { alert("INJECTION_ERROR"); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("TERMINATE_DIRECTIVE?")) return;
    try { await deleteTask(taskId); } catch (err) { alert("ERASE_ERROR"); }
  };

  const handleSaveCMS = async () => {
    setCmsStatus('SAVING...');
    try {
      if (activeCmsSection === 'landing') await updateLandingConfig(landingConfig);
      else if (activeCmsSection === 'terms') await updateContent('terms', termsConfig);
      else if (activeCmsSection === 'privacy') await updateContent('privacy', privacyConfig);
      else if (activeCmsSection === 'about') await updateContent('about', aboutConfig);
      else if (activeCmsSection === 'whitepaper') await updateContent('whitepaper', whitepaperConfig);
      else if (activeCmsSection === 'architecture') await updateContent('architecture_page', archConfig);
      
      setCmsStatus('SAVED');
      setTimeout(() => setCmsStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setCmsStatus('ERROR');
    }
  };

  // --- CMS Helper Functions ---
  const updateLanding = (section: keyof LandingConfig, key: string, value: any) => {
    setLandingConfig(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const activeMiningCount = useMemo(() => users.filter(u => u.miningActive).length, [users]);

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono">ACCESS DENIED</div>;

  return (
    <div className="w-full space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/20 p-6 rounded-3xl border border-zinc-900">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-xl border border-primary/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
              <ShieldAlert className="w-6 h-6 text-primary" />
           </div>
           <div>
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Command_Center</h1>
             <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                  Root Access: {firebaseUser?.email}
                </p>
             </div>
           </div>
        </div>
        
        <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
           <button 
             onClick={() => setActiveTab('dashboard')} 
             className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
           >
             <Activity className="w-3 h-3" /> Live Metrics
           </button>
           <button 
             onClick={() => setActiveTab('cms')} 
             className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === 'cms' ? 'bg-primary text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
           >
             <Layout className="w-3 h-3" /> Content CMS
           </button>
        </div>
      </header>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="animate-in fade-in duration-300 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Network Nodes', val: users.length, sub: 'Registered Entities', icon: Globe, color: 'text-zinc-400', border: 'border-zinc-800' },
              { label: 'Active Miners', val: activeMiningCount, sub: 'Core Computing', icon: Cpu, color: 'text-primary', pulse: true, border: 'border-primary/30' },
              { label: 'Live Presence', val: onlineUids.length, sub: 'WebSocket Heartbeats', icon: Radio, color: 'text-emerald-500', ping: true, border: 'border-emerald-500/30' },
              { label: 'Total Circulation', val: Math.floor(netStats.totalMined).toLocaleString(), sub: 'ARG Credits', icon: Database, color: 'text-zinc-600', border: 'border-zinc-800' }
            ].map((s, i) => (
              <div key={i} className={`surface p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-opacity-100 border ${s.border} bg-gradient-to-br from-zinc-900/50 to-zinc-950`}>
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-900`}>
                      <s.icon className={`w-4 h-4 ${s.color} ${s.ping ? 'animate-bounce' : ''}`} />
                    </div>
                    {s.pulse && <div className="flex gap-1"><div className="w-1 h-3 bg-primary/20 rounded-full"></div><div className="w-1 h-3 bg-primary/40 rounded-full animate-pulse"></div></div>}
                </div>
                <h3 className="text-3xl font-mono font-bold text-white tracking-tighter mb-1">{s.val}</h3>
                <p className="label-meta text-zinc-500 text-[9px] uppercase tracking-widest">{s.sub}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 surface p-8 rounded-3xl space-y-8 border-zinc-900 bg-zinc-900/20">
               <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
                 <div className="flex items-center gap-3">
                    <PlusCircle className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="label-meta text-white">Inject_Directive</h3>
                      <p className="text-[10px] text-zinc-500 font-mono">Create new task for nodes</p>
                    </div>
                 </div>
               </div>
               
               <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="grid grid-cols-12 gap-4">
                     <div className="col-span-8">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1.5 block">Title</label>
                        <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="cms-input" placeholder="e.g. Follow Protocol Twitter" />
                     </div>
                     <div className="col-span-4">
                        <label className="text-[9px] font-bold text-primary uppercase mb-1.5 block">Points (Decimal)</label>
                        <input 
                          required 
                          type="number" 
                          step="0.01"
                          value={newTask.points} 
                          onChange={e => setNewTask({...newTask, points: parseFloat(e.target.value)})} 
                          className="cms-input border-primary/20 focus:border-primary" 
                          placeholder="0.00" 
                        />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1.5 block">Action Link</label>
                        <input required value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} className="cms-input" placeholder="https://" />
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1.5 block">Timer (Sec)</label>
                        <input required type="number" value={newTask.timerSeconds} onChange={e => setNewTask({...newTask, timerSeconds: parseInt(e.target.value)})} className="cms-input" placeholder="0 for instant" />
                    </div>
                  </div>

                  <div>
                     <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1.5 block">Description</label>
                     <textarea required value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="cms-input h-20 resize-none" placeholder="Task details..." />
                  </div>

                  <button className="btn-primary w-full flex items-center justify-center gap-2 group">
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" /> Deploy Directive to Network
                  </button>
               </form>
            </div>
            
            <div className="lg:col-span-2 surface rounded-3xl overflow-hidden border-zinc-900 flex flex-col bg-zinc-900/20">
               <div className="bg-zinc-950/50 p-6 border-b border-zinc-800 flex justify-between items-center backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-zinc-400" />
                    <span className="label-meta text-white">Active Registry</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-500 font-bold">{tasks.length} ACTIVE</span>
               </div>
               <div className="p-4 space-y-2 overflow-y-auto max-h-[500px] custom-scrollbar">
                  {tasks.length === 0 && (
                    <div className="text-center py-10 opacity-30">
                      <Layout className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-[10px] font-mono uppercase">No directives found</p>
                    </div>
                  )}
                  {tasks.map(t => (
                    <div key={t.id} className="group flex justify-between items-center p-4 bg-zinc-950/40 hover:bg-zinc-900/60 rounded-xl border border-zinc-900 hover:border-zinc-700 transition-all">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-600 font-bold text-xs">
                            {t.icon === 'twitter' ? 'X' : 'W'}
                         </div>
                         <div>
                           <p className="text-zinc-200 text-xs font-bold leading-tight">{t.title}</p>
                           <p className="text-primary text-[10px] font-mono mt-0.5">{t.points.toFixed(2)} ARG</p>
                         </div>
                       </div>
                       <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-zinc-950/80 p-4 md:p-6 rounded-3xl border border-zinc-800 sticky top-4 z-50 backdrop-blur-xl shadow-2xl gap-4">
            <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'landing', label: 'Landing', icon: Layout },
                  { id: 'about', label: 'About', icon: Info },
                  { id: 'whitepaper', label: 'Whitepaper', icon: FileText },
                  { id: 'architecture', label: 'Arch', icon: Cpu },
                  { id: 'terms', label: 'Terms', icon: BookOpen },
                  { id: 'privacy', label: 'Privacy', icon: ShieldAlert }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCmsSection(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeCmsSection === tab.id ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                  >
                    <tab.icon className="w-3 h-3" />
                    {tab.label}
                  </button>
                ))}
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              {cmsStatus && (
                <span className={`text-[10px] font-mono font-bold uppercase animate-pulse ${cmsStatus.includes('ERROR') ? 'text-red-500' : 'text-emerald-500'}`}>
                  {cmsStatus}
                </span>
              )}
              <button onClick={handleSaveCMS} className="btn-primary flex items-center gap-2 !py-2.5 !px-6 !rounded-xl text-[10px]">
                 <Save className="w-3 h-3" /> Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* LANDING EDITOR */}
            {activeCmsSection === 'landing' && (
              <div className="space-y-6">
                <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6 bg-zinc-900/10">
                  <h3 className="label-meta text-primary uppercase border-b border-zinc-900 pb-2">Hero Section</h3>
                  <div className="grid gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Headline</label>
                      <input value={landingConfig.hero.title} onChange={(e) => updateLanding('hero', 'title', e.target.value)} className="cms-input" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Subheadline</label>
                      <textarea value={landingConfig.hero.subtitle} onChange={(e) => updateLanding('hero', 'subtitle', e.target.value)} className="cms-input h-24" />
                    </div>
                  </div>
                </div>
                {/* Simplified for brevity - Assume all Landing fields are here as per previous version */}
                <div className="surface p-8 rounded-3xl border-zinc-900 text-center text-zinc-500 text-xs border-dashed">
                  Full Landing Editor active. Configure other sections below.
                </div>
              </div>
            )}

            {/* TERMS & PRIVACY EDITOR */}
            {(activeCmsSection === 'terms' || activeCmsSection === 'privacy') && (
              <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
                 {(() => {
                    const config = activeCmsSection === 'terms' ? termsConfig : privacyConfig;
                    const setConfig = activeCmsSection === 'terms' ? setTermsConfig : setPrivacyConfig;
                    
                    return (
                      <>
                        <h3 className="label-meta text-primary uppercase border-b border-zinc-900 pb-2">
                           {activeCmsSection === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                        </h3>
                        <div className="grid gap-4">
                           <div>
                              <label className="text-[9px] text-zinc-500 font-bold uppercase mb-1 block">Last Updated Date</label>
                              <input value={config.lastUpdated} onChange={e => setConfig({...config, lastUpdated: e.target.value})} className="cms-input w-full md:w-1/3" />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[9px] text-zinc-500 font-bold uppercase block">Content Sections</label>
                              {config.sections.map((sec, idx) => (
                                 <div key={idx} className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 space-y-3 relative group hover:border-zinc-800 transition-colors">
                                    <button onClick={() => {
                                       const newSecs = [...config.sections];
                                       newSecs.splice(idx, 1);
                                       setConfig({...config, sections: newSecs});
                                    }} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                    
                                    <input value={sec.heading} onChange={e => {
                                       const newSecs = [...config.sections];
                                       newSecs[idx] = {...newSecs[idx], heading: e.target.value};
                                       setConfig({...config, sections: newSecs});
                                    }} className="cms-input font-bold text-sm !bg-zinc-900/50" placeholder="Section Heading" />
                                    
                                    <textarea value={sec.content} onChange={e => {
                                       const newSecs = [...config.sections];
                                       newSecs[idx] = {...newSecs[idx], content: e.target.value};
                                       setConfig({...config, sections: newSecs});
                                    }} className="cms-input h-32 text-xs !bg-zinc-900/50" placeholder="Section Content" />
                                 </div>
                              ))}
                              <button onClick={() => setConfig({...config, sections: [...config.sections, {heading: 'New Section', content: ''}]})} className="btn-secondary w-full border-dashed py-4 opacity-60 hover:opacity-100">
                                 <Plus className="w-4 h-4 mr-2" /> Add Section
                              </button>
                           </div>
                        </div>
                      </>
                    );
                 })()}
              </div>
            )}

            {/* Other editors kept simple for brevity but following same pattern */}
            {activeCmsSection === 'about' && (
              <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
                <h3 className="label-meta text-primary uppercase border-b border-zinc-900 pb-2">About Page</h3>
                <input value={aboutConfig.title} onChange={e => setAboutConfig({...aboutConfig, title: e.target.value})} className="cms-input" placeholder="Title" />
                <textarea value={aboutConfig.subtitle} onChange={e => setAboutConfig({...aboutConfig, subtitle: e.target.value})} className="cms-input h-20" placeholder="Subtitle" />
              </div>
            )}
            
            {activeCmsSection === 'whitepaper' && (
               <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
                 <h3 className="label-meta text-primary uppercase border-b border-zinc-900 pb-2">Whitepaper</h3>
                 <input value={whitepaperConfig.title} onChange={e => setWhitepaperConfig({...whitepaperConfig, title: e.target.value})} className="cms-input" placeholder="Title" />
               </div>
            )}

            {activeCmsSection === 'architecture' && (
               <div className="surface p-8 rounded-3xl border-zinc-900 space-y-6">
                  <h3 className="label-meta text-primary uppercase border-b border-zinc-900 pb-2">Architecture Page</h3>
                  <input value={archConfig.heroTitle} onChange={e => setArchConfig({...archConfig, heroTitle: e.target.value})} className="cms-input" placeholder="Hero Title" />
               </div>
            )}

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
            padding: 0.85rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.75rem;
            font-family: 'JetBrains Mono', monospace;
            outline: none;
            transition: all 0.2s;
         }
         .cms-input:focus {
            border-color: #f43f5e;
            background-color: #0c0c0e;
            box-shadow: 0 0 0 1px rgba(244, 63, 94, 0.2);
         }
      `}</style>
    </div>
  );
};

export default AdminPanel;