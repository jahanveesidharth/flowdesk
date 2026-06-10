import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { DatabaseSync } from './DatabaseSync';

export function Layout() {
  const { sidebarOpen, theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen bg-[#f6f7f9] text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <DatabaseSync />
      <Sidebar />
      <div className={cn('flex flex-col flex-1 min-w-0 transition-all duration-300', sidebarOpen ? 'ml-56' : 'ml-16')}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
