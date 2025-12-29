-- Add explicit deny-all policies for admin_users to satisfy linter while keeping table inaccessible from client
-- (SECURITY DEFINER function public.is_admin() still works)
CREATE POLICY "Deny all select on admin_users"
ON public.admin_users
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Deny all insert on admin_users"
ON public.admin_users
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Deny all update on admin_users"
ON public.admin_users
FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny all delete on admin_users"
ON public.admin_users
FOR DELETE
TO anon, authenticated
USING (false);