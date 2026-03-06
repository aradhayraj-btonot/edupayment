
-- Add target_class column to fee_structures for per-class fees
ALTER TABLE public.fee_structures ADD COLUMN target_class text DEFAULT NULL;

-- Update the assign_fee_to_all_students trigger function to filter by target_class
CREATE OR REPLACE FUNCTION public.assign_fee_to_all_students()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  student RECORD;
  fee_due_date DATE;
  current_day INTEGER;
BEGIN
  -- Calculate due date based on recurrence type
  IF NEW.recurrence_type = 'monthly' THEN
    current_day := EXTRACT(DAY FROM CURRENT_DATE);
    IF current_day < 29 THEN
      fee_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '28 days';
    ELSE
      fee_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '28 days';
    END IF;
  ELSIF NEW.recurrence_type = 'annually' THEN
    fee_due_date := COALESCE(NEW.due_date, CURRENT_DATE);
  ELSE
    fee_due_date := CURRENT_DATE;
  END IF;

  -- Assign fee to students in this school, filtered by target_class if set
  FOR student IN 
    SELECT id, transport_charge, class
    FROM public.students 
    WHERE school_id = NEW.school_id
      AND (NEW.target_class IS NULL OR class = NEW.target_class)
  LOOP
    IF NEW.fee_type = 'transport' THEN
      IF student.transport_charge > 0 THEN
        INSERT INTO public.student_fees (student_id, fee_structure_id, amount, due_date)
        VALUES (student.id, NEW.id, student.transport_charge, fee_due_date);
      END IF;
    ELSE
      INSERT INTO public.student_fees (student_id, fee_structure_id, amount, due_date)
      VALUES (student.id, NEW.id, NEW.amount, fee_due_date);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Also update assign_monthly_fees_to_student to respect target_class
CREATE OR REPLACE FUNCTION public.assign_monthly_fees_to_student()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  fee RECORD;
  next_due_date DATE;
  current_day INTEGER;
BEGIN
  current_day := EXTRACT(DAY FROM CURRENT_DATE);
  IF current_day < 29 THEN
    next_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '28 days';
  ELSE
    next_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '28 days';
  END IF;
  
  FOR fee IN 
    SELECT id, amount 
    FROM public.fee_structures 
    WHERE school_id = NEW.school_id 
      AND is_active = true
      AND (target_class IS NULL OR target_class = NEW.class)
  LOOP
    INSERT INTO public.student_fees (student_id, fee_structure_id, amount, due_date)
    VALUES (NEW.id, fee.id, fee.amount, next_due_date);
  END LOOP;
  
  RETURN NEW;
END;
$function$;
