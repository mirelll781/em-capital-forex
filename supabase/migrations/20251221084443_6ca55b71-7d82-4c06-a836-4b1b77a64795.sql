-- Fix ea_robot_subscriptions SELECT policies
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view EA subscriptions" ON public.ea_robot_subscriptions;
DROP POLICY IF EXISTS "Deny anonymous SELECT on ea_subscriptions" ON public.ea_robot_subscriptions;

-- Create PERMISSIVE policy that only allows admins to SELECT
CREATE POLICY "Only admins can view EA subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));