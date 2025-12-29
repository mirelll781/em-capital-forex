-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Deny public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Drop all existing policies on payment_history
DROP POLICY IF EXISTS "Deny public access to payment_history" ON public.payment_history;
DROP POLICY IF EXISTS "Admins can view all payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admins can insert payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;

-- Create PERMISSIVE policies for profiles (only for authenticated role)
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create PERMISSIVE policies for payment_history (only for authenticated role)
CREATE POLICY "Admins can view all payment history" ON public.payment_history
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert payment history" ON public.payment_history
FOR INSERT TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view own payment history" ON public.payment_history
FOR SELECT TO authenticated
USING (auth.uid() = user_id);