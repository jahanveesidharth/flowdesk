-- ═══════════════════════════════════════════════════════════════════════════
-- DeskFlow – Complete Database Schema
-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

create type user_role        as enum ('employee', 'manager', 'admin');
create type desk_type        as enum ('hot', 'fixed', 'standing', 'quiet', 'collaboration');
create type resource_status  as enum ('available', 'occupied', 'reserved', 'maintenance', 'blocked');
create type booking_status   as enum ('confirmed', 'pending', 'cancelled', 'checked_in', 'no_show', 'completed');
create type resource_type    as enum ('desk', 'room', 'parking', 'locker');
create type recurring_pattern as enum ('daily', 'weekly', 'biweekly', 'monthly');
create type room_type        as enum ('meeting', 'phone_booth', 'focus', 'training', 'boardroom');
create type parking_type     as enum ('standard', 'accessible', 'ev_charging', 'motorcycle');
create type locker_size      as enum ('small', 'medium', 'large');
create type notif_type       as enum (
  'booking_confirmed', 'booking_cancelled', 'checkin_reminder',
  'waitlist_available', 'desk_released', 'policy_update', 'admin_message'
);

-- ─── PROFILES (extends Supabase auth.users) ──────────────────────────────────

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  email        text not null,
  role         user_role not null default 'employee',
  department   text not null default 'General',
  team_id      uuid,
  avatar_url   text,
  -- preferences stored as jsonb for flexibility
  preferences  jsonb not null default '{
    "notificationsEnabled": true,
    "emailReminders": true,
    "reminderMinutes": 30,
    "theme": "light",
    "weekStartsOn": 1
  }'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── BUILDINGS ────────────────────────────────────────────────────────────────

