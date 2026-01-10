-- Fix: prevent authenticated users from reading all profiles (emails / membership info)
-- Strategy: remove the broad "Block anonymous SELECT" policy and keep only explicit owner/admin SELECT policies.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove the policy that can be interpreted as granting broad read access
DROP POLICY IF EXISTS "Block anonymous SELECT on profiles" ON public.profiles;

-- Recreate owner-only SELECT policy as PERMISSIVE + authenticated-only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Recreate admin SELECT policy as PERMISSIVE + authenticated-only
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));
