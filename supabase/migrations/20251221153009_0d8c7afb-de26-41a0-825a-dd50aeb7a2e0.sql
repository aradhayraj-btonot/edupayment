-- Add recurrence_type to fee_structures
ALTER TABLE public.fee_structures 
ADD COLUMN IF NOT EXISTS recurrence_type text NOT NULL DEFAULT 'monthly' 
CHECK (recurrence_type IN ('monthly', 'annually', 'one_time'));

-- Add transport_charge to students (variable per student, charged monthly)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS transport_charge numeric DEFAULT 0;

-- Update existing fee_structures based on fee_type
UPDATE public.fee_structures 
SET recurrence_type = CASE 
  WHEN fee_type IN ('tuition', 'transport') THEN 'monthly'
  WHEN fee_type = 'other' THEN 'one_time'
  ELSE 'monthly'
END;

-- Add comment explaining the recurrence types
COMMENT ON COLUMN public.fee_structures.recurrence_type IS 'monthly = charged every 29th, annually = charged on due_date once per year, one_time = charged once when assigned';