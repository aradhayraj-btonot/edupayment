-- Link students to existing parent accounts when a student is created/updated

CREATE OR REPLACE FUNCTION public.link_student_on_student_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
BEGIN
  -- Only attempt linking if parent_id is not already set and parent_email is provided
  IF NEW.parent_id IS NULL AND NEW.parent_email IS NOT NULL AND length(trim(NEW.parent_email)) > 0 THEN
    SELECT p.id
    INTO v_parent_id
    FROM public.profiles p
    WHERE lower(p.email) = lower(trim(NEW.parent_email))
    ORDER BY p.created_at ASC
    LIMIT 1;

    IF v_parent_id IS NOT NULL THEN
      NEW.parent_id := v_parent_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on students
DROP TRIGGER IF EXISTS on_student_change_link_parent ON public.students;
CREATE TRIGGER on_student_change_link_parent
  BEFORE INSERT OR UPDATE OF parent_email ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.link_student_on_student_change();
