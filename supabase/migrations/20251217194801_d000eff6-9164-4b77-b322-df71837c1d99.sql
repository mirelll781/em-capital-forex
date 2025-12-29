-- Drop existing SELECT policies on ea_robot_subscriptions
DROP POLICY IF EXISTS "Admins can view EA subscriptions" ON public.ea_robot_subscriptions;
DROP POLICY IF EXISTS "Deny anonymous select on ea_subscriptions" ON public.ea_robot_subscriptions;

-- Create a PERMISSIVE SELECT policy for admins only
CREATE POLICY "Admins can view EA subscriptions" 
ON public.ea_robot_subscriptions 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));