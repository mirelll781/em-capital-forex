-- Add explicit UPDATE and DELETE policies for ea_robot_subscriptions (admins only)

CREATE POLICY "Only admins can update EA subscriptions"
ON public.ea_robot_subscriptions
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete EA subscriptions"
ON public.ea_robot_subscriptions
FOR DELETE
USING (is_admin(auth.uid()));