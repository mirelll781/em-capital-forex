-- Remove the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can subscribe to EA notifications" ON public.ea_robot_subscriptions;

-- Add restrictive policy to block anonymous access
CREATE POLICY "Block anonymous INSERT on ea_robot_subscriptions" 
ON public.ea_robot_subscriptions 
AS RESTRICTIVE
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add policy allowing authenticated users to subscribe
CREATE POLICY "Authenticated users can subscribe to EA notifications" 
ON public.ea_robot_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);