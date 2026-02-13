
-- Allow admins to insert submissions on behalf of users
CREATE POLICY "Admins can insert submissions"
ON public.submissions
FOR INSERT
WITH CHECK (is_admin());

-- Allow admins to delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.submissions
FOR DELETE
USING (is_admin());
