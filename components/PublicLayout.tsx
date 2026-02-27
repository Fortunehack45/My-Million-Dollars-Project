import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Menu, X, ArrowUpRight } from 'lucide-react';
import { subscribeToLandingConfig, DEFAULT_LANDING_CONFIG } from '../services/firebase';
import { LandingConfig } from '../types';
import Logo from './Logo';
import LiquidGlassFilters from './LiquidGlassFilters';

// Custom Social Icons
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.65.7 1.03 1.59 1.03 2.68 0 3.84-2.33 4.66-4.56 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
);

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);

  useEffect(() => {
    const unsub = subscribeToLandingConfig(setLandingConfig);
    return () => unsub();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Docs', path: '/docs' },
    { label: 'Architecture', path: '/architecture' },
    { label: 'Tokenomics', path: '/tokenomics' },
    { label: 'Whitepaper', path: '/whitepaper' },
  ];

  const handleConsoleClick = () => {
    navigate('/login');
  };

  const handleMobileConsoleClick = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-maroon/30 selection:text-white font-sans scroll-smooth">
      <LiquidGlassFilters />
      <nav className="fixed top-0 inset-x-0 z-[100] px-6 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto">
          {/* Argus Institutional Nav-Island */}
          <div className="nav-glass rounded-2xl transition-all duration-700 hover:bg-black/60 group/nav shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="relative z-10 px-8 h-14 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-4 group/logo">
                <Logo className="w-7 h-7 text-maroon transition-all duration-700 group-hover/logo:scale-110 group-hover/logo:brightness-125" />
                <div className="flex flex-col">
                  <span className="font-black text-[10px] tracking-[0.3em] text-white uppercase leading-none group-hover/logo:text-maroon transition-colors duration-500">Argus Protocol</span>
                  <span className="text-[6px] font-bold text-zinc-600 uppercase tracking-[0.4em] mt-0.5 italic text-center">Institutional Intelligence</span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-10">
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500 relative py-1 px-1 group/item ${location.pathname === item.path ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                  >
                    {item.label}
                    <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-maroon transition-all duration-500 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover/item:w-full'}`}></span>
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleConsoleClick}
                  className="hidden md:flex h-9 px-6 items-center bg-white text-black text-[9px] font-black uppercase tracking-[0.1em] rounded-xl hover:bg-maroon hover:text-white transition-all duration-500 active:scale-95 shadow-lg"
                >
                  Access_Vault
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors flex items-center justify-center"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay - Institutional Fullscreen Slide */}
        <div
          className={`fixed inset-0 bg-zinc-950/95 backdrop-blur-3xl z-[140] flex flex-col pt-32 pb-12 px-8 transition-all duration-700 ease-out-quint will-change-transform ${isMobileMenuOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-[20px] opacity-0 pointer-events-none'
            }`}
        >
          <button
            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6 text-maroon" />
          </button>

          <div className="flex flex-col items-center gap-8 w-full">
            {navLinks.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ transitionDelay: `${index * 50 + 100}ms` }}
                className={`text-3xl font-black uppercase tracking-tighter text-white hover:text-maroon transition-all transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleMobileConsoleClick}
              className="mt-4 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-maroon hover:text-white transition-all w-full max-w-xs flex items-center justify-center gap-3 animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              Launch Console <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-auto flex flex-col items-center gap-6">
            <div className="flex gap-8">
              <a href={landingConfig.socials.twitter} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors"><XIcon className="w-6 h-6" /></a>
              <a href={landingConfig.socials.discord} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors"><DiscordIcon className="w-6 h-6" /></a>
              <a href={landingConfig.socials.github} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors"><GithubIcon className="w-6 h-6" /></a>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Argus Protocol v2.8</p>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full relative z-10 pt-24 md:pt-32">
        {children}
      </main>

      {/* Footer - Professional Refinement */}
      <footer id="main-footer" className="bg-zinc-950 border-t border-white/[0.02] pt-32 pb-16 relative z-10 overflow-hidden">
        {/* Deep Field Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-maroon/50 to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-64 bg-maroon/[0.03] blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 mb-32">
            <div className="md:col-span-12 lg:col-span-4 space-y-10">
              <Link to="/" className="inline-flex items-center gap-5 group">
                <div className="w-14 h-14 bg-zinc-950 border border-zinc-900 flex items-center justify-center rounded-2xl shadow-2xl group-hover:border-maroon/30 transition-all duration-700 relative overflow-hidden">
                  <Logo className="w-9 h-9 text-maroon" />
                  <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/[0.02] transition-colors"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-2xl text-white tracking-tight leading-none uppercase">Argus Protocol</span>
                  <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.5em] mt-1.5 font-mono italic">Institutional_Infrastructure</span>
                </div>
              </Link>

              <p className="text-zinc-500 text-[13px] leading-relaxed max-w-sm font-medium opacity-80">
                {landingConfig.footer?.description || DEFAULT_LANDING_CONFIG.footer.description}
              </p>

              <div className="flex gap-4">
                <a href={landingConfig.socials?.twitter || DEFAULT_LANDING_CONFIG.socials.twitter} target="_blank" rel="noreferrer" className="w-12 h-12 bg-zinc-900/50 border border-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-white hover:text-black hover:border-white transition-all duration-500 shadow-lg"><XIcon className="w-5 h-5" /></a>
                <a href={landingConfig.socials?.discord || DEFAULT_LANDING_CONFIG.socials.discord} target="_blank" rel="noreferrer" className="w-12 h-12 bg-zinc-900/50 border border-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-maroon hover:text-white hover:border-maroon transition-all duration-500 shadow-lg"><DiscordIcon className="w-5 h-5" /></a>
                <a href={landingConfig.socials?.github || DEFAULT_LANDING_CONFIG.socials.github} target="_blank" rel="noreferrer" className="w-12 h-12 bg-zinc-900/50 border border-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-white hover:text-black hover:border-white transition-all duration-500 shadow-lg"><GithubIcon className="w-5 h-5" /></a>
              </div>
            </div>

            <div className="md:col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-16">
              {(landingConfig.footer?.columns || DEFAULT_LANDING_CONFIG.footer.columns)?.map((col, idx) => (
                <div key={idx} className="space-y-8">
                  <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span className="w-1 h-3 bg-maroon rounded-full"></span>
                    {col.title}
                  </h4>
                  <ul className="space-y-5">
                    {col.links?.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link to={link.url} className="text-zinc-500 hover:text-white text-[13px] font-medium transition-all duration-300 flex items-center gap-3 group/link">
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-700 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 group-hover/link:text-maroon transition-all" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em]">{landingConfig.footer?.copyright || DEFAULT_LANDING_CONFIG.footer.copyright}</p>
              <div className="hidden md:block w-1 h-1 bg-zinc-800 rounded-full"></div>
              <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-[0.15em]">Institutional Infrastructure Access</p>
            </div>

            {(landingConfig.footer?.statusText || DEFAULT_LANDING_CONFIG.footer.statusText) && (
              <div className="flex items-center gap-4 px-6 py-2.5 bg-maroon/[0.03] border border-maroon/10 rounded-full cursor-default shadow-sm backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-maroon animate-pulse shadow-[0_0_12px_rgba(128,0,0,0.4)]"></div>
                <span className="text-[10px] font-mono font-black text-maroon/90 uppercase tracking-[0.25em]">{landingConfig.footer?.statusText || DEFAULT_LANDING_CONFIG.footer.statusText}</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
