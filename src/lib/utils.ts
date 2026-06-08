import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isTomorrow, isYesterday, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEE, MMM d');
}

export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
}

export function formatTimeAgo(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

export function getDeskStatusColor(status: string): string {
  const map: Record<string, string> = {
    available: 'desk-available',
    occupied: 'desk-occupied',
    reserved: 'desk-reserved',
    maintenance: 'desk-maintenance',
    selected: 'desk-selected',
    mine: 'desk-mine',
    blocked: 'desk-maintenance',
  };
  return map[status] || 'desk-available';
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    checked_in: 'bg-blue-100 text-blue-800',
    no_show: 'bg-gray-100 text-gray-800',
    completed: 'bg-gray-100 text-gray-700',
    available: 'bg-green-100 text-green-700',
    occupied: 'bg-red-100 text-red-700',
    reserved: 'bg-yellow-100 text-yellow-700',
    maintenance: 'bg-gray-100 text-gray-600',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function generateAvatarColor(seed: string): string {
  const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function generateTimeSlots(startHour = 8, endHour = 20, step = 30): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += step) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function timesOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  return timeToMinutes(s1) < timeToMinutes(e2) && timeToMinutes(e1) > timeToMinutes(s2);
}

export function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function getDeskTypeLabel(type: string): string {
  const map: Record<string, string> = {
    hot: 'Hot Desk',
    fixed: 'Fixed Desk',
    standing: 'Standing Desk',
    quiet: 'Quiet Desk',
    collaboration: 'Collaboration',
  };
  return map[type] || type;
}

export function getRoomTypeLabel(type: string): string {
  const map: Record<string, string> = {
    meeting: 'Meeting Room',
    phone_booth: 'Phone Booth',
    focus: 'Focus Room',
    training: 'Training Room',
    boardroom: 'Boardroom',
  };
  return map[type] || type;
}

export function getAmenityLabel(amenity: string): string {
  const map: Record<string, string> = {
    monitor: 'Monitor',
    docking_station: 'Docking Station',
    standing_desk: 'Standing Desk',
    locker: 'Locker',
    window: 'Window',
    quiet_zone: 'Quiet Zone',
    phone: 'Phone',
    whiteboard: 'Whiteboard',
    tv: 'TV',
    video_conf: 'Video Conf',
    projector: 'Projector',
    catering: 'Catering',
    standing_table: 'Standing Table',
  };
  return map[amenity] || amenity;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural || singular + 's'}`;
}
