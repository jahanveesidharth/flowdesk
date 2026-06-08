import type { User, Floor, Desk, Room, ParkingSpace, Locker, Booking, Team, Notification, Building, BookingPolicy, WaitlistEntry } from '../types';
import { addDays, format, subDays } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const dayAfter = format(addDays(new Date(), 2), 'yyyy-MM-dd');

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Lisa Chen',
    email: 'lisa@deskflow.io',
    role: 'employee',
    department: 'Engineering',
    teamId: 't1',
    avatar: 'LC',
    preferences: { notificationsEnabled: true, emailReminders: true, reminderMinutes: 30, theme: 'light', weekStartsOn: 1, defaultFloorId: 'f1' },
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'u2',
    name: 'James Walker',
    email: 'james@deskflow.io',
    role: 'admin',
    department: 'Operations',
    avatar: 'JW',
    preferences: { notificationsEnabled: true, emailReminders: true, reminderMinutes: 15, theme: 'light', weekStartsOn: 1 },
    createdAt: '2024-01-05T09:00:00Z',
  },
  {
    id: 'u3',
    name: 'Sarah Mitchell',
    email: 'sarah@deskflow.io',
    role: 'manager',
    department: 'Engineering',
    teamId: 't1',
    avatar: 'SM',
    preferences: { notificationsEnabled: true, emailReminders: false, reminderMinutes: 30, theme: 'light', weekStartsOn: 1 },
    createdAt: '2024-01-08T09:00:00Z',
  },
  {
    id: 'u4',
    name: 'David Park',
    email: 'david@deskflow.io',
    role: 'employee',
    department: 'Design',
    teamId: 't2',
    avatar: 'DP',
    preferences: { notificationsEnabled: true, emailReminders: true, reminderMinutes: 60, theme: 'light', weekStartsOn: 1 },
    createdAt: '2024-02-01T09:00:00Z',
  },
  {
    id: 'u5',
    name: 'Maria Torres',
    email: 'maria@deskflow.io',
    role: 'employee',
    department: 'Marketing',
    teamId: 't3',
    avatar: 'MT',
    preferences: { notificationsEnabled: false, emailReminders: true, reminderMinutes: 30, theme: 'light', weekStartsOn: 1 },
    createdAt: '2024-02-15T09:00:00Z',
  },
  {
    id: 'u6',
    name: 'Alex Johnson',
    email: 'alex@deskflow.io',
    role: 'employee',
    department: 'Engineering',
    teamId: 't1',
    avatar: 'AJ',
    preferences: { notificationsEnabled: true, emailReminders: true, reminderMinutes: 30, theme: 'light', weekStartsOn: 1 },
    createdAt: '2024-03-01T09:00:00Z',
  },
  {
    id: 'u7',
    name: 'Emma Wilson',
    email: 'emma@deskflow.io',
    role: 'employee',
    department: 'HR',
    teamId: 't4',
    avatar: 'EW',
    preferences: { notificationsEnabled: true, emailReminders: true, reminderMinutes: 30, theme: 'light', weekStartsOn: 1 },
    createdAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'u8',
    name: 'Chris Brown',
    email: 'chris@deskflow.io',
    role: 'employee',
    department: 'Sales',
    teamId: 't5',
    avatar: 'CB',
    preferences: { notificationsEnabled: true, emailReminders: false, reminderMinutes: 30, theme: 'light', weekStartsOn: 1 },
    createdAt: '2024-03-20T09:00:00Z',
  },
];

export const CURRENT_USER = MOCK_USERS[0]; // Lisa Chen - employee view
export const ADMIN_USER = MOCK_USERS[1];   // James Walker - admin view

// ─── Buildings ────────────────────────────────────────────────────────────────

export const MOCK_BUILDINGS: Building[] = [
  {
    id: 'b1',
    name: 'HQ Tower',
    address: '100 Innovation Drive',
    city: 'San Francisco',
    country: 'US',
    timezone: 'America/Los_Angeles',
    floors: ['f1', 'f2', 'f3'],
    isActive: true,
  },
  {
    id: 'b2',
    name: 'East Campus',
    address: '200 Tech Park Blvd',
    city: 'San Francisco',
    country: 'US',
    timezone: 'America/Los_Angeles',
    floors: ['f4'],
    isActive: true,
  },
];

// ─── Floors ───────────────────────────────────────────────────────────────────

