-- ═══════════════════════════════════════════════════════════════════════════
-- Supabase SQL Editor Template: Massive Custom Indian Names & Rich Seeding
-- ═══════════════════════════════════════════════════════════════════════════
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor → New Query.
-- 2. Paste this entire script and click "Run".
-- 3. It will populate 30 Indian profiles, set up multiple teams, and then
--    run a high-volume data generator to seed over 1,000+ bookings and 
--    attendance plan records spanning 37 days (from 30 days ago to 7 days ahead).
-- 4. It automatically cleans up any existing '@deskflow.io' demo accounts
--    first to prevent duplicate email constraint violations.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. CLEAN OLD DATA TO AVOID DUPLICATE EMAIL KEY VIOLATIONS
-- This deletes bookings, attendance, profiles, and auth users linked to '@deskflow.io'.
-- Thanks to cascade deletes, deleting from auth.users also cleans public.profiles.
DELETE FROM public.bookings WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@deskflow.io');
DELETE FROM public.attendance_plans WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@deskflow.io');
DELETE FROM auth.users WHERE email LIKE '%@deskflow.io';

-- 2. INSERT 30 DEMO USERS INTO AUTH SCHEMA
-- Password for all accounts is 'password123'. 
-- This triggers handle_new_user() automatically to create profile records.
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, aud, role)
VALUES
  -- Operations & Admins
  ('11111111-1111-1111-1111-111111111111', 'vikram@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Vikram Malhotra", "role": "admin"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('11111111-2222-2222-2222-222222222222', 'tanvi@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Tanvi Hegde", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  
  -- Engineering Team
  ('22222222-1111-1111-1111-111111111111', 'aarav@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Aarav Sharma", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'shreya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Shreya Sen", "role": "manager"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('22222222-3333-3333-3333-333333333333', 'priya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Priya Rao", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('22222222-4444-4444-4444-444444444444', 'aditya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Aditya Joshi", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('22222222-5555-5555-5555-555555555555', 'rahul@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Rahul Verma", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('22222222-6666-6666-6666-666666666666', 'kiran@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Kiran More", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  
  -- Design Team
  ('33333333-1111-1111-1111-111111111111', 'dev@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Dev Patel", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('33333333-2222-2222-2222-222222222222', 'arjun@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Arjun Mehta", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'kavya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Kavya Reddy", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('33333333-4444-4444-4444-444444444444', 'sneha@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Sneha Kulkarni", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),

  -- Marketing Team
  ('44444444-1111-1111-1111-111111111111', 'rohan@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Rohan Gupta", "role": "manager"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('44444444-2222-2222-2222-222222222222', 'meera@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Meera Nair", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('44444444-3333-3333-3333-333333333333', 'pooja@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Pooja Banerjee", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', 'riya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Riya Kapoor", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),

  -- HR Team
  ('55555555-1111-1111-1111-111111111111', 'ananya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Ananya Iyer", "role": "manager"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('55555555-2222-2222-2222-222222222222', 'ishaan@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Ishaan Desai", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('55555555-3333-3333-3333-333333333333', 'divya@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Divya Pillai", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),

  -- Sales & Business Development
  ('66666666-1111-1111-1111-111111111111', 'kabir@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Kabir Verma", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('66666666-2222-2222-2222-222222222222', 'amit@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Amit Trivedi", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('66666666-3333-3333-3333-333333333333', 'sandeep@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Sandeep Singh", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('66666666-4444-4444-4444-444444444444', 'sunita@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Sunita Rao", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),

  -- Finance & Legal Team
  ('77777777-1111-1111-1111-111111111111', 'rajesh@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Rajesh Kumar", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('77777777-2222-2222-2222-222222222222', 'aravind@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Aravind Swamy", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),

  -- Executive Suite
  ('88888888-1111-1111-1111-111111111111', 'neha@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Neha Sharma", "role": "admin"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('88888888-2222-2222-2222-222222222222', 'sanjay@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Sanjay Dutt", "role": "manager"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('88888888-3333-3333-3333-333333333333', 'preity@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Preity Zinta", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('88888888-4444-4444-4444-444444444444', 'shahrukh@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Shah Rukh Khan", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
  ('88888888-5555-5555-5555-555555555555', 'gauri@deskflow.io', crypt('password123', gen_salt('bf')), now(), '{"name": "Gauri Khan", "role": "employee"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT TEAMS
INSERT INTO public.teams (id, name, description, manager_id, color, department)
VALUES
  ('a0a0a0a0-1111-1111-1111-111111111111', 'Engineering', 'Core product development team', '22222222-2222-2222-2222-222222222222', '#724b68', 'Engineering'),
  ('a0a0a0a0-2222-2222-2222-222222222222', 'Design', 'UI/UX design team', '33333333-1111-1111-1111-111111111111', '#ec4899', 'Design'),
  ('a0a0a0a0-3333-3333-3333-333333333333', 'Marketing', 'Digital marketing and campaigns', '44444444-1111-1111-1111-111111111111', '#8b5cf6', 'Marketing'),
  ('a0a0a0a0-4444-4444-4444-444444444444', 'HR', 'People operations and talent acquisition', '55555555-1111-1111-1111-111111111111', '#10b981', 'HR')
ON CONFLICT (id) DO NOTHING;

-- 4. UPDATE PROFILES (Departments, Team IDs, Avatars)
UPDATE public.profiles SET department = 'Operations', avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Operations', avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120' WHERE id = '11111111-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' WHERE id = '22222222-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' WHERE id = '22222222-3333-3333-3333-333333333333';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120' WHERE id = '22222222-4444-4444-4444-444444444444';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120' WHERE id = '22222222-5555-5555-5555-555555555555';
UPDATE public.profiles SET department = 'Engineering', team_id = 'a0a0a0a0-1111-1111-1111-111111111111', avatar_url = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120' WHERE id = '22222222-6666-6666-6666-666666666666';
UPDATE public.profiles SET department = 'Design', team_id = 'a0a0a0a0-2222-2222-2222-222222222222', avatar_url = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120' WHERE id = '33333333-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Design', team_id = 'a0a0a0a0-2222-2222-2222-222222222222', avatar_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120' WHERE id = '33333333-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Design', team_id = 'a0a0a0a0-2222-2222-2222-222222222222', avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET department = 'Design', team_id = 'a0a0a0a0-2222-2222-2222-222222222222', avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' WHERE id = '33333333-4444-4444-4444-444444444444';
UPDATE public.profiles SET department = 'Marketing', team_id = 'a0a0a0a0-3333-3333-3333-333333333333', avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120' WHERE id = '44444444-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Marketing', team_id = 'a0a0a0a0-3333-3333-3333-333333333333', avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120' WHERE id = '44444444-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Marketing', team_id = 'a0a0a0a0-3333-3333-3333-333333333333', avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' WHERE id = '44444444-3333-3333-3333-333333333333';
UPDATE public.profiles SET department = 'Marketing', team_id = 'a0a0a0a0-3333-3333-3333-333333333333', avatar_url = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET department = 'HR', team_id = 'a0a0a0a0-4444-4444-4444-444444444444', avatar_url = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120' WHERE id = '55555555-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'HR', team_id = 'a0a0a0a0-4444-4444-4444-444444444444', avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120' WHERE id = '55555555-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'HR', team_id = 'a0a0a0a0-4444-4444-4444-444444444444', avatar_url = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120' WHERE id = '55555555-3333-3333-3333-333333333333';
UPDATE public.profiles SET department = 'Sales', avatar_url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120' WHERE id = '66666666-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Sales', avatar_url = 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120' WHERE id = '66666666-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Sales', avatar_url = 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=120' WHERE id = '66666666-3333-3333-3333-333333333333';
UPDATE public.profiles SET department = 'Sales', avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120' WHERE id = '66666666-4444-4444-4444-444444444444';
UPDATE public.profiles SET department = 'Finance', avatar_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120' WHERE id = '77777777-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Finance', avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' WHERE id = '77777777-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Executive', avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120' WHERE id = '88888888-1111-1111-1111-111111111111';
UPDATE public.profiles SET department = 'Executive', avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120' WHERE id = '88888888-2222-2222-2222-222222222222';
UPDATE public.profiles SET department = 'Executive', avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' WHERE id = '88888888-3333-3333-3333-333333333333';
UPDATE public.profiles SET department = 'Executive', avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' WHERE id = '88888888-4444-4444-4444-444444444444';
UPDATE public.profiles SET department = 'Executive', avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120' WHERE id = '88888888-5555-5555-5555-555555555555';

-- 5. RUN MASSIVE DATA GENERATOR PL/pgSQL BLOCK
-- Generates thousands of realistic bookings & attendance plans spanning the last 30 days and the next 7 days.
-- Exclude constraints are automatically bypassed inside an exception block to skip double-bookings smoothly.
DO $$
DECLARE
  user_ids uuid[] := array[
    '11111111-1111-1111-1111-111111111111',
    '11111111-2222-2222-2222-222222222222',
    '22222222-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '22222222-3333-3333-3333-333333333333',
    '22222222-4444-4444-4444-444444444444',
    '22222222-5555-5555-5555-555555555555',
    '22222222-6666-6666-6666-666666666666',
    '33333333-1111-1111-1111-111111111111',
    '33333333-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '33333333-4444-4444-4444-444444444444',
    '44444444-1111-1111-1111-111111111111',
    '44444444-2222-2222-2222-222222222222',
    '44444444-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-1111-1111-1111-111111111111',
    '55555555-2222-2222-2222-222222222222',
    '55555555-3333-3333-3333-333333333333',
    '66666666-1111-1111-1111-111111111111',
    '66666666-2222-2222-2222-222222222222',
    '66666666-3333-3333-3333-333333333333',
    '66666666-4444-4444-4444-444444444444',
    '77777777-1111-1111-1111-111111111111',
    '77777777-2222-2222-2222-222222222222',
    '88888888-1111-1111-1111-111111111111',
    '88888888-2222-2222-2222-222222222222',
    '88888888-3333-3333-3333-333333333333',
    '88888888-4444-4444-4444-444444444444',
    '88888888-5555-5555-5555-555555555555'
  ];
  
  desk_ids uuid[];
  room_ids uuid[];
  parking_ids uuid[];
  locker_ids uuid[];
  
  target_date date;
  curr_user uuid;
  selected_resource uuid;
  selected_type text;
  
  -- date limits
  start_date date := CURRENT_DATE - 30;
  end_date date := CURRENT_DATE + 7;
  
  s_time time;
  e_time time;
  b_status text;
  rand_val float;
  is_wknd boolean;
  
  fl_id uuid;
  bl_id uuid := 'b1000000-0000-0000-0000-000000000001';
BEGIN
  -- 1. Cache resource arrays
  SELECT array_agg(id) INTO desk_ids FROM public.desks WHERE is_active = true;
  SELECT array_agg(id) INTO room_ids FROM public.rooms WHERE is_active = true;
  SELECT array_agg(id) INTO parking_ids FROM public.parking_spaces WHERE is_active = true;
  SELECT array_agg(id) INTO locker_ids FROM public.lockers WHERE is_active = true;

  -- 2. Iterate dates
  target_date := start_date;
  WHILE target_date <= end_date LOOP
    is_wknd := extract(isodow from target_date) IN (6, 7);
    
    FOREACH curr_user IN ARRAY user_ids LOOP
      
      -- A. Insert Attendance Plan (92% probability on weekdays, 8% on weekends)
      rand_val := random();
      IF (NOT is_wknd AND rand_val < 0.92) OR (is_wknd AND rand_val < 0.08) THEN
        BEGIN
          INSERT INTO public.attendance_plans (user_id, date, status)
          VALUES (
            curr_user,
            target_date,
            CASE 
              WHEN is_wknd THEN 'off'::public.attendance_status
              WHEN rand_val < 0.60 THEN 'office'::public.attendance_status
              WHEN rand_val < 0.88 THEN 'remote'::public.attendance_status
              ELSE 'off'::public.attendance_status
            END
          )
          ON CONFLICT (user_id, date) DO UPDATE 
          SET status = EXCLUDED.status;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END;
      END IF;

      -- B. Insert Booking (High probability on weekdays. Force booking on today for first 20 users to ensure a stable pool)
      rand_val := random();
      IF (target_date = CURRENT_DATE AND array_position(user_ids, curr_user) <= 20)
         OR (target_date != CURRENT_DATE AND ((NOT is_wknd AND rand_val < 0.78) OR (is_wknd AND rand_val < 0.04))) THEN
        
        -- Pick resource type distribution
        rand_val := random();
        IF rand_val < 0.68 AND array_length(desk_ids, 1) > 0 THEN
          selected_type := 'desk';
          selected_resource := desk_ids[floor(random() * array_length(desk_ids, 1) + 1)];
          SELECT floor_id INTO fl_id FROM public.desks WHERE id = selected_resource;
        ELSIF rand_val < 0.88 AND array_length(room_ids, 1) > 0 THEN
          selected_type := 'room';
          selected_resource := room_ids[floor(random() * array_length(room_ids, 1) + 1)];
          SELECT floor_id INTO fl_id FROM public.rooms WHERE id = selected_resource;
        ELSIF rand_val < 0.96 AND array_length(parking_ids, 1) > 0 THEN
          selected_type := 'parking';
          selected_resource := parking_ids[floor(random() * array_length(parking_ids, 1) + 1)];
          SELECT floor_id INTO fl_id FROM public.parking_spaces WHERE id = selected_resource;
        ELSIF array_length(locker_ids, 1) > 0 THEN
          selected_type := 'locker';
          selected_resource := locker_ids[floor(random() * array_length(locker_ids, 1) + 1)];
          SELECT floor_id INTO fl_id FROM public.lockers WHERE id = selected_resource;
        ELSE
          CONTINUE;
        END IF;

        -- Shift timing assignments
        rand_val := random();
        IF rand_val < 0.60 THEN
          s_time := '09:00:00';
          e_time := '17:00:00';
        ELSIF rand_val < 0.80 THEN
          s_time := '08:30:00';
          e_time := '16:30:00';
        ELSIF rand_val < 0.92 THEN
          s_time := '10:00:00';
          e_time := '18:00:00';
        ELSE
          s_time := '13:00:00';
          e_time := '17:30:00'; -- PM shift
        END IF;

        -- Booking status assignment based on past, present, or future
        -- Note: We initially assign only 'completed', 'no_show', and 'confirmed'.
        -- We will adjust exactly 7 bookings today to 'checked_in' and exactly 80 total bookings to 'cancelled' post-loop.
        IF target_date < CURRENT_DATE THEN
          -- Past: Completed or No-shows
          rand_val := random();
          IF rand_val < 0.90 THEN
            b_status := 'completed';
          ELSE
            b_status := 'no_show';
          END IF;
        ELSE
          -- Today and Future: Confirmed
          b_status := 'confirmed';
        END IF;

        -- Perform insertion, ignoring conflict blocks
        BEGIN
          INSERT INTO public.bookings (
            user_id, resource_type, resource_id, floor_id, building_id, 
            date, start_time, end_time, status, title, duration_type,
            check_in_time, check_out_time, cancel_reason
          )
          VALUES (
            curr_user,
            selected_type::public.resource_type,
            selected_resource,
            fl_id,
            bl_id,
            target_date,
            s_time,
            e_time,
            b_status::public.booking_status,
            CASE 
              WHEN selected_type = 'desk' THEN 'Hot Desk Reservation'
              WHEN selected_type = 'room' THEN 'Meeting Sync'
              WHEN selected_type = 'parking' THEN 'Daily Parking'
              ELSE 'Storage Locker Allocation'
            END,
            CASE WHEN e_time - s_time <= '4.5 hours'::interval THEN 'half_day_am'::public.booking_duration_type ELSE 'full_day'::public.booking_duration_type END,
            NULL,
            NULL,
            NULL
          );
        EXCEPTION WHEN OTHERS THEN
          -- Bypasses conflict blocks silently (e.g. double bookings, exclusions)
          NULL;
        END;

      END IF;
    END LOOP;
    target_date := target_date + 1;
  END LOOP;

  -- 3. Adjust exactly 7 bookings today to 'checked_in'
  UPDATE public.bookings
  SET status = 'checked_in',
      check_in_time = (start_time + (random() * 12 || ' minutes')::interval)::time
  WHERE id IN (
    SELECT id
    FROM public.bookings
    WHERE date = CURRENT_DATE
    LIMIT 7
  );

  -- 4. Adjust exactly 80 bookings to 'cancelled' across all dates (excluding today's checked_in bookings)
  UPDATE public.bookings
  SET status = 'cancelled',
      cancel_reason = 'Schedule conflicts/Work from home',
      check_in_time = NULL,
      check_out_time = NULL
  WHERE id IN (
    SELECT id
    FROM public.bookings
    WHERE status != 'checked_in'
    ORDER BY random()
    LIMIT 80
  );
END$$;
