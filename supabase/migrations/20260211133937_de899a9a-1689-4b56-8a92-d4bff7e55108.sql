
-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL UNIQUE,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  player3_name TEXT NOT NULL,
  team_email TEXT NOT NULL UNIQUE,
  team_password_hash TEXT NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Only admins can manage teams
CREATE POLICY "Admins can manage teams"
  ON public.teams
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
