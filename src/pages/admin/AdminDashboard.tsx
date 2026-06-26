import { format } from 'date-fns';
import { Users, Calendar, TrendingUp, CheckCircle, Clock, MapPin, BarChart3, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate } from '../../lib/utils';
import { MOCK_DAILY_STATS, MOCK_FLOOR_OCCUPANCY } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '../../lib/utils';

export function AdminDashboard() {
  const { bookings, users, desks, waitlist, floors, theme, currentUser } = useAppStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled');
  const activeUsers = [...new Set(todayBookings.map(b => b.userId))].length;
  const checkedIn = bookings.filter(b => b.date === today && b.status === 'checked_in').length;
  const noShows = bookings.filter(b => b.date === today && b.status === 'no_show').length;

  const totalDesks = desks.filter(d => d.isActive).length;
  const occupiedDesks = todayBookings.filter(b => b.resourceType === 'desk').length;
  const occupancyRate = totalDesks > 0 ? Math.round((occupiedDesks / totalDesks) * 100) : 0;

  const recentBookings = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const last7Days = MOCK_DAILY_STATS.slice(-7);
  const weeklyData = last7Days.map(d => ({
    day: format(new Date(d.date), 'EEE'),
    desks: d.deskBookings,
    rooms: d.roomBookings,
    parking: d.parkingBookings,
  }));

  const pieData = [
    { name: 'Desks', value: todayBookings.filter(b => b.resourceType === 'desk').length, color: '#724b68' }, // Brand Plum
    { name: 'Rooms', value: todayBookings.filter(b => b.resourceType === 'room').length, color: '#b88fae' }, // Lighter Plum
    { name: 'Parking', value: todayBookings.filter(b => b.resourceType === 'parking').length, color: '#ebdbe4' }, // Very Light Plum
    { name: 'Lockers', value: todayBookings.filter(b => b.resourceType === 'locker').length, color: '#10b981' }, // Emerald
  ].filter(d => d.value > 0);

  // Dynamic colors depending on the active theme
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(55, 65, 81, 0.4)' : '#f3f4f6';
  const labelColor = isDark ? '#9ca3af' : '#6b7280';
  const tooltipBg = isDark ? '#111827' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';

  return (
    <div className="space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">
      {/* Page Title Header */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-amber-500/5 dark:from-brand-500/10 dark:to-amber-500/10" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-brand-500" />
              {currentUser.role === 'manager' ? 'Manager Dashboard' : 'Admin Portal'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentUser.role === 'manager'
                ? 'Monitor team occupancy, view space distribution, and review workstation check-ins.'
                : 'Manage workplace occupancy limits, monitor resource consumption, and process queue check-ins.'}
            </p>
          </div>
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-150/50 dark:bg-gray-900/60 px-3 py-1.5 rounded-xl border border-gray-200/20 dark:border-gray-800/30">
            SYSTEM STATUS: <span className="text-emerald-500 font-extrabold animate-pulse">● ACTIVE</span> | {formatDate(today)}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Today\'s Bookings',
            value: todayBookings.length,
            sub: `of ${totalDesks} seat capacity`,
            icon: <Calendar className="w-5 h-5 text-[#734B69] dark:text-[#e8c0de]" />,
            color: 'bg-[#F5E6F0] dark:bg-[#734B69]/20 border-[#734B69]/25 dark:border-[#734B69]/40'
          },
          {
            label: 'Active Users',
            value: activeUsers,
            sub: `${users.length} registered members`,
            icon: <Users className="w-5 h-5 text-[#cc7768] dark:text-[#ffaa9e]" />,
            color: 'bg-[#cc7768]/15 dark:bg-[#cc7768]/20 border-[#cc7768]/25 dark:border-[#cc7768]/40'
          },
          {
            label: 'Occupancy Rate',
            value: `${occupancyRate}%`,
            sub: `${occupiedDesks} of ${totalDesks} desks occupied`,
            icon: <TrendingUp className="w-5 h-5 text-[#286f7c] dark:text-[#8ccce4]" />,
            color: 'bg-[#ecf4f6] dark:bg-[#46909e]/20 border-[#46909e]/25 dark:border-[#46909e]/40'
          },
          {
            label: 'Check-ins Today',
            value: checkedIn,
            sub: `${noShows} marked no-shows`,
            icon: <CheckCircle className="w-5 h-5 text-[#5c5c94] dark:text-[#b4b4e8]" />,
            color: 'bg-[#E6E6FA] dark:bg-[#5c5c94]/20 border-[#5c5c94]/25 dark:border-[#5c5c94]/40'
          },
        ].map(({ label, value, sub, icon, color }) => (
          <Card key={label} className={cn('bg-white dark:bg-gray-950 border-gray-200/60 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] duration-300', color)}>
            <div className="flex items-start justify-between p-1">
              <div>
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">{sub}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-150/40 dark:border-gray-800/40">{icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly booking chart */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-950 border-gray-200/60 dark:border-gray-800/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-4">
            <div>
              <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200">Bookings This Week</CardTitle>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Distribution of spaces booked over the last 7 days</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 p-1.5 rounded-lg border border-gray-200/10 dark:border-gray-700/10">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#724b68' }} /> Desks</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#b88fae' }} /> Rooms</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={weeklyData} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" stroke={labelColor} tick={{ fontSize: 11, fontWeight: 500 }} />
                <YAxis stroke={labelColor} tick={{ fontSize: 11, fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                />
                <Bar dataKey="desks" fill="#724b68" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rooms" fill="#b88fae" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown pie */}
        <Card className="bg-white dark:bg-gray-950 border-gray-200/60 dark:border-gray-800/80 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-900 pb-4">
            <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200">Today's Space Distribution</CardTitle>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Ratio of workplace asset types booked</p>
          </CardHeader>
          <CardContent className="pt-6">
            {pieData.length > 0 ? (
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-full h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} className="stroke-white dark:stroke-gray-950 stroke-2" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          border: `1px solid ${tooltipBorder}`,
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-gray-850 dark:text-white leading-none">
                      {todayBookings.length}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Total
                    </span>
                  </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-2 mt-4">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/30 p-1.5 rounded-lg border border-gray-150/10">
                      <span className="flex items-center gap-1.5 min-w-0 text-gray-500 dark:text-gray-400">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="truncate">{d.name}</span>
                      </span>
                      <span className="font-extrabold text-gray-800 dark:text-gray-250 shrink-0">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldAlert className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-gray-400 text-xs font-semibold">No bookings recorded for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Management Row (Floor Occupancy, Recent Bookings, Waitlist Log) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Floor occupancy */}
        <Card className="bg-white dark:bg-gray-950 border-gray-200/60 dark:border-gray-800/80 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-900 pb-3">
            <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <MapPin className="w-4.5 h-4.5 text-brand-500" />
              Floor Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-900/40">
            {MOCK_FLOOR_OCCUPANCY.map(f => {
              const activeFloor = floors.find(fl => fl.id === f.floorId);
              return (
                <div key={f.floorId} className="py-3 first:pt-1.5 last:pb-1.5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{activeFloor?.name || f.floorName}</span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">
                      Peak: {f.peakTime}
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        f.occupancyRate > 80
                          ? 'bg-gradient-to-r from-red-500 to-rose-600'
                          : f.occupancyRate > 60
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      )}
                      style={{ width: `${f.occupancyRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1.5">
                    <span>{f.deskCount} desks configured</span>
                    <span>{f.occupancyRate}% utilization</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Bookings Activity */}
        <Card className="bg-white dark:bg-gray-950 border-gray-200/60 dark:border-gray-800/80 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-900 pb-3">
            <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-brand-500" />
              Recent Booking Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-900/40">
            {recentBookings.map(b => {
              const user = users.find(u => u.id === b.userId);
              return (
                <div key={b.id} className="flex items-center justify-between py-3.5 first:pt-1.5 last:pb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user && <Avatar name={user.name} size="xs" />}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-950 dark:text-gray-250 truncate">{user?.name || 'Unknown User'}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        {b.resourceType.toUpperCase()} • {b.resourceId.split('-').pop()} • {format(new Date(b.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Waitlist Queue Logs */}
        <Card className="bg-white dark:bg-gray-950 border-gray-200/60 dark:border-gray-800/80 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-900 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-amber-500" />
              Waitlist Queue
            </CardTitle>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              {waitlist.length} WAITING
            </span>
          </CardHeader>
          <CardContent className="divide-y divide-gray-100 dark:divide-gray-900/40">
            {waitlist.length > 0 ? (
              waitlist.map((entry) => {
                const user = users.find(u => u.id === entry.userId);
                const floor = floors.find(f => f.id === entry.floorId);
                return (
                  <div key={entry.id} className="flex items-center justify-between py-3.5 first:pt-1.5 last:pb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user && <Avatar name={user.name} size="xs" />}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-950 dark:text-gray-250 truncate">{user?.name || 'Unknown User'}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {entry.resourceType.toUpperCase()} • {floor?.name || entry.floorId} • {format(new Date(entry.date), 'MMM d')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-1 py-0.5 rounded">
                        #{entry.position}
                      </span>
                      {entry.notified ? (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                          Notified
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-gray-400 text-xs font-semibold">Queue is currently empty</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
