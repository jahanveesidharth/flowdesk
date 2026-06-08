import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { TrendingUp, TrendingDown, Users, Calendar, BarChart2, Download } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { MOCK_DAILY_STATS, MOCK_FLOOR_OCCUPANCY } from '../../data/mockData';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { cn } from '../../lib/utils';

export function Analytics() {
  const { desks, rooms, floors, bookings, users } = useAppStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [tab, setTab] = useState('overview');

  const periodDays = { '7d': 7, '30d': 30, '90d': 90 }[period];
  const stats = MOCK_DAILY_STATS.slice(-periodDays);

  const totalBookings = stats.reduce((sum, d) => sum + d.deskBookings + d.roomBookings, 0);
  const avgDailyBookings = Math.round(totalBookings / periodDays);
  const totalCheckIns = stats.reduce((sum, d) => sum + d.checkIns, 0);
  const totalNoShows = stats.reduce((sum, d) => sum + d.noShows, 0);
  const noShowRate = totalBookings > 0 ? Math.round((totalNoShows / totalBookings) * 100) : 0;

  const chartData = stats.map(d => ({
    date: format(new Date(d.date), period === '7d' ? 'EEE' : 'MMM d'),
    desks: d.deskBookings,
    rooms: d.roomBookings,
    parking: d.parkingBookings,
    checkIns: d.checkIns,
    noShows: d.noShows,
    users: d.uniqueUsers,
  }));

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const resourceBreakdown = [
    { name: 'Desks', value: stats.reduce((s, d) => s + d.deskBookings, 0) },
    { name: 'Rooms', value: stats.reduce((s, d) => s + d.roomBookings, 0) },
    { name: 'Parking', value: stats.reduce((s, d) => s + d.parkingBookings, 0) },
    { name: 'Lockers', value: stats.reduce((s, d) => s + d.lockerBookings, 0) },
  ];

  const hourlyData = [
    { hour: '8am', count: 12 }, { hour: '9am', count: 38 }, { hour: '10am', count: 45 },
    { hour: '11am', count: 40 }, { hour: '12pm', count: 28 }, { hour: '1pm', count: 22 },
    { hour: '2pm', count: 35 }, { hour: '3pm', count: 38 }, { hour: '4pm', count: 30 },
    { hour: '5pm', count: 18 }, { hour: '6pm', count: 8 },
  ];

  const departmentData = [
    { dept: 'Engineering', bookings: 142, occupancyRate: 78 },
    { dept: 'Design', bookings: 67, occupancyRate: 65 },
    { dept: 'Marketing', bookings: 48, occupancyRate: 52 },
    { dept: 'Sales', bookings: 89, occupancyRate: 70 },
    { dept: 'HR', bookings: 23, occupancyRate: 45 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all', period === p ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700')}
              >
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" iconLeft={<Download className="w-4 h-4" />}>Export</Button>
        </div>
      </div>

      <Tabs tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'occupancy', label: 'Occupancy' },
        { id: 'resources', label: 'Resources' },
        { id: 'departments', label: 'Departments' },
      ]} activeTab={tab} onChange={setTab} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: totalBookings, sub: `${avgDailyBookings}/day avg`, trend: +8, icon: <Calendar className="w-5 h-5" /> },
          { label: 'Unique Users', value: [...new Set(bookings.map(b => b.userId))].length, sub: `of ${users.length} total`, trend: +3, icon: <Users className="w-5 h-5" /> },
          { label: 'Check-in Rate', value: `${Math.round((totalCheckIns / totalBookings) * 100)}%`, sub: `${totalCheckIns} check-ins`, trend: +2, icon: <TrendingUp className="w-5 h-5" /> },
          { label: 'No-show Rate', value: `${noShowRate}%`, sub: `${totalNoShows} no-shows`, trend: -1, icon: <TrendingDown className="w-5 h-5" />, invertTrend: true },
        ].map(({ label, value, sub, trend, icon, invertTrend }) => (
          <Card key={label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl text-gray-500">{icon}</div>
            </div>
            <div className={cn('flex items-center gap-1 text-xs mt-2 font-medium',
              (invertTrend ? trend < 0 : trend > 0) ? 'text-green-600' : 'text-red-500'
            )}>
              {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(trend)}% vs last period
            </div>
          </Card>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Bookings trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking Trends</CardTitle>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Desks</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Rooms</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDesks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRooms" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.floor(periodDays / 7)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="desks" stroke="#3b82f6" fill="url(#colorDesks)" strokeWidth={2} />
                  <Area type="monotone" dataKey="rooms" stroke="#10b981" fill="url(#colorRooms)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak hours */}
            <Card>
              <CardHeader><CardTitle>Peak Booking Hours</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={hourlyData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#f04a16" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource breakdown */}
            <Card>
              <CardHeader><CardTitle>Resource Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={resourceBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                        {resourceBreakdown.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {resourceBreakdown.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                          {d.name}
                        </span>
                        <span className="font-semibold text-gray-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === 'occupancy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MOCK_FLOOR_OCCUPANCY.map(f => (
              <Card key={f.floorId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{f.floorName}</CardTitle>
                    <span className={cn('text-sm font-bold', f.occupancyRate > 80 ? 'text-red-600' : f.occupancyRate > 60 ? 'text-yellow-600' : 'text-green-600')}>
                      {f.occupancyRate}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-2 bg-gray-100 rounded-full mb-3">
                    <div className={cn('h-full rounded-full', f.occupancyRate > 80 ? 'bg-red-400' : f.occupancyRate > 60 ? 'bg-yellow-400' : 'bg-green-400')}
                      style={{ width: `${f.occupancyRate}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div><p className="font-bold text-gray-900">{f.deskCount}</p><p className="text-xs text-gray-500">Desks</p></div>
                    <div><p className="font-bold text-gray-900">{f.roomCount}</p><p className="text-xs text-gray-500">Rooms</p></div>
                    <div><p className="font-bold text-gray-900">{f.peakTime}</p><p className="text-xs text-gray-500">Peak Hour</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'resources' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Daily Booking Volume by Resource</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData.slice(-14)} barSize={12} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="desks" fill="#3b82f6" radius={[2,2,0,0]} />
                  <Bar dataKey="rooms" fill="#10b981" radius={[2,2,0,0]} />
                  <Bar dataKey="parking" fill="#f59e0b" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'departments' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Bookings by Department</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentData.map(d => (
                  <div key={d.dept}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{d.dept}</span>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{d.bookings} bookings</span>
                        <span className={cn('font-medium', d.occupancyRate > 70 ? 'text-red-600' : d.occupancyRate > 55 ? 'text-yellow-600' : 'text-green-600')}>
                          {d.occupancyRate}% utilization
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full" style={{ width: `${d.occupancyRate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
