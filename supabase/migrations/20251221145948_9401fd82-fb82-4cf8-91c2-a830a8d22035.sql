-- Fix email normalization when linking parent profiles to existing students
CREATE OR REPLACE FUNCTION public.link_student_to_parent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update students where parent_email matches the new user's email (case/whitespace insensitive)
  UPDATE public.students s
  SET parent_id = NEW.id
  WHERE s.parent_id IS NULL
    AND s.parent_email IS NOT NULL
    AND lower(trim(s.parent_email)) = lower(trim(NEW.email));

  RETURN NEW;
END;
$$;
