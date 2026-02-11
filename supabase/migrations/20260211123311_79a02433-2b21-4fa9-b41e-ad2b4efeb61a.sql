
-- Create challenge_questions table for sub-questions per challenge
CREATE TABLE public.challenge_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  flag TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 50,
  penalty_points INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenge_questions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage questions (full CRUD)
CREATE POLICY "Admins can manage challenge questions"
ON public.challenge_questions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create a public view that excludes the flag column
CREATE VIEW public.challenge_questions_public AS
SELECT id, challenge_id, question_text, points, penalty_points, sort_order, created_at
FROM public.challenge_questions;

-- Grant access to the public view
GRANT SELECT ON public.challenge_questions_public TO anon, authenticated;

-- Update submissions table to optionally reference a question
ALTER TABLE public.submissions ADD COLUMN question_id UUID REFERENCES public.challenge_questions(id) ON DELETE SET NULL;
