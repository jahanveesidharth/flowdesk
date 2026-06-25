-- ═══════════════════════════════════════════════════════════════════════════
-- DeskFlow – Exclude Rooms from strict Double-Booking Constraint
-- Allows concurrent bookings in a room up to its capacity
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Drop existing exclusion constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_double_booking;

-- 2. Re-create constraint excluding rooms
ALTER TABLE bookings ADD CONSTRAINT no_double_booking EXCLUDE USING gist (
  resource_id WITH =,
  date WITH =,
  tsrange(
    (date + start_time)::timestamp,
    (date + end_time)::timestamp
  ) WITH &&
) WHERE (status NOT IN ('cancelled', 'completed', 'no_show') AND resource_type != 'room');
