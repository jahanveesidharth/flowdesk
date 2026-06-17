// Auto-generated types that match the Supabase schema.
// After setting up Supabase, regenerate with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole         = 'employee' | 'manager' | 'admin';
export type DeskTypeDB       = 'hot' | 'fixed' | 'standing' | 'quiet' | 'collaboration';
export type ResourceStatusDB = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'blocked';
export type BookingStatusDB  = 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'no_show' | 'completed';
export type ResourceTypeDB   = 'desk' | 'room' | 'parking' | 'locker';
export type RecurringPatternDB = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type RoomTypeDB       = 'meeting' | 'phone_booth' | 'focus' | 'training' | 'boardroom';
export type ParkingTypeDB    = 'standard' | 'accessible' | 'ev_charging' | 'motorcycle';
export type LockerSizeDB     = 'small' | 'medium' | 'large';
export type NotifTypeDB      = 'booking_confirmed' | 'booking_cancelled' | 'checkin_reminder' | 'waitlist_available' | 'desk_released' | 'policy_update' | 'admin_message';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; name: string; email: string; role: UserRole;
          department: string; team_id: string | null; avatar_url: string | null;
          preferences: Json; created_at: string; updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; name: string; email: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      buildings: {
        Row: { id: string; name: string; address: string; city: string; country: string; timezone: string; is_active: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['buildings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['buildings']['Row']>;
      };
      floors: {
        Row: { id: string; building_id: string; name: string; level: number; grid_width: number; grid_height: number; amenities: string[]; capacity: number; is_active: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['floors']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['floors']['Row']>;
      };
      zones: {
        Row: { id: string; floor_id: string; name: string; color: string; description: string | null; x: number; y: number; width: number; height: number; created_at: string };
        Insert: Omit<Database['public']['Tables']['zones']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['zones']['Row']>;
      };
      desks: {
        Row: { id: string; floor_id: string; zone_id: string | null; label: string; type: DeskTypeDB; status: ResourceStatusDB; x: number; y: number; width: number; height: number; amenities: string[]; notes: string | null; fixed_user_id: string | null; is_active: boolean; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['desks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['desks']['Row']>;
      };
      rooms: {
        Row: { id: string; floor_id: string; name: string; capacity: number; type: RoomTypeDB; status: ResourceStatusDB; amenities: string[]; x: number; y: number; width: number; height: number; image_url: string | null; is_active: boolean; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Row']>;
      };
      parking_spaces: {
        Row: { id: string; floor_id: string; label: string; type: ParkingTypeDB; status: ResourceStatusDB; x: number; y: number; is_active: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['parking_spaces']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['parking_spaces']['Row']>;
      };
      lockers: {
        Row: { id: string; floor_id: string; label: string; size: LockerSizeDB; status: ResourceStatusDB; assigned_user_id: string | null; is_active: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['lockers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['lockers']['Row']>;
      };
      bookings: {
        Row: { id: string; user_id: string; resource_type: ResourceTypeDB; resource_id: string; floor_id: string; building_id: string; date: string; start_time: string; end_time: string; status: BookingStatusDB; title: string | null; notes: string | null; attendee_ids: string[]; check_in_time: string | null; check_out_time: string | null; is_recurring: boolean; recurring_id: string | null; cancel_reason: string | null; created_at: string; updated_at: string; reminder_sent: boolean };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at' | 'reminder_sent'>;
        Update: Partial<Database['public']['Tables']['bookings']['Row']>;
      };
      notifications: {
        Row: { id: string; user_id: string; type: NotifTypeDB; title: string; message: string; read: boolean; booking_id: string | null; action_url: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      waitlist: {
        Row: { id: string; user_id: string; resource_type: ResourceTypeDB; resource_id: string | null; floor_id: string; zone_id: string | null; date: string; start_time: string; end_time: string; position: number; notified: boolean; created_at: string };
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['waitlist']['Row']>;
      };
      booking_policies: {
        Row: { id: string; name: string; max_advance_days: number; max_duration_hours: number; max_concurrent_bookings: number; max_bookings_per_day: number; checkin_window_minutes: number; auto_release_minutes: number; requires_approval: boolean; allow_recurring: boolean; max_recurring_weeks: number; allowed_roles: UserRole[]; resource_types: ResourceTypeDB[]; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['booking_policies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['booking_policies']['Row']>;
      };
      teams: {
        Row: { id: string; name: string; description: string | null; manager_id: string | null; color: string; department: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['teams']['Row']>;
      };
    };
    Functions: {
      get_my_role: { Args: Record<never, never>; Returns: UserRole };
      is_admin_or_manager: { Args: Record<never, never>; Returns: boolean };
      auto_release_no_shows: { Args: Record<never, never>; Returns: void };
    };
  };
}
