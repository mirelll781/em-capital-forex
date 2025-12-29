-- Add admin_notes field to profiles table
ALTER TABLE public.profiles
ADD COLUMN admin_notes text;