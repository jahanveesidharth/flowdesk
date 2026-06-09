import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // When Supabase isn't configured, check local demo session
    if (!isSupabaseConfigured()) {
      const isDemoLoggedIn = localStorage.getItem('flowdesk_demo_logged_in') === 'true';
      setAuthed(isDemoLoggedIn);
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthed(!!session);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
