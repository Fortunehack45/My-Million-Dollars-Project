
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Menu, X, ArrowUpRight } from 'lucide-react';
import { subscribeToLandingConfig, DEFAULT_LANDING_CONFIG } from '../services/firebase';
import { LandingConfig } from '../types';

const LOGO_WORDMARK = "https://arguz.edgeone.app/A_20260217_132556_0002.png";
const LOGO_ICON = "https://arguz.edgeone.app/A_20260217_132556_0001.png";

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
    { label: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-primary selection:text-white font-sans scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-transform duration-500 group-hover:scale-110" style={{
              maskImage: `url(${LOGO_ICON})`,
              maskSize: '60%',
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
              WebkitMaskImage: `url(${LOGO_ICON})`,
              WebkitMaskSize: '60%',
              WebkitMaskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat',
            }} />
            <img src={LOGO_WORDMARK} alt="Argus" className="h-6 md:h-8 opacity-90 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === item.path ? 'text-primary' : 'text-zinc-500'}`}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={login} className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-all flex items-center gap-2">
              Authorize <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <button className="md:hidden p-2 text-zinc-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center space-y-10 md:hidden animate-fade-in">
            {navLinks.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-[0.2em] text-white"
              >
                {item.label}
              </Link>
            ))}
            <button onClick={() => { login(); setIsMobileMenuOpen(false); }} className="px-10 py-5 bg-primary text-white text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl">
              Establish Handshake
            </button>
          </div>
        )}
      </nav>

      <main className="flex-grow pt-20 md:pt-24">
        {children}
      </main>

      {/* Footer */}
      <footer id="main-footer" className="border-t border-white/5 bg-black pt-24 pb-12 px-6">
         <div className={`max-w-7xl mx-auto transition-all duration-1000 ${footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="md:col-span-2 space-y-8">
                 <img src={LOGO_WORDMARK} alt="Argus" className="h-8 opacity-80" />
                 <p className="text-sm text-zinc-500 leading-relaxed max-w-sm font-medium">
                   The high-velocity parallel layer for institutional consensus. 
                   Zero-Ops infrastructure for the sovereign internet.
                 </p>
              </div>
              <div className="space-y-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Protocol</span>
                 <div className="flex flex-col gap-4">
                    {['Architecture', 'Whitepaper', 'Tokenomics'].map(link => (
                      <Link key={link} to={`/${link.toLowerCase()}`} className="text-xs text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group">
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link}
                      </Link>
                    ))}
                 </div>
              </div>
              <div className="space-y-6">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Compliance</span>
                 <div className="flex flex-col gap-4">
                    {['Terms', 'Privacy', 'Cookie Policy'].map(link => (
                      <Link key={link} to={`/${link.split(' ')[0].toLowerCase()}`} className="text-xs text-zinc-500 hover:text-primary transition-colors flex items-center gap-2 group">
                         <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        {link}
                      </Link>
                    ))}
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">
                 {landingConfig.footer.copyright}
              </span>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-xl">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em]">Mainnet Alpha: Operational</span>
              </div>
           </div>
         </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
