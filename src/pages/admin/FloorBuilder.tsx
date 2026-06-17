import { useState, useRef, useEffect } from 'react';
import { Plus, Save, Trash2, Move, Edit3, Grid, Layers, X, Trash, Hammer, Check, ZoomIn, ZoomOut, DoorOpen, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/Badge';
import type { Desk, Room, Furniture, FurnitureType } from '../../types';
import { cn, getDeskTypeLabel, getAmenityLabel, getZoneColors, getRoomDimensionsLabel } from '../../lib/utils';
import toast from 'react-hot-toast';
import { FloorStructure } from '../../components/floormap/FloorStructure';
import { FurnitureAsset } from '../../components/floormap/FurnitureAsset';
import { Avatar } from '../../components/ui/Avatar';

const CELL = 42; // Slightly larger grid cell size for premium high-density display and touch targets

function getFurnitureDefaultSize(type: FurnitureType): { w: number; h: number } {
  switch (type) {
    case 'couch': return { w: 2, h: 1 };
    case 'dining_table': return { w: 2, h: 1 };
    case 'pool_table': return { w: 2, h: 1 };
    case 'ping_pong': return { w: 2, h: 1 };
    case 'tv': return { w: 2, h: 1 };
    case 'bed': return { w: 2, h: 2 };
    case 'server_rack': return { w: 1, h: 2 };
    default: return { w: 1, h: 1 };
  }
}

function getFurnitureLabel(type: string): string {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function renderFurnitureAsset(type: string, rotation: number) {
  return (
    <div 
      className="w-full h-full flex items-center justify-center transition-transform duration-300"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <FurnitureAsset type={type} className="w-full h-full" />
    </div>
  );
}

function getCircularChairs(capacity: number) {
  const chairs = [];
  const cap = capacity || 4;
  for (let i = 0; i < cap; i++) {
    const angle = (i * 2 * Math.PI) / cap - Math.PI / 2; // start from top
    const dist = 32; // radius of meeting circular table + offset
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    chairs.push(
      <div
        key={`circle-${i}`}
        className="absolute w-3.5 h-3.5 bg-slate-900 border border-slate-700 rounded-full"
        style={{
          left: `calc(50% + ${x}px - 7.5px)`,
          top: `calc(50% + ${y}px - 7.5px)`,
        }}
      />
    );
  }
  return chairs;
}

function getRectangularChairs(capacity: number) {
  const chairs = [];
  const cap = capacity || 6;
  let topCount = 0;
  let bottomCount = 0;
  let leftCount = 0;
  let rightCount = 0;

  if (cap <= 4) {
    topCount = Math.ceil(cap / 2);
    bottomCount = cap - topCount;
  } else if (cap <= 6) {
    topCount = Math.ceil(cap / 2);
    bottomCount = cap - topCount;
  } else {
    leftCount = 1;
    rightCount = (cap - 1) >= 8 ? 1 : 0;
    const remaining = cap - leftCount - rightCount;
    topCount = Math.ceil(remaining / 2);
    bottomCount = remaining - topCount;
  }

  // Top row
  for (let i = 0; i < topCount; i++) {
    const pct = topCount === 1 ? 50 : 15 + (i * 70) / (topCount - 1);
    chairs.push(
      <div
        key={`top-${i}`}
        className="absolute -top-3 w-3.5 h-3.5 bg-slate-900 border border-slate-700 rounded-full"
        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
      />
    );
  }
  // Bottom row
  for (let i = 0; i < bottomCount; i++) {
    const pct = bottomCount === 1 ? 50 : 15 + (i * 70) / (bottomCount - 1);
    chairs.push(
      <div
        key={`bottom-${i}`}
        className="absolute -bottom-3 w-3.5 h-3.5 bg-slate-900 border border-slate-700 rounded-full"
        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
      />
    );
  }
  // Left end
  for (let i = 0; i < leftCount; i++) {
    chairs.push(
      <div
        key={`left-${i}`}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-slate-900 border border-slate-700 rounded-full"
      />
    );
  }
  // Right end
  for (let i = 0; i < rightCount; i++) {
    chairs.push(
      <div
        key={`right-${i}`}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-slate-900 border border-slate-700 rounded-full"
      />
    );
  }
  return chairs;
}

export function FloorBuilder() {
  const { floors, desks, rooms, bookings, users, currentUser, updateDesk, addDesk, removeDesk, updateRoom, addRoom, removeRoom, theme, furniture, addFurniture, updateFurniture, removeFurniture, updateFloor } = useAppStore();
  const activeDate = new Date().toISOString().split('T')[0];
  const [selectedFloorId, setSelectedFloorId] = useState(floors[0]?.id || '');
  const [tool, setTool] = useState<'select' | 'add_desk' | 'add_room' | 'erase'>('select');
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [editDesk, setEditDesk] = useState<Desk | null>(null);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoomDeleteConfirm, setShowRoomDeleteConfirm] = useState(false);
  const [tab, setTab] = useState('map');
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [roomStart, setRoomStart] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  const selectedDeskBooking = selectedDesk
    ? bookings.find(b =>
        b.resourceId === selectedDesk.id &&
        b.date === activeDate &&
        b.resourceType === 'desk' &&
        !['cancelled', 'completed', 'no_show'].includes(b.status)
      )
    : null;
  const selectedDeskOccupant = selectedDeskBooking
    ? users.find(u => u.id === selectedDeskBooking.userId)
    : null;

  // Free-form Drag & Resize States
  const [draggingAsset, setDraggingAsset] = useState<{
    type: 'desk' | 'room' | 'furniture' | 'zone';
    id: string;
    startX: number;
    startY: number;
    pointerStartX: number;
    pointerStartY: number;
  } | null>(null);

  const [resizingAsset, setResizingAsset] = useState<{
    type: 'room' | 'zone';
    id: string;
    handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    pointerStartX: number;
    pointerStartY: number;
  } | null>(null);

  const [snapToGrid, setSnapToGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const floor = floors.find(f => f.id === selectedFloorId);
  const floorDesks = desks.filter(d => d.floorId === selectedFloorId);
  const floorRooms = rooms.filter(r => r.floorId === selectedFloorId);
  const floorFurniture = furniture.filter(f => f.floorId === selectedFloorId && f.isActive);

  const checkAssetOverlap = (
    id: string,
    x: number,
    y: number,
    w: number,
    h: number,
    type: string
  ): boolean => {
    if (type === 'zone') return false;

    // 1. Desk overlap checking
    if (type === 'desk') {
      const deskOverlap = floorDesks.some(d => 
        d.id !== id && 
        x < d.x + 1 && x + w > d.x && 
        y < d.y + 1 && y + h > d.y
      );
      if (deskOverlap) return true;

      const furnitureOverlap = floorFurniture.some(f => 
        f.id !== id && 
        x < f.x + f.width && x + w > f.x && 
        y < f.y + f.height && y + h > f.y
      );
      if (furnitureOverlap) return true;

      // Desks can be fully inside or fully outside rooms, but cannot cross their walls
      const crossesRoom = floorRooms.some(r => {
        const EPS = 0.01;
        const isInside = x >= r.x - EPS && (x + w) <= (r.x + r.width) + EPS && y >= r.y - EPS && (y + h) <= (r.y + r.height) + EPS;
        const isOutside = (x + w) <= r.x + EPS || x >= (r.x + r.width) - EPS || (y + h) <= r.y + EPS || y >= (r.y + r.height) - EPS;
        return !isInside && !isOutside;
      });
      if (crossesRoom) return true;
    }

    // 2. Furniture overlap checking
    if (type === 'furniture') {
      const deskOverlap = floorDesks.some(d => 
        d.id !== id && 
        x < d.x + 1 && x + w > d.x && 
        y < d.y + 1 && y + h > d.y
      );
      if (deskOverlap) return true;

      const furnitureOverlap = floorFurniture.some(f => 
        f.id !== id && 
        x < f.x + f.width && x + w > f.x && 
        y < f.y + f.height && y + h > f.y
      );
      if (furnitureOverlap) return true;

      // Furniture can be fully inside or fully outside rooms, but cannot cross their walls
      const crossesRoom = floorRooms.some(r => {
        const EPS = 0.01;
        const isInside = x >= r.x - EPS && (x + w) <= (r.x + r.width) + EPS && y >= r.y - EPS && (y + h) <= (r.y + r.height) + EPS;
        const isOutside = (x + w) <= r.x + EPS || x >= (r.x + r.width) - EPS || (y + h) <= r.y + EPS || y >= (r.y + r.height) - EPS;
        return !isInside && !isOutside;
      });
      if (crossesRoom) return true;
    }

    // 3. Room overlap checking
    if (type === 'room') {
      // Rooms cannot overlap other rooms
      const roomOverlap = floorRooms.some(r => 
        r.id !== id && 
        x < r.x + r.width && x + w > r.x && 
        y < r.y + r.height && y + h > r.y
      );
      if (roomOverlap) return true;

      // Rooms cannot have desks crossing their walls (must be fully inside or fully outside)
      const crossesDesk = floorDesks.some(d => {
        const EPS = 0.01;
        const isInside = d.x >= x - EPS && (d.x + 1) <= (x + w) + EPS && d.y >= y - EPS && (d.y + 1) <= (y + h) + EPS;
        const isOutside = (d.x + 1) <= x + EPS || d.x >= (x + w) - EPS || (d.y + 1) <= y + EPS || d.y >= (y + h) - EPS;
        return !isInside && !isOutside;
      });
      if (crossesDesk) return true;

      // Rooms cannot have furniture crossing their walls (must be fully inside or fully outside)
      const crossesFurniture = floorFurniture.some(f => {
        const EPS = 0.01;
        const isInside = f.x >= x - EPS && (f.x + f.width) <= (x + w) + EPS && f.y >= y - EPS && (f.y + f.height) <= (y + h) + EPS;
        const isOutside = (f.x + f.width) <= x + EPS || f.x >= (x + w) - EPS || (f.y + f.height) <= y + EPS || f.y >= (y + h) - EPS;
        return !isInside && !isOutside;
      });
      if (crossesFurniture) return true;
    }

    return false;
  };
  const planWidth = 1200;
  const planHeight = 960;
  const cellW = floor ? planWidth / floor.gridWidth : CELL;
  const cellH = floor ? planHeight / floor.gridHeight : CELL;
  const canErase = currentUser.role === 'admin';
  const designerTools = [
    { id: 'select' as const, icon: <Move className="w-4 h-4" />, label: 'Pointer / Move' },
    { id: 'add_desk' as const, icon: <Plus className="w-4 h-4" />, label: 'Draw Desks' },
    { id: 'add_room' as const, icon: <DoorOpen className="w-4 h-4" />, label: roomStart ? 'Finish Room' : 'Draw Room' },
    ...(canErase ? [{ id: 'erase' as const, icon: <Trash2 className="w-4 h-4" />, label: 'Eraser Mode' }] : []),
  ];

  const snapValue = (val: number, step: number = 0.5) => {
    return Math.round(val / step) * step;
  };

  // Pointer dragging handlers
  const handlePointerDownDrag = (
    e: React.PointerEvent,
    type: 'desk' | 'room' | 'furniture' | 'zone',
    id: string,
    itemX: number,
    itemY: number
  ) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    setDraggingAsset({
      type,
      id,
      startX: itemX,
      startY: itemY,
      pointerStartX: e.clientX,
      pointerStartY: e.clientY
    });
  };

  const handlePointerMoveDrag = (e: React.PointerEvent, id: string) => {
    if (!draggingAsset || draggingAsset.id !== id || !floor) return;
    e.stopPropagation();

    const deltaPixelX = e.clientX - draggingAsset.pointerStartX;
    const deltaPixelY = e.clientY - draggingAsset.pointerStartY;

    const deltaX = deltaPixelX / (cellW * zoom);
    const deltaY = deltaPixelY / (cellH * zoom);

    let newX = draggingAsset.startX + deltaX;
    let newY = draggingAsset.startY + deltaY;

    if (snapToGrid) {
      newX = snapValue(newX, 0.5);
      newY = snapValue(newY, 0.5);
    }

    // Boundary limits
    const maxWidth = floor.gridWidth;
    const maxHeight = floor.gridHeight;
    newX = Math.max(0, Math.min(maxWidth - 0.5, newX));
    newY = Math.max(0, Math.min(maxHeight - 0.5, newY));

    if (draggingAsset.type === 'desk') {
      updateDesk(id, { x: newX, y: newY, zoneId: getZoneAt(newX, newY)?.id });
      if (selectedDesk?.id === id) {
        setSelectedDesk(prev => prev ? { ...prev, x: newX, y: newY, zoneId: getZoneAt(newX, newY)?.id } : null);
      }
    } else if (draggingAsset.type === 'room') {
      updateRoom(id, { x: newX, y: newY });
      if (selectedRoom?.id === id) {
        setSelectedRoom(prev => prev ? { ...prev, x: newX, y: newY } : null);
      }
    } else if (draggingAsset.type === 'furniture') {
      updateFurniture(id, { x: newX, y: newY });
      if (selectedFurniture?.id === id) {
        setSelectedFurniture(prev => prev ? { ...prev, x: newX, y: newY } : null);
      }
    } else if (draggingAsset.type === 'zone') {
      const updatedZones = floor.zones.map(z => 
        z.id === id ? { ...z, x: newX, y: newY } : z
      );
      updateFloor(floor.id, { zones: updatedZones });
      if (selectedZone?.id === id) {
        setSelectedZone((prev: any) => prev ? { ...prev, x: newX, y: newY } : null);
      }
    }
  };

  const handlePointerUpDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (draggingAsset) {
      const { id, type, startX, startY } = draggingAsset;
      let currentX = startX;
      let currentY = startY;
      let w = 1;
      let h = 1;

      if (type === 'desk') {
        const item = floorDesks.find(d => d.id === id);
        if (item) {
          currentX = item.x;
          currentY = item.y;
        }
      } else if (type === 'room') {
        const item = floorRooms.find(r => r.id === id);
        if (item) {
          currentX = item.x;
          currentY = item.y;
          w = item.width;
          h = item.height;
        }
      } else if (type === 'furniture') {
        const item = floorFurniture.find(f => f.id === id);
        if (item) {
          currentX = item.x;
          currentY = item.y;
          w = item.width;
          h = item.height;
        }
      }

      if (type !== 'zone' && checkAssetOverlap(id, currentX, currentY, w, h, type)) {
        toast.error('Overlap detected: cannot place asset here.');
        if (type === 'desk') {
          updateDesk(id, { x: startX, y: startY, zoneId: getZoneAt(startX, startY)?.id });
          if (selectedDesk?.id === id) {
            setSelectedDesk(prev => prev ? { ...prev, x: startX, y: startY, zoneId: getZoneAt(startX, startY)?.id } : null);
          }
        } else if (type === 'room') {
          updateRoom(id, { x: startX, y: startY });
          if (selectedRoom?.id === id) {
            setSelectedRoom(prev => prev ? { ...prev, x: startX, y: startY } : null);
          }
        } else if (type === 'furniture') {
          updateFurniture(id, { x: startX, y: startY });
          if (selectedFurniture?.id === id) {
            setSelectedFurniture(prev => prev ? { ...prev, x: startX, y: startY } : null);
          }
        }
      }
    }
    setDraggingAsset(null);
  };

  // Pointer resizing handlers
  const handlePointerDownResize = (
    e: React.PointerEvent,
    type: 'room' | 'zone',
    id: string,
    handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w',
    initialX: number,
    initialY: number,
    initialW: number,
    initialH: number
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    setResizingAsset({
      type,
      id,
      handle,
      startX: initialX,
      startY: initialY,
      startWidth: initialW,
      startHeight: initialH,
      pointerStartX: e.clientX,
      pointerStartY: e.clientY
    });
  };

  const handlePointerMoveResize = (e: React.PointerEvent, id: string) => {
    if (!resizingAsset || resizingAsset.id !== id || !floor) return;
    e.stopPropagation();

    const deltaPixelX = e.clientX - resizingAsset.pointerStartX;
    const deltaPixelY = e.clientY - resizingAsset.pointerStartY;

    const deltaX = deltaPixelX / (cellW * zoom);
    const deltaY = deltaPixelY / (cellH * zoom);

    let newX = resizingAsset.startX;
    let newY = resizingAsset.startY;
    let newW = resizingAsset.startWidth;
    let newH = resizingAsset.startHeight;

    const handle = resizingAsset.handle;

    if (handle.includes('e')) {
      newW = resizingAsset.startWidth + deltaX;
      if (snapToGrid) newW = snapValue(newW, 0.5);
      newW = Math.max(1, newW);
    }
    if (handle.includes('w')) {
      const prospectiveW = resizingAsset.startWidth - deltaX;
      newW = Math.max(1, snapToGrid ? snapValue(prospectiveW, 0.5) : prospectiveW);
      const actualDeltaX = resizingAsset.startWidth - newW;
      newX = resizingAsset.startX + actualDeltaX;
      newX = Math.max(0, newX);
    }
    if (handle.includes('s')) {
      newH = resizingAsset.startHeight + deltaY;
      if (snapToGrid) newH = snapValue(newH, 0.5);
      newH = Math.max(1, newH);
    }
    if (handle.includes('n')) {
      const prospectiveH = resizingAsset.startHeight - deltaY;
      newH = Math.max(1, snapToGrid ? snapValue(prospectiveH, 0.5) : prospectiveH);
      const actualDeltaY = resizingAsset.startHeight - newH;
      newY = resizingAsset.startY + actualDeltaY;
      newY = Math.max(0, newY);
    }

    if (resizingAsset.type === 'room') {
      updateRoom(id, { x: newX, y: newY, width: newW, height: newH });
      if (selectedRoom?.id === id) {
        setSelectedRoom(prev => prev ? { ...prev, x: newX, y: newY, width: newW, height: newH } : null);
      }
    } else if (resizingAsset.type === 'zone') {
      const updatedZones = floor.zones.map(z => 
        z.id === id ? { ...z, x: newX, y: newY, width: newW, height: newH } : z
      );
      updateFloor(floor.id, { zones: updatedZones });
      if (selectedZone?.id === id) {
        setSelectedZone((prev: any) => prev ? { ...prev, x: newX, y: newY, width: newW, height: newH } : null);
      }
    }
  };

  const handlePointerUpResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (resizingAsset) {
      const { id, type, startX, startY, startWidth, startHeight } = resizingAsset;
      let currentX = startX;
      let currentY = startY;
      let currentW = startWidth;
      let currentH = startHeight;

      if (type === 'room') {
        const item = floorRooms.find(r => r.id === id);
        if (item) {
          currentX = item.x;
          currentY = item.y;
          currentW = item.width;
          currentH = item.height;
        }
      }

      if (type !== 'zone' && checkAssetOverlap(id, currentX, currentY, currentW, currentH, type)) {
        toast.error('Overlap detected: cannot resize here.');
        if (type === 'room') {
          updateRoom(id, { x: startX, y: startY, width: startWidth, height: startHeight });
          if (selectedRoom?.id === id) {
            setSelectedRoom(prev => prev ? { ...prev, x: startX, y: startY, width: startWidth, height: startHeight } : null);
          }
        }
      }
    }
    setResizingAsset(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !floor) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    let x = clientX / (cellW * zoom);
    let y = clientY / (cellH * zoom);

    if (snapToGrid) {
      x = snapValue(x, 0.5);
      y = snapValue(y, 0.5);
    } else {
      x = Math.round(x * 100) / 100;
      y = Math.round(y * 100) / 100;
    }

    const maxWidth = floor.gridWidth;
    const maxHeight = floor.gridHeight;
    x = Math.max(0, Math.min(maxWidth - 0.5, x));
    y = Math.max(0, Math.min(maxHeight - 0.5, y));

    const draggedDeskId = e.dataTransfer.getData('draggedDeskId');
    if (draggedDeskId) {
      if (checkAssetOverlap(draggedDeskId, x, y, 1, 1, 'desk')) {
        toast.error('Overlap detected: cannot drop desk here.');
        return;
      }
      updateDesk(draggedDeskId, { x, y, zoneId: getZoneAt(x, y)?.id });
      toast.success('Desk relocated successfully');
      return;
    }

    const draggedFurnitureId = e.dataTransfer.getData('draggedFurnitureId');
    if (draggedFurnitureId) {
      const fItem = floorFurniture.find(item => item.id === draggedFurnitureId);
      const w = fItem ? fItem.width : 1;
      const h = fItem ? fItem.height : 1;
      if (checkAssetOverlap(draggedFurnitureId, x, y, w, h, 'furniture')) {
        toast.error('Overlap detected: cannot drop asset here.');
        return;
      }
      updateFurniture(draggedFurnitureId, { x, y });
      toast.success('Asset relocated');
      return;
    }

    const resourceType = e.dataTransfer.getData('resourceType') as Desk['type'] | null;
    if (resourceType) {
      if (checkAssetOverlap('', x, y, 1, 1, 'desk')) {
        toast.error('Overlap detected: cannot place desk here.');
        return;
      }
      addDesk({
        label: `D-${String(floorDesks.length + 1).padStart(2, '0')}`,
        floorId: selectedFloorId,
        type: resourceType,
        status: 'available',
        x, y,
        width: 1, height: 1,
        zoneId: getZoneAt(x, y)?.id,
        amenities: [],
        isActive: true,
      });
      toast.success(`${getDeskTypeLabel(resourceType)} desk placed`);
      return;
    }

    const furnitureType = e.dataTransfer.getData('furnitureType') as FurnitureType | null;
    if (furnitureType) {
      const size = getFurnitureDefaultSize(furnitureType);
      if (checkAssetOverlap('', x, y, size.w, size.h, 'furniture')) {
        toast.error('Overlap detected: cannot place asset here.');
        return;
      }
      addFurniture({
        floorId: selectedFloorId,
        type: furnitureType,
        x, y,
        width: size.w,
        height: size.h,
        rotation: 0,
        isActive: true,
      });
      toast.success(`${getFurnitureLabel(furnitureType)} placed`);
      return;
    }
  };

  const handleSidebarDeskClick = (type: Desk['type']) => {
    if (!floor) return;
    const x = snapValue(floor.gridWidth / 2, 0.5);
    const y = snapValue(floor.gridHeight / 2, 0.5);
    
    if (checkAssetOverlap('', x, y, 1, 1, 'desk')) {
      toast.error('Center position is occupied: please drag and drop the desk instead.');
      return;
    }

    const newDesk = {
      id: `desk-${Date.now()}`,
      label: `D-${String(floorDesks.length + 1).padStart(2, '0')}`,
      floorId: selectedFloorId,
      type,
      status: 'available' as const,
      x, y,
      width: 1, height: 1,
      zoneId: getZoneAt(x, y)?.id,
      amenities: [],
      isActive: true,
    };
    addDesk(newDesk);
    setSelectedDesk(newDesk);
    setSelectedRoom(null);
    setSelectedFurniture(null);
    setSelectedZone(null);
    toast.success(`${getDeskTypeLabel(type)} desk placed at center`);
  };

  const handleSidebarFurnitureClick = (type: FurnitureType) => {
    if (!floor) return;
    const x = snapValue(floor.gridWidth / 2, 0.5);
    const y = snapValue(floor.gridHeight / 2, 0.5);
    const size = getFurnitureDefaultSize(type);

    if (checkAssetOverlap('', x, y, size.w, size.h, 'furniture')) {
      toast.error('Center position is occupied: please drag and drop the asset instead.');
      return;
    }

    const newFurniture = {
      id: `furn-${Date.now()}`,
      floorId: selectedFloorId,
      type,
      x, y,
      width: size.w,
      height: size.h,
      rotation: 0 as const,
      isActive: true,
    };
    addFurniture(newFurniture);
    setSelectedFurniture(newFurniture);
    setSelectedDesk(null);
    setSelectedRoom(null);
    setSelectedZone(null);
    toast.success(`${getFurnitureLabel(type)} placed at center`);
  };

  // Keyboard nudge, duplicate & delete listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl && 
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const step = e.shiftKey ? 0.5 : 0.1;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDesk) {
          removeDesk(selectedDesk.id);
          setSelectedDesk(null);
          toast.success('Desk removed');
        } else if (selectedRoom) {
          removeRoom(selectedRoom.id);
          setSelectedRoom(null);
          toast.success('Room removed');
        } else if (selectedFurniture) {
          removeFurniture(selectedFurniture.id);
          setSelectedFurniture(null);
          toast.success('Asset removed');
        } else if (selectedZone && floor) {
          const updatedZones = floor.zones.filter(z => z.id !== selectedZone.id);
          updateFloor(floor.id, { zones: updatedZones });
          setSelectedZone(null);
          toast.success('Zone removed');
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedDesk && floor) {
          const newX = Math.min(floor.gridWidth - 1, selectedDesk.x + 1);
          const newY = Math.min(floor.gridHeight - 1, selectedDesk.y + 1);
          if (checkAssetOverlap('', newX, newY, 1, 1, 'desk')) {
            toast.error('Cannot duplicate: target position is occupied.');
            return;
          }
          const newDesk = {
            ...selectedDesk,
            id: `desk-${Date.now()}`,
            label: `${selectedDesk.label} (Copy)`,
            x: newX,
            y: newY,
          };
          addDesk(newDesk);
          toast.success('Desk duplicated');
        } else if (selectedRoom && floor) {
          const newX = Math.min(floor.gridWidth - selectedRoom.width, selectedRoom.x + 1);
          const newY = Math.min(floor.gridHeight - selectedRoom.height, selectedRoom.y + 1);
          if (checkAssetOverlap('', newX, newY, selectedRoom.width, selectedRoom.height, 'room')) {
            toast.error('Cannot duplicate: target position is occupied.');
            return;
          }
          const newRoom = {
            ...selectedRoom,
            id: `room-${Date.now()}`,
            name: `${selectedRoom.name} (Copy)`,
            x: newX,
            y: newY,
          };
          addRoom(newRoom);
          toast.success('Room duplicated');
        } else if (selectedFurniture && floor) {
          const newX = Math.min(floor.gridWidth - selectedFurniture.width, selectedFurniture.x + 1);
          const newY = Math.min(floor.gridHeight - selectedFurniture.height, selectedFurniture.y + 1);
          if (checkAssetOverlap('', newX, newY, selectedFurniture.width, selectedFurniture.height, 'furniture')) {
            toast.error('Cannot duplicate: target position is occupied.');
            return;
          }
          const newFurniture = {
            ...selectedFurniture,
            id: `furn-${Date.now()}`,
            x: newX,
            y: newY,
          };
          addFurniture(newFurniture);
          toast.success('Asset duplicated');
        } else if (selectedZone && floor) {
          const newZone = {
            ...selectedZone,
            id: `zone-${Date.now()}`,
            name: `${selectedZone.name} (Copy)`,
            x: Math.min(floor.gridWidth - selectedZone.width, selectedZone.x + 1),
            y: Math.min(floor.gridHeight - selectedZone.height, selectedZone.y + 1),
          };
          const updatedZones = [...floor.zones, newZone];
          updateFloor(floor.id, { zones: updatedZones });
          toast.success('Zone duplicated');
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && floor) {
        e.preventDefault();
        
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;

        if (selectedDesk) {
          const nextX = Math.max(0, Math.min(floor.gridWidth - 1, selectedDesk.x + dx));
          const nextY = Math.max(0, Math.min(floor.gridHeight - 1, selectedDesk.y + dy));
          if (checkAssetOverlap(selectedDesk.id, nextX, nextY, 1, 1, 'desk')) {
            toast.error('Nudge blocked: position is occupied.');
            return;
          }
          updateDesk(selectedDesk.id, { x: nextX, y: nextY, zoneId: getZoneAt(nextX, nextY)?.id });
          setSelectedDesk({ ...selectedDesk, x: nextX, y: nextY, zoneId: getZoneAt(nextX, nextY)?.id });
        } else if (selectedRoom) {
          const nextX = Math.max(0, Math.min(floor.gridWidth - selectedRoom.width, selectedRoom.x + dx));
          const nextY = Math.max(0, Math.min(floor.gridHeight - selectedRoom.height, selectedRoom.y + dy));
          if (checkAssetOverlap(selectedRoom.id, nextX, nextY, selectedRoom.width, selectedRoom.height, 'room')) {
            toast.error('Nudge blocked: position is occupied.');
            return;
          }
          updateRoom(selectedRoom.id, { x: nextX, y: nextY });
          setSelectedRoom({ ...selectedRoom, x: nextX, y: nextY });
        } else if (selectedFurniture) {
          const nextX = Math.max(0, Math.min(floor.gridWidth - selectedFurniture.width, selectedFurniture.x + dx));
          const nextY = Math.max(0, Math.min(floor.gridHeight - selectedFurniture.height, selectedFurniture.y + dy));
          if (checkAssetOverlap(selectedFurniture.id, nextX, nextY, selectedFurniture.width, selectedFurniture.height, 'furniture')) {
            toast.error('Nudge blocked: position is occupied.');
            return;
          }
          updateFurniture(selectedFurniture.id, { x: nextX, y: nextY });
          setSelectedFurniture({ ...selectedFurniture, x: nextX, y: nextY });
        } else if (selectedZone) {
          const nextX = Math.max(0, Math.min(floor.gridWidth - selectedZone.width, selectedZone.x + dx));
          const nextY = Math.max(0, Math.min(floor.gridHeight - selectedZone.height, selectedZone.y + dy));
          const updatedZones = floor.zones.map(z => 
            z.id === selectedZone.id ? { ...z, x: nextX, y: nextY } : z
          );
          updateFloor(floor.id, { zones: updatedZones });
          setSelectedZone({ ...selectedZone, x: nextX, y: nextY });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDesk, selectedRoom, selectedFurniture, selectedZone, floor]);

  if (!floor) return <div className="text-center py-12 text-gray-500 font-bold">No floors available</div>;

  const getZoneAt = (x: number, y: number) => (
    floor.zones.find(z => x >= z.x && x < z.x + z.width && y >= z.y && y < z.y + z.height)
  );

  const handleCellClick = (x: number, y: number) => {
    if (tool === 'add_desk') {
      if (checkAssetOverlap('', x, y, 1, 1, 'desk')) {
        toast.error('Overlap detected: cannot place desk here.');
        return;
      }
      addDesk({
        label: `D-${String(floorDesks.length + 1).padStart(2, '0')}`,
        floorId: selectedFloorId,
        type: 'hot',
        status: 'available',
        x, y,
        width: 1, height: 1,
        zoneId: getZoneAt(x, y)?.id,
        amenities: [],
        isActive: true,
      });
      toast.success('Desk added to grid');
    } else if (tool === 'add_room') {
      if (!roomStart) {
        setRoomStart({ x, y });
        toast('Room start point set');
        return;
      }

      const left = Math.min(roomStart.x, x);
      const top = Math.min(roomStart.y, y);
      const width = Math.max(1, Math.abs(x - roomStart.x) + 1);
      const height = Math.max(1, Math.abs(y - roomStart.y) + 1);
      const roomName = `Room ${floorRooms.length + 1}`;
      
      if (checkAssetOverlap('', left, top, width, height, 'room')) {
        toast.error('Overlap detected: cannot place room here.');
        setRoomStart(null);
        return;
      }

      addRoom({
        name: roomName,
        floorId: selectedFloorId,
        capacity: Math.max(2, width * height),
        type: width * height > 12 ? 'training' : width >= 4 ? 'boardroom' : 'meeting',
        status: 'available',
        amenities: ['whiteboard'],
        x: left,
        y: top,
        width,
        height,
        isActive: true,
      });
      setRoomStart(null);
      toast.success(`${roomName} drawn`);
    } else if (tool === 'select') {
      const desk = floorDesks.find(d => d.x === x && d.y === y);
      const room = floorRooms.find(r => r.x <= x && r.x + r.width > x && r.y <= y && r.y + r.height > y);
      const furn = floorFurniture.find(f => x >= f.x && x < f.x + f.width && y >= f.y && y < f.y + f.height);
      setSelectedDesk(desk || null);
      setSelectedRoom(desk ? null : room || null);
      setSelectedFurniture(desk || room ? null : furn || null);
    } else if (tool === 'erase' && canErase) {
      const desk = floorDesks.find(d => d.x === x && d.y === y);
      const room = floorRooms.find(r => r.x <= x && r.x + r.width > x && r.y <= y && r.y + r.height > y);
      const furn = floorFurniture.find(f => x >= f.x && x < f.x + f.width && y >= f.y && y < f.y + f.height);
      if (desk) {
        removeDesk(desk.id);
        toast('Desk removed from grid');
      } else if (room) {
        removeRoom(room.id);
        toast('Room removed from plan');
      } else if (furn) {
        removeFurniture(furn.id);
        toast('Asset removed from plan');
      }
    }
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    
    // Existing desk repositioning
    const draggedDeskId = e.dataTransfer.getData('draggedDeskId');
    if (draggedDeskId) {
      const exists = floorDesks.some(d => d.x === x && d.y === y && d.id !== draggedDeskId);
      if (exists) {
        toast.error('This grid coordinate is already occupied');
        return;
      }
      updateDesk(draggedDeskId, { x, y, zoneId: getZoneAt(x, y)?.id });
      toast.success('Desk relocated successfully');
      return;
    }

    // Existing furniture repositioning
    const draggedFurnitureId = e.dataTransfer.getData('draggedFurnitureId');
    if (draggedFurnitureId) {
      updateFurniture(draggedFurnitureId, { x, y });
      toast.success('Asset relocated');
      return;
    }

    // New desk type from template panel
    const resourceType = e.dataTransfer.getData('resourceType') as Desk['type'] | null;
    if (resourceType) {
      const exists = floorDesks.some(d => d.x === x && d.y === y);
      if (exists) {
        toast.error('This grid coordinate is already occupied');
        return;
      }
      addDesk({
        label: `D-${String(floorDesks.length + 1).padStart(2, '0')}`,
        floorId: selectedFloorId,
        type: resourceType,
        status: 'available',
        x, y,
        width: 1, height: 1,
        zoneId: getZoneAt(x, y)?.id,
        amenities: [],
        isActive: true,
      });
      toast.success(`${getDeskTypeLabel(resourceType)} desk placed`);
      return;
    }

    // New furniture type from decor panel
    const furnitureType = e.dataTransfer.getData('furnitureType') as FurnitureType | null;
    if (furnitureType) {
      const size = getFurnitureDefaultSize(furnitureType);
      addFurniture({
        floorId: selectedFloorId,
        type: furnitureType,
        x, y,
        width: size.w,
        height: size.h,
        rotation: 0,
        isActive: true,
      });
      toast.success(`${getFurnitureLabel(furnitureType)} placed`);
      return;
    }
  };

  const handleSaveDesk = () => {
    if (!editDesk) return;
    if (checkAssetOverlap(editDesk.id, editDesk.x, editDesk.y, 1, 1, 'desk')) {
      toast.error('Overlap detected: cannot save desk at this position.');
      return;
    }
    updateDesk(editDesk.id, editDesk);
    if (selectedDesk?.id === editDesk.id) {
      setSelectedDesk(editDesk);
    }
    setEditDesk(null);
    toast.success('Desk settings saved');
  };

  const handleSaveRoom = () => {
    if (!editRoom) return;
    if (checkAssetOverlap(editRoom.id, editRoom.x, editRoom.y, editRoom.width, editRoom.height, 'room')) {
      toast.error('Overlap detected: cannot save room at this position/size.');
      return;
    }
    updateRoom(editRoom.id, editRoom);
    if (selectedRoom?.id === editRoom.id) {
      setSelectedRoom(editRoom);
    }
    setEditRoom(null);
    toast.success('Room settings saved');
  };

  const handleDeleteDesk = () => {
    if (!selectedDesk) return;
    removeDesk(selectedDesk.id);
    setSelectedDesk(null);
    setShowDeleteConfirm(false);
    toast('Desk deleted');
  };

  const handleDeleteRoom = () => {
    if (!selectedRoom) return;
    removeRoom(selectedRoom.id);
    setSelectedRoom(null);
    setShowRoomDeleteConfirm(false);
    toast('Room deleted');
  };

  const toggleDeskStatus = (deskId: string, status: Desk['status']) => {
    updateDesk(deskId, { status });
    if (selectedDesk?.id === deskId) {
      setSelectedDesk(prev => prev ? { ...prev, status } : null);
    }
    toast.success(`Desk marked ${status}`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">
      {/* Header section with layout saving */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-white/60 dark:bg-gray-950/60 backdrop-blur-md p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-indigo-500/5 dark:from-brand-500/10 dark:to-indigo-500/10" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Grid className="w-6 h-6 text-brand-500" />
              Floor Builder
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Design and structure your hybrid workplace floor layout by drag-and-dropping desks and assets.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center bg-gray-100/80 dark:bg-gray-900/80 p-1.5 rounded-xl border border-gray-200/40 dark:border-gray-800/40">
            <div className="flex gap-1">
              {floors.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFloorId(f.id);
                    setSelectedDesk(null);
                    setSelectedRoom(null);
                    setSelectedFurniture(null);
                    setRoomStart(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                    selectedFloorId === f.id 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200/20 dark:border-gray-700/20' 
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />
            <Button 
              size="sm" 
              iconLeft={<Save className="w-4 h-4" />} 
              onClick={() => toast.success('Layout configuration successfully exported to system memory.')}
              className="h-8 text-xs font-semibold px-3"
            >
              Save Layout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={[
        { id: 'map', label: 'Map Designer' },
        { id: 'list', label: 'Asset Spreadsheet', count: floorDesks.length },
        { id: 'zones', label: 'Office Zones', count: floor.zones.length },
        { id: 'settings', label: 'Map Bounds' },
      ]} activeTab={tab} onChange={setTab} />

      {tab === 'map' && (
        <div className="space-y-4 animate-fade-in">
          {/* Draggable templates panel */}
          <div className="bg-white/60 dark:bg-gray-950/60 border border-gray-200/60 dark:border-gray-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-1">
              <Layers className="w-4 h-4 text-brand-500" />
              Interactive Desk Templates
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Pick and drag a workspace type from the palette below, then drop it directly onto the grid mapping canvas.
            </p>
            <div className="flex gap-2 flex-wrap pt-1">
              {(['hot', 'fixed', 'standing', 'quiet', 'collaboration'] as const).map(type => {
                const colors = {
                  hot: 'bg-brand-50 hover:bg-brand-100 border-brand-200 text-brand-700 dark:bg-brand-950/20 dark:border-brand-900/40 dark:text-brand-400',
                  fixed: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400',
                  standing: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400',
                  quiet: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-purple-400',
                  collaboration: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400'
                };
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('resourceType', type);
                    }}
                    onClick={() => handleSidebarDeskClick(type)}
                    className={cn(
                      'px-3 py-2 border text-xs font-bold rounded-xl shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-1.5 transition-all select-none',
                      colors[type]
                    )}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-current opacity-80" />
                    {getDeskTypeLabel(type)}
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-1">
              <Hammer className="w-4 h-4 text-brand-500" />
              Office Decor & Furniture Assets
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Drag furniture and equipment onto the floor plan to make it realistic.
            </p>
            <div className="flex gap-2 flex-wrap pt-1">
              {(['plant', 'couch', 'printer', 'coffee_machine', 'water_cooler', 'tv', 'dining_table', 'pool_table', 'ping_pong', 'lounge_chair', 'bed', 'server_rack'] as const).map(type => {
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('furnitureType', type);
                    }}
                    onClick={() => handleSidebarFurnitureClick(type)}
                    className="px-3 py-2 border text-xs font-bold rounded-xl shadow-sm cursor-grab active:cursor-grabbing bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-750 dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-300 flex items-center gap-1.5 transition-all select-none"
                  >
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                      {renderFurnitureAsset(type, 0)}
                    </div>
                    <span className="ml-1">{getFurnitureLabel(type)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Designer Controls Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-gray-950 p-2 rounded-xl border border-gray-250/70 dark:border-gray-800/80 shadow-sm">
            <div className="flex items-center gap-2">
              {designerTools.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all shadow-sm',
                    tool === t.id 
                      ? 'bg-brand-500 text-white border-brand-500 shadow-brand-500/10' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850'
                  )}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all shadow-sm',
                  snapToGrid 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-400' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
                )}
              >
                <Grid className="w-4 h-4" />
                <span>Snap to Grid</span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-1">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.7, +(z - 0.1).toFixed(2)))}
                  className="p-1.5 rounded-md text-gray-600 hover:bg-white hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="min-w-12 text-center text-xs font-bold text-gray-700 dark:text-gray-200">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(2)))}
                  className="p-1.5 rounded-md text-gray-600 hover:bg-white hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs font-bold text-gray-600 dark:text-gray-300 tracking-tight">
                {hoveredCell ? `Cell (${hoveredCell.x}, ${hoveredCell.y})` : `${floorDesks.length} assets mapped`}
                <span className="text-gray-400 dark:text-gray-500"> / {floor.gridWidth}x{floor.gridHeight}</span>
              </div>
            </div>
          </div>

          {/* Canvas & Properties Panel */}
          <div className="flex gap-4 flex-col lg:flex-row">
            {/* Map Canvas */}
            <div className="flex-1 overflow-auto rounded-2xl border border-gray-300 dark:border-gray-700 bg-slate-100 dark:bg-slate-950 p-6 shadow-inner relative min-h-[420px]">
              <div className="absolute right-4 top-4 z-10 rounded-lg border border-gray-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300">
                {tool === 'select' ? 'Click rooms/desks to edit' : tool === 'add_desk' ? 'Click empty cells to add desks' : tool === 'add_room' ? roomStart ? 'Click opposite corner to finish room' : 'Click first room corner' : canErase ? 'Click desks or rooms to erase' : 'Edit floor layout'}
              </div>
              <div
                className="relative mx-auto"
                style={{ 
                  width: planWidth * zoom, 
                  height: planHeight * zoom,
                }}
              >
                <div
                  ref={canvasRef}
                  className="relative"
                  style={{
                    width: planWidth,
                    height: planHeight,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCanvasDrop}
                >
                <FloorStructure floorId={floor.id} showLabels={true} hideZoneLabels={true} className="reference-office-svg" />

                {/* Render placed furniture decor */}
                {floorFurniture.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "absolute z-[2] cursor-grab active:cursor-grabbing transition-all select-none",
                      selectedFurniture?.id === item.id && "ring-2 ring-brand-500 scale-[1.02]"
                    )}
                    style={{
                      left: item.x * cellW,
                      top: item.y * cellH,
                      width: item.width * cellW,
                      height: item.height * cellH,
                      transform: `rotate(${item.rotation}deg)`,
                      transformOrigin: 'center center',
                    }}
                    onPointerDown={(e) => handlePointerDownDrag(e, 'furniture', item.id, item.x, item.y)}
                    onPointerMove={(e) => handlePointerMoveDrag(e, item.id)}
                    onPointerUp={handlePointerUpDrag}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (tool === 'erase' && canErase) {
                        removeFurniture(item.id);
                        toast('Asset removed from plan');
                        setSelectedFurniture(null);
                        return;
                      }
                      if (tool === 'select') {
                        setSelectedDesk(null);
                        setSelectedRoom(null);
                        setSelectedZone(null);
                        setSelectedFurniture(item);
                      }
                    }}
                  >
                    {renderFurnitureAsset(item.type, item.rotation)}
                  </div>
                ))}

                 {/* Zone boundaries overlay */}
                 {floor.zones.map(z => {
                   const zColors = getZoneColors(z.color);
                   const isDark = theme === 'dark';
                   const isSelected = selectedZone?.id === z.id;
                   const isSelectTool = tool === 'select';
                   return (
                     <div 
                       key={z.id} 
                       className={cn(
                         "absolute rounded-2xl border-2 transition-all duration-300 overflow-visible group/zone",
                         isSelected 
                           ? "border-solid shadow-md z-[8]" 
                           : "border-dashed border-transparent hover:border-indigo-400/40 hover:bg-indigo-400/[0.01] dark:hover:border-indigo-500/30 dark:hover:bg-indigo-950/[0.02]",
                         isSelectTool ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                       )}
                       style={{ 
                         left: z.x * cellW, 
                         top: z.y * cellH, 
                         width: z.width * cellW, 
                         height: z.height * cellH, 
                         borderColor: isSelected ? z.color : undefined,
                         backgroundColor: isSelected ? (isDark ? `${z.color}10` : `${z.color}25`) : undefined,
                         boxShadow: isSelected
                           ? `0 0 14px ${z.color}50, inset 0 0 0 1px ${z.color}30`
                           : undefined
                       }}
                     >
                      <span 
                        className="absolute top-2 left-2 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm border select-none transition-all cursor-grab active:cursor-grabbing pointer-events-auto"
                        style={{ 
                          backgroundColor: isDark ? zColors.bgDark : zColors.bgLight, 
                          color: isDark ? zColors.textDark : zColors.textLight,
                          borderColor: isDark ? zColors.borderDark : zColors.borderLight,
                        }}
                        onPointerDown={(e) => {
                          if (tool !== 'select') return;
                          setSelectedZone(z);
                          setSelectedDesk(null);
                          setSelectedRoom(null);
                          setSelectedFurniture(null);
                          handlePointerDownDrag(e, 'zone', z.id, z.x, z.y);
                        }}
                        onPointerMove={(e) => handlePointerMoveDrag(e, z.id)}
                        onPointerUp={handlePointerUpDrag}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tool === 'select') {
                            setSelectedZone(z);
                            setSelectedDesk(null);
                            setSelectedRoom(null);
                            setSelectedFurniture(null);
                          }
                        }}
                      >
                        {z.name}
                      </span>

                      {isSelected && (
                        <>
                          {/* Resize handles */}
                          {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map(handle => {
                            const positionClasses = {
                              nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
                              n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
                              ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
                              e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
                              se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
                              s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
                              sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
                              w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
                            };
                            return (
                              <div
                                key={handle}
                                className="w-3 h-3 bg-white dark:bg-gray-950 border-2 rounded-full shadow-md z-[20] hover:scale-125 transition-transform pointer-events-auto"
                                style={{ borderColor: z.color }}
                                onPointerDown={(e) => {
                                  handlePointerDownResize(
                                    e,
                                    'zone',
                                    z.id,
                                    handle,
                                    z.x,
                                    z.y,
                                    z.width,
                                    z.height
                                  );
                                }}
                                onPointerMove={(e) => handlePointerMoveResize(e, z.id)}
                                onPointerUp={handlePointerUpResize}
                              />
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}

                {floorRooms.map(room => {
                  const isBoardroom = room.type === 'boardroom' || room.type === 'training' || room.type === 'meeting';
                  const activeRoomBooking = bookings.find(b =>
                    b.resourceId === room.id &&
                    b.date === activeDate &&
                    b.resourceType === 'room' &&
                    !['cancelled', 'completed', 'no_show'].includes(b.status)
                  );
                  const host = activeRoomBooking ? users.find(u => u.id === activeRoomBooking.userId) : null;
                  const booked = !!activeRoomBooking;

                  const isSelected = selectedRoom?.id === room.id;

                  const hasInteractiveDesks = floorDesks.some(d =>
                    d.x >= room.x &&
                    d.x + d.width <= room.x + room.width &&
                    d.y >= room.y &&
                    d.y + d.height <= room.y + room.height
                  );

                  return (
                    <div
                      key={room.id}
                      className={cn(
                        'absolute z-[4] transition-all flex items-center justify-center overflow-visible select-none cursor-pointer',
                        isSelected 
                          ? 'border-2 border-brand-500 bg-brand-500/10 shadow-[0_0_12px_rgba(59,130,246,0.35)] z-[5]' 
                          : 'border border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                      )}
                      style={{
                        left: room.x * cellW,
                        top: room.y * cellH,
                        width: room.width * cellW,
                        height: room.height * cellH,
                      }}
                      onPointerDown={(e) => handlePointerDownDrag(e, 'room', room.id, room.x, room.y)}
                      onPointerMove={(e) => handlePointerMoveDrag(e, room.id)}
                      onPointerUp={handlePointerUpDrag}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tool === 'erase' && canErase) {
                          removeRoom(room.id);
                          toast('Room deleted');
                          setSelectedRoom(null);
                          return;
                        }
                        if (tool === 'select') {
                          setSelectedDesk(null);
                          setSelectedFurniture(null);
                          setSelectedZone(null);
                          setSelectedRoom(room);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditRoom({ ...room });
                      }}
                    >
                      {isBoardroom && !hasInteractiveDesks ? (
                        <div className="relative w-full h-full flex items-center justify-center p-3 select-none pointer-events-none">
                          {room.type === 'meeting' ? (
                            <div className="w-14 h-14 bg-[#d6b693] dark:bg-[#9a7e61] border-2 border-[#b89570] dark:border-[#7a5e42] rounded-full shadow-sm flex items-center justify-center relative z-10">
                              {getCircularChairs(room.capacity)}
                              {host ? (
                                <div className="relative w-8 h-8 rounded-full ring-2 ring-purple-500 bg-white dark:bg-gray-900 flex items-center justify-center shadow-md">
                                  <Avatar name={host.name} imageUrl={host.avatar} size="xs" />
                                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-slate-950" />
                                </div>
                              ) : (
                                <div className="text-center flex flex-col items-center">
                                  <div className="text-[8px] font-black text-amber-950 dark:text-amber-100 leading-none">{room.name}</div>
                                  <div className="text-[6.5px] font-bold text-amber-900/75 dark:text-amber-200/65 mt-0.5 leading-none">
                                    {getRoomDimensionsLabel(room.width, room.height)}
                                  </div>
                                  <div className="text-[6px] text-amber-900/50 dark:text-amber-250/45 mt-0.5 leading-none">({room.capacity})</div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-[70%] h-[50%] bg-[#d6b693] dark:bg-[#9a7e61] border-2 border-[#b89570] dark:border-[#7a5e42] rounded shadow-sm flex items-center justify-center relative z-10">
                              {getRectangularChairs(room.capacity)}
                              {host ? (
                                <div className="relative w-8 h-8 rounded-full ring-2 ring-purple-500 bg-white dark:bg-gray-900 flex items-center justify-center shadow-md">
                                  <Avatar name={host.name} imageUrl={host.avatar} size="xs" />
                                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-slate-950" />
                                </div>
                              ) : (
                                <div className="text-center flex flex-col items-center">
                                  <div className="text-[8px] font-black text-amber-950 dark:text-amber-100 leading-none">{room.name}</div>
                                  <div className="text-[6.5px] font-bold text-amber-900/75 dark:text-amber-200/65 mt-0.5 leading-none">
                                    {getRoomDimensionsLabel(room.width, room.height)}
                                  </div>
                                  <div className="text-[6px] text-amber-900/50 dark:text-amber-250/45 mt-0.5 leading-none">({room.capacity})</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute left-0 top-0 w-full h-full p-2 pointer-events-none select-none">
                          {hasInteractiveDesks ? (
                            <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded border border-slate-200/50 dark:border-slate-800/50 text-left flex items-center gap-2 shadow-sm max-w-[90%]">
                              {host && (
                                <div className="rounded-full p-0.5 ring-2 ring-purple-500 bg-white dark:bg-gray-900 flex items-center justify-center shrink-0">
                                  <Avatar name={host.name} imageUrl={host.avatar} size="xs" />
                                </div>
                              )}
                              <div>
                                <div className="text-[9px] font-black uppercase leading-tight text-slate-800 dark:text-slate-200">{room.name}</div>
                                <div className="text-[7px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                                  {getRoomDimensionsLabel(room.width, room.height)} • Cap: {room.capacity}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="absolute left-1/2 top-1/2 max-w-[90%] -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center">
                              {host ? (
                                <div className="relative z-10 flex flex-col items-center justify-center scale-90">
                                  <div className="rounded-full p-0.5 ring-2 ring-purple-500 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shrink-0">
                                    <Avatar name={host.name} imageUrl={host.avatar} size="xs" />
                                  </div>
                                  <div className="mt-1 text-center text-[8px] font-black text-purple-700 dark:text-purple-400 truncate max-w-[80px] leading-tight">
                                    {room.name}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-[10px] font-black uppercase leading-tight text-slate-800 dark:text-slate-200">{room.name}</div>
                                  <div className="text-[7.5px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 leading-none">
                                    {getRoomDimensionsLabel(room.width, room.height)}
                                  </div>
                                  {room.type !== 'washroom' && room.type !== 'storage' && room.type !== 'server_room' && (
                                    <div className="text-[7px] text-slate-450 dark:text-slate-500 mt-0.5">Cap: {room.capacity}</div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <span className={cn(
                        'absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 shadow-sm',
                        booked ? 'bg-rose-500 ring-rose-200 dark:ring-rose-950/40' : 'bg-emerald-400 ring-emerald-100 dark:ring-emerald-950/30'
                      )} />

                      {isSelected && (
                        <>
                          {/* Resize handles */}
                          {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map(handle => {
                            const positionClasses = {
                              nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
                              n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
                              ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
                              e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
                              se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
                              s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
                              sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
                              w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
                            };
                            return (
                              <div
                                key={handle}
                                className="w-3 h-3 bg-white dark:bg-gray-950 border-2 border-brand-500 rounded-full shadow-md z-[20] hover:scale-125 transition-transform pointer-events-auto"
                                onPointerDown={(e) => {
                                  handlePointerDownResize(
                                    e,
                                    'room',
                                    room.id,
                                    handle,
                                    room.x,
                                    room.y,
                                    room.width,
                                    room.height
                                  );
                                }}
                                onPointerMove={(e) => handlePointerMoveResize(e, room.id)}
                                onPointerUp={handlePointerUpResize}
                              />
                            );
                          })}
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Render placed desks */}
                {floorDesks.map(desk => {
                  const typeMarkerColors = {
                    hot: '#ef4444',
                    fixed: '#3b82f6',
                    standing: '#10b981',
                    quiet: '#8b5cf6',
                    collaboration: '#f59e0b'
                  };
                  const hasDeskBelow = floorDesks.some(d => Math.round(d.x) === Math.round(desk.x) && Math.round(d.y) === Math.round(desk.y) + 1);
                  const hasDeskAbove = floorDesks.some(d => Math.round(d.x) === Math.round(desk.x) && Math.round(d.y) === Math.round(desk.y) - 1);
                  const hasDeskLeft = floorDesks.some(d => Math.round(d.y) === Math.round(desk.y) && Math.round(d.x) === Math.round(desk.x) - 1);
                  const hasDeskRight = floorDesks.some(d => Math.round(d.y) === Math.round(desk.y) && Math.round(d.x) === Math.round(desk.x) + 1);

                  const chairPosition = hasDeskBelow ? 'top' : (hasDeskAbove ? 'bottom' : (Math.round(desk.y) % 2 === 0 ? 'top' : 'bottom'));

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

                  const booking = bookings.find(b =>
                    b.resourceId === desk.id &&
                    b.date === activeDate &&
                    b.resourceType === 'desk' &&
                    !['cancelled', 'completed', 'no_show'].includes(b.status)
                  );
                  const occupant = booking ? users.find(u => u.id === booking.userId) : null;
                  const isCheckedIn = booking?.status === 'checked_in';

                  const isSelected = selectedDesk?.id === desk.id;

                  return (
                    <div
                      key={desk.id}
                      className={cn(
                        'absolute cursor-grab active:cursor-grabbing transition-all flex flex-col items-center justify-center text-[10px] font-extrabold shadow-sm select-none',
                        isSelected 
                          ? 'ring-2 ring-brand-500 border-brand-500 shadow-md shadow-brand-500/10 z-[10]' 
                          : 'bg-[#e8d2ba] dark:bg-[#5a4632] border-[#cfa376] dark:border-[#423120]',
                        borderClasses
                      )}
                      style={{ 
                        left: desk.x * cellW + tableLeftOffset, 
                        top: desk.y * cellH + tableTopOffset, 
                        width: Math.max(20, cellW - tableWidthOffset), 
                        height: Math.max(16, cellH - tableHeightOffset),
                        transform: `rotate(${desk.rotation || 0}deg) ${isSelected ? 'scale(1.05)' : ''}`,
                        transformOrigin: 'center center',
                      }}
                      onPointerDown={(e) => handlePointerDownDrag(e, 'desk', desk.id, desk.x, desk.y)}
                      onPointerMove={(e) => handlePointerMoveDrag(e, desk.id)}
                      onPointerUp={handlePointerUpDrag}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tool === 'select') {
                          setSelectedDesk(desk);
                          setSelectedRoom(null);
                          setSelectedFurniture(null);
                          setSelectedZone(null);
                        }
                        if (tool === 'erase' && canErase) { 
                          removeDesk(desk.id); 
                          toast('Desk deleted'); 
                          setSelectedDesk(null);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditDesk({ ...desk });
                      }}
                    >
                      {/* Unified wood tone table label */}
                      <div className="flex flex-col items-center justify-center select-none pointer-events-none">
                        <span className="text-[9px] font-mono font-bold text-amber-950/90 dark:text-amber-100/90 leading-none">
                          {desk.label.replace('D-', '').padStart(2, '0')}
                        </span>
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
                          <div 
                            className="relative w-5 h-5 rounded-full flex items-center justify-center overflow-hidden z-10"
                            title={`Booked by: ${occupant.name}`}
                          >
                            <Avatar name={occupant.name} imageUrl={occupant.avatar} className="w-full h-full text-[8px]" />
                            <span className={cn(
                              "absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-slate-950",
                              isCheckedIn ? "bg-emerald-500" : "bg-rose-500"
                            )} />
                          </div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {tool === 'add_room' && roomStart && hoveredCell && (
                  <div
                    className="pointer-events-none absolute z-[6] border-[6px] border-brand-500 bg-brand-400/15 shadow-lg"
                    style={{
                      left: Math.min(roomStart.x, hoveredCell.x) * cellW,
                      top: Math.min(roomStart.y, hoveredCell.y) * cellH,
                      width: (Math.abs(hoveredCell.x - roomStart.x) + 1) * cellW,
                      height: (Math.abs(hoveredCell.y - roomStart.y) + 1) * cellH,
                    }}
                  />
                )}

                {/* Grid cells generator overlay for drawing/erasing tools */}
                {tool !== 'select' && Array.from({ length: floor.gridHeight }, (_, y) =>
                  Array.from({ length: floor.gridWidth }, (_, x) => {
                    const desk = floorDesks.find(d => Math.round(d.x) === x && Math.round(d.y) === y);
                    const room = floorRooms.find(r => r.x <= x && r.x + r.width > x && r.y <= y && r.y + r.height > y);
                    const furn = floorFurniture.find(f => x >= f.x && x < f.x + f.width && y >= f.y && y < f.y + f.height);
                    const isOccupied = !!desk || !!room || !!furn;
                    const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={cn(
                          'absolute transition-all border border-dashed border-gray-200/50 dark:border-gray-800/15',
                          tool === 'add_desk' && isHovered && (isOccupied ? 'bg-rose-500/20 dark:bg-rose-950/40 border-rose-400 scale-[0.98]' : 'bg-emerald-500/20 dark:bg-emerald-950/40 rounded-xl border-emerald-400 scale-[0.98]'),
                          tool === 'add_room' && isHovered && (isOccupied ? 'bg-rose-500/20 dark:bg-rose-950/40 border-rose-400' : 'bg-brand-500/20 dark:bg-brand-950/40 border-brand-400'),
                          tool === 'erase' && isHovered && 'bg-rose-500/25 dark:bg-rose-950/40 rounded-xl border-rose-400 scale-[0.98]'
                        )}
                        style={{ 
                          left: x * cellW, 
                          top: y * cellH, 
                          width: cellW, 
                          height: cellH 
                        }}
                        onClick={() => handleCellClick(x, y)}
                        onMouseEnter={() => setHoveredCell({ x, y })}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    );
                  })
                )}
                </div>
              </div>
            </div>

            {/* Properties Panel sidebar */}
            {selectedDesk && (
              <div className="w-full lg:w-72 shrink-0 animate-slide-in">
                <Card className="bg-white dark:bg-gray-950 border-gray-250 dark:border-gray-800 shadow-md">
                  <CardHeader className="border-b border-gray-150/40 dark:border-gray-900 pb-3.5 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-brand-500" />
                        Asset Properties
                      </CardTitle>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">ID: {selectedDesk.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedDesk(null)} 
                      className="text-gray-400 hover:text-gray-650 dark:hover:text-white p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Desk Label</label>
                        <Input 
                          value={selectedDesk.label} 
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDesk(selectedDesk.id, { label: val });
                            setSelectedDesk({ ...selectedDesk, label: val });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider block mb-1">Position X</label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={selectedDesk.x} 
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              if (checkAssetOverlap(selectedDesk.id, val, selectedDesk.y, 1, 1, 'desk')) {
                                toast.error('Position X overlap detected.');
                                return;
                              }
                              updateDesk(selectedDesk.id, { x: val, zoneId: getZoneAt(val, selectedDesk.y)?.id });
                              setSelectedDesk({ ...selectedDesk, x: val, zoneId: getZoneAt(val, selectedDesk.y)?.id });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider block mb-1">Position Y</label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={selectedDesk.y} 
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              if (checkAssetOverlap(selectedDesk.id, selectedDesk.x, val, 1, 1, 'desk')) {
                                toast.error('Position Y overlap detected.');
                                return;
                              }
                              updateDesk(selectedDesk.id, { y: val, zoneId: getZoneAt(selectedDesk.x, val)?.id });
                              setSelectedDesk({ ...selectedDesk, y: val, zoneId: getZoneAt(selectedDesk.x, val)?.id });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Desk Type</label>
                        <Select 
                          value={selectedDesk.type} 
                          onChange={e => {
                            const val = e.target.value as Desk['type'];
                            updateDesk(selectedDesk.id, { type: val });
                            setSelectedDesk({ ...selectedDesk, type: val });
                          }}
                          options={[
                            { value: 'hot', label: 'Hot Desk (Flexible)' },
                            { value: 'fixed', label: 'Fixed Desk (Assigned)' },
                            { value: 'standing', label: 'Standing Desk (Ergonomic)' },
                            { value: 'quiet', label: 'Quiet Desk (Focus)' },
                            { value: 'collaboration', label: 'Collaboration Unit' },
                          ]}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Rotation</label>
                        <Select 
                          value={String(selectedDesk.rotation || 0)} 
                          onChange={e => {
                            const val = Number(e.target.value) as 0 | 90 | 180 | 270;
                            updateDesk(selectedDesk.id, { rotation: val });
                            setSelectedDesk({ ...selectedDesk, rotation: val });
                            toast.success(`Rotated desk to ${val}°`);
                          }}
                          options={[
                            { value: '0', label: '0°' },
                            { value: '90', label: '90°' },
                            { value: '180', label: '180°' },
                            { value: '270', label: '270°' },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={selectedDesk.status} />
                      </div>
                    </div>

                    {selectedDesk.amenities.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Amenities Available</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedDesk.amenities.map(a => (
                            <span 
                              key={a} 
                              className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md border border-gray-200/40 dark:border-gray-750/30"
                            >
                              {getAmenityLabel(a)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDeskOccupant && (
                      <div className="pt-3 border-t border-gray-150/40 dark:border-gray-900 space-y-2">
                        <label className="text-[10px] font-bold text-brand-500 uppercase tracking-wider block">Occupant Details</label>
                        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10">
                          <Avatar name={selectedDeskOccupant.name} imageUrl={selectedDeskOccupant.avatar} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-250 truncate">{selectedDeskOccupant.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{selectedDeskOccupant.department} • {selectedDeskOccupant.role}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-150/40 dark:border-gray-900">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        iconLeft={<Plus className="w-3.5 h-3.5" />} 
                        onClick={() => {
                          if (floor) {
                            const newX = Math.min(floor.gridWidth - 1, selectedDesk.x + 1);
                            const newY = Math.min(floor.gridHeight - 1, selectedDesk.y + 1);
                            if (checkAssetOverlap('', newX, newY, 1, 1, 'desk')) {
                              toast.error('Cannot duplicate: target position is occupied.');
                              return;
                            }
                            const newDesk = {
                              ...selectedDesk,
                              id: `desk-${Date.now()}`,
                              label: `${selectedDesk.label} (Copy)`,
                              x: newX,
                              y: newY,
                            };
                            addDesk(newDesk);
                            setSelectedDesk(newDesk);
                            toast.success('Desk duplicated');
                          }
                        }}
                        className="w-full text-xs font-semibold"
                      >
                        Duplicate Asset
                      </Button>
                      
                      {selectedDesk.status === 'available' ? (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          iconLeft={<Hammer className="w-3.5 h-3.5" />}
                          onClick={() => toggleDeskStatus(selectedDesk.id, 'maintenance')}
                          className="w-full text-xs font-semibold"
                        >
                          Mark Down / Maintenance
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="success" 
                          iconLeft={<Check className="w-3.5 h-3.5" />}
                          onClick={() => toggleDeskStatus(selectedDesk.id, 'available')}
                          className="w-full text-xs font-semibold"
                        >
                          Mark Live / Available
                        </Button>
                      )}
                      
                      {canErase && (
                        <Button 
                          size="sm" 
                          variant="danger" 
                          iconLeft={<Trash className="w-3.5 h-3.5" />} 
                          onClick={() => setShowDeleteConfirm(true)}
                          className="w-full text-xs font-semibold"
                        >
                          Remove Asset
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedRoom && !selectedDesk && (
              <div className="w-full lg:w-72 shrink-0 animate-slide-in">
                <Card className="bg-white dark:bg-gray-950 border-gray-250 dark:border-gray-800 shadow-md">
                  <CardHeader className="border-b border-gray-150/40 dark:border-gray-900 pb-3.5 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <DoorOpen className="w-4 h-4 text-brand-500" />
                        Room Properties
                      </CardTitle>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">ID: {selectedRoom.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedRoom(null)} 
                      className="text-gray-400 hover:text-gray-650 dark:hover:text-white p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block mb-1">Room Name</label>
                        <Input 
                          value={selectedRoom.name} 
                          onChange={(e) => {
                            const val = e.target.value;
                            updateRoom(selectedRoom.id, { name: val });
                            setSelectedRoom({ ...selectedRoom, name: val });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block mb-1">Position X</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedRoom.x} 
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              if (checkAssetOverlap(selectedRoom.id, val, selectedRoom.y, selectedRoom.width, selectedRoom.height, 'room')) {
                                toast.error('Overlap detected: cannot place room here.');
                                return;
                              }
                              updateRoom(selectedRoom.id, { x: val });
                              setSelectedRoom({ ...selectedRoom, x: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block mb-1">Position Y</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedRoom.y} 
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              if (checkAssetOverlap(selectedRoom.id, selectedRoom.x, val, selectedRoom.width, selectedRoom.height, 'room')) {
                                toast.error('Overlap detected: cannot place room here.');
                                return;
                              }
                              updateRoom(selectedRoom.id, { y: val });
                              setSelectedRoom({ ...selectedRoom, y: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block mb-1">Width (Cells)</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedRoom.width} 
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value) || 1);
                              if (checkAssetOverlap(selectedRoom.id, selectedRoom.x, selectedRoom.y, val, selectedRoom.height, 'room')) {
                                toast.error('Overlap detected: cannot resize room here.');
                                return;
                              }
                              updateRoom(selectedRoom.id, { width: val });
                              setSelectedRoom({ ...selectedRoom, width: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block mb-1">Height (Cells)</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedRoom.height} 
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value) || 1);
                              if (checkAssetOverlap(selectedRoom.id, selectedRoom.x, selectedRoom.y, selectedRoom.width, val, 'room')) {
                                toast.error('Overlap detected: cannot resize room here.');
                                return;
                              }
                              updateRoom(selectedRoom.id, { height: val });
                              setSelectedRoom({ ...selectedRoom, height: val });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block mb-1">Capacity</label>
                        <Input 
                          type="number"
                          value={selectedRoom.capacity} 
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value) || 1);
                            updateRoom(selectedRoom.id, { capacity: val });
                            setSelectedRoom({ ...selectedRoom, capacity: val });
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block mb-1">Room Type</label>
                        <Select 
                          value={selectedRoom.type} 
                          onChange={e => {
                            const val = e.target.value as Room['type'];
                            updateRoom(selectedRoom.id, { type: val });
                            setSelectedRoom({ ...selectedRoom, type: val });
                          }}
                          options={[
                            { value: 'meeting', label: 'Meeting Room' },
                            { value: 'phone_booth', label: 'Phone Booth' },
                            { value: 'focus', label: 'Focus Room' },
                            { value: 'training', label: 'Training Room' },
                            { value: 'boardroom', label: 'Boardroom' },
                            { value: 'washroom', label: 'Washroom / Restroom' },
                            { value: 'pantry', label: 'Pantry / Breakroom' },
                            { value: 'storage', label: 'Storage Room' },
                            { value: 'server_room', label: 'Server Room' },
                            { value: 'printer_room', label: 'Printer Room' },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={selectedRoom.status} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-150/40 dark:border-gray-900">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        iconLeft={<Plus className="w-3.5 h-3.5" />} 
                        onClick={() => {
                          if (floor) {
                            const newX = Math.min(floor.gridWidth - selectedRoom.width, selectedRoom.x + 1);
                            const newY = Math.min(floor.gridHeight - selectedRoom.height, selectedRoom.y + 1);
                            if (checkAssetOverlap('', newX, newY, selectedRoom.width, selectedRoom.height, 'room')) {
                              toast.error('Cannot duplicate: target position is occupied.');
                              return;
                            }
                            const newRoom = {
                              ...selectedRoom,
                              id: `room-${Date.now()}`,
                              name: `${selectedRoom.name} (Copy)`,
                              x: newX,
                              y: newY,
                            };
                            addRoom(newRoom);
                            setSelectedRoom(newRoom);
                            toast.success('Room duplicated');
                          }
                        }}
                        className="w-full text-xs font-semibold"
                      >
                        Duplicate Room
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant={selectedRoom.status === 'available' ? 'secondary' : 'success'}
                        iconLeft={selectedRoom.status === 'available' ? <Hammer className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        onClick={() => {
                          const status = selectedRoom.status === 'available' ? 'maintenance' : 'available';
                          updateRoom(selectedRoom.id, { status });
                          setSelectedRoom({ ...selectedRoom, status });
                          toast.success(`Room marked ${status}`);
                        }}
                        className="w-full text-xs font-semibold"
                      >
                        {selectedRoom.status === 'available' ? 'Mark Maintenance' : 'Mark Available'}
                      </Button>
                      {canErase && (
                        <Button 
                          size="sm" 
                          variant="danger" 
                          iconLeft={<Trash className="w-3.5 h-3.5" />} 
                          onClick={() => setShowRoomDeleteConfirm(true)}
                          className="w-full text-xs font-semibold"
                        >
                          Remove Room
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedFurniture && !selectedDesk && !selectedRoom && (
              <div className="w-full lg:w-72 shrink-0 animate-slide-in">
                <Card className="bg-white dark:bg-gray-950 border-gray-250 dark:border-gray-800 shadow-md">
                  <CardHeader className="border-b border-gray-150/40 dark:border-gray-900 pb-3.5 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Hammer className="w-4 h-4 text-brand-500" />
                        Asset Properties
                      </CardTitle>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">ID: {selectedFurniture.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedFurniture(null)} 
                      className="text-gray-400 hover:text-gray-650 dark:hover:text-white p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-150/10">
                        <span className="font-bold text-gray-550 dark:text-gray-400">Asset Type:</span>
                        <span className="font-extrabold text-gray-850 dark:text-gray-150">{getFurnitureLabel(selectedFurniture.type)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider block mb-1">Position X</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedFurniture.x} 
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              if (checkAssetOverlap(selectedFurniture.id, val, selectedFurniture.y, selectedFurniture.width, selectedFurniture.height, 'furniture')) {
                                toast.error('Overlap detected: cannot place asset here.');
                                return;
                              }
                              updateFurniture(selectedFurniture.id, { x: val });
                              setSelectedFurniture({ ...selectedFurniture, x: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider block mb-1">Position Y</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedFurniture.y} 
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              if (checkAssetOverlap(selectedFurniture.id, selectedFurniture.x, val, selectedFurniture.width, selectedFurniture.height, 'furniture')) {
                                toast.error('Overlap detected: cannot place asset here.');
                                return;
                              }
                              updateFurniture(selectedFurniture.id, { y: val });
                              setSelectedFurniture({ ...selectedFurniture, y: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider block mb-1">Width (Cells)</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedFurniture.width} 
                            onChange={(e) => {
                              const val = Math.max(0.5, Number(e.target.value) || 0.5);
                              if (checkAssetOverlap(selectedFurniture.id, selectedFurniture.x, selectedFurniture.y, val, selectedFurniture.height, 'furniture')) {
                                toast.error('Overlap detected: cannot resize asset here.');
                                return;
                              }
                              updateFurniture(selectedFurniture.id, { width: val });
                              setSelectedFurniture({ ...selectedFurniture, width: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider block mb-1">Height (Cells)</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedFurniture.height} 
                            onChange={(e) => {
                              const val = Math.max(0.5, Number(e.target.value) || 0.5);
                              if (checkAssetOverlap(selectedFurniture.id, selectedFurniture.x, selectedFurniture.y, selectedFurniture.width, val, 'furniture')) {
                                toast.error('Overlap detected: cannot resize asset here.');
                                return;
                              }
                              updateFurniture(selectedFurniture.id, { height: val });
                              setSelectedFurniture({ ...selectedFurniture, height: val });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider block mb-1">Rotation (Deg)</label>
                        <Input 
                          type="number"
                          value={selectedFurniture.rotation} 
                          onChange={(e) => {
                            const val = (Number(e.target.value) || 0) as 0 | 90 | 180 | 270;
                            updateFurniture(selectedFurniture.id, { rotation: val });
                            setSelectedFurniture({ ...selectedFurniture, rotation: val });
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-150/40 dark:border-gray-900">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        iconLeft={<Plus className="w-3.5 h-3.5" />} 
                        onClick={() => {
                          if (floor) {
                            const newX = Math.min(floor.gridWidth - selectedFurniture.width, selectedFurniture.x + 1);
                            const newY = Math.min(floor.gridHeight - selectedFurniture.height, selectedFurniture.y + 1);
                            if (checkAssetOverlap('', newX, newY, selectedFurniture.width, selectedFurniture.height, 'furniture')) {
                              toast.error('Cannot duplicate: target position is occupied.');
                              return;
                            }
                            const newFurniture = {
                              ...selectedFurniture,
                              id: `furn-${Date.now()}`,
                              x: newX,
                              y: newY,
                            };
                            addFurniture(newFurniture);
                            setSelectedFurniture(newFurniture);
                            toast.success('Asset duplicated');
                          }
                        }}
                        className="w-full text-xs font-semibold"
                      >
                        Duplicate Asset
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        iconLeft={<RotateCcw className="w-3.5 h-3.5" />} 
                        onClick={() => {
                          const nextRotation = ((selectedFurniture.rotation + 90) % 360) as 0 | 90 | 180 | 270;
                          if (checkAssetOverlap(selectedFurniture.id, selectedFurniture.x, selectedFurniture.y, selectedFurniture.width, selectedFurniture.height, 'furniture')) {
                            toast.error('Overlap detected: cannot rotate asset here.');
                            return;
                          }
                          updateFurniture(selectedFurniture.id, { rotation: nextRotation });
                          setSelectedFurniture({ ...selectedFurniture, rotation: nextRotation });
                          toast.success(`Rotated asset to ${nextRotation}°`);
                        }}
                        className="w-full text-xs font-semibold"
                      >
                        Rotate 90°
                      </Button>
                      
                      {canErase && (
                        <Button 
                          size="sm" 
                          variant="danger" 
                          iconLeft={<Trash className="w-3.5 h-3.5" />} 
                          onClick={() => {
                            removeFurniture(selectedFurniture.id);
                            setSelectedFurniture(null);
                            toast.success('Asset removed from floor layout');
                          }}
                          className="w-full text-xs font-semibold"
                        >
                          Remove Asset
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedZone && !selectedDesk && !selectedRoom && !selectedFurniture && (
              <div className="w-full lg:w-72 shrink-0 animate-slide-in">
                <Card className="bg-white dark:bg-gray-950 border-gray-250 dark:border-gray-800 shadow-md">
                  <CardHeader className="border-b border-gray-150/40 dark:border-gray-900 pb-3.5 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-brand-500" />
                        Zone Properties
                      </CardTitle>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">ID: {selectedZone.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedZone(null)} 
                      className="text-gray-400 hover:text-gray-650 dark:hover:text-white p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Zone Name</label>
                        <Input 
                          value={selectedZone.name} 
                          onChange={(e) => {
                            const val = e.target.value;
                            const updatedZones = floor.zones.map(z => 
                              z.id === selectedZone.id ? { ...z, name: val } : z
                            );
                            updateFloor(floor.id, { zones: updatedZones });
                            setSelectedZone({ ...selectedZone, name: val });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Position X</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedZone.x} 
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updatedZones = floor.zones.map(z => 
                                z.id === selectedZone.id ? { ...z, x: val } : z
                              );
                              updateFloor(floor.id, { zones: updatedZones });
                              setSelectedZone({ ...selectedZone, x: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Position Y</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedZone.y} 
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updatedZones = floor.zones.map(z => 
                                z.id === selectedZone.id ? { ...z, y: val } : z
                              );
                              updateFloor(floor.id, { zones: updatedZones });
                              setSelectedZone({ ...selectedZone, y: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Width (Cells)</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedZone.width} 
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value) || 1);
                              const updatedZones = floor.zones.map(z => 
                                z.id === selectedZone.id ? { ...z, width: val } : z
                              );
                              updateFloor(floor.id, { zones: updatedZones });
                              setSelectedZone({ ...selectedZone, width: val });
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Height (Cells)</label>
                          <Input 
                            type="number"
                            step="0.5"
                            value={selectedZone.height} 
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value) || 1);
                              const updatedZones = floor.zones.map(z => 
                                z.id === selectedZone.id ? { ...z, height: val } : z
                              );
                              updateFloor(floor.id, { zones: updatedZones });
                              setSelectedZone({ ...selectedZone, height: val });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Zone Color</label>
                        <Input 
                          type="color"
                          value={selectedZone.color} 
                          onChange={(e) => {
                            const val = e.target.value;
                            const updatedZones = floor.zones.map(z => 
                              z.id === selectedZone.id ? { ...z, color: val } : z
                            );
                            updateFloor(floor.id, { zones: updatedZones });
                            setSelectedZone({ ...selectedZone, color: val });
                          }}
                          className="h-9 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-150/40 dark:border-gray-900">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        iconLeft={<Plus className="w-3.5 h-3.5" />} 
                        onClick={() => {
                          const newZone = {
                            ...selectedZone,
                            id: `zone-${Date.now()}`,
                            name: `${selectedZone.name} (Copy)`,
                            x: Math.min(floor.gridWidth - selectedZone.width, selectedZone.x + 1),
                            y: Math.min(floor.gridHeight - selectedZone.height, selectedZone.y + 1),
                          };
                          const updatedZones = [...floor.zones, newZone];
                          updateFloor(floor.id, { zones: updatedZones });
                          setSelectedZone(newZone);
                          toast.success('Zone duplicated');
                        }}
                        className="w-full text-xs font-semibold"
                      >
                        Duplicate Zone
                      </Button>
                      
                      {canErase && (
                        <Button 
                          size="sm" 
                          variant="danger" 
                          iconLeft={<Trash className="w-3.5 h-3.5" />} 
                          onClick={() => {
                            const updatedZones = floor.zones.filter(z => z.id !== selectedZone.id);
                            updateFloor(floor.id, { zones: updatedZones });
                            setSelectedZone(null);
                            toast.success('Zone removed');
                          }}
                          className="w-full text-xs font-semibold"
                        >
                          Remove Zone
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Spreadsheet configuration containing {floorDesks.length} desks</p>
            <Button 
              size="sm" 
              variant="outline" 
              iconLeft={<Plus className="w-4 h-4" />} 
              onClick={() => {
                addDesk({
                  label: `D-${String(floorDesks.length + 1).padStart(2, '0')}`,
                  floorId: selectedFloorId, 
                  type: 'hot', 
                  status: 'available',
                  x: 0, 
                  y: 0, 
                  width: 1, 
                  height: 1, 
                  amenities: [], 
                  isActive: true,
                });
                toast.success('Desk added');
              }}
              className="text-xs font-semibold"
            >
              Add Row Desk
            </Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-white dark:bg-gray-950">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 border-b border-gray-200/60 dark:border-gray-800">
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Label</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Zone Mapping</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Coordinates</th>
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/50 dark:divide-gray-900/40">
                {floorDesks.map(desk => (
                  <tr key={desk.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                    <td className="p-4 font-bold text-gray-950 dark:text-gray-150">{desk.label}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 font-semibold">{getDeskTypeLabel(desk.type)}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 font-semibold">
                      {floor.zones.find(z => z.id === desk.zoneId)?.name || <span className="text-gray-400 dark:text-gray-600">—</span>}
                    </td>
                    <td className="p-4"><StatusBadge status={desk.status} /></td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 font-mono font-bold">({desk.x},{desk.y})</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button 
                          size="xs" 
                          variant="ghost" 
                          onClick={() => setEditDesk({ ...desk })}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 h-7 w-7 text-gray-500"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        {canErase && (
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            onClick={() => { 
                              removeDesk(desk.id); 
                              toast('Desk removed'); 
                            }} 
                            className="hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-600 p-1 h-7 w-7"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'zones' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {floor.zones.map(zone => (
              <Card key={zone.id} className="bg-white dark:bg-gray-950 border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-lg border-2 border-white dark:border-gray-900 shadow-sm shrink-0" style={{ backgroundColor: zone.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{zone.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">({zone.x},{zone.y}) • {zone.width}x{zone.height} cells</p>
                  </div>
                  <span className="text-xs font-bold bg-gray-100 dark:bg-gray-900 rounded-full px-2.5 py-0.5 shrink-0 text-gray-650 dark:text-gray-400">
                    {floorDesks.filter(d => d.zoneId === zone.id).length} units
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <Card className="bg-white dark:bg-gray-950 border-gray-200/60 dark:border-gray-800 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-900 pb-3.5">
            <CardTitle className="text-sm font-bold text-gray-850 dark:text-gray-200">Floor Layout Bounds</CardTitle>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Configure spatial coordinate matrix sizing parameters</p>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Floor Name" defaultValue={floor.name} />
              <Input label="Level" type="number" defaultValue={String(floor.level)} />
              <Input label="Grid Width Sizing (Cells)" type="number" defaultValue={String(floor.gridWidth)} />
              <Input label="Grid Height Sizing (Cells)" type="number" defaultValue={String(floor.gridHeight)} />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => toast.success('Floor grid properties updated')} className="font-semibold text-xs px-4">
                Update Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit desk properties modal */}
      <Modal 
        isOpen={!!editDesk} 
        onClose={() => setEditDesk(null)} 
        title="Edit Desk Settings" 
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditDesk(null)} className="text-xs font-semibold">Cancel</Button>
            <Button onClick={handleSaveDesk} className="text-xs font-semibold">Save Changes</Button>
          </div>
        }
      >
        {editDesk && (
          <div className="space-y-4 pt-2">
            <Input 
              label="Asset Label" 
              value={editDesk.label} 
              onChange={e => setEditDesk({ ...editDesk, label: e.target.value })} 
            />
            <Select 
              label="Allocation Class" 
              value={editDesk.type} 
              onChange={e => setEditDesk({ ...editDesk, type: e.target.value as Desk['type'] })}
              options={[
                { value: 'hot', label: 'Hot Desk (Flexible Booking)' },
                { value: 'fixed', label: 'Fixed Desk (Assigned)' },
                { value: 'standing', label: 'Standing Desk (Ergonomic)' },
                { value: 'quiet', label: 'Quiet Desk (Focus Space)' },
                { value: 'collaboration', label: 'Collaboration Unit (Shared)' },
              ]}
            />
            <Select 
              label="Operational Status" 
              value={editDesk.status} 
              onChange={e => setEditDesk({ ...editDesk, status: e.target.value as Desk['status'] })}
              options={[
                { value: 'available', label: 'Live / Available' },
                { value: 'maintenance', label: 'Down / Under Maintenance' },
                { value: 'blocked', label: 'Blocked / Offline' },
              ]}
            />
            <Select 
              label="Rotation" 
              value={String(editDesk.rotation || 0)} 
              onChange={e => setEditDesk({ ...editDesk, rotation: Number(e.target.value) as 0 | 90 | 180 | 270 })}
              options={[
                { value: '0', label: '0°' },
                { value: '90', label: '90°' },
                { value: '180', label: '180°' },
                { value: '270', label: '270°' },
              ]}
            />
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={!!editRoom} 
        onClose={() => setEditRoom(null)} 
        title="Edit Room Settings" 
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditRoom(null)} className="text-xs font-semibold">Cancel</Button>
            <Button onClick={handleSaveRoom} className="text-xs font-semibold">Save Room</Button>
          </div>
        }
      >
        {editRoom && (
          <div className="space-y-4 pt-2">
            <Input 
              label="Room Name" 
              value={editRoom.name} 
              onChange={e => setEditRoom({ ...editRoom, name: e.target.value })} 
            />
            <Select 
              label="Room Type" 
              value={editRoom.type} 
              onChange={e => setEditRoom({ ...editRoom, type: e.target.value as Room['type'] })}
              options={[
                { value: 'meeting', label: 'Meeting Room' },
                { value: 'phone_booth', label: 'Phone Booth' },
                { value: 'focus', label: 'Focus Room' },
                { value: 'training', label: 'Training Room' },
                { value: 'boardroom', label: 'Boardroom' },
                { value: 'washroom', label: 'Washroom / Restroom' },
                { value: 'pantry', label: 'Pantry / Breakroom' },
                { value: 'storage', label: 'Storage Room' },
                { value: 'server_room', label: 'Server Room' },
                { value: 'printer_room', label: 'Printer Room' },
              ]}
            />
            <Input 
              label="Capacity" 
              type="number" 
              value={String(editRoom.capacity)} 
              onChange={e => setEditRoom({ ...editRoom, capacity: Number(e.target.value) || 1 })} 
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="X" type="number" value={String(editRoom.x)} onChange={e => setEditRoom({ ...editRoom, x: Number(e.target.value) || 0 })} />
              <Input label="Y" type="number" value={String(editRoom.y)} onChange={e => setEditRoom({ ...editRoom, y: Number(e.target.value) || 0 })} />
              <Input label="Width" type="number" value={String(editRoom.width)} onChange={e => setEditRoom({ ...editRoom, width: Math.max(1, Number(e.target.value) || 1) })} />
              <Input label="Height" type="number" value={String(editRoom.height)} onChange={e => setEditRoom({ ...editRoom, height: Math.max(1, Number(e.target.value) || 1) })} />
            </div>
            <Select 
              label="Operational Status" 
              value={editRoom.status} 
              onChange={e => setEditRoom({ ...editRoom, status: e.target.value as Room['status'] })}
              options={[
                { value: 'available', label: 'Live / Available' },
                { value: 'reserved', label: 'Reserved' },
                { value: 'maintenance', label: 'Down / Under Maintenance' },
                { value: 'blocked', label: 'Blocked / Offline' },
              ]}
            />
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteDesk}
        title="Confirm Asset Deletion"
        message={`Are you sure you want to permanently delete desk asset ${selectedDesk?.label} from this floor grid plan? This action cannot be undone.`}
        confirmLabel="Remove Desk"
        variant="danger"
      />
      <ConfirmModal
        isOpen={showRoomDeleteConfirm}
        onClose={() => setShowRoomDeleteConfirm(false)}
        onConfirm={handleDeleteRoom}
        title="Confirm Room Deletion"
        message={`Are you sure you want to permanently delete room ${selectedRoom?.name} from this floor plan?`}
        confirmLabel="Remove Room"
        variant="danger"
      />
    </div>
  );
}
