import { useState } from 'react';
import { Car, Lock, MapPin, Plus, Zap, Accessibility } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { BookingWizard } from '../components/booking/BookingWizard';
import { cn, formatDate } from '../lib/utils';
import { format } from 'date-fns';

export function ParkingLockers() {
  const { parkingSpaces, lockers, bookings, currentUser, floors, selectedDate, setSelectedDate } = useAppStore();
  const [tab, setTab] = useState<'parking' | 'lockers'>('parking');
  const [showBooking, setShowBooking] = useState(false);
  const [bookingType, setBookingType] = useState<'parking' | 'locker'>('parking');

  const today = selectedDate || format(new Date(), 'yyyy-MM-dd');

  const myParkingBookings = bookings.filter(b =>
    b.userId === currentUser.id && b.resourceType === 'parking' && b.status !== 'cancelled'
  );
  const myLockerBookings = bookings.filter(b =>
    b.userId === currentUser.id && b.resourceType === 'locker' && b.status !== 'cancelled'
  );

  const isParkingBooked = (id: string) => bookings.some(b =>
    b.resourceId === id && b.date === today && b.resourceType === 'parking' && !['cancelled', 'completed'].includes(b.status)
  );

  const isLockerBooked = (id: string) => bookings.some(b =>
    b.resourceId === id && b.resourceType === 'locker' && !['cancelled', 'completed'].includes(b.status)
  );

  const parkingTypeIcon: Record<string, React.ReactNode> = {
    standard: <Car className="w-5 h-5" />,
    accessible: <Accessibility className="w-5 h-5" />,
    ev_charging: <Zap className="w-5 h-5" />,
    motorcycle: <span className="text-base">🏍</span>,
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Parking & Lockers</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            iconLeft={<Car className="w-4 h-4" />}
            onClick={() => { setBookingType('parking'); setShowBooking(true); }}
          >
            Book Parking
          </Button>
          <Button
            size="sm"
            iconLeft={<Lock className="w-4 h-4" />}
            onClick={() => { setBookingType('locker'); setShowBooking(true); }}
          >
            Book Locker
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'parking', label: 'Parking', count: parkingSpaces.length },
          { id: 'lockers', label: 'Lockers', count: lockers.length },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as 'parking' | 'lockers')}
      />

      {tab === 'parking' && (
        <div className="space-y-6">
          {/* My parking bookings */}
          {myParkingBookings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">My Parking Bookings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myParkingBookings.map(b => {
                  const space = parkingSpaces.find(p => p.id === b.resourceId);
                  return (
                    <Card key={b.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                        <Car className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{space?.label || b.resourceId}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(b.date)} · {b.startTime}–{b.endTime}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parking grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Parking Spaces</h2>
              <input
                type="date"
                value={today}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 px-2 py-1 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {parkingSpaces.map(space => {
                const booked = isParkingBooked(space.id);
                const isMine = bookings.some(b => b.resourceId === space.id && b.userId === currentUser.id && b.date === today && !['cancelled', 'completed'].includes(b.status));
                return (
                  <div
                    key={space.id}
                    className={cn(
                      'rounded-xl border-2 p-4 text-center transition-all',
                      isMine ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30' :
                      booked ? 'border-red-200 dark:border-red-900/70 bg-red-50 dark:bg-red-950/30 opacity-70' :
                      'border-green-200 dark:border-green-800/80 bg-green-50 dark:bg-green-950/30 hover:border-green-400 cursor-pointer',
                    )}
                  >
                    <div className={cn('flex justify-center mb-2', isMine ? 'text-brand-600 dark:text-brand-400' : booked ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400')}>
                      {parkingTypeIcon[space.type]}
                    </div>
                    <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{space.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{space.type.replace('_', ' ')}</div>
                    <div className={cn('text-xs font-medium mt-1', isMine ? 'text-brand-600 dark:text-brand-400' : booked ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400')}>
                      {isMine ? 'Mine' : booked ? 'Occupied' : 'Available'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" /> Standard</div>
            <div className="flex items-center gap-1"><Accessibility className="w-3.5 h-3.5 text-blue-400" /> Accessible</div>
            <div className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" /> EV Charging</div>
            <div className="flex items-center gap-1"><span>🏍</span> Motorcycle</div>
          </div>
        </div>
      )}

      {tab === 'lockers' && (
        <div className="space-y-6">
          {/* My locker bookings */}
          {myLockerBookings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">My Lockers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myLockerBookings.map(b => {
                  const locker = lockers.find(l => l.id === b.resourceId);
                  return (
                    <Card key={b.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{locker?.label || b.resourceId}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{locker?.size} · {locker ? floors.find(f => f.id === locker.floorId)?.name : ''}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lockers grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {lockers.map(locker => {
              const booked = isLockerBooked(locker.id);
              const isMine = locker.assignedUserId === currentUser.id || myLockerBookings.some(b => b.resourceId === locker.id);
              return (
                <div
                  key={locker.id}
                  className={cn(
                    'rounded-xl border-2 p-4 text-center transition-all',
                    isMine ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30' :
                    booked || locker.status === 'maintenance' ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70 opacity-60' :
                    'border-green-200 dark:border-green-800/80 bg-green-50 dark:bg-green-950/30 hover:border-green-400 cursor-pointer',
                  )}
                >
                  <Lock className={cn('w-5 h-5 mx-auto mb-2', isMine ? 'text-brand-500 dark:text-brand-400' : booked ? 'text-gray-400 dark:text-gray-500' : 'text-green-500 dark:text-green-400')} />
                  <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{locker.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{locker.size}</div>
                  <div className={cn('text-xs font-medium mt-1',
                    isMine ? 'text-brand-600 dark:text-brand-400' : booked ? 'text-gray-500 dark:text-gray-400' : locker.status === 'maintenance' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                  )}>
                    {isMine ? 'Mine' : locker.status === 'maintenance' ? 'Maintenance' : booked ? 'Occupied' : 'Available'}
                  </div>
                  {floors.find(f => f.id === locker.floorId) && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{floors.find(f => f.id === locker.floorId)?.name}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BookingWizard
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        prefillDate={selectedDate}
      />
    </div>
  );
}
