-- ═══════════════════════════════════════════════════════════════════════════
-- Supabase SQL Editor Template: Custom Indian Names & Demo Seeding
-- ═══════════════════════════════════════════════════════════════════════════
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor → New Query.
-- 2. Paste this entire script and run it to populate mock users, colleague
--    profiles, dynamically calculated bookings, and attendance plans.
-- 3. You can modify any names, departments, start/end times, or dates below.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. [OPTIONAL] CLEAN OLD DEMO BOOKINGS & PROFILES (Comment out if you want to keep them)
-- DELETE FROM public.bookings;
-- DELETE FROM public.attendance_plans;
-- DELETE FROM public.profiles WHERE email LIKE '%@deskflow.io';
-- DELETE FROM auth.users WHERE email LIKE '%@deskflow.io';

-- 2. INSERT DEMO USERS INTO AUTH SCHEMA
-- We insert them into auth.users using crypt() for password hashing.
-- Password for all these accounts is 'password123'.
-- The trigger 'on_auth_user_created' will automatically copy them to public.profiles.
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
  ('55555555-5555-5555-5555-555555555555', 'meera@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Meera Nair", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT TEAMS
INSERT INTO public.teams (id, name, description, manager_id, color, department)
VALUES
  ('a0a0a0a0-1111-1111-1111-111111111111', 'Engineering', 'Product development and QA', '33333333-3333-3333-3333-333333333333', '#724b68', 'Engineering'),
  ('a0a0a0a0-2222-2222-2222-222222222222', 'Design', 'UI/UX and branding design', '44444444-4444-4444-4444-444444444444', '#ec4899', 'Design')
ON CONFLICT (id) DO NOTHING;

-- 4. ENHANCE PROFILES (Assign departments, teams, and avatar URLs)
UPDATE public.profiles SET department = 'Operations', avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET department = 'Design', team_id = 'a0a0a0a0-2222-2222-2222-222222222222', avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET department = 'Marketing', avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120' WHERE id = '55555555-5555-5555-5555-555555555555';

-- 5. SEED ATTENDANCE PLANS FOR CURRENT WEEK
-- (We use current_date relative modifiers so plans remain dynamic and fall in the current calendar week)
INSERT INTO public.attendance_plans (user_id, date, status)
VALUES
  -- Aarav Sharma (Work plans)
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE - 1, 'office'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 'office'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE + 1, 'remote'),
  ('22222222-2222-2222-2222-222222222222', CURRENT_DATE + 2, 'off'),
  -- Shreya Sen (Work plans)
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE - 1, 'remote'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE, 'office'),
  ('33333333-3333-3333-3333-333333333333', CURRENT_DATE + 1, 'office')
ON CONFLICT (user_id, date) DO UPDATE 
SET status = EXCLUDED.status;

-- 6. SEED BOOKINGS WITH CUSTOM OFFICE HOURS
-- We look up target resources dynamically to ensure exact mappings to exists seeds.
INSERT INTO public.bookings (user_id, resource_type, resource_id, floor_id, building_id, date, start_time, end_time, status, title, duration_type)
VALUES
  -- Yesterday's finished booking (completed)
  (
    '22222222-2222-2222-2222-222222222222',
    'desk',
    (SELECT id FROM public.desks WHERE label = 'D-01' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-01' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001',
    CURRENT_DATE - 1,
    '09:00:00',
    '17:00:00',
    'completed',
    'Desk Reservation',
    'full_day'
  ),
  -- Today's active booking (checked_in)
  (
    '22222222-2222-2222-2222-222222222222',
    'desk',
    (SELECT id FROM public.desks WHERE label = 'D-02' LIMIT 1),
    (SELECT floor_id FROM public.desks WHERE label = 'D-02' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    '08:30:00',
    '18:00:00',
    'checked_in',
    'Daily Work Session',
    'full_day'
  ),
  -- Tomorrow's upcoming booking (confirmed)
  (
    '33333333-3333-3333-3333-333333333333',
    'room',
    (SELECT id FROM public.rooms WHERE name = 'Maple' LIMIT 1),
    (SELECT floor_id FROM public.rooms WHERE name = 'Maple' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001',
    CURRENT_DATE + 1,
    '11:00:00',
    '12:30:00',
    'confirmed',
    'Design Review Meeting',
    'custom'
  ),
  -- Today's parking spot (confirmed)
  (
    '44444444-4444-4444-4444-444444444444',
    'parking',
    (SELECT id FROM public.parking_spaces WHERE label = 'P-01' LIMIT 1),
    (SELECT floor_id FROM public.parking_spaces WHERE label = 'P-01' LIMIT 1),
    'b1000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    '09:00:00',
    '17:00:00',
    'confirmed',
    'Parking Spot P-01',
    'full_day'
  )
ON CONFLICT DO NOTHING;
