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
  const now = new Date();
  const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  const filtered = myBookings.filter(b => {
    if (typeFilter !== 'all' && b.resourceType !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!b.resourceId.includes(s) && !(b.title || '').toLowerCase().includes(s) && !b.date.includes(s)) return false;
    }
    const isTodayUpcoming = b.date === today && currentHourMin <= b.endTime;
    const isFuture = b.date > today;
    const isPast = b.date < today || (b.date === today && currentHourMin > b.endTime);

    if (tab === 'today') return b.date === today && b.status !== 'cancelled';
    if (tab === 'upcoming') return (isFuture || isTodayUpcoming) && b.status !== 'cancelled';
    if (tab === 'past') return (isPast || ['completed', 'cancelled', 'no_show'].includes(b.status));
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const counts = {
    today: myBookings.filter(b => b.date === today && b.status !== 'cancelled').length,
    upcoming: myBookings.filter(b => (b.date > today || (b.date === today && currentHourMin <= b.endTime)) && b.status !== 'cancelled').length,
    past: myBookings.filter(b => (b.date < today || (b.date === today && currentHourMin > b.endTime) || ['completed', 'cancelled', 'no_show'].includes(b.status))).length,
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
        <SummaryCard label="Today" count={counts.today} variant="today" />
        <SummaryCard label="Upcoming" count={counts.upcoming} variant="upcoming" />
        <SummaryCard label="Completed / Past" count={counts.past} variant="past" />
        <SummaryCard label="Total Bookings" count={counts.all} variant="total" />
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
function SummaryCard({ label, count, variant }: { label: string; count: number; variant: 'today' | 'upcoming' | 'past' | 'total' }) {
  const styles = {
    today: {
      className: "border-[#734B69]/20 hover:border-[#734B69]/50 dark:border-[#734B69]/30 bg-[#734B69]/[0.03] dark:bg-[#734B69]/10",
      textColor: "text-[#734B69] dark:text-[#a87d9f]"
    },
    upcoming: {
      className: "border-[#D1A153]/20 hover:border-[#D1A153]/50 dark:border-[#D1A153]/30 bg-[#D1A153]/[0.03] dark:bg-[#D1A153]/10",
      textColor: "text-[#D1A153] dark:text-[#e4be7d]"
    },
    past: {
      className: "border-[#6C7A89]/20 hover:border-[#6C7A89]/50 dark:border-[#6C7A89]/30 bg-[#6C7A89]/[0.03] dark:bg-[#6C7A89]/10",
      textColor: "text-[#6C7A89] dark:text-[#9bb3cc]"
    },
    total: {
      className: "border-[#2A2228]/15 hover:border-[#2A2228]/40 dark:border-[#FDFBF7]/10 bg-[#FDFBF7] dark:bg-[#2A2228]/30",
      textColor: "text-[#2A2228] dark:text-[#FDFBF7]"
    }
  };

  return (
    <div className={cn(
      "border rounded-xl p-4 flex items-center justify-between shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300", 
      styles[variant].className
    )}>
      <div className="space-y-0.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</div>
        <div className={cn("text-xl font-extrabold tracking-tight", styles[variant].textColor)}>{count}</div>
      </div>
    </div>
  );
}
