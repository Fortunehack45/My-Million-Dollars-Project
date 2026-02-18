
import React, { useState, useEffect } from 'react';
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
  DEFAULT_TOKENOMICS_CONFIG,
  DEFAULT_CAREERS_CONFIG,
  DEFAULT_CONTACT_CONFIG,
  ADMIN_EMAIL
} from '../services/firebase';
import { 
  User, Task, NetworkStats, LandingConfig, 
  LegalConfig, AboutConfig, WhitepaperConfig, ArchitecturePageConfig, TokenomicsConfig, CareersConfig, ContactConfig
} from '../types';
import { 
  Users, PlusCircle, Database, ShieldAlert, Cpu, 
  Radio, Trash2, Globe, Layout, Save, X, 
  BookOpen, FileText, Info, Zap, Activity,
  Layers, AlignLeft, CheckCircle2, Shield, MapPin, 
  Briefcase, Phone, HelpCircle, Share2, PieChart,
  ListPlus, ChevronDown, ChevronRight
} from 'lucide-react';

// --- Helper Components ---

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "", className="" }: any) => (
  <div className={`space-y-2 w-full ${className}`}>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
    {type === 'textarea' ? (
      <textarea 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className="cms-input min-h-[100px] resize-y" 
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
  <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 mb-6 cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => onChange(!checked)}>
    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
    <button 
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-zinc-800'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SectionHeader = ({ title, icon: Icon, description }: any) => (
  <div className="mb-8 border-b border-zinc-800 pb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h2>
    </div>
    {description && <p className="text-sm text-zinc-500 ml-[3.25rem]">{description}</p>}
  </div>
);

const AccordionItem = ({ title, children, onDelete }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/10 overflow-hidden mb-4 transition-all hover:border-zinc-700">
      <div className="flex items-center justify-between p-4 bg-zinc-900/40 cursor-pointer hover:bg-zinc-900/60 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-3">
          {isOpen ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-zinc-600" />}
          {title}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }} 
          className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {isOpen && <div className="p-6 border-t border-zinc-800 space-y-6 bg-zinc-950/30">{children}</div>}
    </div>
  );
};

// --- Main Component ---

