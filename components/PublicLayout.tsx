
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Menu, X, ArrowUpRight } from 'lucide-react';
import { subscribeToLandingConfig, DEFAULT_LANDING_CONFIG } from '../services/firebase';
import { LandingConfig } from '../types';

const LOGO_SRC = "https://arguz.edgeone.app/A_20260217_132556_0001.png";
const logoStyle = {
    maskImage: `url(${LOGO_SRC})`,
    maskSize: 'contain',
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    WebkitMaskImage: `url(${LOGO_SRC})`,
    WebkitMaskSize: 'contain',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat: 'no-repeat',
};

// Custom Social Icons for better branding
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
  const { login } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [footerVisible, setFooterVisible] = useState(false);
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);

  useEffect(() => {
    const unsub = subscribeToLandingConfig(setLandingConfig);
    return () => unsub();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting) setFooterVisible(true);
      });
    }, { threshold: 0.1 });
    
    const footer = document.getElementById('main-footer');
    if(footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Architecture', path: '/architecture' },
    { label: 'Tokenomics', path: '/tokenomics' },
    { label: 'Whitepaper', path: '/whitepaper' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-primary selection:text-white font-sans scroll-smooth">
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-900 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 md:gap-4 z-50 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary/20 to-zinc-900 border border-primary/30 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.1)] group-hover:border-primary/50 transition-colors">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-primary" style={logoStyle} />
            </div>
            <div className="flex flex-col -space-y-0.5 md:-space-y-1">
              <span className="font-bold text-lg md:text-xl tracking-tight text-white group-hover:text-primary transition-colors">Argus<span className="text-zinc-500 group-hover:text-zinc-400">Protocol</span></span>
              <span className="text-[8px] md:text-[9px] font-mono text-primary/80 tracking-widest uppercase">Testnet_v2.8</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${location.pathname === item.path ? 'text-white' : 'text-zinc-500 hover:text-primary'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
             <button onClick={login} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all">
                Initialize Console
                <ChevronRight className="w-3 h-3" />
             </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden z-50 p-2 text-zinc-400 hover:text-white transition-colors" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        <div className={`fixed inset-0 bg-zinc-950/95 backdrop-blur-2xl z-40 flex flex-col items-center justify-center space-y-10 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col items-center gap-8 w-full px-8">
              {navLinks.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="text-2xl font-black uppercase tracking-tighter text-white hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="w-full px-8 pt-8 border-t border-zinc-900/50">
              <button 
                onClick={() => { login(); setIsMobileMenuOpen(false); }} 
                className="w-full px-8 py-5 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.3)] active:scale-95 transition-all"
              >
                Launch Console
              </button>
            </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer id="main-footer" className="border-t border-zinc-900 bg-zinc-950 pt-16 pb-8 px-6 relative overflow-hidden">
         {/* Footer Background Effect */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
         
         <div className={`max-w-7xl mx-auto transition-all duration-1000 ease-out ${footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
              
              {/* Brand Column */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary" style={logoStyle} />
                    <span className="text-xl font-black text-white tracking-tight uppercase">Argus Protocol</span>
                 </div>
                 <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
                   The institutional-grade infrastructure layer for the decentralized web. 
                   Powering high-frequency consensus and zero-touch node deployment.
                 </p>
                 <div className="flex gap-4 pt-2">
                   <a href={landingConfig.socials?.twitter || "#"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 transition-all duration-300 group">
                      <XIcon className="w-4 h-4" />
                   </a>
                   <a href={landingConfig.socials?.github || "#"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 transition-all duration-300 group">
                      <GithubIcon className="w-4 h-4" />
                   </a>
                   <a href={landingConfig.socials?.discord || "#"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 transition-all duration-300 group">
                      <DiscordIcon className="w-4 h-4" />
                   </a>
                 </div>
              </div>

              {/* Links Columns */}
              <div className="lg:col-span-1 space-y-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest border-b border-primary/20 pb-2 inline-block">Protocol</span>
                 <div className="flex flex-col gap-3">
                    {['Architecture', 'Tokenomics', 'Whitepaper'].map(link => (
                      <Link key={link} to={`/${link.toLowerCase()}`} className="text-xs text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group">
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link}
                      </Link>
                    ))}
                 </div>
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest border-b border-primary/20 pb-2 inline-block">Company</span>
                 <div className="flex flex-col gap-3">
                    {['About Us', 'Careers', 'Contact'].map(link => (
                      <Link key={link} to={`/${link.replace(' ', '').toLowerCase()}`} className="text-xs text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group">
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link}
                      </Link>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest border-b border-primary/20 pb-2 inline-block">Legal</span>
                 <div className="flex flex-col gap-3">
                    {['Terms of Service', 'Privacy Policy'].map(link => (
                      <Link key={link} to={`/${link.split(' ')[0].toLowerCase()}`} className="text-xs text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group">
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link}
                      </Link>
                    ))}
                 </div>
              </div>

           </div>

           <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <span className="text-[10px] text-zinc-600 font-mono font-medium">
                 {landingConfig.footer.copyright}
              </span>
              <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                 <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Mainnet Alpha: Operational</span>
              </div>
           </div>
         </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
