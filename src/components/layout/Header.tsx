import { Bell, Plus, Sun, Moon, CalendarDays, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { BookingWizard } from '../booking/BookingWizard';

export function Header({ title }: { title?: string }) {
  const { currentUser, notifications, selectedDate, setSelectedDate, theme, setTheme, setMobileSidebarOpen } = useAppStore();
  const unread = notifications.filter(n => !n.read && n.userId === currentUser.id).length;
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <header className="h-16 bg-white/92 dark:bg-gray-950/92 border-b border-gray-200/70 dark:border-gray-850/90 flex items-center px-4 md:px-6 gap-3 shrink-0 backdrop-blur-md sticky top-0 z-30">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-1.5 -ml-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-all text-gray-500 dark:text-gray-400 md:hidden border border-transparent hover:border-gray-200/30 shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 mr-auto">
          {title && title !== 'GrabDesk' && (
            <h1 className="truncate text-base font-extrabold tracking-tight">
              <span className="text-gray-950 dark:text-white">{title}</span>
            </h1>
          )}
        </div>

        {/* Date picker */}
        <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-[132px] bg-transparent text-xs font-bold text-gray-800 outline-none dark:text-white"
          />
        </div>

        {/* Quick book */}
        <Button
          size="sm"
          className="rounded-xl font-bold shadow-sm shadow-brand-500/15 gap-1"
          iconLeft={<Plus className="w-4 h-4" />}
          onClick={() => setShowBooking(true)}
        >
          <span className="hidden md:inline">Book</span>
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={(e) => {
            setTheme(theme === 'dark' ? 'light' : 'dark');
            e.currentTarget.blur();
          }}
          className="p-2 rounded-xl hover:bg-gray-55 dark:hover:bg-gray-900/60 transition-all text-gray-500 dark:text-gray-400 hover:scale-105 active:scale-95 border border-transparent hover:border-gray-200/30 hidden md:block"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-gray-55 dark:hover:bg-gray-900/60 transition-all text-gray-500 dark:text-gray-400 hover:scale-105 active:scale-95 border border-transparent hover:border-gray-200/30 hidden md:block"
        >
          <Bell className="w-4.5 h-4.5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center leading-none ring-2 ring-white dark:ring-gray-950 font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 py-1 px-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors border border-transparent hover:border-gray-200/20"
        >
          <Avatar name={currentUser.name} imageUrl={currentUser.avatar} size="sm" className="ring-2 ring-brand-500/5" />
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-gray-405 dark:text-gray-450 leading-none capitalize mt-0.5">{currentUser.role}</p>
          </div>
        </button>
      </header>

      <BookingWizard isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </>
  );
}
