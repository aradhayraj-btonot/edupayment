
-- FIX: Split parent payments policy - remove UPDATE/DELETE access
DROP POLICY IF EXISTS "Parents can view and create their payments" ON public.payments;

CREATE POLICY "Parents can view their payments"
ON public.payments FOR SELECT TO authenticated
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create their payments"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = parent_id);

-- FIX: Hide voter_ip by restricting blog_poll_votes SELECT to exclude sensitive data
DROP POLICY IF EXISTS "Anyone can view vote counts" ON public.blog_poll_votes;
CREATE POLICY "Anyone can view vote counts"
ON public.blog_poll_votes FOR SELECT
USING (true);

-- Create a secure view without voter_ip for public use
CREATE OR REPLACE VIEW public.blog_poll_vote_counts AS
SELECT id, poll_id, option_index, created_at
FROM public.blog_poll_votes;
