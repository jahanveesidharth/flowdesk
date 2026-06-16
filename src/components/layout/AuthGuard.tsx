import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { exitDemoMode, isDemoMode } from '../../lib/demoMode';
import { useAppStore } from '../../store/useAppStore';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const setSelectedDate = useAppStore(s => s.setSelectedDate);

  useEffect(() => {
    const syncLoginDate = () => setSelectedDate(format(new Date(), 'yyyy-MM-dd'));

    if (isDemoMode()) {
      syncLoginDate();
      setAuthed(true);
      setChecking(false);
      return;
    }

    if (isSupabaseConfigured()) {
      exitDemoMode();
    }

    // When Supabase isn't configured, always allow (demo mode)
    if (!isSupabaseConfigured()) {
      syncLoginDate();
      setAuthed(true);
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) syncLoginDate();
      setAuthed(!!session);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) syncLoginDate();
      setAuthed(!!session);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [setSelectedDate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <span className="text-sm">Loading DeskFlow...</span>
        </div>
      </div>
    );
  }

  if (!authed) {
    const search = window.location.search;
    return <Navigate to={`/login${search}`} replace />;
  }
  return <>{children}</>;
}
