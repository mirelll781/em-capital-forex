-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Only admins can view EA subscriptions" ON public.ea_robot_subscriptions;

-- Create a proper permissive SELECT policy for authenticated admins only
CREATE POLICY "Only admins can view EA subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Add explicit denial for anonymous users on SELECT
CREATE POLICY "Deny anonymous SELECT on ea_robot_subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
TO anon
USING (false);