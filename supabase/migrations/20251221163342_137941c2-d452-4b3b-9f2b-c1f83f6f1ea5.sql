-- Fix RLS policies on ea_robot_subscriptions table
-- Drop existing restrictive policies and recreate as permissive where needed

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can subscribe to EA notifications" ON public.ea_robot_subscriptions;
DROP POLICY IF EXISTS "Only admins can update EA subscriptions" ON public.ea_robot_subscriptions;
DROP POLICY IF EXISTS "Only admins can delete EA subscriptions" ON public.ea_robot_subscriptions;
DROP POLICY IF EXISTS "Only admins can view EA subscriptions" ON public.ea_robot_subscriptions;

-- Create proper PERMISSIVE policies for admins
CREATE POLICY "Admins can view EA subscriptions"
ON public.ea_robot_subscriptions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update EA subscriptions"
ON public.ea_robot_subscriptions
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete EA subscriptions"
ON public.ea_robot_subscriptions
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Allow public inserts (for subscription form) but only for authenticated or anon role
CREATE POLICY "Anyone can subscribe to EA notifications"
ON public.ea_robot_subscriptions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Add explicit RESTRICTIVE policy to block anonymous SELECT
CREATE POLICY "Block anonymous SELECT on ea_robot_subscriptions"
ON public.ea_robot_subscriptions
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);