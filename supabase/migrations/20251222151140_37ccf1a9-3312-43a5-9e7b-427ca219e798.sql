-- Add RESTRICTIVE policy to explicitly block public/anonymous access to profiles
CREATE POLICY "Block public access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO public
USING (false);