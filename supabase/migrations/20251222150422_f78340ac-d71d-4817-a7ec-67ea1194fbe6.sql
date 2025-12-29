-- Create a function to check rate limiting for EA subscriptions
CREATE OR REPLACE FUNCTION public.check_ea_subscription_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_attempts INTEGER;
  existing_subscription BOOLEAN;
BEGIN
  -- Check if email already exists (prevent duplicates)
  SELECT EXISTS (
    SELECT 1 FROM public.ea_robot_subscriptions 
    WHERE LOWER(email) = LOWER(NEW.email)
  ) INTO existing_subscription;
  
  IF existing_subscription THEN
    RAISE EXCEPTION 'Email already subscribed: %', NEW.email;
  END IF;
  
  -- Count subscriptions in the last 10 minutes from any source (rate limiting)
  -- This uses a simple approach - count all recent inserts
  SELECT COUNT(*) INTO recent_attempts
  FROM public.ea_robot_subscriptions
  WHERE subscribed_at > NOW() - INTERVAL '10 minutes';
  
  -- Allow max 10 subscriptions per 10 minutes globally to prevent flooding
  IF recent_attempts > 10 THEN
    RAISE EXCEPTION 'Too many subscription attempts. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run before INSERT
DROP TRIGGER IF EXISTS check_ea_rate_limit_trigger ON public.ea_robot_subscriptions;

CREATE TRIGGER check_ea_rate_limit_trigger
  BEFORE INSERT ON public.ea_robot_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_ea_subscription_rate_limit();