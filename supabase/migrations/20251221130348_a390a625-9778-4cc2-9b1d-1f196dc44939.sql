-- Fix ea_robot_subscriptions: Update admin SELECT policy to explicitly require authentication
DROP POLICY IF EXISTS "Only admins can view EA subscriptions" ON public.ea_robot_subscriptions;

CREATE POLICY "Only admins can view EA subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Fix profiles: Add explicit blocking policy for anonymous SELECT
-- The existing PERMISSIVE policies already use TO authenticated, but we need
-- to ensure there's no gap. Let's verify by adding a restrictive block.
CREATE POLICY "Block anonymous SELECT on profiles"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);