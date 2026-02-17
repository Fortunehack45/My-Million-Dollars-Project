
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

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.444-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
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

  const navLinks = [
    { label: 'Architecture', path: '/architecture' },
    { label: 'Whitepaper', path: '/whitepaper' },
    { label: 'Docs', path: '/docs' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-primary selection:text-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 md:gap-4 z-50">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary/20 to-zinc-900 border border-primary/30 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-primary" style={logoStyle} />
            </div>
            <div className="flex flex-col -space-y-0.5 md:-space-y-1">
              <span className="font-bold text-lg md:text-xl tracking-tight text-white">Argus<span className="text-zinc-500">Protocol</span></span>
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
          <button className="md:hidden z-50 p-2 text-zinc-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-zinc-950 z-40 flex flex-col items-center justify-center space-y-8 md:hidden">
            {navLinks.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-black uppercase tracking-widest text-white hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <button onClick={() => { login(); setIsMobileMenuOpen(false); }} className="mt-8 px-8 py-4 bg-primary text-white text-sm font-bold uppercase tracking-widest rounded">
              Launch Console
            </button>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer id="main-footer" className="border-t border-zinc-900 bg-zinc-950 pt-24 pb-12 px-6 relative overflow-hidden">
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
                   Powering high-frequency consensus and zero-touch node deployment for the next generation of finance.
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
                    {['Architecture', 'Whitepaper', 'Explorer', 'Tokenomics'].map(link => (
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
                    {['About Us', 'Careers', 'Brand Assets', 'Contact'].map(link => (
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
                    {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map(link => (
                      <Link key={link} to={`/${link.split(' ')[0].toLowerCase()}`} className="text-xs text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group">
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link}
                      </Link>
                    ))}
                 </div>
              </div>

           </div>

           <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
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
