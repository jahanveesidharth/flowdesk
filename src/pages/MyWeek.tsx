import { useState } from 'react';
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Home, Building2, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingWizard } from '../components/booking/BookingWizard';
import { cn, formatDate } from '../lib/utils';
import { Avatar } from '../components/ui/Avatar';

export function MyWeek() {
  const { bookings, currentUser, users, floors } = useAppStore();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showBooking, setShowBooking] = useState(false);
  const [prefillDate, setPrefillDate] = useState('');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const getBookingsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(b =>
      b.userId === currentUser.id && b.date === dateStr && b.status !== 'cancelled'
    );
  };

  const getTeammateBookings = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return users.filter(u => u.id !== currentUser.id).map(u => {
      const booking = bookings.find(b =>
        b.userId === u.id && b.date === dateStr && !['cancelled', 'completed'].includes(b.status)
      );
      return { user: u, booking };
    }).filter(({ booking }) => !!booking);
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Week</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          <Button variant="ghost" size="sm" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <Button variant="ghost" size="sm" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Week summary bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weekDays.map(day => {
          const dayBookings = getBookingsForDay(day);
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = dateStr === today;
          const isWeekend = [0, 6].includes(day.getDay());
          const hasDesk = dayBookings.some(b => b.resourceType === 'desk');
          return (
            <div key={dateStr} className={cn(
              'flex-1 min-w-[80px] rounded-xl p-3 text-center border-2 transition-all cursor-pointer',
              isToday ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-300',
              isWeekend && 'opacity-60',
            )}>
              <div className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</div>
              <div className={cn('text-lg font-bold mt-0.5', isToday ? 'text-brand-600' : 'text-gray-900')}>
                {format(day, 'd')}
              </div>
              {hasDesk ? (
                <div className="w-2 h-2 rounded-full bg-brand-500 mx-auto mt-1" title="Desk booked" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-200 mx-auto mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBookings = getBookingsForDay(day);
          const teammates = getTeammateBookings(day);
          const isToday = dateStr === today;
          const isWeekend = [0, 6].includes(day.getDay());

          return (
            <div key={dateStr} className={cn('space-y-2', isWeekend && 'opacity-60')}>
              <div className={cn('text-center py-2 rounded-xl', isToday && 'bg-brand-50 border border-brand-200')}>
                <div className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</div>
                <div className={cn('font-bold text-sm', isToday ? 'text-brand-700' : 'text-gray-700')}>
                  {format(day, 'MMM d')}
                </div>
              </div>

              {/* My bookings for day */}
              {dayBookings.length > 0 ? (
                <div className="space-y-1.5">
                  {dayBookings.map(b => {
                    const icons: Record<string, string> = { desk: '🪑', room: '🚪', parking: '🚗', locker: '🔒' };
                    return (
                      <div key={b.id} className={cn(
                        'bg-brand-50 border border-brand-200 rounded-xl p-2 text-xs',
                        b.status === 'checked_in' && 'bg-blue-50 border-blue-200',
                      )}>
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          <span>{icons[b.resourceType]}</span>
                          <span className="truncate">{b.resourceId.split('-').pop()}</span>
                        </div>
                        <div className="text-gray-500 mt-0.5">{b.startTime}–{b.endTime}</div>
                        {b.title && <div className="text-gray-400 truncate">{b.title}</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                !isWeekend && (
                  <button
                    onClick={() => { setPrefillDate(dateStr); setShowBooking(true); }}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-all flex flex-col items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Book
                  </button>
                )
              )}

              {/* Teammates */}
              {teammates.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-400 font-medium">Teammates ({teammates.length})</div>
                  {teammates.slice(0, 3).map(({ user, booking }) => (
                    <div key={user.id} className="flex items-center gap-1.5">
                      <Avatar name={user.name} size="xs" />
                      <span className="text-xs text-gray-500 truncate">{user.name.split(' ')[0]}</span>
                    </div>
                  ))}
                  {teammates.length > 3 && <div className="text-xs text-gray-400">+{teammates.length - 3} more</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BookingWizard
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        prefillDate={prefillDate}
      />
    </div>
  );
}
