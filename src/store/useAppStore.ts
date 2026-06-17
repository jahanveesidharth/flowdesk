import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, Booking, Notification, Floor, Desk, Room, ParkingSpace,
  Locker, WaitlistEntry, BookingFilters, AttendancePlan, AttendanceStatus, UserRole, Furniture
} from '../types';
import type { Database } from '../lib/database.types';
import {
  MOCK_USERS, MOCK_BOOKINGS, MOCK_NOTIFICATIONS, MOCK_FLOORS,
  MOCK_DESKS, MOCK_ROOMS, MOCK_PARKING, MOCK_LOCKERS, MOCK_WAITLIST,
  CURRENT_USER, ADMIN_USER, MOCK_FURNITURE,
} from '../data/mockData';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isDemoMode } from '../lib/demoMode';
import toast from 'react-hot-toast';
import { isBookingWithinCheckInWindow } from '../lib/utils';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

// Untyped client helper for database mutations to prevent strict TS generic payload complaints
const db = supabase as any;

// ─── DB Mapping Helpers ───────────────────────────────────────────────────────

const mapProfileFromDb = (p: any): User => ({
  id: p.id,
  name: p.name,
  email: p.email,
  role: p.role || 'employee',
  department: p.department || 'General',
  teamId: p.team_id || undefined,
  avatar: p.avatar_url || (p.name ? p.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : ''),
  preferences: {
    notificationsEnabled: p.preferences?.notificationsEnabled ?? true,
    emailReminders: p.preferences?.emailReminders ?? true,
    reminderMinutes: p.preferences?.reminderMinutes ?? 30,
    theme: p.preferences?.theme ?? 'light',
    weekStartsOn: p.preferences?.weekStartsOn ?? 1,
  },
  createdAt: p.created_at,
});

const mapDeskFromDb = (d: any): Desk => ({
  id: d.id,
  label: d.label,
  floorId: d.floor_id,
  zoneId: d.zone_id || undefined,
  type: d.type,
  status: d.status,
  x: d.x,
  y: d.y,
  width: d.width || 1,
  height: d.height || 1,
  amenities: d.amenities || [],
  notes: d.notes || undefined,
  fixedUserId: d.fixed_user_id || undefined,
  isActive: d.is_active ?? true,
  rotation: d.rotation || 0,
});

const mapRoomFromDb = (r: any): Room => ({
  id: r.id,
  name: r.name,
  floorId: r.floor_id,
  capacity: r.capacity || 4,
  type: r.type,
  status: r.status,
  amenities: r.amenities || [],
  x: r.x,
  y: r.y,
  width: r.width || 2,
  height: r.height || 2,
  imageUrl: r.image_url || undefined,
  isActive: r.is_active ?? true,
});

const mapParkingSpaceFromDb = (p: any): ParkingSpace => ({
  id: p.id,
  label: p.label,
  floorId: p.floor_id,
  type: p.type,
  status: p.status,
  x: p.x || 0,
  y: p.y || 0,
  isActive: p.is_active ?? true,
});

const mapLockerFromDb = (l: any): Locker => ({
  id: l.id,
  label: l.label,
  floorId: l.floor_id,
  size: l.size,
  status: l.status,
  assignedUserId: l.assigned_user_id || undefined,
  isActive: l.is_active ?? true,
});

const mapBookingFromDb = (b: any): Booking => ({
  id: b.id,
  userId: b.user_id,
  resourceType: b.resource_type,
  resourceId: b.resource_id,
  floorId: b.floor_id,
  buildingId: b.building_id,
  date: b.date,
  startTime: b.start_time ? b.start_time.slice(0, 5) : '',
  endTime: b.end_time ? b.end_time.slice(0, 5) : '',
  status: b.status,
  durationType: b.duration_type || 'full_day',
  title: b.title || undefined,
  notes: b.notes || undefined,
  attendees: b.attendee_ids || [],
  checkInTime: b.check_in_time ? b.check_in_time.slice(0, 5) : undefined,
  checkOutTime: b.check_out_time ? b.check_out_time.slice(0, 5) : undefined,
  isRecurring: b.is_recurring || false,
  recurringId: b.recurring_id || undefined,
  createdAt: b.created_at,
  updatedAt: b.updated_at,
  cancelReason: b.cancel_reason || undefined,
});

const mapNotificationFromDb = (n: any): Notification => ({
  id: n.id,
  userId: n.user_id,
  type: n.type,
  title: n.title,
  message: n.message,
  read: n.read,
  bookingId: n.booking_id || undefined,
  createdAt: n.created_at,
  actionUrl: n.action_url || undefined,
});

