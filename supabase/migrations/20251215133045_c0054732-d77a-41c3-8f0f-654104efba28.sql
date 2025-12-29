-- Remove the public SELECT policy that exposes emails
DROP POLICY IF EXISTS "Check if email exists" ON public.ea_robot_subscriptions;

-- Create a security definer function to check if email exists (doesn't expose data)
CREATE OR REPLACE FUNCTION public.check_ea_subscription_exists(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ea_robot_subscriptions
    WHERE LOWER(email) = LOWER(check_email)
  )
$$;