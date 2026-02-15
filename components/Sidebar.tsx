import React from 'react';
import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Trophy, 
  Hexagon, 
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../services/firebase';

const Sidebar = () => {
  const { user, firebaseUser, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  // Case-insensitive check for Admin access
  const isAuthorizedAdmin = firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const NavItem = ({ to, label, icon: Icon }: { to: string, label: string, icon: any }) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive(to) ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive(to) ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
      <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-between px-6 border-b border-zinc-900">
        <div className="flex items-center space-x-2">
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-black text-sm tracking-tighter uppercase italic">NexusNode</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 p-2">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900 transform transition-transform duration-300
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="mb-12 px-4">
            <div className="flex items-center space-x-2">
              <Hexagon className="w-6 h-6 text-primary" />
              <span className="font-black text-xl tracking-tighter text-white uppercase italic">NexusNode</span>
            </div>
            <p className="label-meta mt-1 opacity-40">Infrastructure v2.5</p>
          </div>

          <nav className="flex-1 space-y-1">
            <NavItem to="/" label="Dashboard" icon={LayoutDashboard} />
            <NavItem to="/tasks" label="Verification" icon={CheckSquare} />
            <NavItem to="/nft" label="Authority" icon={ShieldCheck} />
            <NavItem to="/referrals" label="Peer Network" icon={Users} />
            <NavItem to="/leaderboard" label="Protocol Rank" icon={Trophy} />
            
            {isAuthorizedAdmin && (
              <div className="pt-8 mt-8 border-t border-zinc-900">
                <p className="label-meta text-[8px] mb-4 text-primary px-4">Privileged Access</p>
                <NavItem to="/admin" label="Command Center" icon={Settings} />
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
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;