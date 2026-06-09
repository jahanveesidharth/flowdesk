import { Calendar, Clock, MapPin, CheckCircle, XCircle, LogIn, LogOut, RotateCcw } from 'lucide-react';
import type { Booking, Desk, Room } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { cn, formatDate, formatTimeRange, formatTimeAgo } from '../../lib/utils';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { ConfirmModal } from '../ui/Modal';
import { QrCheckInModal } from './QrCheckInModal';
import toast from 'react-hot-toast';

interface BookingCardProps {
  booking: Booking;
  compact?: boolean;
  showUser?: boolean;
}

export function BookingCard({ booking, compact, showUser }: BookingCardProps) {
  const { desks, rooms, parkingSpaces, lockers, floors, users, cancelBooking, checkIn, checkOut, currentUser } = useAppStore();
  const [showCancel, setShowCancel] = useState(false);
  const [showQrCheckIn, setShowQrCheckIn] = useState(false);

  const getResource = () => {
    if (booking.resourceType === 'desk') return desks.find(d => d.id === booking.resourceId);
    if (booking.resourceType === 'room') return rooms.find(r => r.id === booking.resourceId);
    if (booking.resourceType === 'parking') return parkingSpaces.find(p => p.id === booking.resourceId);
    if (booking.resourceType === 'locker') return lockers.find(l => l.id === booking.resourceId);
    return null;
  };

  const resource = getResource();
  const floor = floors.find(f => f.id === booking.floorId);
  const user = users.find(u => u.id === booking.userId);
  const resourceLabel = resource ? ('label' in resource ? resource.label : ('name' in resource ? resource.name : '')) : booking.resourceId;

  const canCheckIn = booking.status === 'confirmed';
  const canCheckOut = booking.status === 'checked_in';
  const canCancel = ['confirmed', 'pending'].includes(booking.status);

  const handleCheckIn = () => {
    checkIn(booking.id);
    toast.success('Checked in successfully!');
  };

  const handleCheckOut = () => {
    checkOut(booking.id);
    toast.success('Checked out. See you next time!');
  };

  const handleCancel = () => {
    cancelBooking(booking.id);
    toast('Booking cancelled', { icon: '❌' });
    setShowCancel(false);
  };

  const typeIcon: Record<string, string> = { desk: '🪑', room: '🚪', parking: '🚗', locker: '🔒' };
  const isMyBooking = booking.userId === currentUser.id;

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 rounded-xl border bg-white transition-all hover:shadow-sm',
        booking.status === 'checked_in' && 'border-blue-200 bg-blue-50',
        booking.status === 'cancelled' && 'opacity-60',
      )}>
        <span className="text-xl">{typeIcon[booking.resourceType]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">{resourceLabel}</span>
            {booking.title && <span className="text-xs text-gray-400 truncate">— {booking.title}</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <Calendar className="w-3 h-3" /> {formatDate(booking.date)}
            <Clock className="w-3 h-3 ml-1" /> {formatTimeRange(booking.startTime, booking.endTime)}
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        'bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all',
        booking.status === 'checked_in' && 'border-blue-300 ring-1 ring-blue-200',
        booking.status === 'cancelled' && 'opacity-60',
        booking.status === 'completed' && 'border-gray-100',
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0',
            booking.resourceType === 'desk' ? 'bg-blue-50' :
            booking.resourceType === 'room' ? 'bg-green-50' :
            booking.resourceType === 'parking' ? 'bg-yellow-50' : 'bg-purple-50',
          )}>
            {typeIcon[booking.resourceType]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{resourceLabel}</h4>
              {booking.isRecurring && <span className="text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 flex items-center gap-0.5"><RotateCcw className="w-3 h-3" /> Recurring</span>}
              <div className="ml-auto"><StatusBadge status={booking.status} /></div>
            </div>
            {booking.title && <p className="text-sm text-gray-600 mb-1">{booking.title}</p>}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(booking.date)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTimeRange(booking.startTime, booking.endTime)}</span>
              {floor && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {floor.name}</span>}
            </div>
            {showUser && user && (
              <div className="text-xs text-gray-400 mt-1">{user.name} · {user.department}</div>
            )}
            {booking.checkInTime && (
              <div className="text-xs text-blue-600 mt-1">Checked in: {booking.checkInTime}</div>
            )}
            {booking.notes && (
              <p className="text-xs text-gray-400 mt-1 italic">{booking.notes}</p>
            )}
          </div>
        </div>

        {isMyBooking && (canCheckIn || canCheckOut || canCancel) && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {canCheckIn && (
              <Button size="xs" variant="success" iconLeft={<LogIn className="w-3.5 h-3.5" />} onClick={() => setShowQrCheckIn(true)}>
                Check In / QR
              </Button>
            )}
            {canCheckOut && (
              <Button size="xs" variant="secondary" iconLeft={<LogOut className="w-3.5 h-3.5" />} onClick={handleCheckOut}>
                Check Out
              </Button>
            )}
            {canCancel && (
              <Button size="xs" variant="outline" className="ml-auto text-red-500 hover:text-red-600 border-red-200 dark:border-red-900/60" onClick={() => setShowCancel(true)}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message={`Are you sure you want to cancel your booking for ${resourceLabel} on ${formatDate(booking.date)}?`}
        confirmLabel="Cancel Booking"
        variant="danger"
      />

      <QrCheckInModal
        isOpen={showQrCheckIn}
        onClose={() => setShowQrCheckIn(false)}
        booking={booking}
      />
    </>
  );
}
