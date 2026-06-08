import { useState } from 'react';
import { Search, UserPlus, Edit3, MoreVertical } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../lib/utils';
import type { User } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export function AdminUsers() {
  const { users, bookings, floors } = useAppStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.department.toLowerCase().includes(s);
    }
    return true;
  });

  const getUserStats = (userId: string) => {
    const userBookings = bookings.filter(b => b.userId === userId);
    const todayBooking = userBookings.find(b => b.date === today && !['cancelled'].includes(b.status));
    const floor = todayBooking ? floors.find(f => f.id === todayBooking.floorId) : null;
    return {
      totalBookings: userBookings.length,
      activeBookings: userBookings.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length,
      isInOffice: !!todayBooking,
      currentFloor: floor?.name,
    };
  };

  const roleColors: Record<string, string> = { admin: 'warning', manager: 'info', employee: 'default' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <Button iconLeft={<UserPlus className="w-4 h-4" />} size="sm" onClick={() => toast('Invite feature coming soon!')}>
          Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center bg-blue-50 border-0">
          <div className="text-2xl font-bold text-blue-700">{users.length}</div>
          <div className="text-xs text-blue-500">Total Users</div>
        </Card>
        <Card className="text-center bg-green-50 border-0">
          <div className="text-2xl font-bold text-green-700">
            {users.filter(u => bookings.some(b => b.userId === u.id && b.date === today && !['cancelled', 'completed'].includes(b.status))).length}
          </div>
          <div className="text-xs text-green-500">In Office Today</div>
        </Card>
        <Card className="text-center bg-purple-50 border-0">
          <div className="text-2xl font-bold text-purple-700">{users.filter(u => u.role === 'admin').length}</div>
          <div className="text-xs text-purple-500">Admins</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} iconLeft={<Search className="w-4 h-4" />} className="w-64" />
        <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-36"
          options={[
            { value: 'all', label: 'All Roles' },
            { value: 'employee', label: 'Employee' },
            { value: 'manager', label: 'Manager' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
        <span className="ml-auto text-sm text-gray-500">{filtered.length} users</span>
      </div>

      {/* User table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 text-xs font-semibold text-gray-500">User</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500">Role</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500">Department</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500">Status Today</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500">Bookings</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const stats = getUserStats(user.id);
              return (
                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={(roleColors[user.role] || 'default') as any} size="sm" className="capitalize">{user.role}</Badge>
                  </td>
                  <td className="p-3 text-gray-600">{user.department}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${stats.isInOffice ? 'bg-green-400' : 'bg-gray-300'}`} />
                      <span className={`text-xs font-medium ${stats.isInOffice ? 'text-green-700' : 'text-gray-500'}`}>
                        {stats.isInOffice ? `In Office${stats.currentFloor ? ` · ${stats.currentFloor}` : ''}` : 'Not in office'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium text-gray-900">{stats.totalBookings}</span>
                    <span className="text-xs text-gray-400 ml-1">total</span>
                  </td>
                  <td className="p-3">
                    <Button size="xs" variant="ghost" iconLeft={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setSelectedUser(user)}>
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* User detail modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={selectedUser?.name || ''} size="md">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name} size="xl" />
              <div>
                <p className="font-bold text-gray-900">{selectedUser.name}</p>
                <p className="text-gray-500">{selectedUser.email}</p>
                <Badge variant={(roleColors[selectedUser.role] || 'default') as any} className="capitalize mt-1">{selectedUser.role}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Department</p>
                <p className="font-medium text-gray-900 mt-0.5">{selectedUser.department}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Member since</p>
                <p className="font-medium text-gray-900 mt-0.5">{formatDate(selectedUser.createdAt.split('T')[0])}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Total Bookings</p>
                <p className="font-medium text-gray-900 mt-0.5">{bookings.filter(b => b.userId === selectedUser.id).length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">Active Bookings</p>
                <p className="font-medium text-gray-900 mt-0.5">{bookings.filter(b => b.userId === selectedUser.id && ['confirmed', 'checked_in'].includes(b.status)).length}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Recent Bookings</p>
              <div className="space-y-2">
                {bookings.filter(b => b.userId === selectedUser.id).slice(0, 4).map(b => (
                  <div key={b.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-700 capitalize">{b.resourceType} · {formatDate(b.date)}</span>
                    <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'error' : 'neutral'} size="sm">{b.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
