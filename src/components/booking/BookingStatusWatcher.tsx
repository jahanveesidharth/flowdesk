import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getBookingTimes } from '../../lib/utils';
import toast from 'react-hot-toast';

export function BookingStatusWatcher() {
  useEffect(() => {
    const checkStatuses = () => {
      const { currentUser, bookings, checkOut, cancelBooking, desks, rooms, parkingSpaces, lockers } = useAppStore.getState();
      if (!currentUser || !currentUser.id) return;

      const now = new Date();

      const getLabel = (b: typeof bookings[0]) => {
        let label = b.resourceId;
        if (b.resourceType === 'desk') {
          const d = desks.find(item => item.id === b.resourceId);
          if (d) label = d.label;
        } else if (b.resourceType === 'room') {
          const r = rooms.find(item => item.id === b.resourceId);
          if (r) label = r.name;
        } else if (b.resourceType === 'parking') {
          const p = parkingSpaces.find(item => item.id === b.resourceId);
          if (p) label = p.label;
        } else if (b.resourceType === 'locker') {
          const l = lockers.find(item => item.id === b.resourceId);
          if (l) label = l.label;
        }
        return label;
      };

      bookings.forEach((booking) => {
        const { end } = getBookingTimes(booking.date, booking.startTime, booking.endTime);
        const isCurrentUser = booking.userId === currentUser.id;

        // Auto check-out if checked in and end time has passed
        if (booking.status === 'checked_in') {
          if (now >= end) {
            const label = getLabel(booking);
            checkOut(booking.id)
              .then(() => {
                if (isCurrentUser) {
                  toast.success(`Automatically checked out from booking for ${label} as the booking time has ended.`, {
                    duration: 5000,
                    position: 'top-right',
                  });
                }
              })
              .catch((err) => {
                console.error('Failed to auto check-out booking:', err);
              });
          }
        }

        // Auto cancel if confirmed (not checked in) and end time has passed
        if (booking.status === 'confirmed') {
          if (now >= end) {
            const label = getLabel(booking);
            cancelBooking(booking.id, 'No-show: booking expired without check-in')
              .then(() => {
                if (isCurrentUser) {
                  toast.error(`Automatically cancelled booking for ${label} as it expired without check-in.`, {
                    duration: 5000,
                    position: 'top-right',
                  });
                }
              })
              .catch((err) => {
                console.error('Failed to auto-cancel booking:', err);
              });
          }
        }
      });
    };

    // Run checks initially and then every 10 seconds
    checkStatuses();
    const interval = setInterval(checkStatuses, 10000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
