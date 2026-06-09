import { Bell, Search, Plus, ChevronDown, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDate } from '../../lib/utils';
import { BookingWizard } from '../booking/BookingWizard';
import { format } from 'date-fns';

export function Header({ title }: { title?: string }) {
  const { currentUser, notifications, selectedDate, setSelectedDate, theme, setTheme } = useAppStore();
  const unread = notifications.filter(n => !n.read && n.userId === currentUser.id).length;
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <header className="h-16 bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/60 dark:border-gray-850/80 flex items-center px-6 gap-4 shrink-0 backdrop-blur-md sticky top-0 z-30">
        {title && <h1 className="text-base font-extrabold text-gray-950 dark:text-white mr-auto tracking-tight">{title}</h1>}
        {!title && <div className="flex-1" />}

        {/* Date picker */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-900 dark:text-white transition-all shadow-sm"
          />
        </div>

        {/* Quick book */}
        <Button
          size="sm"
          className="rounded-xl font-bold shadow-sm"
          iconLeft={<Plus className="w-4 h-4" />}
          onClick={() => setShowBooking(true)}
        >
          Book
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-all text-gray-500 dark:text-gray-400 hover:scale-105 active:scale-95 border border-transparent hover:border-gray-200/30"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-all text-gray-500 dark:text-gray-400 hover:scale-105 active:scale-95 border border-transparent hover:border-gray-200/30"
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
          <Avatar name={currentUser.name} size="sm" className="ring-2 ring-brand-500/5" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-gray-405 dark:text-gray-450 leading-none capitalize mt-0.5">{currentUser.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </button>
      </header>

      <BookingWizard isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </>
  );
}