export const MOCK_FLOORS: Floor[] = [
  {
    id: 'f1',
    name: 'Ground Floor',
    level: 0,
    buildingId: 'b1',
    gridWidth: 18,
    gridHeight: 14,
    zones: [
      { id: 'z1', name: 'Engineering', floorId: 'f1', color: '#dbeafe', x: 0, y: 0, width: 9, height: 7 },
      { id: 'z2', name: 'Design', floorId: 'f1', color: '#fce7f3', x: 9, y: 0, width: 9, height: 7 },
      { id: 'z3', name: 'Quiet Zone', floorId: 'f1', color: '#f0fdf4', x: 0, y: 7, width: 9, height: 7 },
      { id: 'z4', name: 'Collaboration', floorId: 'f1', color: '#fef9c3', x: 9, y: 7, width: 9, height: 7 },
    ],
    amenities: ['kitchen', 'reception', 'accessibility'],
    capacity: 48,
    isActive: true,
  },
  {
    id: 'f2',
    name: 'First Floor',
    level: 1,
    buildingId: 'b1',
    gridWidth: 18,
    gridHeight: 14,
    zones: [
      { id: 'z5', name: 'Sales', floorId: 'f2', color: '#fef3c7', x: 0, y: 0, width: 9, height: 7 },
      { id: 'z6', name: 'Marketing', floorId: 'f2', color: '#ede9fe', x: 9, y: 0, width: 9, height: 7 },
      { id: 'z7', name: 'Hot Desks', floorId: 'f2', color: '#f3f4f6', x: 0, y: 7, width: 18, height: 7 },
    ],
    amenities: ['kitchen', 'phone_booths', 'game_area'],
    capacity: 42,
    isActive: true,
  },
  {
    id: 'f3',
    name: 'Second Floor',
    level: 2,
    buildingId: 'b1',
    gridWidth: 18,
    gridHeight: 14,
    zones: [
      { id: 'z8', name: 'Executive', floorId: 'f3', color: '#fef2f2', x: 0, y: 0, width: 18, height: 7 },
      { id: 'z9', name: 'Conference', floorId: 'f3', color: '#f0f9ff', x: 0, y: 7, width: 18, height: 7 },
    ],
    amenities: ['premium_kitchen', 'terrace'],
    capacity: 24,
    isActive: true,
  },
  {
    id: 'f4',
    name: 'East Campus - Main',
    level: 0,
    buildingId: 'b2',
    gridWidth: 16,
    gridHeight: 12,
    zones: [
      { id: 'z10', name: 'Open Space', floorId: 'f4', color: '#f0fdf4', x: 0, y: 0, width: 16, height: 12 },
    ],
    amenities: ['kitchen', 'parking'],
    capacity: 30,
    isActive: true,
  },
];

// ─── Generate Desks ───────────────────────────────────────────────────────────

function generateDesks(floorId: string, zoneId: string, startX: number, startY: number, cols: number, rows: number, startIdx: number, type: Desk['type'] = 'hot'): Desk[] {
  const desks: Desk[] = [];
  let idx = startIdx;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `${floorId}-d${idx}`;
      const statuses: DeskStatus[] = ['available', 'available', 'available', 'occupied', 'reserved', 'available'];
      const randomStatus = statuses[idx % statuses.length];
      const amenityPool: Desk['amenities'] = ['monitor', 'docking_station', 'window', 'quiet_zone', 'phone'];
      const numAmenities = (idx % 3) + 1;
      desks.push({
        id,
        label: `D-${String(idx).padStart(2, '0')}`,
        floorId,
        zoneId,
        type,
        status: id === `${floorId}-d1` ? 'occupied' : randomStatus,
        x: startX + c,
        y: startY + r,
        width: 1,
        height: 1,
        amenities: amenityPool.slice(0, numAmenities) as Desk['amenities'],
        isActive: true,
        fixedUserId: type === 'fixed' && idx % 5 === 0 ? 'u3' : undefined,
      });
      idx++;
    }
  }
  return desks;
}

type DeskStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'blocked';

