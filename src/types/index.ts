// ─── Core User Types ──────────────────────────────────────────────────────────

export type UserRole = 'employee' | 'admin' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department: string;
  teamId?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  defaultFloorId?: string;
  preferredDeskType?: DeskType;
  notificationsEnabled: boolean;
  emailReminders: boolean;
  reminderMinutes: number;
  theme: 'light' | 'dark' | 'system';
  weekStartsOn: 0 | 1;
}

// ─── Floor & Space Types ──────────────────────────────────────────────────────

export type DeskType = 'hot' | 'fixed' | 'standing' | 'quiet' | 'collaboration';
export type DeskStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'blocked';
export type ResourceType = 'desk' | 'room' | 'parking' | 'locker';

export interface Floor {
  id: string;
  name: string;
  level: number;
  buildingId: string;
  svgLayout?: string;
  gridWidth: number;
  gridHeight: number;
  zones: Zone[];
  amenities: string[];
  capacity: number;
  isActive: boolean;
}

export type FurnitureType = 'plant' | 'couch' | 'printer' | 'coffee_machine' | 'water_cooler' | 'restroom_toilet' | 'restroom_sink' | 'tv' | 'dining_table' | 'pool_table' | 'ping_pong' | 'lounge_chair' | 'bed' | 'server_rack';

export interface Furniture {
  id: string;
  floorId: string;
  type: FurnitureType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  isActive: boolean;
}


export interface Zone {
  id: string;
  name: string;
  floorId: string;
  color: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Desk {
  id: string;
  label: string;
  floorId: string;
  zoneId?: string;
  type: DeskType;
  status: DeskStatus;
  x: number;
  y: number;
  width: number;
  height: number;
  amenities: DeskAmenity[];
  notes?: string;
  fixedUserId?: string;
  isActive: boolean;
}

export type DeskAmenity = 'monitor' | 'docking_station' | 'standing_desk' | 'locker' | 'window' | 'quiet_zone' | 'phone' | 'whiteboard';

export interface Room {
  id: string;
  name: string;
  floorId: string;
  capacity: number;
  type: 'meeting' | 'phone_booth' | 'focus' | 'training' | 'boardroom' | 'washroom' | 'pantry' | 'storage' | 'server_room' | 'printer_room';
  status: DeskStatus;
  amenities: RoomAmenity[];
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  isActive: boolean;
}

export type RoomAmenity = 'tv' | 'whiteboard' | 'video_conf' | 'phone' | 'projector' | 'catering' | 'standing_table';

export interface ParkingSpace {
  id: string;
  label: string;
  floorId: string;
  type: 'standard' | 'accessible' | 'ev_charging' | 'motorcycle';
  status: DeskStatus;
  x: number;
  y: number;
  isActive: boolean;
}

export interface Locker {
  id: string;
  label: string;
  floorId: string;
  size: 'small' | 'medium' | 'large';
  status: DeskStatus;
  assignedUserId?: string;
  isActive: boolean;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  floors: string[];
  isActive: boolean;
}

// ─── Booking Types ────────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'no_show' | 'completed';
export type BookingResourceType = 'desk' | 'room' | 'parking' | 'locker';
export type BookingDurationType = 'full_day' | 'half_day_am' | 'half_day_pm' | 'custom';

export interface Booking {
  id: string;
  userId: string;
  resourceType: BookingResourceType;
  resourceId: string;
  floorId: string;
  buildingId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  durationType?: BookingDurationType;
  title?: string;
  notes?: string;
  attendees?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  isRecurring: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
}

export type AttendanceStatus = 'office' | 'remote' | 'off';

export interface AttendancePlan {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringBooking {
  id: string;
  userId: string;
  resourceType: BookingResourceType;
  resourceId: string;
  floorId: string;
  pattern: RecurringPattern;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  title?: string;
  notes?: string;
  isActive: boolean;
}

export type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface WaitlistEntry {
  id: string;
  userId: string;
  resourceType: BookingResourceType;
  resourceId?: string;
  floorId: string;
  zoneId?: string;
  date: string;
  startTime: string;
  endTime: string;
  position: number;
  notified: boolean;
  createdAt: string;
}

// ─── Team Types ───────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  memberIds: string[];
  color: string;
  department: string;
}

export interface TeamMemberLocation {
  userId: string;
  date: string;
  status: 'office' | 'remote' | 'out_of_office' | 'unknown';
  deskId?: string;
  floorId?: string;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface OccupancyData {
  date: string;
  total: number;
  occupied: number;
  rate: number;
}

export interface ResourceUsageStats {
  resourceId: string;
  resourceType: ResourceType;
  label: string;
  totalBookings: number;
  utilizationRate: number;
  avgDuration: number;
  peakHour: string;
}

export interface FloorStats {
  floorId: string;
  floorName: string;
  deskCount: number;
  roomCount: number;
  avgOccupancy: number;
  peakOccupancy: number;
  popularDesks: string[];
  popularTimes: string[];
}

export interface DailyStats {
  date: string;
  deskBookings: number;
  roomBookings: number;
  parkingBookings: number;
  lockerBookings: number;
  checkIns: number;
  noShows: number;
  cancellations: number;
  uniqueUsers: number;
}

// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationType = 'booking_confirmed' | 'booking_cancelled' | 'checkin_reminder' | 'waitlist_available' | 'desk_released' | 'policy_update' | 'admin_message';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  bookingId?: string;
  createdAt: string;
  actionUrl?: string;
}

// ─── Policy Types ─────────────────────────────────────────────────────────────

export interface BookingPolicy {
  id: string;
  name: string;
  maxAdvanceDays: number;
  maxDurationHours: number;
  maxConcurrentBookings: number;
  maxBookingsPerDay: number;
  checkInWindowMinutes: number;
  autoReleaseMinutes: number;
  requiresApproval: boolean;
  allowRecurring: boolean;
  maxRecurringWeeks: number;
  allowedRoles: UserRole[];
  resourceTypes: BookingResourceType[];
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export interface BookingFilters {
  floorId?: string;
  zoneId?: string;
  date?: string;
  resourceType?: BookingResourceType;
  deskType?: DeskType;
  amenities?: DeskAmenity[];
  minCapacity?: number;
}

export interface FloorMapViewState {
  zoom: number;
  panX: number;
  panY: number;
  selectedResourceId?: string;
  selectedResourceType?: ResourceType;
  hoveredResourceId?: string;
  showZones: boolean;
  showLabels: boolean;
  filter: 'all' | 'available' | 'occupied' | 'mine';
}
