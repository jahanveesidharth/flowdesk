import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { generateQrSvg } from '../../lib/qr';
import { useAppStore } from '../../store/useAppStore';
import type { Booking } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { CheckCircle, Clock, MapPin, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface QrCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export function QrCheckInModal({ isOpen, onClose, booking }: QrCheckInModalProps) {
  const { checkIn, floors } = useAppStore();
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [success, setSuccess] = useState(false);

  const floor = floors.find(f => f.id === booking.floorId);
  const qrSvg = generateQrSvg(`deskflow://check-in?bookingId=${booking.id}`);

  useEffect(() => {
    if (!isOpen) {
      setScanning(false);
      setCameraActive(false);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSimulateScan = async () => {
    setScanning(true);
    // Simulate camera scan delay
    await new Promise(r => setTimeout(r, 1500));
    setScanning(false);
    
    try {
      await checkIn(booking.id);
      setSuccess(true);
      toast.success('Check-in successful! Welcome to the office.');
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
    }
  };

  const handleCameraScan = () => {
    setCameraActive(true);
    setScanning(true);
    // Simulate camera detecting QR code
    setTimeout(() => {
      setScanning(false);
      setCameraActive(false);
      checkIn(booking.id).then(() => {
        setSuccess(true);
        toast.success('Check-in successful via camera stream.');
      });
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code Check-in"
      size="sm"
    >
      <div className="flex flex-col items-center py-4 gap-4 text-center text-gray-900 dark:text-gray-100">
        {/* Booking details */}
        <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 text-left space-y-1.5">
          <div className="text-xs font-semibold text-brand-500 uppercase">Resource Booking</div>
          <div className="text-sm font-bold text-gray-900 dark:text-white capitalize">
            {booking.resourceType} {booking.resourceId.split('-').pop()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(booking.date)}, {booking.startTime} – {booking.endTime}</span>
          </div>
          {floor && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{floor.name}</span>
            </div>
          )}
        </div>

        {/* QR Scanner/Display target */}
        <div className="relative w-48 h-48 bg-white border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-3.5 flex items-center justify-center overflow-hidden">
          {success ? (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <span className="text-xs font-bold text-green-600 dark:text-green-400">Checked In</span>
            </div>
          ) : cameraActive ? (
            // Mock video feed scanner
            <div className="relative w-full h-full bg-gray-950 rounded-lg flex items-center justify-center border border-gray-800">
              <Camera className="w-8 h-8 text-gray-700 animate-pulse" />
              <div className="absolute top-2 left-2 text-[8px] text-green-400 font-mono">SCANNING CAM_1...</div>
              {/* Scan beam line */}
              <div className="absolute left-0 w-full h-0.5 bg-green-500 shadow-[0_0_8px_#22c55e] animate-[bounce_2s_infinite]" style={{ top: '10%' }} />
            </div>
          ) : (
            // Standard QR display
            <div 
              className={cn("w-full h-full transition-all", scanning && "blur-sm opacity-50")}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          )}

          {scanning && !cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 dark:bg-black/60 backdrop-blur-xs">
              <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Scanning...</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!success && (
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
            Scan this QR code at the desk terminal, or use the simulation triggers below to complete your check-in.
          </p>
        )}

        {/* Action Panel */}
        <div className="flex flex-col gap-2 w-full pt-2">
          {booking.status === 'confirmed' && !success && (
            <>
              <Button 
                onClick={handleSimulateScan}
                loading={scanning && !cameraActive}
                className="w-full"
                variant="primary"
              >
                Simulate Reader Scan
              </Button>
              <Button 
                onClick={handleCameraScan}
                loading={scanning && cameraActive}
                className="w-full"
                variant="outline"
                iconLeft={<Camera className="w-4 h-4" />}
              >
                Scan with Camera
              </Button>
            </>
          )}
          {booking.status === 'checked_in' || success ? (
            <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-lg py-2">
              <CheckCircle className="w-4 h-4" /> Check-in Completed
            </div>
          ) : booking.status !== 'confirmed' ? (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg py-2">
              <AlertCircle className="w-4 h-4" /> Status: {booking.status}
            </div>
          ) : null}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
