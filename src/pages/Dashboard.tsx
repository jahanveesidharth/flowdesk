import { useState } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, TrendingUp, Users, CheckCircle, ArrowRight, Plus, Bell, BookOpen } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Avatar, AvatarGroup } from '../components/ui/Avatar';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingWizard } from '../components/booking/BookingWizard';
import { formatDate, formatTimeRange, formatTimeAgo } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { currentUser, bookings, notifications, users, floors, desks, rooms } = useAppStore();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const myBookings = bookings.filter(b => b.userId === currentUser.id && b.status !== 'cancelled');
  const todayBookings = myBookings.filter(b => b.date === today);
  const upcomingBookings = myBookings.filter(b => b.date > today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const todayCheckedIn = todayBookings.find(b => b.status === 'checked_in');
  const todayDesk = todayBookings.find(b => b.resourceType === 'desk');

  const unreadNotifs = notifications.filter(n => !n.read && n.userId === currentUser.id);
  const recentNotifs = notifications.filter(n => n.userId === currentUser.id).slice(0, 5);

  // Team in office today
  const teamInOffice = users.filter(u => {
    if (u.id === currentUser.id) return false;
    return bookings.some(b => b.userId === u.id && b.date === today && !['cancelled', 'completed'].includes(b.status));
  });

  // Floor availability
  const floorStats = floors.slice(0, 3).map(floor => {
    const floorDesks = desks.filter(d => d.floorId === floor.id);
    const occupied = bookings.filter(b => b.date === today && b.floorId === floor.id && b.resourceType === 'desk' && !['cancelled', 'completed', 'no_show'].includes(b.status)).length;
    const rate = floorDesks.length > 0 ? Math.round((occupied / floorDesks.length) * 100) : 0;
    return { floor, floorDesks: floorDesks.length, occupied, rate };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Button iconLeft={<Plus className="w-4 h-4" />} onClick={() => setShowBooking(true)}>
          Book a Space
        </Button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🪑"
          label="Today's Desk"
          value={todayDesk ? desks.find(d => d.id === todayDesk.resourceId)?.label || '—' : '—'}
          sublabel={todayDesk ? formatTimeRange(todayDesk.startTime, todayDesk.endTime) : 'No desk booked'}
          color="blue"
          action={!todayDesk ? { label: 'Book now', onClick: () => setShowBooking(true) } : undefined}
        />
        <StatCard
          icon="📅"
          label="Upcoming"
          value={String(upcomingBookings.length)}
          sublabel="bookings this week"
          color="green"
        />
        <StatCard
          icon="👥"
          label="Team In Office"
          value={String(teamInOffice.length)}
          sublabel="colleagues today"
          color="purple"
          action={{ label: 'View team', onClick: () => navigate('/team') }}
        />
        <StatCard
          icon="🔔"
          label="Notifications"
          value={String(unreadNotifs.length)}
          sublabel="unread"
          color="orange"
          action={unreadNotifs.length > 0 ? { label: 'View all', onClick: () => navigate('/notifications') } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Today's Bookings</h2>
            <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/my-bookings')}>
              View all
            </Button>
          </div>
          {todayBookings.length === 0 ? (
            <Card className="text-center py-10">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No bookings for today.</p>
              <Button className="mt-4" size="sm" onClick={() => setShowBooking(true)} iconLeft={<Plus className="w-4 h-4" />}>Book a space</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          )}

          {/* Upcoming */}
          {upcomingBookings.length > 0 && (
            <>
              <h2 className="text-base font-semibold text-gray-900 pt-2">Upcoming</h2>
              <div className="space-y-2">
                {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} compact />)}
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Book a desk', icon: '🪑', onClick: () => setShowBooking(true) },
                { label: 'View my bookings', icon: '📅', onClick: () => navigate('/my-bookings') },
                { label: 'Find teammates', icon: '👥', onClick: () => navigate('/team') },
                { label: 'View floor map', icon: '🗺', onClick: () => navigate('/floor-map') },
                { label: 'Plan my week', icon: '📆', onClick: () => navigate('/my-week') },
              ].map(a => (
                <button key={a.label} onClick={a.onClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 text-left transition-colors"
                >
                  <span className="text-base">{a.icon}</span>
                  {a.label}
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-gray-400" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Floor availability */}
          <Card>
            <CardHeader><CardTitle>Floor Availability</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {floorStats.map(({ floor, floorDesks, occupied, rate }) => (
                <div key={floor.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{floor.name}</span>
                    <span className={cn('text-xs font-medium', rate > 80 ? 'text-red-600' : rate > 60 ? 'text-yellow-600' : 'text-green-600')}>
                      {floorDesks - occupied} free
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', rate > 80 ? 'bg-red-400' : rate > 60 ? 'bg-yellow-400' : 'bg-green-400')}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{rate}% occupied</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team locations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Today</CardTitle>
                <Badge variant="info" size="sm">{teamInOffice.length} in office</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {teamInOffice.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">No teammates in office today.</p>
              ) : (
                <div className="space-y-2">
                  {teamInOffice.slice(0, 5).map(user => {
                    const userBooking = bookings.find(b => b.userId === user.id && b.date === today && !['cancelled', 'completed'].includes(b.status));
                    const floor = userBooking ? floors.find(f => f.id === userBooking.floorId) : null;
                    return (
                      <div key={user.id} className="flex items-center gap-2">
                        <Avatar name={user.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
                          {floor && <p className="text-xs text-gray-400 truncate">{floor.name}</p>}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                      </div>
                    );
                  })}
                  {teamInOffice.length > 5 && <p className="text-xs text-gray-400 text-center">+{teamInOffice.length - 5} more</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <button onClick={() => navigate('/notifications')} className="text-xs text-brand-500 hover:underline">See all</button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentNotifs.slice(0, 4).map(n => (
                <div key={n.id} className={cn('flex items-start gap-2 text-xs p-2 rounded-lg', !n.read && 'bg-brand-50')}>
                  <Bell className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', n.read ? 'text-gray-400' : 'text-brand-500')} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-medium truncate', n.read ? 'text-gray-600' : 'text-gray-900')}>{n.title}</p>
                    <p className="text-gray-400">{formatTimeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingWizard isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, color, action }: {
  icon: string; label: string; value: string; sublabel: string; color: string;
  action?: { label: string; onClick: () => void };
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };
  return (
    <Card className={cn(colorMap[color] || 'bg-gray-50', 'border-0')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {action && (
        <button onClick={action.onClick} className="text-xs text-brand-600 font-medium mt-2 hover:underline flex items-center gap-1">
          {action.label} <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </Card>
  );
}
