
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router';
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
  subscribeToActiveMinerCount,
  subscribeToLockedPages,
  updateLockedPages,
  subscribeToAllTransactions
} from '../services/firebase';
import {
  User, Task, NetworkStats, LandingConfig,
  LegalConfig, AboutConfig, WhitepaperConfig, ArchitecturePageConfig, TokenomicsConfig, CareersConfig, ContactConfig, ContactMessage, WalletTx
} from '../types';
import {
  Users, PlusCircle, Database, ShieldAlert, Cpu,
  Radio, Trash2, Globe, Layout, Save, X, Menu,
  BookOpen, FileText, Info, Zap, Activity,
  Layers, AlignLeft, CheckCircle2, Shield, MapPin,
  Briefcase, Phone, HelpCircle, Share2, PieChart,
  ListPlus, ChevronDown, ChevronRight, Settings,
  Target, RefreshCw, MessageSquare, Maximize, Minimize,
  Search, History, ExternalLink, Wallet, TrendingUp, Copy, ArrowDownLeft, ArrowUpRight
} from 'lucide-react';
import { ArgusLogo } from '../components/ArgusLogo';
import { EthLogo } from '../components/EthLogo';
import { AdvancedEditor } from '../components/AdvancedEditor';
import { ContentRenderer } from '../components/ContentRenderer';

// --- Helper Components ---

