import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, X, Check, Info } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { cn, formatTimeAgo } from '../lib/utils';
import { format } from 'date-fns';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'booking' | 'cancelled'>('all');

  const userNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unread = userNotifs.filter(n => !n.read);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const filteredNotifs = userNotifs.filter(n => {
    if (activeTab === 'today') {
      return n.createdAt.startsWith(todayStr);
    }
    if (activeTab === 'booking') {
      return n.type === 'booking_confirmed';
    }
    if (activeTab === 'cancelled') {
      return n.type === 'booking_cancelled';
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">

      {/* Header section matching screenshot */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900/60 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
          {unread.length > 0 && (
            <span className="bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unread.length} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold" iconLeft={<CheckCheck className="w-4 h-4" />} onClick={markAllNotificationsRead}>
              Mark all read
            </Button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pill Filters Tabs matching screenshot */}
      <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
        {(['all', 'today', 'booking', 'cancelled'] as const).map((tabId) => {
          const labels: Record<string, string> = {
            all: 'All',
            today: 'TODAY',
            booking: 'BOOKING',
            cancelled: 'CANCLLED' // following the spelling from the screenshot
          };
          const isActive = activeTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={cn(
                "px-5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 tracking-wider",
                isActive
                  ? "bg-[#e0e3eb] text-gray-700 border-transparent dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-900/30 shadow-none"
                  : "bg-white text-gray-400 border-gray-250/30 dark:bg-gray-950 dark:text-gray-500 dark:border-gray-850 hover:text-gray-600 dark:hover:text-gray-400"
              )}
            >
              {labels[tabId]}
            </button>
          );
        })}
      </div>

      {/* Notifications list matching screenshot style */}
      {filteredNotifs.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="font-medium text-sm">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifs.map(n => {
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={cn(
                  'flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.005] duration-300 shadow-sm',
                  n.read
                    ? 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-900 opacity-85'
                    : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 border-2',
                )}
              >
                {/* Left side checkbox/cancellation square matching design */}
                {n.type === 'booking_confirmed' && (
                  <div className="w-6 h-6 bg-[#00c853] rounded-md flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Check className="w-4 h-4 stroke-[3.5]" />
                  </div>
                )}
                {n.type === 'booking_cancelled' && (
                  <div className="w-6 h-6 bg-[#ff1744] rounded-md flex items-center justify-center text-white shrink-0 shadow-sm">
                    <X className="w-4 h-4 stroke-[3.5]" />
                  </div>
                )}
                {n.type !== 'booking_confirmed' && n.type !== 'booking_cancelled' && (
                  <div className="w-6 h-6 bg-[#2979ff] rounded-md flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Info className="w-4 h-4 stroke-[3.5]" />
                  </div>
                )}

                {/* Right side content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      'text-sm leading-none transition-all',
                      n.read ? 'font-normal text-gray-500 dark:text-gray-400' : 'font-extrabold text-gray-955 dark:text-white'
                    )}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />}
                  </div>
                  <p className={cn(
                    'text-xs mt-1 leading-relaxed transition-all',
                    n.read ? 'font-normal text-gray-400 dark:text-gray-500' : 'font-bold text-gray-800 dark:text-gray-200'
                  )}>
                    {n.message}
                  </p>
                  <p className={cn(
                    'text-[10px] mt-1 transition-all',
                    n.read ? 'font-normal text-gray-400 dark:text-gray-500' : 'font-semibold text-brand-600 dark:text-brand-400'
                  )}>
                    {formatTimeAgo(n.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
