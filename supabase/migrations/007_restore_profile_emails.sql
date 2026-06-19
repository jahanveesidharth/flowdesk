-- ═══════════════════════════════════════════════════════════════════════════
-- GrabDesk – Restore Profile Emails
-- Run this in Supabase SQL Editor to restore profile emails from auth.users
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;
