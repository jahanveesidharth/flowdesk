import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Calendar, FolderHeart } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingWizard } from '../components/booking/BookingWizard';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { cn, formatDate } from '../lib/utils';

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
      
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 dark:border-gray-850/80 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Bookings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage and track your active workstation and facility bookings</p>
        </div>
        <Button className="rounded-xl font-bold shadow-sm" iconLeft={<Plus className="w-4 h-4" />} onClick={() => setShowBooking(true)}>
          New Booking
        </Button>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Today" count={counts.today} color="blue" icon="🟢" />
        <SummaryCard label="Upcoming" count={counts.upcoming} color="green" icon="📅" />
        <SummaryCard label="Completed / Past" count={counts.past} color="gray" icon="✓" />
        <SummaryCard label="Total Bookings" count={counts.all} color="purple" icon="📚" />
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-gray-950 p-3 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 shadow-sm">
        <Tabs
          tabs={[
            { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { id: 'today', label: 'Today', count: counts.today },
            { id: 'past', label: 'Past / Cancelled', count: counts.past },
            { id: 'all', label: 'All History', count: counts.all },
          ]}
          activeTab={tab}
          onChange={(id) => setTab(id as TabId)}
          className="border-b-0"
        />
        <div className="flex gap-2.5 items-center flex-wrap shrink-0">
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            iconLeft={<Search className="w-4 h-4" />}
            className="w-48 text-xs font-semibold rounded-xl"
          />
          <Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-36 text-xs font-semibold rounded-xl"
            options={[
              { value: 'all', label: 'All Spaces' },
              { value: 'desk', label: 'Desks Only' },
              { value: 'room', label: 'Rooms Only' },
              { value: 'parking', label: 'Parking Slots' },
              { value: 'locker', label: 'Lockers' },
            ]}
          />
        </div>
      </div>

      {/* Bookings Feed */}
      {filtered.length === 0 ? (
        <Card className="text-center py-16 dark:bg-gray-950 dark:border-gray-800/80">
          <div className="w-12 h-12 bg-gray-55/60 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-850 dark:text-gray-200 text-sm">No reservations found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            {tab === 'upcoming' ? "You have no upcoming space bookings scheduled right now." : "Nothing fits the active filter query."}
          </p>
          <Button className="mt-5 rounded-xl font-bold" size="sm" onClick={() => setShowBooking(true)} iconLeft={<Plus className="w-4 h-4" />}>
            Book a Space
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b.id} className="transition-all hover:scale-[1.008] duration-300">
              <BookingCard booking={b} />
            </div>
          ))}
        </div>
      )}

      <BookingWizard isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  );
}

// Visual mini status card matching layouts
function SummaryCard({ label, count, color, icon }: { label: string; count: number; color: 'blue' | 'green' | 'gray' | 'purple'; icon: string }) {
  const colorMap = {
    blue: 'bg-white hover:border-blue-200 dark:hover:border-blue-900/40 text-blue-700 dark:text-blue-400 border-gray-200 dark:border-gray-850',
    green: 'bg-white hover:border-emerald-200 dark:hover:border-emerald-900/40 text-green-700 dark:text-green-400 border-gray-200 dark:border-gray-850',
    gray: 'bg-white hover:border-gray-300 dark:hover:border-gray-700 text-gray-650 dark:text-gray-300 border-gray-200 dark:border-gray-850',
    purple: 'bg-white hover:border-purple-200 dark:hover:border-purple-900/40 text-purple-700 dark:text-purple-400 border-gray-200 dark:border-gray-855',
  };
  return (
    <div className={cn("border rounded-xl p-4 flex items-center justify-between shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 dark:bg-gray-950", colorMap[color])}>
      <div className="space-y-0.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</div>
        <div className="text-xl font-extrabold tracking-tight text-gray-950 dark:text-white">{count}</div>
      </div>
      <span className="text-xl filter drop-shadow-sm select-none opacity-90 shrink-0 ml-2">{icon}</span>
    </div>
  );
}
