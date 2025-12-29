-- Drop all existing overlapping policies on payment_history
DROP POLICY IF EXISTS "Admins can view all payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admins can insert payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Require authentication for payment_history" ON public.payment_history;
DROP POLICY IF EXISTS "Block anonymous SELECT on payment_history" ON public.payment_history;

-- Create simple PERMISSIVE policies with TO authenticated (blocks anonymous automatically)
-- SELECT: Users can view own payment history
CREATE POLICY "Users can view own payment history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- SELECT: Admins can view all payment history
CREATE POLICY "Admins can view all payment history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- INSERT: Only admins can insert payment records
CREATE POLICY "Admins can insert payment history"
ON public.payment_history
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- UPDATE: Only admins can update payment records
CREATE POLICY "Admins can update payment history"
ON public.payment_history
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- DELETE: Only admins can delete payment records
CREATE POLICY "Admins can delete payment history"
ON public.payment_history
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));