const mapWaitlistFromDb = (w: any): WaitlistEntry => ({
  id: w.id,
  userId: w.user_id,
  resourceType: w.resource_type,
  resourceId: w.resource_id || undefined,
  floorId: w.floor_id,
  zoneId: w.zone_id || undefined,
  date: w.date,
  startTime: w.start_time ? w.start_time.slice(0, 5) : '',
  endTime: w.end_time ? w.end_time.slice(0, 5) : '',
  position: w.position,
  notified: w.notified ?? false,
  createdAt: w.created_at,
});

const mapAttendancePlanFromDb = (ap: any): AttendancePlan => ({
  id: ap.id,
  userId: ap.user_id,
  date: ap.date,
  status: ap.status,
  createdAt: ap.created_at,
  updatedAt: ap.updated_at,
});

const mapFloorFromDb = (f: any): Floor => ({
  id: f.id,
  buildingId: f.building_id,
  name: f.name,
  level: f.level,
  gridWidth: f.grid_width,
  gridHeight: f.grid_height,
  zones: (f.zones || []).map((z: any) => ({
    id: z.id,
    name: z.name,
    floorId: z.floor_id,
    color: z.color,
    description: z.description || undefined,
    x: z.x,
    y: z.y,
    width: z.width,
    height: z.height,
  })),
  amenities: f.amenities || [],
  capacity: f.capacity || 0,
  isActive: f.is_active ?? true,
});

interface AppState {
  // Auth
  currentUser: User;
  isAdminMode: boolean;
  switchRole: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  setCurrentUserFromProfile: (profile: ProfileRow) => void;
  users: User[];

  // Resources
  floors: Floor[];
  desks: Desk[];
  rooms: Room[];
  parkingSpaces: ParkingSpace[];
  lockers: Locker[];
  furniture: Furniture[];

  // Bookings & Schedules
  bookings: Booking[];
  notifications: Notification[];
  waitlist: WaitlistEntry[];
  attendancePlans: AttendancePlan[];

  // UI state
  selectedFloorId: string;
  selectedDate: string;
  bookingFilters: BookingFilters;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  integrations: { name: string; desc: string; icon: string; connected: boolean }[];

  // Actions - Navigation
  setSelectedFloor: (floorId: string) => void;
  setSelectedDate: (date: string) => void;
  setBookingFilters: (filters: Partial<BookingFilters>) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleIntegration: (name: string) => void;

  // Actions - Bookings
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Booking>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  deleteAllBookingsForCurrentUser: () => Promise<void>;
  checkIn: (bookingId: string) => Promise<void>;
  checkOut: (bookingId: string) => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  deleteCurrentAccount: () => Promise<void>;

  // Actions - Attendance Planning
  setAttendancePlan: (userId: string, date: string, status: AttendanceStatus) => Promise<void>;

  // Actions - Notifications
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;

  // Actions - Resources (admin)
  updateDesk: (deskId: string, updates: Partial<Desk>) => Promise<void>;
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<void>;
  addDesk: (desk: Omit<Desk, 'id'>) => Promise<void>;
  removeDesk: (deskId: string) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  removeRoom: (roomId: string) => Promise<void>;
  updateFloor: (floorId: string, updates: Partial<Floor>) => Promise<void>;
  addFurniture: (item: Omit<Furniture, 'id'>) => Promise<void>;
  updateFurniture: (id: string, updates: Partial<Furniture>) => Promise<void>;
  removeFurniture: (id: string) => Promise<void>;

  // Actions - Waitlist
  addToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'position'>) => Promise<void>;
  removeFromWaitlist: (entryId: string) => Promise<void>;

  // Synchronization
  initSupabaseSync: () => () => void;
  resetToDemoData: () => void;
  setDemoRole: (role: 'employee' | 'admin') => void;

  // Computed helpers
  getBookingsForDate: (date: string, userId?: string) => Booking[];
  getBookingsForUser: (userId: string) => Booking[];
  getDeskAvailability: (deskId: string, date: string) => boolean;
  getRoomAvailability: (roomId: string, date: string, startTime: string, endTime: string) => boolean;
}

