-- Drop the restrictive policy that doesn't work as expected
DROP POLICY IF EXISTS "Deny anonymous select on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous select on payment_history" ON public.payment_history;

-- Update existing policies to explicitly require authentication
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
CREATE POLICY "Users can view own payment history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payment history" ON public.payment_history;
CREATE POLICY "Admins can view all payment history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));