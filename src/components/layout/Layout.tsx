import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export function Layout() {
  const { sidebarOpen } = useAppStore();
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={cn('flex flex-col flex-1 min-w-0 transition-all duration-300', sidebarOpen ? 'ml-56' : 'ml-16')}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