export const MOCK_DESKS: Desk[] = [
  // Floor 1 - Engineering zone (z1)
  ...generateDesks('f1', 'z1', 1, 1, 3, 2, 1, 'hot'),
  ...generateDesks('f1', 'z1', 5, 1, 3, 2, 7, 'standing'),
  // Floor 1 - Design zone (z2)
  ...generateDesks('f1', 'z2', 10, 1, 3, 2, 13, 'hot'),
  ...generateDesks('f1', 'z2', 14, 1, 3, 2, 19, 'collaboration'),
  // Floor 1 - Quiet zone (z3)
  ...generateDesks('f1', 'z3', 1, 8, 4, 2, 25, 'quiet'),
  // Floor 1 - Collaboration zone (z4)
  ...generateDesks('f1', 'z4', 10, 8, 4, 2, 33, 'collaboration'),
  // Floor 2
  ...generateDesks('f2', 'z5', 1, 1, 4, 2, 41, 'fixed'),
  ...generateDesks('f2', 'z6', 10, 1, 4, 2, 49, 'hot'),
  ...generateDesks('f2', 'z7', 1, 8, 8, 2, 57, 'hot'),
  // Floor 3
  ...generateDesks('f3', 'z8', 1, 1, 4, 2, 73, 'fixed'),
  ...generateDesks('f3', 'z9', 1, 8, 4, 2, 81, 'hot'),
  // Floor 4
  ...generateDesks('f4', 'z10', 1, 1, 6, 3, 89, 'hot'),
];

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const MOCK_ROOMS: Room[] = [
  {
    id: 'r1', name: 'Maple', floorId: 'f1', capacity: 8, type: 'meeting',
    status: 'available', amenities: ['tv', 'whiteboard', 'video_conf'],
    x: 1, y: 11, width: 3, height: 2, isActive: true,
  },
  {
    id: 'r2', name: 'Oak', floorId: 'f1', capacity: 4, type: 'phone_booth',
    status: 'occupied', amenities: ['phone', 'tv'],
    x: 5, y: 11, width: 2, height: 2, isActive: true,
  },
  {
    id: 'r3', name: 'Cedar', floorId: 'f1', capacity: 12, type: 'training',
    status: 'available', amenities: ['projector', 'whiteboard', 'video_conf', 'tv'],
    x: 11, y: 11, width: 4, height: 2, isActive: true,
  },
  {
    id: 'r4', name: 'Birch', floorId: 'f2', capacity: 6, type: 'meeting',
    status: 'available', amenities: ['tv', 'whiteboard'],
    x: 1, y: 11, width: 3, height: 2, isActive: true,
  },
  {
    id: 'r5', name: 'Sequoia', floorId: 'f3', capacity: 20, type: 'boardroom',
    status: 'reserved', amenities: ['projector', 'video_conf', 'catering', 'whiteboard', 'standing_table'],
    x: 1, y: 1, width: 6, height: 4, isActive: true,
  },
  {
    id: 'r6', name: 'Willow', floorId: 'f3', capacity: 4, type: 'focus',
    status: 'available', amenities: ['whiteboard', 'phone'],
    x: 8, y: 1, width: 2, height: 2, isActive: true,
  },
  {
    id: 'r7', name: 'Pine', floorId: 'f2', capacity: 2, type: 'phone_booth',
    status: 'available', amenities: ['phone'],
    x: 5, y: 11, width: 2, height: 2, isActive: true,
  },
];

// ─── Parking ──────────────────────────────────────────────────────────────────

export const MOCK_PARKING: ParkingSpace[] = [
  { id: 'p1', label: 'P-01', floorId: 'f1', type: 'standard', status: 'available', x: 0, y: 0, isActive: true },
  { id: 'p2', label: 'P-02', floorId: 'f1', type: 'standard', status: 'occupied', x: 1, y: 0, isActive: true },
  { id: 'p3', label: 'P-03', floorId: 'f1', type: 'accessible', status: 'available', x: 2, y: 0, isActive: true },
  { id: 'p4', label: 'P-04', floorId: 'f1', type: 'ev_charging', status: 'occupied', x: 3, y: 0, isActive: true },
  { id: 'p5', label: 'P-05', floorId: 'f1', type: 'ev_charging', status: 'available', x: 4, y: 0, isActive: true },
  { id: 'p6', label: 'P-06', floorId: 'f1', type: 'standard', status: 'available', x: 5, y: 0, isActive: true },
  { id: 'p7', label: 'P-07', floorId: 'f1', type: 'motorcycle', status: 'available', x: 6, y: 0, isActive: true },
  { id: 'p8', label: 'P-08', floorId: 'f1', type: 'standard', status: 'reserved', x: 7, y: 0, isActive: true },
];

// ─── Lockers ──────────────────────────────────────────────────────────────────

