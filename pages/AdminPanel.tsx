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
  BookOpen, FileText, Info, Zap, ChevronRight, Activity,
  ToggleLeft, ToggleRight, Layers, List, AlignLeft,
  CheckCircle2, ArrowRight
} from 'lucide-react';

// --- Helper Components ---

const InputGroup = ({ label, value, onChange, type = "text", className = "", placeholder = "" }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
    {type === 'textarea' ? (
      <textarea 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className="cms-input h-24 resize-y" 
        placeholder={placeholder}
      />
    ) : (
      <input 
        type={type} 
        value={value || ''} 
        onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)} 
        className="cms-input" 
        placeholder={placeholder}
      />
    )}
  </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
    <button 
      onClick={() => onChange(!checked)} 
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-zinc-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SectionHeader = ({ title, icon: Icon, description }: any) => (
  <div className="mb-6 border-b border-zinc-900 pb-4">
    <div className="flex items-center gap-3 mb-1">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
    </div>
    {description && <p className="text-xs text-zinc-500 ml-12">{description}</p>}
  </div>
);

const ArrayItem = ({ children, onDelete }: any) => (
  <div className="group relative p-4 bg-zinc-900/30 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
    <button 
      onClick={onDelete}
      className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
    >
      <X className="w-4 h-4" />
    </button>
    {children}
  </div>
);

