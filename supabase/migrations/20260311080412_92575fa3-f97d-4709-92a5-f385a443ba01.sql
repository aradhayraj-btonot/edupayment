-- Restrict direct blog_poll_votes reads to team only; public uses the secure view
DROP POLICY IF EXISTS "Anyone can view vote counts" ON public.blog_poll_votes;
CREATE POLICY "Team can view raw votes"
ON public.blog_poll_votes FOR SELECT TO authenticated
USING (has_team_role(auth.uid()));