import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const demoEmail = process.env.DEMO_EMAIL;
  const demoPassword = process.env.DEMO_PASSWORD;

  if (!supabaseUrl || !supabaseAnonKey || !demoEmail || !demoPassword) {
    return res.status(500).json({ error: 'Demo login is not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (error || !data.session) {
    return res.status(401).json({ error: error?.message || 'Demo login failed' });
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: {
      id: data.user?.id,
      email: data.user?.email,
    },
  });
}
