
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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../services/firebase';

// Extracted components to avoid inline component definition issues with TypeScript
// Added optional key to type definition to satisfy TypeScript strict property checking in loops
const DesktopNavItem = ({ to, label, icon: Icon, highlight = false }: { to: string, label: string, icon: any, highlight?: boolean, key?: React.Key }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'bg-zinc-900 text-white border border-zinc-800 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
          : highlight 
            ? 'text-primary hover:bg-primary/5' 
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive || highlight ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
      <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );
};

// Added optional key to type definition to satisfy TypeScript strict property checking in loops
const MobileNavItem = ({ to, label, icon: Icon }: { to: string, label: string, icon: any, key?: React.Key }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center space-y-1 w-full h-full relative group`}
    >
      {isActive && (
        <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_#f43f5e]"></div>
      )}
      <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
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
    { to: '/nft', label: 'Authority', icon: ShieldCheck },
    { to: '/referrals', label: 'Network', icon: Users },
    { to: '/leaderboard', label: 'Rank', icon: Trophy },
  ];

  return (
    <>
      {/* MOBILE: Top Header (Branding & Admin/Profile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-xl z-50 flex items-center justify-between px-6 border-b border-zinc-900">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
             <Hexagon className="w-4 h-4 text-primary" />
          </div>
          <span className="font-black text-sm tracking-tighter uppercase italic text-white">NexusNode</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthorizedAdmin && (
            <Link to="/admin" className="p-2 bg-primary/10 rounded-lg border border-primary/20 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-primary" />
            </Link>
          )}
          <button onClick={logout} className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE: Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-900 z-50 px-2 pb-safe safe-area-bottom">
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
      <div className={`hidden md:block fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-12 px-4">
            <div className="flex items-center space-x-2">
              <Hexagon className="w-6 h-6 text-primary" />
              <span className="font-black text-xl tracking-tighter text-white uppercase italic">NexusNode</span>
            </div>
            <p className="label-meta mt-1 opacity-40">Infrastructure v2.6</p>
          </div>

          <nav className="flex-1 space-y-1">
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
                <div className="flex items-center gap-2 px-4 mb-4">
                  <ShieldAlert className="w-3 h-3 text-primary animate-pulse" />
                  <p className="label-meta text-[8px] text-primary">Root Access</p>
                </div>
                <DesktopNavItem to="/admin" label="Command Center" icon={Settings} highlight={true} />
              </div>
            )}
          </nav>

          {user && (
            <div className="mt-auto pt-6 border-t border-zinc-900">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-900">
                <img src={user.photoURL || ''} className="w-8 h-8 rounded-lg grayscale border border-zinc-800" alt="" />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-white truncate">{user.displayName}</p>
                  <p className="label-meta text-[8px] text-zinc-500 uppercase">{isAuthorizedAdmin ? 'ROOT_ADMIN' : 'SYS_OP'}</p>
                </div>
              </div>
              <button onClick={logout} className="mt-4 flex items-center space-x-3 w-full px-4 py-2 text-zinc-600 hover:text-white transition-colors">
                <LogOut className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Terminate Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
