-- Add defense-in-depth RESTRICTIVE policies for signal_results
-- These require authentication as an additional layer beyond admin checks

-- Block anonymous INSERT (uses WITH CHECK for INSERT)
CREATE POLICY "Block anonymous INSERT on signal_results"
ON public.signal_results
AS RESTRICTIVE
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Block anonymous UPDATE  
CREATE POLICY "Block anonymous UPDATE on signal_results"
ON public.signal_results
AS RESTRICTIVE
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Block anonymous DELETE
CREATE POLICY "Block anonymous DELETE on signal_results"
ON public.signal_results
AS RESTRICTIVE
FOR DELETE
USING (auth.uid() IS NOT NULL);