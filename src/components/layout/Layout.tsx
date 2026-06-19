import { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { DatabaseSync } from './DatabaseSync';
import { BookingStatusWatcher } from '../booking/BookingStatusWatcher';
import toast from 'react-hot-toast';

export function Layout() {
  const { sidebarOpen, mobileSidebarOpen, setMobileSidebarOpen, theme, checkIn } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // QR Code Check-in Watcher
  useEffect(() => {
    const checkinId = searchParams.get('checkin');
    if (checkinId) {
      checkIn(checkinId)
        .then(() => {
          toast.success('Check-in successful from QR code scan!');
        })
        .catch((err: any) => {
          toast.error(err.message || 'Check-in from QR code scan failed');
        })
        .finally(() => {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete('checkin');
          setSearchParams(nextParams, { replace: true });
        });
    }
  }, [searchParams, setSearchParams, checkIn]);

  return (
    <div className="flex h-screen bg-[#f6f7f9] text-gray-900 dark:bg-gray-950 dark:text-gray-100 relative overflow-hidden">
      <DatabaseSync />
      <BookingStatusWatcher />
      
      {/* Mobile Sidebar Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar />
      <div className={cn('flex flex-col flex-1 min-w-0 transition-all duration-300 ml-0', sidebarOpen ? 'md:ml-56' : 'md:ml-16')}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