create table buildings (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  address    text not null default '',
  city       text not null default '',
  country    text not null default 'US',
  timezone   text not null default 'Asia/Kolkata',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── FLOORS ───────────────────────────────────────────────────────────────────

create table floors (
  id          uuid primary key default uuid_generate_v4(),
  building_id uuid not null references buildings(id) on delete cascade,
  name        text not null,
  level       integer not null default 0,
  grid_width  integer not null default 18,
  grid_height integer not null default 14,
  amenities   text[] not null default '{}',
  capacity    integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── ZONES ────────────────────────────────────────────────────────────────────

create table zones (
  id          uuid primary key default uuid_generate_v4(),
  floor_id    uuid not null references floors(id) on delete cascade,
  name        text not null,
  color       text not null default '#dbeafe',
  description text,
  x           integer not null default 0,
  y           integer not null default 0,
  width       integer not null default 4,
  height      integer not null default 4,
  created_at  timestamptz not null default now()
);

-- ─── DESKS ────────────────────────────────────────────────────────────────────

create table desks (
  id             uuid primary key default uuid_generate_v4(),
  floor_id       uuid not null references floors(id) on delete cascade,
  zone_id        uuid references zones(id) on delete set null,
  label          text not null,
  type           desk_type not null default 'hot',
  status         resource_status not null default 'available',
  x              integer not null,
  y              integer not null,
  width          integer not null default 1,
  height         integer not null default 1,
  amenities      text[] not null default '{}',
  notes          text,
  fixed_user_id  uuid references profiles(id) on delete set null,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── ROOMS ────────────────────────────────────────────────────────────────────

create table rooms (
  id         uuid primary key default uuid_generate_v4(),
  floor_id   uuid not null references floors(id) on delete cascade,
  name       text not null,
  capacity   integer not null default 4,
  type       room_type not null default 'meeting',
  status     resource_status not null default 'available',
  amenities  text[] not null default '{}',
  x          integer not null,
  y          integer not null,
  width      integer not null default 2,
  height     integer not null default 2,
  image_url  text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── PARKING SPACES ───────────────────────────────────────────────────────────

create table parking_spaces (
  id         uuid primary key default uuid_generate_v4(),
  floor_id   uuid not null references floors(id) on delete cascade,
  label      text not null,
  type       parking_type not null default 'standard',
  status     resource_status not null default 'available',
  x          integer not null default 0,
  y          integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── LOCKERS ──────────────────────────────────────────────────────────────────

create table lockers (
  id               uuid primary key default uuid_generate_v4(),
  floor_id         uuid not null references floors(id) on delete cascade,
  label            text not null,
  size             locker_size not null default 'small',
  status           resource_status not null default 'available',
  assigned_user_id uuid references profiles(id) on delete set null,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ─── TEAMS ────────────────────────────────────────────────────────────────────

create table teams (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  manager_id  uuid references profiles(id) on delete set null,
  color       text not null default '#3b82f6',
  department  text not null default 'General',
  created_at  timestamptz not null default now()
);

-- Add team_id FK after teams table exists
alter table profiles add constraint profiles_team_id_fk
  foreign key (team_id) references teams(id) on delete set null;

-- ─── BOOKING POLICIES ─────────────────────────────────────────────────────────

create table booking_policies (
  id                       uuid primary key default uuid_generate_v4(),
  name                     text not null default 'Default Policy',
  max_advance_days         integer not null default 30,
  max_duration_hours       integer not null default 8,
  max_concurrent_bookings  integer not null default 3,
  max_bookings_per_day     integer not null default 2,
  checkin_window_minutes   integer not null default 15,
  auto_release_minutes     integer not null default 30,
  requires_approval        boolean not null default false,
  allow_recurring          boolean not null default true,
  max_recurring_weeks      integer not null default 12,
  allowed_roles            user_role[] not null default '{employee,manager,admin}',
  resource_types           resource_type[] not null default '{desk,room,parking,locker}',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Insert default policy
insert into booking_policies (name) values ('Default Policy');

-- ─── BOOKINGS ─────────────────────────────────────────────────────────────────

create table bookings (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references profiles(id) on delete cascade,
  resource_type  resource_type not null,
  resource_id    uuid not null,  -- polymorphic: points to desk/room/parking/locker
  floor_id       uuid not null references floors(id) on delete cascade,
  building_id    uuid not null references buildings(id) on delete cascade,
  date           date not null,
  start_time     time not null,
  end_time       time not null,
  status         booking_status not null default 'confirmed',
  title          text,
  notes          text,
  attendee_ids   uuid[] not null default '{}',
  check_in_time  time,
  check_out_time time,
  is_recurring   boolean not null default false,
  recurring_id   uuid,          -- groups recurring bookings together
  cancel_reason  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- Prevent double-booking same resource on same date/time
  constraint no_double_booking exclude using gist (
    resource_id with =,
    date with =,
    tsrange(
      (date + start_time)::timestamp,
      (date + end_time)::timestamp
    ) with &&
  ) where (status not in ('cancelled', 'completed', 'no_show'))
);

-- ─── WAITLIST ─────────────────────────────────────────────────────────────────

create table waitlist (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references profiles(id) on delete cascade,
  resource_type  resource_type not null,
  resource_id    uuid,          -- null = any desk in zone
  floor_id       uuid not null references floors(id) on delete cascade,
  zone_id        uuid references zones(id) on delete set null,
  date           date not null,
  start_time     time not null,
  end_time       time not null,
  position       integer not null default 1,
  notified       boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        notif_type not null,
  title       text not null,
  message     text not null,
  read        boolean not null default false,
  booking_id  uuid references bookings(id) on delete set null,
  action_url  text,
  created_at  timestamptz not null default now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

create index idx_bookings_user_id      on bookings(user_id);
create index idx_bookings_resource     on bookings(resource_id, date);
create index idx_bookings_date         on bookings(date);
create index idx_bookings_floor        on bookings(floor_id, date);
create index idx_bookings_status       on bookings(status);
create index idx_notifications_user    on notifications(user_id, read);
create index idx_desks_floor           on desks(floor_id);
create index idx_rooms_floor           on rooms(floor_id);
create index idx_waitlist_floor_date   on waitlist(floor_id, date);
create index idx_profiles_email        on profiles(email);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on profiles    for each row execute function set_updated_at();
create trigger set_updated_at before update on bookings    for each row execute function set_updated_at();
create trigger set_updated_at before update on desks       for each row execute function set_updated_at();
create trigger set_updated_at before update on rooms       for each row execute function set_updated_at();
create trigger set_updated_at before update on booking_policies for each row execute function set_updated_at();

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'employee')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── AUTO-RELEASE NO-SHOWS ────────────────────────────────────────────────────
-- Called via pg_cron (free on Supabase) every 15 minutes

create or replace function auto_release_no_shows()
returns void language plpgsql security definer as $$
declare
  policy booking_policies%rowtype;
begin
  select * into policy from booking_policies limit 1;

  update bookings
  set status = 'no_show', updated_at = now()
  where status = 'confirmed'
    and date = current_date
    and (current_time > start_time + (policy.auto_release_minutes || ' minutes')::interval)
    and check_in_time is null;
end;
$$;

-- ─── NOTIFY WAITLIST ON CANCELLATION ──────────────────────────────────────────

create or replace function notify_waitlist_on_cancel()
returns trigger language plpgsql security definer as $$
declare
  waiter waitlist%rowtype;
begin
  -- Only act when a booking is cancelled
  if new.status = 'cancelled' and old.status != 'cancelled' then
    -- Find first person on waitlist for this resource/date
    select * into waiter
    from waitlist
    where resource_id = new.resource_id
      and date = new.date
      and start_time = new.start_time
    order by position asc
    limit 1;

    if found then
      -- Create notification for the waiter
      insert into notifications (user_id, type, title, message, booking_id)
      values (
        waiter.user_id,
        'waitlist_available',
        'Space Available!',
        'A space you were waiting for is now available for ' || new.date::text,
        new.id
      );
      -- Mark as notified
      update waitlist set notified = true where id = waiter.id;
    end if;
  end if;
  return new;
end;
$$;

create trigger on_booking_cancelled
  after update on bookings
  for each row execute function notify_waitlist_on_cancel();
