
DROP FUNCTION IF EXISTS public.get_leaderboard();

CREATE FUNCTION public.get_leaderboard()
 RETURNS TABLE(user_id uuid, username text, total_points bigint, solved_count bigint, last_solve timestamp with time zone, player1_name text, player2_name text, player3_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT 
    p.id AS user_id,
    p.username,
    GREATEST(0, 
      COALESCE((
        SELECT SUM(c2.points) 
        FROM public.submissions s2 
        JOIN public.challenges c2 ON c2.id = s2.challenge_id 
        WHERE s2.user_id = p.id AND s2.is_correct = true
      ), 0) 
      - 
      COALESCE((
        SELECT SUM(c3.penalty_points) 
        FROM public.submissions s3 
        JOIN public.challenges c3 ON c3.id = s3.challenge_id 
        WHERE s3.user_id = p.id AND s3.is_correct = false
      ), 0)
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
$$;
