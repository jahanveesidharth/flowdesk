import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FloorMap } from '../components/floormap/FloorMap';
import { BookingWizard } from '../components/booking/BookingWizard';
import type { Desk, Room } from '../types';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { getDeskTypeLabel, getRoomTypeLabel, getAmenityLabel } from '../lib/utils';
import { 
  Users, Monitor, CheckCircle, X, Cpu, Landmark, Search, 
  MapPin, Eye, Sun, VolumeX, Laptop, Lock, Phone, FileText, 
  Sparkles, Coffee, Wrench, Video, HelpCircle, Compass, Play, Pause, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

const RESOURCE_IMAGES: Record<string, string> = {
  'desk-hot': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
  'desk-fixed': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  'desk-standing': 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80',
  'desk-quiet': 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80',
  'desk-collaboration': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  
  'room-meeting': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
  'room-boardroom': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'room-focus': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  'room-phone_booth': 'https://images.unsplash.com/photo-1543269608-fa395047d1b1?auto=format&fit=crop&w=800&q=80',
  'room-training': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  'room-washroom': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  'room-pantry': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  'room-storage': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  'room-server_room': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  'room-printer_room': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
  
  'default-desk': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
  'default-room': 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'
};

function getResourceImage(desk: Desk | null, room: Room | null): string {
  if (desk) {
    if (desk.imageUrl) return desk.imageUrl;
    return RESOURCE_IMAGES[`desk-${desk.type}`] || RESOURCE_IMAGES['default-desk'];
  }
  if (room) {
    if (room.imageUrl) return room.imageUrl;
    return RESOURCE_IMAGES[`room-${room.type}`] || RESOURCE_IMAGES['default-room'];
  }
  return RESOURCE_IMAGES['default-desk'];
}

function getAmenityIcon(amenity: string) {
  const iconClass = "w-3.5 h-3.5 text-gray-500 dark:text-gray-400";
  switch (amenity) {
    case 'monitor':
    case 'tv':
      return <Monitor className={iconClass} />;
    case 'docking_station':
      return <Laptop className={iconClass} />;
    case 'standing_desk':
    case 'standing_table':
      return <Compass className={iconClass} />;
    case 'locker':
    case 'storage':
      return <Lock className={iconClass} />;
    case 'window':
      return <Sun className={iconClass} />;
    case 'quiet_zone':
      return <VolumeX className={iconClass} />;
    case 'phone':
      return <Phone className={iconClass} />;
    case 'whiteboard':
      return <FileText className={iconClass} />;
    case 'video_conf':
      return <Video className={iconClass} />;
    case 'catering':
      return <Coffee className={iconClass} />;
    default:
      return <HelpCircle className={iconClass} />;
  }
}

function getLightingValue(desk: Desk | null, room: Room | null): string {
  if (desk) {
    if (desk.amenities.includes('window')) {
      return 'Natural Light';
    }
    if (desk.type === 'quiet') {
      return 'Soft Ambient';
    }
    if (desk.type === 'standing' || desk.type === 'fixed') {
      return 'Adjustable LED';
    }
    return 'Balanced LED';
  }
  if (room) {
    if (room.type === 'washroom' || room.type === 'storage' || room.type === 'server_room') {
      return 'Bright utility lights';
    }
    if (room.type === 'pantry' || room.type === 'focus' || room.type === 'phone_booth') {
      return 'Warm Ambient';
    }
    return 'Dimmable smart lighting';
  }
  return 'Standard LED';
}

export function FloorMapPage() {
  const { floors, selectedFloorId, setSelectedFloor, selectedDate, setSelectedDate, bookings, currentUser, desks, rooms, users, addNotification } = useAppStore();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [prefillDeskId, setPrefillDeskId] = useState<string>('');
  const [prefillResourceType, setPrefillResourceType] = useState<'desk' | 'room' | 'parking' | 'locker'>('desk');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showPanorama, setShowPanorama] = useState(false);
  const [isPanningAuto, setIsPanningAuto] = useState(true);
  const [manualPanX, setManualPanX] = useState(50);

  const selectedFloor = floors.find(f => f.id === selectedFloorId) || floors[0];

  const handleDeskClick = (desk: Desk) => {
    setSelectedRoom(null);
    setSelectedDesk(desk);
  };

  const handleRoomClick = (room: Room) => {
    setSelectedDesk(null);
    setSelectedRoom(room);
  };

  const handleBookDesk = () => {
    if (!selectedDesk) return;
    setPrefillDeskId(selectedDesk.id);
    setPrefillResourceType('desk');
    setSelectedDesk(null);
    setShowBooking(true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const matchedUser = users.find(u => u.name.toLowerCase().includes(query.toLowerCase()));
      if (matchedUser) {
        // Find their booking for today
        const userBooking = bookings.find(b =>
          b.userId === matchedUser.id &&
          b.date === selectedDate &&
          b.resourceType === 'desk' &&
          !['cancelled', 'completed', 'no_show'].includes(b.status)
        );
        if (userBooking) {
          const desk = desks.find(d => d.id === userBooking.resourceId);
          if (desk) {
            setSelectedRoom(null);
            setSelectedDesk(desk);
            if (desk.floorId !== selectedFloorId) {
              setSelectedFloor(desk.floorId);
              toast.success(`Switched to ${floors.find(f => f.id === desk.floorId)?.name || 'occupied floor'}`);
            }
          }
        }
      }
    }
  };

  const deskBooking = selectedDesk ? bookings.find(b =>
    b.resourceId === selectedDesk.id && b.date === selectedDate && b.resourceType === 'desk' &&
    !['cancelled', 'completed', 'no_show'].includes(b.status)
  ) : null;

  const isDeskMine = deskBooking?.userId === currentUser.id;
  const isDeskAvailable = !deskBooking && selectedDesk?.status !== 'maintenance';
  const bookedByUser = deskBooking ? users.find(u => u.id === deskBooking.userId) : null;

  return (
    <div className="flex flex-col h-full gap-6 animate-fade-in text-gray-900 dark:text-gray-100">
      
      {/* 1. Header controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 dark:border-gray-850/80 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Interactive Office Map</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Explore seat layouts and booking schedules in real time</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Coworker Search Bar */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Locate colleague..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="text-xs font-semibold border border-gray-205 dark:border-gray-805 bg-white dark:bg-gray-900 rounded-xl pl-8 pr-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-900 dark:text-white transition-all shadow-sm w-full sm:w-40 md:w-56 placeholder-gray-400"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs font-semibold border border-gray-200 dark:border-gray-805 bg-white dark:bg-gray-900 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 text-gray-900 dark:text-white transition-all shadow-sm w-[calc(50%-4px)] sm:w-auto flex-1 sm:flex-none"
          />
          <div className="flex gap-1 p-1 bg-gray-150/60 dark:bg-gray-900/60 rounded-xl border border-gray-200/40 dark:border-gray-800/40 shadow-sm w-[calc(50%-4px)] sm:w-auto flex-1 sm:flex-none justify-between sm:justify-start">
            {floors.filter(f => f.isActive).map(floor => (
              <button
                key={floor.id}
                onClick={() => {
                  setSelectedFloor(floor.id);
                  setSelectedDesk(null);
                  setSelectedRoom(null);
                }}
                className={cn(
                  'px-3.5 py-1 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-none text-center',
                  selectedFloorId === floor.id 
                    ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200/10 text-gray-955 dark:text-white' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250',
                )}
              >
                {floor.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Floor metrics / stats cards */}
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-5 md:gap-4 shrink-0 -mx-4 px-4 sm:mx-0 sm:px-0">
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
              <MiniStatCard label="Total Desks" value={floorDesks.length} color="blue" icon="🪑" />
              <MiniStatCard label="Available" value={floorDesks.length - occupiedDesks} color="green" icon="🟢" />
              <MiniStatCard label="Occupied" value={occupiedDesks} color="red" icon="🔴" />
              <MiniStatCard label="Utilization" value={`${rate}%`} color="purple" icon="📈" />
              <MiniStatCard label="Meeting Rooms" value={floorRooms.length} color="gray" icon="🚪" />
            </>
          );
        })()}
      </div>

      {/* 3. Main Split Canvas Layout */}
      <div className="flex flex-1 gap-6 min-h-[520px] relative overflow-hidden">
        
        {/* Left side: Interactive Map visualizer */}
        <div className="flex-1 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800/80 overflow-hidden relative shadow-sm">
          {selectedFloor && (
            <FloorMap
              floor={selectedFloor}
              onDeskClick={handleDeskClick}
              onRoomClick={handleRoomClick}
              date={selectedDate}
              selectedDeskId={selectedDesk?.id}
            />
          )}
        </div>

        {/* Right side: Slide-over seating details panel */}
        <div className={cn(
          "w-full sm:w-80 md:w-96 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950 p-5 flex flex-col justify-between shadow-xl shrink-0 transition-all duration-300",
          "absolute md:relative right-0 top-0 bottom-0 z-20 md:z-auto",
          (selectedDesk || selectedRoom) ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none hidden"
        )}>
          
          {/* Top Panel Actions & Content Header */}
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850/80 pb-3">
              <div className="flex items-center gap-2">
                {selectedDesk ? <Cpu className="w-5 h-5 text-brand-500" /> : <Landmark className="w-5 h-5 text-brand-500" />}
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {selectedDesk ? `Desk ${selectedDesk.label}` : selectedRoom?.name}
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedDesk(null); setSelectedRoom(null); }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 hover:text-gray-650 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Real Picture of the Place */}
            <div className="relative group rounded-3xl overflow-hidden aspect-[4/3] shadow-md border border-gray-100 dark:border-gray-800/80">
              <img 
                src={getResourceImage(selectedDesk, selectedRoom)} 
                alt="Real place visualization"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              
              {/* Location Pin overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 dark:bg-gray-900/95 p-2 rounded-full shadow-lg border border-brand-500/25 flex items-center justify-center animate-bounce">
                  <MapPin className="w-5 h-5 text-brand-500 fill-brand-100 dark:fill-brand-950" />
                </div>
              </div>

              {/* Panorama View Badge/Pill */}
              <button 
                onClick={() => {
                  setManualPanX(50);
                  setIsPanningAuto(true);
                  setShowPanorama(true);
                }}
                className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-855 text-gray-800 dark:text-white text-[10px] font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-md border border-gray-200/50 dark:border-gray-800/50 transition-all pointer-events-auto hover:scale-105"
              >
                <Compass className="w-3.5 h-3.5 text-brand-500 animate-spin-slow" />
                <span>Panorama View</span>
              </button>
            </div>

            {/* Quick Specs Capsules (Amenities & Lighting) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50/60 dark:bg-gray-900/40 border border-gray-150/40 dark:border-gray-800/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Amenities</span>
                <div className="flex gap-1.5 mt-1.5 items-center flex-wrap">
                  {selectedDesk ? (
                    selectedDesk.amenities.length > 0 ? (
                      selectedDesk.amenities.slice(0, 3).map((a) => (
                        <div key={a} className="p-1 bg-white dark:bg-gray-950 rounded-lg border border-gray-150 dark:border-gray-850 shadow-sm" title={a}>
                          {getAmenityIcon(a)}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-450 dark:text-gray-550">Standard Desk</span>
                    )
                  ) : selectedRoom ? (
                    selectedRoom.amenities.length > 0 ? (
                      selectedRoom.amenities.slice(0, 3).map((a) => (
                        <div key={a} className="p-1 bg-white dark:bg-gray-950 rounded-lg border border-gray-150 dark:border-gray-850 shadow-sm" title={a}>
                          {getAmenityIcon(a)}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-450 dark:text-gray-550">Standard Room</span>
                    )
                  ) : null}
                </div>
              </div>
              
              <div className="bg-gray-50/60 dark:bg-gray-900/40 border border-gray-150/40 dark:border-gray-800/60 rounded-2xl p-3 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider block">Lighting</span>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-gray-700 dark:text-gray-350">
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-100 dark:fill-amber-950/20" />
                  <span>{getLightingValue(selectedDesk, selectedRoom)}</span>
                </div>
              </div>
            </div>

            {/* A. Selected Desk Specific Content */}
            {selectedDesk && (
              <div className="space-y-5">
                
                {/* Coworker Card if occupied by someone else */}
                {deskBooking && bookedByUser && !isDeskMine ? (
                  <div className="bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-3.5 shadow-sm">
                    <Avatar name={bookedByUser.name} imageUrl={bookedByUser.avatar} size="lg" className="ring-4 ring-brand-500/20" />
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{bookedByUser.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{bookedByUser.role} • {bookedByUser.department}</p>
                    </div>
                    <div className="w-full bg-white dark:bg-gray-950 rounded-xl p-3 border border-gray-150/40 dark:border-gray-850 text-left space-y-2.5">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Checked In Status</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-250 mt-0.5 block flex items-center gap-1.5">
                          {deskBooking.status === 'checked_in' ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active at Desk
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              Reserved (Not Checked In)
                            </>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Reservation Window</span>
                        <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 block mt-0.5">{deskBooking.startTime} – {deskBooking.endTime}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full pt-1">
                      <a 
                        href={`mailto:${bookedByUser.email}`} 
                        onClick={() => {
                          toast.success(`Email drafted and logged to history! ✉️`);
                          addNotification({
                            userId: currentUser.id,
                            type: 'booking_confirmed',
                            title: 'Email Sent to ' + bookedByUser.name,
                            message: `Sent email regarding Desk ${selectedDesk.label} reservation to ${bookedByUser.email}.`,
                            read: false,
                          });
                          addNotification({
                            userId: bookedByUser.id,
                            type: 'admin_message',
                            title: 'Email from ' + currentUser.name,
                            message: `${currentUser.name} sent you an email regarding your reservation of Desk ${selectedDesk.label}.`,
                            read: false,
                          });
                        }}
                        className="flex-1 bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-750 text-gray-700 dark:text-gray-250 text-xs py-2 rounded-xl font-bold transition-all text-center shadow-sm"
                      >
                        Send Email
                      </a>
                      <button 
                        onClick={() => {
                          toast.success(`Slack notification pinged to ${bookedByUser.name}! 💬`);
                          addNotification({
                            userId: currentUser.id,
                            type: 'booking_confirmed',
                            title: 'Slack Ping Sent to ' + bookedByUser.name,
                            message: `Pinged ${bookedByUser.name} on Slack regarding Desk ${selectedDesk.label} reservation.`,
                            read: false,
                          });
                          addNotification({
                            userId: bookedByUser.id,
                            type: 'admin_message',
                            title: 'Slack Ping from ' + currentUser.name,
                            message: `${currentUser.name} pinged you on Slack regarding your reservation of Desk ${selectedDesk.label} today.`,
                            read: false,
                          });
                        }}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-xs py-2 rounded-xl font-bold transition-all shadow-sm shadow-brand-500/10"
                      >
                        Ping Slack
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Resource Type</p>
                        <p className="text-sm font-semibold text-gray-750 dark:text-gray-205 mt-0.5">{getDeskTypeLabel(selectedDesk.type)}</p>
                      </div>
                      <StatusBadge status={isDeskAvailable ? 'available' : deskBooking ? 'occupied' : selectedDesk.status} />
                    </div>

                    {selectedDesk.zoneId && (
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Location Zone</p>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                          {selectedFloor?.zones.find(z => z.id === selectedDesk.zoneId)?.name || 'General Zone'}
                        </p>
                      </div>
                    )}

                    {/* Booking status block for current user */}
                    {deskBooking ? (
                      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3">
                        <p className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">Reserved Seat</p>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-300 mt-1">{deskBooking.startTime} – {deskBooking.endTime}</p>
                        {isDeskMine && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">This is your booking</p>}
                      </div>
                    ) : (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-450 uppercase tracking-wider">Available Spot</p>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Free to reserve for {selectedDate}</p>
                      </div>
                    )}
                  </>
                )}
                {/* Desk Amenity Pills */}
                {selectedDesk.amenities.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Amenities Included</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDesk.amenities.map(a => (
                        <span key={a} className="text-[10px] font-bold bg-gray-50 dark:bg-gray-900/60 border border-gray-150/40 dark:border-gray-800/60 text-gray-655 dark:text-gray-350 rounded-lg px-2.5 py-1">
                          {getAmenityLabel(a)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* B. Selected Room Specific Content */}
            {selectedRoom && (() => {
              const activeRoomBookings = bookings.filter(b => 
                b.resourceId === selectedRoom.id && 
                b.date === selectedDate && 
                b.resourceType === 'room' && 
                !['cancelled', 'completed', 'no_show'].includes(b.status)
              );

              return (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Room Category</p>
                      <p className="text-sm font-semibold text-gray-750 dark:text-gray-205 mt-0.5">{getRoomTypeLabel(selectedRoom.type)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 font-semibold"><Users className="w-3.5 h-3.5" /> Up to {selectedRoom.capacity} people</p>
                    </div>
                    <StatusBadge status={selectedRoom.status} />
                  </div>

                  {/* Room Amenity Pills */}
                  {selectedRoom.amenities.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2">Room Amenities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRoom.amenities.map(a => (
                          <span key={a} className="text-[10px] font-bold bg-gray-50 dark:bg-gray-900/60 border border-gray-150/40 dark:border-gray-800/60 text-gray-655 dark:text-gray-350 rounded-lg px-2.5 py-1">
                            {getAmenityLabel(a)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Reservations list */}
                  {activeRoomBookings.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Current Reservations ({activeRoomBookings.length})</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {activeRoomBookings.map(b => {
                          const bookingUser = users.find(u => u.id === b.userId);
                          return (
                            <div key={b.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-150/40 dark:border-gray-800/60">
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar name={bookingUser?.name || 'Unknown User'} imageUrl={bookingUser?.avatar} size="sm" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{bookingUser?.name || 'Unknown User'}</p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{bookingUser?.department || 'Visitor'}</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20 px-2 py-0.5 rounded border border-brand-100/50 dark:border-brand-900/30">
                                  {b.startTime} - {b.endTime}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Today's hourly schedule timeline */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-2.5">Schedule Timeline</p>
                    <div className="border border-gray-150 dark:border-gray-800/80 rounded-xl overflow-hidden divide-y divide-gray-150 dark:divide-gray-850 max-h-64 overflow-y-auto">
                      {(() => {
                        const hours = Array.from({ length: 11 }, (_, i) => {
                          const h = 8 + i;
                          return `${String(h).padStart(2, '0')}:00`;
                        });
                        const roomBookings = bookings.filter(b => 
                          b.resourceId === selectedRoom.id && 
                          b.date === selectedDate && 
                          b.resourceType === 'room' && 
                          !['cancelled'].includes(b.status)
                        );

                        return hours.map(hour => {
                          const nextHour = `${String(parseInt(hour.split(':')[0]) + 1).padStart(2, '0')}:00`;
                          const activeBooking = roomBookings.find(b => 
                            b.startTime < nextHour && b.endTime > hour
                          );

                          return (
                            <div key={hour} className="flex items-center gap-3 px-3 py-2 text-[10px]">
                              <span className="font-bold text-gray-400 dark:text-gray-550 w-10 shrink-0">{hour}</span>
                              {activeBooking ? (
                                <div className="flex-1 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg px-2 py-1 flex items-center justify-between text-red-750 dark:text-red-400 font-bold">
                                  <span className="truncate max-w-[80px]">{activeBooking.title || 'Reserved'}</span>
                                  <span className="text-[9px] opacity-75 shrink-0 tabular-nums">{activeBooking.startTime}–{activeBooking.endTime}</span>
                                </div>
                              ) : (
                                <div className="flex-1 bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-lg px-2 py-1 flex items-center justify-between text-green-700 dark:text-green-450 font-bold">
                                  <span>Available</span>
                                  <span className="text-[9px] opacity-75 shrink-0">Free</span>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-850/80 shrink-0">
            {selectedDesk && (
              isDeskAvailable ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setSelectedDesk(null)}>Cancel</Button>
                  <Button className="flex-1 rounded-xl font-bold" onClick={handleBookDesk} iconLeft={<CheckCircle className="w-4 h-4" />}>Book Seat</Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full rounded-xl font-bold" onClick={() => setSelectedDesk(null)}>Close</Button>
              )
            )}
            {selectedRoom && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setSelectedRoom(null)}>Cancel</Button>
                <Button className="flex-1 rounded-xl font-bold" onClick={() => {
                  setPrefillDeskId(''); // Prefill room booking workflow correctly
                  setPrefillResourceType('room');
                  setSelectedRoom(null);
                  setShowBooking(true);
                }}>Book Room</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingWizard
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        prefillDeskId={prefillDeskId}
        prefillFloorId={selectedFloorId}
        prefillDate={selectedDate}
        prefillResourceType={prefillResourceType}
      />

      {/* Virtual Panorama Modal */}
      {showPanorama && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-slide-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-105 dark:border-gray-850/80">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-500 animate-spin-slow" />
                  <span>Virtual 360° Panorama - {selectedDesk ? `Desk ${selectedDesk.label}` : selectedRoom?.name}</span>
                </h4>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Simulated interactive view of this office space</p>
              </div>
              <button 
                onClick={() => setShowPanorama(false)}
                className="p-2 rounded-full bg-gray-500/10 hover:bg-gray-500/20 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-500 dark:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panorama viewport */}
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-950 group">
              {/* Animated Panning Image */}
              <div 
                className={cn(
                  "absolute inset-0 bg-center w-full h-full",
                  isPanningAuto ? "panorama-panning" : ""
                )}
                style={{
                  backgroundImage: `url(${getResourceImage(selectedDesk, selectedRoom)})`,
                  backgroundSize: '200% 100%',
                  backgroundPosition: isPanningAuto ? undefined : `${manualPanX}% 50%`,
                  transition: isPanningAuto ? 'none' : 'background-position 0.2s ease-out',
                }}
              />

              {/* Grid overlay for high-tech look */}
              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none mix-blend-overlay" />

              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6))] pointer-events-none" />

              {/* Interaction Overlay indicator */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                <span>{isPanningAuto ? "AUTO ROTATING 360°" : "MANUAL PAN ACTIVE"}</span>
              </div>

              {/* Slider for manual pan when auto-pan is disabled */}
              {!isPanningAuto && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-3 w-72 shadow-xl border border-white/10">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider shrink-0">Pan View</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={manualPanX}
                    onChange={(e) => setManualPanX(Number(e.target.value))}
                    className="w-full accent-brand-500 bg-gray-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-105 dark:border-gray-850/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPanningAuto(!isPanningAuto)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/10"
                >
                  {isPanningAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPanningAuto ? "Pause Tour" : "Auto Rotate"}</span>
                </button>

                <button
                  onClick={() => {
                    setManualPanX(50);
                    setIsPanningAuto(true);
                  }}
                  className="bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-855 text-gray-700 dark:text-gray-250 border border-gray-200 dark:border-gray-800 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset View</span>
                </button>
              </div>

              <div className="text-[10px] text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider hidden sm:block">
                Location: {selectedFloor?.name} • Zone: {selectedDesk ? (selectedFloor?.zones.find(z => z.id === selectedDesk.zoneId)?.name || 'General') : 'Meeting'}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Mini visual indicator stat card
function MiniStatCard({ label, value, color, icon }: { label: string; value: string | number; color: 'blue' | 'green' | 'red' | 'purple' | 'gray'; icon: string }) {
  const colorMap = {
    blue: 'bg-white hover:border-blue-200 dark:hover:border-blue-900/40 text-blue-700 dark:text-blue-400 border-gray-200 dark:border-gray-800/80',
    green: 'bg-white hover:border-emerald-200 dark:hover:border-emerald-900/40 text-green-700 dark:text-green-400 border-gray-200 dark:border-gray-800/80',
    red: 'bg-white hover:border-red-200 dark:hover:border-red-900/40 text-red-700 dark:text-red-400 border-gray-200 dark:border-gray-800/80',
    purple: 'bg-white hover:border-purple-200 dark:hover:border-purple-900/40 text-purple-700 dark:text-purple-400 border-gray-200 dark:border-gray-800/80',
    gray: 'bg-white hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800/80',
  };
  return (
    <div className={cn(
      "border rounded-xl px-3 py-2 flex items-center justify-between shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 dark:bg-gray-950",
      "w-[135px] sm:w-auto shrink-0 snap-start",
      colorMap[color]
    )}>
      <div className="space-y-0.5 min-w-0">
        <div className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-550 truncate" title={label}>{label}</div>
        <div className="text-sm sm:text-base font-extrabold tracking-tight text-gray-950 dark:text-white truncate">{value}</div>
      </div>
      <span className="text-base sm:text-lg filter drop-shadow-sm select-none opacity-90 shrink-0 ml-1">{icon}</span>
    </div>
  );
}
