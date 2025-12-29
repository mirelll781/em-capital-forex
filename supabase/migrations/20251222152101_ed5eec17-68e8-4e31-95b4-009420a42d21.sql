-- Drop and recreate payment_history SELECT policies as PERMISSIVE for authenticated users only
DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admins can view all payment history" ON public.payment_history;

-- Recreate as PERMISSIVE policies targeting authenticated users
CREATE POLICY "Users can view own payment history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));