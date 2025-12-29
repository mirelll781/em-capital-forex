-- Add RLS policies for signal_results table to restrict write operations to admins only

-- Allow admins to insert signal results
CREATE POLICY "Admins can insert signal results"
ON public.signal_results
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Allow admins to update signal results
CREATE POLICY "Admins can update signal results"
ON public.signal_results
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Allow admins to delete signal results
CREATE POLICY "Admins can delete signal results"
ON public.signal_results
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));