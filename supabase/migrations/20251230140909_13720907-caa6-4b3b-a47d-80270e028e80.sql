-- Fix profiles table RLS policies
-- Drop existing RESTRICTIVE SELECT policies and recreate as PERMISSIVE

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create PERMISSIVE policies for SELECT
CREATE POLICY "Users can view own profile"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Fix payment_history table RLS policies
DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admins can view all payment history" ON public.payment_history;

-- Create PERMISSIVE policies for SELECT
CREATE POLICY "Users can view own payment history"
ON public.payment_history
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment history"
ON public.payment_history
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Add RESTRICTIVE policy to block anonymous SELECT on payment_history
CREATE POLICY "Block anonymous SELECT on payment_history"
ON public.payment_history
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);