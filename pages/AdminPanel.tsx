
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
  updateNetworkCap,
  recalculateNetworkStats,
  deleteUserAction,
  updateUserRoleAction,
  adjustUserPointsAction,
  DEFAULT_LANDING_CONFIG,
  DEFAULT_LEGAL_CONFIG,
  DEFAULT_ABOUT_CONFIG,
  DEFAULT_WHITEPAPER_CONFIG,
  DEFAULT_ARCHITECTURE_CONFIG,
  DEFAULT_TOKENOMICS_CONFIG,
  DEFAULT_CAREERS_CONFIG,
  DEFAULT_CONTACT_CONFIG,
  subscribeToContactMessages,
  updateMessageStatusAction,
  ADMIN_EMAIL,
  DEFAULT_MAX_USERS_CAP,
  subscribeToActiveMinerCount
} from '../services/firebase';
import {
  User, Task, NetworkStats, LandingConfig,
  LegalConfig, AboutConfig, WhitepaperConfig, ArchitecturePageConfig, TokenomicsConfig, CareersConfig, ContactConfig, ContactMessage
} from '../types';
import {
  Users, PlusCircle, Database, ShieldAlert, Cpu,
  Radio, Trash2, Globe, Layout, Save, X,
  BookOpen, FileText, Info, Zap, Activity,
  Layers, AlignLeft, CheckCircle2, Shield, MapPin,
  Briefcase, Phone, HelpCircle, Share2, PieChart,
  ListPlus, ChevronDown, ChevronRight, Settings,
  Target, RefreshCw, MessageSquare
} from 'lucide-react';
import Logo from '../components/Logo';
import { AdvancedEditor } from '../components/AdvancedEditor';
import { ContentRenderer } from '../components/ContentRenderer';

// --- Helper Components ---

