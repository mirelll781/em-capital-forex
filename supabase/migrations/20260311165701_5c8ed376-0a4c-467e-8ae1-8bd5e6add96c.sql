CREATE TABLE public.blocked_bot_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_chat_id bigint NOT NULL UNIQUE,
  telegram_username text,
  reason text,
  blocked_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_bot_users ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (used by edge functions)
CREATE POLICY "Deny all access to blocked_bot_users" ON public.blocked_bot_users
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);