-- ═══════════════════════════════════════════════════════════════════════════
-- Supabase SQL Editor Template: Custom Indian Names & Rich Analytics Seeding
-- ═══════════════════════════════════════════════════════════════════════════
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor → New Query.
-- 2. Paste this entire script and run it to populate mock users, colleague
--    profiles, dynamically calculated bookings, and attendance plans.
-- 3. You can modify any names, departments, start/end times, or dates below.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. [OPTIONAL] CLEAN OLD DEMO BOOKINGS & PROFILES (Uncomment if you want to start completely fresh)
-- DELETE FROM public.bookings;
-- DELETE FROM public.attendance_plans;
-- DELETE FROM public.profiles WHERE email LIKE '%@deskflow.io';
-- DELETE FROM auth.users WHERE email LIKE '%@deskflow.io';

-- 2. INSERT DEMO USERS INTO AUTH SCHEMA
-- All users are created with the password 'password123'.
-- Trigger 'on_auth_user_created' will automatically copy them to public.profiles.
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
VALUES
  -- 1. Vikram Malhotra (Admin)
  ('11111111-1111-1111-1111-111111111111', 'vikram@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Vikram Malhotra", "role": "admin"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 2. Aarav Sharma (Employee)
  ('22222222-2222-2222-2222-222222222222', 'aarav@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Aarav Sharma", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 3. Shreya Sen (Manager)
  ('33333333-3333-3333-3333-333333333333', 'shreya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Shreya Sen", "role": "manager"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 4. Dev Patel (Employee)
  ('44444444-4444-4444-4444-444444444444', 'dev@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Dev Patel", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 5. Meera Nair (Employee)
  ('55555555-5555-5555-5555-555555555555', 'meera@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Meera Nair", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 6. Rohan Gupta (Manager)
  ('66666666-6666-6666-6666-666666666666', 'rohan@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Rohan Gupta", "role": "manager"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 7. Ananya Iyer (Employee)
  ('77777777-7777-7777-7777-777777777777', 'ananya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Ananya Iyer", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 8. Kabir Verma (Employee)
  ('88888888-8888-8888-8888-888888888888', 'kabir@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Kabir Verma", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 9. Priya Rao (Employee)
  ('99999999-9999-9999-9999-999999999999', 'priya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Priya Rao", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  -- 10. Arjun Mehta (Employee)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'arjun@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Arjun Mehta", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT TEAMS
INSERT INTO public.teams (id, name, description, manager_id, color, department)
VALUES
  ('a0a0a0a0-1111-1111-1111-111111111111', 'Engineering', 'Product engineering and development', '33333333-3333-3333-3333-333333333333', '#724b68', 'Engineering'),
  ('a0a0a0a0-2222-2222-2222-222222222222', 'Design', 'UI/UX and asset design', '44444444-4444-4444-4444-444444444444', '#ec4899', 'Design'),
  ('a0a0a0a0-3333-3333-3333-333333333333', 'Marketing', 'Digital marketing and operations', '66666666-6666-6666-6666-666666666666', '#8b5cf6', 'Marketing'),
  ('a0a0a0a0-4444-4444-4444-444444444444', 'HR', 'Talent acquisition and culture', '77777777-7777-7777-7777-777777777777', '#10b981', 'HR')
ON CONFLICT (id) DO NOTHING;

-- 4. UPDATE PROFILES WITH FULL DETAILS
UPDATE public.profiles SET department = 'Operations', avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET department = 'Design', team_id = 'a0a0a0a0-2222-2222-2222-222222222222', avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET department = 'Marketing', team_id = 'a0a0a0a0-3333-3333-3333-333333333333', avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120' WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE public.profiles SET department = 'Marketing', team_id = 'a0a0a0a0-3333-3333-3333-333333333333', avatar_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120' WHERE id = '66666666-6666-6666-6666-666666666666';
UPDATE public.profiles SET department = 'HR', team_id = 'a0a0a0a0-4444-4444-4444-444444444444', avatar_url = 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120' WHERE id = '77777777-7777-7777-7777-777777777777';
UPDATE public.profiles SET department = 'Sales', avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120' WHERE id = '88888888-8888-8888-8888-888888888888';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' WHERE id = '99999999-9999-9999-9999-999999999999';
UPDATE public.profiles SET department = 'Design', team_id = 'a0a0a0a0-2222-2222-2222-222222222222', avatar_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 5. SEED ATTENDANCE PLANS FOR CURRENT WEEK (Spans all 10 users across multiple days)
INSERT INTO public.attendance_plans (user_id, date, status)
VALUES
  -- Monday
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE - 4, 'office'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 4, 'office'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 4, 'remote'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 4, 'office'),
  ('55555555-5555-5555-5555-555555555555', CURRENT_DATE - 4, 'remote'),
  -- Tuesday
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 3, 'office'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 3, 'office'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 3, 'remote'),
  ('66666666-6666-6666-6666-666666666666', CURRENT_DATE - 3, 'office'),
  ('77777777-7777-7777-7777-777777777777', CURRENT_DATE - 3, 'off'),
  -- Wednesday
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 2, 'remote'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 2, 'remote'),
  ('55555555-5555-5555-5555-555555555555', CURRENT_DATE - 2, 'office'),
  ('88888888-8888-8888-8888-888888888888', CURRENT_DATE - 2, 'office'),
  ('99999999-9999-9999-9999-999999999999', CURRENT_DATE - 2, 'office'),
  -- Thursday
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 1, 'office'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 1, 'office'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - 1, 'office'),
  ('66666666-6666-6666-6666-666666666666', CURRENT_DATE - 1, 'remote'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - 1, 'office'),
  -- Today (Friday)
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 'office'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 'office'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 'office'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE, 'remote'),
  ('55555555-5555-5555-5555-555555555555', CURRENT_DATE, 'remote'),
  ('66666666-6666-6666-6666-666666666666', CURRENT_DATE, 'office'),
  ('77777777-7777-7777-7777-777777777777', CURRENT_DATE, 'office'),
  ('88888888-8888-8888-8888-888888888888', CURRENT_DATE, 'remote'),
  ('99999999-9999-9999-9999-999999999999', CURRENT_DATE, 'office'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE, 'office'),
  -- Tomorrow (Saturday)
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE + 1, 'remote'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE + 1, 'off'),
  ('44444444-4444-4444-4444-444444444444', CURRENT_DATE + 1, 'remote'),
  -- Monday (Next week)
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE + 3, 'office'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE + 3, 'office'),
  ('66666666-6666-6666-6666-666666666666', CURRENT_DATE + 3, 'office')
ON CONFLICT (user_id, date) DO UPDATE 
SET status = EXCLUDED.status;

-- 6. SEED BOOKINGS FOR ANALYTICS (Covers multiple desks, meeting rooms, and spaces across days)
INSERT INTO public.bookings (user_id, resource_type, resource_id, floor_id, building_id, date, start_time, end_time, status, title, duration_type)
VALUES
  -- ─── MONDAY (Completed Bookings) ───
  (
    '22222222-2222-2222-2222-222222222222', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-01' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-01' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 4, '09:00:00', '17:00:00',
    'completed', 'Desk Reservation', 'full_day'
  ),
  (
    '44444444-4444-4444-4444-444444444444', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-02' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-02' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 4, '09:30:00', '18:00:00',
    'completed', 'Design Station', 'full_day'
  ),
  (
    '11111111-1111-1111-1111-111111111111', 'room',
    (SELECT id FROM public.rooms WHERE name = 'Maple' LIMIT 1),
    (SELECT floor_id FROM public.rooms WHERE name = 'Maple' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 4, '14:00:00', '15:30:00',
    'completed', 'Ops Sync Meeting', 'custom'
  ),

  -- ─── TUESDAY (Completed Bookings) ───
  (
    '22222222-2222-2222-2222-222222222222', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-03' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-03' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, '09:00:00', '17:00:00',
    'completed', 'Hot desk D-03', 'full_day'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-04' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-04' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, '08:00:00', '16:00:00',
    'completed', 'Manager Station D-04', 'full_day'
  ),
  (
    '66666666-6666-6666-6666-666666666666', 'room',
    (SELECT id FROM public.rooms WHERE name = 'Cedar' LIMIT 1),
    (SELECT floor_id FROM public.rooms WHERE name = 'Cedar' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, '10:00:00', '12:00:00',
    'completed', 'Marketing Brainstorm', 'custom'
  ),

  -- ─── WEDNESDAY (Completed & Cancelled Bookings) ───
  (
    '55555555-5555-5555-5555-555555555555', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-05' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-05' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, '09:00:00', '17:00:00',
    'completed', 'Lobby Desk', 'full_day'
  ),
  (
    '88888888-8888-8888-8888-888888888888', 'parking',
    (SELECT id FROM public.parking_spaces WHERE label = 'P-01' LIMIT 1),
    (SELECT floor_id FROM public.parking_spaces WHERE label = 'P-01' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, '09:00:00', '18:00:00',
    'completed', 'Standard spot', 'full_day'
  ),
  (
    '99999999-9999-9999-9999-999999999999', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-06' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-06' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, '09:00:00', '17:00:00',
    'completed', 'Engineering Quiet Desk', 'full_day'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 'room',
    (SELECT id FROM public.rooms WHERE name = 'Oak' LIMIT 1),
    (SELECT floor_id FROM public.rooms WHERE name = 'Oak' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, '15:00:00', '16:00:00',
    'cancelled', '1-on-1 Coffee Chat (Cancelled)', 'custom'
  ),

  -- ─── THURSDAY (Yesterday - Completed Bookings) ───
  (
    '22222222-2222-2222-2222-222222222222', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-07' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-07' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, '09:00:00', '17:00:00',
    'completed', 'Desk Reservation D-07', 'full_day'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-08' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-08' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, '08:30:00', '17:30:00',
    'completed', 'Desk Reservation D-08', 'full_day'
  ),
  (
    '44444444-4444-4444-4444-444444444444', 'room',
    (SELECT id FROM public.rooms WHERE name = 'Birch' LIMIT 1),
    (SELECT floor_id FROM public.rooms WHERE name = 'Birch' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, '14:00:00', '15:00:00',
    'completed', 'Sprint Review', 'custom'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-09' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-09' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, '09:00:00', '18:00:00',
    'completed', 'Quiet workspace', 'full_day'
  ),

  -- ─── TODAY (Friday - Active Bookings) ───
  -- Aarav Sharma (Active check-in)
  (
    '22222222-2222-2222-2222-222222222222', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-10' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-10' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE, '08:00:00', '18:00:00',
    'checked_in', 'Core engineering sprint', 'full_day'
  ),
  -- Vikram Malhotra (Confirmed, ready to check in)
  (
    '11111111-1111-1111-1111-111111111111', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-11' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-11' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE, '09:00:00', '17:00:00',
    'confirmed', 'Admin workspace', 'full_day'
  ),
  -- Shreya Sen (Active check-in in Room)
  (
    '33333333-3333-3333-3333-333333333333', 'room',
    (SELECT id FROM public.rooms WHERE name = 'Maple' LIMIT 1),
    (SELECT floor_id FROM public.rooms WHERE name = 'Maple' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE, '10:00:00', '12:00:00',
    'checked_in', 'Team Standup', 'custom'
  ),
  -- Ananya Iyer (Locker Booking)
  (
    '77777777-7777-7777-7777-777777777777', 'locker',
    (SELECT id FROM public.lockers WHERE label = 'L-01' LIMIT 1),
    (SELECT floor_id FROM public.lockers WHERE label = 'L-01' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE, '09:00:00', '18:00:00',
    'confirmed', 'Storage locker L-01', 'full_day'
  ),
  -- Priya Rao (Parking Spot Active)
  (
    '99999999-9999-9999-9999-999999999999', 'parking',
    (SELECT id FROM public.parking_spaces WHERE label = 'P-01' LIMIT 1),
    (SELECT floor_id FROM public.parking_spaces WHERE label = 'P-01' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE, '08:30:00', '17:30:00',
    'checked_in', 'Parking Spot P-01', 'full_day'
  ),

  -- ─── TOMORROW & NEXT WEEK (Upcoming Bookings) ───
  (
    '22222222-2222-2222-2222-222222222222', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-12' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-12' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE + 3, '09:00:00', '17:00:00',
    'confirmed', 'Monday Setup', 'full_day'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 'desk',
    (SELECT id FROM public.desks WHERE label = 'D-13' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-13' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE + 3, '09:00:00', '17:00:00',
    'confirmed', 'Manager workspace next week', 'full_day'
  ),
  (
    '66666666-6666-6666-6666-666666666666', 'room',
    (SELECT id FROM public.rooms WHERE name = 'Oak' LIMIT 1),
    (SELECT floor_id FROM public.rooms WHERE name = 'Oak' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001', CURRENT_DATE + 3, '14:00:00', '15:00:00',
    'confirmed', 'Marketing alignment next week', 'custom'
  )
ON CONFLICT DO NOTHING;
