import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FloorMap } from '../components/floormap/FloorMap';
import { BookingWizard } from '../components/booking/BookingWizard';
import { Select } from '../components/ui/Input';
import type { Desk, Room } from '../types';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { getDeskTypeLabel, getRoomTypeLabel, getAmenityLabel, formatDate } from '../lib/utils';
import { Users, Monitor, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function FloorMapPage() {
  const { floors, selectedFloorId, setSelectedFloor, selectedDate, setSelectedDate, bookings, currentUser, desks, rooms } = useAppStore();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [prefillDeskId, setPrefillDeskId] = useState<string>('');

  const selectedFloor = floors.find(f => f.id === selectedFloorId) || floors[0];

  const handleDeskClick = (desk: Desk) => {
    setSelectedDesk(desk);
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleBookDesk = () => {
    if (!selectedDesk) return;
    setPrefillDeskId(selectedDesk.id);
    setSelectedDesk(null);
    setShowBooking(true);
  };

  const deskBooking = selectedDesk ? bookings.find(b =>
    b.resourceId === selectedDesk.id && b.date === selectedDate && b.resourceType === 'desk' &&
    !['cancelled', 'completed', 'no_show'].includes(b.status)
  ) : null;

  const isDeskMine = deskBooking?.userId === currentUser.id;
  const isDeskAvailable = !deskBooking && selectedDesk?.status !== 'maintenance';

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-xl font-bold text-gray-900">Floor Map</h1>
        <div className="flex items-center gap-3 ml-auto flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {floors.filter(f => f.isActive).map(floor => (
              <button
                key={floor.id}
                onClick={() => setSelectedFloor(floor.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  selectedFloorId === floor.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {floor.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floor stats */}
      <div className="flex gap-3 flex-wrap">
        {(() => {
          const floorDesks = desks.filter(d => d.floorId === selectedFloorId && d.isActive);
          const floorRooms = rooms.filter(r => r.floorId === selectedFloorId && r.isActive);
          const occupiedDesks = bookings.filter(b =>
            b.date === selectedDate && b.floorId === selectedFloorId && b.resourceType === 'desk' &&
            !['cancelled', 'completed', 'no_show'].includes(b.status)
          ).length;
          const rate = floorDesks.length > 0 ? Math.round((occupiedDesks / floorDesks.length) * 100) : 0;
          return (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-center">
                <div className="text-lg font-bold text-blue-700">{floorDesks.length}</div>
                <div className="text-xs text-blue-500">Total Desks</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-center">
                <div className="text-lg font-bold text-green-700">{floorDesks.length - occupiedDesks}</div>
                <div className="text-xs text-green-500">Available</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-center">
                <div className="text-lg font-bold text-red-700">{occupiedDesks}</div>
                <div className="text-xs text-red-500">Occupied</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-2 text-center">
                <div className="text-lg font-bold text-purple-700">{rate}%</div>
                <div className="text-xs text-purple-500">Utilization</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-center">
                <div className="text-lg font-bold text-gray-700">{floorRooms.length}</div>
                <div className="text-xs text-gray-500">Rooms</div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[500px]">
        {selectedFloor && (
          <FloorMap
            floor={selectedFloor}
            onDeskClick={handleDeskClick}
            onRoomClick={handleRoomClick}
            date={selectedDate}
          />
        )}
      </div>

      {/* Desk detail modal */}
      <Modal
        isOpen={!!selectedDesk}
        onClose={() => setSelectedDesk(null)}
        title={selectedDesk?.label || 'Desk'}
        size="sm"
        footer={
          isDeskAvailable ? (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedDesk(null)}>Close</Button>
              <Button onClick={handleBookDesk} iconLeft={<CheckCircle className="w-4 h-4" />}>Book This Desk</Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setSelectedDesk(null)}>Close</Button>
          )
        }
      >
        {selectedDesk && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getDeskTypeLabel(selectedDesk.type)}</p>
                {selectedDesk.zoneId && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Zone: {selectedFloor?.zones.find(z => z.id === selectedDesk.zoneId)?.name}
                  </p>
                )}
              </div>
              <StatusBadge status={isDeskAvailable ? 'available' : deskBooking ? 'occupied' : selectedDesk.status} />
            </div>

            {deskBooking && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-sm font-medium text-red-800">Currently Booked</p>
                <p className="text-xs text-red-600 mt-1">{deskBooking.startTime} – {deskBooking.endTime}</p>
                {isDeskMine && <p className="text-xs text-red-700 font-medium mt-1">This is your booking</p>}
              </div>
            )}

            {selectedDesk.amenities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDesk.amenities.map(a => (
                    <span key={a} className="text-xs bg-gray-100 text-gray-700 rounded-lg px-2.5 py-1">
                      {getAmenityLabel(a)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Room detail modal */}
      <Modal
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title={selectedRoom?.name || 'Room'}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedRoom(null)}>Close</Button>
            <Button onClick={() => {
              setSelectedRoom(null);
              setShowBooking(true);
            }}>Book This Room</Button>
          </div>
        }
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getRoomTypeLabel(selectedRoom.type)}</p>
                <p className="text-sm text-gray-700 flex items-center gap-1 mt-1"><Users className="w-4 h-4" /> Capacity: {selectedRoom.capacity}</p>
              </div>
              <StatusBadge status={selectedRoom.status} />
            </div>
            {selectedRoom.amenities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoom.amenities.map(a => (
                    <span key={a} className="text-xs bg-gray-100 text-gray-700 rounded-lg px-2.5 py-1">{getAmenityLabel(a)}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Today's schedule */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Today's Schedule</p>
              {bookings.filter(b => b.resourceId === selectedRoom.id && b.date === selectedDate && b.resourceType === 'room' && !['cancelled'].includes(b.status)).length === 0 ? (
                <p className="text-sm text-green-600">Available all day</p>
              ) : (
                <div className="space-y-1">
                  {bookings.filter(b => b.resourceId === selectedRoom.id && b.date === selectedDate && b.resourceType === 'room' && !['cancelled'].includes(b.status)).map(b => (
                    <div key={b.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-700">{b.title || 'Booking'}</span>
                      <span className="text-gray-500 text-xs">{b.startTime}–{b.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <BookingWizard
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        prefillDeskId={prefillDeskId}
        prefillFloorId={selectedFloorId}
        prefillDate={selectedDate}
      />
    </div>
  );
}
