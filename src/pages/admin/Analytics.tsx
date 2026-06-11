import { useState } from 'react';
import { format } from 'date-fns';
import { 
  TrendingUp, TrendingDown, Users, Calendar, 
  Download, BarChart3, Activity, Clock
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MOCK_DAILY_STATS, MOCK_FLOOR_OCCUPANCY } from '../../data/mockData';
import { downloadCsv } from '../../lib/exportCsv';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { cn } from '../../lib/utils';

export function Analytics() {
  const { bookings, users } = useAppStore();
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

  const pieColors = ['#f04a16', '#3b82f6', '#10b981', '#8b5cf6'];
  const resourceBreakdown = [
    { name: 'Desks', value: stats.reduce((s, d) => s + d.deskBookings, 0) },
    { name: 'Rooms', value: stats.reduce((s, d) => s + d.roomBookings, 0) },
    { name: 'Parking', value: stats.reduce((s, d) => s + d.parkingBookings, 0) },
    { name: 'Lockers', value: stats.reduce((s, d) => s + d.lockerBookings, 0) },
  ];

  const hourlyData = [
    { hour: '8 AM', count: 12 }, { hour: '9 AM', count: 38 }, { hour: '10 AM', count: 45 },
    { hour: '11 AM', count: 40 }, { hour: '12 PM', count: 28 }, { hour: '1 PM', count: 22 },
    { hour: '2 PM', count: 35 }, { hour: '3 PM', count: 38 }, { hour: '4 PM', count: 30 },
    { hour: '5 PM', count: 18 }, { hour: '6 PM', count: 8 },
  ];

  const departmentData = [
    { dept: 'Engineering', bookings: 142, occupancyRate: 78 },
    { dept: 'Design', bookings: 67, occupancyRate: 65 },
    { dept: 'Marketing', bookings: 48, occupancyRate: 52 },
    { dept: 'Sales', bookings: 89, occupancyRate: 70 },
    { dept: 'HR', bookings: 23, occupancyRate: 45 },
  ];

  const handleExportCsv = () => {
    downloadCsv(`analytics-${period}-${format(new Date(), 'yyyy-MM-dd')}.csv`, stats.map(d => ({
      date: d.date,
      deskBookings: d.deskBookings,
      roomBookings: d.roomBookings,
      parkingBookings: d.parkingBookings,
      lockerBookings: d.lockerBookings,
      checkIns: d.checkIns,
      noShows: d.noShows,
      cancellations: d.cancellations,
      uniqueUsers: d.uniqueUsers,
    })));
  };

  // Glassmorphic Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel bg-white/95 dark:bg-gray-950/95 border border-gray-200/60 dark:border-gray-800/80 p-3 rounded-xl shadow-lg backdrop-blur-md text-xs space-y-1.5 min-w-[130px]">
          <p className="font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-1 mb-1">{label}</p>
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
                {entry.name}
              </span>
              <span className="font-bold text-gray-900 dark:text-white tabular-nums">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 dark:border-gray-850/80 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Executive Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time resource utilization and occupancy insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-150/60 dark:bg-gray-900/60 p-1 rounded-xl border border-gray-200/40 dark:border-gray-800/40 shadow-sm">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3.5 py-1 text-xs font-bold rounded-lg transition-all', 
                  period === p 
                    ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200/10 text-gray-950 dark:text-white' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="rounded-xl shadow-sm font-bold text-xs" iconLeft={<Download className="w-4 h-4" />} onClick={handleExportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs 
        tabs={[
          { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'occupancy', label: 'Floor Occupancy', icon: <Activity className="w-4 h-4" /> },
          { id: 'resources', label: 'Resource Splits', icon: <Calendar className="w-4 h-4" /> },
          { id: 'departments', label: 'Department Trends', icon: <Users className="w-4 h-4" /> },
        ]} 
        activeTab={tab} 
        onChange={setTab} 
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <KpiCard
          label="Total Bookings"
          value={totalBookings}
          sub={`${avgDailyBookings}/day average`}
          trend={+8}
          icon={<Calendar className="w-4.5 h-4.5" />}
          color="brand"
        />
        <KpiCard
          label="Active Users"
          value={[...new Set(bookings.map(b => b.userId))].length}
          sub={`out of ${users.length} profiles`}
          trend={+3}
          icon={<Users className="w-4.5 h-4.5" />}
          color="blue"
        />
        <KpiCard
          label="Check-In Rate"
          value={`${Math.round((totalCheckIns / totalBookings) * 100)}%`}
          sub={`${totalCheckIns} confirmations`}
          trend={+2}
          icon={<TrendingUp className="w-4.5 h-4.5" />}
          color="green"
        />
        <KpiCard
          label="No-Show Rate"
          value={`${noShowRate}%`}
          sub={`${totalNoShows} auto-releases`}
          trend={-1}
          icon={<TrendingDown className="w-4.5 h-4.5" />}
          invertTrend
          color="orange"
        />
      </div>

      {/* Tab Panels */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Main Booking Trend Chart */}
          <Card className="dark:bg-gray-950 dark:border-gray-800/80">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200">Daily Booking Volumes</CardTitle>
              <div className="flex gap-4 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Desks</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Rooms</span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDesks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRooms" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-900" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} interval={Math.floor(periodDays / 7)} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" name="Desks" dataKey="desks" stroke="#3b82f6" fill="url(#colorDesks)" strokeWidth={2.5} />
                  <Area type="monotone" name="Rooms" dataKey="rooms" stroke="#10b981" fill="url(#colorRooms)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Peak Hours Bar Chart */}
            <Card className="lg:col-span-3 dark:bg-gray-950 dark:border-gray-800/80">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <CardTitle className="text-sm font-bold text-gray-850 dark:text-gray-200">Peak Booking Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hourlyData} barSize={14} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-900" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar name="Bookings" dataKey="count" fill="#f04a16" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resource Breakdown Doughnut */}
            <Card className="lg:col-span-2 dark:bg-gray-950 dark:border-gray-800/80">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <CardTitle className="text-sm font-bold text-gray-850 dark:text-gray-200">Asset Usage Split</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-6">
                  <div className="relative flex items-center justify-center shrink-0 w-28 h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={resourceBreakdown} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={36} 
                          outerRadius={50} 
                          dataKey="value" 
                          paddingAngle={4}
                        >
                          {resourceBreakdown.map((_, i) => (
                            <Cell key={i} fill={pieColors[i]} className="stroke-white dark:stroke-gray-950 stroke-2" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <p className="text-xs font-extrabold text-gray-850 dark:text-gray-200">{totalBookings}</p>
                      <p className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Total</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {resourceBreakdown.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                        <span className="flex items-center gap-2 font-bold text-gray-650 dark:text-gray-300">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[i] }} />
                          {d.name}
                        </span>
                        <span className="font-extrabold text-gray-850 dark:text-gray-200 tabular-nums">{d.value}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            {MOCK_FLOOR_OCCUPANCY.map(f => (
              <Card key={f.floorId} className="dark:bg-gray-950 dark:border-gray-800/80">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-gray-850 dark:text-gray-200">{f.floorName}</CardTitle>
                    <Badge variant={f.occupancyRate > 80 ? 'error' : f.occupancyRate > 60 ? 'warning' : 'success'}>
                      {f.occupancyRate}% Occupied
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-900 rounded-full mb-5 overflow-hidden border border-gray-200/50 dark:border-gray-800/40">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all duration-500', 
                        f.occupancyRate > 80 ? 'bg-red-500' : f.occupancyRate > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${f.occupancyRate}%` }} 
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-100 dark:border-gray-850/80 pt-4">
                    <div>
                      <p className="text-base font-extrabold text-gray-850 dark:text-gray-200">{f.deskCount}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Desks</p>
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-gray-855 dark:text-gray-200">{f.roomCount}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Rooms</p>
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-gray-850 dark:text-gray-200">{f.peakTime}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Peak Hour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'resources' && (
        <div className="space-y-4">
          <Card className="dark:bg-gray-950 dark:border-gray-800/80">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <CardTitle className="text-sm font-bold text-gray-850 dark:text-gray-200">Daily Booking Volumes by Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData.slice(-14)} barSize={12} barGap={3} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-900" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Bar name="Desks" dataKey="desks" fill="#f04a16" radius={[2, 2, 0, 0]} />
                  <Bar name="Rooms" dataKey="rooms" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar name="Parking" dataKey="parking" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'departments' && (
        <div className="space-y-4">
          <Card className="dark:bg-gray-950 dark:border-gray-800/80">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <CardTitle className="text-sm font-bold text-gray-850 dark:text-gray-200">Utilization Rates by Department</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4.5 pt-2">
              {departmentData.map(d => (
                <div key={d.dept} className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/60 hover:border-gray-200 transition-colors">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-gray-750 dark:text-gray-250">{d.dept}</span>
                    <div className="flex gap-4 text-gray-400">
                      <span>{d.bookings} reservations</span>
                      <span className={cn(
                        d.occupancyRate > 70 ? 'text-red-500 dark:text-red-400' : d.occupancyRate > 55 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
                      )}>
                        {d.occupancyRate}% utilized
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-150 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200/20 dark:border-gray-800/30">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        d.occupancyRate > 70 ? 'bg-red-500' : d.occupancyRate > 55 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${d.occupancyRate}%` }} 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// KPI widget summary with border glow and dynamic indicators
function KpiCard({ label, value, sub, trend, icon, invertTrend, color }: {
  label: string; value: string | number; sub: string; trend: number; icon: React.ReactNode; 
  invertTrend?: boolean; color: 'brand' | 'blue' | 'green' | 'orange';
}) {
  const isPositive = trend > 0;
  const isGood = invertTrend ? !isPositive : isPositive;

  const colorMap = {
    brand: {
      border: 'hover:border-orange-200 dark:hover:border-orange-900/40 hover:shadow-orange-500/5',
      iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-500'
    },
    blue: {
      border: 'hover:border-blue-200 dark:hover:border-blue-900/40 hover:shadow-blue-500/5',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
    },
    green: {
      border: 'hover:border-emerald-200 dark:hover:border-emerald-900/40 hover:shadow-emerald-500/5',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
    },
    orange: {
      border: 'hover:border-amber-200 dark:hover:border-amber-900/40 hover:shadow-amber-500/5',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 dark:bg-gray-950 dark:border-gray-800/80",
      colorMap[color].border
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">{label}</p>
          <p className="text-2xl font-extrabold text-gray-850 dark:text-gray-250 tracking-tight mt-1 truncate">{value}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>
        </div>
        <div className={cn("w-9.5 h-9.5 rounded-xl border border-gray-100 dark:border-gray-800/40 flex items-center justify-center shrink-0 shadow-sm", colorMap[color].iconBg)}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-1.5 border-t border-gray-50 dark:border-gray-900">
        <span className={cn(
          'inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full',
          isGood 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400'
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend)}%</span>
        </span>
        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold">vs last week</span>
      </div>
    </Card>
  );
}
