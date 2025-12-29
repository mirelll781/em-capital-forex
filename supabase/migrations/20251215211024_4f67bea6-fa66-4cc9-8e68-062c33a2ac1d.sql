-- Add explicit deny policies for anonymous/unauthenticated users
-- This prevents any public access to sensitive data

-- Deny anonymous access to profiles table
CREATE POLICY "Deny public access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);

-- Deny anonymous access to payment_history table
CREATE POLICY "Deny public access to payment_history" 
ON public.payment_history 
FOR ALL 
TO anon 
USING (false);