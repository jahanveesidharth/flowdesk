import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Download, Calendar, ChevronDown, Eye } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { BookingCard } from '../../components/booking/BookingCard';
import { Tabs } from '../../components/ui/Tabs';
import { cn, formatDate, formatTimeRange } from '../../lib/utils';
import { downloadCsv } from '../../lib/exportCsv';
import type { Booking } from '../../types';

export function AdminBookings() {
  const { bookings, users, floors, desks, rooms } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;
  const today = format(new Date(), 'yyyy-MM-dd');

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (typeFilter !== 'all' && b.resourceType !== typeFilter) return false;
    if (dateFilter && b.date !== dateFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const user = users.find(u => u.id === b.userId);
      return (user?.name || '').toLowerCase().includes(s) || b.resourceId.toLowerCase().includes(s) || (b.title || '').toLowerCase().includes(s) || b.id.includes(s);
    }
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const todayBookings = bookings.filter(b => b.date === today);
  const activeBookings = bookings.filter(b => ['confirmed', 'checked_in', 'pending'].includes(b.status));

  const getResourceLabel = (b: Booking) => {
    if (b.resourceType === 'desk') return desks.find(d => d.id === b.resourceId)?.label || b.resourceId;
    if (b.resourceType === 'room') return rooms.find(r => r.id === b.resourceId)?.name || b.resourceId;
    return b.resourceId;
  };

  const handleExportCsv = () => {
    downloadCsv(`bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`, filtered.map(booking => {
      const user = users.find(u => u.id === booking.userId);
      const floor = floors.find(f => f.id === booking.floorId);
      return {
        id: booking.id,
        user: user?.name || 'Unknown',
        department: user?.department || '',
        resourceType: booking.resourceType,
        resource: getResourceLabel(booking),
        floor: floor?.name || '',
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        title: booking.title || '',
        notes: booking.notes || '',
        createdAt: booking.createdAt,
      };
    }));
  };

  return (
    <div id="tour-admin-bookings-page" className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">All Bookings</h1>
        <Button variant="outline" size="sm" iconLeft={<Download className="w-4 h-4" />} onClick={handleExportCsv}>
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Today', value: todayBookings.length, sub: 'bookings', key: 'Today' },
          { label: 'Active', value: activeBookings.length, sub: 'confirmed/in progress', key: 'Active' },
          { label: 'Check-ins', value: bookings.filter(b => b.date === today && b.status === 'checked_in').length, sub: 'today', key: 'Check-ins' },
          { label: 'Cancellations', value: bookings.filter(b => b.status === 'cancelled').length, sub: 'total', key: 'Cancellations' },
        ].map(({ label, value, sub, key }) => {
          const cardStyles = {
            'Today': {
              className: "border-[#734B69]/25 hover:border-[#734B69]/60 dark:border-[#734B69]/40 bg-[#F5E6F0] dark:bg-[#734B69]/20",
              textColor: "text-[#734B69] dark:text-[#e8c0de]"
            },
            'Active': {
              className: "border-[#cc7768]/25 hover:border-[#cc7768]/60 dark:border-[#cc7768]/40 bg-[#cc7768]/15 dark:bg-[#cc7768]/20",
              textColor: "text-[#cc7768] dark:text-[#ffaa9e]"
            },
            'Check-ins': {
              className: "border-[#46909e]/25 hover:border-[#46909e]/60 dark:border-[#46909e]/40 bg-[#ecf4f6] dark:bg-[#46909e]/20",
              textColor: "text-[#286f7c] dark:text-[#8ccce4]"
            },
            'Cancellations': {
              className: "border-[#5c5c94]/25 hover:border-[#5c5c94]/60 dark:border-[#5c5c94]/40 bg-[#E6E6FA] dark:bg-[#5c5c94]/20",
              textColor: "text-[#5c5c94] dark:text-[#b4b4e8]"
            }
          };
          const style = cardStyles[key as keyof typeof cardStyles];
          return (
            <div
              key={label}
              className={cn(
                "border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300",
                style.className
              )}
            >
              <div className={cn("text-2xl font-extrabold tracking-tight", style.textColor)}>{value}</div>
              <div className="text-xs font-bold text-gray-800 dark:text-gray-250 mt-1">{label}</div>
              <div className="text-[10px] font-bold text-gray-800 dark:text-gray-250 uppercase tracking-wider">{sub}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <Input
          placeholder="Search by user, resource, title..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          iconLeft={<Search className="w-4 h-4" />}
          className="w-64"
        />
        <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="w-36"
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'checked_in', label: 'Checked In' },
            { value: 'pending', label: 'Pending' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'completed', label: 'Completed' },
            { value: 'no_show', label: 'No Show' },
          ]}
        />
        <Select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="w-32"
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'desk', label: 'Desks' },
            { value: 'room', label: 'Rooms' },
            { value: 'parking', label: 'Parking' },
            { value: 'locker', label: 'Lockers' },
          ]}
        />
        <input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 h-9"
        />
        {(search || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); setDateFilter(''); setPage(1); }}>
            Clear filters
          </Button>
        )}
        <span className="ml-auto text-sm text-gray-500">{filtered.length} bookings</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 text-xs font-semibold text-gray-500">User</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Resource</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Date</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Time</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Floor</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(booking => {
                const user = users.find(u => u.id === booking.userId);
                const floor = floors.find(f => f.id === booking.floorId);
                return (
                  <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {user && <Avatar name={user.name} size="xs" />}
                        <div>
                          <p className="font-medium text-gray-900">{user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{user?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{getResourceLabel(booking)}</p>
                        <p className="text-xs text-gray-400 capitalize">{booking.resourceType}</p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">{formatDate(booking.date)}</td>
                    <td className="p-3 text-gray-700">{formatTimeRange(booking.startTime, booking.endTime)}</td>
                    <td className="p-3 text-gray-600">{floor?.name || '—'}</td>
                    <td className="p-3"><StatusBadge status={booking.status} /></td>
                    <td className="p-3">
                      <Button size="xs" variant="ghost" iconLeft={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedBooking(booking)}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <Button size="xs" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <Button key={p} size="xs" variant={p === page ? 'primary' : 'ghost'} onClick={() => setPage(p)}>{p}</Button>
              ))}
              <Button size="xs" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details" size="md">
        {selectedBooking && <BookingCard booking={selectedBooking} showUser className="rounded-[22px]" />}
      </Modal>
    </div>
  );
}
