-- Create admin_users table for storing admin emails
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- No public access to admin_users table (only accessible via function)

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    JOIN auth.users u ON LOWER(u.email) = LOWER(au.email)
    WHERE u.id = check_user_id
  )
$$;

-- Create policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create policy for admins to view all payment history
CREATE POLICY "Admins can view all payment history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create policy for admins to insert payment history
CREATE POLICY "Admins can insert payment history"
ON public.payment_history
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Insert your admin email (you can add more later)
INSERT INTO public.admin_users (email) VALUES ('emcapital3@gmail.com');