export const MOCK_LOCKERS: Locker[] = [
  { id: 'l1', label: 'L-01', floorId: 'f1', size: 'small', status: 'available', isActive: true },
  { id: 'l2', label: 'L-02', floorId: 'f1', size: 'small', status: 'occupied', assignedUserId: 'u1', isActive: true },
  { id: 'l3', label: 'L-03', floorId: 'f1', size: 'medium', status: 'available', isActive: true },
  { id: 'l4', label: 'L-04', floorId: 'f1', size: 'medium', status: 'occupied', isActive: true },
  { id: 'l5', label: 'L-05', floorId: 'f1', size: 'large', status: 'available', isActive: true },
  { id: 'l6', label: 'L-06', floorId: 'f1', size: 'small', status: 'available', isActive: true },
  { id: 'l7', label: 'L-07', floorId: 'f1', size: 'small', status: 'maintenance', isActive: true },
  { id: 'l8', label: 'L-08', floorId: 'f1', size: 'medium', status: 'available', isActive: true },
  { id: 'l9', label: 'L-09', floorId: 'f2', size: 'small', status: 'available', isActive: true },
  { id: 'l10', label: 'L-10', floorId: 'f2', size: 'large', status: 'available', isActive: true },
];

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const MOCK_BOOKINGS: Booking[] = [
  // Today's bookings for current user
  {
    id: 'bk1', userId: 'u1', resourceType: 'desk', resourceId: 'f1-d1',
    floorId: 'f1', buildingId: 'b1', date: today, startTime: '09:00', endTime: '17:00',
    status: 'confirmed', title: 'Work day', isRecurring: false,
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'bk2', userId: 'u1', resourceType: 'room', resourceId: 'r1',
    floorId: 'f1', buildingId: 'b1', date: today, startTime: '14:00', endTime: '15:00',
    status: 'confirmed', title: 'Team Standup', attendees: ['u3', 'u6'],
    isRecurring: true, recurringId: 'rk1',
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  // Upcoming bookings
  {
    id: 'bk3', userId: 'u1', resourceType: 'desk', resourceId: 'f1-d3',
    floorId: 'f1', buildingId: 'b1', date: tomorrow, startTime: '09:00', endTime: '17:00',
    status: 'confirmed', isRecurring: false,
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'bk4', userId: 'u1', resourceType: 'parking', resourceId: 'p1',
    floorId: 'f1', buildingId: 'b1', date: tomorrow, startTime: '08:00', endTime: '18:00',
    status: 'confirmed', isRecurring: false,
    createdAt: '2024-06-02T08:00:00Z', updatedAt: '2024-06-02T08:00:00Z',
  },
  // Past bookings
  {
    id: 'bk5', userId: 'u1', resourceType: 'desk', resourceId: 'f1-d2',
    floorId: 'f1', buildingId: 'b1', date: yesterday, startTime: '09:00', endTime: '17:00',
    status: 'completed', checkInTime: '09:05', checkOutTime: '17:10',
    isRecurring: false,
    createdAt: '2024-05-30T08:00:00Z', updatedAt: '2024-05-30T08:00:00Z',
  },
  // Other users' bookings
  {
    id: 'bk6', userId: 'u3', resourceType: 'desk', resourceId: 'f1-d4',
    floorId: 'f1', buildingId: 'b1', date: today, startTime: '09:00', endTime: '17:00',
    status: 'confirmed', isRecurring: false,
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'bk7', userId: 'u4', resourceType: 'desk', resourceId: 'f1-d14',
    floorId: 'f1', buildingId: 'b1', date: today, startTime: '09:00', endTime: '17:00',
    status: 'confirmed', isRecurring: false,
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'bk8', userId: 'u4', resourceType: 'room', resourceId: 'r2',
    floorId: 'f1', buildingId: 'b1', date: today, startTime: '10:00', endTime: '11:00',
    status: 'checked_in', title: 'Design Review', checkInTime: '09:58',
    isRecurring: false,
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'bk9', userId: 'u2', resourceType: 'room', resourceId: 'r5',
    floorId: 'f3', buildingId: 'b1', date: tomorrow, startTime: '09:00', endTime: '12:00',
    status: 'confirmed', title: 'Board Meeting', attendees: ['u2', 'u3'],
    isRecurring: false,
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'bk10', userId: 'u6', resourceType: 'desk', resourceId: 'f1-d8',
    floorId: 'f1', buildingId: 'b1', date: today, startTime: '10:00', endTime: '16:00',
    status: 'confirmed', isRecurring: false,
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  {
    id: 'bk11', userId: 'u1', resourceType: 'locker', resourceId: 'l2',
    floorId: 'f1', buildingId: 'b1', date: today, startTime: '08:00', endTime: '18:00',
    status: 'confirmed', isRecurring: false,
    createdAt: '2024-06-01T08:00:00Z', updatedAt: '2024-06-01T08:00:00Z',
  },
  // Day after tomorrow
  {
    id: 'bk12', userId: 'u1', resourceType: 'desk', resourceId: 'f2-d42',
    floorId: 'f2', buildingId: 'b1', date: dayAfter, startTime: '09:00', endTime: '17:00',
    status: 'confirmed', isRecurring: false,
    createdAt: '2024-06-03T08:00:00Z', updatedAt: '2024-06-03T08:00:00Z',
  },
];

// ─── Teams ────────────────────────────────────────────────────────────────────

export const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Engineering', description: 'Product engineering team', managerId: 'u3', memberIds: ['u1', 'u3', 'u6'], color: '#3b82f6', department: 'Engineering' },
  { id: 't2', name: 'Design', description: 'Product design team', managerId: 'u4', memberIds: ['u4'], color: '#ec4899', department: 'Design' },
  { id: 't3', name: 'Marketing', description: 'Growth and marketing', managerId: 'u5', memberIds: ['u5'], color: '#8b5cf6', department: 'Marketing' },
  { id: 't4', name: 'HR', description: 'Human resources', managerId: 'u7', memberIds: ['u7'], color: '#10b981', department: 'HR' },
  { id: 't5', name: 'Sales', description: 'Sales team', managerId: 'u8', memberIds: ['u8'], color: '#f59e0b', department: 'Sales' },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', userId: 'u1', type: 'booking_confirmed',
    title: 'Booking Confirmed', message: `Desk D-01 booked for today, 09:00–17:00`,
    read: false, bookingId: 'bk1', createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'n2', userId: 'u1', type: 'checkin_reminder',
    title: 'Check-in Reminder', message: 'Your booking for D-01 starts in 30 minutes',
    read: false, bookingId: 'bk1', createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'n3', userId: 'u1', type: 'booking_confirmed',
    title: 'Room Booked', message: 'Room Maple reserved for today 14:00–15:00',
    read: true, bookingId: 'bk2', createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'n4', userId: 'u1', type: 'waitlist_available',
    title: 'Desk Available!', message: 'A desk in Engineering zone is now available for tomorrow',
    read: false, createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'n5', userId: 'u1', type: 'policy_update',
    title: 'Policy Update', message: 'Booking advance window extended to 30 days',
    read: true, createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ─── Booking Policy ───────────────────────────────────────────────────────────

export const BOOKING_POLICY: BookingPolicy = {
  id: 'bp1',
  name: 'Default Policy',
  maxAdvanceDays: 30,
  maxDurationHours: 8,
  maxConcurrentBookings: 3,
  maxBookingsPerDay: 2,
  checkInWindowMinutes: 15,
  autoReleaseMinutes: 30,
  requiresApproval: false,
  allowRecurring: true,
  maxRecurringWeeks: 12,
  allowedRoles: ['employee', 'manager', 'admin'],
  resourceTypes: ['desk', 'room', 'parking', 'locker'],
};

// ─── Waitlist ─────────────────────────────────────────────────────────────────

export const MOCK_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wl1', userId: 'u5', resourceType: 'desk', floorId: 'f1', zoneId: 'z1',
    date: tomorrow, startTime: '09:00', endTime: '17:00',
    position: 1, notified: false, createdAt: new Date().toISOString(),
  },
  {
    id: 'wl2', userId: 'u8', resourceType: 'desk', floorId: 'f1', zoneId: 'z1',
    date: tomorrow, startTime: '09:00', endTime: '17:00',
    position: 2, notified: false, createdAt: new Date().toISOString(),
  },
];

