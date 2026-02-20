
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
import { ADMIN_EMAIL } from '../services/firebase';
import Logo from './Logo';

const DesktopNavItem = ({ to, label, icon: Icon, highlight = false }: { to: string, label: string, icon: any, highlight?: boolean, key?: React.Key }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-500 group overflow-hidden ${isActive
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

const MobileNavItem = ({ to, label, icon: Icon }: { to: string, label: string, icon: any, key?: React.Key }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center space-y-1.5 w-full h-full relative group`}
    >
      {isActive && (
        <div className="absolute top-0 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#800000]"></div>
      )}
      <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-maroon/10' : 'bg-transparent'}`}>
        <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-maroon' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-zinc-600'}`}>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { user, firebaseUser, logout } = useAuth();

  // High-priority robust admin check
  const isAuthorizedAdmin =
    firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    user?.role === 'admin';

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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-xl z-50 flex items-center justify-between px-6 border-b border-zinc-900/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
            <Logo className="w-6 h-6 text-maroon" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Argus Protocol</span>
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

      {/* MOBILE: Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[5.5rem] bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-900 z-50 px-2 pb-safe safe-area-bottom">
        <div className="flex justify-around items-center h-full pb-2">
          {navItems.map((item) => (
            <MobileNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP: Sidebar Navigation */}
      <div className={`hidden md:block fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900/50 transition-all duration-500`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-12 px-4 pt-4">
            <div className="flex items-center space-x-5 group/sidebar-logo">
              <div className="relative w-12 h-12 bg-zinc-900 border border-white/5 flex items-center justify-center rounded-2xl shadow-2xl group-hover/sidebar-logo:border-maroon/50 group-hover/sidebar-logo:scale-110 transition-all duration-700 ease-out-expo">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-maroon/10 blur-xl opacity-0 group-hover/sidebar-logo:opacity-100 transition-opacity duration-700"></div>
                <Logo className="relative z-10 w-7 h-7 text-maroon drop-shadow-[0_0_10px_rgba(128,0,0,0.4)]" />
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
              />
            ))}

            {isAuthorizedAdmin && (
              <div className="pt-8 mt-8 border-t border-zinc-900/50">
                <div className="flex items-center gap-2 px-4 mb-4 opacity-80">
                  <ShieldAlert className="w-3 h-3 text-maroon animate-pulse" />
                  <p className="label-meta text-[8px] text-maroon">System Override</p>
                </div>
                <DesktopNavItem to="/admin" label="Command Center" icon={Settings} highlight={true} />
              </div>
            )}
          </nav>

          {user && (
            <div className="mt-auto pt-6 border-t border-zinc-900">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-colors cursor-default group">
                <div className="relative">
                  <img src={user.photoURL || ''} className="w-9 h-9 rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500 border border-zinc-800" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-zinc-950 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
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
