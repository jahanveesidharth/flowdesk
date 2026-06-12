import { useState } from 'react';
import { Plus, Save, Trash2, Move, Edit3, Grid, Layers, X, Trash, Hammer, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/Badge';
import type { Desk } from '../../types';
import { cn, getDeskTypeLabel, getAmenityLabel, getZoneColors } from '../../lib/utils';
import toast from 'react-hot-toast';

const CELL = 42; // Slightly larger grid cell size for premium high-density display and touch targets

export function FloorBuilder() {
  const { floors, desks, rooms, currentUser, updateDesk, addDesk, removeDesk, theme } = useAppStore();
  const [selectedFloorId, setSelectedFloorId] = useState(floors[0]?.id || '');
  const [tool, setTool] = useState<'select' | 'add_desk' | 'erase'>('select');
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [editDesk, setEditDesk] = useState<Desk | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tab, setTab] = useState('map');
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  const floor = floors.find(f => f.id === selectedFloorId);
  const floorDesks = desks.filter(d => d.floorId === selectedFloorId);
  const floorRooms = rooms.filter(r => r.floorId === selectedFloorId);
  const canErase = currentUser.role === 'admin';
  const designerTools = [
    { id: 'select' as const, icon: <Move className="w-4 h-4" />, label: 'Pointer / Move' },
    { id: 'add_desk' as const, icon: <Plus className="w-4 h-4" />, label: 'Draw Desks' },
    ...(canErase ? [{ id: 'erase' as const, icon: <Trash2 className="w-4 h-4" />, label: 'Eraser Mode' }] : []),
  ];

  if (!floor) return <div className="text-center py-12 text-gray-500 font-bold">No floors available</div>;

  const getZoneAt = (x: number, y: number) => (
    floor.zones.find(z => x >= z.x && x < z.x + z.width && y >= z.y && y < z.y + z.height)
  );

  const handleCellClick = (x: number, y: number) => {
    if (tool === 'add_desk') {
      const exists = floorDesks.some(d => d.x === x && d.y === y);
      if (!exists) {
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
      }
    } else if (tool === 'select') {
      const desk = floorDesks.find(d => d.x === x && d.y === y);
      setSelectedDesk(desk || null);
    } else if (tool === 'erase' && canErase) {
      const desk = floorDesks.find(d => d.x === x && d.y === y);
      if (desk) {
        removeDesk(desk.id);
        toast('Desk removed from grid');
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
    }
  };

  const handleSaveDesk = () => {
    if (!editDesk) return;
    updateDesk(editDesk.id, editDesk);
    // If the currently selected desk is updated, reflect changes in properties panel
    if (selectedDesk?.id === editDesk.id) {
      setSelectedDesk(editDesk);
    }
    setEditDesk(null);
    toast.success('Desk settings saved');
  };

  const handleDeleteDesk = () => {
    if (!selectedDesk) return;
    removeDesk(selectedDesk.id);
    setSelectedDesk(null);
    setShowDeleteConfirm(false);
    toast('Desk deleted');
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
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? 'rgba(148,163,184,0.28)' : 'rgba(71,85,105,0.2)'} 1.5px, transparent 1.5px)`, 
                  backgroundSize: `${CELL}px ${CELL}px`,
                  backgroundPosition: '24px 24px',
                }}
              />
              <div className="absolute right-4 top-4 z-10 rounded-lg border border-gray-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300">
                {tool === 'select' ? 'Click or drag desks' : tool === 'add_desk' ? 'Click empty cells to add' : canErase ? 'Click desks to erase' : 'Edit floor layout'}
              </div>
              <div
                className="relative mx-auto"
                style={{ 
                  width: floor.gridWidth * CELL * zoom, 
                  height: floor.gridHeight * CELL * zoom,
                }}
              >
                <div
                  className="relative"
                  style={{
                    width: floor.gridWidth * CELL,
                    height: floor.gridHeight * CELL,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                >
                {/* Zone boundaries overlay */}
                {floor.zones.map(z => {
                  const zColors = getZoneColors(z.color);
                  const isDark = theme === 'dark';
                  return (
                    <div 
                      key={z.id} 
                      className="absolute rounded-2xl border-2 border-dashed transition-all duration-300"
                      style={{ 
                        left: z.x * CELL, 
                        top: z.y * CELL, 
                        width: z.width * CELL, 
                        height: z.height * CELL, 
                        borderColor: z.color,
                        backgroundColor: isDark ? `${z.color}10` : `${z.color}25`,
                        boxShadow: isDark 
                          ? `inset 0 0 0 1px ${z.color}15, inset 0 0 24px ${z.color}05`
                          : `inset 0 0 0 1px ${z.color}25, inset 0 0 24px ${z.color}08`
                      }}
                    >
                      <span 
                        className="absolute top-2 left-2 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm border select-none transition-all"
                        style={{ 
                          backgroundColor: isDark ? zColors.bgDark : zColors.bgLight, 
                          color: isDark ? zColors.textDark : zColors.textLight,
                          borderColor: isDark ? zColors.borderDark : zColors.borderLight,
                        }}
                      >
                        {z.name}
                      </span>
                    </div>
                  );
                })}

                {/* Grid cells generator */}
                {Array.from({ length: floor.gridHeight }, (_, y) =>
                  Array.from({ length: floor.gridWidth }, (_, x) => {
                    const desk = floorDesks.find(d => d.x === x && d.y === y);
                    const room = floorRooms.find(r => r.x <= x && r.x + r.width > x && r.y <= y && r.y + r.height > y);
                    const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

                    if (desk) {
                      const typeColors = {
                        hot: 'border-brand-500 bg-brand-50/90 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400',
                        fixed: 'border-blue-400 bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
                        standing: 'border-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
                        quiet: 'border-purple-400 bg-purple-50/90 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
                        collaboration: 'border-amber-400 bg-amber-50/90 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      };
                      return (
                        <div
                          key={`${x}-${y}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('draggedDeskId', desk.id);
                          }}
                          className={cn(
                            'absolute rounded-xl cursor-grab active:cursor-grabbing transition-all flex flex-col items-center justify-center text-[10px] font-extrabold border-2 shadow-sm',
                            selectedDesk?.id === desk.id 
                              ? 'ring-2 ring-brand-500 scale-105 border-brand-500 shadow-md shadow-brand-500/10' 
                              : typeColors[desk.type] || 'border-gray-300 dark:border-gray-800'
                          )}
                          style={{ 
                            left: x * CELL + 3, 
                            top: y * CELL + 3, 
                            width: CELL - 6, 
                            height: CELL - 6 
                          }}
                          onClick={() => {
                            if (tool === 'select') setSelectedDesk(desk);
                            if (tool === 'erase' && canErase) { 
                              removeDesk(desk.id); 
                              toast('Desk deleted'); 
                            }
                          }}
                          onDoubleClick={() => setEditDesk({ ...desk })}
                        >
                          <span className="opacity-95">{desk.label.split('-').pop()}</span>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full mt-1 shrink-0",
                            desk.status === 'available' ? 'bg-emerald-500 animate-pulse' :
                            desk.status === 'maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                          )} />
                        </div>
                      );
                    }

                    if (room && room.x === x && room.y === y) {
                      return (
                        <div
                          key={`${x}-${y}`}
                          className="absolute rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border-2 border-blue-400/80 text-blue-700 dark:text-blue-400 text-xs font-black flex items-center justify-center p-2 text-center shadow-xs"
                          style={{ 
                            left: x * CELL + 3, 
                            top: y * CELL + 3, 
                            width: room.width * CELL - 6, 
                            height: room.height * CELL - 6 
                          }}
                        >
                          <span className="truncate">{room.name}</span>
                        </div>
                      );
                    }

                    if (room) return null;

                    return (
                      <div
                        key={`${x}-${y}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, x, y)}
                        className={cn(
                          'absolute transition-all border border-dashed border-gray-200/50 dark:border-gray-800/15',
                          tool === 'add_desk' && isHovered && 'bg-emerald-500/20 dark:bg-emerald-950/40 rounded-xl border-emerald-400 scale-[0.98]',
                          tool === 'erase' && isHovered && 'bg-rose-500/25 dark:bg-rose-950/40 rounded-xl border-rose-400 scale-[0.98]',
                          tool === 'select' && isHovered && 'bg-gray-200/40 dark:bg-gray-800/30'
                        )}
                        style={{ 
                          left: x * CELL, 
                          top: y * CELL, 
                          width: CELL, 
                          height: CELL 
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
                <Card className="bg-white dark:bg-gray-950 border-gray-250 dark:border-gray-850 shadow-md">
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
                    <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-150/10">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Desk Name:</span>
                      <span className="font-extrabold text-gray-850 dark:text-gray-150">{selectedDesk.label}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-150/10">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Coordinates:</span>
                      <span className="font-extrabold text-gray-850 dark:text-gray-150 font-mono">({selectedDesk.x}, {selectedDesk.y})</span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-150/10">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Desk Type:</span>
                      <span className="font-extrabold text-gray-850 dark:text-gray-150">{getDeskTypeLabel(selectedDesk.type)}</span>
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

                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-150/40 dark:border-gray-900">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        iconLeft={<Edit3 className="w-3.5 h-3.5" />} 
                        onClick={() => setEditDesk({ ...selectedDesk })}
                        className="w-full text-xs font-semibold"
                      >
                        Modify Settings
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
    </div>
  );
}