const AdminPanel = () => {
  const { user, firebaseUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onlineUids, setOnlineUids] = useState<string[]>([]);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [newTask, setNewTask] = useState<any>({
    title: '', description: '', points: 100.00, icon: 'web', link: '', actionLabel: 'Initialize', 
    verificationWaitTime: 5, activeDurationHours: 24
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cms'>('dashboard');
  const [activeCmsPage, setActiveCmsPage] = useState<'landing' | 'about' | 'architecture' | 'whitepaper' | 'tokenomics' | 'careers' | 'contact' | 'terms' | 'privacy'>('landing');
  const [activeLandingSection, setActiveLandingSection] = useState<string>('hero');
  const [cmsStatus, setCmsStatus] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Config States
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  const [aboutConfig, setAboutConfig] = useState<AboutConfig>(DEFAULT_ABOUT_CONFIG);
  const [archConfig, setArchConfig] = useState<ArchitecturePageConfig>(DEFAULT_ARCHITECTURE_CONFIG);
  const [whitepaperConfig, setWhitepaperConfig] = useState<WhitepaperConfig>(DEFAULT_WHITEPAPER_CONFIG);
  const [tokenomicsConfig, setTokenomicsConfig] = useState<TokenomicsConfig>(DEFAULT_TOKENOMICS_CONFIG);
  const [careersConfig, setCareersConfig] = useState<CareersConfig>(DEFAULT_CAREERS_CONFIG);
  const [contactConfig, setContactConfig] = useState<ContactConfig>(DEFAULT_CONTACT_CONFIG);
  const [termsConfig, setTermsConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.terms);
  const [privacyConfig, setPrivacyConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.privacy);

  const isAuthorized = firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || user?.role === 'admin';

  useEffect(() => {
    if (!isAuthorized) return;
    const unsubUsers = subscribeToUsers(setUsers);
    const unsubStats = subscribeToNetworkStats(setNetStats);
    const unsubOnline = subscribeToOnlineUsers(setOnlineUids);
    const unsubTasks = subscribeToTasks(setTasks);
    
    const unsubLanding = subscribeToLandingConfig(setLandingConfig);
    const unsubAbout = subscribeToContent('about', DEFAULT_ABOUT_CONFIG, setAboutConfig);
    const unsubArch = subscribeToContent('architecture_page', DEFAULT_ARCHITECTURE_CONFIG, setArchConfig);
    const unsubWhitepaper = subscribeToContent('whitepaper', DEFAULT_WHITEPAPER_CONFIG, setWhitepaperConfig);
    const unsubTokenomics = subscribeToContent('tokenomics', DEFAULT_TOKENOMICS_CONFIG, setTokenomicsConfig);
    const unsubCareers = subscribeToContent('careers', DEFAULT_CAREERS_CONFIG, setCareersConfig);
    const unsubContact = subscribeToContent('contact', DEFAULT_CONTACT_CONFIG, setContactConfig);
    const unsubTerms = subscribeToContent('terms', DEFAULT_LEGAL_CONFIG.terms, setTermsConfig);
    const unsubPrivacy = subscribeToContent('privacy', DEFAULT_LEGAL_CONFIG.privacy, setPrivacyConfig);
    
    return () => {
      unsubUsers(); unsubStats(); unsubOnline(); unsubTasks();
      unsubLanding(); unsubAbout(); unsubArch(); unsubWhitepaper(); unsubTokenomics(); 
      unsubCareers(); unsubContact(); unsubTerms(); unsubPrivacy();
    };
  }, [isAuthorized]);

  // Generic Updater
  const updateState = (setter: any, path: string[], value: any) => {
    setter((prev: any) => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newState;
    });
    setHasUnsavedChanges(true);
  };

  // Array Helpers
  const addItem = (setter: any, path: string[], item: any) => {
    setter((prev: any) => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = [...current[path[path.length - 1]], item];
      return newState;
    });
    setHasUnsavedChanges(true);
  };

  const removeItem = (setter: any, path: string[], index: number) => {
    setter((prev: any) => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = current[path[path.length - 1]].filter((_: any, i: number) => i !== index);
      return newState;
    });
    setHasUnsavedChanges(true);
  };

  const handleSocialUpdate = (platform: string, url: string) => {
    setLandingConfig(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [platform]: url
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveCMS = async () => {
    setCmsStatus('SAVING...');
    try {
      if (activeCmsPage === 'landing') await updateLandingConfig(landingConfig);
      else if (activeCmsPage === 'about') await updateContent('about', aboutConfig);
      else if (activeCmsPage === 'architecture') await updateContent('architecture_page', archConfig);
      else if (activeCmsPage === 'whitepaper') await updateContent('whitepaper', whitepaperConfig);
      else if (activeCmsPage === 'tokenomics') await updateContent('tokenomics', tokenomicsConfig);
      else if (activeCmsPage === 'careers') await updateContent('careers', careersConfig);
      else if (activeCmsPage === 'contact') await updateContent('contact', contactConfig);
      else if (activeCmsPage === 'terms') await updateContent('terms', termsConfig);
      else if (activeCmsPage === 'privacy') await updateContent('privacy', privacyConfig);
      setCmsStatus('SAVED');
      setHasUnsavedChanges(false);
      setTimeout(() => setCmsStatus(''), 2000);
    } catch (e) { setCmsStatus('ERROR'); }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiresAt = newTask.activeDurationHours 
        ? Date.now() + (newTask.activeDurationHours * 60 * 60 * 1000) 
        : null;

    const payload = {
        title: newTask.title,
        description: newTask.description,
        points: newTask.points,
        icon: newTask.icon,
        link: newTask.link,
        actionLabel: newTask.actionLabel,
        verificationWaitTime: newTask.verificationWaitTime,
        expiresAt: expiresAt
    };

    await addNewTask(payload);
    setNewTask({ 
        title: '', description: '', points: 100.00, icon: 'web', link: '', actionLabel: 'Initialize', 
        verificationWaitTime: 5, activeDurationHours: 24 
    });
  };

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono uppercase tracking-widest">Access_Denied</div>;

  return (
    <div className="w-full space-y-8 pb-20 animate-in fade-in duration-500 relative">
      
      {/* Header - Z-Index 40 to stay above everything */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950/90 p-6 rounded-3xl border border-zinc-900 backdrop-blur-xl sticky top-4 z-40 shadow-2xl">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-zinc-950 flex items-center justify-center rounded-xl border border-zinc-800 shadow-inner shrink-0"><ShieldAlert className="w-6 h-6 text-primary" /></div>
           <div className="min-w-0">
             <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none truncate">Command_Center</h1>
             <div className="flex items-center gap-2 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest font-mono truncate max-w-[150px] md:max-w-full">{firebaseUser?.email}</p></div>
           </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
           <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
             <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Activity className="w-3 h-3" /> Live</button>
             <button onClick={() => setActiveTab('cms')} className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'cms' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Layout className="w-3 h-3" /> CMS</button>
           </div>
           {activeTab === 'cms' && (
             <button onClick={handleSaveCMS} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${hasUnsavedChanges ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}><Save className="w-3 h-3" />{cmsStatus || (hasUnsavedChanges ? 'Save Changes' : 'Saved')}</button>
           )}
        </div>
      </header>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Nodes', val: users.length, sub: 'Registered', icon: Globe, color: 'text-zinc-400' },
              { label: 'Miners', val: users.filter(u => u.miningActive).length, sub: 'Active', icon: Cpu, color: 'text-primary' },
              { label: 'Presence', val: onlineUids.length, sub: 'WebSockets', icon: Radio, color: 'text-emerald-500' },
              { label: 'Circulation', val: Math.floor(netStats.totalMined).toLocaleString(), sub: 'ARG Credits', icon: Database, color: 'text-zinc-600' }
            ].map((s, i) => (
              <div key={i} className="surface p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20">
                <s.icon className={`w-4 h-4 ${s.color} mb-4`} />
                <h3 className="text-3xl font-mono font-bold text-white mb-1">{s.val}</h3>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 surface p-8 rounded-3xl bg-zinc-900/20 border-zinc-900">
               <SectionHeader title="Inject Directive" icon={PlusCircle} description="Create new social task for validators" />
               <form onSubmit={handleCreateTask} className="space-y-6">
                  <InputGroup label="Task Title" value={newTask.title} onChange={(v: string) => setNewTask({...newTask, title: v})} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Reward Points" type="number" value={newTask.points} onChange={(v: number) => setNewTask({...newTask, points: v})} />
                    <InputGroup label="Verification Delay (Sec)" type="number" value={newTask.verificationWaitTime} onChange={(v: number) => setNewTask({...newTask, verificationWaitTime: v})} placeholder="Hidden timer" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <InputGroup label="Action URL" value={newTask.link} onChange={(v: string) => setNewTask({...newTask, link: v})} />
                     <InputGroup label="Visibility Duration (Hours)" type="number" value={newTask.activeDurationHours} onChange={(v: number) => setNewTask({...newTask, activeDurationHours: v})} placeholder="Time until vanish" />
                  </div>
                  <InputGroup label="Description" type="textarea" value={newTask.description} onChange={(v: string) => setNewTask({...newTask, description: v})} />
                  <button className="btn-primary w-full py-4 mt-2">+ Deploy Directive</button>
               </form>
            </div>
            <div className="lg:col-span-2 surface rounded-3xl bg-zinc-900/20 border-zinc-900 overflow-hidden flex flex-col max-h-[600px]">
               <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 flex justify-between items-center shrink-0"><span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Directives</span></div>
               <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {tasks.map(t => {
                    const isExpired = t.expiresAt && t.expiresAt < Date.now();
                    return (
                    <div key={t.id} className={`flex justify-between items-center p-4 bg-zinc-950/40 rounded-xl border border-zinc-900 group ${isExpired ? 'opacity-50' : ''}`}>
                       <div>
                           <p className="text-white text-xs font-bold">{t.title}</p>
                           <p className="text-primary text-[10px] font-mono">{t.points} ARG</p>
                           {isExpired && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">EXPIRED</p>}
                       </div>
                       <button onClick={() => deleteTask(t.id)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )})}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* CMS View */}
      {activeTab === 'cms' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
          
          {/* Combined Sticky Sidebar - Z-Index 30 */}
          {/* On Mobile: Stacks normally. On Desktop: Sticky below header. */}
          <div className="md:col-span-3 space-y-4 md:sticky md:top-28 z-30 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-1">
            <div className="surface p-4 rounded-2xl border-zinc-900 space-y-1">
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-2 mb-2">Pages</p>
              {['landing', 'about', 'architecture', 'whitepaper', 'tokenomics', 'careers', 'contact', 'terms', 'privacy'].map(id => (
                <button key={id} onClick={() => setActiveCmsPage(id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCmsPage === id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">{id.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
            
            {/* Section Selector embedded in sidebar for better sticky behavior */}
            {activeCmsPage === 'landing' && (
              <div className="surface p-4 rounded-2xl border-zinc-900 space-y-1 animate-in slide-in-from-top-4 duration-300">
                 <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-2 mb-2">Landing Sections</p>
                 {['hero', 'partners', 'architecture', 'features', 'roadmap', 'faq', 'cta', 'footer'].map(sec => (
                   <button key={sec} onClick={() => setActiveLandingSection(sec)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeLandingSection === sec ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${(landingConfig[sec as keyof LandingConfig] as any)?.isVisible ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                     <span className="text-[10px] font-bold uppercase tracking-widest">{sec}</span>
                   </button>
                 ))}
              </div>
            )}
          </div>

          {/* Main Content Form - Z-Index 20 */}
          <div className="md:col-span-9 space-y-8 min-h-[600px] surface p-8 rounded-3xl border-zinc-900 animate-in fade-in duration-500 relative z-20 bg-zinc-950/50">
            {/* --- LANDING PAGE EDITOR --- */}
            {activeCmsPage === 'landing' && (
              <div className="space-y-8">
                {activeLandingSection === 'hero' && (
                  <>
                    <SectionHeader title="Hero Section" icon={Layout} />
                    <Toggle label="Section Visible" checked={landingConfig.hero.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['hero', 'isVisible'], v)} />
                    <InputGroup label="Headline" value={landingConfig.hero.title} onChange={(v: string) => updateState(setLandingConfig, ['hero', 'title'], v)} />
                    <InputGroup label="Subtitle" type="textarea" value={landingConfig.hero.subtitle} onChange={(v: string) => updateState(setLandingConfig, ['hero', 'subtitle'], v)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputGroup label="CTA Primary" value={landingConfig.hero.ctaPrimary} onChange={(v: string) => updateState(setLandingConfig, ['hero', 'ctaPrimary'], v)} />
                      <InputGroup label="CTA Secondary" value={landingConfig.hero.ctaSecondary} onChange={(v: string) => updateState(setLandingConfig, ['hero', 'ctaSecondary'], v)} />
                    </div>
                  </>
                )}
                
                {activeLandingSection === 'partners' && (
                  <>
                    <SectionHeader title="Partners Ticker" icon={Share2} />
                    <Toggle label="Section Visible" checked={landingConfig.partners.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['partners', 'isVisible'], v)} />
                    <InputGroup label="Section Title" value={landingConfig.partners.title} onChange={(v: string) => updateState(setLandingConfig, ['partners', 'title'], v)} />
                    <InputGroup 
                      label="Partner IDs (Comma Separated)" 
                      value={landingConfig.partners.items.join(', ')} 
                      onChange={(v: string) => updateState(setLandingConfig, ['partners', 'items'], v.split(',').map(s => s.trim()))} 
                      type="textarea"
                    />
                  </>
                )}

                {activeLandingSection === 'architecture' && (
                  <>
                    <SectionHeader title="Architecture Preview" icon={Layers} />
                    <Toggle label="Section Visible" checked={landingConfig.architecture.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['architecture', 'isVisible'], v)} />
                    <InputGroup label="Title" value={landingConfig.architecture.title} onChange={(v: string) => updateState(setLandingConfig, ['architecture', 'title'], v)} />
                    <InputGroup label="Description" type="textarea" value={landingConfig.architecture.description} onChange={(v: string) => updateState(setLandingConfig, ['architecture', 'description'], v)} />
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-6 mb-4">Preview Layers</h3>
                    {landingConfig.architecture.layers.map((layer, i) => (
                      <div key={i} className="mb-4 p-6 border border-zinc-800 rounded-xl bg-zinc-900/30">
                        <InputGroup label={`Layer ${i+1} Title`} value={layer.title} onChange={(v: string) => {
                           const newLayers = [...landingConfig.architecture.layers];
                           newLayers[i].title = v;
                           updateState(setLandingConfig, ['architecture', 'layers'], newLayers);
                        }} className="mb-4" />
                        <InputGroup label={`Layer ${i+1} Description`} value={layer.desc} onChange={(v: string) => {
                           const newLayers = [...landingConfig.architecture.layers];
                           newLayers[i].desc = v;
                           updateState(setLandingConfig, ['architecture', 'layers'], newLayers);
                        }} />
                      </div>
                    ))}
                  </>
                )}

                {activeLandingSection === 'features' && (
                  <>
                    <SectionHeader title="Features Grid" icon={Zap} />
                    <Toggle label="Section Visible" checked={landingConfig.features.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['features', 'isVisible'], v)} />
                    <InputGroup label="Title" value={landingConfig.features.title} onChange={(v: string) => updateState(setLandingConfig, ['features', 'title'], v)} />
                    <InputGroup label="Description" type="textarea" value={landingConfig.features.description} onChange={(v: string) => updateState(setLandingConfig, ['features', 'description'], v)} />
                    <div className="flex justify-between items-center mt-8 mb-4 border-b border-zinc-900 pb-2">
                       <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Feature Items</h3>
                       <button onClick={() => addItem(setLandingConfig, ['features', 'items'], { title: 'New Feature', desc: 'Description', icon: 'Globe' })} className="text-xs text-primary hover:underline">+ Add Item</button>
                    </div>
                    {landingConfig.features.items.map((item, i) => (
                      <AccordionItem key={i} title={item.title || 'Untitled'} onDelete={() => removeItem(setLandingConfig, ['features', 'items'], i)}>
                         <InputGroup label="Title" value={item.title} onChange={(v: string) => {
                            const newItems = [...landingConfig.features.items]; newItems[i].title = v;
                            updateState(setLandingConfig, ['features', 'items'], newItems);
                         }} />
                         <InputGroup label="Description" type="textarea" value={item.desc} onChange={(v: string) => {
                            const newItems = [...landingConfig.features.items]; newItems[i].desc = v;
                            updateState(setLandingConfig, ['features', 'items'], newItems);
                         }} />
                         <InputGroup label="Icon Name (Lucide)" value={item.icon} onChange={(v: string) => {
                            const newItems = [...landingConfig.features.items]; newItems[i].icon = v;
                            updateState(setLandingConfig, ['features', 'items'], newItems);
                         }} />
                      </AccordionItem>
                    ))}
                  </>
                )}

                {activeLandingSection === 'roadmap' && (
                  <>
                    <SectionHeader title="Roadmap Timeline" icon={ListPlus} />
                    <Toggle label="Section Visible" checked={landingConfig.roadmap.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['roadmap', 'isVisible'], v)} />
                    <InputGroup label="Title" value={landingConfig.roadmap.title} onChange={(v: string) => updateState(setLandingConfig, ['roadmap', 'title'], v)} />
                    <InputGroup label="Description" type="textarea" value={landingConfig.roadmap.description} onChange={(v: string) => updateState(setLandingConfig, ['roadmap', 'description'], v)} />
                    
                    <div className="flex justify-between items-center mt-8 mb-4 border-b border-zinc-900 pb-2">
                       <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Phases</h3>
                       <button onClick={() => addItem(setLandingConfig, ['roadmap', 'phases'], { phase: '0X', title: 'New Phase', period: 'Q1 2026', status: 'PLANNED', desc: '...', features: [] })} className="text-xs text-primary hover:underline">+ Add Phase</button>
                    </div>
                    {landingConfig.roadmap.phases.map((phase, i) => (
                      <AccordionItem key={i} title={`${phase.phase}: ${phase.title}`} onDelete={() => removeItem(setLandingConfig, ['roadmap', 'phases'], i)}>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="Phase ID" value={phase.phase} onChange={(v: string) => {
                               const newPhases = [...landingConfig.roadmap.phases]; newPhases[i].phase = v;
                               updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                            }} />
                            <InputGroup label="Status" value={phase.status} onChange={(v: string) => {
                               const newPhases = [...landingConfig.roadmap.phases]; newPhases[i].status = v;
                               updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                            }} />
                         </div>
                         <InputGroup label="Title" value={phase.title} onChange={(v: string) => {
                            const newPhases = [...landingConfig.roadmap.phases]; newPhases[i].title = v;
                            updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                         }} />
                         <InputGroup label="Period" value={phase.period} onChange={(v: string) => {
                            const newPhases = [...landingConfig.roadmap.phases]; newPhases[i].period = v;
                            updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                         }} />
                         <InputGroup label="Description" type="textarea" value={phase.desc} onChange={(v: string) => {
                            const newPhases = [...landingConfig.roadmap.phases]; newPhases[i].desc = v;
                            updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                         }} />
                         <InputGroup 
                            label="Features (Comma Separated)" 
                            value={phase.features.join(', ')} 
                            onChange={(v: string) => {
                               const newPhases = [...landingConfig.roadmap.phases]; newPhases[i].features = v.split(',').map(s => s.trim());
                               updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                            }} 
                            type="textarea"
                         />
                      </AccordionItem>
                    ))}
                  </>
                )}

                {activeLandingSection === 'faq' && (
                  <>
                    <SectionHeader title="FAQ Section" icon={HelpCircle} />
                    <Toggle label="Section Visible" checked={landingConfig.faq.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['faq', 'isVisible'], v)} />
                    <InputGroup label="Title" value={landingConfig.faq.title} onChange={(v: string) => updateState(setLandingConfig, ['faq', 'title'], v)} />
                    
                    <div className="flex justify-between items-center mt-8 mb-4 border-b border-zinc-900 pb-2">
                       <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Questions</h3>
                       <button onClick={() => addItem(setLandingConfig, ['faq', 'items'], { q: 'Question?', a: 'Answer.' })} className="text-xs text-primary hover:underline">+ Add Item</button>
                    </div>
                    {landingConfig.faq.items.map((item, i) => (
                      <AccordionItem key={i} title={item.q} onDelete={() => removeItem(setLandingConfig, ['faq', 'items'], i)}>
                         <InputGroup label="Question" value={item.q} onChange={(v: string) => {
                            const newItems = [...landingConfig.faq.items]; newItems[i].q = v;
                            updateState(setLandingConfig, ['faq', 'items'], newItems);
                         }} />
                         <InputGroup label="Answer" type="textarea" value={item.a} onChange={(v: string) => {
                            const newItems = [...landingConfig.faq.items]; newItems[i].a = v;
                            updateState(setLandingConfig, ['faq', 'items'], newItems);
                         }} />
                      </AccordionItem>
                    ))}
                  </>
                )}

                {activeLandingSection === 'cta' && (
                  <>
                    <SectionHeader title="Call to Action" icon={MegaphoneIcon} />
                    <Toggle label="Section Visible" checked={landingConfig.cta.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['cta', 'isVisible'], v)} />
                    <InputGroup label="Title" value={landingConfig.cta.title} onChange={(v: string) => updateState(setLandingConfig, ['cta', 'title'], v)} />
                    <InputGroup label="Description" type="textarea" value={landingConfig.cta.description} onChange={(v: string) => updateState(setLandingConfig, ['cta', 'description'], v)} />
                    <InputGroup label="Button Text" value={landingConfig.cta.buttonText} onChange={(v: string) => updateState(setLandingConfig, ['cta', 'buttonText'], v)} />
                  </>
                )}

                {activeLandingSection === 'footer' && (
                  <>
                    <SectionHeader title="Footer" icon={Layout} />
                    <InputGroup label="Copyright Text" value={landingConfig.footer.copyright} onChange={(v: string) => updateState(setLandingConfig, ['footer', 'copyright'], v)} />
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-8 mb-4">Social Links</h3>
                    <InputGroup label="Twitter URL" value={landingConfig.socials?.twitter} onChange={(v: string) => handleSocialUpdate('twitter', v)} className="mb-4" />
                    <InputGroup label="Discord URL" value={landingConfig.socials?.discord} onChange={(v: string) => handleSocialUpdate('discord', v)} className="mb-4" />
                    <InputGroup label="GitHub URL" value={landingConfig.socials?.github} onChange={(v: string) => handleSocialUpdate('github', v)} />
                  </>
                )}
              </div>
            )}

            {/* --- OTHER PAGES EDITORS --- */}
            
            {activeCmsPage === 'about' && (
              <>
                <SectionHeader title="About Page" icon={Info} />
                <InputGroup label="Page Title" value={aboutConfig.title} onChange={(v: string) => updateState(setAboutConfig, ['title'], v)} />
                <InputGroup label="Subtitle" type="textarea" value={aboutConfig.subtitle} onChange={(v: string) => updateState(setAboutConfig, ['subtitle'], v)} />
                <div className="grid grid-cols-1 gap-6 mt-8">
                   <div className="p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                      <h4 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">Mission</h4>
                      <InputGroup label="Title" value={aboutConfig.mission.title} onChange={(v: string) => updateState(setAboutConfig, ['mission', 'title'], v)} className="mb-4" />
                      <InputGroup label="Description" type="textarea" value={aboutConfig.mission.desc} onChange={(v: string) => updateState(setAboutConfig, ['mission', 'desc'], v)} />
                   </div>
                   <div className="p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                      <h4 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">Vision</h4>
                      <InputGroup label="Title" value={aboutConfig.vision.title} onChange={(v: string) => updateState(setAboutConfig, ['vision', 'title'], v)} className="mb-4" />
                      <InputGroup label="Description" type="textarea" value={aboutConfig.vision.desc} onChange={(v: string) => updateState(setAboutConfig, ['vision', 'desc'], v)} />
                   </div>
                   <div className="p-6 bg-zinc-900/30 rounded-xl border border-zinc-800">
                      <h4 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">Collective</h4>
                      <InputGroup label="Title" value={aboutConfig.collective.title} onChange={(v: string) => updateState(setAboutConfig, ['collective', 'title'], v)} className="mb-4" />
                      <InputGroup label="Description" type="textarea" value={aboutConfig.collective.desc} onChange={(v: string) => updateState(setAboutConfig, ['collective', 'desc'], v)} />
                   </div>
                </div>
                <div className="mt-8">
                   <InputGroup 
                      label="Partners List (Comma Separated)" 
                      value={aboutConfig.partners.join(', ')} 
                      onChange={(v: string) => updateState(setAboutConfig, ['partners'], v.split(',').map(s => s.trim()))}
                      type="textarea"
                   />
                </div>
              </>
            )}

            {activeCmsPage === 'architecture' && (
              <>
                <SectionHeader title="Architecture Page" icon={Layers} />
                <InputGroup label="Hero Title" value={archConfig.heroTitle} onChange={(v: string) => updateState(setArchConfig, ['heroTitle'], v)} />
                <InputGroup label="Hero Subtitle" type="textarea" value={archConfig.heroSubtitle} onChange={(v: string) => updateState(setArchConfig, ['heroSubtitle'], v)} />
                
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-10 mb-4 border-b border-zinc-900 pb-2">Technical Layers</h3>
                {archConfig.layers.map((layer, i) => (
                   <AccordionItem key={i} title={`Layer ${i+1}: ${layer.title}`} onDelete={() => removeItem(setArchConfig, ['layers'], i)}>
                      <InputGroup label="Title" value={layer.title} onChange={(v: string) => {
                         const n = [...archConfig.layers]; n[i].title = v; updateState(setArchConfig, ['layers'], n);
                      }} />
                      <InputGroup label="Description" type="textarea" value={layer.desc} onChange={(v: string) => {
                         const n = [...archConfig.layers]; n[i].desc = v; updateState(setArchConfig, ['layers'], n);
                      }} />
                      <InputGroup label="Stat Badge" value={layer.stat} onChange={(v: string) => {
                         const n = [...archConfig.layers]; n[i].stat = v; updateState(setArchConfig, ['layers'], n);
                      }} />
                   </AccordionItem>
                ))}
                <button onClick={() => addItem(setArchConfig, ['layers'], { title: 'New Layer', desc: '...', stat: 'N/A' })} className="text-xs text-primary hover:underline mt-2 mb-8">+ Add Layer</button>

                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-8 mb-4 border-b border-zinc-900 pb-2">Features</h3>
                {archConfig.features.map((feat, i) => (
                   <AccordionItem key={i} title={feat.title} onDelete={() => removeItem(setArchConfig, ['features'], i)}>
                      <InputGroup label="Title" value={feat.title} onChange={(v: string) => {
                         const n = [...archConfig.features]; n[i].title = v; updateState(setArchConfig, ['features'], n);
                      }} />
                      <InputGroup label="Description" type="textarea" value={feat.desc} onChange={(v: string) => {
                         const n = [...archConfig.features]; n[i].desc = v; updateState(setArchConfig, ['features'], n);
                      }} />
                   </AccordionItem>
                ))}
                <button onClick={() => addItem(setArchConfig, ['features'], { title: 'New Feature', desc: '...' })} className="text-xs text-primary hover:underline mt-2">+ Add Feature</button>
              </>
            )}

            {activeCmsPage === 'whitepaper' && (
              <>
                <SectionHeader title="Whitepaper" icon={FileText} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InputGroup label="Title" value={whitepaperConfig.title} onChange={(v: string) => updateState(setWhitepaperConfig, ['title'], v)} />
                   <InputGroup label="Version" value={whitepaperConfig.version} onChange={(v: string) => updateState(setWhitepaperConfig, ['version'], v)} />
                </div>
                <InputGroup label="Subtitle" value={whitepaperConfig.subtitle} onChange={(v: string) => updateState(setWhitepaperConfig, ['subtitle'], v)} />
                
                <div className="flex justify-between items-center mt-10 mb-4 border-b border-zinc-900 pb-2">
                   <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sections</h3>
                   <button onClick={() => addItem(setWhitepaperConfig, ['sections'], { title: 'New Section', content: '...' })} className="text-xs text-primary hover:underline">+ Add Section</button>
                </div>
                {whitepaperConfig.sections.map((section, i) => (
                   <AccordionItem key={i} title={`${i+1}. ${section.title}`} onDelete={() => removeItem(setWhitepaperConfig, ['sections'], i)}>
                      <InputGroup label="Heading" value={section.title} onChange={(v: string) => {
                         const n = [...whitepaperConfig.sections]; n[i].title = v; updateState(setWhitepaperConfig, ['sections'], n);
                      }} />
                      <InputGroup label="Content" type="textarea" value={section.content} onChange={(v: string) => {
                         const n = [...whitepaperConfig.sections]; n[i].content = v; updateState(setWhitepaperConfig, ['sections'], n);
                      }} className="min-h-[200px]" />
                   </AccordionItem>
                ))}
              </>
            )}

            {activeCmsPage === 'tokenomics' && (
              <>
                <SectionHeader title="Tokenomics" icon={PieChart} />
                <InputGroup label="Title" value={tokenomicsConfig.title} onChange={(v: string) => updateState(setTokenomicsConfig, ['title'], v)} />
                <InputGroup label="Subtitle" type="textarea" value={tokenomicsConfig.subtitle} onChange={(v: string) => updateState(setTokenomicsConfig, ['subtitle'], v)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                   <InputGroup label="Total Supply" value={tokenomicsConfig.totalSupply} onChange={(v: string) => updateState(setTokenomicsConfig, ['totalSupply'], v)} />
                   <InputGroup label="Circulating Supply" value={tokenomicsConfig.circulatingSupply} onChange={(v: string) => updateState(setTokenomicsConfig, ['circulatingSupply'], v)} />
                </div>

                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-10 mb-4 border-b border-zinc-900 pb-2">Distribution</h3>
                {tokenomicsConfig.distribution.map((item, i) => (
                   <AccordionItem key={i} title={item.label} onDelete={() => removeItem(setTokenomicsConfig, ['distribution'], i)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <InputGroup label="Label" value={item.label} onChange={(v: string) => {
                            const n = [...tokenomicsConfig.distribution]; n[i].label = v; updateState(setTokenomicsConfig, ['distribution'], n);
                         }} />
                         <InputGroup label="Value Text" value={item.value} onChange={(v: string) => {
                            const n = [...tokenomicsConfig.distribution]; n[i].value = v; updateState(setTokenomicsConfig, ['distribution'], n);
                         }} />
                         <InputGroup label="Percentage" type="number" value={item.percentage} onChange={(v: number) => {
                            const n = [...tokenomicsConfig.distribution]; n[i].percentage = v; updateState(setTokenomicsConfig, ['distribution'], n);
                         }} />
                         <InputGroup label="Color Class (Tailwind)" value={item.color} onChange={(v: string) => {
                            const n = [...tokenomicsConfig.distribution]; n[i].color = v; updateState(setTokenomicsConfig, ['distribution'], n);
                         }} />
                      </div>
                   </AccordionItem>
                ))}
                <button onClick={() => addItem(setTokenomicsConfig, ['distribution'], { label: 'New Slice', percentage: 10, value: '100M', color: 'bg-zinc-500' })} className="text-xs text-primary hover:underline mt-2">+ Add Distribution</button>

                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-10 mb-4 border-b border-zinc-900 pb-2">Vesting Schedule</h3>
                {tokenomicsConfig.schedule.map((row, i) => (
                   <AccordionItem key={i} title={`${row.phase} - ${row.date}`} onDelete={() => removeItem(setTokenomicsConfig, ['schedule'], i)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <InputGroup label="Phase" value={row.phase} onChange={(v: string) => {
                            const n = [...tokenomicsConfig.schedule]; n[i].phase = v; updateState(setTokenomicsConfig, ['schedule'], n);
                         }} />
                         <InputGroup label="Date" value={row.date} onChange={(v: string) => {
                            const n = [...tokenomicsConfig.schedule]; n[i].date = v; updateState(setTokenomicsConfig, ['schedule'], n);
                         }} />
                         <InputGroup label="Allocation" value={row.allocation} onChange={(v: string) => {
                            const n = [...tokenomicsConfig.schedule]; n[i].allocation = v; updateState(setTokenomicsConfig, ['schedule'], n);
                         }} />
                         <InputGroup label="Action" value={row.action} onChange={(v: string) => {
                            const n = [...tokenomicsConfig.schedule]; n[i].action = v; updateState(setTokenomicsConfig, ['schedule'], n);
                         }} />
                      </div>
                   </AccordionItem>
                ))}
                <button onClick={() => addItem(setTokenomicsConfig, ['schedule'], { phase: 'Phase X', date: 'TBD', allocation: '0%', action: 'Locked' })} className="text-xs text-primary hover:underline mt-2">+ Add Schedule</button>
              </>
            )}

            {activeCmsPage === 'careers' && (
              <>
                <SectionHeader title="Careers Page" icon={Briefcase} />
                <InputGroup label="Title" value={careersConfig.title} onChange={(v: string) => updateState(setCareersConfig, ['title'], v)} />
                <InputGroup label="Subtitle" type="textarea" value={careersConfig.subtitle} onChange={(v: string) => updateState(setCareersConfig, ['subtitle'], v)} />
                
                <div className="flex justify-between items-center mt-10 mb-4 border-b border-zinc-900 pb-2">
                   <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Open Positions</h3>
                   <button onClick={() => addItem(setCareersConfig, ['positions'], { title: 'New Role', department: 'Eng', location: 'Remote', type: 'Full-time', description: '...' })} className="text-xs text-primary hover:underline">+ Add Job</button>
                </div>
                {careersConfig.positions.map((job, i) => (
                   <AccordionItem key={i} title={job.title} onDelete={() => removeItem(setCareersConfig, ['positions'], i)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <InputGroup label="Job Title" value={job.title} onChange={(v: string) => {
                            const n = [...careersConfig.positions]; n[i].title = v; updateState(setCareersConfig, ['positions'], n);
                         }} />
                         <InputGroup label="Department" value={job.department} onChange={(v: string) => {
                            const n = [...careersConfig.positions]; n[i].department = v; updateState(setCareersConfig, ['positions'], n);
                         }} />
                         <InputGroup label="Location" value={job.location} onChange={(v: string) => {
                            const n = [...careersConfig.positions]; n[i].location = v; updateState(setCareersConfig, ['positions'], n);
                         }} />
                         <InputGroup label="Type" value={job.type} onChange={(v: string) => {
                            const n = [...careersConfig.positions]; n[i].type = v; updateState(setCareersConfig, ['positions'], n);
                         }} />
                      </div>
                      <InputGroup label="Description" type="textarea" value={job.description} onChange={(v: string) => {
                         const n = [...careersConfig.positions]; n[i].description = v; updateState(setCareersConfig, ['positions'], n);
                      }} />
                   </AccordionItem>
                ))}
              </>
            )}

            {activeCmsPage === 'contact' && (
              <>
                <SectionHeader title="Contact Page" icon={Phone} />
                <InputGroup label="Title" value={contactConfig.title} onChange={(v: string) => updateState(setContactConfig, ['title'], v)} />
                <InputGroup label="Subtitle" type="textarea" value={contactConfig.subtitle} onChange={(v: string) => updateState(setContactConfig, ['subtitle'], v)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                   <InputGroup label="Email Address" value={contactConfig.email} onChange={(v: string) => updateState(setContactConfig, ['email'], v)} />
                   <InputGroup label="Support Hours" value={contactConfig.supportHours} onChange={(v: string) => updateState(setContactConfig, ['supportHours'], v)} />
                </div>
                <InputGroup label="Physical Address" type="textarea" value={contactConfig.address} onChange={(v: string) => updateState(setContactConfig, ['address'], v)} className="mt-4" />
              </>
            )}

            {(activeCmsPage === 'terms' || activeCmsPage === 'privacy') && (
              <>
                <SectionHeader title={activeCmsPage === 'terms' ? 'Terms of Service' : 'Privacy Policy'} icon={BookOpen} />
                {(() => {
                   const config = activeCmsPage === 'terms' ? termsConfig : privacyConfig;
                   const setConfig = activeCmsPage === 'terms' ? setTermsConfig : setPrivacyConfig;
                   return (
                      <>
                         <InputGroup label="Document Title" value={config.title} onChange={(v: string) => updateState(setConfig, ['title'], v)} />
                         <InputGroup label="Last Updated" value={config.lastUpdated} onChange={(v: string) => updateState(setConfig, ['lastUpdated'], v)} />
                         
                         <div className="flex justify-between items-center mt-10 mb-4 border-b border-zinc-900 pb-2">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Clauses</h3>
                            <button onClick={() => addItem(setConfig, ['sections'], { heading: 'New Clause', content: '...' })} className="text-xs text-primary hover:underline">+ Add Clause</button>
                         </div>
                         {config.sections.map((sec, i) => (
                            <AccordionItem key={i} title={sec.heading} onDelete={() => removeItem(setConfig, ['sections'], i)}>
                               <InputGroup label="Heading" value={sec.heading} onChange={(v: string) => {
                                  const n = [...config.sections]; n[i].heading = v; updateState(setConfig, ['sections'], n);
                               }} />
                               <InputGroup label="Content" type="textarea" value={sec.content} onChange={(v: string) => {
                                  const n = [...config.sections]; n[i].content = v; updateState(setConfig, ['sections'], n);
                               }} className="min-h-[150px]" />
                            </AccordionItem>
                         ))}
                      </>
                   );
                })()}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
         .cms-input { width: 100%; background-color: #0c0c0e; border: 1px solid #27272a; color: #f4f4f5; padding: 0.85rem 1.1rem; border-radius: 0.75rem; font-size: 0.85rem; font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s; }
         .cms-input:focus { border-color: #f43f5e; box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.1); }
         .cms-input:hover { border-color: #3f3f46; }
      `}</style>
    </div>
  );
};

// Helper Icon for CTA
const MegaphoneIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 8l-4.3 3.6c-.4.4-1 .6-1.5.6H2.6a1 1 0 0 0-.9 1.4l1.6 3.1c.3.5.8.8 1.4.8h.1L12 21V8z" />
    <path d="M16 8a5 5 0 0 1 0 8" />
    <path d="M19 5a9 9 0 0 1 0 14" />
  </svg>
);

export default AdminPanel;
