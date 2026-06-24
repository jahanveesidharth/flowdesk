import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, Calendar, Car, Users, BarChart3,
  Settings, ChevronLeft, ChevronRight, Building2, ShieldCheck, Bell, LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { exitDemoMode, isDemoMode } from '../../lib/demoMode';
import toast from 'react-hot-toast';

const EMPLOYEE_NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/floor-map', icon: Map, label: 'Floor Map' },
  { to: '/my-bookings', icon: Calendar, label: 'My Bookings' },
  { to: '/parking-lockers', icon: Car, label: 'Parking & Lockers' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/my-week', icon: Calendar, label: 'My Week' },
];

const ADMIN_NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
  { to: '/admin/floor-builder', icon: Building2, label: 'Floor Builder' },
  { to: '/admin/bookings', icon: Calendar, label: 'All Bookings' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/policies', icon: ShieldCheck, label: 'Policies' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const MANAGER_NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Manager Dashboard' },
  { to: '/admin/floor-builder', icon: Building2, label: 'Floor Builder' },
  { to: '/admin/bookings', icon: Calendar, label: 'All Bookings' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/floor-map', icon: Map, label: 'Floor Map' },
  { to: '/my-bookings', icon: Calendar, label: 'My Bookings' },
  { to: '/parking-lockers', icon: Car, label: 'Parking & Lockers' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/my-week', icon: Calendar, label: 'My Week' },
];

export function Sidebar() {
  const { currentUser, sidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen, notifications, theme } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser.id).length;
  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';
  const nav = isAdmin ? ADMIN_NAV : isManager ? MANAGER_NAV : EMPLOYEE_NAV;
  const roleLabel = isAdmin ? 'Admin Panel' : isManager ? 'Manager Panel' : 'Workspace';

  return (
    <aside className={cn(
      'fixed top-0 left-0 h-screen bg-white/95 dark:bg-gray-950/95 border-r border-gray-200/70 dark:border-gray-850/90 flex flex-col transition-all duration-300 z-40 backdrop-blur-md shadow-sm',
      // Desktop widths
      sidebarOpen ? 'md:w-56' : 'md:w-16',
      // Mobile positioning / drawer logic
      'w-56 -translate-x-full md:translate-x-0',
      mobileSidebarOpen && 'translate-x-0'
    )}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-850/80 shrink-0">
        {sidebarOpen ? (
          <img
            src={theme === 'dark' ? '/grabdesk light.svg' : '/grabdesk.svg'}
            alt="GrabDesk"
            className="h-8 w-auto max-w-full"
          />
        ) : (
          <img
            src={theme === 'dark' ? '/grabdesk favicon light.svg' : '/grabdesk favicon.svg'}
            alt="GrabDesk"
            className="h-8 w-8 mx-auto object-contain"
          />
        )}
      </div>

      {/* Role badge */}
      {sidebarOpen && (
        <div className="px-3.5 pt-3.5 pb-1">
          <div
            className={cn(
              'w-full text-[11px] py-2 px-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-between shadow-sm border',
              isAdmin
                ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 text-orange-700 dark:text-orange-400 border-orange-200/50 dark:border-orange-900/30'
                : isManager
                ? 'bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30'
                : 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/60 dark:to-gray-950/60 text-gray-650 dark:text-gray-300 border-gray-200/40 dark:border-gray-800/60',
            )}
          >
            <span className="truncate">{roleLabel}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider shrink-0 font-bold ml-2",
              isAdmin
                ? "bg-orange-200/60 dark:bg-orange-900/50 text-orange-850 dark:text-orange-300"
                : isManager
                ? "bg-blue-200/60 dark:bg-blue-900/50 text-blue-850 dark:text-blue-300"
                : "bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            )}>
              {currentUser.role}
            </span>
          </div>
        </div>
      )}
      {!sidebarOpen && (
        <div className="px-2 pt-2 flex justify-center">
          <Tooltip content={roleLabel} side="right">
            <div className={cn(
              'w-9 h-7 rounded-lg text-[10px] font-extrabold shadow-sm transition-all border flex items-center justify-center',
              isAdmin
                ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/30'
                : isManager
                ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200/30'
            )}>
              {isAdmin ? 'A' : isManager ? 'M' : 'E'}
            </div>
          </Tooltip>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <Tooltip key={to} content={sidebarOpen ? null : label} side="right">
            <NavLink
              to={to}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) => cn(
                'relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group duration-200 w-full',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 font-semibold shadow-sm ring-1 ring-brand-100 dark:ring-brand-900/30'
                  : 'text-gray-655 dark:text-gray-400 hover:bg-gray-50/60 dark:hover:bg-gray-900/70 hover:text-gray-950 dark:hover:text-white',
                !sidebarOpen && 'justify-center px-2',
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("w-4.5 h-4.5 shrink-0 transition-colors", isActive ? "text-brand-500" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />
                  {sidebarOpen && <span className="truncate">{label}</span>}
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-[4px]" />
                  )}
                </>
              )}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-100 dark:border-gray-850/80 p-2 flex flex-col gap-1">
        <Tooltip content={sidebarOpen ? null : 'Notifications'} side="right">
          <NavLink to="/notifications" onClick={() => setMobileSidebarOpen(false)} className={({ isActive }) => cn(
            'relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full',
            isActive
              ? 'bg-brand-50/80 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-gray-650 dark:text-gray-400 hover:bg-gray-55/60 dark:hover:bg-gray-900/40',
            !sidebarOpen && 'justify-center px-2',
          )}>
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Bell className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-brand-500" : "text-gray-400")} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center leading-none ring-2 ring-white dark:ring-gray-950">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {sidebarOpen && <span>Notifications</span>}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-[4px]" />
                )}
              </>
            )}
          </NavLink>
        </Tooltip>

        <Tooltip content={sidebarOpen ? null : 'Settings'} side="right">
          <NavLink to="/settings" onClick={() => setMobileSidebarOpen(false)} className={({ isActive }) => cn(
            'relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full',
            isActive
              ? 'bg-brand-50/80 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-gray-650 dark:text-gray-400 hover:bg-gray-55/60 dark:hover:bg-gray-900/40',
            !sidebarOpen && 'justify-center px-2',
          )}>
            {({ isActive }) => (
              <>
                <Settings className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-brand-500" : "text-gray-400")} />
                {sidebarOpen && <span>Settings</span>}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-[4px]" />
                )}
              </>
            )}
          </NavLink>
        </Tooltip>

        <Tooltip content={sidebarOpen ? null : 'Log Out'} side="right">
          <button
            onClick={async () => {
              if (isDemoMode()) {
                exitDemoMode();
                toast.success('Exited demo mode');
                window.location.href = '/login';
              } else if (isSupabaseConfigured()) {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toast.error(`Logout error: ${error.message}`);
                } else {
                  toast.success('Logged out successfully');
                }
              } else {
                toast.success('Logged out (Demo Mode)');
              }
            }}
            className={cn(
              'relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left',
              'text-gray-650 dark:text-gray-400 hover:bg-rose-50/20 dark:hover:bg-rose-950/10 hover:text-rose-600 dark:hover:text-rose-400',
              !sidebarOpen && 'justify-center px-2',
            )}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </Tooltip>
      </div>

      {/* User profile */}
      <div className={cn('border-t border-gray-100 bg-gray-50/60 dark:border-gray-855/80 dark:bg-gray-900/30 p-3.5 flex items-center', sidebarOpen ? 'gap-3' : 'justify-center')}>
        <Avatar name={currentUser.name} imageUrl={currentUser.avatar} size="sm" className="ring-2 ring-brand-500/10 shrink-0" />
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-1 capitalize leading-none">{currentUser.role}</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-full items-center justify-center shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all z-50 text-gray-400 hover:text-gray-600 hidden md:flex"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