const INPUT_STYLES = "w-full bg-zinc-950/40 border border-zinc-900 text-zinc-200 p-4 rounded-2xl focus:border-maroon/40 focus:bg-zinc-900/60 focus:shadow-[0_0_20px_rgba(128,0,0,0.1)] outline-none transition-all text-xs font-mono placeholder:text-zinc-800 shadow-inner";

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "", className = "" }: any) => (
  <div className={`space-y-3 w-full ${className}`}>
    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">{label}</label>
    {type === 'textarea' ? (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={`${INPUT_STYLES} min-h-[120px] resize-y leading-relaxed`}
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
  <div 
    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-zinc-950/20 rounded-[1.5rem] border border-zinc-900/50 hover:border-maroon/20 hover:bg-zinc-900/30 transition-all cursor-pointer shadow-sm mb-4" 
    onClick={() => onChange(!checked)}
  >
    <div className="mb-4 sm:mb-0">
      <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em] group-hover:text-zinc-300 transition-colors">{label}</span>
      <p className="text-[9px] text-zinc-700 font-mono mt-1 opacity-60">Status: {checked ? 'SYNC_ACTIVE' : 'SYNC_DISABLED'}</p>
    </div>
    <button
      type="button"
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 ${checked ? 'bg-maroon shadow-[0_0_15px_rgba(128,0,0,0.3)]' : 'bg-zinc-800'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-all duration-500 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SectionHeader = ({ title, icon: Icon, description }: any) => (
  <div className="mb-12 border-b border-zinc-900 pb-10 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 blur-[80px] rounded-full pointer-events-none"></div>
    <div className="flex items-center gap-5 relative z-10">
      <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-900 flex items-center justify-center shadow-2xl group transition-all duration-500 hover:border-maroon/30">
        <Icon className="w-8 h-8 text-maroon group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{title}</h2>
        {description && <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.25em] mt-3 opacity-60">{description}</p>}
      </div>
    </div>
  </div>
);

const AccordionItem = ({ title, children, isOpen, onToggle, icon: Icon }: any) => (
  <div className="mb-6 rounded-[2rem] border border-zinc-900/50 bg-zinc-950/20 shadow-2xl overflow-hidden transition-all duration-700 hover:border-maroon/20">
    <button
      onClick={onToggle}
      className="w-full px-10 py-8 flex items-center justify-between group bg-zinc-950/20"
    >
      <div className="flex items-center gap-6">
        {Icon && <Icon className="w-5 h-5 text-zinc-500 group-hover:text-maroon transition-colors duration-500" />}
        <span className="text-[11px] font-black text-white uppercase tracking-[0.25em] italic">{title}</span>
      </div>
      <div className={`p-2 rounded-xl transition-all duration-700 ${isOpen ? 'bg-maroon/10 text-maroon rotate-180' : 'bg-zinc-900 text-zinc-600 group-hover:text-white'}`}>
        <ChevronDown className="w-4 h-4" />
      </div>
    </button>
    <div className={`transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
      <div className="p-10 border-t border-zinc-900/50 bg-gradient-to-b from-white/[0.01] to-transparent">
        {children}
      </div>
    </div>
  </div>
);

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
  const navigate = useNavigate();

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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cms' | 'locks' | 'messages' | 'explorer'>('dashboard');
  const [lockedPages, setLockedPages] = useState<string[]>([]);
  const [allTransactions, setAllTransactions] = useState<WalletTx[]>([]);
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [selectedAdminTx, setSelectedAdminTx] = useState<WalletTx | null>(null);
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [explorerView, setExplorerView] = useState<'ledger' | 'directory'>('ledger');
  const [selectedAddressView, setSelectedAddressView] = useState<string | null>(null);
  const [activeCmsPage, setActiveCmsPage] = useState<'landing' | 'about' | 'architecture' | 'whitepaper' | 'tokenomics' | 'careers' | 'contact' | 'terms' | 'privacy' | 'faq' | 'terminal'>('landing');
  const [activeLandingSection, setActiveLandingSection] = useState<string>('hero');
  const [cmsStatus, setCmsStatus] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // New CMS Accordion State
  const [cmsAccordions, setCmsAccordions] = useState<Record<string, boolean>>({
    hero: false, socials: false, partners: false, features: false, roadmap: false, faq: false, cta: false, footer: false,
    about: false, arch: false, whitepaper: false, tokenomics: false, careers: false, contact: false, terms: false, privacy: false
  });

  // Local state for landing config to manage changes before saving
  const [localLandingData, setLocalLandingData] = useState<any>(landingConfig);
  useEffect(() => {
    setLocalLandingData(landingConfig);
  }, [landingConfig]);

  const updateLandingData = (key: string, value: any) => {
    setLocalLandingData((prev: any) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };


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
    const unsubTx = subscribeToAllTransactions((txs) => {
      setAllTransactions(txs);
      const totalGas = txs.reduce((acc, tx) => acc + (tx.gasFee || 0), 0);
      setTreasuryBalance(totalGas);
    });

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
    const unsubLocks = subscribeToLockedPages(setLockedPages);

    return () => {
      unsubUsers(); unsubStats(); unsubOnline(); unsubMiners(); unsubTasks();
      unsubLanding(); unsubAbout(); unsubArch(); unsubWhitepaper(); unsubTokenomics();
      unsubCareers(); unsubContact(); unsubTerms(); unsubPrivacy(); unsubMessages();
      unsubLocks(); unsubTx();
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

  const handleToggleLock = (page: string) => {
    setLockedPages(prev =>
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveLocks = async () => {
    setCmsStatus('SAVING...');
    try {
      await updateLockedPages(lockedPages);
      setCmsStatus('SAVED');
      setHasUnsavedChanges(false);
      setTimeout(() => setCmsStatus(''), 2000);
    } catch (e) { setCmsStatus('ERROR'); }
  };

  const handleSaveCMS = async () => {
    try {
      setCmsStatus('UPLOADING_ARCHIVE...');
      const adminRef = doc(db, "admin", "config");
      
      // Sync local changes back to the main config object before saving
      const finalConfig = {
        ...landingConfig,
        ...localLandingData
      };
      
      await setDoc(adminRef, { landing: finalConfig }, { merge: true });
      setCmsStatus('REGISTRY_SYNC_COMPLETE');
      setHasUnsavedChanges(false);
      setTimeout(() => setCmsStatus(''), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setCmsStatus('SYNC_FAILURE_RETRY');
    }
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
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white selection:bg-maroon/30 relative">

      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-red-600/20 backdrop-blur-xl text-red-500 rounded-2xl shadow-2xl shadow-red-500/10 flex items-center justify-center border border-red-500/20 group hover:scale-105 transition-all active:scale-95"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[45] animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ONYX SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-zinc-950/60 backdrop-blur-[40px] border-r border-zinc-900/50 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col shrink-0 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-[20px_0_100px_rgba(0,0,0,0.8)]' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-zinc-900/30 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center gap-4 group cursor-pointer mb-8" onClick={() => navigate('/')}>
            <div className="w-14 h-14 bg-zinc-950 rounded-2xl border border-zinc-900 flex items-center justify-center transition-all duration-500 group-hover:border-maroon/40 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ArgusLogo className="w-9 h-9 text-maroon transition-transform duration-700 group-hover:scale-110 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic">Argus_Lab</h1>
              <p className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-[0.2em] mt-2 opacity-60">System_Control_v4</p>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-xl text-zinc-500 hover:text-white hover:border-maroon/50 hover:bg-maroon/5 transition-all group shadow-inner"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Return</span>
            </Link>
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(err => console.error(err));
                  setIsFullscreen(true);
                } else {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                    setIsFullscreen(false);
                  }
                }
              }}
              className="flex items-center justify-center px-4 py-3 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-xl text-zinc-500 hover:text-white hover:border-maroon/50 hover:bg-maroon/5 transition-all group shadow-inner"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
          {/* Section 1: Operations */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] px-4 font-mono">Infrastructure</p>
            <div className="space-y-1.5 px-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative overflow-hidden ${activeTab === 'dashboard' ? 'bg-zinc-900 text-white shadow-2xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
              >
                {activeTab === 'dashboard' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-maroon rounded-full" />}
                <Activity className={`w-4 h-4 transition-colors duration-500 ${activeTab === 'dashboard' ? 'text-maroon' : 'text-zinc-800 group-hover:text-zinc-600'}`} />
                System Metrics
              </button>
              <button
                onClick={() => setActiveTab('explorer')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative overflow-hidden ${activeTab === 'explorer' ? 'bg-zinc-900 text-white shadow-2xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
              >
                {activeTab === 'explorer' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-full" />}
                <Database className={`w-4 h-4 transition-colors duration-500 ${activeTab === 'explorer' ? 'text-amber-500' : 'text-zinc-800 group-hover:text-zinc-600'}`} />
                Protocol Ledger
              </button>
            </div>
          </div>

          {/* Section 2: Comms */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] px-4 font-mono">Operations</p>
            <div className="space-y-1.5 px-2">
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative overflow-hidden ${activeTab === 'messages' ? 'bg-zinc-900 text-white shadow-2xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
              >
                {activeTab === 'messages' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-full" />}
                <MessageSquare className={`w-4 h-4 transition-colors duration-500 ${activeTab === 'messages' ? 'text-blue-500' : 'text-zinc-800 group-hover:text-zinc-600'}`} />
                Comms Intercept
              </button>
            </div>
          </div>

          {/* Section 3: Configuration */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] px-4 font-mono">Protocol_Sync</p>
            <div className="space-y-1.5 px-2">
              <button
                onClick={() => setActiveTab('cms')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative overflow-hidden ${activeTab === 'cms' ? 'bg-maroon text-white shadow-[0_10px_30px_rgba(128,0,0,0.3)] border border-maroon/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
              >
                <Layout className={`w-4 h-4 transition-colors duration-500 ${activeTab === 'cms' ? 'text-white' : 'text-zinc-800 group-hover:text-zinc-600'}`} />
                CMS Controller
              </button>
              <button
                onClick={() => setActiveTab('locks')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 group relative overflow-hidden ${activeTab === 'locks' ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)] border border-red-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
              >
                <Shield className={`w-4 h-4 transition-colors duration-500 ${activeTab === 'locks' ? 'text-white' : 'text-zinc-800 group-hover:text-red-500'}`} />
                Registry Locks
              </button>
            </div>
          </div>
        </nav>

        <div className="p-8 border-t border-zinc-900/30 bg-gradient-to-t from-white/[0.01] to-transparent space-y-6">
          {activeTab === 'cms' && (
            <div className="space-y-3">
              <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] border transition-all duration-700 ${isPreviewMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-zinc-950/50 border-zinc-900 text-zinc-600 hover:text-white hover:border-zinc-800'}`}>
                {isPreviewMode ? 'PREVIEW_MODE: RELATIVE' : 'INIT_LIVE_PREVIEW'}
              </button>
              <button onClick={handleSaveCMS} className={`w-full py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-700 ${hasUnsavedChanges ? 'bg-maroon text-white shadow-[0_15px_40px_rgba(128,0,0,0.4)] border border-maroon/30 scale-[1.02]' : 'bg-zinc-950/50 text-zinc-700 border border-zinc-900'}`}>
                {cmsStatus || (hasUnsavedChanges ? 'COMMIT_CHANGES' : 'REGISTRY_SYNCED')}
              </button>
            </div>
          )}
          {(activeTab === 'locks') && (
            <div className="space-y-3">
              <button onClick={handleSaveLocks} className={`w-full py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-700 ${hasUnsavedChanges ? 'bg-red-600 text-white shadow-[0_15px_40px_rgba(220,38,38,0.4)] border border-red-500/30 scale-[1.02]' : 'bg-zinc-950/50 text-zinc-700 border border-zinc-900'}`}>
                {cmsStatus || (hasUnsavedChanges ? 'DEPLOY_LOCKS' : 'PATH_RECORDS_SECURED')}
              </button>
            </div>
          )}
          <div className="pt-2 px-2 flex items-center justify-between">
            <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest">ID: {firebaseUser?.email?.split('@')[0].toUpperCase()}</p>
            <div className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse shadow-[0_0_8px_#800000]"></div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar bg-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(128,0,0,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-[1600px] mx-auto p-4 sm:p-8 lg:p-12 relative z-10 animate-fade-in-up">

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">

                  {/* Metrics Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-8 bg-zinc-950/40 rounded-[2.5rem] border border-zinc-900 shadow-2xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-700">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mb-4 font-mono">Total_Validators</p>
                      <div className="flex items-end justify-between">
                        <p className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-700 origin-left italic leading-none">{users.length.toLocaleString()}</p>
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
                          <Users className="w-5 h-5 text-zinc-600" />
                        </div>
                      </div>
                    </div>
                    <div className="p-8 bg-zinc-950/40 rounded-[2.5rem] border border-maroon/30 shadow-2xl relative overflow-hidden group hover:border-maroon/30 transition-all duration-700">
                      <div className="absolute inset-0 bg-gradient-to-br from-maroon/[0.03] to-transparent pointer-events-none"></div>
                      <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-maroon animate-pulse shadow-[0_0_15px_#800000]"></div>
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mb-4 font-mono">Active_Nodes</p>
                      <div className="flex items-end justify-between">
                        <p className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-700 origin-left italic leading-none">{activeMinerCount.toLocaleString()}</p>
                        <div className="w-10 h-10 bg-maroon/5 rounded-xl border border-maroon/20 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-maroon" />
                        </div>
                      </div>
                    </div>
                    <div className="p-8 bg-zinc-950/40 rounded-[2.5rem] border border-zinc-900 shadow-2xl relative overflow-hidden group hover:border-zinc-800 transition-all duration-700">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mb-4 font-mono">Registry_Units</p>
                      <div className="flex items-end justify-between">
                        <p className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-700 origin-left italic leading-none">{users.filter(u => u.ownedNFT).length.toLocaleString()}</p>
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-zinc-600" />
                        </div>
                      </div>
                    </div>
                    <div className="p-8 bg-zinc-950/40 rounded-[2.5rem] border border-amber-900/20 shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-700 bg-gradient-to-br from-amber-500/[0.01] to-transparent">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] to-transparent pointer-events-none"></div>
                      <div className="flex items-start justify-between mb-4">
                        <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.25em] font-mono">Cap_Delta</p>
                        <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg text-[8px] font-black animate-pulse border border-amber-500/20">LOW_LATENCY</span>
                      </div>
                      <p className="text-5xl font-black text-amber-500 group-hover:scale-110 transition-transform duration-700 origin-left italic leading-none">{Math.max(0, capInput - users.length).toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-600 mt-4 uppercase font-mono tracking-widest font-black opacity-60">Max_Registry: <span className="text-amber-500/80">{capInput.toLocaleString()}</span></p>
                    </div>
                  </div>

                  {/* User Directory */}
                  <div className="silk-panel p-10 rounded-[3rem] border-zinc-900/50 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-zinc-900 pb-10">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-900 flex items-center justify-center shadow-2xl group transition-all duration-500 hover:border-maroon/30">
                          <Users className="w-8 h-8 text-maroon group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Validator_Registry</h2>
                          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mt-3 opacity-60 font-mono">Index_Depth: {users.length} Canonical_Entities</p>
                        </div>
                      </div>
                      <div className="relative max-w-sm w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                        <input
                          type="text"
                          placeholder="Query_Registry_Address..."
                          className={`${INPUT_STYLES} pl-12`}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                          <tr className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] font-mono">
                            <th className="pb-4 px-6">Entity_ID</th>
                            <th className="pb-4 px-6 text-center">Status_Sync</th>
                            <th className="pb-4 px-6 text-right">Balance_Ledger</th>
                            <th className="pb-4 px-6 text-right hidden lg:table-cell">Topology_Depth</th>
                            <th className="pb-4 px-6 text-right">Directive</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/50">
                          {users.filter(u =>
                            (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.uid || '').toLowerCase().includes(searchQuery.toLowerCase())
                          ).map((u) => (
                            <tr key={u.uid} className="group transition-all duration-500">
                              <td className="py-5 px-6 bg-zinc-950/20 border-l border-y border-zinc-900/50 rounded-l-[1.5rem] group-hover:bg-zinc-900/40 group-hover:border-maroon/20 transition-all duration-500">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-zinc-950 rounded-xl border border-zinc-900 flex items-center justify-center overflow-hidden shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                                    {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-700 font-black text-sm italic">{u.displayName?.[0] || 'U'}</div>}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-white flex items-center gap-3 italic">
                                      {u.displayName}
                                      {u.role === 'admin' && <span className="text-[8px] bg-maroon/10 text-maroon px-2 py-0.5 rounded-full border border-maroon/20 font-black tracking-widest">SYS_ADMIN</span>}
                                    </p>
                                    <p className="text-[9px] text-zinc-600 font-mono lower tracking-tight opacity-60 mt-1">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 px-6 bg-zinc-950/20 border-y border-zinc-900/50 group-hover:bg-zinc-900/40 group-hover:border-maroon/20 transition-all duration-500">
                                <div className="flex justify-center">
                                  {u.miningActive ? (
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-maroon/[0.03] border border-maroon/20 rounded-full shadow-[0_0_20px_rgba(128,0,0,0.05)]">
                                      <div className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse"></div>
                                      <span className="text-[8px] font-black text-maroon uppercase tracking-[0.2em] font-mono">SYNC_ACTIVE</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900/40 border border-zinc-800/50 rounded-full">
                                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] font-mono">STANDBY</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-5 px-6 bg-zinc-950/20 border-y border-zinc-900/50 group-hover:bg-zinc-900/40 group-hover:border-maroon/20 transition-all duration-500 text-right">
                                <p className="text-sm font-mono font-black text-white italic tracking-tighter">{(u.points || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] text-zinc-600 not-italic">ARG</span></p>
                                <p className="text-[9px] text-zinc-700 font-mono tracking-tighter mt-1">≈ ${((u.points || 0) * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</p>
                              </td>
                              <td className="py-5 px-6 bg-zinc-950/20 border-y border-zinc-900/50 group-hover:bg-zinc-900/40 group-hover:border-maroon/20 transition-all duration-500 text-right hidden lg:table-cell">
                                <span className={`text-sm font-mono font-black ${u.referralCount > 0 ? 'text-maroon' : 'text-zinc-700'}`}>{u.referralCount || 0}</span>
                              </td>
                              <td className="py-5 px-6 bg-zinc-950/20 border-r border-y border-zinc-900/50 rounded-r-[1.5rem] group-hover:bg-zinc-900/40 group-hover:border-maroon/20 transition-all duration-500 text-right">
                                <div className="flex justify-end gap-3 px-2">
                                  <button
                                    onClick={() => {
                                      setActiveTab('explorer');
                                      setExplorerView('ledger');
                                      setSelectedAddressView(u.argAddress || u.ethAddress || '');
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-900 text-zinc-600 hover:text-amber-500 hover:border-amber-500/20 transition-all duration-500 shadow-xl"
                                    title="View Entity Ledger"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setIsManaging({ ...isManaging, [u.uid]: !isManaging[u.uid] })}
                                    className={`p-2.5 bg-zinc-950 rounded-xl border transition-all duration-500 shadow-xl ${isManaging[u.uid] ? 'border-maroon text-maroon bg-maroon/5' : 'border-zinc-900 text-zinc-600 hover:text-white hover:border-zinc-700'}`}
                                    title="Administrative Control"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteUserAction(u.uid, u.displayName || '')}
                                    className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-900 text-zinc-800 hover:text-red-500 hover:border-red-500/20 transition-all duration-500 shadow-xl"
                                    title="Revoke Path Access"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
                            <p className={`text-xs font-mono font-black ${users.length > 0 ? 'text-white' : 'text-white'} tracking-tighter`}>CRYPTO_WATCH_ACTIVE</p>
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
                                      <p className="text-xl font-mono font-black text-white/50">LOW_PROB</p>
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
                            <div className="w-20 h-20 bg-maroon/5 rounded-3xl border border-maroon/10 flex items-center justify-center mx-auto mb-6">
                              <CheckCircle2 className="w-8 h-8 text-maroon/40" />
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
                        const participantCount = users.filter(u => u.completedTasks?.includes(t.id)).length;
                        return (
                          <div key={t.id} className={`flex justify-between items-center p-4 bg-zinc-950/40 rounded-xl border border-zinc-900 group ${isExpired ? 'opacity-50' : ''}`}>
                            <div className="space-y-1">
                              <p className="text-white text-xs font-bold leading-tight">{t.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-maroon text-[9px] font-mono font-bold uppercase tracking-widest">{t.points} ARG</span>
                                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <Users className="w-2.5 h-2.5" /> {participantCount} Active
                                </span>
                              </div>
                              {isExpired && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">EXPIRED_SEQUENCE</p>}
                            </div>
                            <button onClick={() => deleteTask(t.id)} className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}          {activeTab === 'messages' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <SectionHeader title="Intercepted_Comms" icon={MessageSquare} description="Inbound data packets from global relay points" />
              
              <div className="silk-panel p-10 rounded-[3rem] border-zinc-900/50 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-zinc-900 pb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-zinc-950 rounded-2xl border border-zinc-900 flex items-center justify-center shadow-2xl group transition-all duration-500">
                      <MessageSquare className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Comms_Matrix</h2>
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mt-3 opacity-60 font-mono">Index_Depth: {messages.length} Data_Segments</p>
                    </div>
                  </div>
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                    <input
                      type="text"
                      placeholder="Query_Transmissions..."
                      className={`${INPUT_STYLES} pl-12`}
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
                                {msg.uid && <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[8px] font-mono text-white/50">AUTH</span>}
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
                                <span className={`px-2 py-1 text-[8px] font-black uppercase rounded-md border ${msg.status === 'resolved' ? 'bg-maroon/10 border-maroon/20 text-maroon' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                  {msg.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-right">
                              {msg.status === 'pending' ? (
                                <button
                                  onClick={() => updateMessageStatusAction(msg.id, 'resolved')}
                                  className="p-2 bg-maroon/5 border border-maroon/10 rounded-lg hover:bg-maroon/20 hover:border-maroon transition-silk text-maroon/50 hover:text-maroon"
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

          {/* Registry Locks View */}
          {activeTab === 'locks' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="silk-panel p-10 rounded-[2.5rem] border-zinc-900 bg-zinc-950/50">
                <div className="flex items-center gap-3 mb-8 border-b border-zinc-900 pb-6">
                  <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Registry Control Matrix</h2>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Status: {hasUnsavedChanges ? 'Awaiting_Commit' : 'Direct_Registry_Link'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { path: '/', label: 'Dashboard', desc: 'Main terminal for node operators' },
                    { path: '/vault', label: 'Vault', desc: 'Secure asset management and DEX interface' },
                    { path: '/tasks', label: 'Task Modules', desc: 'Social and technical verification tasks' },
                    { path: '/nft', label: 'Minting Engine', desc: 'NFT generation and acquisition' },
                    { path: '/referrals', label: 'Network Graph', desc: 'Referral tracking and topology' },
                    { path: '/leaderboard', label: 'Global Rankings', desc: 'Competitive leaderboard display' },
                    { path: '/architecture', label: 'Architecture Docs', desc: 'Technical protocol overview' },
                    { path: '/whitepaper', label: 'Whitepaper', desc: 'Core protocol specifications' },
                    { path: '/tokenomics', label: 'Economic Specs', desc: 'Token distribution and schedules' },
                    { path: '/about', label: 'About Us', desc: 'Organization background' },
                    { path: '/docs', label: 'Documentation', desc: 'Developer and user guides' },
                    { path: '/careers', label: 'Talent Acquisition', desc: 'Open positions within the lab' },
                    { path: '/contact', label: 'Comms Uplink', desc: 'Support and contact channels' },
                    { path: '/terms', label: 'Terms of Service', desc: 'Legal terms and conditions' },
                    { path: '/privacy', label: 'Privacy Policy', desc: 'Data handling policy' }
                  ].map((page) => (
                    <div key={page.path} className={`p-6 rounded-2xl border transition-all duration-500 ${lockedPages.includes(page.path) ? 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-500/5' : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${lockedPages.includes(page.path) ? 'bg-maroon shadow-[0_0_8px_#800000]' : 'bg-zinc-800'}`}></div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{page.label}</span>
                        </div>
                        <button
                          onClick={() => handleToggleLock(page.path)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedPages.includes(page.path) ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-zinc-800'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedPages.includes(page.path) ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-mono text-zinc-600 truncate">{page.path}</p>
                        <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors uppercase font-mono">{page.desc}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${lockedPages.includes(page.path) ? 'bg-maroon text-white animate-pulse' : 'bg-zinc-900 text-zinc-600'}`}>
                          {lockedPages.includes(page.path) ? 'SYS_LOCK_ACTIVE' : 'PATH_OPEN'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
                  <div className="flex gap-4">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white uppercase tracking-widest">Protocol Override Warning</p>
                      <p className="text-[11px] text-red-500/70 leading-relaxed font-mono uppercase">LOCKED PAGES ARE ONLY ACCESSIBLE BY AUTHORIZED INSTITUTIONAL ENTITIES. TERMINATING PATH ACCESS WILL REDIRECT ALL GENERAL TRAFFIC TO THE ROOT DOMAIN.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CMS View */}
          {activeTab === 'cms' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex flex-wrap gap-3 p-2 bg-zinc-950/40 rounded-[2rem] border border-zinc-900/50 w-fit backdrop-blur-3xl shadow-2xl">
                {[
                  { id: 'landing', label: 'Primary_Nexus', icon: Globe },
                  { id: 'whitepaper', label: 'Protocol_Spec', icon: FileText },
                  { id: 'faq', label: 'Support_Vectors', icon: HelpCircle },
                  { id: 'terminal', label: 'CLI_Runtime', icon: TerminalIcon },
                  { id: 'contact', label: 'Inbound_Relay', icon: Mail }
                ].map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setActiveCmsPage(page.id as any)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 group ${activeCmsPage === page.id ? 'bg-maroon text-white shadow-[0_10px_30px_rgba(128,0,0,0.3)]' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}
                  >
                    <page.icon className={`w-4 h-4 ${activeCmsPage === page.id ? 'text-white' : 'text-zinc-800 group-hover:text-zinc-600'}`} />
                    {page.label}
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                {activeCmsPage === 'landing' && (
                  <div className="space-y-10">
                    <SectionHeader title="System_Matrix" icon={Globe} description="Manage canonical landing surface and interface tokens" />
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                      {/* Hero Section */}
                      <AccordionItem title="Hero_Deployment" isOpen={cmsAccordions.hero} onToggle={() => setCmsAccordions(prev => ({ ...prev, hero: !prev.hero }))} icon={Zap}>
                        <div className="space-y-8">
                          <InputGroup label="Primary_Directive" value={localLandingData?.hero?.title || ''} onChange={(val: string) => updateLandingData('hero', { ...localLandingData?.hero, title: val })} />
                          <InputGroup label="Operational_Brief" type="textarea" value={localLandingData?.hero?.subtitle || ''} onChange={(val: string) => updateLandingData('hero', { ...localLandingData?.hero, subtitle: val })} />
                          <div className="grid grid-cols-2 gap-8">
                            <InputGroup label="Primary_Call" value={localLandingData?.hero?.ctaPrimary || ''} onChange={(val: string) => updateLandingData('hero', { ...localLandingData?.hero, ctaPrimary: val })} />
                            <InputGroup label="Secondary_Call" value={localLandingData?.hero?.ctaSecondary || ''} onChange={(val: string) => updateLandingData('hero', { ...localLandingData?.hero, ctaSecondary: val })} />
                          </div>
                          <Toggle label="Engage_Matrix_Overlay" checked={localLandingData?.hero?.isVisible !== false} onChange={(val: boolean) => updateLandingData('hero', { ...localLandingData?.hero, isVisible: val })} />
                        </div>
                      </AccordionItem>

                      {/* Features Section */}
                      <AccordionItem title="Feature_Arrays" isOpen={cmsAccordions.features} onToggle={() => setCmsAccordions(prev => ({ ...prev, features: !prev.features }))} icon={Cpu}>
                         <div className="space-y-8">
                           <InputGroup label="Module_Header" value={localLandingData?.features?.title || ''} onChange={(val: string) => updateLandingData('features', { ...localLandingData?.features, title: val })} />
                           <InputGroup label="Module_Descriptor" type="textarea" value={localLandingData?.features?.description || ''} onChange={(val: string) => updateLandingData('features', { ...localLandingData?.features, description: val })} />
                           <div className="pt-6 border-t border-zinc-900/50 space-y-4">
                             <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] font-mono">Data_Points</p>
                             {localLandingData?.features?.items?.map((item: any, idx: number) => (
                               <div key={idx} className="p-6 bg-zinc-950/40 rounded-2xl border border-zinc-900 group/item relative overflow-hidden">
                                 <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => {
                                       const newItems = [...(localLandingData?.features?.items || [])];
                                       newItems.splice(idx, 1);
                                       updateLandingData('features', { ...localLandingData?.features, items: newItems });
                                    }} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                 </div>
                                 <InputGroup label={`Entity_Idx_${idx + 1}`} value={item.title} onChange={(val: string) => {
                                   const newItems = [...(localLandingData?.features?.items || [])];
                                   newItems[idx] = { ...item, title: val };
                                   updateLandingData('features', { ...localLandingData?.features, items: newItems });
                                 }} />
                               </div>
                             ))}
                             <button onClick={() => {
                                const newItems = [...(localLandingData?.features?.items || []), { title: 'New_Module', desc: '', icon: 'Zap', isVisible: true }];
                                updateLandingData('features', { ...localLandingData?.features, items: newItems });
                             }} className="w-full py-4 bg-zinc-900/40 border border-zinc-800 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white hover:border-maroon/40 transition-all">+ Add_Node</button>
                           </div>
                         </div>
                      </AccordionItem>
                    </div>
                  </div>
                )}

                {activeCmsPage === 'terminal' && (
                  <div className="space-y-10">
                    <SectionHeader title="CLI_Configuration" icon={TerminalIcon} description="Update operational terminal text and environment flags" />
                    <div className=" silk-panel p-10 rounded-[3rem] border-zinc-900/50 bg-zinc-950/20 backdrop-blur-3xl space-y-8">
                       <InputGroup label="Startup_Signal" value={localLandingData?.terminal?.welcomeMsg || ''} onChange={(val: string) => updateLandingData('terminal', { ...localLandingData?.terminal, welcomeMsg: val })} />
                       <InputGroup label="System_Description" type="textarea" value={localLandingData?.terminal?.sysDescription || ''} onChange={(val: string) => updateLandingData('terminal', { ...localLandingData?.terminal, sysDescription: val })} />
                       <div className="grid grid-cols-2 gap-8">
                          <Toggle label="Enable_Diagnostic_Logs" checked={localLandingData?.terminal?.enableLogs !== false} onChange={(val: boolean) => updateLandingData('terminal', { ...localLandingData?.terminal, enableLogs: val })} />
                          <Toggle label="Enforce_Protocol_Alpha" checked={localLandingData?.terminal?.protocolAlpha === true} onChange={(val: boolean) => updateLandingData('terminal', { ...localLandingData?.terminal, protocolAlpha: val })} />
                       </div>
                    </div>
                  </div>
                )}

                {activeCmsPage === 'contact' && (
                  <div className="space-y-10">
                    <SectionHeader title="Relay_Endpoints" icon={Mail} description="Configure communication vectors and inbound routing" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-8 p-10 silk-panel rounded-[3rem] border-zinc-900/50">
                          <InputGroup label="Inbound_Subject" value={localLandingData?.contact?.title || ''} onChange={(val: string) => updateLandingData('contact', { ...localLandingData?.contact, title: val })} />
                          <InputGroup label="Route_Brief" type="textarea" value={localLandingData?.contact?.subtitle || ''} onChange={(val: string) => updateLandingData('contact', { ...localLandingData?.contact, subtitle: val })} />
                       </div>
                       <div className="space-y-8 p-10 silk-panel rounded-[3rem] border-zinc-900/50">
                          <InputGroup label="Global_Proxy" value={localLandingData?.contact?.address || ''} onChange={(val: string) => updateLandingData('contact', { ...localLandingData?.contact, address: val })} />
                          <InputGroup label="Operating_Hours" value={localLandingData?.contact?.supportHours || ''} onChange={(val: string) => updateLandingData('contact', { ...localLandingData?.contact, supportHours: val })} />
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'explorer' && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Explorer Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      <Database className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">ArgusScan_Ledger</h2>
                      <p className="text-[10px] text-zinc-500 font-mono tracking-[0.2em]">GLOBAL_TRANSACTION_ORBIT_OS</p>
                    </div>
                  </div>
                </div>

                {/* Treasury Card */}
                <div className="bg-zinc-950/80 p-6 rounded-[2rem] border border-amber-900/20 shadow-2xl relative overflow-hidden group min-w-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Protocol_Treasury</p>
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-white tracking-tighter">{treasuryBalance.toFixed(4)}</p>
                    <p className="text-xs font-black text-amber-500 mb-1.5 uppercase">ARG_Gas_Fees</p>
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-2 font-mono uppercase tracking-widest">Aggregate_Network_Revenue</p>
                </div>
              </div>

              {/* Explorer Search / Filter */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by TxID or Address..."
                  value={txSearchQuery}
                  onChange={(e) => {
                    setTxSearchQuery(e.target.value);
                    if (selectedAddressView) setSelectedAddressView(null);
                  }}
                  className="w-full bg-zinc-950/50 border border-zinc-900 text-sm p-5 pl-14 rounded-[1.5rem] focus:border-amber-500/30 outline-none transition-all font-mono"
                />
              </div>

              {(() => {
                let filtered = allTransactions;

                // 1) Address View Filtering
                if (selectedAddressView) {
                  filtered = filtered.filter(tx => tx.from === selectedAddressView || tx.to === selectedAddressView);
                }

                // 2) Search Query Filtering
                const q = txSearchQuery.toLowerCase();
                if (q) {
                  filtered = filtered.filter(tx =>
                    tx.txHash.toLowerCase().includes(q) ||
                    tx.from?.toLowerCase().includes(q) ||
                    tx.to?.toLowerCase().includes(q)
                  );
                }

                // Calculate Deep Address Metrics
                let argSent = 0, argReceived = 0, argGasSpent = 0;
                let ethSent = 0, ethReceived = 0;
                let firstActive = Infinity;
                let lastActive = 0;

                if (selectedAddressView) {
                  filtered.forEach(tx => {
                    const amt = Number(tx.amount) || 0;
                    const time = tx.createdAt;
                    if (time < firstActive) firstActive = time;
                    if (time > lastActive) lastActive = time;

                    if (tx.from?.toLowerCase() === selectedAddressView.toLowerCase()) {
                      if (tx.chain === 'ARG') {
                        argSent += amt;
                        argGasSpent += tx.gasFee || 0;
                      } else {
                        ethSent += amt;
                      }
                    } else if (tx.to?.toLowerCase() === selectedAddressView.toLowerCase()) {
                      if (tx.chain === 'ARG') {
                        argReceived += amt;
                      } else {
                        ethReceived += amt;
                      }
                    }
                  });
                }

                const netArg = Math.max(0, argReceived - argSent);
                const netEth = Math.max(0, ethReceived - ethSent);

                return (
                  <>
                    {/* Address Overview Dashboard - Etherscan Level */}
                    {selectedAddressView && (
                      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[1.5rem] p-6 animate-fade-in-up">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-900/50">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <Wallet className="w-5 h-5 text-zinc-400" />
                              <h3 className="text-sm font-black text-white uppercase tracking-widest">Address Overview</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-300 font-mono text-xs break-all">{selectedAddressView}</span>
                              <button onClick={() => navigator.clipboard.writeText(selectedAddressView)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                                <Copy className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                              </button>
                            </div>

                            {/* Owner Profile Linkage */}
                            {(() => {
                              const owner = users.find(u =>
                                u.argAddress?.toLowerCase() === selectedAddressView.toLowerCase() ||
                                u.ethAddress?.toLowerCase() === selectedAddressView.toLowerCase()
                              );
                              if (!owner) return null;
                              return (
                                <div className="mt-4 flex items-center gap-3 p-3 bg-maroon/5 border border-maroon/20 rounded-2xl animate-in slide-in-from-left duration-500">
                                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                    {owner.photoURL ? <img src={owner.photoURL} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-zinc-600">{(owner.displayName || 'U')[0]}</span>}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-black text-maroon uppercase tracking-widest mb-0.5">Verified Account Holder</p>
                                    <p className="text-xs font-bold text-white truncate">{owner.displayName || 'Anonymous User'}</p>
                                    <p className="text-[9px] text-zinc-500 font-mono truncate">{owner.email}</p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <button
                            onClick={() => { setSelectedAddressView(null); setTxSearchQuery(''); }}
                            className="shrink-0 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                          >
                            <X className="w-3 h-3" /> Close View
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Balances */}
                          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                            <div>
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><ArgusLogo className="w-3 h-3 text-maroon" /> Net Est. Balance (ARG)</p>
                              <p className="text-xl font-black text-white font-mono">{netArg.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xs text-zinc-500 font-sans tracking-wide">ARG</span></p>
                            </div>
                            <div className="pt-4 border-t border-zinc-900/50">
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><EthLogo className="w-3 h-3 text-blue-500" /> Net Est. Balance (ETH)</p>
                              <p className="textxl font-black text-white font-mono">{netEth.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xs text-zinc-500 font-sans tracking-wide">ETH</span></p>
                            </div>
                          </div>

                          {/* Volumes */}
                          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                            <div>
                              <p className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><ArrowDownLeft className="w-3 h-3" /> Total Received</p>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 font-mono">ARG</span><span className="text-zinc-200 font-mono font-bold">{argReceived.toLocaleString()}</span></div>
                                <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 font-mono">ETH</span><span className="text-zinc-200 font-mono font-bold">{ethReceived.toLocaleString()}</span></div>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-zinc-900/50">
                              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Total Sent</p>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 font-mono">ARG</span><span className="text-zinc-200 font-mono font-bold">{argSent.toLocaleString()}</span></div>
                                <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 font-mono">ETH</span><span className="text-zinc-200 font-mono font-bold">{ethSent.toLocaleString()}</span></div>
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Total Txs</span><span className="text-white font-mono font-bold">{filtered.length}</span></div>
                              <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Gas Spent</span><span className="text-zinc-300 font-mono">{argGasSpent.toFixed(4)} ARG</span></div>
                            </div>
                            <div className="pt-3 border-t border-zinc-900/50 space-y-3">
                              <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">First Tx</span><span className="text-zinc-400 font-mono text-[10px]">{firstActive !== Infinity ? new Date(firstActive).toLocaleDateString() : '—'}</span></div>
                              <div className="flex justify-between items-center text-xs"><span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Last Tx</span><span className="text-zinc-400 font-mono text-[10px]">{lastActive ? new Date(lastActive).toLocaleDateString() : '—'}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ledger / Directory View Toggle */}
                    {!selectedAddressView && (
                      <div className="flex justify-center mb-0">
                        <div className="inline-flex p-1 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-xl">
                          <button
                            onClick={() => setExplorerView('ledger')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${explorerView === 'ledger' ? 'bg-maroon text-white shadow-lg shadow-maroon/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            <History className="w-3.5 h-3.5" /> Ledger
                          </button>
                          <button
                            onClick={() => setExplorerView('directory')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${explorerView === 'directory' ? 'bg-maroon text-white shadow-lg shadow-maroon/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            <Users className="w-3.5 h-3.5" /> Addresses
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Transactions Table - Etherscan Style */}
                    <div className={`${explorerView === 'ledger' || selectedAddressView ? 'block' : 'hidden'} silk-panel rounded-[1.5rem] border-zinc-900 overflow-hidden shadow-2xl`}>
                      <div className="p-6 border-b border-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/30">
                        <div className="flex items-center gap-3">
                          <History className="w-4 h-4 text-zinc-500" />
                          <div>
                            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{selectedAddressView ? 'Address_Transactions' : 'Network_Transactions'}</h3>
                            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Showing {filtered.length} records</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live_Chain_Feed</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-zinc-900/30 border-b border-zinc-900/50">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Txn Hash</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Method</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Block</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Age</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">From</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">To</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">Value</th>
                              <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">Txn Fee</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/30 bg-zinc-950/20">
                            {filtered.map((tx) => {
                              const isArg = tx.chain === 'ARG';
                              const method = tx.type === 'SEND' ? 'Transfer' : tx.type;

                              // Copy helper inline
                              const copyToClipboard = (text: string) => {
                                navigator.clipboard.writeText(text);
                                // Could add a local toast here if needed
                              };

                              // Relative time helper
                              const getAge = (timestamp: number) => {
                                const seconds = Math.floor((Date.now() - timestamp) / 1000);
                                if (seconds < 60) return `${seconds}s ago`;
                                const minutes = Math.floor(seconds / 60);
                                if (minutes < 60) return `${minutes}m ago`;
                                const hours = Math.floor(minutes / 60);
                                if (hours < 24) return `${hours}h ago`;
                                return `${Math.floor(hours / 24)}d ago`;
                              };

                              return (
                                <tr key={tx.id} className="group hover:bg-zinc-900/30 transition-colors text-[11px] font-mono whitespace-nowrap">
                                  {/* Txn Hash - Clickable row */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedAdminTx(tx)}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${(tx.gasFee <= 0 && isArg) ? 'bg-red-500' :
                                        tx.status === 'CONFIRMED' ? 'bg-emerald-500' :
                                          tx.status === 'PENDING' ? 'bg-amber-500 animate-pulse' :
                                            'bg-red-500'
                                        }`}></span>
                                      <button
                                        onClick={() => copyToClipboard(tx.txHash)}
                                        className={`${isArg ? 'text-maroon/90 hover:text-maroon' : 'text-blue-400/90 hover:text-blue-400'} font-bold transition-colors flex items-center gap-1.5 group/copy`}
                                      >
                                        {tx.txHash.slice(0, 14)}...
                                        <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                      </button>
                                      {(tx.gasFee <= 0 && isArg) && (
                                        <span className="text-[7px] font-black text-red-500 border border-red-500/20 px-1 rounded animate-pulse">Zero_Gas_Fail</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Method */}
                                  <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded bg-zinc-900 text-zinc-300 text-[9px] border border-zinc-800 uppercase tracking-wider">
                                      {method}
                                    </span>
                                  </td>

                                  {/* Block (Mocked via timestamp for visual effect) */}
                                  <td className="px-6 py-4 text-zinc-400">
                                    <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors block">
                                      {Math.floor(tx.createdAt / 10000)}
                                    </span>
                                  </td>

                                  {/* Age */}
                                  <td className="px-6 py-4 text-zinc-400" title={new Date(tx.createdAt).toLocaleString()}>
                                    {getAge(tx.createdAt)}
                                  </td>

                                  {/* From */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 w-32">
                                      <button
                                        onClick={() => setSelectedAddressView(tx.from)}
                                        className="text-zinc-300 hover:text-white transition-colors truncate flex-1 text-left flex items-center justify-between group/copy"
                                        title={tx.from}
                                      >
                                        <span className="truncate hover:underline decoration-zinc-500 underline-offset-4">{tx.from}</span>
                                      </button>
                                      <button onClick={() => copyToClipboard(tx.from)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Copy className="w-3 h-3 text-zinc-600 hover:text-white shrink-0" />
                                      </button>
                                    </div>
                                  </td>

                                  {/* To */}
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 w-32">
                                      <span className="p-0.5 rounded bg-zinc-800/50 text-emerald-500 border border-emerald-500/20 shrink-0 mt-0.5">
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                      </span>
                                      <button
                                        onClick={() => setSelectedAddressView(tx.to)}
                                        className="text-zinc-300 hover:text-white transition-colors truncate flex-1 text-left flex items-center justify-between group/copy"
                                        title={tx.to}
                                      >
                                        <span className="truncate hover:underline decoration-zinc-500 underline-offset-4">{tx.to}</span>
                                      </button>
                                      <button onClick={() => copyToClipboard(tx.to)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Copy className="w-3 h-3 text-zinc-600 hover:text-white shrink-0" />
                                      </button>
                                    </div>
                                  </td>

                                  {/* Value */}
                                  <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-zinc-200">
                                      {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                      <span className={`ml-1 text-[9px] ${isArg ? 'text-maroon' : 'text-blue-500'}`}>{tx.chain}</span>
                                    </span>
                                  </td>

                                  {/* Txn Fee */}
                                  <td className="px-6 py-4 text-right">
                                    <span className="text-zinc-500">
                                      {tx.gasFee ? tx.gasFee.toFixed(4) : '0.0000'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}

                            {filtered.length === 0 && (
                              <tr>
                                <td colSpan={8} className="px-6 py-24 text-center">
                                  <div className="flex flex-col items-center gap-4 opacity-50">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                      <Search className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <div>
                                      <p className="text-[12px] font-bold text-white uppercase tracking-widest">No matching entries found</p>
                                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">For query "{txSearchQuery}" or selected address</p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Addresses Directory View */}
                    {explorerView === 'directory' && !selectedAddressView && (
                      <div className="silk-panel rounded-[1.5rem] border-zinc-900 overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-zinc-900/50 flex items-center justify-between bg-zinc-950/30">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-zinc-500" />
                            <div>
                              <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Protocol_Identity_Registry</h3>
                              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Tracking all active protocol nodes</p>
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-900/30 border-b border-zinc-900/50">
                              <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Address</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Associated User</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">ARG Volume</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">ETH Volume</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap text-center">Txs</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900/30 bg-zinc-950/20">
                              {(() => {
                                const addressMap = new Map<string, any>();
                                allTransactions.forEach(tx => {
                                  [tx.from, tx.to].forEach((addr, i) => {
                                    if (!addr) return;
                                    const key = addr.toLowerCase();
                                    if (!addressMap.has(key)) {
                                      addressMap.set(key, {
                                        raw: addr,
                                        argVol: 0,
                                        ethVol: 0,
                                        count: 0,
                                        owner: users.find(u => u.argAddress?.toLowerCase() === key || u.ethAddress?.toLowerCase() === key)
                                      });
                                    }
                                    const data = addressMap.get(key);
                                    data.count++;
                                    const amt = Number(tx.amount) || 0;
                                    if (tx.chain === 'ARG') data.argVol += amt;
                                    else data.ethVol += amt;
                                  });
                                });

                                let list = Array.from(addressMap.values());
                                if (txSearchQuery) {
                                  const q = txSearchQuery.toLowerCase();
                                  list = list.filter(a => a.raw.toLowerCase().includes(q) || a.owner?.displayName?.toLowerCase().includes(q) || a.owner?.email?.toLowerCase().includes(q));
                                }

                                if (list.length === 0) return (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center opacity-30">No addresses discovered in ledger</td>
                                  </tr>
                                );

                                return list.map(a => (
                                  <tr key={a.raw} className="group hover:bg-zinc-900/30 transition-colors text-[11px] font-mono whitespace-nowrap">
                                    <td className="px-6 py-4">
                                      <button onClick={() => setSelectedAddressView(a.raw)} className="text-zinc-300 hover:text-maroon transition-colors truncate max-w-[200px] block">
                                        {a.raw}
                                      </button>
                                    </td>
                                    <td className="px-6 py-4">
                                      {a.owner ? (
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-md bg-maroon/20 border border-maroon/20 flex items-center justify-center text-[8px] text-maroon font-black">
                                            {a.owner.displayName?.[0] || 'U'}
                                          </div>
                                          <div>
                                            <p className="text-white font-bold">{a.owner.displayName || 'User'}</p>
                                            <p className="text-[8px] text-zinc-600 font-sans tracking-tight leading-none">{a.owner.email}</p>
                                          </div>
                                        </div>
                                      ) : <span className="text-zinc-600">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-zinc-400">{a.argVol.toLocaleString()} ARG</td>
                                    <td className="px-6 py-4 text-right font-bold text-zinc-500">{a.ethVol.toLocaleString()} ETH</td>
                                    <td className="px-6 py-4 text-center">
                                      <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px]">{a.count}</span>
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div >
          )}

        </div >
      </main >

      {/* ── ArgusScan TX Detail Modal ── */}
      {selectedAdminTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedAdminTx(null)} />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Database className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-widest">Transaction Detail</h2>
                  <p className="text-[9px] text-zinc-600 font-mono mt-0.5">ArgusScan Ledger Record</p>
                </div>
              </div>
              <button onClick={() => setSelectedAdminTx(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
              <div className="text-center pb-4 border-b border-zinc-800">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Total Amount</p>
                <p className="text-4xl font-black text-white tabular-nums">
                  {Number(selectedAdminTx.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  <span className="text-sm text-zinc-500 ml-2">{selectedAdminTx.chain}</span>
                </p>
                <div className="mt-3 flex justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedAdminTx.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    selectedAdminTx.status === 'PENDING' ? 'bg-amber-500/10  text-amber-400  border-amber-500/20' :
                      'bg-red-500/10    text-red-400    border-red-500/20'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedAdminTx.status === 'CONFIRMED' ? 'bg-emerald-500' : selectedAdminTx.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                    {selectedAdminTx.status}
                  </span>
                </div>
              </div>
              {([
                { label: 'Date / Time', value: new Date(selectedAdminTx.createdAt).toLocaleString() },
                { label: 'Network', value: selectedAdminTx.chain === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet' },
                { label: 'Method', value: selectedAdminTx.type || 'TRANSFER' },
                { label: 'Block (est.)', value: `#${Math.floor(selectedAdminTx.createdAt / 10000).toLocaleString()}` },
                {
                  label: 'Latency', value: (() => {
                    const hashVal = selectedAdminTx.txHash.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                    if (selectedAdminTx.chain === 'ETH') return `${(12 + (hashVal % 34) + ((hashVal % 100) / 100)).toFixed(2)}s`;
                    return `${(45 + (hashVal % 800) + ((hashVal % 100) / 100)).toFixed(2)}ms`;
                  })()
                },
              ] as { label: string; value: string }[]).map(row => (
                <div key={row.label} className="flex justify-between items-center gap-4 text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">{row.label}</span>
                  <span className="text-zinc-200 font-mono">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-start gap-4 text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">From</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <button onClick={() => { setSelectedAddressView(selectedAdminTx.from); setSelectedAdminTx(null); }} className="text-zinc-300 hover:text-white font-mono break-all text-[10px] text-left hover:underline underline-offset-4 decoration-zinc-600">{selectedAdminTx.from}</button>
                  <button onClick={() => navigator.clipboard.writeText(selectedAdminTx.from)} className="shrink-0 p-1 hover:bg-zinc-800 rounded"><Copy className="w-3 h-3 text-zinc-600 hover:text-white" /></button>
                </div>
              </div>
              <div className="flex justify-between items-start gap-4 text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">To</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <button onClick={() => { setSelectedAddressView(selectedAdminTx.to); setSelectedAdminTx(null); }} className="text-zinc-300 hover:text-white font-mono break-all text-[10px] text-left hover:underline underline-offset-4 decoration-zinc-600">{selectedAdminTx.to}</button>
                  <button onClick={() => navigator.clipboard.writeText(selectedAdminTx.to)} className="shrink-0 p-1 hover:bg-zinc-800 rounded"><Copy className="w-3 h-3 text-zinc-600 hover:text-white" /></button>
                </div>
              </div>
              {selectedAdminTx.gasFee > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">Gas Fee</span>
                  <span className="text-zinc-300 font-mono">{selectedAdminTx.gasFee} ARG → Treasury</span>
                </div>
              )}
              <div className="pt-3 border-t border-zinc-800/60">
                <div className="flex justify-between items-start gap-4 text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">Tx Hash</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-zinc-600 font-mono break-all text-[10px]">{selectedAdminTx.txHash}</span>
                    <button onClick={() => navigator.clipboard.writeText(selectedAdminTx.txHash)} className="shrink-0"><Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-300" /></button>
                  </div>
                </div>
              </div>
              <p className="text-center text-[9px] text-zinc-700 font-mono uppercase tracking-widest pt-1">Argus Protocol — Immutable Ledger Record</p>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};
export default AdminPanel;
