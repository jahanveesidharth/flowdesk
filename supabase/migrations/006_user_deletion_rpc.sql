-- ═══════════════════════════════════════════════════════════════════════════
-- GrabDesk – User Deletion RPC Functions
-- These functions run with security definer (high privileges) to delete records
-- from auth.users, which cascades to public tables.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Self-deletion: allows the logged-in user to delete their own auth account
create or replace function delete_my_auth_user()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- 2. Admin deletion: allows an admin to delete any user's auth account
create or replace function delete_user_by_admin(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Check if the caller is an admin
  if (select role from public.profiles where id = auth.uid()) = 'admin' then
    delete from auth.users where id = target_user_id;
  else
    raise exception 'Only admins can delete accounts.';
  end if;
end;
$$;
