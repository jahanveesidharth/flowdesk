import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { generateQrSvg } from '../../lib/qr';
import { useAppStore } from '../../store/useAppStore';
import type { Booking } from '../../types';
import { cn, formatDate } from '../../lib/utils';
import { CheckCircle, Clock, MapPin, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';

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
  const qrSvg = useMemo(
    () => generateQrSvg(`${window.location.origin}/dashboard?checkin=${booking.id}`),
    [booking.id],
  );

  useEffect(() => {
    if (!isOpen) {
      setScanning(false);
      setCameraActive(false);
      setSuccess(false);
    }
  }, [isOpen]);

  // Real Camera QR Code Scanner Hook
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (cameraActive) {
      // Small timeout to guarantee element is fully mounted in DOM first
      const startScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode('qr-reader');
          await html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 150, height: 150 },
            },
            (decodedText) => {
              // Successfully decoded
              let checkinId = '';
              try {
                const url = new URL(decodedText);
                checkinId = url.searchParams.get('checkin') || url.searchParams.get('bookingId') || '';
              } catch (e) {
                checkinId = decodedText;
              }

              if (checkinId === booking.id) {
                html5QrCode?.stop().then(() => {
                  setCameraActive(false);
                  setScanning(false);
                  checkIn(booking.id)
                    .then(() => {
                      setSuccess(true);
                      toast.success('Check-in successful via QR scan!');
                    })
                    .catch((err) => toast.error(err.message || 'Check-in failed'));
                }).catch(err => console.error(err));
              } else {
                toast.error('Scanned QR code does not match this booking.');
              }
            },
            () => {
              // Verbose error callback ignored for performance
            }
          );
        } catch (err: any) {
          console.error('Failed to start camera scanner:', err);
          toast.error('Unable to start camera scanner. Please verify camera permissions.');
          setCameraActive(false);
          setScanning(false);
        }
      };

      const timer = setTimeout(startScanner, 100);
      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.error(err));
        }
      };
    }
  }, [cameraActive, booking.id, checkIn]);

  const handleSimulateScan = async () => {
    if (scanning) return;
    setScanning(true);
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
    if (scanning) return;
    setCameraActive(true);
    setScanning(true);
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

        {/* QR Display target */}
        <div className="relative w-48 h-48 bg-white border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-3.5 flex items-center justify-center overflow-hidden">
          {success ? (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <span className="text-xs font-bold text-green-600 dark:text-green-400">Checked In</span>
            </div>
          ) : cameraActive ? (
            // Live web camera stream target container
            <div id="qr-reader" className="w-full h-full bg-black rounded-lg overflow-hidden border border-gray-800" />
          ) : (
            // Standard QR display
            <div
              className={cn("w-full h-full transition-opacity", scanning && "opacity-40")}
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
            Scan this QR code with your mobile phone camera to confirm check-in, or scan the desk QR code using your phone camera.
          </p>
        )}

        {/* Action Panel */}
        <div className="flex flex-col gap-2 w-full pt-2">
          {booking.status === 'confirmed' && !success && (
            <>
              <Button 
                onClick={handleSimulateScan}
                disabled={scanning}
                loading={scanning && !cameraActive}
                className="w-full"
                variant="primary"
              >
                Simulate Reader Scan
              </Button>
              <Button 
                onClick={handleCameraScan}
                disabled={scanning}
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
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-lg py-2">
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
