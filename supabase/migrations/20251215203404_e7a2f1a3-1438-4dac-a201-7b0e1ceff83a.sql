-- Add SELECT policy for admins only on ea_robot_subscriptions
CREATE POLICY "Admins can view EA subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));