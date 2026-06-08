-- ═══════════════════════════════════════════════════════════════════════════
-- DeskFlow – Row Level Security (RLS) Policies
-- These ensure users can ONLY see/modify data they're allowed to.
-- Run AFTER 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table profiles         enable row level security;
alter table buildings        enable row level security;
alter table floors           enable row level security;
alter table zones            enable row level security;
alter table desks            enable row level security;
alter table rooms            enable row level security;
alter table parking_spaces   enable row level security;
alter table lockers          enable row level security;
alter table teams            enable row level security;
alter table bookings         enable row level security;
alter table waitlist         enable row level security;
alter table notifications    enable row level security;
alter table booking_policies enable row level security;

-- Helper: get current user's role
create or replace function get_my_role()
returns user_role language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- Helper: is current user admin or manager?
create or replace function is_admin_or_manager()
returns boolean language sql stable security definer as $$
  select get_my_role() in ('admin', 'manager')
$$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- Everyone can read all profiles (needed for team views)
-- Users can only update their own profile
-- Admins can update any profile

create policy "profiles_select_all" on profiles
  for select using (auth.uid() is not null);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

create policy "profiles_update_admin" on profiles
  for update using (get_my_role() = 'admin');

-- ─── BUILDINGS ───────────────────────────────────────────────────────────────
-- Everyone authenticated can read
-- Only admins can write

create policy "buildings_select" on buildings
  for select using (auth.uid() is not null);

create policy "buildings_admin_write" on buildings
  for all using (get_my_role() = 'admin');

-- ─── FLOORS ──────────────────────────────────────────────────────────────────

create policy "floors_select" on floors
  for select using (auth.uid() is not null);

create policy "floors_admin_write" on floors
  for all using (get_my_role() = 'admin');

-- ─── ZONES ───────────────────────────────────────────────────────────────────

create policy "zones_select" on zones
  for select using (auth.uid() is not null);

create policy "zones_admin_write" on zones
  for all using (get_my_role() = 'admin');

-- ─── DESKS ───────────────────────────────────────────────────────────────────

create policy "desks_select" on desks
  for select using (auth.uid() is not null);

create policy "desks_admin_write" on desks
  for all using (get_my_role() = 'admin');

-- ─── ROOMS ───────────────────────────────────────────────────────────────────

create policy "rooms_select" on rooms
  for select using (auth.uid() is not null);

create policy "rooms_admin_write" on rooms
  for all using (get_my_role() = 'admin');

-- ─── PARKING SPACES ──────────────────────────────────────────────────────────

create policy "parking_select" on parking_spaces
  for select using (auth.uid() is not null);

create policy "parking_admin_write" on parking_spaces
  for all using (get_my_role() = 'admin');

-- ─── LOCKERS ─────────────────────────────────────────────────────────────────

create policy "lockers_select" on lockers
  for select using (auth.uid() is not null);

create policy "lockers_admin_write" on lockers
  for all using (get_my_role() = 'admin');

-- ─── TEAMS ───────────────────────────────────────────────────────────────────

create policy "teams_select" on teams
  for select using (auth.uid() is not null);

create policy "teams_admin_write" on teams
  for all using (get_my_role() in ('admin', 'manager'));

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────
-- Users see all bookings (to check availability), but can only create/edit their own.
-- Admins can do everything.

create policy "bookings_select_all" on bookings
  for select using (auth.uid() is not null);

create policy "bookings_insert_own" on bookings
  for insert with check (auth.uid() = user_id);

create policy "bookings_update_own" on bookings
  for update using (auth.uid() = user_id);

create policy "bookings_admin_all" on bookings
  for all using (get_my_role() in ('admin', 'manager'));

-- ─── WAITLIST ────────────────────────────────────────────────────────────────

create policy "waitlist_select_own" on waitlist
  for select using (auth.uid() = user_id or get_my_role() in ('admin', 'manager'));

create policy "waitlist_insert_own" on waitlist
  for insert with check (auth.uid() = user_id);

create policy "waitlist_delete_own" on waitlist
  for delete using (auth.uid() = user_id or get_my_role() = 'admin');

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
-- Users only see their own notifications

create policy "notifs_select_own" on notifications
  for select using (auth.uid() = user_id);

create policy "notifs_update_own" on notifications
  for update using (auth.uid() = user_id);

create policy "notifs_admin_insert" on notifications
  for insert with check (
    auth.uid() = user_id or get_my_role() = 'admin'
  );

-- ─── BOOKING POLICIES ────────────────────────────────────────────────────────

create policy "policy_select_all" on booking_policies
  for select using (auth.uid() is not null);

create policy "policy_admin_write" on booking_policies
  for all using (get_my_role() = 'admin');
