import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Booking, Notification, Floor, Desk, Room, ParkingSpace, Locker, WaitlistEntry, BookingFilters } from '../types';
import {
  MOCK_USERS, MOCK_BOOKINGS, MOCK_NOTIFICATIONS, MOCK_FLOORS,
  MOCK_DESKS, MOCK_ROOMS, MOCK_PARKING, MOCK_LOCKERS, MOCK_WAITLIST,
  CURRENT_USER, ADMIN_USER,
} from '../data/mockData';
import { format } from 'date-fns';

interface AppState {
  // Auth
  currentUser: User;
  isAdminMode: boolean;
  switchRole: () => void;
  users: User[];

  // Resources
  floors: Floor[];
  desks: Desk[];
  rooms: Room[];
  parkingSpaces: ParkingSpace[];
  lockers: Locker[];

  // Bookings
  bookings: Booking[];
  notifications: Notification[];
  waitlist: WaitlistEntry[];

  // UI state
  selectedFloorId: string;
  selectedDate: string;
  bookingFilters: BookingFilters;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';

  // Actions - Navigation
  setSelectedFloor: (floorId: string) => void;
  setSelectedDate: (date: string) => void;
  setBookingFilters: (filters: Partial<BookingFilters>) => void;
  setSidebarOpen: (open: boolean) => void;

  // Actions - Bookings
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Booking;
  cancelBooking: (bookingId: string, reason?: string) => void;
  checkIn: (bookingId: string) => void;
  checkOut: (bookingId: string) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;

  // Actions - Notifications
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => void;

  // Actions - Resources (admin)
  updateDesk: (deskId: string, updates: Partial<Desk>) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  addDesk: (desk: Omit<Desk, 'id'>) => void;
  removeDesk: (deskId: string) => void;
  updateFloor: (floorId: string, updates: Partial<Floor>) => void;

  // Actions - Waitlist
  addToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'position'>) => void;
  removeFromWaitlist: (entryId: string) => void;

  // Computed helpers
  getBookingsForDate: (date: string, userId?: string) => Booking[];
  getBookingsForUser: (userId: string) => Booking[];
  getDeskAvailability: (deskId: string, date: string) => boolean;
  getRoomAvailability: (roomId: string, date: string, startTime: string, endTime: string) => boolean;
}

let bookingCounter = 100;
let notifCounter = 100;
let waitlistCounter = 100;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: CURRENT_USER,
      isAdminMode: false,
      users: MOCK_USERS,
      floors: MOCK_FLOORS,
      desks: MOCK_DESKS,
      rooms: MOCK_ROOMS,
      parkingSpaces: MOCK_PARKING,
      lockers: MOCK_LOCKERS,
      bookings: MOCK_BOOKINGS,
      notifications: MOCK_NOTIFICATIONS,
      waitlist: MOCK_WAITLIST,
      selectedFloorId: 'f1',
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      bookingFilters: {},
      sidebarOpen: true,
      theme: 'light',

      switchRole: () => set(s => ({
        isAdminMode: !s.isAdminMode,
        currentUser: !s.isAdminMode ? ADMIN_USER : CURRENT_USER,
      })),

      setSelectedFloor: (floorId) => set({ selectedFloorId: floorId }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setBookingFilters: (filters) => set(s => ({ bookingFilters: { ...s.bookingFilters, ...filters } })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addBooking: (booking) => {
        const newBooking: Booking = {
          ...booking,
          id: `bk${++bookingCounter}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(s => ({ bookings: [...s.bookings, newBooking] }));

        // Add confirmation notification
        get().addNotification({
          userId: booking.userId,
          type: 'booking_confirmed',
          title: 'Booking Confirmed',
          message: `Your ${booking.resourceType} has been booked for ${booking.date} ${booking.startTime}–${booking.endTime}`,
          read: false,
          bookingId: newBooking.id,
        });

        return newBooking;
      },

      cancelBooking: (bookingId, reason) => {
        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId
              ? { ...b, status: 'cancelled', cancelReason: reason, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      checkIn: (bookingId) => {
        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId
              ? { ...b, status: 'checked_in', checkInTime: format(new Date(), 'HH:mm'), updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      checkOut: (bookingId) => {
        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId
              ? { ...b, status: 'completed', checkOutTime: format(new Date(), 'HH:mm'), updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      updateBooking: (bookingId, updates) => {
        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      markNotificationRead: (notifId) => {
        set(s => ({
          notifications: s.notifications.map(n => n.id === notifId ? { ...n, read: true } : n),
        }));
      },

      markAllNotificationsRead: () => {
        set(s => ({
          notifications: s.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: `n${++notifCounter}`,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ notifications: [newNotif, ...s.notifications] }));
      },

      updateDesk: (deskId, updates) => {
        set(s => ({
          desks: s.desks.map(d => d.id === deskId ? { ...d, ...updates } : d),
        }));
      },

      updateRoom: (roomId, updates) => {
        set(s => ({
          rooms: s.rooms.map(r => r.id === roomId ? { ...r, ...updates } : r),
        }));
      },

      addDesk: (desk) => {
        const newDesk: Desk = { ...desk, id: `desk-${Date.now()}` };
        set(s => ({ desks: [...s.desks, newDesk] }));
      },

      removeDesk: (deskId) => {
        set(s => ({ desks: s.desks.filter(d => d.id !== deskId) }));
      },

      updateFloor: (floorId, updates) => {
        set(s => ({
          floors: s.floors.map(f => f.id === floorId ? { ...f, ...updates } : f),
        }));
      },

      addToWaitlist: (entry) => {
        const entries = get().waitlist.filter(w => w.floorId === entry.floorId && w.date === entry.date);
        const position = entries.length + 1;
        const newEntry: WaitlistEntry = {
          ...entry,
          id: `wl${++waitlistCounter}`,
          position,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ waitlist: [...s.waitlist, newEntry] }));
      },

      removeFromWaitlist: (entryId) => {
        set(s => ({ waitlist: s.waitlist.filter(w => w.id !== entryId) }));
      },

      getBookingsForDate: (date, userId) => {
        const { bookings } = get();
        return bookings.filter(b =>
          b.date === date &&
          (!userId || b.userId === userId) &&
          b.status !== 'cancelled'
        );
      },

      getBookingsForUser: (userId) => {
        return get().bookings.filter(b => b.userId === userId && b.status !== 'cancelled');
      },

      getDeskAvailability: (deskId, date) => {
        const { bookings } = get();
        return !bookings.some(b =>
          b.resourceId === deskId &&
          b.date === date &&
          b.resourceType === 'desk' &&
          !['cancelled', 'completed', 'no_show'].includes(b.status)
        );
      },

      getRoomAvailability: (roomId, date, startTime, endTime) => {
        const { bookings } = get();
        return !bookings.some(b => {
          if (b.resourceId !== roomId || b.date !== date || b.resourceType !== 'room') return false;
          if (['cancelled', 'completed', 'no_show'].includes(b.status)) return false;
          return b.startTime < endTime && b.endTime > startTime;
        });
      },
    }),
    {
      name: 'deskflow-store',
      partialize: (state) => ({
        bookings: state.bookings,
        notifications: state.notifications,
        waitlist: state.waitlist,
        selectedFloorId: state.selectedFloorId,
        selectedDate: state.selectedDate,
        isAdminMode: state.isAdminMode,
        currentUser: state.currentUser,
        desks: state.desks,
      }),
    }
  )
);
