-- Create a function to check if user has team role
CREATE OR REPLACE FUNCTION public.has_team_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'team'::app_role
  )
$$;

-- RLS policy for team members to view ALL schools
CREATE POLICY "Team can view all schools"
ON public.schools
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team members to manage ALL schools
CREATE POLICY "Team can manage all schools"
ON public.schools
FOR ALL
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all students
CREATE POLICY "Team can view all students"
ON public.students
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all profiles
CREATE POLICY "Team can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all user_roles
CREATE POLICY "Team can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to manage all user_roles
CREATE POLICY "Team can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all payments
CREATE POLICY "Team can view all payments"
ON public.payments
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all subscriptions
CREATE POLICY "Team can view all subscriptions"
ON public.school_subscriptions
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to manage all subscriptions
CREATE POLICY "Team can manage all subscriptions"
ON public.school_subscriptions
FOR ALL
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all subscription payments
CREATE POLICY "Team can view all subscription payments"
ON public.subscription_payments
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to manage subscription payments
CREATE POLICY "Team can manage subscription payments"
ON public.subscription_payments
FOR ALL
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all fee structures
CREATE POLICY "Team can view all fee structures"
ON public.fee_structures
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all student fees
CREATE POLICY "Team can view all student fees"
ON public.student_fees
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));

-- RLS policy for team to view all notifications
CREATE POLICY "Team can view all notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (public.has_team_role(auth.uid()));