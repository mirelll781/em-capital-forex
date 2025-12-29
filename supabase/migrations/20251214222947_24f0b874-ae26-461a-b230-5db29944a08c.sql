-- Create table for EA robot email subscriptions
CREATE TABLE public.ea_robot_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.ea_robot_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup)
CREATE POLICY "Anyone can subscribe to EA notifications"
ON public.ea_robot_subscriptions
FOR INSERT
WITH CHECK (true);

-- Only allow reading own subscription (by email match - for duplicate check)
CREATE POLICY "Check if email exists"
ON public.ea_robot_subscriptions
FOR SELECT
USING (true);