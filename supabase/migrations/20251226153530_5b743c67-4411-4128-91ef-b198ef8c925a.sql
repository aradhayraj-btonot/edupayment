-- Fix Issue 1: Restrict role self-assignment to 'parent' only
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;

-- Create new policy that only allows users to self-assign 'parent' role
CREATE POLICY "Users can self-assign parent role only" 
ON user_roles FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() = user_id AND role = 'parent'::app_role
);

-- Fix Issue 2: Add school_id to user_roles for multi-tenant admin isolation
ALTER TABLE user_roles ADD COLUMN school_id uuid REFERENCES schools(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_user_roles_school_id ON user_roles(school_id);

-- Create a function to check if admin has access to a specific school
CREATE OR REPLACE FUNCTION public.admin_has_school_access(_user_id uuid, _school_id uuid)
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
      AND role = 'admin'::app_role
      AND school_id = _school_id
  )
$$;

-- Update students table policies to scope admin access to their schools
DROP POLICY IF EXISTS "Admins can manage students" ON students;
CREATE POLICY "Admins can manage students in their school" 
ON students FOR ALL TO authenticated
USING (
  admin_has_school_access(auth.uid(), school_id)
);

-- Update fee_structures table policies
DROP POLICY IF EXISTS "Admins can manage fee structures" ON fee_structures;
CREATE POLICY "Admins can manage fee structures in their school" 
ON fee_structures FOR ALL TO authenticated
USING (
  admin_has_school_access(auth.uid(), school_id)
);

-- Update notifications table policies
DROP POLICY IF EXISTS "Admins can manage notifications" ON notifications;
CREATE POLICY "Admins can manage notifications in their school" 
ON notifications FOR ALL TO authenticated
USING (
  admin_has_school_access(auth.uid(), school_id)
);

-- Update schools table policies - admins can only manage their own schools
DROP POLICY IF EXISTS "Admins can manage schools" ON schools;
CREATE POLICY "Admins can manage their own school" 
ON schools FOR ALL TO authenticated
USING (
  admin_has_school_access(auth.uid(), id)
);

-- Update payments table policies
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can update payments" ON payments;

CREATE POLICY "Admins can view payments in their school" 
ON payments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = payments.student_id
    AND admin_has_school_access(auth.uid(), s.school_id)
  )
);

CREATE POLICY "Admins can update payments in their school" 
ON payments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = payments.student_id
    AND admin_has_school_access(auth.uid(), s.school_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = payments.student_id
    AND admin_has_school_access(auth.uid(), s.school_id)
  )
);

-- Update profiles table policies - admins can only view profiles of parents in their school
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view profiles of parents in their school" 
ON profiles FOR SELECT TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM students s
    JOIN user_roles ur ON ur.user_id = auth.uid()
    WHERE s.parent_id = profiles.id
    AND ur.role = 'admin'::app_role
    AND ur.school_id = s.school_id
  )
);

-- Update student_fees policies
DROP POLICY IF EXISTS "Admins can manage student fees" ON student_fees;
CREATE POLICY "Admins can manage student fees in their school" 
ON student_fees FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_fees.student_id
    AND admin_has_school_access(auth.uid(), s.school_id)
  )
);

-- Update school_subscriptions policies
DROP POLICY IF EXISTS "Admins can manage their school subscriptions" ON school_subscriptions;
CREATE POLICY "Admins can manage subscriptions for their school" 
ON school_subscriptions FOR ALL TO authenticated
USING (
  admin_has_school_access(auth.uid(), school_id)
);

-- Update subscription_payments policies
DROP POLICY IF EXISTS "Admins can manage subscription payments" ON subscription_payments;
DROP POLICY IF EXISTS "Admins can view subscription payments" ON subscription_payments;

CREATE POLICY "Admins can manage subscription payments for their school" 
ON subscription_payments FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM school_subscriptions ss
    WHERE ss.id = subscription_payments.subscription_id
    AND admin_has_school_access(auth.uid(), ss.school_id)
  )
);

-- Update user_roles policies so admins can only manage roles in their school
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles in their school" 
ON user_roles FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'::app_role
    AND ur.school_id = user_roles.school_id
  )
);