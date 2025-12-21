-- Drop existing trigger if exists and recreate on correct schema
DROP TRIGGER IF EXISTS on_profile_created_link_students ON public.profiles;
DROP TRIGGER IF EXISTS on_student_created_assign_fees ON public.students;

-- Create trigger on profiles to link students when parent signs up
CREATE TRIGGER on_profile_created_link_students
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.link_student_to_parent();

-- Create trigger on students to assign fees when student is added
CREATE TRIGGER on_student_created_assign_fees
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_monthly_fees_to_student();