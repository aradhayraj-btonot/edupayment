-- Create function to assign fee to all students when fee structure is created
CREATE OR REPLACE FUNCTION public.assign_fee_to_all_students()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  student RECORD;
  fee_due_date DATE;
  current_day INTEGER;
BEGIN
  -- Calculate due date based on recurrence type
  IF NEW.recurrence_type = 'monthly' THEN
    -- Monthly fees are due on the 29th
    current_day := EXTRACT(DAY FROM CURRENT_DATE);
    IF current_day < 29 THEN
      fee_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '28 days';
    ELSE
      fee_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '28 days';
    END IF;
  ELSIF NEW.recurrence_type = 'annually' THEN
    -- Annual fees use the specified due_date
    fee_due_date := COALESCE(NEW.due_date, CURRENT_DATE);
  ELSE
    -- One-time/instant fees are due immediately
    fee_due_date := CURRENT_DATE;
  END IF;

  -- Assign fee to all students in this school
  FOR student IN 
    SELECT id, transport_charge 
    FROM public.students 
    WHERE school_id = NEW.school_id
  LOOP
    -- For transport fee type, use student's individual transport_charge
    IF NEW.fee_type = 'transport' THEN
      -- Only create if student has transport charge > 0
      IF student.transport_charge > 0 THEN
        INSERT INTO public.student_fees (student_id, fee_structure_id, amount, due_date)
        VALUES (student.id, NEW.id, student.transport_charge, fee_due_date);
      END IF;
    ELSE
      -- For other fee types, use the fee structure amount
      INSERT INTO public.student_fees (student_id, fee_structure_id, amount, due_date)
      VALUES (student.id, NEW.id, NEW.amount, fee_due_date);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign fees when fee structure is created
DROP TRIGGER IF EXISTS trg_assign_fee_to_students ON public.fee_structures;
CREATE TRIGGER trg_assign_fee_to_students
AFTER INSERT ON public.fee_structures
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION public.assign_fee_to_all_students();