import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-zinc-800 rounded-full"></div>
            <div className="absolute inset-0 w-12 h-12 border-2 border-maroon border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Authenticating Node</span>
            <span className="text-[8px] font-mono text-zinc-600 uppercase">SYS_INITIALIZE_SEQUENCE</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-maroon selection:text-white">
      <Sidebar />
      {/* 
        Layout Adjustment: 
        - md:pl-64 adds space for the fixed sidebar on desktop.
        - pt-20/pb-28 handles mobile header/footer spacing.
        - md:pt-0/md:pb-0 removes mobile spacing on desktop.
      */}
      {/* 
        Layout Adjustment: 
        - h-screen overflow-hidden on main wrapper for app feel.
        - md:pl-64 adds space for the fixed sidebar on desktop.
        - pt-20 handles mobile top header.
        - pb-32 handles mobile bottom bar clearance.
      */}
      <main className="flex-1 h-screen overflow-hidden w-full relative">
        <div className="h-full overflow-y-auto pt-16 pb-32 md:pt-0 md:pb-0 md:pl-64 custom-scrollbar">
          {/* Uniform Margin Container */}
          <div className="max-w-7xl mx-auto w-full px-4 py-6 md:px-12 md:py-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
