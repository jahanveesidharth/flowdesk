import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Monitor, Printer, RotateCcw, Tag, Utensils, ZoomIn, ZoomOut } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '../../store/useAppStore';
import type { Desk, Floor, Room } from '../../types';
import { cn, formatDate, getRoomDimensionsLabel, getDeskTypeLabel } from '../../lib/utils';
import { DeskTooltip } from './DeskTooltip';
import { RoomTooltip } from './RoomTooltip';
import { FloorStructure } from './FloorStructure';
import { FurnitureAsset } from './FurnitureAsset';
import { Avatar } from '../ui/Avatar';

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

type DisplayStatus = 'available' | 'occupied' | 'reserved' | 'mine' | 'selected' | 'maintenance';

const markerStyles: Record<DisplayStatus, { dot: string; ring: string; label: string }> = {
  available: { dot: 'bg-emerald-400', ring: 'ring-emerald-100', label: 'Available' },
  occupied: { dot: 'bg-rose-500', ring: 'ring-rose-100', label: 'Occupied' },
  reserved: { dot: 'bg-amber-400', ring: 'ring-amber-100', label: 'Booked' },
  mine: { dot: 'bg-sky-500', ring: 'ring-sky-100', label: 'Mine' },
  selected: { dot: 'bg-blue-600', ring: 'ring-blue-100', label: 'Selected' },
  maintenance: { dot: 'bg-slate-400', ring: 'ring-slate-100', label: 'Offline' },
};

function renderFurnitureAsset(type: string) {
  return <FurnitureAsset type={type} className="w-full h-full" />;
}

