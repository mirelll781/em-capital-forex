-- Add explicit authentication check for profiles table
-- Drop the existing deny policy and recreate with better approach
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Create RESTRICTIVE policy requiring authentication for all operations
CREATE POLICY "Require authentication for profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Add explicit authentication check for payment_history table
DROP POLICY IF EXISTS "Deny anonymous access to payment_history" ON public.payment_history;

-- Create RESTRICTIVE policy requiring authentication for all operations
CREATE POLICY "Require authentication for payment_history"
ON public.payment_history
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Add RESTRICTIVE policy to deny SELECT for non-admins on ea_robot_subscriptions
-- The table already denies anonymous INSERT (Permissive: No), but we need to ensure SELECT is protected
CREATE POLICY "Deny anonymous SELECT on ea_subscriptions"
ON public.ea_robot_subscriptions
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);