import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select, Input, Textarea } from '../ui/Input';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_TIME_SLOTS } from '../../data/mockData';
import { FloorMap } from '../floormap/FloorMap';
import type { Desk, Room, BookingDurationType } from '../../types';
import { cn, formatDate, getDeskTypeLabel, getRoomTypeLabel } from '../../lib/utils';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  CheckCircle, MapPin, Clock, Calendar, ChevronRight, 
  ChevronLeft, Users, Car, Lock, Monitor, Laptop, Zap
} from 'lucide-react';

type ResourceTab = 'desk' | 'room' | 'parking' | 'locker';
type Step = 'type' | 'resource' | 'time' | 'confirm';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  prefillDeskId?: string;
  prefillDate?: string;
  prefillFloorId?: string;
  prefillResourceType?: ResourceTab;
}

export function BookingWizard({ isOpen, onClose, prefillDeskId, prefillDate, prefillFloorId, prefillResourceType }: BookingWizardProps) {
  const { floors, desks, rooms, parkingSpaces, lockers, addBooking, currentUser, selectedDate, getDeskAvailability, bookings, selectedFloorId: storeFloorId } = useAppStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('type');
  const [resourceType, setResourceType] = useState<ResourceTab>('desk');
  const [selectedFloorId, setSelectedFloorId] = useState(prefillFloorId || storeFloorId || (floors[0]?.id) || 'f1');
  const [selectedResourceId, setSelectedResourceId] = useState<string>(prefillDeskId || '');
  const [date, setDate] = useState(prefillDate || selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [bookingDurationType, setBookingDurationType] = useState<BookingDurationType>('full_day');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setDate(prefillDate || selectedDate);
    const type = prefillResourceType || 'desk';
    setResourceType(type);
    setSelectedResourceId(prefillDeskId || '');

    // Automatically select a floor that is valid for the prefilled or initial resource type
    const available = floors.filter(f => {
      if (!f.isActive) return false;
      if (type === 'desk') return desks.some(d => d.floorId === f.id && d.isActive);
      if (type === 'room') return rooms.some(r => r.floorId === f.id && r.isActive);
      if (type === 'parking') return parkingSpaces.some(p => p.floorId === f.id && p.isActive);
      if (type === 'locker') return lockers.some(l => l.floorId === f.id && l.isActive);
      return false;
    });

    const preferredFloorId = prefillFloorId || storeFloorId || (floors[0]?.id) || 'f1';
    if (available.some(f => f.id === preferredFloorId)) {
      setSelectedFloorId(preferredFloorId);
    } else if (available.length > 0) {
      setSelectedFloorId(available[0].id);
    } else {
      setSelectedFloorId(preferredFloorId);
    }

    setStep('type');
    setComplete(false);
  }, [isOpen, prefillDate, prefillDeskId, prefillFloorId, prefillResourceType, selectedDate, storeFloorId, floors, desks, rooms, parkingSpaces, lockers]);

  // Adjust selected floor when category (resourceType) changes
  useEffect(() => {
    if (!isOpen) return;
    const available = floors.filter(f => {
      if (!f.isActive) return false;
      if (resourceType === 'desk') return desks.some(d => d.floorId === f.id && d.isActive);
      if (resourceType === 'room') return rooms.some(r => r.floorId === f.id && r.isActive);
      if (resourceType === 'parking') return parkingSpaces.some(p => p.floorId === f.id && p.isActive);
      if (resourceType === 'locker') return lockers.some(l => l.floorId === f.id && l.isActive);
      return false;
    });

    if (available.length > 0 && !available.some(f => f.id === selectedFloorId)) {
      setSelectedFloorId(available[0].id);
    }
  }, [resourceType, isOpen, floors, desks, rooms, parkingSpaces, lockers, selectedFloorId]);

  const getAvailableFloors = (type: ResourceTab) => {
    return floors.filter(f => {
      if (!f.isActive) return false;
      if (type === 'desk') return desks.some(d => d.floorId === f.id && d.isActive);
      if (type === 'room') return rooms.some(r => r.floorId === f.id && r.isActive);
      if (type === 'parking') return parkingSpaces.some(p => p.floorId === f.id && p.isActive);
      if (type === 'locker') return lockers.some(l => l.floorId === f.id && l.isActive);
      return false;
    });
  };

  const availableFloors = getAvailableFloors(resourceType);
  const floorsToDisplay = availableFloors.length > 0 ? availableFloors : floors.filter(f => f.isActive);

  const selectedFloor = floors.find(f => f.id === selectedFloorId) || floors[0];

  const getSelectedResource = () => {
    if (resourceType === 'desk') return desks.find(d => d.id === selectedResourceId);
    if (resourceType === 'room') return rooms.find(r => r.id === selectedResourceId);
    if (resourceType === 'parking') return parkingSpaces.find(p => p.id === selectedResourceId);
    if (resourceType === 'locker') return lockers.find(l => l.id === selectedResourceId);
    return null;
  };

  const resource = getSelectedResource();

  const handleDeskClick = (desk: Desk) => {
    if (getDeskAvailability(desk.id, date)) {
      setSelectedResourceId(desk.id);
      setStep('time');
    } else {
      toast.error('This desk is already booked for the selected date');
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedResourceId(room.id);
    setStep('time');
  };

  const handleSubmit = async () => {
    if (!selectedResourceId) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    addBooking({
      userId: currentUser.id,
      resourceType,
      resourceId: selectedResourceId,
      floorId: selectedFloorId,
      buildingId: selectedFloor.buildingId,
      date,
      startTime,
      endTime,
      status: 'confirmed',
      durationType: bookingDurationType,
      title: title || undefined,
      notes: notes || undefined,
      isRecurring,
      recurringId: isRecurring ? `rec-${Date.now()}` : undefined,
    });
    setLoading(false);
    setComplete(true);
    toast.success('Booking confirmed!');
  };

  const handleClose = () => {
    setStep('type');
    setSelectedResourceId('');
    setComplete(false);
    setTitle('');
    setNotes('');
    setIsRecurring(false);
    onClose();
  };

  const canProceed = () => {
    if (step === 'type') return true;
    if (step === 'resource') return !!selectedResourceId;
    if (step === 'time') return startTime < endTime;
    return true;
  };

  const stepNum = { type: 1, resource: 2, time: 3, confirm: 4 }[step];
  const stepLabels = ['Category', 'Select Space', 'Schedule', 'Confirm'];

  if (complete) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center py-6 gap-5 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center shadow-inner ring-4 ring-emerald-500/10">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">Booking Confirmed!</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[240px] mx-auto leading-relaxed">
              Your {resourceType} reservation has been successfully registered.
            </p>
          </div>
          <div className="bg-gray-50/60 dark:bg-gray-900/40 border border-gray-150/40 dark:border-gray-800/60 rounded-2xl p-4 w-full text-left space-y-3 shadow-inner">
            <Detail icon={<Calendar className="w-4 h-4 text-brand-500" />} label={formatDate(date)} />
            <Detail icon={<Clock className="w-4 h-4 text-brand-500" />} label={`${startTime} – ${endTime}`} />
            <Detail icon={<MapPin className="w-4 h-4 text-brand-500" />} label={selectedFloor.name} />
          </div>
          <div className="flex gap-3 w-full border-t border-gray-100 dark:border-gray-900 pt-4 mt-1">
            <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={handleClose}>Done</Button>
            <Button className="flex-1 rounded-xl font-bold" onClick={() => { handleClose(); navigate('/my-bookings'); }}>View List</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Book a Space"
      size={step === 'resource' && resourceType === 'desk' ? 'xl' : 'lg'}
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Step indicator tracker dots */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={cn('w-2 h-2 rounded-full transition-all duration-300', s === stepNum ? 'bg-brand-500 w-6' : s < stepNum ? 'bg-brand-300' : 'bg-gray-200 dark:bg-gray-800')} />
            ))}
          </div>
          
          <div className="flex gap-3">
            {step !== 'type' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold"
                iconLeft={<ChevronLeft className="w-4 h-4" />}
                onClick={() => {
                  if (step === 'resource') setStep('type');
                  if (step === 'time') setStep('resource');
                  if (step === 'confirm') setStep('time');
                }}
              >
                Back
              </Button>
            )}
            {step !== 'confirm' ? (
              <Button 
                size="sm" 
                className="rounded-xl font-bold"
                iconRight={<ChevronRight className="w-4 h-4" />}
                disabled={!canProceed()}
                onClick={() => {
                  if (step === 'type') setStep('resource');
                  if (step === 'resource') setStep('time');
                  if (step === 'time') {
                    // Check if time slot is in the past
                    const todayStr = format(new Date(), 'yyyy-MM-dd');
                    const nowTimeStr = format(new Date(), 'HH:mm');
                    if (date < todayStr || (date === todayStr && endTime <= nowTimeStr)) {
                      toast.error('Cannot create a booking that has already ended.');
                      return;
                    }

                    const hasConflict = (() => {
                      const overlappingBookings = bookings.filter(b =>
                        b.resourceId === selectedResourceId &&
                        b.date === date &&
                        !['cancelled', 'completed', 'no_show'].includes(b.status) &&
                        b.startTime < endTime && b.endTime > startTime
                      );

                      if (resourceType === 'room') {
                        const room = rooms.find(r => r.id === selectedResourceId);
                        const capacity = room?.capacity || 1;
                        return overlappingBookings.length >= capacity;
                      }
                      return overlappingBookings.length > 0;
                    })();

                    if (hasConflict) {
                      toast.error('Conflict: This space is already fully booked during the selected timeframe.');
                      return;
                    }
                    setStep('confirm');
                  }
                }}
              >
                {step === 'resource' && !selectedResourceId ? 'Select a resource' : 'Continue'}
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="rounded-xl font-bold bg-brand-500 text-white"
                loading={loading} 
                onClick={handleSubmit} 
                iconLeft={<CheckCircle className="w-4 h-4" />}
              >
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Step Indicator Header */}
        <div className="hidden sm:flex items-center justify-between border-b border-gray-100 dark:border-gray-850/80 pb-4 mb-2">
          {stepLabels.map((label, idx) => {
            const index = idx + 1;
            return (
              <div key={label} className="flex items-center gap-2">
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold border",
                  index === stepNum 
                    ? "bg-brand-500 text-white border-brand-500" 
                    : index < stepNum 
                      ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/20 dark:border-brand-900/40 dark:text-brand-400" 
                      : "border-gray-200 text-gray-400 dark:border-gray-800"
                )}>
                  {index}
                </span>
                <span className={cn(
                  "text-xs font-bold",
                  index === stepNum ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
                )}>
                  {label}
                </span>
                {idx < 3 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 ml-2" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Category */}
        {step === 'type' && (() => {
          // Generate 14 days starting from today (2 weeks)
          const datesList = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
          const dateStrings = datesList.map(d => format(d, 'yyyy-MM-dd'));
          if (date && !dateStrings.includes(date)) {
            try {
              const parsedDate = new Date(date);
              if (!isNaN(parsedDate.getTime())) {
                datesList.push(parsedDate);
                datesList.sort((a, b) => a.getTime() - b.getTime());
              }
            } catch (e) {
              console.error(e);
            }
          }

          return (
            <div className="space-y-5">
              {/* Custom Horizontal Date Picker and Floor Selector Card */}
              <div className="flex border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-950 p-2 min-h-[96px] items-center">
                {/* Horizontal date scroller */}
                <div 
                  className="flex-1 flex gap-2 overflow-x-auto pr-2 scrollbar-none"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {datesList.map((d) => {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const isSelected = dateStr === date;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setDate(dateStr)}
                        className={cn(
                          "flex-1 min-w-[56px] flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all cursor-pointer",
                          isSelected 
                            ? "bg-brand-500 text-white shadow-sm font-bold scale-[1.02]" 
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/60"
                        )}
                      >
                        <span className={cn("text-[9px] uppercase tracking-wider font-extrabold", isSelected ? "text-brand-100" : "text-gray-400 dark:text-gray-500")}>
                          {format(d, 'EEE')}
                        </span>
                        <span className="text-sm font-extrabold my-0.5 leading-none">
                          {format(d, 'd')}
                        </span>
                        <span className={cn("text-[9px] uppercase tracking-wider font-extrabold", isSelected ? "text-brand-100" : "text-gray-400 dark:text-gray-500")}>
                          {format(d, 'MMM')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Vertical divider */}
                <div className="w-[1px] h-12 bg-gray-200 dark:bg-gray-800 mx-2 shrink-0" />

                {/* Floor dropdown selector on the right */}
                <div className="w-[42%] shrink-0 pl-2">
                  <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                    <select
                      value={selectedFloorId}
                      onChange={e => setSelectedFloorId(e.target.value)}
                      className="w-full bg-transparent border-0 py-3 pl-3.5 pr-9 text-xs font-bold text-gray-850 dark:text-gray-200 focus:outline-none focus:ring-0 appearance-none cursor-pointer"
                    >
                      {floorsToDisplay.map(f => (
                        <option key={f.id} value={f.id} className="bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                      <ChevronRight className="w-4 h-4 transform rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Heading and Category Buttons */}
              <div className="pt-1.5">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Choose Category</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select the type of workspace resource you need for the day.</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { type: 'desk' as ResourceTab, icon: <Laptop className="w-5 h-5" />, label: 'Hot Desk', desc: 'Workstations & standing desks' },
                  { type: 'room' as ResourceTab, icon: <Users className="w-5 h-5" />, label: 'Meeting Room', desc: 'Conference rooms & boxes' },
                  { type: 'parking' as ResourceTab, icon: <Car className="w-5 h-5" />, label: 'Parking Space', desc: 'EV or standard parking bays' },
                  { type: 'locker' as ResourceTab, icon: <Lock className="w-5 h-5" />, label: 'Storage Locker', desc: 'Secure local lock-boxes' },
                ].map(({ type, icon, label, desc }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setResourceType(type); setSelectedResourceId(''); }}
                    className={cn(
                      'flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all text-left group cursor-pointer',
                      resourceType === type 
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-750 dark:text-brand-400' 
                        : 'border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 text-gray-650 dark:text-gray-200 hover:bg-gray-50/20 dark:hover:bg-gray-900/60',
                    )}
                  >
                    <div className={cn('p-2.5 rounded-xl border transition-colors shrink-0', 
                      resourceType === type 
                        ? 'bg-white dark:bg-gray-900 border-brand-200 dark:border-brand-900/40 text-brand-500 dark:text-brand-400' 
                        : 'bg-gray-50 dark:bg-gray-900/70 border-gray-150/40 dark:border-gray-700/70 text-gray-450 dark:text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-100'
                    )}>
                      {icon}
                    </div>
                    <div>
                      <div className="font-bold text-xs">{label}</div>
                      <div className="text-[10px] text-gray-400 dark:text-gray-400 mt-1">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Step 2: Resource Selection */}
        {step === 'resource' && (
          <div className="space-y-4">
            
            {/* A. Floor Map selection for Desk */}
            {resourceType === 'desk' && selectedFloor && (
              <>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Click on a desk on the grid map</p>
                </div>
                <div className="h-[420px] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
                  <FloorMap
                    floor={selectedFloor}
                    onDeskClick={handleDeskClick}
                    selectedDeskId={selectedResourceId}
                    highlightAvailable
                    date={date}
                  />
                </div>
              </>
            )}

            {/* B. List view selectors for Rooms */}
            {resourceType === 'room' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Select Available Room</p>
                <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {rooms.filter(r => r.floorId === selectedFloorId && r.isActive).map(room => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedResourceId(room.id)}
                      className={cn(
                        'flex items-center justify-between gap-4 p-4 rounded-xl border text-left transition-all hover:bg-gray-50/50 dark:hover:bg-gray-900/20',
                        selectedResourceId === room.id 
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-850 dark:text-brand-400 shadow-sm' 
                          : 'border-gray-200 dark:border-gray-800/80',
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-gray-950 dark:text-white truncate">{room.name}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-semibold">{getRoomTypeLabel(room.type)} · Up to {room.capacity} people</div>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {room.amenities.map(a => (
                            <span key={a} className="text-[9px] font-bold bg-gray-50 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/60 rounded px-1.5 py-0.5 text-gray-500 dark:text-gray-400">{a.replace('_', ' ')}</span>
                          ))}
                        </div>
                      </div>
                      <div className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0', room.status === 'available' ? 'bg-green-150 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400')}>
                        {room.status === 'available' ? 'Available' : 'Busy'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* C. Grid cells for Parking Spaces */}
            {resourceType === 'parking' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Select Parking Slot</p>
                <div className="grid grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {parkingSpaces.filter(p => p.floorId === selectedFloorId && p.isActive).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => p.status === 'available' && setSelectedResourceId(p.id)}
                      disabled={p.status !== 'available'}
                      className={cn(
                        'p-3.5 rounded-xl border text-center transition-all',
                        selectedResourceId === p.id 
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 shadow-sm' 
                          : '',
                        p.status === 'available' 
                          ? 'border-gray-200 dark:border-gray-800 hover:border-brand-400 cursor-pointer hover:bg-gray-50/30 dark:hover:bg-gray-900/60' 
                          : 'border-gray-100 dark:border-gray-900 opacity-40 cursor-not-allowed',
                      )}
                    >
                      <Car className="w-5 h-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{p.label}</div>
                      <div className="text-[9px] text-gray-450 dark:text-gray-500 capitalize truncate mt-0.5">{p.type.replace('_', ' ')}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* D. Grid cells for Storage Lockers */}
            {resourceType === 'locker' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Select Storage Locker</p>
                <div className="grid grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {lockers.filter(l => l.floorId === selectedFloorId && l.isActive).map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => l.status === 'available' && setSelectedResourceId(l.id)}
                      disabled={l.status !== 'available'}
                      className={cn(
                        'p-3.5 rounded-xl border text-center transition-all',
                        selectedResourceId === l.id 
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 shadow-sm' 
                          : '',
                        l.status === 'available' 
                          ? 'border-gray-200 dark:border-gray-800 hover:border-brand-400 cursor-pointer hover:bg-gray-50/30 dark:hover:bg-gray-900/60' 
                          : 'border-gray-100 dark:border-gray-900 opacity-40 cursor-not-allowed',
                      )}
                    >
                      <Lock className="w-5 h-5 mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{l.label}</div>
                      <div className="text-[9px] text-gray-450 dark:text-gray-500 capitalize truncate mt-0.5">{l.size} Size</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Time Scheduling */}
        {step === 'time' && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Configure Schedule</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set the booking timeframe parameters and recurrence schedule.</p>
            </div>
            
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Duration Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'full_day', label: 'Full Day', start: '09:00', end: '17:00' },
                  { id: 'half_day_am', label: 'Morning (AM)', start: '09:00', end: '13:00' },
                  { id: 'half_day_pm', label: 'Afternoon (PM)', start: '13:00', end: '17:00' },
                  { id: 'custom', label: 'Custom Time', start: '09:00', end: '17:00' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setBookingDurationType(opt.id as any);
                      if (opt.id !== 'custom') {
                        setStartTime(opt.start);
                        setEndTime(opt.end);
                      }
                    }}
                    className={cn(
                      'py-3 px-2 border rounded-xl text-center transition-all shadow-sm flex flex-col items-center justify-center gap-0.5 min-h-[68px] cursor-pointer',
                      bookingDurationType === opt.id
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 font-bold'
                        : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/60 text-gray-650 dark:text-gray-300'
                    )}
                  >
                    <span className="text-[11px] uppercase tracking-wider font-extrabold">{opt.label}</span>
                    {opt.id !== 'custom' ? (
                      <span className={cn(
                        "text-[10px] font-bold mt-0.5",
                        bookingDurationType === opt.id ? "text-brand-600 dark:text-brand-400" : "text-gray-400 dark:text-gray-500"
                      )}>
                        {opt.start} – {opt.end}
                      </span>
                    ) : (
                      <span className={cn(
                        "text-[10px] font-bold mt-0.5",
                        bookingDurationType === opt.id ? "text-brand-600 dark:text-brand-400" : "text-gray-450 dark:text-gray-500"
                      )}>
                        {bookingDurationType === 'custom' ? `${startTime} – ${endTime}` : 'Select range'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {bookingDurationType === 'custom' && (
              <div className="grid grid-cols-2 gap-4.5 p-3 rounded-xl bg-gray-50/40 dark:bg-gray-900/20 border border-gray-150/40 dark:border-gray-800/40 animate-fade-in">
                <Select 
                  label="Start Time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)}
                  options={MOCK_TIME_SLOTS.map(t => ({ value: t, label: t }))}
                />
                <Select 
                  label="End Time" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)}
                  options={MOCK_TIME_SLOTS.filter(t => t > startTime).map(t => ({ value: t, label: t }))}
                />
              </div>
            )}

            <Input label="Title (optional)" placeholder="e.g. Focus work, Team sync..." value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea label="Notes (optional)" placeholder="Any special notes or facilities assistance needed..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            
            {/* Recurring toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-150/40 dark:border-gray-800/40 rounded-xl">
              <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded text-brand-500 focus:ring-brand-400 shrink-0" />
              <label htmlFor="recurring" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Recurring Reservation</label>
              {isRecurring && (
                <Select 
                  value={recurringPattern} 
                  onChange={e => setRecurringPattern(e.target.value)}
                  className="ml-auto w-32"
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'biweekly', label: 'Bi-weekly' },
                    { value: 'monthly', label: 'Monthly' },
                  ]}
                />
              )}
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {step === 'confirm' && resource && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Review Booking Details</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please confirm that your reservation schedule and seat selection are correct.</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-150/40 dark:border-gray-800/60 rounded-2xl p-4.5 space-y-4 shadow-sm">
              <Detail icon={<span className="text-lg">📍</span>} label={`${'label' in resource ? resource.label : ('name' in resource ? resource.name : '')}`} sublabel={selectedFloor.name} />
              <Detail icon={<Calendar className="w-4.5 h-4.5 text-brand-500" />} label={formatDate(date)} />
              <Detail icon={<Clock className="w-4.5 h-4.5 text-brand-500" />} label={`${startTime} – ${endTime}`} />
              {title && <Detail icon={<span>📝</span>} label={title} />}
              {isRecurring && <Detail icon={<span>🔄</span>} label={`Repeats ${recurringPattern}`} />}
            </div>
            {notes && (
              <div className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3.5 leading-relaxed">
                <strong>Special Notes:</strong> {notes}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function Detail({ icon, label, sublabel }: { icon: React.ReactNode; label: string; sublabel?: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-9 h-9 bg-white dark:bg-gray-950 rounded-xl border border-gray-200/60 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate">{label}</div>
        {sublabel && <div className="text-[10px] text-gray-400 dark:text-gray-550 mt-0.5 truncate">{sublabel}</div>}
      </div>
    </div>
  );
}
