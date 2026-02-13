
-- Add point_adjustment column to profiles for admin manual adjustments
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS point_adjustment integer NOT NULL DEFAULT 0;

-- Fix leaderboard function: only count sub-question submissions, add point_adjustment
CREATE OR REPLACE FUNCTION public.get_leaderboard()
 RETURNS TABLE(user_id uuid, username text, total_points bigint, solved_count bigint, last_solve timestamp with time zone, player1_name text, player2_name text, player3_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    p.id AS user_id,
    p.username,
    GREATEST(0, 
      -- Points from sub-question correct submissions ONLY
      COALESCE((
        SELECT SUM(cq.points) 
        FROM public.submissions s2 
        JOIN public.challenge_questions cq ON cq.id = s2.question_id 
        WHERE s2.user_id = p.id AND s2.is_correct = true
      ), 0)
      - 
      -- Penalties from sub-question wrong submissions ONLY
      COALESCE((
        SELECT SUM(cq2.penalty_points) 
        FROM public.submissions s3 
        JOIN public.challenge_questions cq2 ON cq2.id = s3.question_id 
        WHERE s3.user_id = p.id AND s3.is_correct = false
      ), 0)
      +
      -- Admin point adjustment
      p.point_adjustment
    ) AS total_points,
    (SELECT COUNT(DISTINCT s4.challenge_id) 
     FROM public.submissions s4 
     WHERE s4.user_id = p.id AND s4.is_correct = true
    ) AS solved_count,
    (SELECT MAX(s5.submitted_at) 
     FROM public.submissions s5 
     WHERE s5.user_id = p.id AND s5.is_correct = true
    ) AS last_solve,
    p.player1_name,
    p.player2_name,
    p.player3_name
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin'
  )
  ORDER BY total_points DESC, solved_count DESC, last_solve ASC NULLS LAST
$function$;
