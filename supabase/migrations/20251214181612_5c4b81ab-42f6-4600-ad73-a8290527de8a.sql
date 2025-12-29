-- Drop the problematic "Service role has full access" policy
-- Service role already bypasses RLS by default, so this policy is not needed
-- and it's causing conflicts with user-specific policies
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;