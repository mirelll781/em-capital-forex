-- Add paid_at column to track when user paid
ALTER TABLE public.profiles 
ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;