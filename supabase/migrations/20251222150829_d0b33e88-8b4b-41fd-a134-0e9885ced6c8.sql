-- Drop the conflicting deny policy (not needed since there's no permissive policy for anon)
DROP POLICY IF EXISTS "Deny anonymous SELECT on ea_robot_subscriptions" ON public.ea_robot_subscriptions;

-- Drop and recreate the admin SELECT policy as PERMISSIVE
DROP POLICY IF EXISTS "Only admins can view EA subscriptions" ON public.ea_robot_subscriptions;

CREATE POLICY "Only admins can view EA subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));