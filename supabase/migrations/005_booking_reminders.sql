-- ═══════════════════════════════════════════════════════════════════════════
-- DeskFlow – Booking Reminder SQL Migrations
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Add reminder_sent column to bookings table (defaulting to false)
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false;

-- 2. Create partial index on bookings for quick lookup of unsent reminders
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_sent 
  ON bookings(reminder_sent) 
  WHERE reminder_sent = false;

-- 3. Create security definer function to atomically fetch and mark booking reminders
CREATE OR REPLACE FUNCTION process_booking_reminders()
RETURNS TABLE (
  out_id uuid,
  out_date date,
  out_start_time time,
  out_end_time time,
  out_title text,
  out_resource_type resource_type,
  out_resource_id uuid,
  out_user_name text,
  out_user_email text,
  out_building_name text,
  out_floor_name text,
  out_resource_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
  RETURN QUERY
  WITH selected_bookings AS (
    SELECT 
      b.id,
      b.date,
      b.start_time,
      b.end_time,
      b.title,
      b.resource_type,
      b.resource_id,
      p.name AS user_name,
      p.email AS user_email,
      bl.name AS building_name,
      f.name AS floor_name,
      CASE b.resource_type
        WHEN 'desk' THEN (SELECT label FROM desks WHERE id = b.resource_id)
        WHEN 'room' THEN (SELECT name FROM rooms WHERE id = b.resource_id)
        WHEN 'parking' THEN (SELECT label FROM parking_spaces WHERE id = b.resource_id)
        WHEN 'locker' THEN (SELECT label FROM lockers WHERE id = b.resource_id)
      END AS resource_name
    FROM bookings b
    JOIN profiles p ON b.user_id = p.id
    JOIN buildings bl ON b.building_id = bl.id
    JOIN floors f ON b.floor_id = f.id
    WHERE b.status = 'confirmed'
      AND b.reminder_sent = false
      AND coalesce((p.preferences->>'emailReminders')::boolean, true) IS TRUE
      -- Compare booking local time with building timezone
      AND (b.date + b.start_time)::timestamp - (coalesce((p.preferences->>'reminderMinutes')::integer, 30) || ' minutes')::interval <= now() at time zone bl.timezone
      -- Ensure it is an upcoming booking (starts in the future relative to the building's current time)
      AND (b.date + b.start_time)::timestamp > now() at time zone bl.timezone
    FOR UPDATE OF b SKIP LOCKED
  )
  UPDATE bookings b
  SET reminder_sent = true, updated_at = now()
  FROM selected_bookings sb
  WHERE b.id = sb.id
  RETURNING 
    sb.id,
    sb.date,
    sb.start_time,
    sb.end_time,
    sb.title,
    sb.resource_type,
    sb.resource_id,
    sb.user_name,
    sb.user_email,
    sb.building_name,
    sb.floor_name,
    sb.resource_name;
END;
$$;
