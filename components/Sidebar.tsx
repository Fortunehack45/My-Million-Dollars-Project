
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

const DesktopNavItem = ({ to, label, icon: Icon, highlight = false }: { to: string, label: string, icon: any, highlight?: boolean, key?: React.Key }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${
        isActive 
          ? 'bg-zinc-900/80 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
          : highlight 
            ? 'text-primary hover:bg-primary/5' 
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40'
      }`}
    >
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_#f43f5e]"></div>}
      
      <Icon className={`w-4 h-4 relative z-10 transition-colors duration-300 ${isActive || highlight ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">{label}</span>
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
        <div className="absolute top-0 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#f43f5e]"></div>
      )}
      <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
         <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
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
          <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center shadow-lg shadow-primary/5">
             <div className="w-5 h-5 bg-primary" style={logoStyle} />
          </div>
          <span className="font-black text-sm tracking-tighter uppercase italic text-white">Argus<span className="text-zinc-600">Protocol</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthorizedAdmin && (
            <Link to="/admin" className="p-2 bg-primary/10 rounded-lg border border-primary/20 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-primary" />
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
      <div className={`hidden md:block fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900`}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10 px-4 pt-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center shadow-xl shadow-black/50">
                 <div className="w-6 h-6 bg-primary drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={logoStyle} />
              </div>
              <div>
                <span className="block font-black text-lg tracking-tighter text-white uppercase italic leading-none">Argus</span>
                <span className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Protocol v2.0</span>
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
                  <ShieldAlert className="w-3 h-3 text-primary animate-pulse" />
                  <p className="label-meta text-[8px] text-primary">System Override</p>
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
                  <p className="text-[11px] font-bold text-white truncate group-hover:text-primary transition-colors">{user.displayName}</p>
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
