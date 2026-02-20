import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Menu, X, ArrowUpRight } from 'lucide-react';
import { subscribeToLandingConfig, DEFAULT_LANDING_CONFIG } from '../services/firebase';
import { LandingConfig } from '../types';
import Logo from './Logo';

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
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
      {/* Navbar - Slick Institutional Interface */}
      <nav className="fixed top-6 inset-x-0 z-[100] px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto">
          {/* Liquid Glass Island */}
          <div className="relative group/nav-island transition-all duration-700">
            {/* Liquid Glass Body */}
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-700 group-hover/nav-island:bg-zinc-950/70 group-hover/nav-island:border-white/20 group-hover/nav-island:shadow-[0_30px_70px_rgba(0,0,0,0.7)]"></div>

            {/* Inner Glow/Silk Effect */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none"></div>

            <div className="relative z-10 px-10 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-5 group/logo">
                <div className="relative w-12 h-12 bg-zinc-900 border border-white/5 flex items-center justify-center rounded-2xl shadow-2xl group-hover:border-maroon/50 group-hover:scale-110 transition-all duration-700 ease-out-expo">
                  <div className="absolute inset-0 bg-maroon/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <Logo className="relative z-10 w-7 h-7 text-maroon drop-shadow-[0_0_12px_rgba(128,0,0,0.6)]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base tracking-[-0.03em] text-white group-hover/logo:text-maroon transition-colors duration-500 uppercase">Argus Protocol</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-maroon rounded-full animate-pulse"></div>
                    <span className="text-[7px] font-mono font-black text-maroon/80 tracking-[0.5em] uppercase">Status:_Optimized</span>
                  </div>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-14">
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-[10px] font-black uppercase tracking-[0.35em] transition-all duration-500 relative py-2 group/link ${location.pathname === item.path ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'}`}
                  >
                    {item.label}
                    <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-maroon transition-all duration-700 rounded-full origin-left ${location.pathname === item.path ? 'scale-x-100 shadow-[0_0_15px_rgba(128,0,0,0.8)]' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-8">
                <button
                  onClick={handleConsoleClick}
                  className="hidden md:flex relative group/btn h-12 px-10 items-center gap-4 bg-zinc-900/50 border border-white/10 rounded-2xl hover:border-maroon/50 hover:bg-zinc-900 transition-all duration-700 overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-maroon/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700"></div>
                  <span className="relative z-10 text-[10px] font-black text-white uppercase tracking-[0.3em]">
                    Initialize_Console
                  </span>
                  <div className="relative z-10 w-6 h-6 rounded-lg bg-zinc-950 flex items-center justify-center border border-white/5 group-hover:bg-maroon group-hover:border-maroon transition-all duration-700 shadow-lg">
                    <ChevronRight className="w-3.5 h-3.5 text-maroon group-hover:text-white transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-xl text-zinc-400"
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

      <main className="flex-grow w-full relative z-10">
        {children}
      </main>

      {/* Footer - Professional Refinement */}
      <footer id="main-footer" className="bg-zinc-950 border-t border-zinc-900 pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-5 space-y-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800/50 flex items-center justify-center rounded-2xl shadow-xl group-hover:border-maroon/40 transition-all duration-500 relative overflow-hidden">
                  <Logo className="w-8 h-8 text-maroon" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight group-hover:text-maroon transition-colors duration-500">{landingConfig.footer.title}</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-medium">
                {landingConfig.footer.description}
              </p>
              <div className="flex gap-4">
                <a href={landingConfig.socials.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:bg-white hover:text-black transition-all"><XIcon className="w-4 h-4" /></a>
                <a href={landingConfig.socials.discord} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:bg-[#5865F2] hover:text-white transition-all"><DiscordIcon className="w-4 h-4" /></a>
                <a href={landingConfig.socials.github} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:bg-white hover:text-black transition-all"><GithubIcon className="w-4 h-4" /></a>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">Protocol</h4>
              <Link to="/docs" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Documentation</Link>
              <Link to="/architecture" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Architecture</Link>
              <Link to="/tokenomics" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Tokenomics</Link>
              <Link to="/whitepaper" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Whitepaper</Link>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">Organization</h4>
              <Link to="/about" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">About Us</Link>
              <Link to="/careers" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Careers</Link>
              <Link to="/contact" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Contact</Link>
              <a href="#" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Press Kit</a>
            </div>

            <div className="md:col-span-3 space-y-4">
              <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">Legal</h4>
              <Link to="/terms" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="block text-zinc-500 hover:text-maroon text-sm transition-colors">Privacy Policy</Link>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-600 text-xs">{landingConfig.footer.copyright}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
