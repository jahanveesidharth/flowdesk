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
    washroom: 'Washroom / Restroom',
    pantry: 'Pantry / Breakroom',
    storage: 'Storage Room',
    server_room: 'Server Room',
    printer_room: 'Printer Room',
  };
  return map[type] || type;
}

export function getRoomDimensionsLabel(width: number, height: number): string {
  const wTotalInches = width * 30; // 2.5 feet = 30 inches per cell
  const hTotalInches = height * 30;
  
  const wFeet = Math.floor(wTotalInches / 12);
  const wInches = Math.round(wTotalInches % 12);
  const hFeet = Math.floor(hTotalInches / 12);
  const hInches = Math.round(hTotalInches % 12);
  
  return `${wFeet}'${wInches}" x ${hFeet}'${hInches}"`;
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

export interface ZoneColors {
  bgLight: string;
  textLight: string;
  borderLight: string;
  bgDark: string;
  textDark: string;
  borderDark: string;
}

export function getZoneColors(color: string): ZoneColors {
  const norm = color.toLowerCase();
  
  // Blue / Engineering / Conference
  if (norm === '#dbeafe' || norm === '#f0f9ff') {
    return {
      bgLight: '#dbeafe',
      textLight: '#1e40af', // blue-800
      borderLight: '#bfdbfe', // blue-200
      bgDark: 'rgba(30, 41, 59, 0.85)', // slate-800/85
      textDark: '#93c5fd', // blue-300
      borderDark: 'rgba(59, 130, 246, 0.4)', // blue-500/40
    };
  }
  // Pink / Design
  if (norm === '#fce7f3') {
    return {
      bgLight: '#fce7f3',
      textLight: '#9d174d', // pink-800
      borderLight: '#fbcfe8',
      bgDark: 'rgba(30, 41, 59, 0.85)',
      textDark: '#fbcfe8', // pink-200
      borderDark: 'rgba(236, 72, 153, 0.4)', // pink-500/40
    };
  }
  // Green / Quiet Zone / Open Space
  if (norm === '#f0fdf4') {
    return {
      bgLight: '#dcfce7', // green-100
      textLight: '#166534', // green-800
      borderLight: '#bbf7d0',
      bgDark: 'rgba(30, 41, 59, 0.85)',
      textDark: '#a7f3d0', // green-200
      borderDark: 'rgba(16, 185, 129, 0.4)', // green-500/40
    };
  }
  // Yellow / Collaboration
  if (norm === '#fef9c3') {
    return {
      bgLight: '#fef9c3',
      textLight: '#854d0e', // yellow-800
      borderLight: '#fef08a',
      bgDark: 'rgba(30, 41, 59, 0.85)',
      textDark: '#fde047', // yellow-300
      borderDark: 'rgba(234, 179, 8, 0.4)', // yellow-500/40
    };
  }
  // Amber / Sales
  if (norm === '#fef3c7') {
    return {
      bgLight: '#fef3c7',
      textLight: '#92400e', // amber-800
      borderLight: '#fde68a',
      bgDark: 'rgba(30, 41, 59, 0.85)',
      textDark: '#fde68a', // amber-200
      borderDark: 'rgba(245, 158, 11, 0.4)', // amber-500/40
    };
  }
  // Purple / Marketing
  if (norm === '#ede9fe') {
    return {
      bgLight: '#ede9fe',
      textLight: '#5b21b6', // purple-800
      borderLight: '#ddd6fe',
      bgDark: 'rgba(30, 41, 59, 0.85)',
      textDark: '#ddd6fe', // purple-200
      borderDark: 'rgba(139, 92, 246, 0.4)', // purple-500/40
    };
  }
  // Red / Executive
  if (norm === '#fef2f2') {
    return {
      bgLight: '#fee2e2', // red-100
      textLight: '#991b1b', // red-800
      borderLight: '#fecaca',
      bgDark: 'rgba(30, 41, 59, 0.85)',
      textDark: '#fca5a5', // red-300
      borderDark: 'rgba(239, 68, 68, 0.4)', // red-500/40
    };
  }
  // Gray / Hot Desks
  return {
    bgLight: '#f3f4f6',
    textLight: '#374151', // gray-700
    borderLight: '#e5e7eb',
    bgDark: 'rgba(30, 41, 59, 0.85)',
    textDark: '#cbd5e1', // gray-300
    borderDark: 'rgba(107, 114, 128, 0.4)', // gray-500/40
  };
}
