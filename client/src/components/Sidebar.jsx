import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  BarChart2,
  Building2,
  Calendar,
  Notebook,
  Trophy,
  Users,
  LogOut,
  Flame,
  Menu,
  X,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Problems', icon: List, to: '/problems' },
  { label: 'Analytics', icon: BarChart2, to: '/analytics' },
  { label: 'Companies', icon: Building2, to: '/companies' },
  { label: 'Calendar', icon: Calendar, to: '/calendar' },
  { label: 'Notes', icon: Notebook, to: '/notes' },
  { label: 'Leaderboard', icon: Trophy, to: '/leaderboard' },
  { label: 'Friends', icon: Users, to: '/friends' },
];

export default function Sidebar({ streak = 0 }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#6C63FF]/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AT</span>
          </div>
          <span className="text-white font-semibold text-sm">AlgoTrack</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden text-slate-500 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-slate-600 text-[10px] uppercase tracking-widest px-3 mb-2">Overview</p>
        {navItems.slice(0, 3).map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <p className="text-slate-600 text-[10px] uppercase tracking-widest px-3 mb-2 mt-4">Prepare</p>
        {navItems.slice(3, 6).map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <p className="text-slate-600 text-[10px] uppercase tracking-widest px-3 mb-2 mt-4">Social</p>
        {navItems.slice(6).map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF] font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Streak */}
      <div className="mx-3 mb-3 bg-gradient-to-r from-[#00C896]/10 to-[#00C896]/5 border border-[#00C896]/20 rounded-xl p-3 text-center">
        <Flame size={18} className="text-[#00C896] mx-auto mb-1" />
        <div className="text-[#00C896] text-2xl font-bold">{streak}</div>
        <div className="text-slate-500 text-xs mt-0.5">day streak 🔥</div>
      </div>

      {/* User */}
      <div className="border-t border-[#6C63FF]/20 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#a855f7] flex items-center justify-center text-white text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-white text-xs font-medium truncate max-w-[80px]">
              {user?.username || 'User'}
            </p>
            <p className="text-slate-600 text-[10px]">Pro member</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-400/10 rounded-lg"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0D0D18] border-b border-[#6C63FF]/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#6C63FF] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">AT</span>
          </div>
          <span className="text-white font-semibold text-sm">AlgoTrack</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-slate-400 hover:text-white"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-[#0D0D18] border-r border-[#6C63FF]/20 z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-52 h-screen bg-[#0D0D18] border-r border-[#6C63FF]/20 flex-col fixed left-0 top-0">
        <SidebarContent />
      </aside>
    </>
  );
}