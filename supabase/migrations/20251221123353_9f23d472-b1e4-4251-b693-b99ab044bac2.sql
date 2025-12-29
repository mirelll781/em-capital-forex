-- Add explicit policies to block anonymous SELECT access

-- For profiles table - explicit SELECT block for anonymous users
CREATE POLICY "Block anonymous SELECT on profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- For payment_history table - explicit SELECT block for anonymous users  
CREATE POLICY "Block anonymous SELECT on payment_history"
ON public.payment_history
FOR SELECT
USING (auth.uid() IS NOT NULL);