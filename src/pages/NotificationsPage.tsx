import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn, formatTimeAgo } from '../lib/utils';

const typeConfig: Record<string, { icon: string; color: string }> = {
  booking_confirmed: { icon: '✅', color: 'bg-green-50 border-green-100' },
  booking_cancelled: { icon: '❌', color: 'bg-red-50 border-red-100' },
  checkin_reminder: { icon: '⏰', color: 'bg-yellow-50 border-yellow-100' },
  waitlist_available: { icon: '🎉', color: 'bg-blue-50 border-blue-100' },
  desk_released: { icon: '🆓', color: 'bg-green-50 border-green-100' },
  policy_update: { icon: '📋', color: 'bg-purple-50 border-purple-100' },
  admin_message: { icon: '📣', color: 'bg-orange-50 border-orange-100' },
};

export function NotificationsPage() {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const userNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unread = userNotifs.filter(n => !n.read);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unread.length > 0 && <p className="text-sm text-gray-500">{unread.length} unread</p>}
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" iconLeft={<CheckCheck className="w-4 h-4" />} onClick={markAllNotificationsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {userNotifs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BellOff className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {userNotifs.map(n => {
            const cfg = typeConfig[n.type] || { icon: '🔔', color: 'bg-white' };
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm',
                  n.read ? 'bg-white border-gray-100' : `${cfg.color} border`,
                )}
              >
                <span className="text-xl shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={cn('text-sm font-semibold', n.read ? 'text-gray-700' : 'text-gray-900')}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                  </div>
                  <p className={cn('text-sm', n.read ? 'text-gray-400' : 'text-gray-600')}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(n.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
