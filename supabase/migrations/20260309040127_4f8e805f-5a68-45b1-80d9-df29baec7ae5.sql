
-- Create trigger function to auto-apply 100% discount on recurring fees for special students
CREATE OR REPLACE FUNCTION public.apply_special_student_discount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_special boolean;
  v_recurrence_type text;
BEGIN
  -- Check if student is special
  SELECT is_special INTO v_is_special
  FROM public.students
  WHERE id = NEW.student_id;

  -- Only apply discount if student is special
  IF v_is_special THEN
    -- Get recurrence type of the fee structure
    SELECT recurrence_type INTO v_recurrence_type
    FROM public.fee_structures
    WHERE id = NEW.fee_structure_id;

    -- Apply 100% discount only to recurring fees (monthly / annually)
    IF v_recurrence_type IN ('monthly', 'annually') THEN
      NEW.discount := NEW.amount;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach as BEFORE INSERT trigger on student_fees
CREATE TRIGGER apply_special_student_discount_trigger
BEFORE INSERT ON public.student_fees
FOR EACH ROW
EXECUTE FUNCTION public.apply_special_student_discount();
