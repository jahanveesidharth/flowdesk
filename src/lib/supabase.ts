import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
  console.warn(
    '⚠️  Supabase not configured. Running in mock/demo mode.\n' +
    '   Copy .env.example → .env.local and fill in your Supabase credentials.\n' +
    '   See SETUP.md for step-by-step instructions.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder',
  {
    auth: {
      persistSession:  true,
      autoRefreshToken: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);

export const isSupabaseConfigured = () =>
  !!supabaseUrl && !supabaseUrl.includes('your-project-ref');
