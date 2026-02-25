import React from 'react';
import { useLocation, Link, Navigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL, subscribeToLockedPages } from '../services/firebase';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [lockedPages, setLockedPages] = React.useState<string[]>([]);

  React.useEffect(() => {
    const unsub = subscribeToLockedPages(setLockedPages);
    return () => unsub();
  }, []);

  const isAuthorizedAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isLocked = lockedPages.includes(location.pathname) && !isAuthorizedAdmin;

  if (isLocked) {
    return <Navigate to="/" replace />;
  }

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

      <main className="flex-1 h-screen overflow-hidden w-full relative">

        <div className="h-full overflow-y-auto custom-scrollbar pt-16 pb-32 md:pt-0 md:pb-0 md:pl-64">
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
