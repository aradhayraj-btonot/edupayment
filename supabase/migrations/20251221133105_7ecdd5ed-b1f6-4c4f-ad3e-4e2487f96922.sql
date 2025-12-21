-- Add parent_email to students table to link with parent accounts
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_email text;

-- Add UPI payment details to schools table
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS upi_id text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS upi_qr_code_url text;

-- Create a function to automatically link student to parent when parent registers
-- This will update the student's parent_id when a user with matching email signs up
CREATE OR REPLACE FUNCTION public.link_student_to_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update students where parent_email matches the new user's email
  UPDATE public.students
  SET parent_id = NEW.id
  WHERE parent_email = NEW.email AND parent_id IS NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after profile is created
DROP TRIGGER IF EXISTS on_profile_created_link_students ON public.profiles;
CREATE TRIGGER on_profile_created_link_students
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.link_student_to_parent();

-- Create a function to auto-assign fees to student on the 29th of each month
-- This will be called when a new student is added
CREATE OR REPLACE FUNCTION public.assign_monthly_fees_to_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  fee RECORD;
  next_due_date DATE;
  current_day INTEGER;
BEGIN
  -- Calculate next due date (29th of current or next month)
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  IF current_day < 29 THEN
    next_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '28 days';
  ELSE
    next_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '28 days';
  END IF;
  
  -- Assign all active fee structures from the student's school
  FOR fee IN 
    SELECT id, amount 
    FROM public.fee_structures 
    WHERE school_id = NEW.school_id AND is_active = true
  LOOP
    INSERT INTO public.student_fees (student_id, fee_structure_id, amount, due_date)
    VALUES (NEW.id, fee.id, fee.amount, next_due_date);
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign fees when student is added
DROP TRIGGER IF EXISTS on_student_created_assign_fees ON public.students;
CREATE TRIGGER on_student_created_assign_fees
  AFTER INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.assign_monthly_fees_to_student();