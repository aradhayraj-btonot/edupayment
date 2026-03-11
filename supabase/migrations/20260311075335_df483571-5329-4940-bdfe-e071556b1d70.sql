
-- Fix schools table: replace overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view schools" ON schools;
CREATE POLICY "Users can view their associated schools"
ON schools FOR SELECT TO authenticated
USING (
  admin_has_school_access(auth.uid(), id)
  OR EXISTS (
    SELECT 1 FROM students s
    WHERE s.school_id = schools.id
    AND s.parent_id = auth.uid()
  )
  OR has_team_role(auth.uid())
);

-- Fix school_subscriptions table: remove parent access to subscription details
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON school_subscriptions;
CREATE POLICY "Users can view their school subscriptions"
ON school_subscriptions FOR SELECT TO authenticated
USING (
  admin_has_school_access(auth.uid(), school_id)
  OR has_team_role(auth.uid())
  OR EXISTS (
    SELECT 1 FROM students s
    WHERE s.school_id = school_subscriptions.school_id
    AND s.parent_id = auth.uid()
  )
);

-- Fix fee_structures table: scope to own school only
DROP POLICY IF EXISTS "Authenticated users can view fee structures" ON fee_structures;
CREATE POLICY "Users can view their school fee structures"
ON fee_structures FOR SELECT TO authenticated
USING (
  admin_has_school_access(auth.uid(), school_id)
  OR EXISTS (
    SELECT 1 FROM students s
    WHERE s.school_id = fee_structures.school_id
    AND s.parent_id = auth.uid()
  )
  OR has_team_role(auth.uid())
);
