-- Tighten SELECT RLS on profiles to prevent any authenticated user from reading other users' PII

-- Remove potentially over-broad / conflicting SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous SELECT on profiles" ON public.profiles;

-- Recreate minimal, mutually exclusive SELECT access:
-- 1) users can only read their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) admins can read all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));