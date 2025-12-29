-- Create a function to restrict which fields users can update
CREATE OR REPLACE FUNCTION public.restrict_profile_update_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is admin, allow all updates
  IF is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  
  -- For regular users, only allow updating these fields:
  -- email_notifications, telegram_notifications, avatar_url
  -- Revert any changes to restricted fields
  NEW.membership_type := OLD.membership_type;
  NEW.paid_at := OLD.paid_at;
  NEW.paid_until := OLD.paid_until;
  NEW.is_blocked := OLD.is_blocked;
  NEW.blocked_at := OLD.blocked_at;
  NEW.admin_notes := OLD.admin_notes;
  NEW.telegram_chat_id := OLD.telegram_chat_id;
  NEW.telegram_username := OLD.telegram_username;
  NEW.email := OLD.email;
  NEW.user_id := OLD.user_id;
  NEW.id := OLD.id;
  NEW.created_at := OLD.created_at;
  
  -- Allow updating: email_notifications, telegram_notifications, avatar_url, updated_at
  -- These are implicitly allowed by not being reverted above
  
  RETURN NEW;
END;
$$;

-- Create trigger to run before UPDATE
DROP TRIGGER IF EXISTS restrict_profile_update_trigger ON public.profiles;

CREATE TRIGGER restrict_profile_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.restrict_profile_update_fields();