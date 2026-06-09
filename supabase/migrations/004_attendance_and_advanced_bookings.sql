-- ═══════════════════════════════════════════════════════════════════════════
-- DeskFlow – Advanced Bookings & Weekly Attendance Planning Schema Updates
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create booking duration type enum and add column to bookings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_duration_type') THEN
    CREATE TYPE booking_duration_type AS ENUM ('full_day', 'half_day_am', 'half_day_pm', 'custom');
  END IF;
END$$;

ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS duration_type booking_duration_type NOT NULL DEFAULT 'full_day';

-- 2. Create attendance status type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE attendance_status AS ENUM ('office', 'remote', 'off');
  END IF;
END$$;

-- 3. Create attendance_plans table
CREATE TABLE IF NOT EXISTS attendance_plans (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date        date NOT NULL,
  status      attendance_status NOT NULL DEFAULT 'office',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- Constraint: one plan per user per date
  CONSTRAINT unique_user_date_attendance UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE attendance_plans ENABLE ROW LEVEL SECURITY;

-- 4. Set up RLS Policies for attendance_plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_plans' AND policyname = 'attendance_select_all'
  ) THEN
    CREATE POLICY "attendance_select_all" ON attendance_plans
      FOR SELECT USING (auth.uid() is not null);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_plans' AND policyname = 'attendance_insert_own'
  ) THEN
    CREATE POLICY "attendance_insert_own" ON attendance_plans
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_plans' AND policyname = 'attendance_update_own'
  ) THEN
    CREATE POLICY "attendance_update_own" ON attendance_plans
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_plans' AND policyname = 'attendance_delete_own'
  ) THEN
    CREATE POLICY "attendance_delete_own" ON attendance_plans
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END$$;

-- 5. Trigger set_updated_at for attendance_plans
CREATE OR REPLACE TRIGGER set_updated_at_attendance
  BEFORE UPDATE ON attendance_plans
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
