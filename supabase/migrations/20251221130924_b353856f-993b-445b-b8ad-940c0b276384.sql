-- Add foreign key constraint for data integrity (if not exists)
-- This ensures payment_history records are always linked to valid profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_history_user_id_fkey'
  ) THEN
    ALTER TABLE public.payment_history
    ADD CONSTRAINT payment_history_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;