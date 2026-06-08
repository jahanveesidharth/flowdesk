/**
 * Supabase data hooks – used when VITE_SUPABASE_URL is configured.
 * The app falls back to Zustand mock store when not configured (demo mode).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RealtimeChannel, Session } from '@supabase/supabase-js';

// ─── Generic fetch hook ───────────────────────────────────────────────────────

function useFetch<T>(queryFn: () => Promise<{ data: T | null; error: any }>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    setLoading(true);
    const { data: result, error: err } = await queryFn();
    if (err) setError(String(err));
    else setData(result);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signInMagicLink = (email: string) =>
    supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/dashboard' } });

  const signUp = (email: string, password: string, name: string) =>
    supabase.auth.signUp({ email, password, options: { data: { name } } });

  const signOut = () => supabase.auth.signOut();

  return { session, loading, signIn, signInMagicLink, signUp, signOut };
}

// ─── Floors ───────────────────────────────────────────────────────────────────

export function useFloors() {
  return useFetch<any[]>(
    () => (supabase.from('floors').select('*, zones(*)').eq('is_active', true).order('level') as any),
    []
  );
}

// ─── Desks ────────────────────────────────────────────────────────────────────

export function useDesks(floorId?: string) {
  return useFetch<any[]>(
    () => {
      let q: any = supabase.from('desks').select('*').eq('is_active', true);
      if (floorId) q = q.eq('floor_id', floorId);
      return q.order('label');
    },
    [floorId]
  );
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export function useRooms(floorId?: string) {
  return useFetch<any[]>(
    () => {
      let q: any = supabase.from('rooms').select('*').eq('is_active', true);
      if (floorId) q = q.eq('floor_id', floorId);
      return q.order('name');
    },
    [floorId]
  );
}

// ─── Bookings with Realtime ───────────────────────────────────────────────────

export function useBookings(date?: string, userId?: string) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    let q: any = supabase
      .from('bookings')
      .select('*, profiles(name, department, avatar_url)')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    if (date)   q = q.eq('date', date);
    if (userId) q = q.eq('user_id', userId);
    const { data } = await q;
    setBookings(data || []);
    setLoading(false);
  }, [date, userId]);

  useEffect(() => {
    load();
    if (!isSupabaseConfigured()) return;
    const channel: RealtimeChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { bookings, loading, refetch: load };
}

// ─── Current User Profile ─────────────────────────────────────────────────────

export function useProfile(userId?: string) {
  return useFetch<any>(
    () => (supabase.from('profiles').select('*').eq('id', userId || '').single() as any),
    [userId]
  );
}

// ─── All Profiles (for team view / admin) ────────────────────────────────────

export function useProfiles() {
  return useFetch<any[]>(
    () => (supabase.from('profiles').select('*').order('name') as any),
    []
  );
}

// ─── Notifications with Realtime ─────────────────────────────────────────────

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured() || !userId) { setLoading(false); return; }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
    if (!isSupabaseConfigured() || !userId) return;
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load, userId]);

  return { notifications, loading, refetch: load };
}

// ─── Booking CRUD ─────────────────────────────────────────────────────────────

// Use untyped client for mutations — the Database generic makes update() payloads resolve to `never`
const db = supabase as any;

export const bookingApi = {
  create: async (booking: Record<string, any>) => {
    const { data, error } = await db.from('bookings').insert(booking).select().single();
    if (error) throw error;
    return data;
  },
  cancel: async (bookingId: string, reason?: string) => {
    const { error } = await db.from('bookings').update({ status: 'cancelled', cancel_reason: reason }).eq('id', bookingId);
    if (error) throw error;
  },
  checkIn: async (bookingId: string) => {
    const now = new Date().toTimeString().slice(0, 5);
    const { error } = await db.from('bookings').update({ status: 'checked_in', check_in_time: now }).eq('id', bookingId);
    if (error) throw error;
  },
  checkOut: async (bookingId: string) => {
    const now = new Date().toTimeString().slice(0, 5);
    const { error } = await db.from('bookings').update({ status: 'completed', check_out_time: now }).eq('id', bookingId);
    if (error) throw error;
  },
};

// ─── Resource admin ───────────────────────────────────────────────────────────

export const resourceApi = {
  updateDesk: (id: string, updates: Record<string, any>) => db.from('desks').update(updates).eq('id', id),
  updateRoom:  (id: string, updates: Record<string, any>) => db.from('rooms').update(updates).eq('id', id),
  createDesk:  (desk: Record<string, any>)                => db.from('desks').insert(desk).select().single(),
  deleteDesk:  (id: string)                               => db.from('desks').update({ is_active: false }).eq('id', id),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifApi = {
  markRead:    (id: string)     => db.from('notifications').update({ read: true }).eq('id', id),
  markAllRead: (userId: string) => db.from('notifications').update({ read: true }).eq('user_id', userId),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function fetchOccupancyStats(days = 30) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const { data } = await supabase
    .from('bookings')
    .select('date, resource_type, status, floor_id')
    .gte('date', from.toISOString().split('T')[0])
    .neq('status', 'cancelled');
  return data || [];
}

export async function fetchFloorOccupancy(floorId: string, date: string) {
  const [d1, d2] = await Promise.all([
    supabase.from('desks').select('id').eq('floor_id', floorId).eq('is_active', true),
    supabase.from('bookings').select('resource_id').eq('floor_id', floorId).eq('date', date).eq('resource_type', 'desk').neq('status', 'cancelled'),
  ]);
  const total  = d1.data?.length  || 0;
  const booked = d2.data?.length  || 0;
  return { total, booked, rate: total > 0 ? Math.round((booked / total) * 100) : 0 };
}