const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const canUseSupabase = () => isSupabaseConfigured() && !isDemoMode();

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
      furniture: MOCK_FURNITURE,
      bookings: MOCK_BOOKINGS,
      notifications: MOCK_NOTIFICATIONS,
      waitlist: MOCK_WAITLIST,
      attendancePlans: [],
      selectedFloorId: 'f1',
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      bookingFilters: {},
      sidebarOpen: true,
      theme: 'light',
      integrations: [
        { name: 'Google Calendar', desc: 'Sync bookings with Google Calendar', icon: '📅', connected: true },
        { name: 'Slack', desc: 'Get booking notifications in Slack', icon: '💬', connected: false },
        { name: 'Microsoft Teams', desc: 'Teams integration for room bookings', icon: '🤝', connected: false },
        { name: 'Okta SSO', desc: 'Single sign-on via Okta', icon: '🔐', connected: true },
        { name: 'QR Code System', desc: 'Check-in via QR codes', icon: '📱', connected: true },
      ],

      switchRole: () => set(s => {
        if (s.currentUser.role !== 'admin') {
          toast.error('Only admins can open admin mode.');
          return {};
        }
        const nextAdminMode = !s.isAdminMode;
        if (isValidUuid(s.currentUser.id)) {
          return {
            isAdminMode: nextAdminMode,
            currentUser: s.currentUser,
          };
        }
        return {
          isAdminMode: nextAdminMode,
          currentUser: nextAdminMode ? ADMIN_USER : CURRENT_USER,
        };
      }),

      updateProfile: async (updates) => {
        const { currentUser } = get();
        if (canUseSupabase() && isValidUuid(currentUser.id)) {
          try {
            const payload: Record<string, any> = {};
            if (updates.name !== undefined) payload.name = updates.name;
            if (updates.email !== undefined) payload.email = updates.email;
            if (updates.department !== undefined) payload.department = updates.department;
            if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;
            if (updates.preferences !== undefined) {
              payload.preferences = { ...currentUser.preferences, ...updates.preferences };
            }

            const { error } = await db.from('profiles')
              .update(payload)
              .eq('id', currentUser.id);
            if (error) throw error;
          } catch (err: any) {
            console.error('Update profile in Supabase failed:', err);
            toast.error(`Error saving profile: ${err.message || err}`);
          }
        }
        set(s => {
          const nextUser = {
            ...s.currentUser,
            ...updates,
            preferences: updates.preferences
              ? { ...s.currentUser.preferences, ...updates.preferences }
              : s.currentUser.preferences
          };
          const nextUsers = s.users.map(u => u.id === currentUser.id ? nextUser : u);
          return { currentUser: nextUser, users: nextUsers };
        });
      },

      updateUserRole: async (userId, role) => {
        const { currentUser } = get();
        if (currentUser.role !== 'admin') {
          toast.error('Only admins can change roles.');
          return;
        }

        if (canUseSupabase() && isValidUuid(userId)) {
          try {
            const { error } = await db.from('profiles')
              .update({ role })
              .eq('id', userId);
            if (error) throw error;
          } catch (err: any) {
            console.error('Update user role in Supabase failed:', err);
            toast.error(`Role update failed: ${err.message || err}`);
            return;
          }
        }

        set(s => {
          const nextUsers = s.users.map(u => u.id === userId ? { ...u, role } : u);
          const nextCurrentUser = s.currentUser.id === userId ? { ...s.currentUser, role } : s.currentUser;
          return {
            users: nextUsers,
            currentUser: nextCurrentUser,
            isAdminMode: nextCurrentUser.role === 'admin' ? s.isAdminMode : false,
          };
        });
        toast.success('User role updated.');
      },

      setCurrentUserFromProfile: (profile) => set(s => {
        const user = mapProfileFromDb(profile);
        return {
          currentUser: user,
          isAdminMode: user.role === 'admin',
          users: s.users.some(u => u.id === user.id)
            ? s.users.map(u => u.id === user.id ? user : u)
            : [...s.users, user],
        };
      }),

      setSelectedFloor: (floorId) => set({ selectedFloorId: floorId }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setBookingFilters: (filters) => set(s => ({ bookingFilters: { ...s.bookingFilters, ...filters } })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      toggleIntegration: (name) => set(s => {
        const next = s.integrations.map(item =>
          item.name === name ? { ...item, connected: !item.connected } : item
        );
        const integration = s.integrations.find(item => item.name === name);
        toast.success(`${name} ${integration?.connected ? 'disconnected' : 'connected'}.`);
        return { integrations: next };
      }),
      resetToDemoData: () => set(s => ({
        currentUser: CURRENT_USER,
        isAdminMode: false,
        users: MOCK_USERS,
        floors: MOCK_FLOORS,
        desks: MOCK_DESKS,
        rooms: MOCK_ROOMS,
        parkingSpaces: MOCK_PARKING,
        lockers: MOCK_LOCKERS,
        furniture: MOCK_FURNITURE,
        bookings: MOCK_BOOKINGS,
        notifications: MOCK_NOTIFICATIONS,
        waitlist: MOCK_WAITLIST,
        attendancePlans: [],
        selectedFloorId: 'f1',
        selectedDate: format(new Date(), 'yyyy-MM-dd'),
        bookingFilters: {},
        integrations: s.integrations,
      })),
      setDemoRole: (role) => set(s => ({
        currentUser: role === 'admin' ? ADMIN_USER : CURRENT_USER,
        isAdminMode: role === 'admin',
        users: MOCK_USERS,
        integrations: s.integrations,
      })),

      // ─── Actions with Supabase Integrations ─────────────────────────────────

      addBooking: async (booking) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const nowTimeStr = format(new Date(), 'HH:mm');
        if (booking.date < todayStr || (booking.date === todayStr && booking.endTime <= nowTimeStr)) {
          throw new Error('Cannot create a booking in the past.');
        }

        const newBookingId = `bk${++bookingCounter}`;
        const newBooking: Booking = {
          ...booking,
          id: newBookingId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        let resultBooking = newBooking;

        if (canUseSupabase() && isValidUuid(booking.userId)) {
          try {
            const { data, error } = await db.from('bookings').insert({
              user_id: booking.userId,
              resource_type: booking.resourceType,
              resource_id: booking.resourceId,
              floor_id: booking.floorId,
              building_id: booking.buildingId,
              date: booking.date,
              start_time: booking.startTime,
              end_time: booking.endTime,
              status: booking.status,
              title: booking.title,
              notes: booking.notes,
              is_recurring: booking.isRecurring,
              recurring_id: booking.recurringId,
              duration_type: booking.durationType || 'full_day',
            }).select().single();

            if (error) throw error;
            if (data) {
              const mapped = mapBookingFromDb(data);
              set(s => ({ bookings: [...s.bookings.filter(b => b.id !== newBookingId), mapped] }));
              resultBooking = mapped;
            }
          } catch (err: any) {
            console.error('Supabase booking insert failed:', err);
            toast.error(`Booking error: ${err.message || err}`);
            // Fallback to local save on error to prevent total lock
            set(s => ({ bookings: [...s.bookings, newBooking] }));
          }
        } else {
          // Fallback optimistic save
          set(s => ({ bookings: [...s.bookings, newBooking] }));
        }

        // Add confirmation notification
        await get().addNotification({
          userId: booking.userId,
          type: 'booking_confirmed',
          title: 'Booking Confirmed',
          message: `Your ${booking.resourceType} has been booked for ${booking.date} ${booking.startTime}–${booking.endTime}`,
          read: false,
          bookingId: resultBooking.id,
        });

        // Check active integrations to perform mock syncing actions
        const currentIntegrations = get().integrations;
        const googleConnected = currentIntegrations.find(i => i.name === 'Google Calendar')?.connected;
        const slackConnected = currentIntegrations.find(i => i.name === 'Slack')?.connected;

        if (googleConnected) {
          toast.success('Synced booking with Google Calendar 📅');
        }
        if (slackConnected) {
          toast.success('Sent booking notification to Slack 💬');
        }

        return resultBooking;
      },

      cancelBooking: async (bookingId, reason) => {
        if (canUseSupabase() && isValidUuid(bookingId)) {
          try {
            const { error } = await db.from('bookings')
              .update({ status: 'cancelled', cancel_reason: reason })
              .eq('id', bookingId);
            if (error) throw error;
          } catch (err: any) {
            console.error('Cancel booking in Supabase failed:', err);
            toast.error(`Cancellation error: ${err.message || err}`);
          }
        }

        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId
              ? { ...b, status: 'cancelled', cancelReason: reason, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      deleteAllBookingsForCurrentUser: async () => {
        const { currentUser } = get();

        if (canUseSupabase() && isValidUuid(currentUser.id)) {
          try {
            const { error } = await db.from('bookings')
              .delete()
              .eq('user_id', currentUser.id);
            if (error) throw error;
          } catch (err: any) {
            console.error('Delete all bookings in Supabase failed:', err);
            toast.error(`Delete bookings error: ${err.message || err}`);
          }
        }

        set(s => ({
          bookings: s.bookings.filter(b => b.userId !== currentUser.id),
          notifications: s.notifications.filter(n => n.userId !== currentUser.id),
          waitlist: s.waitlist.filter(w => w.userId !== currentUser.id),
        }));
      },

      checkIn: async (bookingId) => {
        const { bookings } = get();
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) {
          throw new Error('Booking not found');
        }
        if (!isBookingWithinCheckInWindow(booking.date, booking.startTime, booking.endTime)) {
          throw new Error('Check-in is only available between 30 minutes before and 30 minutes after your booking period.');
        }

        const timeStr = format(new Date(), 'HH:mm');
        if (canUseSupabase() && isValidUuid(bookingId)) {
          try {
            const { error } = await db.from('bookings')
              .update({ status: 'checked_in', check_in_time: timeStr })
              .eq('id', bookingId);
            if (error) throw error;
          } catch (err: any) {
            console.error('Check-in in Supabase failed:', err);
            toast.error(err.message || String(err));
          }
        }

        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId
              ? { ...b, status: 'checked_in', checkInTime: timeStr, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      checkOut: async (bookingId) => {
        const timeStr = format(new Date(), 'HH:mm');
        if (canUseSupabase() && isValidUuid(bookingId)) {
          try {
            const { error } = await db.from('bookings')
              .update({ status: 'completed', check_out_time: timeStr })
              .eq('id', bookingId);
            if (error) throw error;
          } catch (err: any) {
            console.error('Check-out in Supabase failed:', err);
            toast.error(err.message || String(err));
          }
        }

        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId
              ? { ...b, status: 'completed', checkOutTime: timeStr, updatedAt: new Date().toISOString() }
              : b
          ),
        }));
      },

      updateBooking: async (bookingId, updates) => {
        if (canUseSupabase() && isValidUuid(bookingId)) {
          try {
            const payload: Record<string, any> = {};
            if (updates.status) payload.status = updates.status;
            if (updates.title) payload.title = updates.title;
            if (updates.notes) payload.notes = updates.notes;
            if (updates.startTime) payload.start_time = updates.startTime;
            if (updates.endTime) payload.end_time = updates.endTime;
            if (updates.checkInTime) payload.check_in_time = updates.checkInTime;
            if (updates.checkOutTime) payload.check_out_time = updates.checkOutTime;

            const { error } = await db.from('bookings')
              .update(payload)
              .eq('id', bookingId);
            if (error) throw error;
          } catch (err: any) {
            console.error('Update booking in Supabase failed:', err);
          }
        }

        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        }));
      },

      deleteCurrentAccount: async () => {
        const { currentUser } = get();

        if (canUseSupabase() && isValidUuid(currentUser.id)) {
          try {
            await db.from('bookings').delete().eq('user_id', currentUser.id);
            await db.from('notifications').delete().eq('user_id', currentUser.id);
            await db.from('waitlist').delete().eq('user_id', currentUser.id);
            await db.from('profiles').delete().eq('id', currentUser.id);
            await supabase.auth.signOut();
          } catch (err: any) {
            console.error('Delete account in Supabase failed:', err);
            toast.error(`Delete account error: ${err.message || err}`);
          }
        }

        set(s => {
          const remainingUsers = s.users.filter(u => u.id !== currentUser.id);
          const fallbackUser = remainingUsers[0] || CURRENT_USER;
          return {
            currentUser: fallbackUser,
            isAdminMode: fallbackUser.role === 'admin',
            users: remainingUsers.length ? remainingUsers : MOCK_USERS,
            bookings: s.bookings.filter(b => b.userId !== currentUser.id),
            notifications: s.notifications.filter(n => n.userId !== currentUser.id),
            waitlist: s.waitlist.filter(w => w.userId !== currentUser.id),
            attendancePlans: s.attendancePlans.filter(p => p.userId !== currentUser.id),
          };
        });
      },

      setAttendancePlan: async (userId, date, status) => {
        if (canUseSupabase() && isValidUuid(userId)) {
          try {
            const { error } = await db.from('attendance_plans').upsert({
              user_id: userId,
              date,
              status,
            }, { onConflict: 'user_id,date' });
            if (error) throw error;
          } catch (err: any) {
            console.error('Upsert attendance plan failed:', err);
            toast.error(`Attendance update error: ${err.message || err}`);
          }
        }

        set(state => {
          const updatedPlans = [...state.attendancePlans];
          const idx = updatedPlans.findIndex(p => p.userId === userId && p.date === date);
          if (idx > -1) {
            updatedPlans[idx] = {
              ...updatedPlans[idx],
              status,
              updatedAt: new Date().toISOString(),
            };
          } else {
            updatedPlans.push({
              id: `ap-${Date.now()}-${Math.random()}`,
              userId,
              date,
              status,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
          return { attendancePlans: updatedPlans };
        });
      },

      markNotificationRead: async (notifId) => {
        if (canUseSupabase() && isValidUuid(notifId)) {
          try {
            await db.from('notifications').update({ read: true }).eq('id', notifId);
          } catch (err) {
            console.error(err);
          }
        }
        set(s => ({
          notifications: s.notifications.map(n => n.id === notifId ? { ...n, read: true } : n),
        }));
      },

      markAllNotificationsRead: async () => {
        const { currentUser } = get();
        if (canUseSupabase() && isValidUuid(currentUser.id)) {
          try {
            await db.from('notifications').update({ read: true }).eq('user_id', currentUser.id);
          } catch (err) {
            console.error(err);
          }
        }
        set(s => ({
          notifications: s.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      addNotification: async (notif) => {
        const newNotifId = `n${++notifCounter}`;
        const newNotif: Notification = {
          ...notif,
          id: newNotifId,
          createdAt: new Date().toISOString(),
        };

        if (canUseSupabase() && isValidUuid(notif.userId)) {
          try {
            await db.from('notifications').insert({
              user_id: notif.userId,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              read: notif.read,
              booking_id: notif.bookingId,
            });
          } catch (err) {
            console.error(err);
          }
        }

        set(s => ({ notifications: [newNotif, ...s.notifications] }));
      },

      updateDesk: async (deskId, updates) => {
        if (canUseSupabase() && isValidUuid(deskId)) {
          try {
            const payload: Record<string, any> = {};
            if (updates.status) payload.status = updates.status;
            if (updates.label) payload.label = updates.label;
            if (updates.type) payload.type = updates.type;
            if (updates.x !== undefined) payload.x = updates.x;
            if (updates.y !== undefined) payload.y = updates.y;
            if (updates.width !== undefined) payload.width = updates.width;
            if (updates.height !== undefined) payload.height = updates.height;
            if (updates.zoneId !== undefined) payload.zone_id = updates.zoneId;
            if (updates.isActive !== undefined) payload.is_active = updates.isActive;
            if (updates.amenities) payload.amenities = updates.amenities;
            if (updates.rotation !== undefined) payload.rotation = updates.rotation;

            await db.from('desks').update(payload).eq('id', deskId);
          } catch (err) {
            console.error(err);
          }
        }
        set(s => ({
          desks: s.desks.map(d => d.id === deskId ? { ...d, ...updates } : d),
        }));
      },

      updateRoom: async (roomId, updates) => {
        if (canUseSupabase() && isValidUuid(roomId)) {
          try {
            const payload: Record<string, any> = {};
            if (updates.status) payload.status = updates.status;
            if (updates.name) payload.name = updates.name;
            if (updates.capacity !== undefined) payload.capacity = updates.capacity;
            if (updates.type) payload.type = updates.type;
            if (updates.x !== undefined) payload.x = updates.x;
            if (updates.y !== undefined) payload.y = updates.y;
            if (updates.width !== undefined) payload.width = updates.width;
            if (updates.height !== undefined) payload.height = updates.height;
            if (updates.amenities) payload.amenities = updates.amenities;

            await db.from('rooms').update(payload).eq('id', roomId);
          } catch (err) {
            console.error(err);
          }
        }
        set(s => ({
          rooms: s.rooms.map(r => r.id === roomId ? { ...r, ...updates } : r),
        }));
      },

      addDesk: async (desk) => {
        const localId = `desk-${Date.now()}`;
        if (canUseSupabase() && isValidUuid(desk.floorId)) {
          try {
            const { data } = await db.from('desks').insert({
              label: desk.label,
              floor_id: desk.floorId,
              zone_id: desk.zoneId,
              type: desk.type,
              status: desk.status,
              x: desk.x,
              y: desk.y,
              width: desk.width,
              height: desk.height,
              amenities: desk.amenities,
              is_active: true,
            }).select().single();
            if (data) {
              set(s => ({ desks: [...s.desks, mapDeskFromDb(data)] }));
              return;
            }
          } catch (err) {
            console.error(err);
          }
        }
        const newDesk: Desk = { ...desk, id: localId };
        set(s => ({ desks: [...s.desks, newDesk] }));
      },

      removeDesk: async (deskId) => {
        if (canUseSupabase() && isValidUuid(deskId)) {
          try {
            await db.from('desks').update({ is_active: false }).eq('id', deskId);
          } catch (err) {
            console.error(err);
          }
        }
        set(s => ({ desks: s.desks.filter(d => d.id !== deskId) }));
      },

      addRoom: async (room) => {
        const localId = `room-${Date.now()}`;
        if (canUseSupabase() && isValidUuid(room.floorId)) {
          try {
            const { data } = await db.from('rooms').insert({
              name: room.name,
              floor_id: room.floorId,
              capacity: room.capacity,
              type: room.type,
              status: room.status,
              amenities: room.amenities,
              x: room.x,
              y: room.y,
              width: room.width,
              height: room.height,
              image_url: room.imageUrl,
              is_active: true,
            }).select().single();
            if (data) {
              set(s => ({ rooms: [...s.rooms, mapRoomFromDb(data)] }));
              return;
            }
          } catch (err) {
            console.error(err);
          }
        }
        const newRoom: Room = { ...room, id: localId };
        set(s => ({ rooms: [...s.rooms, newRoom] }));
      },

      removeRoom: async (roomId) => {
        if (canUseSupabase() && isValidUuid(roomId)) {
          try {
            await db.from('rooms').update({ is_active: false }).eq('id', roomId);
          } catch (err) {
            console.error(err);
          }
        }
        set(s => ({ rooms: s.rooms.filter(r => r.id !== roomId) }));
      },

      updateFloor: async (floorId, updates) => {
        let finalUpdates = { ...updates };
        if (canUseSupabase() && isValidUuid(floorId)) {
          try {
            const payload: Record<string, any> = {};
            if (updates.name) payload.name = updates.name;
            if (updates.capacity !== undefined) payload.capacity = updates.capacity;

            if (Object.keys(payload).length > 0) {
              await db.from('floors').update(payload).eq('id', floorId);
            }

            if (updates.zones !== undefined) {
              // Get current database zones for this floor to compute diff
              const { data: dbZones } = await db.from('zones')
                .select('id')
                .eq('floor_id', floorId);
              
              const existingDbIds = new Set<string>((dbZones || []).map((z: any) => String(z.id)));
              const nextZones = [...updates.zones];
              const nextIds = new Set<string>(nextZones.map(z => z.id).filter(isValidUuid));

              // 1. Delete zones that are in DB but not in updates
              const toDelete = Array.from(existingDbIds).filter((id: string) => !nextIds.has(id));
              if (toDelete.length > 0) {
                await db.from('zones').delete().in('id', toDelete);
              }

              // 2. Upsert zones
              for (let i = 0; i < nextZones.length; i++) {
                const zone = nextZones[i];
                const zonePayload = {
                  floor_id: floorId,
                  name: zone.name,
                  color: zone.color,
                  description: zone.description || null,
                  x: zone.x,
                  y: zone.y,
                  width: zone.width,
                  height: zone.height,
                };

                if (isValidUuid(zone.id)) {
                  // Update existing
                  await db.from('zones').update(zonePayload).eq('id', zone.id);
                } else {
                  // Insert new zone
                  const { data: inserted } = await db.from('zones')
                    .insert(zonePayload)
                    .select()
                    .single();
                  
                  if (inserted) {
                    nextZones[i] = { ...zone, id: inserted.id };
                  }
                }
              }
              finalUpdates.zones = nextZones;
            }
          } catch (err) {
            console.error('updateFloor database operation failed:', err);
          }
        }
        set(s => ({
          floors: s.floors.map(f => f.id === floorId ? { ...f, ...finalUpdates } : f),
        }));
      },

      addFurniture: async (item) => {
        const localId = `furn-${Date.now()}`;
        const newFurniture: Furniture = { ...item, id: localId };
        set(s => ({ furniture: [...s.furniture, newFurniture] }));
      },

      updateFurniture: async (id, updates) => {
        set(s => ({
          furniture: s.furniture.map(f => f.id === id ? { ...f, ...updates } : f),
        }));
      },

      removeFurniture: async (id) => {
        set(s => ({
          furniture: s.furniture.filter(f => f.id !== id),
        }));
      },

      addToWaitlist: async (entry) => {
        const localId = `wl${++waitlistCounter}`;
        if (canUseSupabase() && isValidUuid(entry.userId)) {
          try {
            const { data: entries } = await db.from('waitlist')
              .select('id')
              .eq('floor_id', entry.floorId)
              .eq('date', entry.date);

            const position = (entries?.length || 0) + 1;
            const { data } = await db.from('waitlist').insert({
              user_id: entry.userId,
              resource_type: entry.resourceType,
              resource_id: entry.resourceId,
              floor_id: entry.floorId,
              zone_id: entry.zoneId,
              date: entry.date,
              start_time: entry.startTime,
              end_time: entry.endTime,
              position,
              notified: false,
            }).select().single();

            if (data) {
              set(s => ({ waitlist: [...s.waitlist, mapWaitlistFromDb(data)] }));
              return;
            }
          } catch (err) {
            console.error(err);
          }
        }

        const entries = get().waitlist.filter(w => w.floorId === entry.floorId && w.date === entry.date);
        const position = entries.length + 1;
        const newEntry: WaitlistEntry = {
          ...entry,
          id: localId,
          position,
          createdAt: new Date().toISOString(),
        };
        set(s => ({ waitlist: [...s.waitlist, newEntry] }));
      },

      removeFromWaitlist: async (entryId) => {
        if (canUseSupabase() && isValidUuid(entryId)) {
          try {
            await db.from('waitlist').delete().eq('id', entryId);
          } catch (err) {
            console.error(err);
          }
        }
        set(s => ({ waitlist: s.waitlist.filter(w => w.id !== entryId) }));
      },

      // ─── Realtime Hydration Synchronizer ────────────────────────────────────

      initSupabaseSync: () => {
        if (!canUseSupabase()) return () => { };

        const fetchAll = async () => {
          try {
            const [
              { data: f }, { data: d }, { data: r },
              { data: p }, { data: l }, { data: b },
              { data: w }, { data: n }, { data: pr },
              { data: ap }
            ] = await Promise.all([
              db.from('floors').select('*, zones(*)').eq('is_active', true).order('level'),
              db.from('desks').select('*').eq('is_active', true).order('label'),
              db.from('rooms').select('*').eq('is_active', true).order('name'),
              db.from('parking_spaces').select('*').eq('is_active', true).order('label'),
              db.from('lockers').select('*').eq('is_active', true).order('label'),
              db.from('bookings').select('*').order('date'),
              db.from('waitlist').select('*').order('created_at'),
              db.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
              db.from('profiles').select('*').order('name'),
              db.from('attendance_plans').select('*')
            ]);

            if (f) {
              const mappedFloors = f.map(mapFloorFromDb);
              set({ floors: mappedFloors });
              const currentId = get().selectedFloorId;
              if (mappedFloors.length > 0 && (!currentId || currentId === 'f1' || !isValidUuid(currentId))) {
                set({ selectedFloorId: mappedFloors[0].id });
              }
            }
            if (d) set({ desks: d.map(mapDeskFromDb) });
            if (r) set({ rooms: r.map(mapRoomFromDb) });
            if (p) set({ parkingSpaces: p.map(mapParkingSpaceFromDb) });
            if (l) set({ lockers: l.map(mapLockerFromDb) });
            if (b) set({ bookings: b.map(mapBookingFromDb) });
            if (w) set({ waitlist: w.map(mapWaitlistFromDb) });
            if (n) set({ notifications: n.map(mapNotificationFromDb) });
            if (ap) set({ attendancePlans: ap.map(mapAttendancePlanFromDb) });

            if (pr) {
              const mappedUsers: User[] = pr.map(mapProfileFromDb);
              set({ users: mappedUsers });

              const { data: { user: authUser } } = await supabase.auth.getUser();
              if (authUser) {
                const cur = mappedUsers.find(u => u.id === authUser.id);
                if (cur) set({ currentUser: cur, isAdminMode: cur.role === 'admin' });
              }
            }
          } catch (err) {
            console.error('Error fetching database records:', err);
          }
        };

        fetchAll();

        const channel = supabase.channel('realtime-db-sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
            const { eventType, new: newRec, old: oldRec } = payload;
            set(state => {
              let list = [...state.bookings];
              if (eventType === 'INSERT') {
                if (!list.some(x => x.id === newRec.id)) {
                  list.push(mapBookingFromDb(newRec));
                }
              } else if (eventType === 'UPDATE') {
                list = list.map(x => x.id === newRec.id ? mapBookingFromDb(newRec) : x);
              } else if (eventType === 'DELETE') {
                list = list.filter(x => x.id !== oldRec.id);
              }
              return { bookings: list };
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_plans' }, (payload) => {
            const { eventType, new: newRec, old: oldRec } = payload;
            set(state => {
              let list = [...state.attendancePlans];
              if (eventType === 'INSERT') {
                if (!list.some(x => x.id === newRec.id)) {
                  list.push(mapAttendancePlanFromDb(newRec));
                }
              } else if (eventType === 'UPDATE') {
                list = list.map(x => x.id === newRec.id ? mapAttendancePlanFromDb(newRec) : x);
              } else if (eventType === 'DELETE') {
                list = list.filter(x => x.id !== oldRec.id);
              }
              return { attendancePlans: list };
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
            const { eventType, new: newRec } = payload;
            if (eventType === 'INSERT') {
              set(state => {
                if (newRec.user_id === state.currentUser.id && !state.notifications.some(x => x.id === newRec.id)) {
                  return { notifications: [mapNotificationFromDb(newRec), ...state.notifications] };
                }
                return {};
              });
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'floors' }, () => {
            db.from('floors').select('*, zones(*)').eq('is_active', true).order('level').then(({ data }: any) => {
              if (data) set({ floors: data.map(mapFloorFromDb) });
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, () => {
            db.from('floors').select('*, zones(*)').eq('is_active', true).order('level').then(({ data }: any) => {
              if (data) set({ floors: data.map(mapFloorFromDb) });
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'desks' }, () => {
            db.from('desks').select('*').eq('is_active', true).order('label').then(({ data }: any) => {
              if (data) set({ desks: data.map(mapDeskFromDb) });
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
            db.from('rooms').select('*').eq('is_active', true).order('name').then(({ data }: any) => {
              if (data) set({ rooms: data.map(mapRoomFromDb) });
            });
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },

      // ─── Computed Helpers ───────────────────────────────────────────────────

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
        rooms: state.rooms,
        theme: state.theme,
        attendancePlans: state.attendancePlans,
        integrations: state.integrations,
      }),
    }
  )
);
