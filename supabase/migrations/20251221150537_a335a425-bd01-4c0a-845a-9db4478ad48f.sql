-- Attach trigger for creating profiles when new users sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Attach trigger for linking students when profile is created
DROP TRIGGER IF EXISTS trg_link_student_to_parent_on_profile_insert ON public.profiles;
CREATE TRIGGER trg_link_student_to_parent_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.link_student_to_parent();

-- Attach trigger for linking students when student is created/updated
DROP TRIGGER IF EXISTS trg_link_student_on_student_insert_update ON public.students;
CREATE TRIGGER trg_link_student_on_student_insert_update
BEFORE INSERT OR UPDATE OF parent_email, parent_id ON public.students
FOR EACH ROW EXECUTE FUNCTION public.link_student_on_student_change();

-- Create missing profiles for existing users
INSERT INTO public.profiles (id, full_name, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.email),
  au.email
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id);

-- Now link existing students to their parent profiles
UPDATE public.students s
SET parent_id = p.id
FROM public.profiles p
WHERE s.parent_id IS NULL
  AND s.parent_email IS NOT NULL
  AND lower(trim(s.parent_email)) = lower(trim(p.email));