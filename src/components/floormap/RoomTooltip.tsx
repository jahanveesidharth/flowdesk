import { createPortal } from 'react-dom';
import { Users, Monitor, Wifi } from 'lucide-react';
import type { Room } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { getRoomTypeLabel, getAmenityLabel } from '../../lib/utils';

interface RoomTooltipProps { room: Room; x: number; y: number; date: string; }

export function RoomTooltip({ room, x, y, date }: RoomTooltipProps) {
  const { bookings, users } = useAppStore();
  const todayBookings = bookings.filter(b =>
    b.resourceId === room.id && b.date === date && b.resourceType === 'room' &&
    !['cancelled', 'completed', 'no_show'].includes(b.status)
  );

  return createPortal(
    <div
      className="fixed z-[9999] bg-gray-900 text-white rounded-xl p-3 shadow-2xl pointer-events-none min-w-[200px] animate-fade-in"
      style={{ left: Math.min(x, window.innerWidth - 220), top: Math.max(10, y - 200) }}
    >
      <div className="font-bold text-sm mb-0.5">{room.name}</div>
      <div className="text-xs text-gray-300 mb-1">{getRoomTypeLabel(room.type)}</div>
      <div className="flex items-center gap-1 text-xs text-gray-300 mb-2">
        <Users className="w-3 h-3" /> {room.capacity} people
      </div>
      {todayBookings.length === 0 ? (
        <div className="text-xs text-green-400">Available all day</div>
      ) : (
        <div className="text-xs space-y-1">
          {todayBookings.slice(0, 3).map(b => {
            const user = users.find(u => u.id === b.userId);
            return (
              <div key={b.id} className="flex items-center justify-between gap-3">
                <span className="text-yellow-300 truncate">{b.title || user?.name || '—'}</span>
                <span className="text-gray-400 shrink-0">{b.startTime}–{b.endTime}</span>
              </div>
            );
          })}
          {todayBookings.length > 3 && <div className="text-gray-400 text-xs">+{todayBookings.length - 3} more</div>}
        </div>
      )}
      {room.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 border-t border-white/10 pt-2">
          {room.amenities.map(a => (
            <span key={a} className="text-xs bg-white/10 rounded px-1.5 py-0.5">{getAmenityLabel(a)}</span>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
