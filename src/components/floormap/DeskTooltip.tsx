import { createPortal } from 'react-dom';
import { Monitor, Zap, Volume2, Phone } from 'lucide-react';
import type { Desk } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { getDeskTypeLabel, getAmenityLabel } from '../../lib/utils';

const amenityIcons: Record<string, React.ReactNode> = {
  monitor: <Monitor className="w-3 h-3" />,
  docking_station: <Zap className="w-3 h-3" />,
  window: <span className="w-3 h-3 inline-block">🪟</span>,
  quiet_zone: <Volume2 className="w-3 h-3" />,
  phone: <Phone className="w-3 h-3" />,
};

interface DeskTooltipProps {
  desk: Desk;
  x: number;
  y: number;
  date: string;
}

export function DeskTooltip({ desk, x, y, date }: DeskTooltipProps) {
  const { bookings, users } = useAppStore();
  const booking = bookings.find(b =>
    b.resourceId === desk.id && b.date === date && b.resourceType === 'desk' &&
    !['cancelled', 'completed', 'no_show'].includes(b.status)
  );
  const bookedByUser = booking ? users.find(u => u.id === booking.userId) : null;

  return createPortal(
    <div
      className="fixed z-[9999] bg-gray-900 text-white rounded-xl p-3 shadow-2xl pointer-events-none min-w-[180px] animate-fade-in"
      style={{ left: Math.min(x, window.innerWidth - 200), top: Math.max(10, y - 160) }}
    >
      <div className="font-bold text-sm mb-1">{desk.label}</div>
      <div className="text-xs text-gray-300 mb-2">{getDeskTypeLabel(desk.type)}</div>
      {bookedByUser ? (
        <div className="text-xs text-yellow-300 mb-1">
          Booked by {bookedByUser.name}<br />
          <span className="text-gray-300">{booking?.startTime}–{booking?.endTime}</span>
        </div>
      ) : (
        <div className="text-xs text-green-400 mb-1">Available</div>
      )}
      {desk.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {desk.amenities.map(a => (
            <span key={a} className="flex items-center gap-0.5 text-xs bg-white/10 rounded px-1.5 py-0.5">
              {amenityIcons[a]} {getAmenityLabel(a)}
            </span>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