// --- Main Component ---

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
  const [activeCmsPage, setActiveCmsPage] = useState<'landing' | 'terms' | 'privacy' | 'about' | 'whitepaper' | 'architecture'>('landing');
  const [activeLandingSection, setActiveLandingSection] = useState<string>('hero');
  const [cmsStatus, setCmsStatus] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Config State
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  // Other configs...
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
    const unsubLanding = subscribeToLandingConfig((data) => {
      setLandingConfig(data);
      setHasUnsavedChanges(false);
    });
    // ... subscribes for other pages omitted for brevity but would follow same pattern
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

  // Handle local changes without saving immediately
  const updateLanding = (section: keyof LandingConfig, key: string, value: any) => {
    setLandingConfig(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    setHasUnsavedChanges(true);
  };

  const updateLandingArray = (section: keyof LandingConfig, key: string, newValue: any[]) => {
    setLandingConfig(prev => ({ ...prev, [section]: { ...prev[section], [key]: newValue } }));
    setHasUnsavedChanges(true);
  };

  const handleSaveCMS = async () => {
    setCmsStatus('SAVING...');
    try {
      if (activeCmsPage === 'landing') await updateLandingConfig(landingConfig);
      else if (activeCmsPage === 'terms') await updateContent('terms', termsConfig);
      else if (activeCmsPage === 'privacy') await updateContent('privacy', privacyConfig);
      else if (activeCmsPage === 'about') await updateContent('about', aboutConfig);
      else if (activeCmsPage === 'whitepaper') await updateContent('whitepaper', whitepaperConfig);
      else if (activeCmsPage === 'architecture') await updateContent('architecture_page', archConfig);
      
      setCmsStatus('SAVED');
      setHasUnsavedChanges(false);
      setTimeout(() => setCmsStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setCmsStatus('ERROR');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNewTask(newTask);
      setNewTask({ title: '', description: '', points: 100.00, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0 });
    } catch (err) { alert("INJECTION_ERROR"); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("TERMINATE_DIRECTIVE?")) return;
    try { await deleteTask(taskId); } catch (err) { alert("ERASE_ERROR"); }
  };

  const activeMiningCount = useMemo(() => users.filter(u => u.miningActive).length, [users]);

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono">ACCESS DENIED</div>;

  return (
    <div className="w-full space-y-8 pb-20 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-900 backdrop-blur-xl sticky top-4 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-zinc-950 flex items-center justify-center rounded-xl border border-zinc-800 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-primary" />
           </div>
           <div>
             <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Command_Center</h1>
             <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                  {firebaseUser?.email}
                </p>
             </div>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
             <button 
               onClick={() => setActiveTab('dashboard')} 
               className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
             >
               <Activity className="w-3 h-3" /> Live
             </button>
             <button 
               onClick={() => setActiveTab('cms')} 
               className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === 'cms' ? 'bg-primary text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
             >
               <Layout className="w-3 h-3" /> CMS
             </button>
           </div>
           
           {activeTab === 'cms' && (
             <button 
                onClick={handleSaveCMS} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${hasUnsavedChanges ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 text-zinc-500'}`}
             >
                <Save className="w-3 h-3" />
                {cmsStatus || (hasUnsavedChanges ? 'Save Changes' : 'Saved')}
             </button>
           )}
        </div>
      </header>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
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
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" /> Deploy Directive
                  </button>
               </form>
            </div>
            
            <div className="lg:col-span-2 surface rounded-3xl overflow-hidden border-zinc-900 flex flex-col bg-zinc-900/20">
               <div className="bg-zinc-950/50 p-6 border-b border-zinc-800 flex justify-between items-center">
                  <span className="label-meta text-white">Active Registry</span>
                  <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-500 font-bold">{tasks.length} ACTIVE</span>
               </div>
               <div className="p-4 space-y-2 overflow-y-auto max-h-[500px] custom-scrollbar">
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
                       <button onClick={() => handleDeleteTask(t.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CMS TAB --- */}
      {activeTab === 'cms' && (
        <div className="grid grid-cols-12 gap-8">
          
          {/* CMS SIDEBAR */}
          <div className="col-span-3 space-y-6">
            <div className="surface p-4 rounded-2xl border-zinc-900 space-y-1">
              <p className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pages</p>
              {[
                { id: 'landing', label: 'Landing Page', icon: Layout },
                { id: 'about', label: 'About Us', icon: Info },
                { id: 'architecture', label: 'Architecture', icon: Layers },
                { id: 'whitepaper', label: 'Whitepaper', icon: FileText },
                { id: 'terms', label: 'Terms & Service', icon: BookOpen },
                { id: 'privacy', label: 'Privacy Policy', icon: ShieldAlert }
              ].map(page => (
                <button
                  key={page.id}
                  onClick={() => setActiveCmsPage(page.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeCmsPage === page.id ? 'bg-primary text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
                >
                  <page.icon className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">{page.label}</span>
                </button>
              ))}
            </div>

            {activeCmsPage === 'landing' && (
              <div className="surface p-4 rounded-2xl border-zinc-900 space-y-1">
                 <p className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sections</p>
                 {['hero', 'partners', 'architecture', 'features', 'roadmap', 'faq', 'cta', 'footer'].map(sec => (
                   <button
                     key={sec}
                     onClick={() => setActiveLandingSection(sec)}
                     className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeLandingSection === sec ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
                   >
                     <div className={`w-1.5 h-1.5 rounded-full ${landingConfig[sec as keyof LandingConfig]?.isVisible ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                     <span className="text-xs font-bold uppercase tracking-wide">{sec}</span>
                   </button>
                 ))}
              </div>
            )}
          </div>

          {/* CMS EDITOR CONTENT */}
          <div className="col-span-9 space-y-6">
            
            {/* --- LANDING PAGE EDITORS --- */}
            {activeCmsPage === 'landing' && (
              <div className="surface p-8 rounded-3xl border-zinc-900 min-h-[600px]">
                
                {/* HERO EDITOR */}
                {activeLandingSection === 'hero' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <SectionHeader title="Hero Section" icon={Layout} description="The main entry point of the application." />
                    <Toggle label="Section Visible" checked={landingConfig.hero.isVisible} onChange={(v: boolean) => updateLanding('hero', 'isVisible', v)} />
                    <InputGroup label="Headline" value={landingConfig.hero.title} onChange={(v: string) => updateLanding('hero', 'title', v)} />
                    <InputGroup label="Subtitle" type="textarea" value={landingConfig.hero.subtitle} onChange={(v: string) => updateLanding('hero', 'subtitle', v)} />
                    <div className="grid grid-cols-2 gap-4">
                       <InputGroup label="Primary CTA" value={landingConfig.hero.ctaPrimary} onChange={(v: string) => updateLanding('hero', 'ctaPrimary', v)} />
                       <InputGroup label="Secondary CTA" value={landingConfig.hero.ctaSecondary} onChange={(v: string) => updateLanding('hero', 'ctaSecondary', v)} />
                    </div>
                  </div>
                )}

                {/* PARTNERS EDITOR */}
                {activeLandingSection === 'partners' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <SectionHeader title="Partners / Logos" icon={Users} description="Display logos of trusted partners or investors." />
                    <Toggle label="Section Visible" checked={landingConfig.partners.isVisible} onChange={(v: boolean) => updateLanding('partners', 'isVisible', v)} />
                    <InputGroup label="Section Title" value={landingConfig.partners.title} onChange={(v: string) => updateLanding('partners', 'title', v)} />
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Partner Names (Underscores become spaces)</label>
                      {landingConfig.partners.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                           <input 
                             value={item} 
                             onChange={e => {
                               const newItems = [...landingConfig.partners.items];
                               newItems[idx] = e.target.value;
                               updateLandingArray('partners', 'items', newItems);
                             }}
                             className="cms-input"
                           />
                           <button onClick={() => {
                             const newItems = landingConfig.partners.items.filter((_, i) => i !== idx);
                             updateLandingArray('partners', 'items', newItems);
                           }} className="p-2 bg-zinc-900 hover:bg-red-500/20 hover:text-red-500 rounded-lg"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => updateLandingArray('partners', 'items', [...landingConfig.partners.items, "NEW_PARTNER"])} className="btn-secondary w-full py-3 border-dashed opacity-50 hover:opacity-100">
                        <Plus className="w-4 h-4 mr-2" /> Add Partner
                      </button>
                    </div>
                  </div>
                )}

                {/* ARCHITECTURE EDITOR */}
                {activeLandingSection === 'architecture' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <SectionHeader title="Architecture" icon={Layers} />
                    <Toggle label="Section Visible" checked={landingConfig.architecture.isVisible} onChange={(v: boolean) => updateLanding('architecture', 'isVisible', v)} />
                    <InputGroup label="Title" value={landingConfig.architecture.title} onChange={(v: string) => updateLanding('architecture', 'title', v)} />
                    <InputGroup label="Description" type="textarea" value={landingConfig.architecture.description} onChange={(v: string) => updateLanding('architecture', 'description', v)} />
                    
                    <div className="space-y-4 pt-4 border-t border-zinc-900">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Layers</label>
                      {landingConfig.architecture.layers.map((layer, idx) => (
                        <ArrayItem key={idx} onDelete={() => {
                           const newLayers = landingConfig.architecture.layers.filter((_, i) => i !== idx);
                           updateLandingArray('architecture', 'layers', newLayers);
                        }}>
                           <div className="grid gap-4">
                              <InputGroup label="Layer Title" value={layer.title} onChange={(v: string) => {
                                const newLayers = [...landingConfig.architecture.layers];
                                newLayers[idx].title = v;
                                updateLandingArray('architecture', 'layers', newLayers);
                              }} />
                              <InputGroup label="Description" value={layer.desc} onChange={(v: string) => {
                                const newLayers = [...landingConfig.architecture.layers];
                                newLayers[idx].desc = v;
                                updateLandingArray('architecture', 'layers', newLayers);
                              }} />
                           </div>
                        </ArrayItem>
                      ))}
                      <button onClick={() => updateLandingArray('architecture', 'layers', [...landingConfig.architecture.layers, { title: 'New Layer', desc: 'Layer Description' }])} className="btn-secondary w-full py-3 border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Architecture Layer
                      </button>
                    </div>
                  </div>
                )}

                {/* FEATURES EDITOR */}
                {activeLandingSection === 'features' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <SectionHeader title="Features" icon={List} />
                    <Toggle label="Section Visible" checked={landingConfig.features.isVisible} onChange={(v: boolean) => updateLanding('features', 'isVisible', v)} />
                    <InputGroup label="Title" value={landingConfig.features.title} onChange={(v: string) => updateLanding('features', 'title', v)} />
                    <InputGroup label="Description" type="textarea" value={landingConfig.features.description} onChange={(v: string) => updateLanding('features', 'description', v)} />

                    <div className="space-y-4 pt-4 border-t border-zinc-900">
                      {landingConfig.features.items.map((item, idx) => (
                        <ArrayItem key={idx} onDelete={() => {
                           const newItems = landingConfig.features.items.filter((_, i) => i !== idx);
                           updateLandingArray('features', 'items', newItems);
                        }}>
                           <div className="grid gap-4">
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <InputGroup label="Feature Title" value={item.title} onChange={(v: string) => {
                                    const newItems = [...landingConfig.features.items];
                                    newItems[idx].title = v;
                                    updateLandingArray('features', 'items', newItems);
                                  }} />
                                </div>
                                <div className="w-1/3">
                                  <InputGroup label="Icon Name" value={item.icon} onChange={(v: string) => {
                                    const newItems = [...landingConfig.features.items];
                                    newItems[idx].icon = v;
                                    updateLandingArray('features', 'items', newItems);
                                  }} />
                                </div>
                              </div>
                              <InputGroup label="Description" value={item.desc} onChange={(v: string) => {
                                const newItems = [...landingConfig.features.items];
                                newItems[idx].desc = v;
                                updateLandingArray('features', 'items', newItems);
                              }} />
                           </div>
                        </ArrayItem>
                      ))}
                      <button onClick={() => updateLandingArray('features', 'items', [...landingConfig.features.items, { title: 'New Feature', desc: 'Desc', icon: 'ShieldCheck' }])} className="btn-secondary w-full py-3 border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Feature
                      </button>
                    </div>
                  </div>
                )}

                {/* ROADMAP EDITOR */}
                {activeLandingSection === 'roadmap' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <SectionHeader title="Roadmap" icon={AlignLeft} />
                    <Toggle label="Section Visible" checked={landingConfig.roadmap.isVisible} onChange={(v: boolean) => updateLanding('roadmap', 'isVisible', v)} />
                    <InputGroup label="Title" value={landingConfig.roadmap.title} onChange={(v: string) => updateLanding('roadmap', 'title', v)} />
                    <InputGroup label="Description" type="textarea" value={landingConfig.roadmap.description} onChange={(v: string) => updateLanding('roadmap', 'description', v)} />

                    <div className="space-y-6 pt-4 border-t border-zinc-900">
                      {landingConfig.roadmap.phases.map((phase, idx) => (
                        <div key={idx} className="p-6 bg-zinc-900/20 rounded-2xl border border-zinc-800 space-y-4">
                           <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                              <h4 className="text-sm font-bold text-white uppercase">Phase {idx + 1}</h4>
                              <button onClick={() => {
                                 const newPhases = landingConfig.roadmap.phases.filter((_, i) => i !== idx);
                                 updateLandingArray('roadmap', 'phases', newPhases);
                              }} className="text-zinc-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <InputGroup label="Phase Number (e.g. 01)" value={phase.phase} onChange={(v: string) => {
                                const newPhases = [...landingConfig.roadmap.phases];
                                newPhases[idx].phase = v;
                                updateLandingArray('roadmap', 'phases', newPhases);
                              }} />
                              <InputGroup label="Status (LIVE, UPCOMING, LOCKED)" value={phase.status} onChange={(v: string) => {
                                const newPhases = [...landingConfig.roadmap.phases];
                                newPhases[idx].status = v;
                                updateLandingArray('roadmap', 'phases', newPhases);
                              }} />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <InputGroup label="Title" value={phase.title} onChange={(v: string) => {
                                const newPhases = [...landingConfig.roadmap.phases];
                                newPhases[idx].title = v;
                                updateLandingArray('roadmap', 'phases', newPhases);
                              }} />
                              <InputGroup label="Period (e.g. Q1 2025)" value={phase.period} onChange={(v: string) => {
                                const newPhases = [...landingConfig.roadmap.phases];
                                newPhases[idx].period = v;
                                updateLandingArray('roadmap', 'phases', newPhases);
                              }} />
                           </div>
                           <InputGroup label="Description" type="textarea" value={phase.desc} onChange={(v: string) => {
                              const newPhases = [...landingConfig.roadmap.phases];
                              newPhases[idx].desc = v;
                              updateLandingArray('roadmap', 'phases', newPhases);
                           }} />
                           
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Features List</label>
                              {phase.features.map((feat, fIdx) => (
                                <div key={fIdx} className="flex gap-2">
                                   <input className="cms-input" value={feat} onChange={e => {
                                      const newPhases = [...landingConfig.roadmap.phases];
                                      newPhases[idx].features[fIdx] = e.target.value;
                                      updateLandingArray('roadmap', 'phases', newPhases);
                                   }} />
                                   <button onClick={() => {
                                      const newPhases = [...landingConfig.roadmap.phases];
                                      newPhases[idx].features = newPhases[idx].features.filter((_, i) => i !== fIdx);
                                      updateLandingArray('roadmap', 'phases', newPhases);
                                   }} className="p-2 bg-zinc-900 rounded hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                              ))}
                              <button onClick={() => {
                                 const newPhases = [...landingConfig.roadmap.phases];
                                 newPhases[idx].features.push("New Feature");
                                 updateLandingArray('roadmap', 'phases', newPhases);
                              }} className="text-[10px] text-primary font-bold uppercase hover:underline">+ Add Feature Bullet</button>
                           </div>
                        </div>
                      ))}
                      <button onClick={() => updateLandingArray('roadmap', 'phases', [...landingConfig.roadmap.phases, { phase: '04', title: 'New Phase', period: 'TBD', status: 'LOCKED', desc: 'Details...', features: [] }])} className="btn-secondary w-full py-3 border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Roadmap Phase
                      </button>
                    </div>
                  </div>
                )}

                {/* FAQ EDITOR */}
                {activeLandingSection === 'faq' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <SectionHeader title="FAQ" icon={Info} />
                    <Toggle label="Section Visible" checked={landingConfig.faq.isVisible} onChange={(v: boolean) => updateLanding('faq', 'isVisible', v)} />
                    <InputGroup label="Title" value={landingConfig.faq.title} onChange={(v: string) => updateLanding('faq', 'title', v)} />
                    
                    <div className="space-y-4 pt-4 border-t border-zinc-900">
                       {landingConfig.faq.items.map((item, idx) => (
                         <ArrayItem key={idx} onDelete={() => {
                            const newItems = landingConfig.faq.items.filter((_, i) => i !== idx);
                            updateLandingArray('faq', 'items', newItems);
                         }}>
                            <div className="grid gap-4">
                               <InputGroup label="Question" value={item.q} onChange={(v: string) => {
                                  const newItems = [...landingConfig.faq.items];
                                  newItems[idx].q = v;
                                  updateLandingArray('faq', 'items', newItems);
                               }} />
                               <InputGroup label="Answer" type="textarea" value={item.a} onChange={(v: string) => {
                                  const newItems = [...landingConfig.faq.items];
                                  newItems[idx].a = v;
                                  updateLandingArray('faq', 'items', newItems);
                               }} />
                            </div>
                         </ArrayItem>
                       ))}
                       <button onClick={() => updateLandingArray('faq', 'items', [...landingConfig.faq.items, { q: 'Question?', a: 'Answer.' }])} className="btn-secondary w-full py-3 border-dashed">
                         <Plus className="w-4 h-4 mr-2" /> Add FAQ Item
                       </button>
                    </div>
                  </div>
                )}

                {/* CTA EDITOR */}
                {activeLandingSection === 'cta' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                     <SectionHeader title="Call to Action" icon={CheckCircle2} />
                     <Toggle label="Section Visible" checked={landingConfig.cta.isVisible} onChange={(v: boolean) => updateLanding('cta', 'isVisible', v)} />
                     <InputGroup label="Title" value={landingConfig.cta.title} onChange={(v: string) => updateLanding('cta', 'title', v)} />
                     <InputGroup label="Description" type="textarea" value={landingConfig.cta.description} onChange={(v: string) => updateLanding('cta', 'description', v)} />
                     <InputGroup label="Button Text" value={landingConfig.cta.buttonText} onChange={(v: string) => updateLanding('cta', 'buttonText', v)} />
                  </div>
                )}
                
                {/* FOOTER EDITOR */}
                {activeLandingSection === 'footer' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                     <SectionHeader title="Footer" icon={Layout} />
                     <Toggle label="Section Visible" checked={landingConfig.footer.isVisible} onChange={(v: boolean) => updateLanding('footer', 'isVisible', v)} />
                     <InputGroup label="Footer Title" value={landingConfig.footer.title} onChange={(v: string) => updateLanding('footer', 'title', v)} />
                     <InputGroup label="Description" value={landingConfig.footer.description} onChange={(v: string) => updateLanding('footer', 'description', v)} />
                     <InputGroup label="Copyright Text" value={landingConfig.footer.copyright} onChange={(v: string) => updateLanding('footer', 'copyright', v)} />
                  </div>
                )}

              </div>
            )}

            {/* --- OTHER PAGES PLACEHOLDERS --- */}
            {activeCmsPage !== 'landing' && (
               <div className="surface p-12 rounded-3xl border-zinc-900 flex flex-col items-center justify-center text-center opacity-50 min-h-[400px]">
                  <p className="text-zinc-500 font-mono text-sm">Editor for {activeCmsPage} active.</p>
                  <p className="text-zinc-600 text-xs mt-2">Use the Save button above to persist changes.</p>
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
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            font-size: 0.8rem;
            font-family: 'Inter', sans-serif;
            outline: none;
            transition: all 0.2s;
         }
         .cms-input:focus {
            border-color: #f43f5e;
            background-color: #0c0c0e;
            box-shadow: 0 0 0 1px rgba(244, 63, 94, 0.2);
         }
         .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
            background: #09090b;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #27272a;
            border-radius: 3px;
         }
      `}</style>
    </div>
  );
};

export default AdminPanel;