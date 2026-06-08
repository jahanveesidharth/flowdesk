import { format, subDays } from 'date-fns';
import { Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate, formatTimeAgo } from '../../lib/utils';
import { MOCK_DAILY_STATS, MOCK_FLOOR_OCCUPANCY } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { cn } from '../../lib/utils';

export function AdminDashboard() {
  const { bookings, users, desks, rooms, floors } = useAppStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled');
  const activeUsers = [...new Set(todayBookings.map(b => b.userId))].length;
  const checkedIn = bookings.filter(b => b.date === today && b.status === 'checked_in').length;
  const noShows = bookings.filter(b => b.date === today && b.status === 'no_show').length;

  const totalDesks = desks.filter(d => d.isActive).length;
  const occupiedDesks = todayBookings.filter(b => b.resourceType === 'desk').length;
  const occupancyRate = totalDesks > 0 ? Math.round((occupiedDesks / totalDesks) * 100) : 0;

  const recentBookings = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  const last7Days = MOCK_DAILY_STATS.slice(-7);
  const weeklyData = last7Days.map(d => ({
    day: format(new Date(d.date), 'EEE'),
    desks: d.deskBookings,
    rooms: d.roomBookings,
    parking: d.parkingBookings,
  }));

  const pieData = [
    { name: 'Desks', value: todayBookings.filter(b => b.resourceType === 'desk').length, color: '#3b82f6' },
    { name: 'Rooms', value: todayBookings.filter(b => b.resourceType === 'room').length, color: '#10b981' },
    { name: 'Parking', value: todayBookings.filter(b => b.resourceType === 'parking').length, color: '#f59e0b' },
    { name: 'Lockers', value: todayBookings.filter(b => b.resourceType === 'locker').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">{formatDate(today)} overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today\'s Bookings', value: todayBookings.length, sub: `of ${totalDesks} capacity`, icon: <Calendar className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Users', value: activeUsers, sub: `${users.length} total users`, icon: <Users className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
          { label: 'Occupancy Rate', value: `${occupancyRate}%`, sub: `${occupiedDesks} of ${totalDesks} desks`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-brand-600 bg-brand-50' },
          { label: 'Check-ins Today', value: checkedIn, sub: `${noShows} no-shows`, icon: <CheckCircle className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, sub, icon, color }) => (
          <Card key={label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <div className={cn('p-2.5 rounded-xl', color)}>{icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly booking chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bookings This Week</CardTitle>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Desks</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Rooms</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="desks" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="rooms" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown pie */}
        <Card>
          <CardHeader><CardTitle>Today's Breakdown</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}</span>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400 text-sm py-8">No bookings today</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Floor occupancy */}
        <Card>
          <CardHeader><CardTitle>Floor Occupancy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {MOCK_FLOOR_OCCUPANCY.map(f => (
              <div key={f.floorId}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{f.floorName}</span>
                  <span className="text-xs text-gray-500">{f.occupancyRate}% · Peak {f.peakTime}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', f.occupancyRate > 80 ? 'bg-red-400' : f.occupancyRate > 60 ? 'bg-yellow-400' : 'bg-green-400')}
                    style={{ width: `${f.occupancyRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>{f.deskCount} desks</span>
                  <span>{Math.round(f.deskCount * f.occupancyRate / 100)} occupied</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentBookings.map(b => {
              const user = users.find(u => u.id === b.userId);
              return (
                <div key={b.id} className="flex items-center gap-2 py-1.5">
                  {user && <Avatar name={user.name} size="xs" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{b.resourceType} · {formatDate(b.date)}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
