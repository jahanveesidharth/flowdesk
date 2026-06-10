import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn, formatTimeAgo } from '../lib/utils';

const typeConfig: Record<string, { icon: string; color: string }> = {
  booking_confirmed: { icon: '✅', color: 'bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900/60' },
  booking_cancelled: { icon: '❌', color: 'bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/60' },
  checkin_reminder: { icon: '⏰', color: 'bg-yellow-50 border-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-900/60' },
  waitlist_available: { icon: '🎉', color: 'bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/60' },
  desk_released: { icon: '🆓', color: 'bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900/60' },
  policy_update: { icon: '📋', color: 'bg-purple-50 border-purple-100 dark:bg-purple-950/30 dark:border-purple-900/60' },
  admin_message: { icon: '📣', color: 'bg-orange-50 border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/60' },
};

export function NotificationsPage() {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const userNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unread = userNotifs.filter(n => !n.read);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unread.length > 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{unread.length} unread</p>}
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" iconLeft={<CheckCheck className="w-4 h-4" />} onClick={markAllNotificationsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {userNotifs.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <BellOff className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {userNotifs.map(n => {
            const cfg = typeConfig[n.type] || { icon: '🔔', color: 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800' };
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm',
                  n.read ? 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800' : `${cfg.color} border`,
                )}
              >
                <span className="text-xl shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn('text-sm font-semibold', n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white')}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                  </div>
                  <p className={cn('text-sm', n.read ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300')}>{n.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTimeAgo(n.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