export function FloorMap({ floor, onDeskClick, onRoomClick, selectedDeskId, highlightAvailable, date }: FloorMapProps) {
  const { desks, rooms, bookings, currentUser, furniture, users } = useAppStore();
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'mine' | 'occupied'>('all');
  const [hoveredDesk, setHoveredDesk] = useState<{ desk: Desk; x: number; y: number } | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<{ room: Room; x: number; y: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

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

  const getDeskDisplayStatus = useCallback((desk: Desk): DisplayStatus => {
    if (desk.status === 'maintenance' || desk.status === 'blocked') return 'maintenance';
    if (desk.id === selectedDeskId) return 'selected';
    if (isMyBooking(desk.id)) return 'mine';
    if (isDateBooked(desk.id, 'desk') || desk.status === 'occupied') return 'occupied';
    if (desk.status === 'reserved') return 'reserved';
    return 'available';
  }, [isDateBooked, isMyBooking, selectedDeskId]);

  const shouldShowDesk = useCallback((desk: Desk) => {
    const status = getDeskDisplayStatus(desk);
    if (filter === 'available') return status === 'available';
    if (filter === 'mine') return status === 'mine';
    if (filter === 'occupied') return status === 'occupied';
    return true;
  }, [filter, getDeskDisplayStatus]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.desk-cell, .room-cell, button')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  };

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const mapW = 1200;
  const mapH = 960;
  const cellW = mapW / floor.gridWidth;
  const cellH = mapH / floor.gridHeight;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <button title="Zoom in" onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-855">
            <ZoomIn className="h-4 w-4 text-gray-600" />
          </button>
          <span className="min-w-[3rem] px-1 text-center text-xs font-bold text-gray-700 dark:text-gray-200">{Math.round(zoom * 100)}%</span>
          <button title="Zoom out" onClick={() => setZoom(z => Math.max(0.45, z - 0.15))} className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-855">
            <ZoomOut className="h-4 w-4 text-gray-600" />
          </button>
          <button title="Reset view" onClick={reset} className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-855">
            <RotateCcw className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <button
          onClick={() => setShowLabels(!showLabels)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
            showLabels ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
          )}
        >
          <Tag className="h-3.5 w-3.5" /> Labels
        </button>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          {(['all', 'available', 'mine', 'occupied'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all',
                filter === f ? 'bg-gray-100 text-gray-900 shadow-sm dark:bg-gray-850 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {(['available', 'occupied', 'reserved', 'mine', 'maintenance'] as DisplayStatus[]).map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={cn('h-3 w-3 rounded-full ring-4', markerStyles[status].dot, markerStyles[status].ring)} />
            {markerStyles[status].label}
          </div>
        ))}
      </div>

      <div
        className="relative min-h-[560px] flex-1 cursor-grab overflow-hidden rounded-xl border border-slate-200 bg-[#eef7f8] p-5 shadow-inner active:cursor-grabbing dark:border-gray-800 dark:bg-slate-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => { isPanning.current = false; }}
        onMouseLeave={() => { isPanning.current = false; }}
        onWheel={(e) => {
          e.preventDefault();
          setZoom(z => Math.max(0.45, Math.min(2.5, z - e.deltaY * 0.001)));
        }}
      >
        <div
          className="office-plan"
          style={{
            width: mapW,
            height: mapH,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isPanning.current ? 'none' : 'transform 0.1s ease',
          }}
        >
          <FloorStructure floorId={floor.id} showLabels={showLabels} className="reference-office-svg" />

          {/* Render draggable customizable furniture decor */}
          {furniture.filter(f => f.floorId === floor.id && f.isActive).map(item => (
            <div
              key={item.id}
              className="absolute z-[2] select-none pointer-events-none"
              style={{
                left: item.x * cellW,
                top: item.y * cellH,
                width: item.width * cellW,
                height: item.height * cellH,
                transform: `rotate(${item.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {renderFurnitureAsset(item.type)}
            </div>
          ))}

          {floorDesks.filter(shouldShowDesk).map((desk, index) => {
            const status = getDeskDisplayStatus(desk);
            const booking = bookings.find(b =>
              b.resourceId === desk.id &&
              b.date === activeDate &&
              b.resourceType === 'desk' &&
              !['cancelled', 'completed', 'no_show'].includes(b.status)
            );
            const occupant = booking ? users.find(u => u.id === booking.userId) : null;
            const isCheckedIn = booking?.status === 'checked_in';

            // Check if there are desks directly above, below, left, right
            const hasDeskBelow = floorDesks.some(d => d.x === desk.x && d.y === desk.y + 1);
            const hasDeskAbove = floorDesks.some(d => d.x === desk.x && d.y === desk.y - 1);
            const hasDeskLeft = floorDesks.some(d => d.y === desk.y && d.x === desk.x - 1);
            const hasDeskRight = floorDesks.some(d => d.y === desk.y && d.x === desk.x + 1);

            const chairPosition = hasDeskBelow ? 'top' : (hasDeskAbove ? 'bottom' : (desk.y % 2 === 0 ? 'top' : 'bottom'));

            // Horizontal & vertical spacing adjustments
            const tableLeftOffset = hasDeskLeft ? 0 : 8;
            const tableWidthOffset = (hasDeskLeft ? 0 : 8) + (hasDeskRight ? 0 : 8);

            const tableTopOffset = hasDeskAbove ? 0 : 12;
            const tableHeightOffset = (hasDeskAbove ? 0 : 12) + (hasDeskBelow ? 0 : 12);

            const borderClasses = cn(
              hasDeskAbove ? "border-t-0 rounded-t-none" : "border-t-2 rounded-t-md",
              hasDeskBelow ? "border-b-0 rounded-b-none" : "border-b-2 rounded-b-md",
              hasDeskLeft ? "border-l-0 rounded-l-none" : "border-l-2 rounded-l-md",
              hasDeskRight ? "border-r-0 rounded-r-none" : "border-r-2 rounded-r-md"
            );

            const typeMarkerColors = {
              hot: '#ef4444',
              fixed: '#3b82f6',
              standing: '#10b981',
              quiet: '#8b5cf6',
              collaboration: '#f59e0b'
            };

            return (
              <div
                key={desk.id}
                className={cn(
                  'desk-cell absolute transition-all flex items-center justify-center shadow-sm',
                  status === 'maintenance' && 'cursor-not-allowed opacity-70',
                  selectedDeskId === desk.id 
                    ? 'ring-2 ring-blue-500 scale-105 border-blue-500 shadow-md shadow-blue-500/10 z-[10]' 
                    : 'bg-[#e8d2ba] dark:bg-[#5a4632] border-[#cfa376] dark:border-[#423120]',
                  borderClasses
                )}
                style={{
                  left: desk.x * cellW + tableLeftOffset,
                  top: desk.y * cellH + tableTopOffset,
                  width: Math.max(20, cellW - tableWidthOffset),
                  height: Math.max(16, cellH - tableHeightOffset),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (status !== 'maintenance') onDeskClick?.(desk);
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredDesk({ desk, x: rect.left, y: rect.top });
                }}
                onMouseLeave={() => setHoveredDesk(null)}
              >
                {/* Unified wood tone table label */}
                <div className="flex flex-col items-center justify-center select-none pointer-events-none">
                  <span className="text-[9px] font-mono font-bold text-amber-950/90 dark:text-amber-100/90 leading-none">
                    {desk.label.replace('D-', '').padStart(2, '0')}
                  </span>
                  {status === 'maintenance' && <span className="text-[6px] text-amber-900 font-bold uppercase tracking-wider scale-75 mt-0.5 leading-none">OFFLINE</span>}
                </div>

                {/* Desk type small indicator dot */}
                <span 
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full shadow-sm"
                  style={{ backgroundColor: typeMarkerColors[desk.type] }}
                  title={getDeskTypeLabel(desk.type)}
                />

                {/* Upgraded proportional sleek chair */}
                <div
                  className={cn(
                    "absolute w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 z-20 shadow-sm border",
                    "bg-[#2d3748] border-[#1e293b] dark:bg-[#1e293b] dark:border-[#0f172a]"
                  )}
                  style={{
                    top: chairPosition === 'top' ? '-20px' : 'auto',
                    bottom: chairPosition === 'bottom' ? '-20px' : 'auto',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderRadius: chairPosition === 'top' ? '6px 6px 3px 3px' : '3px 3px 6px 6px',
                  }}
                >
                  {/* Sleek backrest line representation */}
                  <div className={cn(
                    "absolute left-1 right-1 h-0.5 bg-slate-700 dark:bg-slate-800 rounded-full",
                    chairPosition === 'top' ? "top-0.5" : "bottom-0.5"
                  )} />

                  {occupant ? (
                    <div className="relative w-5 h-5 rounded-full flex items-center justify-center overflow-hidden z-10">
                      <Avatar name={occupant.name} imageUrl={occupant.avatar} className="w-full h-full text-[8px]" />
                      <span className={cn(
                        "absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-slate-950",
                        isCheckedIn ? "bg-emerald-500" : "bg-rose-500"
                      )} />
                    </div>
                  ) : (
                    /* Vacant/Status dot representation */
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full border border-slate-950/60 shadow-xs",
                      status === 'available' ? "bg-emerald-500" : (status === 'reserved' ? "bg-amber-400" : (status === 'mine' ? "bg-sky-500" : "bg-slate-400"))
                    )} />
                  )}
                </div>
              </div>
            );
          })}

          {floorRooms.map(room => {
            const activeRoomBooking = bookings.find(b =>
              b.resourceId === room.id &&
              b.date === activeDate &&
              b.resourceType === 'room' &&
              !['cancelled', 'completed', 'no_show'].includes(b.status)
            );
            const host = activeRoomBooking ? users.find(u => u.id === activeRoomBooking.userId) : null;
            const booked = !!activeRoomBooking;

            // Room shape rendering depending on type
            const isBoardroom = room.type === 'boardroom' || room.type === 'training' || room.type === 'meeting';

            return (
              <div
                key={room.id}
                className="room-cell realistic-room absolute flex items-center justify-center"
                style={{
                  left: room.x * cellW + 8,
                  top: room.y * cellH + 8,
                  width: room.width * cellW - 16,
                  height: room.height * cellH - 16,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRoomClick?.(room);
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredRoom({ room, x: rect.left, y: rect.top });
                }}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                {isBoardroom ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    {/* Conference Table */}
                    {room.type === 'meeting' ? (
                      /* Circular table for meeting room */
                      <div className="w-16 h-16 bg-[#d6b693] dark:bg-[#9a7e61] border-2 border-[#b89570] dark:border-[#7a5e42] rounded-full shadow-sm flex items-center justify-center relative z-10">
                        {/* Chairs around round table */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        
                        {host ? (
                          <div className="relative w-10 h-10 rounded-full ring-2 ring-purple-500 bg-white dark:bg-gray-900 flex items-center justify-center shadow-md">
                            <Avatar name={host.name} imageUrl={host.avatar} size="xs" />
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950" />
                          </div>
                        ) : (
                          <div className="text-center select-none pointer-events-none p-1 flex flex-col items-center">
                            <div className="text-[9px] font-black text-amber-950 dark:text-amber-100 leading-none">{room.name}</div>
                            <div className="text-[7.5px] font-bold text-amber-900/75 dark:text-amber-200/65 mt-0.5 leading-none">
                              {getRoomDimensionsLabel(room.width, room.height)}
                            </div>
                            <div className="text-[6.5px] text-amber-900/50 dark:text-amber-250/45 mt-0.5 leading-none">Cap: {room.capacity}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Rectangular table for boardroom or training */
                      <div className="w-[70%] h-[50%] bg-[#d6b693] dark:bg-[#9a7e61] border-2 border-[#b89570] dark:border-[#7a5e42] rounded-md shadow-sm flex items-center justify-center relative z-10">
                        {/* Chairs top and bottom */}
                        <div className="absolute -top-3.5 left-[15%] w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        <div className="absolute -top-3.5 left-[50%] -translate-x-1/2 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        <div className="absolute -top-3.5 right-[15%] w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        <div className="absolute -bottom-3.5 left-[15%] w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        <div className="absolute -bottom-3.5 left-[50%] -translate-x-1/2 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        <div className="absolute -bottom-3.5 right-[15%] w-4 h-4 bg-slate-900 border border-slate-700 rounded-full" />
                        
                        {host ? (
                          <div className="relative w-9 h-9 rounded-full ring-2 ring-purple-500 bg-white dark:bg-gray-900 flex items-center justify-center shadow-md">
                            <Avatar name={host.name} imageUrl={host.avatar} size="xs" />
                            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950" />
                          </div>
                        ) : (
                          <div className="text-center select-none pointer-events-none p-1 flex flex-col items-center">
                            <div className="text-[9px] font-black text-amber-950 dark:text-amber-100 leading-none">{room.name}</div>
                            <div className="text-[7.5px] font-bold text-amber-900/75 dark:text-amber-200/65 mt-0.5 leading-none">
                              {getRoomDimensionsLabel(room.width, room.height)}
                            </div>
                            <div className="text-[6.5px] text-amber-900/50 dark:text-amber-250/45 mt-0.5 leading-none">Cap: {room.capacity}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard room/phone booth representation */
                  <div className="relative w-full h-full flex flex-col items-center justify-center bg-transparent border-0 p-2">
                    {host ? (
                      <div className="relative z-10 flex flex-col items-center justify-center scale-90">
                        <div className="rounded-full p-0.5 ring-2 ring-purple-500 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shrink-0">
                          <Avatar name={host.name} imageUrl={host.avatar} size="xs" />
                        </div>
                        {showLabels && (
                          <div className="mt-1 text-center text-[8px] font-black text-purple-700 dark:text-purple-400 truncate max-w-[80px] leading-tight">
                            {room.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {showLabels && (
                          <div className="relative z-10 mt-1 text-center text-[9px] font-black text-slate-800 dark:text-slate-200 leading-tight">
                            <div>{room.name}</div>
                            <div className="text-[7.5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                              {getRoomDimensionsLabel(room.width, room.height)}
                            </div>
                            {room.type !== 'washroom' && room.type !== 'storage' && room.type !== 'server_room' && (
                              <div className="text-[7px] text-slate-450 dark:text-slate-500 mt-0.5">Cap: {room.capacity}</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                <span className={cn('desk-marker', booked ? markerStyles.occupied.dot : markerStyles.available.dot, booked ? markerStyles.occupied.ring : markerStyles.available.ring)} />
              </div>
            );
          })}
        </div>
      </div>

      {hoveredDesk && <DeskTooltip desk={hoveredDesk.desk} x={hoveredDesk.x} y={hoveredDesk.y} date={activeDate} />}
      {hoveredRoom && <RoomTooltip room={hoveredRoom.room} x={hoveredRoom.x} y={hoveredRoom.y} date={activeDate} />}

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          {floorDesks.filter(d => getDeskDisplayStatus(d) === 'available').length} available
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          {floorDesks.filter(d => getDeskDisplayStatus(d) === 'occupied').length} occupied
        </div>
        <div className="ml-auto text-xs text-gray-400">
          {floor.name} - {formatDate(activeDate)}
        </div>
      </div>
    </div>
  );
}

function ReferencePlan({ labels, width, height }: { labels: boolean; width: number; height: number }) {
  return (
    <>
      <div className="plan-window-line top" />
      <div className="plan-window-line bottom" />
      <PlanRoom label="Kitchen" x={0} y={0} w={3.6} h={3.25} icon={<Utensils className="h-4 w-4 text-slate-600" />} labels={labels}>
        <DiningTable />
      </PlanRoom>
      <PlanRoom label="Printer Area" x={0} y={3.25} w={3.6} h={1.75} icon={<Printer className="h-4 w-4 text-slate-600" />} labels={labels} />
      <PlanRoom label="Men's Restroom" x={0} y={5} w={1.8} h={3.5} labels={labels}>
        <RestroomStalls />
      </PlanRoom>
      <PlanRoom label="Women's Restroom" x={1.8} y={5} w={1.8} h={3.5} labels={labels}>
        <RestroomStalls />
      </PlanRoom>
      <PlanRoom label="Lobby" x={0} y={10.5} w={4.7} h={3.5} labels={labels}>
        <LobbyFurniture />
      </PlanRoom>
      <PlanRoom label="Meeting Room A" x={5.1} y={5.25} w={3.5} h={3.25} labels={labels}>
        <MeetingTable />
      </PlanRoom>
      <PlanRoom label="Focus Zone" x={8.6} y={5.25} w={3.4} h={3.25} labels={labels}>
        <FocusFurniture />
      </PlanRoom>
      <PlanRoom label="Meeting Room B" x={12} y={5.25} w={3.5} h={3.25} labels={labels}>
        <MeetingTable />
      </PlanRoom>
      <PlanRoom label="Collaboration Zone" x={4.7} y={10.45} w={7.1} h={3.55} labels={labels}>
        <CollabTables />
      </PlanRoom>
      <PlanRoom label="Office 1" x={11.8} y={10.45} w={3.1} h={3.55} labels={labels}>
        <OfficeDesk />
      </PlanRoom>
      <PlanRoom label="Office 2" x={14.9} y={10.45} w={3.1} h={3.55} labels={labels}>
        <OfficeDesk />
      </PlanRoom>
      <OpenDesks />
      <Plants width={width} height={height} />
    </>
  );
}

function PlanRoom({ label, x, y, w, h, labels, icon, children }: { label: string; x: number; y: number; w: number; h: number; labels: boolean; icon?: ReactNode; children?: ReactNode }) {
  return (
    <div
      className="plan-room"
      style={{ left: x * CELL, top: y * CELL, width: w * CELL, height: h * CELL }}
    >
      <span className="door-swing" />
      {children}
      {labels && (
        <div className="plan-room-label">
          {icon}
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}

function DiningTable() {
  return (
    <div className="furniture dining">
      <span className="table-long" />
      {Array.from({ length: 8 }, (_, i) => <span key={i} className={`chair c${i + 1}`} />)}
    </div>
  );
}

function MeetingTable() {
  return (
    <div className="furniture meeting-table">
      <span className="table-long" />
      {Array.from({ length: 8 }, (_, i) => <span key={i} className={`chair c${i + 1}`} />)}
    </div>
  );
}

function CollabTables() {
  return (
    <div className="collab-tables">
      {[0, 1, 2].map(i => (
        <div key={i} className="round-table" style={{ left: 18 + i * 70 }}>
          {Array.from({ length: 6 }, (_, c) => <span key={c} className={`round-chair rc${c + 1}`} />)}
        </div>
      ))}
    </div>
  );
}

function FocusFurniture() {
  return (
    <div className="focus-furniture">
      <span />
      <span />
      <span />
    </div>
  );
}

function RestroomStalls() {
  return (
    <div className="stalls">
      <span /><span /><span /><span />
    </div>
  );
}

function LobbyFurniture() {
  return (
    <div className="lobby-furniture">
      <span className="sofa" />
      <span className="sofa small" />
      <span className="desk" />
    </div>
  );
}

function OfficeDesk() {
  return (
    <div className="office-desk">
      <span className="table" />
      <span className="chair one" />
      <span className="chair two" />
    </div>
  );
}

function OpenDesks() {
  return (
    <div className="open-desks">
      {Array.from({ length: 8 }, (_, i) => <span key={i} className={`bench b${i + 1}`} />)}
      <span className="round-breakout one" />
      <span className="round-breakout two" />
    </div>
  );
}

function Plants({ width, height }: { width: number; height: number }) {
  const spots = [
    { left: 10, top: 6 },
    { left: width - 62, top: 18 },
    { left: width - 54, top: height - 170 },
    { left: 20, top: height - 150 },
  ];

  return (
    <>
      {spots.map((spot, index) => (
        <div key={index} className="plant" style={spot}>
          <span /><span /><span />
        </div>
      ))}
    </>
  );
}
