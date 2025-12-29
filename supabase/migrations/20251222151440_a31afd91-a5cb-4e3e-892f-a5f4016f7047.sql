-- Drop the blocking policy that conflicts with other policies
DROP POLICY IF EXISTS "Block public access to profiles" ON public.profiles;

-- Drop and recreate user/admin SELECT policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate as PERMISSIVE policies (default) - these require auth.uid() which is null for anonymous users
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));