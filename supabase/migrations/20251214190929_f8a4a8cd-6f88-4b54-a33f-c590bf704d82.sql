-- Add telegram_chat_id column to store user's Telegram chat ID for notifications
ALTER TABLE public.profiles 
ADD COLUMN telegram_chat_id BIGINT;