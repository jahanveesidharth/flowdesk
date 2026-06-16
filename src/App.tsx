import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { type ReactNode, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/layout/AuthGuard';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { FloorMapPage } from './pages/FloorMapPage';
import { MyBookings } from './pages/MyBookings';
import { ParkingLockers } from './pages/ParkingLockers';
import { TeamPage } from './pages/TeamPage';
import { MyWeek } from './pages/MyWeek';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FloorBuilder } from './pages/admin/FloorBuilder';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminUsers } from './pages/admin/AdminUsers';
import { Analytics } from './pages/admin/Analytics';
import { AdminPolicies } from './pages/admin/AdminPolicies';
import { AdminSettings } from './pages/admin/AdminSettings';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

function CheckInWatcher() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { checkIn } = useAppStore();

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

  return null;
}

function RoleRoute({ allow, children }: { allow: Array<'admin' | 'manager' | 'employee'>; children: ReactNode }) {
  const role = useAppStore(s => s.currentUser.role);
  if (!allow.includes(role)) {
    return <Navigate to={role === 'employee' ? '/dashboard' : '/admin/dashboard'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <CheckInWatcher />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Protected — wrapped in AuthGuard */}
        <Route element={<AuthGuard><Layout /></AuthGuard>}>
          {/* Employee routes */}
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/floor-map"       element={<FloorMapPage />} />
          <Route path="/my-bookings"     element={<MyBookings />} />
          <Route path="/parking-lockers" element={<ParkingLockers />} />
          <Route path="/team"            element={<TeamPage />} />
          <Route path="/my-week"         element={<MyWeek />} />
          <Route path="/notifications"   element={<NotificationsPage />} />
          <Route path="/settings"        element={<SettingsPage />} />
          {/* Admin routes */}
          <Route path="/admin/dashboard"     element={<RoleRoute allow={['admin', 'manager']}><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/floor-builder" element={<RoleRoute allow={['admin', 'manager']}><FloorBuilder /></RoleRoute>} />
          <Route path="/admin/bookings"      element={<RoleRoute allow={['admin', 'manager']}><AdminBookings /></RoleRoute>} />
          <Route path="/admin/users"         element={<RoleRoute allow={['admin', 'manager']}><AdminUsers /></RoleRoute>} />
          <Route path="/admin/analytics"     element={<RoleRoute allow={['admin', 'manager']}><Analytics /></RoleRoute>} />
          <Route path="/admin/policies"      element={<RoleRoute allow={['admin']}><AdminPolicies /></RoleRoute>} />
          <Route path="/admin/settings"      element={<RoleRoute allow={['admin']}><AdminSettings /></RoleRoute>} />
          <Route path="*"                    element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
          success: { iconTheme: { primary: '#f04a16', secondary: 'white' } },
        }}
      />
    </BrowserRouter>
  );
}
