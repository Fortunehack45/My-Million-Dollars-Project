
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
  Radio, Trash2, Globe, Layout, Save, X, Plus, 
  BookOpen, FileText, Info, Zap, Activity,
  Layers, List, AlignLeft, CheckCircle2, Shield, MapPin, MousePointer, HelpCircle,
  Share2, PieChart, Briefcase, Phone, Target
} from 'lucide-react';

// --- Helper Components ---

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "", className="" }: any) => (
  <div className={`space-y-1.5 w-full ${className}`}>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
    {type === 'textarea' ? (
      <textarea 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        className="cms-input h-32 resize-y" 
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
  <div className="group relative p-6 bg-zinc-900/30 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all mb-4">
    <button 
      onClick={onDelete}
      className="absolute top-4 right-4 p-1.5 bg-zinc-950 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg border border-zinc-800 shadow-xl z-20"
    >
      <X className="w-4 h-4" />
    </button>
    {children}
  </div>
);

// --- Main Component ---

const AdminPanel = () => {
  const { user, firebaseUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onlineUids, setOnlineUids] = useState<string[]>([]);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '', description: '', points: 100.00, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cms'>('dashboard');
  const [activeCmsPage, setActiveCmsPage] = useState<'landing' | 'about' | 'architecture' | 'whitepaper' | 'tokenomics' | 'careers' | 'contact' | 'terms' | 'privacy'>('landing');
  const [activeLandingSection, setActiveLandingSection] = useState<string>('hero');
  const [cmsStatus, setCmsStatus] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const handleLandingUpdate = (section: keyof LandingConfig, key: string, value: any) => {
    setLandingConfig(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    setHasUnsavedChanges(true);
  };
  
  const handleSocialUpdate = (key: string, value: string) => {
      setLandingConfig(prev => ({ 
          ...prev, 
          socials: { 
              ...(prev.socials || DEFAULT_LANDING_CONFIG.socials), 
              [key]: value 
          } 
      }));
      setHasUnsavedChanges(true);
  };

  const handleAboutUpdate = (key: keyof AboutConfig, value: any) => {
    setAboutConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };
  const handleAboutSectionUpdate = (section: keyof AboutConfig, key: string, value: any) => {
    setAboutConfig(prev => ({ ...prev, [section]: { ...(prev[section] as any), [key]: value } }));
    setHasUnsavedChanges(true);
  };

  const handleArchUpdate = (key: keyof ArchitecturePageConfig, value: any) => {
    setArchConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleWhitepaperUpdate = (key: keyof WhitepaperConfig, value: any) => {
    setWhitepaperConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleTokenomicsUpdate = (key: keyof TokenomicsConfig, value: any) => {
    setTokenomicsConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCareersUpdate = (key: keyof CareersConfig, value: any) => {
    setCareersConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleContactUpdate = (key: keyof ContactConfig, value: any) => {
    setContactConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleLegalUpdate = (type: 'terms' | 'privacy', key: keyof LegalConfig, value: any) => {
    const setter = type === 'terms' ? setTermsConfig : setPrivacyConfig;
    setter(prev => ({ ...prev, [key]: value }));
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
    await addNewTask(newTask);
    setNewTask({ title: '', description: '', points: 100.00, icon: 'web', link: '', actionLabel: 'Initialize', timerSeconds: 0 });
  };

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono uppercase tracking-widest">Access_Denied</div>;

  return (
    <div className="w-full space-y-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-900 backdrop-blur-xl sticky top-4 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-zinc-950 flex items-center justify-center rounded-xl border border-zinc-800 shadow-inner"><ShieldAlert className="w-6 h-6 text-primary" /></div>
           <div>
             <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Command_Center</h1>
             <div className="flex items-center gap-2 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest font-mono truncate max-w-[150px]">{firebaseUser?.email}</p></div>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
             <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Activity className="w-3 h-3" /> Live</button>
             <button onClick={() => setActiveTab('cms')} className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'cms' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Layout className="w-3 h-3" /> CMS</button>
           </div>
           {activeTab === 'cms' && (
             <button onClick={handleSaveCMS} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${hasUnsavedChanges ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}><Save className="w-3 h-3" />{cmsStatus || (hasUnsavedChanges ? 'Save Changes' : 'Saved')}</button>
           )}
        </div>
      </header>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
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
               <form onSubmit={handleCreateTask} className="space-y-4">
                  <InputGroup label="Task Title" value={newTask.title} onChange={(v: string) => setNewTask({...newTask, title: v})} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Reward Points" type="number" value={newTask.points} onChange={(v: number) => setNewTask({...newTask, points: v})} />
                    <InputGroup label="Timer (Sec)" type="number" value={newTask.timerSeconds} onChange={(v: number) => setNewTask({...newTask, timerSeconds: v})} />
                  </div>
                  <InputGroup label="Action URL" value={newTask.link} onChange={(v: string) => setNewTask({...newTask, link: v})} />
                  <InputGroup label="Description" type="textarea" value={newTask.description} onChange={(v: string) => setNewTask({...newTask, description: v})} />
                  <button className="btn-primary w-full py-4">+ Deploy Directive</button>
               </form>
            </div>
            <div className="lg:col-span-2 surface rounded-3xl bg-zinc-900/20 border-zinc-900 overflow-hidden">
               <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 flex justify-between items-center"><span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Directives</span></div>
               <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                  {tasks.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-zinc-950/40 rounded-xl border border-zinc-900 group">
                       <div><p className="text-white text-xs font-bold">{t.title}</p><p className="text-primary text-[10px] font-mono">{t.points} ARG</p></div>
                       <button onClick={() => deleteTask(t.id)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cms' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3 space-y-4">
            <div className="surface p-4 rounded-2xl border-zinc-900 space-y-1">
              {['landing', 'about', 'architecture', 'whitepaper', 'tokenomics', 'careers', 'contact', 'terms', 'privacy'].map(id => (
                <button key={id} onClick={() => setActiveCmsPage(id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCmsPage === id ? 'bg-primary text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">{id.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
            {activeCmsPage === 'landing' && (
              <div className="surface p-4 rounded-2xl border-zinc-900 space-y-1">
                 {['hero', 'partners', 'architecture', 'features', 'roadmap', 'faq', 'cta', 'footer'].map(sec => (
                   <button key={sec} onClick={() => setActiveLandingSection(sec)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeLandingSection === sec ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${(landingConfig[sec as keyof LandingConfig] as any)?.isVisible ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                     <span className="text-[10px] font-bold uppercase tracking-widest">{sec}</span>
                   </button>
                 ))}
              </div>
            )}
          </div>

          <div className="md:col-span-9 space-y-8 min-h-[600px] surface p-8 rounded-3xl border-zinc-900 animate-in fade-in duration-500">
            {/* Landing Page Editor */}
            {activeCmsPage === 'landing' && (
              <div className="space-y-8">
                {activeLandingSection === 'hero' && (
                  <>
                    <SectionHeader title="Hero Section" icon={Layout} />
                    <Toggle label="Section Visible" checked={landingConfig.hero.isVisible} onChange={(v: boolean) => handleLandingUpdate('hero', 'isVisible', v)} />
                    <InputGroup label="Headline" value={landingConfig.hero.title} onChange={(v: string) => handleLandingUpdate('hero', 'title', v)} />
                    <InputGroup label="Subtitle" type="textarea" value={landingConfig.hero.subtitle} onChange={(v: string) => handleLandingUpdate('hero', 'subtitle', v)} />
                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="CTA Primary" value={landingConfig.hero.ctaPrimary} onChange={(v: string) => handleLandingUpdate('hero', 'ctaPrimary', v)} />
                      <InputGroup label="CTA Secondary" value={landingConfig.hero.ctaSecondary} onChange={(v: string) => handleLandingUpdate('hero', 'ctaSecondary', v)} />
                    </div>
                  </>
                )}
                {/* ... Add other landing sections as needed, roadmap example included ... */}
                {activeLandingSection === 'roadmap' && (
                  <>
                    <SectionHeader title="Roadmap Phases" icon={AlignLeft} />
                    <Toggle label="Section Visible" checked={landingConfig.roadmap?.isVisible ?? true} onChange={(v: boolean) => handleLandingUpdate('roadmap', 'isVisible', v)} />
                    <InputGroup label="Headline" value={landingConfig.roadmap?.title ?? ''} onChange={(v: string) => handleLandingUpdate('roadmap', 'title', v)} />
                    <InputGroup label="Description" type="textarea" value={landingConfig.roadmap?.description ?? ''} onChange={(v: string) => handleLandingUpdate('roadmap', 'description', v)} className="mb-6" />

                    {(landingConfig.roadmap?.phases || []).map((p, i) => (
                      <ArrayItem key={i} onDelete={() => handleLandingUpdate('roadmap', 'phases', (landingConfig.roadmap?.phases || []).filter((_, idx) => idx !== i))}>
                        <div className="grid grid-cols-3 gap-4">
                          <InputGroup label="Period" value={p.period} onChange={(v: string) => {const n=[...(landingConfig.roadmap?.phases || [])]; n[i].period=v; handleLandingUpdate('roadmap', 'phases', n)}} />
                          <InputGroup label="Status" value={p.status} onChange={(v: string) => {const n=[...(landingConfig.roadmap?.phases || [])]; n[i].status=v; handleLandingUpdate('roadmap', 'phases', n)}} placeholder="LIVE / UPCOMING" />
                          <InputGroup label="Phase #" value={p.phase} onChange={(v: string) => {const n=[...(landingConfig.roadmap?.phases || [])]; n[i].phase=v; handleLandingUpdate('roadmap', 'phases', n)}} />
                        </div>
                        <InputGroup label="Title" value={p.title} onChange={(v: string) => {const n=[...(landingConfig.roadmap?.phases || [])]; n[i].title=v; handleLandingUpdate('roadmap', 'phases', n)}} className="mt-2" />
                        <InputGroup label="Description" value={p.desc} onChange={(v: string) => {const n=[...(landingConfig.roadmap?.phases || [])]; n[i].desc=v; handleLandingUpdate('roadmap', 'phases', n)}} className="mt-2" />
                        <div className="mt-2">
                           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Features (Comma Separated)</label>
                           <input 
                              value={p.features.join(', ')} 
                              onChange={(e) => {const n=[...(landingConfig.roadmap?.phases || [])]; n[i].features=e.target.value.split(',').map(s=>s.trim()); handleLandingUpdate('roadmap', 'phases', n)}} 
                              className="cms-input"
                           />
                        </div>
                      </ArrayItem>
                    ))}
                    <button onClick={() => handleLandingUpdate('roadmap', 'phases', [...(landingConfig.roadmap?.phases || []), {phase:'04', title:'New Phase', period:'Q1', status:'UPCOMING', desc:'', features:[]}])} className="btn-secondary w-full py-4 border-dashed">+ Add Roadmap Phase</button>
                  </>
                )}
                {/* ... other landing sections ... */}
              </div>
            )}

            {/* About Page Editor */}
            {activeCmsPage === 'about' && (
              <div className="space-y-8">
                <SectionHeader title="About Page" icon={Info} />
                <InputGroup label="Main Title" value={aboutConfig.title} onChange={(v: string) => handleAboutUpdate('title', v)} />
                <InputGroup label="Subtitle" type="textarea" value={aboutConfig.subtitle} onChange={(v: string) => handleAboutUpdate('subtitle', v)} />
                
                <h3 className="text-sm font-bold text-white uppercase mt-8 border-b border-zinc-900 pb-2">Mission Section</h3>
                <InputGroup label="Mission Title" value={aboutConfig.mission.title} onChange={(v: string) => handleAboutSectionUpdate('mission', 'title', v)} />
                <InputGroup label="Mission Description" type="textarea" value={aboutConfig.mission.desc} onChange={(v: string) => handleAboutSectionUpdate('mission', 'desc', v)} />

                <h3 className="text-sm font-bold text-white uppercase mt-8 border-b border-zinc-900 pb-2">Vision Section</h3>
                <InputGroup label="Vision Title" value={aboutConfig.vision.title} onChange={(v: string) => handleAboutSectionUpdate('vision', 'title', v)} />
                <InputGroup label="Vision Description" type="textarea" value={aboutConfig.vision.desc} onChange={(v: string) => handleAboutSectionUpdate('vision', 'desc', v)} />

                <h3 className="text-sm font-bold text-white uppercase mt-8 border-b border-zinc-900 pb-2">Partners List</h3>
                <InputGroup label="Partners (Comma Separated)" value={aboutConfig.partners.join(', ')} onChange={(v: string) => handleAboutUpdate('partners', v.split(',').map(s => s.trim()))} />
              </div>
            )}

            {/* Architecture Page Editor */}
            {activeCmsPage === 'architecture' && (
              <div className="space-y-8">
                <SectionHeader title="Architecture Page" icon={Cpu} />
                <InputGroup label="Hero Title" value={archConfig.heroTitle} onChange={(v: string) => handleArchUpdate('heroTitle', v)} />
                <InputGroup label="Hero Subtitle" type="textarea" value={archConfig.heroSubtitle} onChange={(v: string) => handleArchUpdate('heroSubtitle', v)} />
                
                <h3 className="text-sm font-bold text-white uppercase mt-8 border-b border-zinc-900 pb-2">Protocol Layers</h3>
                {archConfig.layers.map((layer, i) => (
                  <ArrayItem key={i} onDelete={() => handleArchUpdate('layers', archConfig.layers.filter((_, idx) => idx !== i))}>
                     <InputGroup label="Layer Title" value={layer.title} onChange={(v: string) => {const n=[...archConfig.layers]; n[i].title=v; handleArchUpdate('layers', n)}} />
                     <InputGroup label="Description" value={layer.desc} onChange={(v: string) => {const n=[...archConfig.layers]; n[i].desc=v; handleArchUpdate('layers', n)}} className="mt-2" />
                     <InputGroup label="Stat/Metric" value={layer.stat} onChange={(v: string) => {const n=[...archConfig.layers]; n[i].stat=v; handleArchUpdate('layers', n)}} className="mt-2" />
                  </ArrayItem>
                ))}
                <button onClick={() => handleArchUpdate('layers', [...archConfig.layers, {title:'New Layer', desc:'', stat:''}])} className="btn-secondary w-full py-4 border-dashed">+ Add Layer</button>
              </div>
            )}

            {/* Whitepaper Editor */}
            {activeCmsPage === 'whitepaper' && (
              <div className="space-y-8">
                <SectionHeader title="Whitepaper Content" icon={FileText} />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Title" value={whitepaperConfig.title} onChange={(v: string) => handleWhitepaperUpdate('title', v)} />
                  <InputGroup label="Version" value={whitepaperConfig.version} onChange={(v: string) => handleWhitepaperUpdate('version', v)} />
                </div>
                <InputGroup label="Subtitle" value={whitepaperConfig.subtitle} onChange={(v: string) => handleWhitepaperUpdate('subtitle', v)} />

                <h3 className="text-sm font-bold text-white uppercase mt-8 border-b border-zinc-900 pb-2">Sections</h3>
                {whitepaperConfig.sections.map((section, i) => (
                  <ArrayItem key={i} onDelete={() => handleWhitepaperUpdate('sections', whitepaperConfig.sections.filter((_, idx) => idx !== i))}>
                     <InputGroup label="Section Title" value={section.title} onChange={(v: string) => {const n=[...whitepaperConfig.sections]; n[i].title=v; handleWhitepaperUpdate('sections', n)}} />
                     <InputGroup label="Content Body" type="textarea" value={section.content} onChange={(v: string) => {const n=[...whitepaperConfig.sections]; n[i].content=v; handleWhitepaperUpdate('sections', n)}} className="mt-2 h-64" />
                  </ArrayItem>
                ))}
                <button onClick={() => handleWhitepaperUpdate('sections', [...whitepaperConfig.sections, {title:'New Section', content:''}])} className="btn-secondary w-full py-4 border-dashed">+ Add Section</button>
              </div>
            )}

            {/* Tokenomics Editor */}
            {activeCmsPage === 'tokenomics' && (
              <div className="space-y-8">
                <SectionHeader title="Tokenomics Configuration" icon={PieChart} />
                <InputGroup label="Page Title" value={tokenomicsConfig.title} onChange={(v: string) => handleTokenomicsUpdate('title', v)} />
                <InputGroup label="Subtitle" type="textarea" value={tokenomicsConfig.subtitle} onChange={(v: string) => handleTokenomicsUpdate('subtitle', v)} />
                <div className="grid grid-cols-2 gap-4">
                   <InputGroup label="Total Supply" value={tokenomicsConfig.totalSupply} onChange={(v: string) => handleTokenomicsUpdate('totalSupply', v)} />
                   <InputGroup label="Circulating Supply" value={tokenomicsConfig.circulatingSupply} onChange={(v: string) => handleTokenomicsUpdate('circulatingSupply', v)} />
                </div>
              </div>
            )}

            {/* Careers Editor */}
            {activeCmsPage === 'careers' && (
              <div className="space-y-8">
                <SectionHeader title="Careers Page" icon={Briefcase} />
                <InputGroup label="Page Title" value={careersConfig.title} onChange={(v: string) => handleCareersUpdate('title', v)} />
                <InputGroup label="Subtitle" type="textarea" value={careersConfig.subtitle} onChange={(v: string) => handleCareersUpdate('subtitle', v)} />
                
                <p className="text-[10px] font-black text-zinc-500 uppercase border-b border-zinc-900 pb-2 mt-8">Job Listings</p>
                {careersConfig.positions.map((job, i) => (
                  <ArrayItem key={i} onDelete={() => handleCareersUpdate('positions', careersConfig.positions.filter((_, idx) => idx !== i))}>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <InputGroup label="Job Title" value={job.title} onChange={(v: string) => {const n=[...careersConfig.positions]; n[i].title=v; handleCareersUpdate('positions', n)}} />
                      <InputGroup label="Department" value={job.department} onChange={(v: string) => {const n=[...careersConfig.positions]; n[i].department=v; handleCareersUpdate('positions', n)}} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <InputGroup label="Location" value={job.location} onChange={(v: string) => {const n=[...careersConfig.positions]; n[i].location=v; handleCareersUpdate('positions', n)}} />
                      <InputGroup label="Type (Full-time)" value={job.type} onChange={(v: string) => {const n=[...careersConfig.positions]; n[i].type=v; handleCareersUpdate('positions', n)}} />
                    </div>
                    <InputGroup label="Description" type="textarea" value={job.description} onChange={(v: string) => {const n=[...careersConfig.positions]; n[i].description=v; handleCareersUpdate('positions', n)}} />
                  </ArrayItem>
                ))}
                <button onClick={() => handleCareersUpdate('positions', [...careersConfig.positions, {title:'New Position', department:'Engineering', location:'Remote', type:'Full-time', description:''}])} className="btn-secondary w-full py-4 border-dashed">+ Add Position</button>
              </div>
            )}

            {/* Contact Editor */}
            {activeCmsPage === 'contact' && (
              <div className="space-y-8">
                <SectionHeader title="Contact Page" icon={Phone} />
                <InputGroup label="Headline" value={contactConfig.title} onChange={(v: string) => handleContactUpdate('title', v)} />
                <InputGroup label="Subtitle" type="textarea" value={contactConfig.subtitle} onChange={(v: string) => handleContactUpdate('subtitle', v)} />
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <InputGroup label="Contact Email" value={contactConfig.email} onChange={(v: string) => handleContactUpdate('email', v)} />
                   <InputGroup label="Support Hours" value={contactConfig.supportHours} onChange={(v: string) => handleContactUpdate('supportHours', v)} />
                </div>
                <InputGroup label="Physical Address" type="textarea" value={contactConfig.address} onChange={(v: string) => handleContactUpdate('address', v)} className="mt-4" />
              </div>
            )}

            {/* Legal Pages Editor */}
            {(activeCmsPage === 'terms' || activeCmsPage === 'privacy') && (
              <div className="space-y-8">
                <SectionHeader title={activeCmsPage.toUpperCase()} icon={Shield} />
                {(() => {
                  const c = activeCmsPage === 'terms' ? termsConfig : privacyConfig;
                  const t = activeCmsPage;
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Document Title" value={c.title} onChange={(v: string) => handleLegalUpdate(t, 'title', v)} />
                        <InputGroup label="Last Updated" value={c.lastUpdated} onChange={(v: string) => handleLegalUpdate(t, 'lastUpdated', v)} />
                      </div>
                      {c.sections.map((s, i) => (
                        <ArrayItem key={i} onDelete={() => handleLegalUpdate(t, 'sections', c.sections.filter((_, idx) => idx !== i))}>
                          <InputGroup label="Clause Heading" value={s.heading} onChange={(v: string) => {const n=[...c.sections]; n[i].heading=v; handleLegalUpdate(t, 'sections', n)}} />
                          <InputGroup label="Clause Body" type="textarea" value={s.content} onChange={(v: string) => {const n=[...c.sections]; n[i].content=v; handleLegalUpdate(t, 'sections', n)}} className="mt-2" />
                        </ArrayItem>
                      ))}
                      <button onClick={() => handleLegalUpdate(t, 'sections', [...c.sections, {heading:'New Clause', content:''}])} className="btn-secondary w-full py-4 border-dashed">+ Add Clause Block</button>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
         .cms-input { width: 100%; background-color: #0c0c0e; border: 1px solid #1a1a1e; color: #f4f4f5; padding: 0.85rem 1.1rem; border-radius: 0.85rem; font-size: 0.85rem; font-family: 'Inter', sans-serif; outline: none; transition: all 0.25s; }
         .cms-input:focus { border-color: #f43f5e; box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.1); }
      `}</style>
    </div>
  );
};

export default AdminPanel;
