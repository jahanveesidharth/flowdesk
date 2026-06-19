import { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Building2, Home as HomeIcon, LogOut, MapPin, Calendar, Clock, Lock, Car, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/ui/Button';
import { BookingWizard } from '../components/booking/BookingWizard';
import { cn } from '../lib/utils';
import { Avatar } from '../components/ui/Avatar';

export function MyWeek() {
  const { bookings, currentUser, users, attendancePlans, setAttendancePlan } = useAppStore();
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

  const getTeammateStatuses = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return users.filter(u => u.id !== currentUser.id).map(u => {
      const plan = attendancePlans.find(ap => ap.userId === u.id && ap.date === dateStr);
      const booking = bookings.find(b =>
        b.userId === u.id && b.date === dateStr && !['cancelled', 'completed'].includes(b.status)
      );
      const status: 'office' | 'remote' | 'off' | 'unplanned' = 
        plan ? plan.status : (booking ? 'office' : 'unplanned');
      return { user: u, status };
    });
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">
      {/* Header section with glass banner */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-white/60 dark:bg-gray-955/60 backdrop-blur-md p-4 sm:p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-purple-500/5 dark:from-brand-500/10 dark:to-purple-500/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-500" />
              Hybrid Planner
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Plan your weekly attendance, reserve office workspace, and stay synced with your teammates.
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-1 w-full sm:w-auto bg-gray-100/80 dark:bg-gray-900/80 p-1.5 rounded-xl border border-gray-200/40 dark:border-gray-800/40">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToday}
              className="px-2.5 py-1.5 h-8 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white border border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-55"
            >
              Today
            </Button>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden xs:block" />
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={prevWeek}
                className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 min-w-[125px] sm:min-w-[170px] text-center tracking-tight">
                {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={nextWeek}
                className="h-8 w-8 text-gray-500 hover:text-gray-950 dark:hover:text-white flex items-center justify-center p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Week summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pb-1">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = dateStr === today;
          const isWeekend = [0, 6].includes(day.getDay());
          
          const myPlan = attendancePlans.find(ap => ap.userId === currentUser.id && ap.date === dateStr);
          const dayBookings = getBookingsForDay(day);
          const status = myPlan ? myPlan.status : (dayBookings.length > 0 ? 'office' : null);

          return (
            <div 
              key={dateStr} 
              className={cn(
                'relative flex flex-col justify-between rounded-2xl p-4 text-center border-2 transition-all duration-300 bg-white dark:bg-gray-950',
                isToday 
                  ? 'border-brand-500 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/20' 
                  : 'border-gray-200/50 dark:border-gray-800/80 hover:border-brand-300/50 dark:hover:border-brand-800/50 shadow-sm',
                status === 'office' && 'bg-gradient-to-b from-white to-blue-50/20 dark:from-gray-950 dark:to-blue-950/5',
                status === 'remote' && 'bg-gradient-to-b from-white to-emerald-50/20 dark:from-gray-950 dark:to-emerald-950/5',
                status === 'off' && 'bg-gradient-to-b from-white to-rose-50/10 dark:from-gray-950 dark:to-rose-950/5',
                isWeekend && 'opacity-60 bg-gray-50/40 dark:bg-gray-900/10'
              )}
            >
              {isToday && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
              )}
              
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{format(day, 'EEEE')}</span>
                <div className={cn(
                  'text-2xl font-extrabold mt-1 tracking-tight', 
                  isToday ? 'text-brand-500' : 'text-gray-900 dark:text-white'
                )}>
                  {format(day, 'd')}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                {status === 'office' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                    <Building2 className="w-3.5 h-3.5" />
                    Office
                  </span>
                )}
                {status === 'remote' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                    <HomeIcon className="w-3.5 h-3.5" />
                    Home
                  </span>
                )}
                {status === 'off' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                    <LogOut className="w-3.5 h-3.5" />
                    Out
                  </span>
                )}
                {!status && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-transparent">
                    Unplanned
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBookings = getBookingsForDay(day);
          const isToday = dateStr === today;
          const isWeekend = [0, 6].includes(day.getDay());

          return (
            <div 
              key={dateStr} 
              className={cn(
                'flex flex-col border transition-all duration-300 rounded-2xl p-4 bg-white dark:bg-gray-950/40',
                isToday 
                  ? 'border-brand-500/50 shadow-md shadow-brand-500/5 ring-1 ring-brand-500/10' 
                  : 'border-gray-200/60 dark:border-gray-800/80 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700',
                isWeekend && 'opacity-65 bg-gray-50/30 dark:bg-gray-900/10'
              )}
            >
              {/* Card Header */}
              <div className="text-center pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{format(day, 'EEEE')}</div>
                <div className={cn(
                  'font-extrabold text-base mt-0.5 tracking-tight', 
                  isToday ? 'text-brand-500' : 'text-gray-800 dark:text-gray-200'
                )}>
                  {format(day, 'MMM d')}
                </div>
              </div>

              {/* Attendance Planner Toggle */}
              {!isWeekend ? (
                <div className="my-3 flex items-center gap-1 p-1 bg-gray-100/70 dark:bg-gray-900/70 rounded-xl border border-gray-200/10 dark:border-gray-700/10">
                  {(['office', 'remote', 'off'] as const).map(status => {
                    const myPlan = attendancePlans.find(ap => ap.userId === currentUser.id && ap.date === dateStr);
                    const isActive = myPlan ? myPlan.status === status : (status === 'office' && dayBookings.length > 0);
                    
                    const icons = {
                      office: <Building2 className="w-3.5 h-3.5" />,
                      remote: <HomeIcon className="w-3.5 h-3.5" />,
                      off: <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    };
                    
                    const statusStyles = {
                      office: 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/20 dark:border-gray-700/20 font-bold',
                      remote: 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/20 dark:border-gray-700/20 font-bold',
                      off: 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow-sm border border-gray-200/20 dark:border-gray-700/20 font-bold'
                    };

                    const tooltips = { 
                      office: 'Work from Office', 
                      remote: 'Work from Home', 
                      off: 'Out of Office' 
                    };
                    
                    return (
                      <button
                        key={status}
                        title={tooltips[status]}
                        onClick={() => setAttendancePlan(currentUser.id, dateStr, status)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                          isActive ? statusStyles[status] : 'hover:bg-white/30 dark:hover:bg-gray-800/10'
                        )}
                      >
                        {icons[status]}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="my-3 text-center py-1.5 text-xs text-gray-400 dark:text-gray-500 font-semibold italic bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  Weekend
                </div>
              )}

              {/* My bookings for day */}
              <div className="flex-1 space-y-2">
                {dayBookings.length > 0 ? (
                  <div className="space-y-2">
                    {dayBookings.map(b => {
                      const icons = { 
                        desk: <MapPin className="w-3.5 h-3.5 text-brand-500" />, 
                        room: <Building2 className="w-3.5 h-3.5 text-purple-500" />, 
                        parking: <Car className="w-3.5 h-3.5 text-blue-500" />, 
                        locker: <Lock className="w-3.5 h-3.5 text-amber-500" /> 
                      };

                      const colorClasses = {
                        desk: 'bg-brand-50/50 dark:bg-brand-950/10 border-brand-200/60 dark:border-brand-900/40',
                        room: 'bg-purple-50/50 dark:bg-purple-950/10 border-purple-200/60 dark:border-purple-900/40',
                        parking: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/60 dark:border-blue-900/40',
                        locker: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/40',
                      };

                      const typeLabels = {
                        desk: 'Desk',
                        room: 'Room',
                        parking: 'Parking',
                        locker: 'Locker'
                      };

                      return (
                        <div 
                          key={b.id} 
                          className={cn(
                            'border rounded-xl p-2.5 transition-all hover:scale-[1.02] duration-250 shadow-sm bg-white dark:bg-gray-950',
                            colorClasses[b.resourceType as keyof typeof colorClasses] || 'border-gray-200 dark:border-gray-800',
                            b.status === 'checked_in' && 'ring-1 ring-blue-500 bg-blue-50/10 dark:bg-blue-950/5'
                          )}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-semibold text-gray-900 dark:text-gray-150 flex items-center gap-1.5 text-xs truncate">
                              {icons[b.resourceType as keyof typeof icons]}
                              <span className="truncate">{b.resourceId.split('-').pop()}</span>
                            </div>
                            {b.status === 'checked_in' && (
                              <span className="flex items-center gap-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded border border-blue-200/20">
                                <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[10px] mt-1 font-medium">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{b.startTime}–{b.endTime}</span>
                          </div>
                          
                          {b.title && (
                            <div className="text-gray-400 dark:text-gray-500 text-[10px] truncate mt-1 border-t border-gray-100 dark:border-gray-900 pt-1 font-normal">
                              {b.title}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  !isWeekend && (
                    <button
                      onClick={() => { setPrefillDate(dateStr); setShowBooking(true); }}
                      className="w-full h-14 border-2 border-dashed border-gray-200 dark:border-gray-850 hover:border-brand-400 dark:hover:border-brand-900/60 rounded-xl text-xs text-gray-400 dark:text-gray-500 hover:text-brand-500 hover:bg-brand-50/10 dark:hover:bg-brand-950/10 transition-all flex flex-col items-center justify-center gap-1 font-semibold group"
                    >
                      <Plus className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                      <span>Book Space</span>
                    </button>
                  )
                )}
              </div>

              {/* Teammates list */}
              {(() => {
                const list = getTeammateStatuses(day).filter(x => x.status !== 'unplanned');
                if (list.length === 0) return null;
                return (
                  <div className="mt-4 pt-3 border-t border-gray-150/40 dark:border-gray-800 space-y-1.5">
                    <div className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">
                      Teammates ({list.length})
                    </div>
                    <div className="space-y-1.5">
                      {list.slice(0, 4).map(({ user, status }) => {
                        const statusColors = {
                          office: 'bg-blue-500 ring-blue-500/20',
                          remote: 'bg-emerald-500 ring-emerald-500/20',
                          off: 'bg-rose-500 ring-rose-500/20',
                          unplanned: 'bg-gray-400 ring-gray-400/20'
                        };

                        const statusText = {
                          office: 'Office',
                          remote: 'Remote',
                          off: 'Out'
                        };

                        return (
                          <div 
                            key={user.id} 
                            className="flex items-center justify-between gap-1.5 py-0.5 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors" 
                            title={`${user.name} - Working from ${statusText[status as 'office' | 'remote' | 'off'] || 'unplanned'}`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="relative">
                                <Avatar name={user.name} size="xs" />
                                <span className={cn(
                                  "absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-gray-900",
                                  statusColors[status as keyof typeof statusColors]
                                )} />
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-medium">
                                {user.name.split(' ')[0]}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                              {status === 'office' && 'Office'}
                              {status === 'remote' && 'Home'}
                              {status === 'off' && 'Out'}
                            </span>
                          </div>
                        );
                      })}
                      {list.length > 4 && (
                        <div className="text-[9px] text-gray-400 dark:text-gray-500 text-center font-bold bg-gray-50 dark:bg-gray-900/40 py-0.5 rounded">
                          +{list.length - 4} more colleagues
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
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
