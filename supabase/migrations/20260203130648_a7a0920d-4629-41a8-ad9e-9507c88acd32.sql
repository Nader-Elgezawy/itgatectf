-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 100,
  flag TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  submitted_flag TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin());

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Challenges policies
CREATE POLICY "Authenticated users can view active challenges"
ON public.challenges FOR SELECT
TO authenticated
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage challenges"
ON public.challenges FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Submissions policies
CREATE POLICY "Users can view their own submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Users can create submissions"
ON public.submissions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  total_points BIGINT,
  solved_count BIGINT,
  last_solve TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id AS user_id,
    p.username,
    COALESCE(SUM(c.points), 0) AS total_points,
    COUNT(DISTINCT s.challenge_id) AS solved_count,
    MAX(s.submitted_at) AS last_solve
  FROM public.profiles p
  LEFT JOIN public.submissions s ON s.user_id = p.id AND s.is_correct = true
  LEFT JOIN public.challenges c ON c.id = s.challenge_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin'
  )
  GROUP BY p.id, p.username
  ORDER BY total_points DESC, solved_count DESC, last_solve ASC NULLS LAST
$$;

-- Function to check if user solved a challenge
CREATE OR REPLACE FUNCTION public.has_solved_challenge(_user_id UUID, _challenge_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.submissions
    WHERE user_id = _user_id 
      AND challenge_id = _challenge_id 
      AND is_correct = true
  )
$$;

-- Trigger to update challenges updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for challenge files
INSERT INTO storage.buckets (id, name, public) VALUES ('challenge-files', 'challenge-files', true);

-- Storage policies
CREATE POLICY "Anyone can view challenge files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'challenge-files');

CREATE POLICY "Admins can upload challenge files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'challenge-files' AND public.is_admin());

CREATE POLICY "Admins can delete challenge files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'challenge-files' AND public.is_admin());