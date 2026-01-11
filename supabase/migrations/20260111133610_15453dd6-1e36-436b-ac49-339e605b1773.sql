-- Add RESTRICTIVE policy to block anonymous SELECT access to profiles
CREATE POLICY "Block anonymous SELECT on profiles" 
ON public.profiles 
AS RESTRICTIVE
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Also add RESTRICTIVE policies for other operations to be thorough
CREATE POLICY "Block anonymous INSERT on profiles" 
ON public.profiles 
AS RESTRICTIVE
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Block anonymous UPDATE on profiles" 
ON public.profiles 
AS RESTRICTIVE
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Block anonymous DELETE on profiles" 
ON public.profiles 
AS RESTRICTIVE
FOR DELETE 
USING (auth.uid() IS NOT NULL);