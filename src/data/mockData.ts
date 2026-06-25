import type { User, Floor, Desk, Room, ParkingSpace, Locker, Booking, Team, Notification, Building, BookingPolicy, WaitlistEntry, Furniture } from '../types';
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
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    preferences: { notificationsEnabled: true, emailReminders: true, reminderMinutes: 30, theme: 'light', weekStartsOn: 1, defaultFloorId: 'f1' },
    createdAt: '2024-01-10T09:00:00Z',
  },
  {
    id: 'u2',
    name: 'James Walker',
    email: 'james@deskflow.io',
    role: 'admin',
    department: 'Operations',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80',
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
    timezone: 'Asia/Kolkata',
    floors: ['f1', 'f2', 'f3', 'f4'],
    isActive: true,
  },
  {
    id: 'b2',
    name: 'East Campus',
    address: '200 Tech Park Blvd',
    city: 'San Francisco',
    country: 'US',
    timezone: 'Asia/Kolkata',
    floors: [],
    isActive: false,
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
      { id: 'z1', name: 'Engineering', floorId: 'f1', color: '#ebdbe4', x: 0, y: 0, width: 9, height: 7 },
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
    name: 'Third Floor',
    level: 3,
    buildingId: 'b1',
    gridWidth: 18,
    gridHeight: 14,
    zones: [
      { id: 'z10', name: 'Cafeteria & Lounge', floorId: 'f4', color: '#ecfdf5', x: 0, y: 0, width: 18, height: 14 },
    ],
    amenities: ['kitchen', 'gaming_zone', 'terrace'],
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
  ...generateDesks('f2', 'z6', 10, 1, 2, 2, 49, 'hot'),
  ...generateDesks('f2', 'z7', 1, 8, 4, 2, 57, 'hot'),
  // Floor 3
  ...generateDesks('f3', 'z8', 6, 4, 4, 2, 73, 'fixed'),
  ...generateDesks('f3', 'z9', 6, 7, 4, 2, 81, 'hot'),
  // Floor 4
  ...generateDesks('f4', 'z10', 1, 1, 6, 3, 89, 'hot'),
];

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const MOCK_ROOMS: Room[] = [
  // Ground Floor (f1)
  { id: 'r1', name: 'Private Office 1', floorId: 'f1', capacity: 4, type: 'meeting', status: 'available', amenities: ['tv', 'whiteboard'], x: 6, y: 0, width: 3, height: 3, isActive: true },
  { id: 'r2', name: 'Conference Room', floorId: 'f1', capacity: 12, type: 'boardroom', status: 'available', amenities: ['projector', 'whiteboard', 'video_conf'], x: 12, y: 2.5, width: 6, height: 6, isActive: true },
  { id: 'r3', name: 'Manager Office', floorId: 'f1', capacity: 3, type: 'meeting', status: 'occupied', amenities: ['tv'], x: 6, y: 5, width: 3, height: 3.5, isActive: true },
  { id: 'r4', name: 'Meeting Room', floorId: 'f1', capacity: 6, type: 'meeting', status: 'available', amenities: ['whiteboard'], x: 9, y: 5, width: 3, height: 3.5, isActive: true },
  { id: 'r5', name: 'Bedroom Suite', floorId: 'f1', capacity: 2, type: 'focus', status: 'available', amenities: ['phone'], x: 0, y: 8, width: 3.5, height: 3.5, isActive: true },
  { id: 'r6', name: 'Private Office 2', floorId: 'f1', capacity: 4, type: 'meeting', status: 'available', amenities: ['tv'], x: 15, y: 8.5, width: 3, height: 4, isActive: true },
  // Non-bookable structural rooms for f1 (Ground Floor)
  { id: 'f1-r_wc1', name: 'Washroom', floorId: 'f1', capacity: 1, type: 'washroom', status: 'available', amenities: [], x: 9, y: 0, width: 1.5, height: 3, isActive: true },
  { id: 'f1-r_wc2', name: 'Washroom', floorId: 'f1', capacity: 1, type: 'washroom', status: 'available', amenities: [], x: 10.5, y: 0, width: 1.5, height: 3, isActive: true },
  { id: 'f1-r_pantry', name: 'Pantry', floorId: 'f1', capacity: 8, type: 'pantry', status: 'available', amenities: [], x: 12, y: 0, width: 3, height: 2.5, isActive: true },
  { id: 'f1-r_storage', name: 'Storage', floorId: 'f1', capacity: 0, type: 'storage', status: 'available', amenities: [], x: 15, y: 0, width: 3, height: 2.5, isActive: true },
  { id: 'f1-r_wc3', name: 'Washroom', floorId: 'f1', capacity: 1, type: 'washroom', status: 'available', amenities: [], x: 3.5, y: 9, width: 2.5, height: 2.5, isActive: true },
  { id: 'f1-r_server', name: 'Server Room', floorId: 'f1', capacity: 0, type: 'server_room', status: 'available', amenities: [], x: 0, y: 11.5, width: 3, height: 2.5, isActive: true },
  { id: 'f1-r_printer', name: 'Printer / Copy Room', floorId: 'f1', capacity: 2, type: 'printer_room', status: 'available', amenities: [], x: 3, y: 11.5, width: 3, height: 2.5, isActive: true },
  { id: 'f1-r_lobby', name: 'Lobby / Reception', floorId: 'f1', capacity: 10, type: 'meeting', status: 'available', amenities: [], x: 6, y: 8.5, width: 6, height: 4, isActive: true },
  { id: 'f1-r_waiting', name: 'Waiting Area', floorId: 'f1', capacity: 6, type: 'meeting', status: 'available', amenities: [], x: 12, y: 8.5, width: 3, height: 4, isActive: true },

  // First Floor (f2)
  { id: 'r7', name: 'Sales Manager', floorId: 'f2', capacity: 4, type: 'meeting', status: 'available', amenities: ['tv'], x: 6, y: 4.5, width: 3, height: 3.5, isActive: true },
  { id: 'r8', name: 'Meeting Room 1', floorId: 'f2', capacity: 6, type: 'meeting', status: 'occupied', amenities: ['whiteboard'], x: 9, y: 4.5, width: 3, height: 3.5, isActive: true },
  { id: 'r9', name: 'Training Room', floorId: 'f2', capacity: 16, type: 'training', status: 'available', amenities: ['projector', 'whiteboard'], x: 12, y: 4.5, width: 6, height: 5, isActive: true },
  { id: 'r10', name: 'Quiet Booth 1', floorId: 'f2', capacity: 2, type: 'focus', status: 'available', amenities: ['phone'], x: 0, y: 9, width: 3.5, height: 2.5, isActive: true },
  { id: 'r11', name: 'Quiet Booth 2', floorId: 'f2', capacity: 2, type: 'focus', status: 'available', amenities: ['phone'], x: 0, y: 11.5, width: 3.5, height: 2.5, isActive: true },
  // Non-bookable structural rooms for f2 (First Floor)
  { id: 'f2-r_pantry', name: 'Cafeteria & Pantry', floorId: 'f2', capacity: 24, type: 'pantry', status: 'available', amenities: [], x: 12, y: 0, width: 6, height: 4.5, isActive: true },
  { id: 'f2-r_server', name: 'Server Room', floorId: 'f2', capacity: 0, type: 'server_room', status: 'available', amenities: [], x: 0, y: 6, width: 3, height: 3, isActive: true },
  { id: 'f2-r_lobby', name: 'Lobby / Reception', floorId: 'f2', capacity: 15, type: 'meeting', status: 'available', amenities: [], x: 3.5, y: 9, width: 8.5, height: 5, isActive: true },
  { id: 'f2-r_collab', name: 'Collaboration Lounge', floorId: 'f2', capacity: 12, type: 'meeting', status: 'available', amenities: [], x: 12, y: 9.5, width: 6, height: 4.5, isActive: true },

  // Second Floor (f3)
  { id: 'r12', name: 'CEO Suite', floorId: 'f3', capacity: 6, type: 'boardroom', status: 'available', amenities: ['tv', 'video_conf'], x: 0, y: 0, width: 5.5, height: 4.5, isActive: true },
  { id: 'r13', name: 'VIP Boardroom', floorId: 'f3', capacity: 14, type: 'boardroom', status: 'reserved', amenities: ['projector', 'video_conf', 'whiteboard'], x: 11, y: 4, width: 7, height: 6, isActive: true },
  { id: 'r14', name: 'VP Sales Office', floorId: 'f3', capacity: 3, type: 'meeting', status: 'available', amenities: ['tv'], x: 0, y: 9, width: 2.75, height: 5, isActive: true },
  { id: 'r15', name: 'VP Eng Office', floorId: 'f3', capacity: 3, type: 'meeting', status: 'available', amenities: ['tv'], x: 2.75, y: 9, width: 2.75, height: 5, isActive: true },
  { id: 'r16', name: 'R&D Innovation Lab', floorId: 'f3', capacity: 10, type: 'training', status: 'available', amenities: ['whiteboard'], x: 11, y: 10, width: 7, height: 4, isActive: true },
  // Non-bookable structural rooms for f3 (Second Floor)
  { id: 'f3-r_wc1', name: 'Washroom', floorId: 'f3', capacity: 1, type: 'washroom', status: 'available', amenities: [], x: 9, y: 0, width: 1.5, height: 3, isActive: true },
  { id: 'f3-r_wc2', name: 'Washroom', floorId: 'f3', capacity: 1, type: 'washroom', status: 'available', amenities: [], x: 10.5, y: 0, width: 1.5, height: 3, isActive: true },
  { id: 'f3-r_ceo_wc', name: 'CEO Washroom', floorId: 'f3', capacity: 1, type: 'washroom', status: 'available', amenities: [], x: 0, y: 4.5, width: 2, height: 2, isActive: true },
  { id: 'f3-r_cafe', name: 'Executive Cafe', floorId: 'f3', capacity: 12, type: 'pantry', status: 'available', amenities: [], x: 12, y: 0, width: 6, height: 4, isActive: true },
  { id: 'f3-r_recept', name: 'Executive Reception', floorId: 'f3', capacity: 8, type: 'meeting', status: 'available', amenities: [], x: 5.5, y: 10, width: 5.5, height: 4, isActive: true },
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
  { id: 't1', name: 'Engineering', description: 'Product engineering team', managerId: 'u3', memberIds: ['u1', 'u3', 'u6'], color: '#724b68', department: 'Engineering' },
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

export const MOCK_FURNITURE: Furniture[] = [
  // Floor 1 (Ground)
  { id: 'f1-fur_bed1', floorId: 'f1', type: 'bed', x: 0.5, y: 9, width: 1.5, height: 2, rotation: 0, isActive: true },
  { id: 'f1-fur_wc1_toilet', floorId: 'f1', type: 'restroom_toilet', x: 9.25, y: 0.2, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_wc1_sink', floorId: 'f1', type: 'restroom_sink', x: 9.25, y: 2.2, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_wc2_toilet', floorId: 'f1', type: 'restroom_toilet', x: 10.75, y: 0.2, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_wc2_sink', floorId: 'f1', type: 'restroom_sink', x: 10.75, y: 2.2, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_wc3_toilet', floorId: 'f1', type: 'restroom_toilet', x: 4.25, y: 9.2, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_wc3_sink', floorId: 'f1', type: 'restroom_sink', x: 4.25, y: 10.8, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_srv1', floorId: 'f1', type: 'server_rack', x: 0.4, y: 12, width: 1, height: 1.5, rotation: 0, isActive: true },
  { id: 'f1-fur_srv2', floorId: 'f1', type: 'server_rack', x: 1.6, y: 12, width: 1, height: 1.5, rotation: 0, isActive: true },
  { id: 'f1-fur_prn1', floorId: 'f1', type: 'printer', x: 4, y: 12, width: 1, height: 1, rotation: 180, isActive: true },
  
  // Lobby/Reception counter and waiting room couch
  { id: 'f1-fur_lobby_desk', floorId: 'f1', type: 'dining_table', x: 8, y: 10, width: 2, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_lobby_couch', floorId: 'f1', type: 'couch', x: 6.2, y: 11, width: 2, height: 1, rotation: 90, isActive: true },
  { id: 'f1-fur_wait_couch', floorId: 'f1', type: 'couch', x: 12.2, y: 10, width: 2, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_wait_chair', floorId: 'f1', type: 'lounge_chair', x: 13.5, y: 11, width: 1, height: 1, rotation: 90, isActive: true },
  { id: 'f1-fur_pantry_sink', floorId: 'f1', type: 'restroom_sink', x: 13, y: 0.2, width: 1, height: 1, rotation: 0, isActive: true },

  // Plants
  { id: 'f1-fur_p1', floorId: 'f1', type: 'plant', x: 0, y: 0, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_p2', floorId: 'f1', type: 'plant', x: 0, y: 7, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_p3', floorId: 'f1', type: 'plant', x: 17, y: 7, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_p4', floorId: 'f1', type: 'plant', x: 17, y: 13, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f1-fur_p5', floorId: 'f1', type: 'plant', x: 6, y: 13, width: 1, height: 1, rotation: 0, isActive: true },
  
  // Floor 2 (First)
  { id: 'f2-fur1', floorId: 'f2', type: 'dining_table', x: 12, y: 2, width: 2, height: 1, rotation: 0, isActive: true },
  { id: 'f2-fur2', floorId: 'f2', type: 'dining_table', x: 15, y: 2, width: 2, height: 1, rotation: 0, isActive: true },
  { id: 'f2-fur3', floorId: 'f2', type: 'coffee_machine', x: 17, y: 1, width: 1, height: 1, rotation: 270, isActive: true },
  { id: 'f2-fur4', floorId: 'f2', type: 'water_cooler', x: 11, y: 1, width: 1, height: 1, rotation: 180, isActive: true },
  { id: 'f2-fur5', floorId: 'f2', type: 'plant', x: 0, y: 1, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f2-fur6', floorId: 'f2', type: 'plant', x: 17, y: 6, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f2-fur7', floorId: 'f2', type: 'couch', x: 5, y: 9, width: 2, height: 1, rotation: 0, isActive: true },
  
  // Floor 3 (Second)
  { id: 'f3-fur1', floorId: 'f3', type: 'couch', x: 6, y: 10, width: 2, height: 1, rotation: 0, isActive: true },
  { id: 'f3-fur2', floorId: 'f3', type: 'coffee_machine', x: 12, y: 9, width: 1, height: 1, rotation: 90, isActive: true },
  { id: 'f3-fur3', floorId: 'f3', type: 'plant', x: 0, y: 1, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f3-fur4', floorId: 'f3', type: 'plant', x: 17, y: 1, width: 1, height: 1, rotation: 0, isActive: true },
  
  // Floor 4 (Third)
  { id: 'f4-fur1', floorId: 'f4', type: 'pool_table', x: 13, y: 9, width: 2, height: 1, rotation: 0, isActive: true },
  { id: 'f4-fur2', floorId: 'f4', type: 'ping_pong', x: 9, y: 9, width: 2, height: 1, rotation: 0, isActive: true },
  { id: 'f4-fur3', floorId: 'f4', type: 'lounge_chair', x: 2, y: 11, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f4-fur4', floorId: 'f4', type: 'couch', x: 4, y: 11, width: 2, height: 1, rotation: 0, isActive: true },
  { id: 'f4-fur5', floorId: 'f4', type: 'tv', x: 4, y: 13, width: 2, height: 1, rotation: 180, isActive: true },
  { id: 'f4-fur6', floorId: 'f4', type: 'plant', x: 1, y: 2, width: 1, height: 1, rotation: 0, isActive: true },
  { id: 'f4-fur7', floorId: 'f4', type: 'plant', x: 16, y: 2, width: 1, height: 1, rotation: 0, isActive: true }
];

