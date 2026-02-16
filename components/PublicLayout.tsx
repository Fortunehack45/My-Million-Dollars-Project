import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Hexagon, ChevronRight, Menu, X, Terminal, Github, Twitter, Disc } from 'lucide-react';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { login } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Architecture', path: '/architecture' },
    { label: 'Validators', path: '/validators' },
    { label: 'Explorer', path: '/explorer' },
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
              <Hexagon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
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

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 pt-20 md:pt-24 pb-12 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-4 max-w-sm">
               <div className="flex items-center gap-2">
                  <Hexagon className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold text-white tracking-tight">Argus Protocol</span>
               </div>
               <p className="text-xs text-zinc-500 leading-relaxed">
                 The institutional-grade infrastructure layer for the decentralized web. 
                 Powering high-frequency consensus and zero-touch node deployment.
               </p>
               <div className="flex gap-4 pt-4">
                 <a href="#" className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                 <a href="#" className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
                 <a href="#" className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors"><Disc className="w-4 h-4" /></a>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-16">
               <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Protocol</span>
                  <Link to="/architecture" className="text-xs text-zinc-500 hover:text-primary transition-colors">Architecture</Link>
                  <Link to="/validators" className="text-xs text-zinc-500 hover:text-primary transition-colors">Validators</Link>
                  <Link to="/whitepaper" className="text-xs text-zinc-500 hover:text-primary transition-colors">Whitepaper</Link>
                  <Link to="/explorer" className="text-xs text-zinc-500 hover:text-primary transition-colors">Network Explorer</Link>
               </div>
               <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Company</span>
                  <Link to="/about" className="text-xs text-zinc-500 hover:text-primary transition-colors">About Us</Link>
                  <Link to="/terms" className="text-xs text-zinc-500 hover:text-primary transition-colors">Terms of Service</Link>
                  <Link to="/privacy" className="text-xs text-zinc-500 hover:text-primary transition-colors">Privacy Policy</Link>
               </div>
               <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Developers</span>
                  <Link to="/docs" className="text-xs text-zinc-500 hover:text-primary transition-colors">Documentation</Link>
                  <Link to="/docs" className="text-xs text-zinc-500 hover:text-primary transition-colors">API Reference</Link>
                  <Link to="/docs" className="text-xs text-zinc-500 hover:text-primary transition-colors">Status</Link>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <span className="text-[10px] text-zinc-700 font-mono">© 2026 ARGUS LABS. ALL RIGHTS RESERVED.</span>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Mainnet Alpha: Operational</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default PublicLayout;