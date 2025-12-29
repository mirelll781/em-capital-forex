-- Fix ea_robot_subscriptions SELECT policies to ensure ONLY admins can view

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Admins can view EA subscriptions" ON public.ea_robot_subscriptions;
DROP POLICY IF EXISTS "Block anonymous SELECT on ea_robot_subscriptions" ON public.ea_robot_subscriptions;

-- Create single, clear admin-only SELECT policy
CREATE POLICY "Only admins can view EA subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));