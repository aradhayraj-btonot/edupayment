-- Add status column to student_fees to track payment status
ALTER TABLE public.student_fees 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add check constraint for valid status values
ALTER TABLE public.student_fees 
ADD CONSTRAINT student_fees_status_check CHECK (status IN ('pending', 'paid'));