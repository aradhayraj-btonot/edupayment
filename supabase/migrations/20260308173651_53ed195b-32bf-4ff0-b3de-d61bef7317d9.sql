
-- FIX 1: Swapped arguments in admin user_roles policies
DROP POLICY IF EXISTS "Admins can delete roles in their school" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles in their school" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles in their school" ON public.user_roles;

CREATE POLICY "Admins can delete roles in their school"
ON public.user_roles FOR DELETE TO authenticated
USING (admin_has_school_access(auth.uid(), school_id));

CREATE POLICY "Admins can insert roles in their school"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (admin_has_school_access(auth.uid(), school_id));

CREATE POLICY "Admins can update roles in their school"
ON public.user_roles FOR UPDATE TO authenticated
USING (admin_has_school_access(auth.uid(), school_id))
WITH CHECK (admin_has_school_access(auth.uid(), school_id));

-- FIX 2: Restrict school_subscriptions to authenticated users with school access
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON public.school_subscriptions;
CREATE POLICY "Authenticated users can view subscriptions"
ON public.school_subscriptions FOR SELECT TO authenticated
USING (
  admin_has_school_access(auth.uid(), school_id)
  OR has_team_role(auth.uid())
  OR EXISTS (
    SELECT 1 FROM students s WHERE s.parent_id = auth.uid() AND s.school_id = school_subscriptions.school_id
  )
);

-- FIX 3: Restrict fee_structures to users' own school
DROP POLICY IF EXISTS "Authenticated users can view fee structures" ON public.fee_structures;
CREATE POLICY "Authenticated users can view fee structures"
ON public.fee_structures FOR SELECT TO authenticated
USING (
  admin_has_school_access(auth.uid(), school_id)
  OR has_team_role(auth.uid())
  OR EXISTS (
    SELECT 1 FROM students s WHERE s.parent_id = auth.uid() AND s.school_id = fee_structures.school_id
  )
);

-- FIX 4: Restrict schools table to users' own school
DROP POLICY IF EXISTS "Authenticated users can view schools" ON public.schools;
CREATE POLICY "Authenticated users can view schools"
ON public.schools FOR SELECT TO authenticated
USING (
  admin_has_school_access(auth.uid(), id)
  OR has_team_role(auth.uid())
  OR EXISTS (
    SELECT 1 FROM students s WHERE s.parent_id = auth.uid() AND s.school_id = schools.id
  )
);

-- FIX 5: Prevent duplicate blog poll votes
DROP POLICY IF EXISTS "Anyone can vote once" ON public.blog_poll_votes;
CREATE POLICY "One vote per poll per user or IP"
ON public.blog_poll_votes FOR INSERT
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM blog_poll_votes bpv
    WHERE bpv.poll_id = blog_poll_votes.poll_id
      AND (
        (auth.uid() IS NOT NULL AND bpv.voter_id = auth.uid())
        OR (auth.uid() IS NULL AND bpv.voter_ip = blog_poll_votes.voter_ip)
      )
  )
);
