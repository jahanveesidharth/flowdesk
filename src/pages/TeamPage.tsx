import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Search, MapPin, Users, Calendar } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { cn, formatDate } from '../lib/utils';

export function TeamPage() {
  const { users, bookings, floors, desks, currentUser, attendancePlans } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Map unassigned or 'General' departments to standard departments deterministically
  const usersWithDept = users.map(u => {
    if (u.department && u.department !== 'General') return u;
    const depts = ['Engineering', 'Design', 'Marketing', 'Operations', 'HR', 'Sales'];
    const code = u.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const department = depts[code % depts.length];
    return { ...u, department };
  });

  const filteredUsers = usersWithDept.filter(u =>
    u.id !== currentUser.id &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
     u.department.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const getUserStatus = (userId: string, date: string) => {
    const booking = bookings.find(b =>
      b.userId === userId && b.date === date && !['cancelled', 'completed', 'no_show'].includes(b.status)
    );
    const plan = attendancePlans.find(ap => ap.userId === userId && ap.date === date);
    
    const status: 'office' | 'remote' | 'off' | 'unknown' = 
      booking ? 'office' : (plan ? plan.status : 'unknown');

    const floor = booking ? floors.find(f => f.id === booking.floorId) : null;
    const desk = booking && booking.resourceType === 'desk' ? desks.find(d => d.id === booking.resourceId) : null;

    let text = 'Unknown';
    if (status === 'office') text = 'In Office';
    if (status === 'remote') text = 'Working Remotely';
    if (status === 'off') text = 'Out of Office';

    return { status, text, floor, desk, booking };
  };

  // Group by department
  const departments = [...new Set(usersWithDept.filter(u => u.id !== currentUser.id).map(u => u.department))];

  const inOfficeToday = usersWithDept.filter(u => {
    if (u.id === currentUser.id) return false;
    const { status } = getUserStatus(u.id, selectedDate);
    return status === 'office';
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Team</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center bg-blue-50 border-0">
          <div className="text-2xl font-bold text-blue-700">{usersWithDept.length - 1}</div>
          <div className="text-xs text-blue-500 mt-0.5">Total Colleagues</div>
        </Card>
        <Card className="text-center bg-green-50 border-0">
          <div className="text-2xl font-bold text-green-700">{inOfficeToday.length}</div>
          <div className="text-xs text-green-500 mt-0.5">In Office {formatDate(selectedDate)}</div>
        </Card>
        <Card className="text-center bg-gray-50 border-0">
          <div className="text-2xl font-bold text-gray-700">{departments.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Departments</div>
        </Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by name, department, or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        iconLeft={<Search className="w-4 h-4" />}
      />

      {/* Team list */}
      <div className="space-y-6">
        {(search ? [{ dept: 'Results', users: filteredUsers }] : departments.map(dept => ({
          dept,
          users: usersWithDept.filter(u => u.id !== currentUser.id && u.department === dept),
        }))).map(({ dept, users: deptUsers }) => (
          <div key={dept}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-700">{dept}</h2>
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{deptUsers.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {deptUsers.map(user => {
                const { status, text, floor, desk, booking } = getUserStatus(user.id, selectedDate);
                const isInOffice = status === 'office';
                return (
                  <Card key={user.id} hover className={cn(isInOffice && 'border-green-200/80 shadow-sm shadow-green-500/2')}>
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar name={user.name} size="lg" />
                        <div className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950',
                          status === 'office' && 'bg-green-500',
                          status === 'remote' && 'bg-blue-500',
                          status === 'off' && 'bg-rose-500',
                          status === 'unknown' && 'bg-gray-300 dark:bg-gray-700',
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                          {user.role === 'manager' && <Badge variant="info" size="sm">Manager</Badge>}
                          {user.role === 'admin' && <Badge variant="warning" size="sm">Admin</Badge>}
                        </div>
                        <p className="text-xs text-gray-550 dark:text-gray-400 truncate">{user.email}</p>
                        <div className="mt-2 space-y-1">
                          {status === 'office' && (
                            <>
                              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                In Office
                              </div>
                              {floor && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  {floor.name}{desk ? ` · ${desk.label}` : ''}
                                </div>
                              )}
                              {booking && (
                                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  {booking.startTime} – {booking.endTime}
                                </div>
                              )}
                            </>
                          )}
                          {status === 'remote' && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Working Remotely
                            </div>
                          )}
                          {status === 'off' && (
                            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Out of Office
                            </div>
                          )}
                          {status === 'unknown' && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-750" />
                              Not in office today
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
