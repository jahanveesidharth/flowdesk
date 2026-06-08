import { useState } from 'react';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingWizard } from '../components/booking/BookingWizard';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

type TabId = 'upcoming' | 'today' | 'past' | 'all';

export function MyBookings() {
  const { bookings, currentUser } = useAppStore();
  const [tab, setTab] = useState<TabId>('upcoming');
  const [showBooking, setShowBooking] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const today = format(new Date(), 'yyyy-MM-dd');
  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  const filtered = myBookings.filter(b => {
    if (typeFilter !== 'all' && b.resourceType !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!b.resourceId.includes(s) && !(b.title || '').toLowerCase().includes(s) && !b.date.includes(s)) return false;
    }
    if (tab === 'today') return b.date === today && b.status !== 'cancelled';
    if (tab === 'upcoming') return b.date > today && b.status !== 'cancelled';
    if (tab === 'past') return b.date < today || ['completed', 'cancelled', 'no_show'].includes(b.status);
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const counts = {
    today: myBookings.filter(b => b.date === today && b.status !== 'cancelled').length,
    upcoming: myBookings.filter(b => b.date > today && b.status !== 'cancelled').length,
    past: myBookings.filter(b => b.date < today || ['completed', 'cancelled', 'no_show'].includes(b.status)).length,
    all: myBookings.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Bookings</h1>
        <Button iconLeft={<Plus className="w-4 h-4" />} onClick={() => setShowBooking(true)}>New Booking</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Today', count: counts.today, color: 'blue' },
          { label: 'Upcoming', count: counts.upcoming, color: 'green' },
          { label: 'Past', count: counts.past, color: 'gray' },
          { label: 'Total', count: counts.all, color: 'purple' },
        ].map(({ label, count, color }) => (
          <div key={label} className={cn('bg-white rounded-xl border border-gray-200 p-4 text-center')}>
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <Tabs
          tabs={[
            { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { id: 'today', label: 'Today', count: counts.today },
            { id: 'past', label: 'Past', count: counts.past },
            { id: 'all', label: 'All', count: counts.all },
          ]}
          activeTab={tab}
          onChange={(id) => setTab(id as TabId)}
        />
        <div className="ml-auto flex gap-2">
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            iconLeft={<Search className="w-4 h-4" />}
            className="w-48"
          />
          <Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-36"
            options={[
              { value: 'all', label: 'All types' },
              { value: 'desk', label: 'Desks' },
              { value: 'room', label: 'Rooms' },
              { value: 'parking', label: 'Parking' },
              { value: 'locker', label: 'Lockers' },
            ]}
          />
        </div>
      </div>

      {/* Booking list */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No bookings found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {tab === 'upcoming' ? "You have no upcoming bookings." : "Nothing to show here."}
          </p>
          <Button className="mt-4" size="sm" onClick={() => setShowBooking(true)} iconLeft={<Plus className="w-4 h-4" />}>
            Book a Space
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => <BookingCard key={b.id} booking={b} />)}
        </div>
      )}

      <BookingWizard isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  );
}
