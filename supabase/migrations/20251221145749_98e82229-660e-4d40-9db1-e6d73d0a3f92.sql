-- Create indexes to speed up email matching
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON public.profiles (lower(email));
CREATE INDEX IF NOT EXISTS idx_students_parent_email_lower ON public.students (lower(parent_email));

-- Trigger: when a parent profile is created, link existing students by parent_email
DROP TRIGGER IF EXISTS trg_link_student_to_parent_on_profile_insert ON public.profiles;
CREATE TRIGGER trg_link_student_to_parent_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.link_student_to_parent();

-- Trigger: when a student row is created/updated, link to parent if parent_email matches an existing profile
DROP TRIGGER IF EXISTS trg_link_student_on_student_insert_update ON public.students;
CREATE TRIGGER trg_link_student_on_student_insert_update
BEFORE INSERT OR UPDATE OF parent_email, parent_id ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.link_student_on_student_change();