// ─── Analytics Data ───────────────────────────────────────────────────────────

export const MOCK_DAILY_STATS = Array.from({ length: 30 }, (_, i) => {
  const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
  const isWeekend = [0, 6].includes(new Date(date).getDay());
  const base = isWeekend ? 5 : 30 + Math.floor(Math.random() * 15);
  return {
    date,
    deskBookings: base + Math.floor(Math.random() * 8),
    roomBookings: Math.floor(base * 0.4) + Math.floor(Math.random() * 4),
    parkingBookings: Math.floor(base * 0.3),
    lockerBookings: Math.floor(base * 0.1),
    checkIns: Math.floor(base * 0.85),
    noShows: Math.floor(base * 0.1),
    cancellations: Math.floor(base * 0.05),
    uniqueUsers: Math.floor(base * 0.8),
  };
});

export const MOCK_FLOOR_OCCUPANCY = MOCK_FLOORS.map(f => ({
  floorId: f.id,
  floorName: f.name,
  occupancyRate: Math.floor(50 + Math.random() * 40),
  deskCount: MOCK_DESKS.filter(d => d.floorId === f.id).length,
  roomCount: MOCK_ROOMS.filter(r => r.floorId === f.id).length,
  peakTime: ['09:00', '10:00', '14:00'][Math.floor(Math.random() * 3)],
}));

export const MOCK_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00',
];
