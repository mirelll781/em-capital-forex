-- Remove the overly permissive SELECT policy that allows any authenticated user to read
-- The existing "Only admins can view EA subscriptions" policy is sufficient
DROP POLICY IF EXISTS "Block anonymous SELECT on ea_robot_subscriptions" ON public.ea_robot_subscriptions;