const INPUT_STYLES = "w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3 rounded-lg focus:border-maroon/50 focus:bg-zinc-900 outline-none transition-all text-xs font-mono placeholder:text-zinc-700";

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "", className = "" }: any) => (
  <div className={`space-y-2 w-full ${className}`}>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
    {type === 'textarea' ? (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`${INPUT_STYLES} min-h-[100px] resize-y`}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className={INPUT_STYLES}
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-maroon' : 'bg-zinc-800'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SectionHeader = ({ title, icon: Icon, description }: any) => (
  <div className="mb-8 border-b border-zinc-800 pb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2.5 bg-maroon/10 rounded-xl border border-maroon/20">
        <Icon className="w-5 h-5 text-maroon" />
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
          {isOpen ? <ChevronDown className="w-4 h-4 text-maroon" /> : <ChevronRight className="w-4 h-4 text-zinc-600" />}
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

const RiskAnalysisModal = ({ ip, users, onClose }: { ip: string, users: User[], onClose: () => void }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
    <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-maroon/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="p-10 space-y-8 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Audit_Report: {ip}</h3>
              <p className="text-[10px] text-zinc-500 font-mono">Reference_Header: Handshake_{ip.replace(/\./g, '_')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-xl transition-colors"><X className="w-5 h-5 text-zinc-500" /></button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Risk_Score</p>
            <p className="text-2xl font-mono font-black text-red-500">{users.length * 15 + 25}/100</p>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">VPN_Status</p>
            <p className="text-2xl font-mono font-black text-amber-500">INDETERMINATE</p>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Account_Clustering</p>
            <p className="text-2xl font-mono font-black text-white">ACTIVE</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Identified_Validator_Entities</p>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {users.map(u => (
              <div key={u.uid} className="flex items-center justify-between p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl group hover:border-maroon/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    {u.photoURL ? <img src={u.photoURL} alt="" /> : <span className="text-[10px] text-zinc-700">{(u.displayName || 'U')[0]}</span>}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-maroon transition-colors">{u.displayName || 'Anonymous'}</p>
                    <p className="text-[8px] text-zinc-600 font-mono">UID: {(u.uid || '').slice(0, 16)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono font-black text-white">{(u.points || 0).toFixed(2)} ARG</p>
                  <p className="text-[8px] text-zinc-700 uppercase">Balance</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button className="flex-1 py-4 bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-colors">Staged_Watchlist</button>
          <button className="flex-1 py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all">Purge_Cluster</button>
        </div>
      </div>
    </div>
  </div>
);

const AdminPanel = () => {
  const { user, firebaseUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [onlineUids, setOnlineUids] = useState<string[]>([]);
  const [netStats, setNetStats] = useState<NetworkStats>({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [activeMinerCount, setActiveMinerCount] = useState(0);
  const [selectedAuditIp, setSelectedAuditIp] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<any>({
    title: '', description: '', points: 100.00, icon: 'web', link: '', actionLabel: 'Initialize',
    verificationWaitTime: 5, activeDurationHours: 24
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cms'>('dashboard');
  const [activeCmsPage, setActiveCmsPage] = useState<'landing' | 'about' | 'architecture' | 'whitepaper' | 'tokenomics' | 'careers' | 'contact' | 'terms' | 'privacy'>('landing');
  const [activeLandingSection, setActiveLandingSection] = useState<string>('hero');
  const [cmsStatus, setCmsStatus] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [msgSearchQuery, setMsgSearchQuery] = useState('');

  // CMS State
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  const [aboutConfig, setAboutConfig] = useState<AboutConfig>(DEFAULT_ABOUT_CONFIG);
  const [archConfig, setArchConfig] = useState<ArchitecturePageConfig>(DEFAULT_ARCHITECTURE_CONFIG);
  const [whitepaperConfig, setWhitepaperConfig] = useState<WhitepaperConfig>(DEFAULT_WHITEPAPER_CONFIG);
  const [tokenomicsConfig, setTokenomicsConfig] = useState<TokenomicsConfig>(DEFAULT_TOKENOMICS_CONFIG);
  const [careersConfig, setCareersConfig] = useState<CareersConfig>(DEFAULT_CAREERS_CONFIG);
  const [contactConfig, setContactConfig] = useState<ContactConfig>(DEFAULT_CONTACT_CONFIG);
  const [termsConfig, setTermsConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.terms);
  const [privacyConfig, setPrivacyConfig] = useState<LegalConfig>(DEFAULT_LEGAL_CONFIG.privacy);

  const [capInput, setCapInput] = useState<number>(DEFAULT_MAX_USERS_CAP);
  const [capSaveStatus, setCapSaveStatus] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [adjPoints, setAdjPoints] = useState<{ [key: string]: number }>({});
  const [isManaging, setIsManaging] = useState<{ [key: string]: boolean }>({});

  const isAuthorized = firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Initial Subscriptions
  useEffect(() => {
    if (!isAuthorized) return;

    const unsubUsers = subscribeToUsers(setUsers);

    const unsubStats = subscribeToNetworkStats((stats) => {
      setNetStats(stats);
      if (stats.maxUsersCap) setCapInput(stats.maxUsersCap);
    });

    const unsubOnline = subscribeToOnlineUsers(setOnlineUids);
    const unsubMiners = subscribeToActiveMinerCount(setActiveMinerCount);

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
    const unsubMessages = subscribeToContactMessages(setMessages);

    return () => {
      unsubUsers(); unsubStats(); unsubOnline(); unsubMiners(); unsubTasks();
      unsubLanding(); unsubAbout(); unsubArch(); unsubWhitepaper(); unsubTokenomics();
      unsubCareers(); unsubContact(); unsubTerms(); unsubPrivacy(); unsubMessages();
    };
  }, [isAuthorized]);

  // Generic Updater
  const updateState = (setter: any, path: string[], value: any) => {
    setter((prev: any) => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
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
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      const key = path[path.length - 1];
      if (!Array.isArray(current[key])) current[key] = [];
      current[key] = [...current[key], item];
      return newState;
    });
    setHasUnsavedChanges(true);
  };

  const removeItem = (setter: any, path: string[], index: number) => {
    setter((prev: any) => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) return newState; // Abort if path doesn't exist
        current = current[path[i]];
      }
      const key = path[path.length - 1];
      if (Array.isArray(current[key])) {
        current[key] = current[key].filter((_: any, i: number) => i !== index);
      }
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

  const handleUpdateCap = async () => {
    try {
      await updateNetworkCap(capInput);
      setCapSaveStatus('Updated');
      setTimeout(() => setCapSaveStatus(''), 2000);
    } catch (e) {
      setCapSaveStatus('Error');
    }
  };

  const handleSyncStats = async () => {
    setIsSyncing(true);
    const success = await recalculateNetworkStats();
    setIsSyncing(false);
    if (success) {
      // Small visual feedback within the button or a toast could go here
      // For now we'll just use the button text change inherited from syncStatus if we added one, 
      // but let's just make it clear in the button itself.
    }
  };

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-mono uppercase tracking-widest">Access_Denied</div>;

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white selection:bg-maroon/30">

      {/* ONYX SIDEBAR */}
      <aside className="w-80 h-full border-r border-zinc-900 bg-zinc-950/50 backdrop-blur-3xl flex flex-col z-50 shrink-0">
        <div className="p-8 border-b border-zinc-900/50">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center transition-all duration-500 group-hover:border-maroon/40 shadow-inner">
              <Logo className="w-7 h-7 text-maroon transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Argus_Panel</h1>
              <p className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-widest mt-1">Institutional_v2.4.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Section 1: Operations */}
          <div>
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-4 px-3 font-mono">Nodes_&_Assets</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 group ${activeTab === 'dashboard' ? 'bg-zinc-900 text-white border border-white/5 shadow-xl' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}
              >
                <Activity className={`w-4 h-4 transition-colors ${activeTab === 'dashboard' ? 'text-maroon' : 'text-zinc-700 group-hover:text-zinc-500'}`} />
                System Metrics
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 group ${activeTab === 'messages' ? 'bg-zinc-900 text-white border border-white/5 shadow-xl' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}
              >
                <MessageSquare className={`w-4 h-4 transition-colors ${activeTab === 'messages' ? 'text-blue-500' : 'text-zinc-700 group-hover:text-zinc-500'}`} />
                Inbound Comms
              </button>
            </div>
          </div>

          {/* Section 2: Management */}
          <div>
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-4 px-3 font-mono">Content_Nexus</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('cms')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 group ${activeTab === 'cms' ? 'bg-maroon text-white border border-maroon/20 shadow-lg shadow-maroon/20' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}
              >
                <Layout className={`w-4 h-4 transition-colors ${activeTab === 'cms' ? 'text-white' : 'text-zinc-700 group-hover:text-zinc-500'}`} />
                CMS Controller
              </button>
            </div>
          </div>
        </nav>

        <div className="p-8 border-t border-zinc-900/50 space-y-4">
          {activeTab === 'cms' && (
            <div className="space-y-3">
              <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`w-full py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${isPreviewMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}>
                {isPreviewMode ? 'Exit Preview' : 'Live Preview'}
              </button>
              <button onClick={handleSaveCMS} className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${hasUnsavedChanges ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'}`}>
                {cmsStatus || (hasUnsavedChanges ? 'COMMIT_CHANGES' : 'CLIENT_SYNCED')}
              </button>
            </div>
          )}
          <div className="pt-2">
            <p className="text-[8px] font-mono text-zinc-600">AUTH: {firebaseUser?.email?.split('@')[0].toUpperCase()}</p>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar bg-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(128,0,0,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto p-12 relative z-10 animate-fade-in-up">

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">

                  {/* Metrics Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-6 bg-zinc-950/80 rounded-[2rem] border border-zinc-900 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/[0.02] group-hover:to-transparent transition-all duration-700 pointer-events-none"></div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Users</p>
                      <p className="text-4xl font-black text-white group-hover:scale-105 transition-transform duration-500 origin-left">{users.length.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-zinc-950/80 rounded-[2rem] border border-zinc-900 shadow-xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/[0.05] group-hover:to-transparent transition-all duration-700 pointer-events-none"></div>
                      <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Active Miners</p>
                      <p className="text-4xl font-black text-emerald-400 group-hover:scale-105 transition-transform duration-500 origin-left">{activeMinerCount.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-zinc-950/80 rounded-[2rem] border border-zinc-900 shadow-xl relative overflow-hidden group hover:border-purple-500/20 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/[0.05] group-hover:to-transparent transition-all duration-700 pointer-events-none"></div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">NFT Minters</p>
                      <p className="text-4xl font-black text-purple-400 group-hover:scale-105 transition-transform duration-500 origin-left">{users.filter(u => u.ownedNFT).length.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-zinc-950/80 rounded-[2rem] border border-amber-900/30 shadow-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all duration-500 bg-gradient-to-br from-amber-500/[0.02] to-transparent">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-700 pointer-events-none"></div>
                      <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mb-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">Registrations Left <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded text-[8px] animate-pulse w-fit">COUNTDOWN</span></p>
                      <p className="text-4xl font-black text-amber-500 group-hover:scale-105 transition-transform duration-500 origin-left">{Math.max(0, capInput - users.length).toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-500 mt-2 uppercase font-mono tracking-widest">Max Cap: <span className="text-zinc-300">{capInput.toLocaleString()}</span></p>
                    </div>
                  </div>

                  {/* User Directory */}
                  <div className="silk-panel p-10 rounded-[2.5rem] border-zinc-900 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-800 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-maroon/10 rounded-xl border border-maroon/20">
                          <Users className="w-5 h-5 text-maroon" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">User Directory</h2>
                      </div>
                      <div className="relative max-w-xs w-full">
                        <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                          type="text"
                          placeholder="Search Users..."
                          className={`${INPUT_STYLES} pl-10`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900">
                            <th className="pb-4 px-2">Node Entity</th>
                            <th className="pb-4 px-2 text-center">Status</th>
                            <th className="pb-4 px-2 text-right">Balance</th>
                            <th className="pb-4 px-2 text-right hidden sm:table-cell">Refs</th>
                            <th className="pb-4 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/50">
                          {users.filter(u =>
                            (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
                          ).map((u) => (
                            <tr key={u.uid} className="group hover:bg-zinc-950/40 transition-colors">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden">
                                    {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <Shield className="w-5 h-5 text-zinc-700" />}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white flex items-center gap-2">
                                      {u.displayName}
                                      {u.role === 'admin' && <span className="text-[8px] bg-maroon/20 text-maroon px-1.5 py-0.5 rounded border border-maroon/20">ADMIN</span>}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 font-mono lower">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-2 text-center">
                                <div className="flex justify-center">
                                  {u.miningActive ? (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">MINING</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">IDLE</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-2 text-right">
                                <p className="text-xs font-mono font-black text-white">{(u.points || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] text-zinc-600">ARG</span></p>
                                <p className="text-[8px] text-zinc-600 font-mono">≈ ${((u.points || 0) * 0.5).toFixed(2)} USD</p>
                              </td>
                              <td className="py-4 px-2 text-right hidden sm:table-cell">
                                <span className={`text-[10px] font-mono font-black ${u.referralCount > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>{u.referralCount || 0}</span>
                              </td>
                              <td className="py-4 px-2 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setIsManaging({ ...isManaging, [u.uid]: !isManaging[u.uid] })}
                                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                                  >
                                    <Settings className={`w-3.5 h-3.5 ${isManaging[u.uid] ? 'text-maroon' : 'text-zinc-500'}`} />
                                  </button>
                                  <button
                                    onClick={() => deleteUserAction(u.uid, u.displayName || '')}
                                    className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg hover:bg-red-500/20 hover:border-red-500 transition-silk text-red-500/50 hover:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Institutional Security Intelligence Suite */}
                    <div className="silk-panel p-10 rounded-[2.5rem] border-zinc-900 mt-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.02] to-transparent h-1/2 w-full animate-scanline pointer-events-none opacity-40"></div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-800/50 pb-8 relative z-10">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.1)] group/threat">
                            <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse transition-transform duration-500 group-hover/threat:scale-110" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Threat_Matrix</h2>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                              <p className="text-[9px] text-zinc-500 font-mono font-black uppercase tracking-[0.25em]">Handshake Audit Protocol v4.0 · {users.filter(u => u.registrationIP).length} Sync_Points</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="px-6 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl backdrop-blur-md shadow-xl">
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1 font-mono">Status_Code</p>
                            <p className={`text-xs font-mono font-black ${users.length > 0 ? 'text-amber-500' : 'text-emerald-500'} tracking-tighter`}>CRYPTO_WATCH_ACTIVE</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 relative z-10">
                        {/* Link Analysis Visualizer */}
                        {Array.from(new Set(users.map(u => u.registrationIP).filter(Boolean))).map(ip => {
                          const sameIpUsers = users.filter(u => u.registrationIP === ip);
                          if (sameIpUsers.length < 2) return null;

                          const riskLevel = sameIpUsers.length > 5 ? 'critical' : sameIpUsers.length > 3 ? 'high' : 'medium';
                          const riskColor = riskLevel === 'critical' ? 'text-red-500 border-red-500 shadow-red-500/20' :
                            riskLevel === 'high' ? 'text-orange-500 border-orange-500 shadow-orange-500/20' :
                              'text-amber-500 border-amber-500 shadow-amber-500/20';

                          return (
                            <div key={ip} className={`group silk-panel !bg-black/60 p-8 rounded-[2rem] border-zinc-900 transition-all duration-700 hover:border-zinc-700`}>
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                <div className="space-y-6 flex-1">
                                  <div className="flex items-center gap-4">
                                    <div className={`px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50`}>
                                      <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">Network_Endpoint: </span>
                                      <span className="text-[10px] font-mono font-black text-white">{ip}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${riskColor.split(' ')[1]} bg-black/40 shadow-lg`}>
                                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${riskColor.split(' ')[0].replace('text-', 'bg-')}`} />
                                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${riskColor.split(' ')[0]}`}>Risk_{riskLevel.toUpperCase()}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    <div>
                                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1.5">Linked_Nodes</p>
                                      <p className="text-xl font-mono font-black text-white">{sameIpUsers.length}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1.5">ISP_Signature</p>
                                      <p className="text-xl font-mono font-black text-zinc-400">RESIDENTIAL</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1.5">VPN_Heuristics</p>
                                      <p className="text-xl font-mono font-black text-emerald-500/80">LOW_PROB</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1.5">Action_Required</p>
                                      <p className="text-xl font-mono font-black text-zinc-300">REVIEW</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="lg:w-72 shrink-0 space-y-6">
                                  <div>
                                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-4 px-2">Entity_Linkage</p>
                                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 flex flex-wrap gap-3">
                                      {sameIpUsers.map((u, i) => (
                                        <div key={u.uid} className="relative group/entity">
                                          <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover/entity:border-maroon/50 group-hover/entity:scale-110">
                                            {u.photoURL ? (
                                              <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                                <span className="text-xs font-black text-zinc-600">{u.displayName?.[0] || 'U'}</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 border-2 border-zinc-950 rounded-full z-10"></div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setSelectedAuditIp(ip)}
                                    className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white hover:border-maroon/40 hover:bg-maroon/5 transition-all"
                                  >
                                    Full_Audit_Report
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {selectedAuditIp && (
                          <RiskAnalysisModal
                            ip={selectedAuditIp}
                            users={users.filter(u => u.registrationIP === selectedAuditIp)}
                            onClose={() => setSelectedAuditIp(null)}
                          />
                        )}

                        {Array.from(new Set(users.map(u => u.registrationIP).filter(Boolean))).every(ip => users.filter(u => u.registrationIP === ip).length < 2) && (
                          <div className="py-24 text-center silk-panel !bg-black/20 rounded-[3rem] border-dashed border-zinc-900/50">
                            <div className="w-20 h-20 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Network_Integrity_Verified</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] max-w-xs mx-auto">No linked validator accounts identified from unique IP headers.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Protocol Config Section */}
                  <div className="silk-panel p-10 rounded-[2.5rem] border-zinc-900">
                    <SectionHeader title="Network Protocol Config" icon={Settings} description="Global parameter adjustments" />

                    <div className="space-y-6">
                      <div className="flex items-end gap-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                        <InputGroup
                          label="Max User Cap (Hard Limit)"
                          type="number"
                          value={capInput}
                          onChange={(v: number) => setCapInput(v)}
                          placeholder="e.g. 500000"
                        />
                        <button
                          onClick={handleUpdateCap}
                          className="bg-zinc-800 text-white hover:bg-zinc-700 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors h-[46px] mb-0.5 whitespace-nowrap min-w-[120px]"
                        >
                          {capSaveStatus || 'Update Cap'}
                        </button>
                      </div>

                      <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">System Maintenance</p>
                          <p className="text-[10px] text-zinc-600">Recalculate global supply counters if drift occurs due to manual DB edits.</p>
                        </div>
                        <button
                          onClick={handleSyncStats}
                          disabled={isSyncing}
                          className={`flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isSyncing ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                          {isSyncing ? 'Synchronizing Cosmos...' : 'Sync Network Stats'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Task Injection */}
                  <div className="silk-panel p-10 rounded-[2.5rem] border-zinc-900">
                    <SectionHeader title="Inject Directive" icon={PlusCircle} description="Create new social task for validators" />
                    <form onSubmit={handleCreateTask} className="space-y-6">
                      <InputGroup label="Task Title" value={newTask.title} onChange={(v: string) => setNewTask({ ...newTask, title: v })} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Reward Points" type="number" value={newTask.points} onChange={(v: number) => setNewTask({ ...newTask, points: v })} />
                        <InputGroup label="Verification Delay (Sec)" type="number" value={newTask.verificationWaitTime} onChange={(v: number) => setNewTask({ ...newTask, verificationWaitTime: v })} placeholder="Hidden timer" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Action URL" value={newTask.link} onChange={(v: string) => setNewTask({ ...newTask, link: v })} />
                        <InputGroup label="Visibility Duration (Hours)" type="number" value={newTask.activeDurationHours} onChange={(v: number) => setNewTask({ ...newTask, activeDurationHours: v })} placeholder="Time until vanish" />
                      </div>
                      <InputGroup label="Description" type="textarea" value={newTask.description} onChange={(v: string) => setNewTask({ ...newTask, description: v })} />
                      <button className="btn-primary w-full py-4 mt-2">+ Deploy Directive</button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  {/* Management Popover */}
                  {users.filter(u => isManaging[u.uid]).map(u => (
                    <div key={`manage-${u.uid}`} className="surface p-6 rounded-2xl bg-zinc-950 border-maroon/30 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-maroon/10 flex items-center justify-center border border-maroon/20">
                            <Settings className="w-4 h-4 text-maroon" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-tight">MANAGE: {u.displayName}</p>
                            <p className="text-[9px] text-zinc-500 lowercase font-mono">{u.uid.slice(0, 12)}...</p>
                          </div>
                        </div>
                        <button onClick={() => setIsManaging({ ...isManaging, [u.uid]: false })} className="text-zinc-600 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>

                      <div className="space-y-6">
                        <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-4">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Adjust Balance</p>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={adjPoints[u.uid] || 0}
                              onChange={(e) => setAdjPoints({ ...adjPoints, [u.uid]: parseFloat(e.target.value) })}
                              className={`${INPUT_STYLES} !p-2`}
                            />
                            <button
                              onClick={() => {
                                adjustUserPointsAction(u.uid, adjPoints[u.uid] || 0);
                                setAdjPoints({ ...adjPoints, [u.uid]: 0 });
                              }}
                              className="px-4 py-2 bg-maroon text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all"
                            >
                              APPLY
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-xl border border-zinc-900">
                          <div>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Privilege Level</p>
                            <p className="text-[10px] text-white font-black uppercase mt-0.5">{u.role || 'user'}</p>
                          </div>
                          <button
                            onClick={() => updateUserRoleAction(u.uid, u.role === 'admin' ? 'user' : 'admin')}
                            className={`px-4 py-2 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${u.role === 'admin' ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' : 'border-maroon/20 text-maroon hover:bg-maroon/10'}`}
                          >
                            {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Active Directives Sidebar */}
                  <div className="silk-panel rounded-[2.5rem] border-zinc-900 overflow-hidden flex flex-col h-full max-h-[800px]">
                    <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 flex justify-between items-center shrink-0">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Directives</span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                      {tasks.map(t => {
                        const isExpired = t.expiresAt && t.expiresAt < Date.now();
                        return (
                          <div key={t.id} className={`flex justify-between items-center p-4 bg-zinc-950/40 rounded-xl border border-zinc-900 group ${isExpired ? 'opacity-50' : ''}`}>
                            <div>
                              <p className="text-white text-xs font-bold">{t.title}</p>
                              <p className="text-maroon text-[10px] font-mono">{t.points} ARG</p>
                              {isExpired && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">EXPIRED</p>}
                            </div>
                            <button onClick={() => deleteTask(t.id)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Inbox View */}
          {activeTab === 'messages' && (
            <div className="space-y-8 relative z-10 animate-fade-in-up">
              <div className="silk-panel p-10 rounded-[2.5rem] border-zinc-900 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-800 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Comms Intercept</h2>
                  </div>
                  <div className="relative max-w-xs w-full">
                    <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="Query Transmissions..."
                      className={`${INPUT_STYLES} pl-10`}
                      value={msgSearchQuery}
                      onChange={(e) => setMsgSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900">
                        <th className="pb-4 px-2">Timestamp</th>
                        <th className="pb-4 px-2">Entity ID</th>
                        <th className="pb-4 px-2">Payload Fragment</th>
                        <th className="pb-4 px-2 text-center">Status</th>
                        <th className="pb-4 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                      {messages
                        .filter(m =>
                          (m.name || '').toLowerCase().includes(msgSearchQuery.toLowerCase()) ||
                          (m.email || '').toLowerCase().includes(msgSearchQuery.toLowerCase()) ||
                          (m.payload || '').toLowerCase().includes(msgSearchQuery.toLowerCase())
                        )
                        .map(msg => (
                          <tr key={msg.id} className="group hover:bg-zinc-950/40 transition-colors">
                            <td className="py-4 px-2">
                              <p className="text-xs font-mono font-bold text-white">{new Date(msg.createdAt).toLocaleDateString()}</p>
                              <p className="text-[9px] text-zinc-500 font-mono">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-zinc-300">{msg.name}</p>
                                {msg.uid && <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[8px] font-mono text-emerald-400">AUTH</span>}
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono"><a href={`mailto:${msg.email}`} className="hover:text-maroon transition-colors">{msg.email}</a></p>
                            </td>
                            <td className="py-4 px-2 max-w-sm">
                              <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                                <p className="text-[11px] text-zinc-400 whitespace-pre-wrap break-words leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-2">{msg.payload}</p>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <div className="flex justify-center">
                                <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-md border ${msg.status === 'resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                  {msg.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-right">
                              {msg.status === 'pending' ? (
                                <button
                                  onClick={() => updateMessageStatusAction(msg.id, 'resolved')}
                                  className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg hover:bg-emerald-500/20 hover:border-emerald-500 transition-silk text-emerald-500/50 hover:text-emerald-500"
                                  title="Mark Resolved"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateMessageStatusAction(msg.id, 'pending')}
                                  className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors text-zinc-500"
                                  title="Re-open"
                                >
                                  <Activity className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      {messages.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-sm font-mono text-zinc-600 uppercase tracking-widest">No Transmissions Logged</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CMS View */}
          {activeTab === 'cms' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">

              {/* Combined Sticky Sidebar - Z-Index 30 */}
              <div className="md:col-span-3 space-y-5 md:sticky md:top-32 z-30 h-fit max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar pr-2">
                <div className="silk-panel p-5 rounded-[2rem] border-zinc-900/50 bg-zinc-950/40 backdrop-blur-md shadow-xl">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] font-mono">Archive_Index</span>
                  </div>
                  <div className="space-y-1.5">
                    {(['landing', 'architecture', 'tokenomics', 'whitepaper', 'about', 'careers', 'contact', 'terms', 'privacy'] as const).map(page => (
                      <button
                        key={page}
                        onClick={() => setActiveCmsPage(page)}
                        className={`w-full text-left px-5 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500 relative overflow-hidden group/btn ${activeCmsPage === page ? 'bg-zinc-800 text-white shadow-lg shadow-black/40' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/40'}`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-maroon transition-transform duration-500 ${activeCmsPage === page ? 'scale-y-100' : 'scale-y-0'}`} />
                        {page}
                      </button>
                    ))}
                  </div>
                </div>

                {activeCmsPage === 'landing' && (
                  <div className="silk-panel p-5 rounded-[2rem] border-zinc-900/50 bg-zinc-950/40 backdrop-blur-md shadow-xl animate-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center gap-2 mb-4 px-2">
                      <Layers className="w-3.5 h-3.5 text-maroon/60" />
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] font-mono">Module_Tree</span>
                    </div>
                    <div className="space-y-1">
                      {['hero', 'socials', 'partners', 'features', 'architecture', 'roadmap', 'faq', 'cta', 'footer'].map(sec => (
                        <button
                          key={sec}
                          onClick={() => setActiveLandingSection(sec)}
                          className={`w-full text-left px-5 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${activeLandingSection === sec ? 'bg-zinc-900 text-maroon border-l-2 border-maroon' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/20'}`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-9 space-y-8">
                <div className="silk-panel p-10 rounded-[2.5rem] border-zinc-900 min-h-[500px]">

                  {/* LANDING PAGE CONFIG */}
                  {activeCmsPage === 'landing' && (
                    <>
                      <SectionHeader title={`Landing / ${activeLandingSection}`} icon={Layout} />

                      {activeLandingSection === 'hero' && (
                        <div className="space-y-6">
                          <Toggle label="Section Visible" checked={landingConfig.hero.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['hero', 'isVisible'], v)} />
                          <InputGroup label="Headline" value={landingConfig.hero.title} onChange={(v: string) => updateState(setLandingConfig, ['hero', 'title'], v)} />
                          <InputGroup label="Subheadline" type="textarea" value={landingConfig.hero.subtitle} onChange={(v: string) => updateState(setLandingConfig, ['hero', 'subtitle'], v)} />
                          <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="Primary CTA" value={landingConfig.hero.ctaPrimary} onChange={(v: string) => updateState(setLandingConfig, ['hero', 'ctaPrimary'], v)} />
                            <InputGroup label="Secondary CTA" value={landingConfig.hero.ctaSecondary} onChange={(v: string) => updateState(setLandingConfig, ['hero', 'ctaSecondary'], v)} />
                          </div>
                        </div>
                      )}

                      {activeLandingSection === 'socials' && (
                        <div className="space-y-8">
                          <div className="p-8 silk-panel border-zinc-900 rounded-[2rem] space-y-6">
                            <InputGroup
                              label="Twitter / X URL"
                              value={landingConfig.socials.twitter}
                              onChange={(v: string) => handleSocialUpdate('twitter', v)}
                              placeholder="https://twitter.com/..."
                            />
                            <InputGroup
                              label="Discord Invite URL"
                              value={landingConfig.socials.discord}
                              onChange={(v: string) => handleSocialUpdate('discord', v)}
                              placeholder="https://discord.gg/..."
                            />
                            <InputGroup
                              label="Github Org URL"
                              value={landingConfig.socials.github}
                              onChange={(v: string) => handleSocialUpdate('github', v)}
                              placeholder="https://github.com/..."
                            />
                          </div>
                        </div>
                      )}

                      {activeLandingSection === 'partners' && (
                        <div className="space-y-6">
                          <Toggle label="Section Visible" checked={landingConfig.partners.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['partners', 'isVisible'], v)} />
                          <InputGroup label="Section Title" value={landingConfig.partners.title} onChange={(v: string) => updateState(setLandingConfig, ['partners', 'title'], v)} />
                          <div className="space-y-4">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Partner Logos (Text)</span>
                            {(landingConfig.partners.items || []).map((item, idx) => (
                              <div key={idx} className="flex gap-4">
                                <InputGroup value={item} onChange={(v: string) => {
                                  const newItems = [...(landingConfig.partners.items || [])];
                                  newItems[idx] = v;
                                  updateState(setLandingConfig, ['partners', 'items'], newItems);
                                }} />
                                <button onClick={() => removeItem(setLandingConfig, ['partners', 'items'], idx)} className="text-red-500 hover:bg-red-500/10 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                            <button onClick={() => addItem(setLandingConfig, ['partners', 'items'], "NEW_PARTNER")} className="text-maroon text-xs font-bold uppercase hover:underline">+ Add Partner</button>
                          </div>
                        </div>
                      )}

                      {activeLandingSection === 'features' && (
                        <div className="space-y-6">
                          <Toggle label="Section Visible" checked={landingConfig.features.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['features', 'isVisible'], v)} />
                          <InputGroup label="Title" value={landingConfig.features.title} onChange={(v: string) => updateState(setLandingConfig, ['features', 'title'], v)} />
                          <InputGroup label="Description" type="textarea" value={landingConfig.features.description} onChange={(v: string) => updateState(setLandingConfig, ['features', 'description'], v)} />

                          <div className="space-y-4 pt-6">
                            {(landingConfig.features.items || []).map((item, idx) => (
                              <AccordionItem key={idx} title={item.title || 'New Feature'} onDelete={() => removeItem(setLandingConfig, ['features', 'items'], idx)}>
                                <InputGroup label="Title" value={item.title} onChange={(v: string) => {
                                  const newItems = [...(landingConfig.features.items || [])];
                                  newItems[idx].title = v;
                                  updateState(setLandingConfig, ['features', 'items'], newItems);
                                }} />
                                <InputGroup label="Description" type="textarea" value={item.desc} onChange={(v: string) => {
                                  const newItems = [...(landingConfig.features.items || [])];
                                  newItems[idx].desc = v;
                                  updateState(setLandingConfig, ['features', 'items'], newItems);
                                }} />
                                <InputGroup label="Icon Name" value={item.icon} onChange={(v: string) => {
                                  const newItems = [...(landingConfig.features.items || [])];
                                  newItems[idx].icon = v;
                                  updateState(setLandingConfig, ['features', 'items'], newItems);
                                }} />
                              </AccordionItem>
                            ))}
                            <button onClick={() => addItem(setLandingConfig, ['features', 'items'], { title: "New Feature", desc: "Description", icon: "Box" })} className="btn-primary w-full py-3">+ Add Feature Card</button>
                          </div>
                        </div>
                      )}

                      {activeLandingSection === 'roadmap' && (
                        <div className="space-y-6">
                          <Toggle label="Section Visible" checked={landingConfig.roadmap.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['roadmap', 'isVisible'], v)} />
                          <InputGroup label="Title" value={landingConfig.roadmap.title} onChange={(v: string) => updateState(setLandingConfig, ['roadmap', 'title'], v)} />
                          <InputGroup label="Description" type="textarea" value={landingConfig.roadmap.description} onChange={(v: string) => updateState(setLandingConfig, ['roadmap', 'description'], v)} />

                          <div className="space-y-4 pt-6">
                            {landingConfig.roadmap.phases.map((phase, idx) => (
                              <AccordionItem key={idx} title={`Phase ${phase.phase}: ${phase.title}`} onDelete={() => removeItem(setLandingConfig, ['roadmap', 'phases'], idx)}>
                                <div className="grid grid-cols-2 gap-4">
                                  <InputGroup label="Phase Number" value={phase.phase} onChange={(v: string) => {
                                    const newPhases = [...landingConfig.roadmap.phases];
                                    newPhases[idx].phase = v;
                                    updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                                  }} />
                                  <InputGroup label="Status" value={phase.status} onChange={(v: string) => {
                                    const newPhases = [...landingConfig.roadmap.phases];
                                    newPhases[idx].status = v;
                                    updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                                  }} />
                                </div>
                                <InputGroup label="Title" value={phase.title} onChange={(v: string) => {
                                  const newPhases = [...landingConfig.roadmap.phases];
                                  newPhases[idx].title = v;
                                  updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                                }} />
                                <InputGroup label="Period" value={phase.period} onChange={(v: string) => {
                                  const newPhases = [...landingConfig.roadmap.phases];
                                  newPhases[idx].period = v;
                                  updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                                }} />
                                <InputGroup label="Description" type="textarea" value={phase.desc} onChange={(v: string) => {
                                  const newPhases = [...landingConfig.roadmap.phases];
                                  newPhases[idx].desc = v;
                                  updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                                }} />
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Features (Comma Separated)</span>
                                  <textarea
                                    className={INPUT_STYLES}
                                    value={phase.features.join(', ')}
                                    onChange={(e) => {
                                      const newPhases = [...landingConfig.roadmap.phases];
                                      newPhases[idx].features = e.target.value.split(',').map(s => s.trim());
                                      updateState(setLandingConfig, ['roadmap', 'phases'], newPhases);
                                    }}
                                  />
                                </div>
                              </AccordionItem>
                            ))}
                            <button onClick={() => addItem(setLandingConfig, ['roadmap', 'phases'], { phase: "04", title: "Future", period: "Q4 2026", status: "LOCKED", desc: "Desc", features: [] })} className="btn-primary w-full py-3">+ Add Roadmap Phase</button>
                          </div>
                        </div>
                      )}

                      {activeLandingSection === 'faq' && (
                        <div className="space-y-6">
                          <Toggle label="Section Visible" checked={landingConfig.faq.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['faq', 'isVisible'], v)} />
                          <InputGroup label="Title" value={landingConfig.faq.title} onChange={(v: string) => updateState(setLandingConfig, ['faq', 'title'], v)} />

                          <div className="space-y-4 pt-6">
                            {landingConfig.faq.items.map((item, idx) => (
                              <AccordionItem key={idx} title={item.q} onDelete={() => removeItem(setLandingConfig, ['faq', 'items'], idx)}>
                                <InputGroup label="Question" value={item.q} onChange={(v: string) => {
                                  const newItems = [...landingConfig.faq.items];
                                  newItems[idx].q = v;
                                  updateState(setLandingConfig, ['faq', 'items'], newItems);
                                }} />
                                <InputGroup label="Answer" type="textarea" value={item.a} onChange={(v: string) => {
                                  const newItems = [...landingConfig.faq.items];
                                  newItems[idx].a = v;
                                  updateState(setLandingConfig, ['faq', 'items'], newItems);
                                }} />
                              </AccordionItem>
                            ))}
                            <button onClick={() => addItem(setLandingConfig, ['faq', 'items'], { q: "New Question?", a: "Answer." })} className="btn-primary w-full py-3">+ Add FAQ Item</button>
                          </div>
                        </div>
                      )}

                      {activeLandingSection === 'cta' && (
                        <div className="space-y-6">
                          <Toggle label="Section Visible" checked={landingConfig.cta.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['cta', 'isVisible'], v)} />
                          <InputGroup label="Title" value={landingConfig.cta.title} onChange={(v: string) => updateState(setLandingConfig, ['cta', 'title'], v)} />
                          <InputGroup label="Description" type="textarea" value={landingConfig.cta.description} onChange={(v: string) => updateState(setLandingConfig, ['cta', 'description'], v)} />
                          <InputGroup label="Button Text" value={landingConfig.cta.buttonText} onChange={(v: string) => updateState(setLandingConfig, ['cta', 'buttonText'], v)} />
                        </div>
                      )}

                      {activeLandingSection === 'footer' && (
                        <div className="space-y-6">
                          <Toggle label="Section Visible" checked={landingConfig.footer.isVisible} onChange={(v: boolean) => updateState(setLandingConfig, ['footer', 'isVisible'], v)} />
                          <InputGroup label="Brand Name" value={landingConfig.footer.title} onChange={(v: string) => updateState(setLandingConfig, ['footer', 'title'], v)} />
                          <InputGroup label="Description" type="textarea" value={landingConfig.footer.description} onChange={(v: string) => updateState(setLandingConfig, ['footer', 'description'], v)} />
                          <InputGroup label="Copyright Text" value={landingConfig.footer.copyright} onChange={(v: string) => updateState(setLandingConfig, ['footer', 'copyright'], v)} />
                          <InputGroup label="Status Text" value={landingConfig.footer.statusText || ''} onChange={(v: string) => updateState(setLandingConfig, ['footer', 'statusText'], v)} />

                          <div className="space-y-4 pt-6">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Footer Columns</span>
                            {landingConfig.footer.columns?.map((col, cIdx) => (
                              <AccordionItem key={cIdx} title={`Column: ${col.title}`} onDelete={() => removeItem(setLandingConfig, ['footer', 'columns'], cIdx)}>
                                <InputGroup label="Column Title" value={col.title} onChange={(v: string) => {
                                  const newCols = [...landingConfig.footer.columns];
                                  newCols[cIdx].title = v;
                                  updateState(setLandingConfig, ['footer', 'columns'], newCols);
                                }} />

                                <div className="mt-4 space-y-3">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Links</span>
                                  {col.links?.map((link, lIdx) => (
                                    <div key={lIdx} className="grid grid-cols-2 gap-4 items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50 relative">
                                      <InputGroup label="Label" value={link.label} onChange={(v: string) => {
                                        const newCols = [...landingConfig.footer.columns];
                                        newCols[cIdx].links[lIdx].label = v;
                                        updateState(setLandingConfig, ['footer', 'columns'], newCols);
                                      }} />
                                      <InputGroup label="URL" value={link.url} onChange={(v: string) => {
                                        const newCols = [...landingConfig.footer.columns];
                                        newCols[cIdx].links[lIdx].url = v;
                                        updateState(setLandingConfig, ['footer', 'columns'], newCols);
                                      }} />
                                      <button onClick={() => {
                                        const newCols = [...landingConfig.footer.columns];
                                        newCols[cIdx].links = newCols[cIdx].links.filter((_, i) => i !== lIdx);
                                        updateState(setLandingConfig, ['footer', 'columns'], newCols);
                                      }} className="absolute -top-2 -right-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-1 rounded-full transition-colors"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  ))}
                                  <button onClick={() => {
                                    const newCols = [...landingConfig.footer.columns];
                                    if (!newCols[cIdx].links) newCols[cIdx].links = [];
                                    newCols[cIdx].links = [...newCols[cIdx].links, { label: 'New Link', url: '/' }];
                                    updateState(setLandingConfig, ['footer', 'columns'], newCols);
                                  }} className="text-[10px] text-maroon font-bold uppercase hover:underline">+ Add Link</button>
                                </div>
                              </AccordionItem>
                            ))}
                            <button onClick={() => addItem(setLandingConfig, ['footer', 'columns'], { title: "New Column", links: [] })} className="btn-primary w-full py-3">+ Add Column</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ARCHITECTURE CONFIG */}
                  {activeCmsPage === 'architecture' && (
                    <div className="space-y-8">
                      <SectionHeader title="Architecture Config" icon={Cpu} />
                      <InputGroup label="Hero Title" value={archConfig.heroTitle} onChange={(v: string) => updateState(setArchConfig, ['heroTitle'], v)} />
                      <InputGroup label="Hero Subtitle" type="textarea" value={archConfig.heroSubtitle} onChange={(v: string) => updateState(setArchConfig, ['heroSubtitle'], v)} />

                      <div className="space-y-4 pt-6">
                        <span className="text-xs font-bold text-zinc-500 uppercase">Tech Layers</span>
                        {(archConfig.layers || []).map((layer: any, idx: number) => (
                          <AccordionItem key={idx} title={layer.title} onDelete={() => removeItem(setArchConfig, ['layers'], idx)}>
                            <InputGroup label="Layer Title" value={layer.title} onChange={(v: string) => {
                              const newLayers = [...(archConfig.layers || [])];
                              newLayers[idx].title = v;
                              updateState(setArchConfig, ['layers'], newLayers);
                            }} />
                            <InputGroup label="Description" value={layer.desc} onChange={(v: string) => {
                              const newLayers = [...(archConfig.layers || [])];
                              newLayers[idx].desc = v;
                              updateState(setArchConfig, ['layers'], newLayers);
                            }} />
                            <InputGroup label="Statistic" value={layer.stat} onChange={(v: string) => {
                              const newLayers = [...(archConfig.layers || [])];
                              newLayers[idx].stat = v;
                              updateState(setArchConfig, ['layers'], newLayers);
                            }} />
                          </AccordionItem>
                        ))}
                        <button onClick={() => addItem(setArchConfig, ['layers'], { title: "New Layer", desc: "Description", stat: "100%" })} className="btn-primary w-full py-3">+ Add Layer</button>
                      </div>

                      <div className="space-y-4 pt-6">
                        <span className="text-xs font-bold text-zinc-500 uppercase">Features</span>
                        {archConfig.features.map((feat, idx) => (
                          <AccordionItem key={idx} title={feat.title} onDelete={() => removeItem(setArchConfig, ['features'], idx)}>
                            <InputGroup label="Feature Title" value={feat.title} onChange={(v: string) => {
                              const newFeats = [...archConfig.features];
                              newFeats[idx].title = v;
                              updateState(setArchConfig, ['features'], newFeats);
                            }} />
                            <InputGroup label="Description" value={feat.desc} onChange={(v: string) => {
                              const newFeats = [...archConfig.features];
                              newFeats[idx].desc = v;
                              updateState(setArchConfig, ['features'], newFeats);
                            }} />
                          </AccordionItem>
                        ))}
                        <button onClick={() => addItem(setArchConfig, ['features'], { title: "New Feature", desc: "Description" })} className="btn-primary w-full py-3">+ Add Feature</button>
                      </div>
                    </div>
                  )}

                  {/* ABOUT CONFIG */}
                  {activeCmsPage === 'about' && (
                    <div className="space-y-8">
                      <SectionHeader title="About Page Config" icon={Users} />
                      <InputGroup label="Main Title" value={aboutConfig.title} onChange={(v: string) => updateState(setAboutConfig, ['title'], v)} />
                      <InputGroup label="Subtitle" type="textarea" value={aboutConfig.subtitle} onChange={(v: string) => updateState(setAboutConfig, ['subtitle'], v)} />

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="p-6 silk-panel border-zinc-800 rounded-2xl space-y-4">
                          <span className="text-xs font-bold text-white uppercase flex items-center gap-2"><Target className="w-4 h-4" /> Mission</span>
                          <InputGroup label="Title" value={aboutConfig.mission.title} onChange={(v: string) => updateState(setAboutConfig, ['mission', 'title'], v)} />
                          <InputGroup label="Desc" type="textarea" value={aboutConfig.mission.desc} onChange={(v: string) => updateState(setAboutConfig, ['mission', 'desc'], v)} />
                        </div>
                        <div className="p-4 border border-zinc-800 rounded-xl space-y-4 bg-zinc-950/50">
                          <span className="text-xs font-bold text-white uppercase flex items-center gap-2"><Globe className="w-4 h-4" /> Vision</span>
                          <InputGroup label="Title" value={aboutConfig.vision.title} onChange={(v: string) => updateState(setAboutConfig, ['vision', 'title'], v)} />
                          <InputGroup label="Desc" type="textarea" value={aboutConfig.vision.desc} onChange={(v: string) => updateState(setAboutConfig, ['vision', 'desc'], v)} />
                        </div>
                        <div className="p-4 border border-zinc-800 rounded-xl space-y-4 bg-zinc-950/50">
                          <span className="text-xs font-bold text-white uppercase flex items-center gap-2"><Users className="w-4 h-4" /> Collective</span>
                          <InputGroup label="Title" value={aboutConfig.collective.title} onChange={(v: string) => updateState(setAboutConfig, ['collective', 'title'], v)} />
                          <InputGroup label="Desc" type="textarea" value={aboutConfig.collective.desc} onChange={(v: string) => updateState(setAboutConfig, ['collective', 'desc'], v)} />
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-zinc-800">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Strategic Partners List</span>
                        {aboutConfig.partners.map((partner, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <InputGroup value={partner} onChange={(v: string) => {
                              const newPartners = [...aboutConfig.partners];
                              newPartners[idx] = v;
                              updateState(setAboutConfig, ['partners'], newPartners);
                            }} />
                            <button onClick={() => removeItem(setAboutConfig, ['partners'], idx)} className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        ))}
                        <button onClick={() => addItem(setAboutConfig, ['partners'], "NEW_PARTNER")} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">+ Add Partner</button>
                      </div>
                    </div>
                  )}

                  {/* TOKENOMICS CONFIG */}
                  {activeCmsPage === 'tokenomics' && (
                    <div className="space-y-8">
                      <SectionHeader title="Tokenomics Config" icon={PieChart} />
                      <InputGroup label="Title" value={tokenomicsConfig.title} onChange={(v: string) => updateState(setTokenomicsConfig, ['title'], v)} />
                      <InputGroup label="Subtitle" type="textarea" value={tokenomicsConfig.subtitle} onChange={(v: string) => updateState(setTokenomicsConfig, ['subtitle'], v)} />
                      <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Total Supply" value={tokenomicsConfig.totalSupply} onChange={(v: string) => updateState(setTokenomicsConfig, ['totalSupply'], v)} />
                        <InputGroup label="Circulating Supply" value={tokenomicsConfig.circulatingSupply} onChange={(v: string) => updateState(setTokenomicsConfig, ['circulatingSupply'], v)} />
                      </div>

                      <div className="space-y-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Distribution Chart</span>
                        {(tokenomicsConfig.distribution || []).map((item, idx) => (
                          <div key={idx} className="grid grid-cols-4 gap-4 items-end">
                            <InputGroup label="Label" value={item.label} onChange={(v: string) => {
                              const newDist = [...(tokenomicsConfig.distribution || [])];
                              newDist[idx].label = v;
                              updateState(setTokenomicsConfig, ['distribution'], newDist);
                            }} />
                            <InputGroup label="Percentage" type="number" value={item.percentage} onChange={(v: number) => {
                              const newDist = [...(tokenomicsConfig.distribution || [])];
                              newDist[idx].percentage = v;
                              updateState(setTokenomicsConfig, ['distribution'], newDist);
                            }} />
                            <InputGroup label="Value Text" value={item.value} onChange={(v: string) => {
                              const newDist = [...(tokenomicsConfig.distribution || [])];
                              newDist[idx].value = v;
                              updateState(setTokenomicsConfig, ['distribution'], newDist);
                            }} />
                            <InputGroup label="Color Class" value={item.color} onChange={(v: string) => {
                              const newDist = [...(tokenomicsConfig.distribution || [])];
                              newDist[idx].color = v;
                              updateState(setTokenomicsConfig, ['distribution'], newDist);
                            }} />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Economic Analysis Sections</span>
                        {(tokenomicsConfig.sections || []).map((sec, idx) => (
                          <AccordionItem key={idx} title={sec.title} onDelete={() => removeItem(setTokenomicsConfig, ['sections'], idx)}>
                            <InputGroup label="Section Title" value={sec.title} onChange={(v: string) => {
                              const newSecs = [...(tokenomicsConfig.sections || [])];
                              newSecs[idx].title = v;
                              updateState(setTokenomicsConfig, ['sections'], newSecs);
                            }} />
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rich content</label>
                              <AdvancedEditor
                                content={sec.content}
                                onChange={(html) => {
                                  const newSecs = [...(tokenomicsConfig.sections || [])];
                                  newSecs[idx].content = html;
                                  updateState(setTokenomicsConfig, ['sections'], newSecs);
                                }}
                              />
                            </div>
                          </AccordionItem>
                        ))}
                        <button onClick={() => addItem(setTokenomicsConfig, ['sections'], { title: "New Analysis Section", content: "" })} className="btn-primary w-full py-3">+ Add Analysis Section</button>
                      </div>
                    </div>
                  )}

                  {/* WHITEPAPER CONFIG */}
                  {activeCmsPage === 'whitepaper' && (
                    <div className="space-y-8">
                      <SectionHeader title="Whitepaper Config" icon={FileText} />
                      {isPreviewMode ? (
                        <div className="silk-panel p-10 rounded-[3rem] border-zinc-900 bg-zinc-950 space-y-12">
                          <div className="space-y-4 border-b border-zinc-900 pb-10">
                            <p className="text-maroon font-mono font-black text-xs uppercase tracking-widest">{whitepaperConfig.version}</p>
                            <h1 className="text-5xl font-black text-white uppercase tracking-tighter">{whitepaperConfig.title}</h1>
                            <p className="text-zinc-500 text-lg italic">{whitepaperConfig.subtitle}</p>
                          </div>
                          <div className="space-y-16">
                            {whitepaperConfig.sections.map((sec, idx) => (
                              <div key={idx} className="space-y-6">
                                <h2 className="text-3xl font-black text-white flex items-center gap-4">
                                  <span className="text-sm font-mono text-maroon">[{String(idx + 1).padStart(2, '0')}]</span>
                                  {sec.title}
                                </h2>
                                <ContentRenderer html={sec.content} />
                                {sec.subsections?.map((sub, sIdx) => (
                                  <div key={sIdx} className="ml-10 pl-6 border-l border-maroon/20 space-y-4">
                                    <h3 className="text-xl font-bold text-zinc-200">{sub.title}</h3>
                                    <ContentRenderer html={sub.content} />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <InputGroup label="Title" value={whitepaperConfig.title} onChange={(v: string) => updateState(setWhitepaperConfig, ['title'], v)} />
                          <InputGroup label="Subtitle" value={whitepaperConfig.subtitle} onChange={(v: string) => updateState(setWhitepaperConfig, ['subtitle'], v)} />
                          <InputGroup label="Version" value={whitepaperConfig.version} onChange={(v: string) => updateState(setWhitepaperConfig, ['version'], v)} />

                          <div className="space-y-4 pt-6">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Document Sections</span>
                            {whitepaperConfig.sections.map((sec, idx) => (
                              <AccordionItem key={idx} title={sec.title} onDelete={() => removeItem(setWhitepaperConfig, ['sections'], idx)}>
                                <InputGroup label="Section Title" value={sec.title} onChange={(v: string) => {
                                  const newSecs = [...whitepaperConfig.sections];
                                  newSecs[idx].title = v;
                                  updateState(setWhitepaperConfig, ['sections'], newSecs);
                                }} />
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rich Content</label>
                                  <AdvancedEditor
                                    content={sec.content}
                                    onChange={(html) => {
                                      const newSecs = [...whitepaperConfig.sections];
                                      newSecs[idx].content = html;
                                      updateState(setWhitepaperConfig, ['sections'], newSecs);
                                    }}
                                  />
                                </div>

                                {/* Sub-sections UI */}
                                <div className="mt-8 pl-8 border-l border-zinc-800 space-y-6">
                                  <span className="text-[10px] font-black text-maroon uppercase tracking-widest">Sub-Sections</span>
                                  {sec.subsections?.map((sub, sIdx) => (
                                    <div key={sIdx} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900 relative">
                                      <button
                                        onClick={() => {
                                          const newSecs = [...whitepaperConfig.sections];
                                          newSecs[idx].subsections = newSecs[idx].subsections?.filter((_, i) => i !== sIdx);
                                          updateState(setWhitepaperConfig, ['sections'], newSecs);
                                        }}
                                        className="absolute top-4 right-4 text-zinc-700 hover:text-red-500"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                      <InputGroup
                                        label="Sub-heading"
                                        className="mb-4"
                                        value={sub.title}
                                        onChange={(v: string) => {
                                          const newSecs = [...whitepaperConfig.sections];
                                          if (newSecs[idx].subsections) newSecs[idx].subsections[sIdx].title = v;
                                          updateState(setWhitepaperConfig, ['sections'], newSecs);
                                        }}
                                      />
                                      <AdvancedEditor
                                        content={sub.content}
                                        onChange={(html) => {
                                          const newSecs = [...whitepaperConfig.sections];
                                          if (newSecs[idx].subsections) newSecs[idx].subsections[sIdx].content = html;
                                          updateState(setWhitepaperConfig, ['sections'], newSecs);
                                        }}
                                      />
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const newSecs = [...whitepaperConfig.sections];
                                      if (!newSecs[idx].subsections) newSecs[idx].subsections = [];
                                      newSecs[idx].subsections.push({ title: 'New Sub-section', content: '' });
                                      updateState(setWhitepaperConfig, ['sections'], newSecs);
                                    }}
                                    className="text-[10px] text-maroon font-bold uppercase hover:bg-maroon/5 px-4 py-2 rounded-lg border border-maroon/20"
                                  >
                                    + Add Sub-section
                                  </button>
                                </div>
                              </AccordionItem>
                            ))}
                            <button onClick={() => addItem(setWhitepaperConfig, ['sections'], { title: "New Section", content: "" })} className="btn-primary w-full py-3">+ Add Section</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* CAREERS CONFIG */}
                  {activeCmsPage === 'careers' && (
                    <div className="space-y-8">
                      <SectionHeader title="Careers Config" icon={Briefcase} />
                      <InputGroup label="Title" value={careersConfig.title} onChange={(v: string) => updateState(setCareersConfig, ['title'], v)} />
                      <InputGroup label="Subtitle" type="textarea" value={careersConfig.subtitle} onChange={(v: string) => updateState(setCareersConfig, ['subtitle'], v)} />

                      <div className="space-y-4 pt-6">
                        {careersConfig.positions.map((job, idx) => (
                          <AccordionItem key={idx} title={job.title} onDelete={() => removeItem(setCareersConfig, ['positions'], idx)}>
                            <div className="grid grid-cols-2 gap-4">
                              <InputGroup label="Job Title" value={job.title} onChange={(v: string) => {
                                const newPos = [...careersConfig.positions];
                                newPos[idx].title = v;
                                updateState(setCareersConfig, ['positions'], newPos);
                              }} />
                              <InputGroup label="Department" value={job.department} onChange={(v: string) => {
                                const newPos = [...careersConfig.positions];
                                newPos[idx].department = v;
                                updateState(setCareersConfig, ['positions'], newPos);
                              }} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <InputGroup label="Location" value={job.location} onChange={(v: string) => {
                                const newPos = [...careersConfig.positions];
                                newPos[idx].location = v;
                                updateState(setCareersConfig, ['positions'], newPos);
                              }} />
                              <InputGroup label="Type" value={job.type} onChange={(v: string) => {
                                const newPos = [...careersConfig.positions];
                                newPos[idx].type = v;
                                updateState(setCareersConfig, ['positions'], newPos);
                              }} />
                            </div>
                            <InputGroup label="Description" type="textarea" value={job.description} onChange={(v: string) => {
                              const newPos = [...careersConfig.positions];
                              newPos[idx].description = v;
                              updateState(setCareersConfig, ['positions'], newPos);
                            }} />
                          </AccordionItem>
                        ))}
                        <button onClick={() => addItem(setCareersConfig, ['positions'], { title: "New Job", department: "Engineering", location: "Remote", type: "Full-time", description: "Desc..." })} className="btn-primary w-full py-3">+ Add Position</button>
                      </div>
                    </div>
                  )}

                  {/* CONTACT CONFIG */}
                  {activeCmsPage === 'contact' && (
                    <div className="space-y-8">
                      <SectionHeader title="Contact Page Config" icon={Phone} />
                      <InputGroup label="Main Title" value={contactConfig.title} onChange={(v: string) => updateState(setContactConfig, ['title'], v)} />
                      <InputGroup label="Subtitle" type="textarea" value={contactConfig.subtitle} onChange={(v: string) => updateState(setContactConfig, ['subtitle'], v)} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Email Address" value={contactConfig.email} onChange={(v: string) => updateState(setContactConfig, ['email'], v)} />
                        <InputGroup label="Support Hours" value={contactConfig.supportHours} onChange={(v: string) => updateState(setContactConfig, ['supportHours'], v)} />
                      </div>
                      <InputGroup label="Physical Address" type="textarea" value={contactConfig.address} onChange={(v: string) => updateState(setContactConfig, ['address'], v)} />
                    </div>
                  )}

                  {/* TERMS CONFIG */}
                  {activeCmsPage === 'terms' && (
                    <div className="space-y-8">
                      <SectionHeader title="Terms of Service Config" icon={BookOpen} />
                      {isPreviewMode ? (
                        <div className="silk-panel p-10 rounded-[3rem] border-zinc-900 bg-zinc-950 space-y-12">
                          <div className="space-y-4 border-b border-zinc-900 pb-10">
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{termsConfig.title}</h1>
                            <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest">Last Updated: {termsConfig.lastUpdated}</p>
                          </div>
                          <div className="space-y-16">
                            {termsConfig.sections.map((sec, idx) => (
                              <div key={idx} className="space-y-6">
                                <h2 className="text-2xl font-black text-white flex items-center gap-4">
                                  <span className="text-xs font-mono text-maroon">[{String(idx + 1).padStart(2, '0')}]</span>
                                  {sec.heading}
                                </h2>
                                <ContentRenderer html={sec.content} />
                                {sec.subsections?.map((sub, sIdx) => (
                                  <div key={sIdx} className="ml-10 pl-6 border-l border-maroon/20 space-y-4">
                                    <h3 className="text-lg font-bold text-zinc-200">{sub.heading}</h3>
                                    <ContentRenderer html={sub.content} />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <InputGroup label="Page Title" value={termsConfig.title} onChange={(v: string) => updateState(setTermsConfig, ['title'], v)} />
                          <InputGroup label="Last Updated" value={termsConfig.lastUpdated} onChange={(v: string) => updateState(setTermsConfig, ['lastUpdated'], v)} />

                          <div className="space-y-4 pt-6">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Governance Clauses</span>
                            {termsConfig.sections.map((sec, idx) => (
                              <AccordionItem key={idx} title={sec.heading} onDelete={() => removeItem(setTermsConfig, ['sections'], idx)}>
                                <InputGroup label="Heading" value={sec.heading} onChange={(v: string) => {
                                  const newSecs = [...termsConfig.sections];
                                  newSecs[idx].heading = v;
                                  updateState(setTermsConfig, ['sections'], newSecs);
                                }} />
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rich content</label>
                                  <AdvancedEditor
                                    content={sec.content}
                                    onChange={(html) => {
                                      const newSecs = [...termsConfig.sections];
                                      newSecs[idx].content = html;
                                      updateState(setTermsConfig, ['sections'], newSecs);
                                    }}
                                  />
                                </div>

                                {/* Sub-sections UI */}
                                <div className="mt-8 pl-8 border-l border-zinc-800 space-y-6">
                                  <span className="text-[10px] font-black text-maroon uppercase tracking-widest">Nested Sub-sections</span>
                                  {sec.subsections?.map((sub, sIdx) => (
                                    <div key={sIdx} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900 relative">
                                      <button
                                        onClick={() => {
                                          const newSecs = [...termsConfig.sections];
                                          newSecs[idx].subsections = newSecs[idx].subsections?.filter((_, i) => i !== sIdx);
                                          updateState(setTermsConfig, ['sections'], newSecs);
                                        }}
                                        className="absolute top-4 right-4 text-zinc-700 hover:text-red-500"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                      <InputGroup
                                        label="Sub-heading"
                                        className="mb-4"
                                        value={sub.heading}
                                        onChange={(v: string) => {
                                          const newSecs = [...termsConfig.sections];
                                          if (newSecs[idx].subsections) newSecs[idx].subsections[sIdx].heading = v;
                                          updateState(setTermsConfig, ['sections'], newSecs);
                                        }}
                                      />
                                      <AdvancedEditor
                                        content={sub.content}
                                        onChange={(html) => {
                                          const newSecs = [...termsConfig.sections];
                                          if (newSecs[idx].subsections) newSecs[idx].subsections[sIdx].content = html;
                                          updateState(setTermsConfig, ['sections'], newSecs);
                                        }}
                                      />
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const newSecs = [...termsConfig.sections];
                                      if (!newSecs[idx].subsections) newSecs[idx].subsections = [];
                                      newSecs[idx].subsections.push({ heading: 'New Sub-clause', content: '' });
                                      updateState(setTermsConfig, ['sections'], newSecs);
                                    }}
                                    className="text-[10px] text-maroon font-bold uppercase hover:bg-maroon/5 px-4 py-2 rounded-lg border border-maroon/20"
                                  >
                                    + Add Sub-section
                                  </button>
                                </div>
                              </AccordionItem>
                            ))}
                            <button onClick={() => addItem(setTermsConfig, ['sections'], { heading: "New Clause", content: "" })} className="btn-primary w-full py-3">+ Add Clause</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* PRIVACY CONFIG */}
                  {activeCmsPage === 'privacy' && (
                    <div className="space-y-8">
                      <SectionHeader title="Privacy Policy Config" icon={Shield} />
                      {isPreviewMode ? (
                        <div className="silk-panel p-10 rounded-[3rem] border-zinc-900 bg-zinc-950 space-y-12">
                          <div className="space-y-4 border-b border-zinc-900 pb-10">
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{privacyConfig.title}</h1>
                            <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest">Last Updated: {privacyConfig.lastUpdated}</p>
                          </div>
                          <div className="space-y-16">
                            {privacyConfig.sections.map((sec, idx) => (
                              <div key={idx} className="space-y-6">
                                <h2 className="text-2xl font-black text-white flex items-center gap-4">
                                  <span className="text-xs font-mono text-emerald-500">[{String(idx + 1).padStart(2, '0')}]</span>
                                  {sec.heading}
                                </h2>
                                <ContentRenderer html={sec.content} />
                                {sec.subsections?.map((sub, sIdx) => (
                                  <div key={sIdx} className="ml-10 pl-6 border-l border-emerald-500/20 space-y-4">
                                    <h3 className="text-lg font-bold text-zinc-200">{sub.heading}</h3>
                                    <ContentRenderer html={sub.content} />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <InputGroup label="Page Title" value={privacyConfig.title} onChange={(v: string) => updateState(setPrivacyConfig, ['title'], v)} />
                          <InputGroup label="Last Updated" value={privacyConfig.lastUpdated} onChange={(v: string) => updateState(setPrivacyConfig, ['lastUpdated'], v)} />

                          <div className="space-y-4 pt-6">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Privacy Modules</span>
                            {privacyConfig.sections.map((sec, idx) => (
                              <AccordionItem key={idx} title={sec.heading} onDelete={() => removeItem(setPrivacyConfig, ['sections'], idx)}>
                                <InputGroup label="Heading" value={sec.heading} onChange={(v: string) => {
                                  const newSecs = [...privacyConfig.sections];
                                  newSecs[idx].heading = v;
                                  updateState(setPrivacyConfig, ['sections'], newSecs);
                                }} />
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rich content</label>
                                  <AdvancedEditor
                                    content={sec.content}
                                    onChange={(html) => {
                                      const newSecs = [...privacyConfig.sections];
                                      newSecs[idx].content = html;
                                      updateState(setPrivacyConfig, ['sections'], newSecs);
                                    }}
                                  />
                                </div>

                                {/* Sub-sections UI */}
                                <div className="mt-8 pl-8 border-l border-zinc-800 space-y-6">
                                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Nested Sub-sections</span>
                                  {sec.subsections?.map((sub, sIdx) => (
                                    <div key={sIdx} className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900 relative">
                                      <button
                                        onClick={() => {
                                          const newSecs = [...privacyConfig.sections];
                                          newSecs[idx].subsections = newSecs[idx].subsections?.filter((_, i) => i !== sIdx);
                                          updateState(setPrivacyConfig, ['sections'], newSecs);
                                        }}
                                        className="absolute top-4 right-4 text-zinc-700 hover:text-red-500"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                      <InputGroup
                                        label="Sub-heading"
                                        className="mb-4"
                                        value={sub.heading}
                                        onChange={(v: string) => {
                                          const newSecs = [...privacyConfig.sections];
                                          if (newSecs[idx].subsections) newSecs[idx].subsections[sIdx].heading = v;
                                          updateState(setPrivacyConfig, ['sections'], newSecs);
                                        }}
                                      />
                                      <AdvancedEditor
                                        content={sub.content}
                                        onChange={(html) => {
                                          const newSecs = [...privacyConfig.sections];
                                          if (newSecs[idx].subsections) newSecs[idx].subsections[sIdx].content = html;
                                          updateState(setPrivacyConfig, ['sections'], newSecs);
                                        }}
                                      />
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const newSecs = [...privacyConfig.sections];
                                      if (!newSecs[idx].subsections) newSecs[idx].subsections = [];
                                      newSecs[idx].subsections.push({ heading: 'New Sub-module', content: '' });
                                      updateState(setPrivacyConfig, ['sections'], newSecs);
                                    }}
                                    className="text-[10px] text-emerald-500 font-bold uppercase hover:bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/20"
                                  >
                                    + Add Sub-section
                                  </button>
                                </div>
                              </AccordionItem>
                            ))}
                            <button onClick={() => addItem(setPrivacyConfig, ['sections'], { heading: "New Module", content: "" })} className="btn-primary w-full py-3">+ Add Section</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminPanel;