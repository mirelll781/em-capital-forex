-- Add verification columns to ea_robot_subscriptions
ALTER TABLE public.ea_robot_subscriptions 
ADD COLUMN IF NOT EXISTS verification_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_ea_subscriptions_verification_token 
ON public.ea_robot_subscriptions(verification_token);

-- Update existing records to be verified (legacy subscribers)
UPDATE public.ea_robot_subscriptions SET verified = true WHERE verified IS NULL OR verified = false;