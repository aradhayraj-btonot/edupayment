-- Fix infinite recursion in RLS policy for public.user_roles by removing self-referential policy

-- Ensure RLS is enabled (should already be)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop the recursive policy if it exists
DROP POLICY IF EXISTS "Admins can manage roles in their school" ON public.user_roles;

-- Optional: drop any older variant names that might exist
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create non-recursive admin manage policies using SECURITY DEFINER function
-- NOTE: admin_has_school_access signature is (_school_id uuid/text, _user_id uuid/text)

CREATE POLICY "Admins can insert roles in their school"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.admin_has_school_access(user_roles.school_id, auth.uid())
);

CREATE POLICY "Admins can update roles in their school"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  public.admin_has_school_access(user_roles.school_id, auth.uid())
)
WITH CHECK (
  public.admin_has_school_access(user_roles.school_id, auth.uid())
);

CREATE POLICY "Admins can delete roles in their school"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.admin_has_school_access(user_roles.school_id, auth.uid())
);

-- Keep existing "Users can view own roles" and "Users can self-assign parent role only" policies as-is
