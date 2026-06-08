import { Bell, Search, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDate } from '../../lib/utils';
import { BookingWizard } from '../booking/BookingWizard';
import { format } from 'date-fns';

export function Header({ title }: { title?: string }) {
  const { currentUser, notifications, selectedDate, setSelectedDate } = useAppStore();
  const unread = notifications.filter(n => !n.read && n.userId === currentUser.id).length;
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0">
        {title && <h1 className="text-lg font-semibold text-gray-900 mr-auto">{title}</h1>}
        {!title && <div className="flex-1" />}

        {/* Date picker */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {/* Quick book */}
        <Button
          size="sm"
          iconLeft={<Plus className="w-4 h-4" />}
          onClick={() => setShowBooking(true)}
        >
          Book
        </Button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Avatar name={currentUser.name} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">{currentUser.name}</p>
            <p className="text-xs text-gray-500 leading-tight capitalize">{currentUser.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </header>

      <BookingWizard isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </>
  );
}
