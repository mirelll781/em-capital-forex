-- Block anonymous SELECT on profiles table
CREATE POLICY "Block anonymous SELECT on profiles"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Block anonymous SELECT on signal_results table  
CREATE POLICY "Block anonymous SELECT on signal_results"
ON public.signal_results
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);