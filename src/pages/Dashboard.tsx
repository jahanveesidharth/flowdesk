import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, ArrowRight, Plus, 
  Bell, CloudSun, Compass, MapPin,
  ChevronRight, Laptop, UserCheck, AlertCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingWizard } from '../components/booking/BookingWizard';
import { FloorMap } from '../components/floormap/FloorMap';
import { formatTimeRange, formatTimeAgo } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { DEMO_CREDENTIALS, isDemoMode } from '../lib/demoMode';

type WeatherStatus = {
  label: string;
  tempC?: number;
  loading: boolean;
};

export function Dashboard() {
  const { currentUser, bookings, notifications, users, floors, desks } = useAppStore();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherStatus>(() => (
    typeof navigator !== 'undefined' && 'geolocation' in navigator
      ? { label: 'Detecting location', loading: true }
      : { label: 'Weather unavailable', loading: false }
  ));
  const demoMode = isDemoMode();
  const [previewFloorId, setPreviewFloorId] = useState('');

  useEffect(() => {
    if (floors.length > 0 && !previewFloorId) {
      setPreviewFloorId(floors.find(f => f.isActive)?.id || floors[0]?.id);
    }
  }, [floors, previewFloorId]);

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const watchId = navigator.geolocation.watchPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;
          const params = new URLSearchParams({
            latitude: latitude.toFixed(4),
            longitude: longitude.toFixed(4),
            current: 'temperature_2m',
            timezone: 'auto',
          });
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error('Weather request failed');

          const data = await response.json() as { current?: { temperature_2m?: number } };
          const temp = data.current?.temperature_2m;

          if (!cancelled && typeof temp === 'number') {
            setWeather({ label: 'Current location', tempC: Math.round(temp), loading: false });
          } else if (!cancelled) {
            setWeather({ label: 'Weather unavailable', loading: false });
          }
        } catch {
          if (!cancelled) setWeather({ label: 'Weather unavailable', loading: false });
        }
      },
      () => {
        if (!cancelled) setWeather({ label: 'Location not shared', loading: false });
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 },
    );

    return () => {
      cancelled = true;
      controller.abort();
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const nowTime = new Date();
  const currentHourMin = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}`;

  const myBookings = bookings.filter(b => b.userId === currentUser.id && b.status !== 'cancelled');
  const todayBookings = myBookings.filter(b => b.date === today);
  const upcomingBookings = myBookings.filter(b => 
    b.date > today || (b.date === today && currentHourMin <= b.endTime)
  ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).slice(0, 3);
  const todayDesk = todayBookings.find(b => b.resourceType === 'desk');

  const unreadNotifs = notifications.filter(n => !n.read && n.userId === currentUser.id);
  const recentNotifs = notifications.filter(n => n.userId === currentUser.id).slice(0, 4);

  // Team in office today
  const teamInOffice = users.filter(u => {
    if (u.id === currentUser.id) return false;
    return bookings.some(b => b.userId === u.id && b.date === today && !['cancelled', 'completed'].includes(b.status));
  });

  // Floor availability (Circular Ring Stats)
  const floorStats = floors.slice(0, 3).map(floor => {
    const floorDesks = desks.filter(d => d.floorId === floor.id);
    const occupied = bookings.filter(
      b => b.date === today && 
      b.floorId === floor.id && 
      b.resourceType === 'desk' && 
      !['cancelled', 'completed', 'no_show'].includes(b.status)
    ).length;
    const rate = floorDesks.length > 0 ? Math.round((occupied / floorDesks.length) * 100) : 0;
    return { floor, floorDesks: floorDesks.length, occupied, rate };
  });

  // Dynamic Greeting Greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {getGreeting()}, {currentUser.name.split(' ')[0]} 👋
        </h1>

        {/* Interactive Date & Clock Card */}
        <div className={cn(
          "flex flex-col items-center justify-center p-4 px-6 rounded-[32px] shrink-0 min-w-[220px] transition-all duration-300 shadow-sm border",
          "bg-brand-50 text-brand-700 border-brand-100/50",
          "dark:bg-brand-950/20 dark:text-brand-300 dark:border-brand-900/30"
        )}>
          <span className="text-[10px] font-bold tracking-wider uppercase text-brand-500/90 dark:text-brand-400/90">{format(time, 'EEEE, d MMMM')}</span>
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums mt-0.5 text-brand-850 dark:text-white">
            {format(time, 'hh:mm:ss')}<span className="text-sm font-normal uppercase ml-1 text-brand-500 dark:text-brand-400">{format(time, 'a')}</span>
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-brand-600 dark:text-brand-400/95">
            <CloudSun className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 shrink-0" />
            <span>
              {weather.loading
                ? 'Detecting weather...'
                : weather.tempC !== undefined
                  ? `${weather.label} · ${weather.tempC}°C`
                  : weather.label}
            </span>
          </div>
        </div>
      </div>

      {demoMode && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">Demo mode is active</p>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Explore bookings, maps, team presence, parking, lockers, and admin views with sample data only.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-md bg-white/70 px-2 py-1 dark:bg-gray-950/60">Email: {DEMO_CREDENTIALS.email}</span>
              <span className="rounded-md bg-white/70 px-2 py-1 dark:bg-gray-950/60">Password: {DEMO_CREDENTIALS.password}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Stat Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          icon="🪑"
          label="Today's Desk"
          value={todayDesk ? desks.find(d => d.id === todayDesk.resourceId)?.label || '—' : 'Not Booked'}
          sublabel={todayDesk ? formatTimeRange(todayDesk.startTime, todayDesk.endTime) : 'No desk selected'}
          badgeText={todayDesk ? 'Active' : 'Unassigned'}
          badgeVariant="info"
          color="blue"
          onClick={() => setShowBooking(true)}
        />
        <StatCard
          icon="📅"
          label="My Schedule"
          value={`${upcomingBookings.length} Bookings`}
          sublabel="upcoming this week"
          badgeText="Calendar"
          badgeVariant="info"
          color="green"
          onClick={() => navigate('/my-bookings')}
        />
        <StatCard
          icon="👥"
          label="Office Presence"
          value={`${teamInOffice.length} In-Office`}
          sublabel="teammates sitting today"
          badgeText="Active"
          badgeVariant="info"
          color="purple"
          onClick={() => navigate('/team')}
        />
        <StatCard
          icon="🔔"
          label="Recent Updates"
          value={`${unreadNotifs.length} Unread`}
          sublabel="notifications pending"
          badgeText={unreadNotifs.length > 0 ? 'Action' : 'Up to date'}
          badgeVariant={unreadNotifs.length > 0 ? 'info' : 'neutral'}
          color="orange"
          onClick={() => navigate('/notifications')}
        />
      </div>

      {/* 3. Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Bookings Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Schedule</h2>
            </div>
            <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/my-bookings')}>
              Full list
            </Button>
          </div>

          {todayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-[32px] shadow-sm">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-850 dark:text-gray-200 text-sm">No reservations for today</h3>
              <p className="text-gray-400 text-xs mt-1 max-w-xs">Need to sit near teammates or hold a meeting? Book a space now.</p>
              <Button className="mt-4 rounded-full" size="sm" onClick={() => setShowBooking(true)} iconLeft={<Plus className="w-4 h-4" />}>
                Book a space
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayBookings.map(b => (
                <div key={b.id} className="transition-all hover:scale-[1.01] duration-300">
                  <BookingCard booking={b} />
                </div>
              ))}
            </div>
          )}

          {/* Upcoming bookings list */}
          {upcomingBookings.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-gray-150 dark:border-gray-800/80 pb-3">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Coming Up Next</h2>
              </div>
              <div className="space-y-3">
                {upcomingBookings.map(b => (
                  <BookingCard key={b.id} booking={b} compact />
                ))}
              </div>
            </div>
          )}

          {/* Live Floor Map Card */}
          <Card className="overflow-hidden mt-6">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" />
                <CardTitle>Live Floor Map</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {floors.length > 0 && (
                  <select
                    value={previewFloorId}
                    onChange={(e) => {
                      e.stopPropagation();
                      setPreviewFloorId(e.target.value);
                    }}
                    className="text-xs font-bold border-0 bg-gray-105 dark:bg-gray-900 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-850 dark:text-gray-250 cursor-pointer"
                  >
                    {floors.filter(f => f.isActive).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => navigate('/floor-map')}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Expand Map"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                onClick={() => navigate('/floor-map')}
                className="cursor-pointer hover:opacity-95 transition-opacity duration-200 h-[340px] rounded-2xl overflow-hidden relative border border-gray-100 dark:border-gray-800 bg-[#eef7f8] dark:bg-slate-950 shadow-inner flex items-center justify-center"
              >
                {floors.find(f => f.id === previewFloorId) ? (
                  <FloorMap
                    floor={floors.find(f => f.id === previewFloorId)!}
                    date={today}
                    previewMode
                  />
                ) : (
                  <div className="text-xs text-gray-400">Loading floor map...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6 md:space-y-8">
          
          {/* Quick Action Widgets */}
          <Card className="dark:bg-gray-950 dark:border-gray-800/80">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-brand-500" />
                <CardTitle>Launchpad</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { label: 'Book a desk', desc: 'Interactive visual seat map', icon: '🪑', color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-500', onClick: () => setShowBooking(true) },
                { label: 'View my bookings', desc: 'Manage your active reservations', icon: '📅', color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500', onClick: () => navigate('/my-bookings') },
                { label: 'Find teammates', desc: 'See coworker seating locations', icon: '👥', color: 'bg-purple-50 dark:bg-purple-950/20 text-purple-500', onClick: () => navigate('/team') },
                { label: 'Interactive floor map', desc: 'Full building occupancy layout', icon: '🗺', color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-500', onClick: () => navigate('/floor-map') },
                { label: 'Plan my week', desc: 'Hybrid remote & office scheduler', icon: '📆', color: 'bg-pink-50 dark:bg-pink-950/20 text-pink-500', onClick: () => navigate('/my-week') },
              ].map((a, idx) => (
                <button
                  key={idx}
                  onClick={a.onClick}
                  className={cn(
                    "w-full flex items-center gap-3.5 p-2.5 rounded-2xl text-left border border-transparent",
                    "hover:border-gray-200 dark:hover:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-900/60 transition-all group"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0", a.color)}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors truncate">{a.label}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{a.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-650 group-hover:text-gray-500 group-hover:translate-x-1.5 transition-all" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Circular Gauges for Floor Availability */}
          <Card className="dark:bg-gray-950 dark:border-gray-800/80">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-4.5 h-4.5 text-brand-500" />
                <CardTitle>Floor Capacity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {floorStats.map(({ floor, floorDesks, occupied, rate }) => (
                <FloorCircularGauge
                  key={floor.id}
                  name={floor.name}
                  free={floorDesks - occupied}
                  rate={rate}
                />
              ))}
            </CardContent>
          </Card>

          {/* Team Locations */}
          <Card className="dark:bg-gray-950 dark:border-gray-800/80">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-brand-500" />
                  <CardTitle>Team Presence</CardTitle>
                </div>
                <Badge variant="info" className="animate-pulse">{teamInOffice.length} sitting</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {teamInOffice.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">No teammates sitting in office today.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamInOffice.slice(0, 5).map(user => {
                    const userBooking = bookings.find(
                      b => b.userId === user.id && b.date === today && !['cancelled', 'completed'].includes(b.status)
                    );
                    const floor = userBooking ? floors.find(f => f.id === userBooking.floorId) : null;
                    return (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/60 hover:bg-gray-100/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" className="ring-2 ring-brand-500/10" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate">{user.name}</p>
                            <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {floor && (
                            <span className="text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-100/50 dark:border-brand-900/30 rounded px-1.5 py-0.5">
                              {floor.name}
                            </span>
                          )}
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 shadow-sm shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                  {teamInOffice.length > 5 && (
                    <button onClick={() => navigate('/team')} className="w-full text-center text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors mt-2">
                      View all {teamInOffice.length} sitting teammates
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="dark:bg-gray-950 dark:border-gray-800/80">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-brand-500" />
                  <CardTitle>Activity Timeline</CardTitle>
                </div>
                <button onClick={() => navigate('/notifications')} className="text-xs text-brand-500 hover:underline">Log</button>
              </div>
            </CardHeader>
            <CardContent>
              {recentNotifs.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No recent activity.</p>
              ) : (
                <div className="relative pl-4 border-l border-gray-100 dark:border-gray-800 space-y-5">
                  {recentNotifs.map(n => (
                    <div key={n.id} className="relative group">
                      {/* Timeline dot */}
                      <span className={cn(
                        "absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-gray-950 shrink-0",
                        n.read ? "bg-gray-300 dark:bg-gray-700" : "bg-brand-500 animate-pulse"
                      )} />
                      
                      <div className="min-w-0">
                        <p className={cn(
                          "text-xs font-semibold truncate", 
                          n.read ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-255"
                        )}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{n.message}</p>
                        <span className="text-[9px] text-gray-300 dark:text-gray-500 block mt-1">{formatTimeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingWizard isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, badgeText, badgeVariant, color, onClick }: {
  icon: string; label: string; value: string; sublabel: string; 
  badgeText: string; badgeVariant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick: () => void;
}) {
  const colorMap = {
    blue: {
      card: 'bg-[#fcf8fa] hover:bg-[#faeff4] dark:bg-[#20181e] dark:hover:bg-[#2c1d29] border-[#724b68]/15 hover:border-[#724b68]/45 dark:border-[#724b68]/30 dark:hover:border-[#724b68]/55 hover:shadow-brand-500/5',
      iconBg: 'bg-[#724b68]/10 dark:bg-[#724b68]/20 text-[#724b68] dark:text-[#d3a7c8]'
    },
    green: {
      card: 'bg-[#f8f7fd] hover:bg-[#f1eefb] dark:bg-[#191824] dark:hover:bg-[#242137] border-[#6366f1]/15 hover:border-[#6366f1]/45 dark:border-[#6366f1]/30 dark:hover:border-[#6366f1]/55 hover:shadow-indigo-500/5',
      iconBg: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/20 text-[#6366f1] dark:text-[#a5b4fc]'
    },
    purple: {
      card: 'bg-[#f6f8fa] hover:bg-[#eff3f8] dark:bg-[#181d26] dark:hover:bg-[#212836] border-[#0284c7]/15 hover:border-[#0284c7]/45 dark:border-[#0284c7]/30 dark:hover:border-[#0284c7]/55 hover:shadow-sky-500/5',
      iconBg: 'bg-[#0284c7]/10 dark:bg-[#0284c7]/20 text-[#0284c7] dark:text-[#7dd3fc]'
    },
    orange: {
      card: 'bg-[#fdfbf7] hover:bg-[#fbf4ea] dark:bg-[#24211a] dark:hover:bg-[#302b1f] border-[#d1a153]/20 hover:border-[#d1a153]/50 dark:border-[#d1a153]/35 dark:hover:border-[#d1a153]/60 hover:shadow-amber-500/5',
      iconBg: 'bg-[#d1a153]/10 dark:bg-[#d1a153]/20 text-[#d1a153] dark:text-[#f3d79f]'
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between p-4 sm:p-5 min-h-[136px] sm:min-h-[148px] rounded-[32px] border cursor-pointer shadow-sm",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        scheme.card
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0", scheme.iconBg)}>
          {icon}
        </div>
        <Badge variant={badgeVariant} className="shrink-0 text-[9px] sm:text-xs px-1.5 py-0.5">{badgeText}</Badge>
      </div>

      <div className="mt-2.5 flex-1 flex flex-col justify-end">
        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block truncate">{label}</span>
        <h4 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-855 dark:text-gray-200 tracking-tight leading-tight group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors truncate mt-1">
          {value}
        </h4>
        <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-550 mt-1.5 truncate leading-none">{sublabel}</p>
      </div>
    </div>
  );
}

// Circular Capacity Radial Ring Widget
function FloorCircularGauge({ name, free, rate }: { name: string; free: number; rate: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;
  
  const strokeColor = rate > 80 ? 'stroke-red-500 dark:stroke-red-600' : rate > 60 ? 'stroke-amber-500 dark:stroke-amber-600' : 'stroke-emerald-500 dark:stroke-emerald-600';

  return (
    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/60 hover:bg-gray-100/50 transition-colors">
      <div className="relative flex items-center justify-center shrink-0 w-12 h-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-gray-200 dark:stroke-gray-800"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            className={cn("transition-all duration-700 ease-out", strokeColor)}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[10px] font-extrabold text-gray-800 dark:text-gray-250">{rate}%</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate">{name}</h4>
        <p className="text-[10px] text-gray-400 mt-0.5">{free} available desks</p>
      </div>
    </div>
  );
}
