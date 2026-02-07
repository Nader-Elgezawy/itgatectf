
-- Add player name columns to profiles for team support
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS player1_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS player2_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS player3_name text;
