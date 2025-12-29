-- Eksplicitno blokiraj anonimni pristup za profiles tabelu
CREATE POLICY "Deny anonymous access to profiles" ON public.profiles
FOR ALL TO anon
USING (false);

-- Eksplicitno blokiraj anonimni pristup za payment_history tabelu
CREATE POLICY "Deny anonymous access to payment_history" ON public.payment_history
FOR ALL TO anon
USING (false);

-- Eksplicitno blokiraj anonimni SELECT pristup za ea_robot_subscriptions
CREATE POLICY "Deny anonymous select on ea_subscriptions" ON public.ea_robot_subscriptions
FOR SELECT TO anon
USING (false);