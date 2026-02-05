
-- Create a public view excluding the flag column
CREATE VIEW public.challenges_public AS
  SELECT id, title, description, category, points, file_url, file_name, is_active, created_at, updated_at
  FROM public.challenges
  WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.challenges_public TO authenticated;
GRANT SELECT ON public.challenges_public TO anon;

-- Drop existing policies and recreate so only admins can access the base table
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;
DROP POLICY IF EXISTS "Authenticated users can view active challenges" ON public.challenges;

-- Only admins can access the base table (includes flag column)
CREATE POLICY "Admins can manage challenges"
ON public.challenges
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
