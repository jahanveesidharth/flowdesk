import { useState } from 'react';
import { Plus, Save, Trash2, Move, Edit3, Grid, Layers } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/Badge';
import type { Desk, Floor, Zone } from '../../types';
import { cn, getDeskTypeLabel, getAmenityLabel } from '../../lib/utils';
import toast from 'react-hot-toast';

const CELL = 36;

export function FloorBuilder() {
  const { floors, desks, rooms, updateDesk, addDesk, removeDesk, updateFloor } = useAppStore();
  const [selectedFloorId, setSelectedFloorId] = useState(floors[0]?.id || '');
  const [tool, setTool] = useState<'select' | 'add_desk' | 'add_room' | 'erase'>('select');
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [editDesk, setEditDesk] = useState<Desk | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tab, setTab] = useState('map');
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const floor = floors.find(f => f.id === selectedFloorId);
  const floorDesks = desks.filter(d => d.floorId === selectedFloorId);
  const floorRooms = rooms.filter(r => r.floorId === selectedFloorId);

  if (!floor) return <div>No floors available</div>;

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
          amenities: [],
          isActive: true,
        });
        toast.success('Desk added');
      }
    } else if (tool === 'select') {
      const desk = floorDesks.find(d => d.x === x && d.y === y);
      setSelectedDesk(desk || null);
    } else if (tool === 'erase') {
      const desk = floorDesks.find(d => d.x === x && d.y === y);
      if (desk) {
        removeDesk(desk.id);
        toast('Desk removed');
      }
    }
  };

  const handleSaveDesk = () => {
    if (!editDesk) return;
    updateDesk(editDesk.id, editDesk);
    setEditDesk(null);
    toast.success('Desk updated');
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
    toast.success(`Desk ${status}`);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Floor Builder</h1>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {floors.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFloorId(f.id)}
                className={cn('px-3 py-1 text-xs font-medium rounded-lg transition-all',
                  selectedFloorId === f.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
          <Button size="sm" iconLeft={<Save className="w-4 h-4" />} onClick={() => toast.success('Layout saved!')}>
            Save Layout
          </Button>
        </div>
      </div>

      <Tabs tabs={[
        { id: 'map', label: 'Map Editor' },
        { id: 'list', label: 'Desk List', count: floorDesks.length },
        { id: 'zones', label: 'Zones', count: floor.zones.length },
        { id: 'settings', label: 'Floor Settings' },
      ]} activeTab={tab} onChange={setTab} />

      {tab === 'map' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'select' as const, icon: '↖', label: 'Select' },
              { id: 'add_desk' as const, icon: '➕', label: 'Add Desk' },
              { id: 'add_room' as const, icon: '🚪', label: 'Add Room' },
              { id: 'erase' as const, icon: '🗑', label: 'Erase' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                  tool === t.id ? 'bg-brand-500 text-white border-brand-500' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                )}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
            <div className="ml-auto text-sm text-gray-500">
              {floorDesks.length} desks · {floor.gridWidth}×{floor.gridHeight} grid
            </div>
          </div>

          <div className="flex gap-4">
            {/* Map */}
            <div className="flex-1 overflow-auto bg-white rounded-xl border border-gray-200 p-4">
              <div
                style={{ width: floor.gridWidth * CELL, height: floor.gridHeight * CELL, position: 'relative' }}
              >
                {/* Zone backgrounds */}
                {floor.zones.map(z => (
                  <div key={z.id} className="absolute rounded-lg border border-dashed opacity-40"
                    style={{ left: z.x*CELL, top: z.y*CELL, width: z.width*CELL, height: z.height*CELL, backgroundColor: z.color, borderColor: z.color }}>
                    <span className="text-xs font-semibold p-1 opacity-100 text-gray-600">{z.name}</span>
                  </div>
                ))}

                {/* Grid cells */}
                {Array.from({ length: floor.gridHeight }, (_, y) =>
                  Array.from({ length: floor.gridWidth }, (_, x) => {
                    const desk = floorDesks.find(d => d.x === x && d.y === y);
                    const room = floorRooms.find(r => r.x <= x && r.x + r.width > x && r.y <= y && r.y + r.height > y);
                    const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

                    if (desk) {
                      return (
                        <div
                          key={`${x}-${y}`}
                          className={cn(
                            'absolute rounded-md cursor-pointer transition-all flex items-center justify-center text-xs font-bold border-2',
                            selectedDesk?.id === desk.id ? 'border-brand-500 bg-brand-100 text-brand-700' :
                            desk.status === 'available' ? 'border-green-400 bg-green-100 text-green-700' :
                            desk.status === 'maintenance' ? 'border-gray-300 bg-gray-100 text-gray-500' :
                            'border-yellow-400 bg-yellow-100 text-yellow-700',
                          )}
                          style={{ left: x*CELL+2, top: y*CELL+2, width: CELL-4, height: CELL-4 }}
                          onClick={() => {
                            if (tool === 'select') setSelectedDesk(desk);
                            if (tool === 'erase') { removeDesk(desk.id); toast('Desk removed'); }
                          }}
                          onDoubleClick={() => setEditDesk({ ...desk })}
                        >
                          {desk.label.split('-')[1]}
                        </div>
                      );
                    }

                    if (room && room.x === x && room.y === y) {
                      return (
                        <div
                          key={`${x}-${y}`}
                          className="absolute rounded-md bg-blue-100 border-2 border-blue-400 text-blue-700 text-xs font-bold flex items-center justify-center"
                          style={{ left: x*CELL+2, top: y*CELL+2, width: room.width*CELL-4, height: room.height*CELL-4 }}
                        >
                          {room.name}
                        </div>
                      );
                    }

                    if (room) return null;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={cn(
                          'absolute transition-all',
                          tool === 'add_desk' && isHovered ? 'bg-green-200 rounded-md' : '',
                          tool === 'erase' && isHovered ? 'bg-red-100 rounded-md' : '',
                        )}
                        style={{ left: x*CELL, top: y*CELL, width: CELL, height: CELL }}
                        onClick={() => handleCellClick(x, y)}
                        onMouseEnter={() => setHoveredCell({ x, y })}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Properties panel */}
            {selectedDesk && (
              <div className="w-64 shrink-0">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{selectedDesk.label}</CardTitle>
                      <button onClick={() => setSelectedDesk(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <StatusBadge status={selectedDesk.status} />
                    <div className="text-sm text-gray-600">Type: {getDeskTypeLabel(selectedDesk.type)}</div>
                    <div className="text-sm text-gray-600">Position: ({selectedDesk.x}, {selectedDesk.y})</div>
                    {selectedDesk.amenities.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedDesk.amenities.map(a => <span key={a} className="text-xs bg-gray-100 rounded px-1.5 py-0.5">{getAmenityLabel(a)}</span>)}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                      <Button size="xs" variant="outline" iconLeft={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setEditDesk({ ...selectedDesk })}>
                        Edit
                      </Button>
                      {selectedDesk.status === 'available' ? (
                        <Button size="xs" variant="secondary" onClick={() => toggleDeskStatus(selectedDesk.id, 'maintenance')}>
                          Set Maintenance
                        </Button>
                      ) : (
                        <Button size="xs" variant="success" onClick={() => toggleDeskStatus(selectedDesk.id, 'available')}>
                          Set Available
                        </Button>
                      )}
                      <Button size="xs" variant="danger" iconLeft={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setShowDeleteConfirm(true)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{floorDesks.length} desks on {floor.name}</p>
            <Button size="sm" variant="outline" iconLeft={<Plus className="w-4 h-4" />} onClick={() => addDesk({
              label: `D-${String(floorDesks.length + 1).padStart(2, '0')}`,
              floorId: selectedFloorId, type: 'hot', status: 'available',
              x: 0, y: 0, width: 1, height: 1, amenities: [], isActive: true,
            })}>
              Add Desk
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 rounded-xl">
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Label</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Type</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Zone</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Position</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {floorDesks.map(desk => (
                  <tr key={desk.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium">{desk.label}</td>
                    <td className="p-3 text-gray-600">{getDeskTypeLabel(desk.type)}</td>
                    <td className="p-3 text-gray-600">{floor.zones.find(z => z.id === desk.zoneId)?.name || '—'}</td>
                    <td className="p-3"><StatusBadge status={desk.status} /></td>
                    <td className="p-3 text-gray-500 font-mono">({desk.x},{desk.y})</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="xs" variant="ghost" onClick={() => setEditDesk({ ...desk })}><Edit3 className="w-3.5 h-3.5" /></Button>
                        <Button size="xs" variant="ghost" onClick={() => { removeDesk(desk.id); toast('Desk removed'); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
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
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {floor.zones.map(zone => (
              <Card key={zone.id}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: zone.color }} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{zone.name}</p>
                    <p className="text-xs text-gray-500">{zone.width}×{zone.height} cells · ({zone.x},{zone.y})</p>
                  </div>
                  <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5">
                    {floorDesks.filter(d => d.zoneId === zone.id).length} desks
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <Card>
          <CardHeader><CardTitle>Floor Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Floor Name" defaultValue={floor.name} />
              <Input label="Level" type="number" defaultValue={String(floor.level)} />
              <Input label="Grid Width" type="number" defaultValue={String(floor.gridWidth)} />
              <Input label="Grid Height" type="number" defaultValue={String(floor.gridHeight)} />
            </div>
            <Button onClick={() => toast.success('Settings saved')}>Save Settings</Button>
          </CardContent>
        </Card>
      )}

      {/* Edit desk modal */}
      <Modal isOpen={!!editDesk} onClose={() => setEditDesk(null)} title="Edit Desk" size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditDesk(null)}>Cancel</Button>
            <Button onClick={handleSaveDesk}>Save Changes</Button>
          </div>
        }
      >
        {editDesk && (
          <div className="space-y-4">
            <Input label="Label" value={editDesk.label} onChange={e => setEditDesk({ ...editDesk, label: e.target.value })} />
            <Select label="Type" value={editDesk.type} onChange={e => setEditDesk({ ...editDesk, type: e.target.value as Desk['type'] })}
              options={[
                { value: 'hot', label: 'Hot Desk' },
                { value: 'fixed', label: 'Fixed Desk' },
                { value: 'standing', label: 'Standing Desk' },
                { value: 'quiet', label: 'Quiet Desk' },
                { value: 'collaboration', label: 'Collaboration' },
              ]}
            />
            <Select label="Status" value={editDesk.status} onChange={e => setEditDesk({ ...editDesk, status: e.target.value as Desk['status'] })}
              options={[
                { value: 'available', label: 'Available' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'blocked', label: 'Blocked' },
              ]}
            />
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteDesk}
        title="Delete Desk"
        message={`Are you sure you want to delete desk ${selectedDesk?.label}?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
