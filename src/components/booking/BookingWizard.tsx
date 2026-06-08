import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select, Input, Textarea } from '../ui/Input';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_TIME_SLOTS } from '../../data/mockData';
import { FloorMap } from '../floormap/FloorMap';
import type { Desk, Room, ParkingSpace, Locker } from '../../types';
import { cn, formatDate, getDeskTypeLabel, getRoomTypeLabel } from '../../lib/utils';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, MapPin, Clock, Calendar, ChevronRight, ChevronLeft, Users, Car, Lock } from 'lucide-react';

type ResourceTab = 'desk' | 'room' | 'parking' | 'locker';
type Step = 'type' | 'resource' | 'time' | 'confirm';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  prefillDeskId?: string;
  prefillDate?: string;
  prefillFloorId?: string;
}

export function BookingWizard({ isOpen, onClose, prefillDeskId, prefillDate, prefillFloorId }: BookingWizardProps) {
  const { floors, desks, rooms, parkingSpaces, lockers, addBooking, currentUser, selectedDate, getDeskAvailability } = useAppStore();

  const [step, setStep] = useState<Step>('type');
  const [resourceType, setResourceType] = useState<ResourceTab>('desk');
  const [selectedFloorId, setSelectedFloorId] = useState(prefillFloorId || 'f1');
  const [selectedResourceId, setSelectedResourceId] = useState<string>(prefillDeskId || '');
  const [date, setDate] = useState(prefillDate || selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

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

  if (complete) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center py-6 gap-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Booking Confirmed!</h3>
            <p className="text-sm text-gray-500">
              Your {resourceType} has been booked for {formatDate(date)}, {startTime}–{endTime}.
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 w-full text-left space-y-2">
            <Detail icon={<Calendar className="w-4 h-4" />} label={formatDate(date)} />
            <Detail icon={<Clock className="w-4 h-4" />} label={`${startTime} – ${endTime}`} />
            <Detail icon={<MapPin className="w-4 h-4" />} label={selectedFloor.name} />
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Done</Button>
            <Button className="flex-1" onClick={() => { handleClose(); }}>View Bookings</Button>
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
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[1,2,3,4].map(s => (
              <div key={s} className={cn('w-2 h-2 rounded-full transition-all', s === stepNum ? 'bg-brand-500 w-6' : s < stepNum ? 'bg-brand-300' : 'bg-gray-200')} />
            ))}
          </div>
          <div className="flex gap-3">
            {step !== 'type' && (
              <Button variant="outline" size="sm" iconLeft={<ChevronLeft className="w-4 h-4" />}
                onClick={() => {
                  if (step === 'resource') setStep('type');
                  if (step === 'time') setStep('resource');
                  if (step === 'confirm') setStep('time');
                }}
              >Back</Button>
            )}
            {step !== 'confirm' ? (
              <Button size="sm" iconRight={<ChevronRight className="w-4 h-4" />}
                disabled={!canProceed()}
                onClick={() => {
                  if (step === 'type') setStep('resource');
                  if (step === 'resource') setStep('time');
                  if (step === 'time') setStep('confirm');
                }}
              >
                {step === 'resource' && !selectedResourceId ? 'Select a resource' : 'Continue'}
              </Button>
            ) : (
              <Button size="sm" loading={loading} onClick={handleSubmit} iconLeft={<CheckCircle className="w-4 h-4" />}>
                Confirm Booking
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Step 1: Type */}
      {step === 'type' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">What would you like to book?</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'desk' as ResourceTab, icon: <Users className="w-6 h-6" />, label: 'Desk', desc: 'Hot desk, standing, quiet' },
              { type: 'room' as ResourceTab, icon: <Users className="w-6 h-6" />, label: 'Meeting Room', desc: 'Conference, boardroom, focus' },
              { type: 'parking' as ResourceTab, icon: <Car className="w-6 h-6" />, label: 'Parking', desc: 'Standard, EV, accessible' },
              { type: 'locker' as ResourceTab, icon: <Lock className="w-6 h-6" />, label: 'Locker', desc: 'Small, medium, large' },
            ].map(({ type, icon, label, desc }) => (
              <button
                key={type}
                onClick={() => { setResourceType(type); setSelectedResourceId(''); }}
                className={cn(
                  'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-center',
                  resourceType === type ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-gray-300 text-gray-600',
                )}
              >
                <div className={cn('p-3 rounded-xl', resourceType === type ? 'bg-brand-100' : 'bg-gray-100')}>
                  {icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
            />
            <Select label="Floor" value={selectedFloorId} onChange={e => setSelectedFloorId(e.target.value)}
              options={floors.filter(f => f.isActive).map(f => ({ value: f.id, label: f.name }))}
            />
          </div>
        </div>
      )}

      {/* Step 2: Resource selection */}
      {step === 'resource' && (
        <div className="space-y-4">
          {resourceType === 'desk' && selectedFloor && (
            <>
              <p className="text-sm text-gray-500">Click on an available desk on the floor map.</p>
              <div className="h-[400px]">
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
          {resourceType === 'room' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Select a meeting room.</p>
              <div className="grid grid-cols-1 gap-3">
                {rooms.filter(r => r.floorId === selectedFloorId && r.isActive).map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedResourceId(room.id)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      selectedResourceId === room.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{room.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{getRoomTypeLabel(room.type)} · {room.capacity} people</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {room.amenities.map(a => (
                          <span key={a} className="text-xs bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">{a.replace('_', ' ')}</span>
                        ))}
                      </div>
                    </div>
                    <div className={cn('text-xs font-medium px-2 py-1 rounded-full', room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {room.status === 'available' ? 'Available' : 'Busy'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {resourceType === 'parking' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Select a parking space.</p>
              <div className="grid grid-cols-3 gap-2">
                {parkingSpaces.filter(p => p.floorId === selectedFloorId && p.isActive).map(p => (
                  <button
                    key={p.id}
                    onClick={() => p.status === 'available' && setSelectedResourceId(p.id)}
                    disabled={p.status !== 'available'}
                    className={cn(
                      'p-3 rounded-xl border-2 text-center transition-all',
                      selectedResourceId === p.id ? 'border-brand-500 bg-brand-50' : '',
                      p.status === 'available' ? 'border-gray-200 hover:border-brand-400 cursor-pointer' : 'border-gray-100 opacity-50 cursor-not-allowed',
                    )}
                  >
                    <Car className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-xs font-bold text-gray-800">{p.label}</div>
                    <div className="text-xs text-gray-400 capitalize">{p.type.replace('_', ' ')}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {resourceType === 'locker' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Select a locker.</p>
              <div className="grid grid-cols-4 gap-2">
                {lockers.filter(l => l.floorId === selectedFloorId && l.isActive).map(l => (
                  <button
                    key={l.id}
                    onClick={() => l.status === 'available' && setSelectedResourceId(l.id)}
                    disabled={l.status !== 'available'}
                    className={cn(
                      'p-3 rounded-xl border-2 text-center transition-all',
                      selectedResourceId === l.id ? 'border-brand-500 bg-brand-50' : '',
                      l.status === 'available' ? 'border-gray-200 hover:border-brand-400 cursor-pointer' : 'border-gray-100 opacity-50 cursor-not-allowed',
                    )}
                  >
                    <Lock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-xs font-bold text-gray-800">{l.label}</div>
                    <div className="text-xs text-gray-400 capitalize">{l.size}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Time */}
      {step === 'time' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">Choose your booking time.</p>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Start Time" value={startTime} onChange={e => setStartTime(e.target.value)}
              options={MOCK_TIME_SLOTS.map(t => ({ value: t, label: t }))}
            />
            <Select label="End Time" value={endTime} onChange={e => setEndTime(e.target.value)}
              options={MOCK_TIME_SLOTS.filter(t => t > startTime).map(t => ({ value: t, label: t }))}
            />
          </div>
          <Input label="Title (optional)" placeholder="e.g. Focus work, Team meeting..." value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea label="Notes (optional)" placeholder="Any special requirements..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">Recurring booking</label>
            {isRecurring && (
              <Select value={recurringPattern} onChange={e => setRecurringPattern(e.target.value)}
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

      {/* Step 4: Confirm */}
      {step === 'confirm' && resource && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Review your booking details.</p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <Detail icon={<span className="text-lg">📍</span>} label={`${'label' in resource ? resource.label : ('name' in resource ? resource.name : '')}`} sublabel={selectedFloor.name} />
            <Detail icon={<Calendar className="w-4 h-4 text-brand-500" />} label={formatDate(date)} />
            <Detail icon={<Clock className="w-4 h-4 text-brand-500" />} label={`${startTime} – ${endTime}`} />
            {title && <Detail icon={<span>📝</span>} label={title} />}
            {isRecurring && <Detail icon={<span>🔄</span>} label={`Repeats ${recurringPattern}`} />}
          </div>
          {notes && <div className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3">{notes}</div>}
        </div>
      )}
    </Modal>
  );
}

function Detail({ icon, label, sublabel }: { icon: React.ReactNode; label: string; sublabel?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
      </div>
    </div>
  );
}
