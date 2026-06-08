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
  const { users, bookings, floors, desks, currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const today = format(new Date(), 'yyyy-MM-dd');

  const filteredUsers = users.filter(u =>
    u.id !== currentUser.id &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
     u.department.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const getUserStatus = (userId: string, date: string) => {
    const booking = bookings.find(b =>
      b.userId === userId && b.date === date && !['cancelled', 'completed', 'no_show'].includes(b.status)
    );
    if (!booking) return { status: 'unknown' as const, text: 'Unknown', floor: null, desk: null };
    const floor = floors.find(f => f.id === booking.floorId);
    const desk = booking.resourceType === 'desk' ? desks.find(d => d.id === booking.resourceId) : null;
    return { status: 'office' as const, text: 'In Office', floor, desk, booking };
  };

  // Group by department
  const departments = [...new Set(users.filter(u => u.id !== currentUser.id).map(u => u.department))];

  const inOfficeToday = users.filter(u => {
    if (u.id === currentUser.id) return false;
    return bookings.some(b => b.userId === u.id && b.date === selectedDate && !['cancelled', 'completed', 'no_show'].includes(b.status));
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
          <div className="text-2xl font-bold text-blue-700">{users.length - 1}</div>
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
          users: users.filter(u => u.id !== currentUser.id && u.department === dept),
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
                  <Card key={user.id} hover className={cn(isInOffice && 'border-green-200')}>
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar name={user.name} size="lg" />
                        <div className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                          isInOffice ? 'bg-green-400' : 'bg-gray-300',
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                          {user.role === 'manager' && <Badge variant="info" size="sm">Manager</Badge>}
                          {user.role === 'admin' && <Badge variant="warning" size="sm">Admin</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="mt-2 space-y-1">
                          {isInOffice ? (
                            <>
                              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                In Office
                              </div>
                              {floor && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {floor.name}{desk ? ` · ${desk.label}` : ''}
                                </div>
                              )}
                              {booking && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Calendar className="w-3 h-3" />
                                  {booking.startTime} – {booking.endTime}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              Not in office {formatDate(selectedDate)}
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
