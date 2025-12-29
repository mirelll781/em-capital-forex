-- Add explicit policy to block anonymous SELECT access to ea_robot_subscriptions
CREATE POLICY "Block anonymous SELECT on ea_robot_subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
USING (auth.uid() IS NOT NULL);