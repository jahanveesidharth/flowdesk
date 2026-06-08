import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Tag, Filter, Eye } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Desk, Room, Floor, ParkingSpace } from '../../types';
import { cn, getDeskStatusColor, formatDate } from '../../lib/utils';
import { Tooltip } from '../ui/Tooltip';
import { Button } from '../ui/Button';
import { Select } from '../ui/Input';
import { DeskTooltip } from './DeskTooltip';
import { RoomTooltip } from './RoomTooltip';
import { format } from 'date-fns';

const CELL = 44;

interface FloorMapProps {
  floor: Floor;
  onDeskClick?: (desk: Desk) => void;
  onRoomClick?: (room: Room) => void;
  selectedDeskId?: string;
  highlightAvailable?: boolean;
  date?: string;
  adminMode?: boolean;
  onDeskDragEnd?: (deskId: string, x: number, y: number) => void;
}

export function FloorMap({ floor, onDeskClick, onRoomClick, selectedDeskId, highlightAvailable, date, adminMode, onDeskDragEnd }: FloorMapProps) {
  const { desks, rooms, bookings, currentUser } = useAppStore();
  const [zoom, setZoom] = useState(1);
  const [showZones, setShowZones] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'mine' | 'occupied'>('all');
  const [hoveredDesk, setHoveredDesk] = useState<{ desk: Desk; x: number; y: number } | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<{ room: Room; x: number; y: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const activeDate = date || format(new Date(), 'yyyy-MM-dd');

  const floorDesks = desks.filter(d => d.floorId === floor.id && d.isActive);
  const floorRooms = rooms.filter(r => r.floorId === floor.id && r.isActive);

  const isDateBooked = useCallback((resourceId: string, resourceType: string) => {
    return bookings.some(b =>
      b.resourceId === resourceId &&
      b.date === activeDate &&
      b.resourceType === resourceType &&
      !['cancelled', 'completed', 'no_show'].includes(b.status)
    );
  }, [bookings, activeDate]);

  const isMyBooking = useCallback((resourceId: string) => {
    return bookings.some(b =>
      b.resourceId === resourceId &&
      b.date === activeDate &&
      b.userId === currentUser.id &&
      !['cancelled', 'completed', 'no_show'].includes(b.status)
    );
  }, [bookings, activeDate, currentUser.id]);

  const getDeskDisplayStatus = useCallback((desk: Desk): string => {
    if (desk.status === 'maintenance') return 'maintenance';
    if (desk.id === selectedDeskId) return 'selected';
    if (isMyBooking(desk.id)) return 'mine';
    if (isDateBooked(desk.id, 'desk')) return 'occupied';
    if (desk.status === 'reserved') return 'reserved';
    return 'available';
  }, [isDateBooked, isMyBooking, selectedDeskId]);

  const shouldShowDesk = useCallback((desk: Desk): boolean => {
    const status = getDeskDisplayStatus(desk);
    if (filter === 'available') return status === 'available';
    if (filter === 'mine') return status === 'mine';
    if (filter === 'occupied') return status === 'occupied';
    return true;
  }, [filter, getDeskDisplayStatus]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('desk-cell') ||
        (e.target as HTMLElement).classList.contains('room-cell')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  };
  const handleMouseUp = () => { isPanning.current = false; };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.4, Math.min(2.5, z - e.deltaY * 0.001)));
  };

  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const mapW = floor.gridWidth * CELL;
  const mapH = floor.gridHeight * CELL;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} className="p-1.5 hover:bg-white rounded-md transition-all">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs font-medium text-gray-600 px-1 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} className="p-1.5 hover:bg-white rounded-md transition-all">
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={reset} className="p-1.5 hover:bg-white rounded-md transition-all">
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowZones(!showZones)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all font-medium',
              showZones ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')}
          >
            <Layers className="w-3.5 h-3.5" /> Zones
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all font-medium',
              showLabels ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')}
          >
            <Tag className="w-3.5 h-3.5" /> Labels
          </button>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-auto">
          {(['all', 'available', 'mine', 'occupied'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1 text-xs rounded-md font-medium transition-all capitalize',
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        {[
          { color: 'bg-green-200 border-green-400', label: 'Available' },
          { color: 'bg-red-200 border-red-400', label: 'Occupied' },
          { color: 'bg-yellow-200 border-yellow-400', label: 'Reserved' },
          { color: 'bg-purple-200 border-purple-400', label: 'My Booking' },
          { color: 'bg-blue-200 border-blue-400', label: 'Selected' },
          { color: 'bg-gray-200 border-gray-400', label: 'Maintenance' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={cn('w-3.5 h-3.5 rounded border', l.color)} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            width: mapW,
            height: mapH,
            position: 'relative',
            transition: isPanning.current ? 'none' : 'transform 0.1s ease',
          }}
        >
          {/* Zone backgrounds */}
          {showZones && floor.zones.map(zone => (
            <div
              key={zone.id}
              className="absolute rounded-lg border border-dashed border-opacity-50"
              style={{
                left: zone.x * CELL,
                top: zone.y * CELL,
                width: zone.width * CELL,
                height: zone.height * CELL,
                backgroundColor: zone.color + '60',
                borderColor: zone.color,
              }}
            >
              {showLabels && (
                <span className="absolute top-2 left-3 text-xs font-semibold opacity-70" style={{ color: '#374151' }}>
                  {zone.name}
                </span>
              )}
            </div>
          ))}

          {/* Desks */}
          {floorDesks.filter(shouldShowDesk).map(desk => {
            const status = getDeskDisplayStatus(desk);
            return (
              <div
                key={desk.id}
                className={cn('desk-cell absolute', getDeskStatusColor(status))}
                style={{
                  left: desk.x * CELL + 2,
                  top: desk.y * CELL + 2,
                  width: desk.width * CELL - 4,
                  height: desk.height * CELL - 4,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (status !== 'maintenance' && onDeskClick) onDeskClick(desk);
                }}
                onMouseEnter={(e) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setHoveredDesk({ desk, x: rect.left, y: rect.top });
                }}
                onMouseLeave={() => setHoveredDesk(null)}
              >
                {showLabels && (
                  <span style={{ fontSize: Math.max(8, 10 * zoom) + 'px', pointerEvents: 'none' }}>
                    {desk.label}
                  </span>
                )}
              </div>
            );
          })}

          {/* Rooms */}
          {floorRooms.map(room => {
            const booked = isDateBooked(room.id, 'room');
            const roomStatus = booked ? 'occupied' : 'available';
            return (
              <div
                key={room.id}
                className={cn('room-cell absolute', booked ? 'room-occupied' : 'room-available')}
                style={{
                  left: room.x * CELL + 2,
                  top: room.y * CELL + 2,
                  width: room.width * CELL - 4,
                  height: room.height * CELL - 4,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onRoomClick) onRoomClick(room);
                }}
                onMouseEnter={(e) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setHoveredRoom({ room, x: rect.left, y: rect.top });
                }}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                {showLabels && (
                  <div style={{ fontSize: Math.max(8, 9 * zoom) + 'px', pointerEvents: 'none', textAlign: 'center' }}>
                    <div className="font-semibold truncate px-1">{room.name}</div>
                    <div className="opacity-70">{room.capacity}p</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desk tooltip (portal-style, fixed position) */}
      {hoveredDesk && (
        <DeskTooltip desk={hoveredDesk.desk} x={hoveredDesk.x} y={hoveredDesk.y} date={activeDate} />
      )}
      {hoveredRoom && (
        <RoomTooltip room={hoveredRoom.room} x={hoveredRoom.x} y={hoveredRoom.y} date={activeDate} />
      )}

      {/* Stats bar */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-gray-500">
            {floorDesks.filter(d => getDeskDisplayStatus(d) === 'available').length} available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-gray-500">
            {floorDesks.filter(d => getDeskDisplayStatus(d) === 'occupied').length} occupied
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span className="text-gray-500">
            {floorDesks.filter(d => getDeskDisplayStatus(d) === 'mine').length} mine
          </span>
        </div>
        <div className="ml-auto text-gray-400 text-xs">
          {floorDesks.length} desks · {floorRooms.length} rooms · {formatDate(activeDate)}
        </div>
      </div>
    </div>
  );
}
