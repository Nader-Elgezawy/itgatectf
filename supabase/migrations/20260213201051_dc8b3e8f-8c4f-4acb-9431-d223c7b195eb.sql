
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
      -- Points from sub-question correct submissions (distinct question_id)
      COALESCE((
        SELECT SUM(sub.pts) FROM (
          SELECT DISTINCT ON (s2.question_id) cq.points as pts
          FROM public.submissions s2 
          JOIN public.challenge_questions cq ON cq.id = s2.question_id 
          WHERE s2.user_id = p.id AND s2.is_correct = true
        ) sub
      ), 0)
      +
      -- Points from challenge-level correct submissions ONLY for challenges
      -- where user has NO sub-question correct submissions (distinct challenge_id)
      COALESCE((
        SELECT SUM(sub.pts) FROM (
          SELECT DISTINCT ON (s2.challenge_id) c2.points as pts
          FROM public.submissions s2 
          JOIN public.challenges c2 ON c2.id = s2.challenge_id 
          WHERE s2.user_id = p.id AND s2.is_correct = true AND s2.question_id IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM public.submissions s3 
              WHERE s3.user_id = p.id AND s3.challenge_id = s2.challenge_id 
                AND s3.is_correct = true AND s3.question_id IS NOT NULL
            )
        ) sub
      ), 0)
      - 
      -- Penalties from sub-question wrong submissions
      COALESCE((
        SELECT SUM(cq2.penalty_points) 
        FROM public.submissions s3 
        JOIN public.challenge_questions cq2 ON cq2.id = s3.question_id 
        WHERE s3.user_id = p.id AND s3.is_correct = false
      ), 0)
      -
      -- Penalties from challenge-level wrong submissions
      COALESCE((
        SELECT SUM(c3.penalty_points) 
        FROM public.submissions s3 
        JOIN public.challenges c3 ON c3.id = s3.challenge_id 
        WHERE s3.user_id = p.id AND s3.is_correct = false AND s3.question_id IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM public.submissions s4 
            WHERE s4.user_id = p.id AND s4.challenge_id = s3.challenge_id 
              AND s4.is_correct = true AND s4.question_id IS NOT NULL
          )
      ), 0)
      +
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
