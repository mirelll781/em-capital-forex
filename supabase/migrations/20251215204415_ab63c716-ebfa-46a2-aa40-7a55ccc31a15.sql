-- Deny anonymous SELECT access to profiles table
CREATE POLICY "Deny anonymous select on profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous SELECT access to payment_history table
CREATE POLICY "Deny anonymous select on payment_history"
ON public.payment_history
FOR SELECT
TO anon
USING (false);