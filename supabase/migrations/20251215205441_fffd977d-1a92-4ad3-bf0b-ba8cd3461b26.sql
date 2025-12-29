-- Add blocked field to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_blocked boolean DEFAULT false;

-- Add blocked_at timestamp
ALTER TABLE public.profiles
ADD COLUMN blocked_at timestamp with time zone;