import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Calendar, Car, Archive, Users, BarChart3,
  Settings, ChevronLeft, ChevronRight, Building2, ShieldCheck, Bell, LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';

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

export function Sidebar() {
  const { currentUser, isAdminMode, sidebarOpen, setSidebarOpen, switchRole, notifications } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser.id).length;
  const nav = isAdminMode ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <aside className={cn(
      'fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40',
      sidebarOpen ? 'w-56' : 'w-16',
    )}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-gray-900 text-base">DeskFlow</span>}
        </div>
      </div>

      {/* Role badge */}
      {sidebarOpen && (
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={switchRole}
            className={cn(
              'w-full text-xs py-1.5 px-3 rounded-lg font-medium transition-all',
              isAdminMode ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {isAdminMode ? '🛡 Admin Mode' : '👤 Employee Mode'}
          </button>
        </div>
      )}
      {!sidebarOpen && (
        <div className="px-2 pt-2">
          <Tooltip content={isAdminMode ? 'Admin Mode' : 'Employee Mode'} side="right">
            <button onClick={switchRole} className={cn('w-10 h-7 rounded-md text-xs font-bold', isAdminMode ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600')}>
              {isAdminMode ? 'A' : 'E'}
            </button>
          </Tooltip>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <Tooltip key={to} content={sidebarOpen ? null : label} side="right">
            <NavLink
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                !sidebarOpen && 'justify-center px-2',
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-100 p-2 flex flex-col gap-0.5">
        <Tooltip content={sidebarOpen ? null : 'Notifications'} side="right">
          <NavLink to="/notifications" className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100',
            !sidebarOpen && 'justify-center px-2',
          )}>
            <div className="relative">
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {sidebarOpen && <span>Notifications</span>}
          </NavLink>
        </Tooltip>

        <Tooltip content={sidebarOpen ? null : 'Settings'} side="right">
          <NavLink to="/settings" className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100',
            !sidebarOpen && 'justify-center px-2',
          )}>
            <Settings className="w-4.5 h-4.5" />
            {sidebarOpen && <span>Settings</span>}
          </NavLink>
        </Tooltip>
      </div>

      {/* User profile */}
      <div className={cn('border-t border-gray-100 p-3 flex items-center', sidebarOpen ? 'gap-2' : 'justify-center')}>
        <Avatar name={currentUser.name} size="sm" />
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser.department}</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-50 text-gray-400 hover:text-gray-600"
      >
        {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}
