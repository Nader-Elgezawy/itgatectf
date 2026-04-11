
ALTER TABLE public.challenges ADD COLUMN flag_placeholder text DEFAULT 'flag{...}';
ALTER TABLE public.challenge_questions ADD COLUMN flag_placeholder text DEFAULT 'flag{...}';

-- Recreate the public view to include flag_placeholder
CREATE OR REPLACE VIEW public.challenge_questions_public AS
SELECT id, challenge_id, question_text, points, penalty_points, sort_order, created_at, flag_placeholder
FROM public.challenge_questions;
