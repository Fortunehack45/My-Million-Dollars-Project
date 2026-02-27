
import React from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Trophy,
  Hexagon,
  LogOut,
  ShieldCheck,
  Settings,
  ShieldAlert,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL, subscribeToLockedPages } from '../services/firebase';
import Logo from './Logo';

const DesktopNavItem = ({ to, label, icon: Icon, highlight = false, isDisabled = false }: { to: string, label: string, icon: any, highlight?: boolean, isDisabled?: boolean, key?: React.Key }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={isDisabled ? '#' : to}
      onClick={isDisabled ? (e) => e.preventDefault() : undefined}
      className={`relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-500 group overflow-hidden ${isDisabled
        ? 'opacity-40 grayscale cursor-not-allowed pointer-events-none'
        : isActive
          ? 'bg-zinc-900/80 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-white/5'
          : highlight
            ? 'text-maroon hover:bg-maroon/5'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40'
        }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-maroon rounded-r-full shadow-[0_0_15px_#800000] animate-in slide-in-from-left-full duration-500"></div>
      )}

      <Icon className={`w-4 h-4 relative z-10 transition-all duration-500 ${isActive || highlight ? 'text-maroon scale-110' : 'text-zinc-600 group-hover:text-zinc-400 group-hover:scale-110'}`} />
      <span className={`text-[10px] font-bold uppercase tracking-widest relative z-10 transition-all duration-500 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>{label}</span>

      {/* Background glow on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-maroon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isActive ? 'hidden' : ''}`}></div>
    </Link>
  );
};

const MobileNavItem = ({ to, label, icon: Icon, isDisabled = false }: { to: string, label: string, icon: any, isDisabled?: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={isDisabled ? '#' : to}
      onClick={isDisabled ? (e) => e.preventDefault() : undefined}
      className={`flex flex-col items-center justify-center space-y-1 w-full h-full relative transition-all duration-300 ${isDisabled ? 'opacity-30 grayscale pointer-events-none' : isActive ? 'text-maroon' : 'text-zinc-600 hover:text-zinc-400'}`}
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
      <span className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-colors duration-300`}>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { user, firebaseUser, logout } = useAuth();
  const [lockedPages, setLockedPages] = React.useState<string[]>([]);

  React.useEffect(() => {
    const unsub = subscribeToLockedPages(setLockedPages);
    return () => unsub();
  }, []);

  // High-priority robust admin check
  const isAuthorizedAdmin =
    firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/nft', label: 'Mint', icon: CreditCard },
    { to: '/referrals', label: 'Network', icon: Users },
    { to: '/leaderboard', label: 'Rank', icon: Trophy },
  ];

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await logout();
    } catch (err) {
      console.error("Session termination failed:", err);
    }
  };

  return (
    <>
      {/* MOBILE: Top Header (Branding & Admin/Profile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-xl z-[100] flex items-center justify-between px-6 border-b border-zinc-900/80">
        <div className="flex items-center space-x-3 group/logo">
          <Logo className="w-8 h-8 text-maroon transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(128,0,0,0.5)]" />
          <span className="font-black text-[12px] text-white tracking-[0.2em] uppercase">Argus Protocol</span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthorizedAdmin && (
            <Link to="/admin" className="p-2 bg-maroon/10 rounded-lg border border-maroon/20 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-maroon" />
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE: Bottom Navigation Bar - Professional & Simple */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 z-[100] px-2">
        <div className="flex justify-around items-center h-full relative z-10">
          {navItems.map((item) => (
            <MobileNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              isDisabled={!isAuthorizedAdmin && lockedPages.includes(item.to)}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP: Sidebar Navigation */}
      <div className={`hidden md:block fixed inset-y-0 left-0 z-[100] w-64 bg-zinc-950 border-r border-zinc-900/50 transition-all duration-500`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-12 px-4 pt-4">
            <div className="flex items-center space-x-5 group/sidebar-logo">
              <div className="relative flex items-center justify-center group-hover/sidebar-logo:scale-110 transition-transform duration-700 ease-out-expo">
                <div className="absolute inset-0 bg-maroon/20 blur-xl opacity-0 group-hover/sidebar-logo:opacity-100 transition-opacity duration-700"></div>
                <Logo className="relative z-10 w-11 h-11 text-maroon drop-shadow-[0_0_15px_rgba(128,0,0,0.5)]" />
              </div>
              <div className="flex flex-col">
                <span className="block font-black text-xl text-white tracking-[-0.03em] leading-none uppercase group-hover/sidebar-logo:text-maroon transition-colors duration-500">Argus Protocol</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-1 h-1 bg-maroon rounded-full animate-pulse"></div>
                  <span className="block text-[8px] font-bold text-maroon/70 uppercase tracking-[0.4em]">Protocol_v2.8</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => (
              <DesktopNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                isDisabled={!isAuthorizedAdmin && lockedPages.includes(item.to)}
              />
            ))}

            <div className={`pt-8 mt-8 border-t border-zinc-900/50 transition-opacity duration-500 ${!isAuthorizedAdmin ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2 px-4 mb-4">
                <ShieldAlert className={`w-3 h-3 ${isAuthorizedAdmin ? 'text-maroon animate-pulse' : 'text-zinc-600'}`} />
                <p className={`label-meta text-[8px] uppercase tracking-widest ${isAuthorizedAdmin ? 'text-maroon' : 'text-zinc-600'}`}>
                  {isAuthorizedAdmin ? 'System Override' : 'Restricted_Access'}
                </p>
              </div>
              <DesktopNavItem
                to="/admin"
                label="Command Center"
                icon={Settings}
                highlight={isAuthorizedAdmin}
                isDisabled={!isAuthorizedAdmin}
                key="admin-nav"
              />
            </div>
          </nav>

          {user && (
            <div className="mt-auto pt-6 border-t border-zinc-900">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-colors cursor-default group">
                <div className="relative">
                  <img src={user.photoURL || ''} className="w-9 h-9 rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500 border border-zinc-800" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-zinc-950 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-maroon rounded-full animate-pulse shadow-[0_0_8px_#800000]"></div>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-white truncate group-hover:text-maroon transition-colors">{user.displayName}</p>
                  <p className="label-meta text-[8px] text-zinc-500 uppercase">{isAuthorizedAdmin ? 'ROOT_ADMIN' : 'NODE_OPERATOR'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20 rounded-xl text-zinc-500 hover:text-red-500 transition-all duration-300 group"
              >
                <LogOut className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Disconnect</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
