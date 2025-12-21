-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also create a function to auto-assign a default role on signup if needed
-- This trigger will run after the profile is created, assigning a default role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only insert if no role exists yet (to avoid duplicates)
  INSERT INTO public.user_roles (user_id, role)
  SELECT NEW.id, 'parent'::app_role
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = NEW.id
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-assigning default role after profile creation
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();